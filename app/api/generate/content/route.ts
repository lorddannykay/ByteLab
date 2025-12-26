import { NextRequest, NextResponse } from 'next/server';
import { buildContentPrompt, buildContentPrompts } from '@/lib/prompts/contentPrompt';
import { validateContentQuality, ContentQualityScore } from '@/lib/prompts/advancedPromptEngineering';
import { buildRevisionPrompt } from '@/lib/prompts/revisionPrompt';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { CourseConfig } from '@/types/course';
import { providerManager } from '@/lib/ai/providers';
import { validateJSONCompleteness, retryWithBackoff } from '@/lib/ai/qualityGuardrails';
import { AIProvider } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';
import { validateContent } from '@/lib/validation/contentValidator';
import { fetchImageForContent } from '@/lib/media/imageFetcher';
import { traceContentGeneration } from '@/lib/observability/langfuseClient';

export async function POST(request: NextRequest) {
  try {
    const {
      config,
      stage,
      provider = 'together',
    }: {
      config: CourseConfig;
      stage: { id: number; title: string; objective: string; keyPoints: string[] };
      provider?: AIProvider;
    } = await request.json();

    // Get AI provider
    const aiProvider = providerManager.getProvider(provider);
    if (!aiProvider) {
      return NextResponse.json(
        { error: `Provider ${provider} is not available. Available: ${providerManager.getAvailableProviders().join(', ')}` },
        { status: 400 }
      );
    }

    // Retrieve relevant context
    let contextText = '';
    if (globalVectorStore.size() > 0) {
      const query = `${stage.title} ${stage.objective} ${stage.keyPoints.join(' ')}`;
      const results = await retrieveContext(query, globalVectorStore, 3, true);
      contextText = formatContextForPrompt(results, 1500);
    }

    // Build separated system and user prompts for better control
    const { systemPrompt, userPrompt } = buildContentPrompts(config, stage, contextText, undefined, true);

    // Generate content with retry and validation
    const content = await retryWithBackoff(async () => {
      let result;
      let lastError;
      
      if (provider === 'together') {
        const modelsToTry = [
          'meta-llama/Llama-3.2-3B-Instruct-Turbo', // Primary model
          'openai/gpt-oss-20b', // Fallback model
          MODELS.CHAT, // Qwen/Qwen3-Next-80B-A3b-Instruct
          'meta-llama/Llama-3.1-70B-Instruct-Turbo',
        ];
        
        for (const model of modelsToTry) {
          try {
            result = await aiProvider.generateJSON<{
              introduction: string;
              sections: any[];
              summary: string;
              interactiveElements: any[];
              sideCard: any;
            }>(
              [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                {
                  role: 'user',
                  content: userPrompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after. Just the JSON object.',
                },
              ],
              {
                model,
                temperature: 0.3,
                maxTokens: 8000,
                retries: 1,
              }
            );
            console.log(`Content generation succeeded with model: ${model}`);
            break;
          } catch (error) {
            lastError = error;
            console.log(`Model ${model} failed for content, trying next...`);
          }
        }
        
        if (!result) {
          throw lastError || new Error('All models failed for content generation');
        }
      } else {
        result = await aiProvider.generateJSON<{
          introduction: string;
          sections: any[];
          summary: string;
          interactiveElements: any[];
          sideCard: any;
        }>(
          [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after. Just the JSON object.',
            },
          ],
          {
            temperature: 0.3,
            maxTokens: 8000,
            retries: 2,
          }
        );
      }

      // Validate completeness
      const validation = validateJSONCompleteness(result, ['introduction', 'sections', 'summary'], [
        { field: 'sections', required: ['heading', 'content'] },
      ]);

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Enhanced content quality validation
      const errors: string[] = [];

      // Topic relevance validation - ensure content is about the actual course topic
      const topicLower = config.topic.toLowerCase();
      const stageTitleLower = stage.title.toLowerCase();
      const forbiddenTopics = ['attention residue', 'sophie', 'maya', 'productivity', 'email', 'slack', 'focus'];
      const contentText = JSON.stringify(result).toLowerCase();
      
      // Check for forbidden generic topics that shouldn't appear
      const hasForbiddenTopic = forbiddenTopics.some(topic => contentText.includes(topic));
      const hasCourseTopic = contentText.includes(topicLower) || contentText.includes(stageTitleLower);
      
      if (hasForbiddenTopic && !hasCourseTopic) {
        errors.push(`Content contains generic examples ("attention residue", "Sophie", etc.) but does not mention the course topic "${config.topic}". Content must be relevant to "${config.topic}".`);
      }
      
      // Only require topic mention if topic is specific (not generic like "General" or "Course")
      if (!hasCourseTopic && topicLower.length > 3 && !['general', 'course', 'untitled'].includes(topicLower)) {
        // Check if content is at least somewhat related by checking for related terms
        const relatedTerms = config.topic.split(/\s+/).filter(term => term.length > 3);
        const hasRelatedTerm = relatedTerms.some(term => contentText.includes(term.toLowerCase()));
        
        if (!hasRelatedTerm) {
          errors.push(`Content does not mention the course topic "${config.topic}". All content must be relevant to "${config.topic}".`);
        }
      }

      // Introduction validation
      if (!result.introduction || result.introduction.length < 100) {
        errors.push(`Introduction must be at least 100 characters (got ${result.introduction?.length || 0})`);
      }

      // Sections validation
      if (!result.sections || result.sections.length < 2) {
        errors.push(`Must have at least 2 sections (got ${result.sections?.length || 0})`);
      } else {
        // Validate each section has meaningful content
        result.sections.forEach((section: any, index: number) => {
          if (!section.heading || section.heading.length < 5) {
            errors.push(`Section ${index + 1} heading is too short or missing`);
          }
          if (!section.content || section.content.length < 50) {
            errors.push(`Section ${index + 1} content is too short (minimum 50 characters)`);
          }
        });
      }

      // Quiz validation
      if (result.interactiveElements && result.interactiveElements.length > 0) {
        result.interactiveElements.forEach((element: any, index: number) => {
          if (element.type === 'quiz' && element.data) {
            const quiz = element.data;
            if (!quiz.question || quiz.question.length < 10) {
              errors.push(`Quiz ${index + 1} question is too short or missing`);
            }
            if (!quiz.options || !Array.isArray(quiz.options) || quiz.options.length < 3) {
              errors.push(`Quiz ${index + 1} must have at least 3 options (got ${quiz.options?.length || 0})`);
            } else {
              // Validate each option is meaningful (not just letters)
              quiz.options.forEach((option: string, optIndex: number) => {
                const trimmedOption = option?.trim() || '';
                // Check if option is just a single letter (A, B, C, D)
                if (trimmedOption.length === 1 && /^[A-Z]$/.test(trimmedOption)) {
                  errors.push(`Quiz ${index + 1} option ${optIndex + 1} is just a letter "${option}" - must be a meaningful answer`);
                } else if (!trimmedOption || trimmedOption.length < 5) {
                  // Reduced minimum from 10 to 5 characters for more flexibility
                  errors.push(`Quiz ${index + 1} option ${optIndex + 1} is too short (minimum 5 characters, got ${trimmedOption.length})`);
                }
              });
            }
            if (!quiz.correctAnswer) {
              errors.push(`Quiz ${index + 1} missing correctAnswer`);
            }
          }
        });
      }

      if (errors.length > 0) {
        throw new Error(`Content quality validation failed: ${errors.join('; ')}`);
      }

      return result;
    }, 3, 1000);

    // Quality scoring and revision loop
    let qualityScore: ContentQualityScore | null = null;
    let revisedContent = content;
    const maxRevisions = 2;
    let revisionAttempt = 0;

    // Score the generated content
    qualityScore = validateContentQuality(content, config, stage, contextText);

    // If quality is below threshold, attempt revision
    if (qualityScore.score < 80 && revisionAttempt < maxRevisions) {
      console.log(`Content quality score: ${qualityScore.score}/100. Attempting revision...`);
      
      try {
        const revisionPrompt = buildRevisionPrompt(revisedContent, qualityScore, config, stage);
        
        // Attempt revision with retry
        revisedContent = await retryWithBackoff(async () => {
          let result;
          
          if (provider === 'together') {
            const modelsToTry = [
              'meta-llama/Llama-3.2-3B-Instruct-Turbo',
              'openai/gpt-oss-20b',
              MODELS.CHAT,
            ];
            
            for (const model of modelsToTry) {
              try {
                result = await aiProvider.generateJSON<typeof content>(
                  [
                    {
                      role: 'system',
                      content: systemPrompt,
                    },
                    {
                      role: 'user',
                      content: revisionPrompt,
                    },
                  ],
                  {
                    model,
                    temperature: 0.2, // Lower temperature for revisions
                    maxTokens: 8000,
                    retries: 1,
                  }
                );
                break;
              } catch (error) {
                console.warn(`Revision failed with model ${model}:`, error);
                continue;
              }
            }
          } else {
            result = await aiProvider.generateJSON<typeof content>(
              [
                {
                  role: 'system',
                  content: systemPrompt,
                },
                {
                  role: 'user',
                  content: revisionPrompt,
                },
              ],
              {
                temperature: 0.2,
                maxTokens: 8000,
                retries: 1,
              }
            );
          }

          if (!result) {
            throw new Error('Revision generation returned empty result');
          }

          // Re-score revised content
          const revisedScore = validateContentQuality(result, config, stage, contextText);
          console.log(`Revised content quality score: ${revisedScore.score}/100`);
          
          // If revision improved quality, use it
          if (revisedScore.score > qualityScore.score) {
            qualityScore = revisedScore;
            return result;
          }
          
          // If revision didn't improve, return original
          return revisedContent;
        }, 2, 1000);
        
        revisionAttempt++;
      } catch (error) {
        console.error('Revision failed, using original content:', error);
        // Continue with original content if revision fails
      }
    }

    // Content validation (if enabled)
    let validationResult = null;
    const enableValidation = config.enableContentValidation !== false; // Default to true
    if (enableValidation) {
      try {
        validationResult = await validateContent(
          {
            introduction: content.introduction,
            sections: content.sections,
            summary: content.summary,
          },
          config.topic,
          enableValidation
        );

        // Log validation issues but don't fail generation
        if (!validationResult.isValid && validationResult.issues.length > 0) {
          console.warn('Content validation found issues:', validationResult.issues);
        }
      } catch (error) {
        console.error('Content validation error (non-blocking):', error);
        // Continue without validation if it fails
      }
    }

    // Image fetching (if enabled)
    const enableAutoImages = config.enableAutoImages !== false; // Default to true
    const imageProvider = config.imageProvider || 'both';
    
    if (enableAutoImages && content.sections) {
      try {
        // Fetch images sequentially with delays to avoid rate limits
        const imageResults: Array<{ heading: string; image: any } | null> = [];
        
        for (const section of content.sections) {
          try {
            // Add delay between image fetches to respect API rate limits
            if (imageResults.length > 0) {
              await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
            }
            
            const image = await fetchImageForContent(
              section.content,
              section.heading,
              imageProvider
            );
            
            if (image) {
              imageResults.push({
                heading: section.heading,
                image: {
                  url: image.url,
                  thumbnailUrl: image.thumbnailUrl,
                  attribution: image.attribution,
                  photographer: image.photographer,
                  photographerUrl: image.photographerUrl,
                  width: image.width,
                  height: image.height,
                  provider: image.provider,
                },
              });
            } else {
              imageResults.push(null);
            }
          } catch (error) {
            console.error(`Error fetching image for section "${section.heading}":`, error);
            imageResults.push(null);
          }
        }
        
        // Add images to sections
        imageResults.forEach((result) => {
          if (result) {
            const section = content.sections.find((s: any) => s.heading === result.heading);
            if (section && result.image) {
              section.image = result.image;
            }
          }
        });
      } catch (error) {
        console.error('Image fetching error (non-blocking):', error);
        // Continue without images if fetching fails
      }
    }

    // Trace final content generation with quality score
    await traceContentGeneration(
      'content-generation-final',
      config,
      stage,
      systemPrompt,
      userPrompt,
      revisedContent,
      qualityScore || undefined,
      { provider, model: 'unknown', revised: revisionAttempt > 0, revisionAttempt }
    ).catch(err => console.error('Langfuse tracing error (non-blocking):', err));

    // Return content with validation, quality score, and images
    return NextResponse.json({
      ...revisedContent,
      validated: validationResult?.isValid ?? true,
      validationResult: validationResult,
      qualityScore: qualityScore,
      revised: revisionAttempt > 0,
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

