import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { stageContent, stageTitle, stageObjective }: {
      stageContent: any;
      stageTitle: string;
      stageObjective: string;
    } = await request.json();

    if (!stageContent && !stageTitle) {
      return NextResponse.json(
        { error: 'Stage content or title is required' },
        { status: 400 }
      );
    }

    const provider: AIProvider = 'together';
    const aiProvider = providerManager.getProvider(provider);
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Build content summary for quiz generation
    let contentSummary = '';
    if (stageContent) {
      if (stageContent.introduction) {
        contentSummary += `Introduction: ${stageContent.introduction}\n\n`;
      }
      if (stageContent.sections) {
        contentSummary += 'Sections:\n';
        stageContent.sections.forEach((section: any, index: number) => {
          contentSummary += `${index + 1}. ${section.heading}: ${section.content}\n`;
        });
      }
      if (stageContent.summary) {
        contentSummary += `\nSummary: ${stageContent.summary}`;
      }
    }

    const prompt = `Generate a quiz question for a microlearning course stage.

Stage Title: ${stageTitle}
Stage Objective: ${stageObjective}
${contentSummary ? `\nStage Content:\n${contentSummary}` : ''}

Create a single quiz question that:
1. Tests understanding of the key concepts from this stage
2. Has 4 multiple-choice options
3. Each option is a complete, meaningful answer (not just letters like "A", "B", "C")
4. Includes a clear explanation for the correct answer
5. Is appropriate for microlearning (not too complex)

Respond with ONLY valid JSON in this format:
{
  "question": "The quiz question text",
  "options": ["Option 1 (full answer)", "Option 2 (full answer)", "Option 3 (full answer)", "Option 4 (full answer)"],
  "correctAnswer": "The exact text of the correct option",
  "explanation": "Explanation of why this is correct"
}`;

    // Generate with fallback models
    let result;
    let lastError;

    if (provider === 'together') {
      const modelsToTry = [
        'meta-llama/Llama-3.2-3B-Instruct-Turbo',
        'openai/gpt-oss-20b',
        MODELS.CHAT_FREE,
        MODELS.CHAT,
      ];

      for (const model of modelsToTry) {
        try {
          result = await aiProvider.generateJSON<{
            question: string;
            options: string[];
            correctAnswer: string;
            explanation: string;
          }>([
            {
              role: 'system',
              content: 'You are an expert instructional designer creating quiz questions. You MUST respond with ONLY valid JSON. No text before or after.',
            },
            {
              role: 'user',
              content: prompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after. Just the JSON object.',
            },
          ], {
            model,
            temperature: 0.3,
            maxTokens: 1000,
            retries: 1,
          });
          break;
        } catch (error) {
          lastError = error;
          console.log(`Model ${model} failed for quiz, trying next...`);
        }
      }

      if (!result) {
        throw lastError || new Error('All models failed');
      }
    } else {
      result = await aiProvider.generateJSON<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
      }>([
        {
          role: 'system',
          content: 'You are an expert instructional designer creating quiz questions. You MUST respond with ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ], {
        temperature: 0.3,
        maxTokens: 1000,
        retries: 2,
      });
    }

    // Validate quiz structure
    if (!result.question || !result.options || result.options.length < 3 || !result.correctAnswer) {
      throw new Error('Invalid quiz structure generated');
    }

    return NextResponse.json({
      quiz: result,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate quiz',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

