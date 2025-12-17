import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { CourseConfig } from '@/types/course';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, uploadedFiles } = await request.json();

    if (!chatHistory || chatHistory.length === 0) {
      return NextResponse.json(
        { error: 'No chat history provided' },
        { status: 400 }
      );
    }

    const aiProvider = providerManager.getProvider('together');
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Build conversation context
    const conversationText = chatHistory
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const fileNames = uploadedFiles?.map((f: any) => f.name).join(', ') || 'uploaded files';

    const extractionPrompt = `You are an expert instructional designer. Analyze the following conversation about creating a microlearning course and extract the course configuration.

Conversation:
${conversationText}

Uploaded files: ${fileNames}

Extract the following information and return ONLY valid JSON:
{
  "title": "Course title (or null if not mentioned)",
  "topic": "Main topic/subject (or null if not mentioned)",
  "description": "Course description (or null if not mentioned)",
  "objectives": ["objective 1", "objective 2"] (array, or empty array if not mentioned),
  "targetAudience": "Target audience (or null if not mentioned)",
  "contentStyle": "formal" | "conversational" | "technical" (or "conversational" as default),
  "stageCount": number (suggested number of stages, default 5),
  "estimatedDuration": "Estimated duration string (or null if not mentioned)",
  "confidence": {
    "title": 0.0-1.0,
    "topic": 0.0-1.0,
    "description": 0.0-1.0,
    "objectives": 0.0-1.0,
    "targetAudience": 0.0-1.0,
    "contentStyle": 0.0-1.0,
    "stageCount": 0.0-1.0
  }
}

IMPORTANT - Confidence Scoring Guidelines:
- 1.0 (High): Information is explicitly stated with clear keywords:
  * Title: User says "title is X", "call it X", "named X", or file names clearly indicate title
  * Topic: User says "topic is X", "about X", "subject is X", or clear topic mentions
  * StageCount: User says "7 stages", "6-8 stages", "X stages", or explicit number
  * Objectives: User lists objectives with "objectives:", "learn:", "students will", numbered lists
  * Audience: User says "for X", "target audience is X", "designed for X"
  * Style: User says "conversational", "formal", "technical", "casual", "professional"
  
- 0.7-0.9 (Medium-High): Strongly implied from context:
  * Title: Can be inferred from topic + "Introduction to" or "Guide to" patterns
  * Topic: Clear from conversation focus or file content
  * StageCount: Mentioned as range (e.g., "6-8") or implied from structure
  * Objectives: Can be inferred from learning goals discussion
  * Audience: Clear from context (e.g., "for developers", "beginners")
  
- 0.4-0.6 (Medium): Moderately inferred:
  * Information can be reasonably inferred but not explicit
  * Some ambiguity exists
  
- 0.0-0.3 (Low): Not found or very weak inference:
  * No mention and cannot be reasonably inferred
  * Use default values with low confidence

Pattern Matching Examples:
- Stage count: Look for "X stages", "X modules", "X lessons", "X parts", numbers followed by stage-related words
- Title: Look for "title:", "called", "named", quotation marks around titles, or file-based inference
- Objectives: Look for bullet points, numbered lists, "students will", "learn to", "understand"
- Audience: Look for "for X", "targeting X", "designed for", "X users", "X learners"

Be intelligent about inference:
- If title not mentioned, infer from topic or file names (confidence 0.6-0.8)
- If objectives not mentioned, infer from conversation about learning goals (confidence 0.5-0.7)
- If audience not mentioned, infer from context (confidence 0.5-0.7)
- If stageCount not mentioned, default to 5 with confidence 0.3

Return ONLY the JSON object, no additional text.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at extracting structured information from conversations. Always respond with ONLY valid JSON, no additional text.',
      },
      {
        role: 'user',
        content: extractionPrompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Parse JSON response
    let extractedData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse extracted config:', parseError);
      // Return default config
      extractedData = {
        title: null,
        topic: 'General',
        description: null,
        objectives: [],
        targetAudience: null,
        contentStyle: 'conversational',
        stageCount: 5,
        estimatedDuration: null,
        confidence: {
          title: 0,
          topic: 0.3,
          description: 0,
          objectives: 0,
          targetAudience: 0,
          contentStyle: 0.5,
          stageCount: 0.3,
        },
      };
    }

    // Post-process to improve confidence scores based on pattern matching
    const conversationLower = conversationText.toLowerCase();
    
    // Pattern matching for stage count
    const stageCountPatterns = [
      /(\d+)\s*(?:stages?|modules?|lessons?|parts?|sections?)/gi,
      /(?:stages?|modules?|lessons?|parts?)\s*(?:of|:)?\s*(\d+)/gi,
      /(\d+)\s*-\s*(\d+)\s*(?:stages?|modules?)/gi, // Range like "6-8 stages"
    ];
    
    let extractedStageCount = extractedData.stageCount;
    let stageCountConfidence = extractedData.confidence?.stageCount || 0.3;
    
    for (const pattern of stageCountPatterns) {
      const matches = conversationLower.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const num = parseInt(match[1]);
          if (num >= 3 && num <= 20) {
            extractedStageCount = num;
            stageCountConfidence = 1.0; // Explicitly stated
            break;
          }
        }
        // Handle ranges
        if (match[2]) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          if (num1 >= 3 && num2 <= 20 && num1 < num2) {
            extractedStageCount = Math.round((num1 + num2) / 2);
            stageCountConfidence = 0.9; // Range specified
            break;
          }
        }
      }
      if (stageCountConfidence >= 0.9) break;
    }
    
    // Pattern matching for title
    const titlePatterns = [
      /(?:title|named|called|titled)\s*(?:is|:)?\s*["']([^"']+)["']/gi,
      /(?:title|named|called|titled)\s*(?:is|:)?\s*([A-Z][^.!?]+?)(?:\s|$|\.|,)/g,
    ];
    
    let extractedTitle = extractedData.title;
    let titleConfidence = extractedData.confidence?.title || 0;
    
    for (const pattern of titlePatterns) {
      const matches = conversationLower.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 3 && match[1].length < 100) {
          extractedTitle = match[1].trim();
          titleConfidence = 1.0; // Explicitly stated
          break;
        }
      }
      if (titleConfidence >= 0.9) break;
    }
    
    // Update extracted data with pattern-matched values
    if (extractedStageCount !== extractedData.stageCount) {
      extractedData.stageCount = extractedStageCount;
      extractedData.confidence = extractedData.confidence || {};
      extractedData.confidence.stageCount = stageCountConfidence;
    }
    
    if (extractedTitle && extractedTitle !== extractedData.title) {
      extractedData.title = extractedTitle;
      extractedData.confidence = extractedData.confidence || {};
      extractedData.confidence.title = titleConfidence;
    }
    
    // Ensure confidence object exists and has all fields
    extractedData.confidence = {
      title: extractedData.confidence?.title ?? (extractedData.title ? 0.6 : 0),
      topic: extractedData.confidence?.topic ?? (extractedData.topic && extractedData.topic !== 'General' ? 0.7 : 0.3),
      description: extractedData.confidence?.description ?? (extractedData.description ? 0.6 : 0),
      objectives: extractedData.confidence?.objectives ?? (extractedData.objectives && extractedData.objectives.length > 0 ? 0.7 : 0),
      targetAudience: extractedData.confidence?.targetAudience ?? (extractedData.targetAudience && extractedData.targetAudience !== 'General audience' ? 0.7 : 0),
      contentStyle: extractedData.confidence?.contentStyle ?? 0.5,
      stageCount: extractedData.confidence?.stageCount ?? 0.3,
    };

    // Build CourseConfig with defaults
    const config: Partial<CourseConfig> = {
      title: extractedData.title || 'Untitled Course',
      topic: extractedData.topic || 'General',
      description: extractedData.description || 'A microlearning course',
      objectives: extractedData.objectives && extractedData.objectives.length > 0 
        ? extractedData.objectives 
        : ['Learn key concepts'],
      targetAudience: extractedData.targetAudience || 'General audience',
      organizationalGoals: '',
      contentStyle: extractedData.contentStyle || 'conversational',
      stageCount: extractedData.stageCount || 5,
      estimatedDuration: extractedData.estimatedDuration || '15-20 minutes',
      accentColor1: '#4a90e2',
      accentColor2: '#50c9c3',
      voiceId: '',
      includeVideo: false,
      includePodcast: false,
    };

    return NextResponse.json({
      config,
      confidence: extractedData.confidence || {},
      extractedFields: Object.keys(extractedData).filter(k => k !== 'confidence'),
    });
  } catch (error) {
    console.error('Config extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide specific error messages
    let userFriendlyError = 'Failed to extract course configuration';
    if (errorMessage.includes('AI provider not available')) {
      userFriendlyError = 'AI service is temporarily unavailable. Please try again in a moment.';
    } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
      userFriendlyError = 'Failed to parse configuration. Please try providing more structured information about your course.';
    }
    
    return NextResponse.json(
      {
        error: userFriendlyError,
        details: errorMessage,
        retryable: !errorMessage.includes('AI provider not available'),
      },
      { status: 500 }
    );
  }
}
