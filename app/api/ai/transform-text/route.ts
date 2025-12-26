import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { text, action, context }: {
      text: string;
      action: 'rewrite' | 'expand' | 'simplify' | 'summarize' | 'clarity' | 'modify-tone' | 'generate-section';
      context?: any;
    } = await request.json();

    if (!text && action !== 'generate-section') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!['rewrite', 'expand', 'simplify', 'summarize', 'clarity', 'modify-tone', 'generate-section'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
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

    // Build prompt based on action
    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'rewrite':
        systemPrompt = 'You are a professional content editor. Rewrite the given text to improve clarity, flow, and engagement while maintaining the original meaning and tone.';
        userPrompt = `Rewrite the following text:\n\n${text}`;
        break;
      case 'clarity':
        systemPrompt = 'You are a professional content editor. Improve the clarity and conciseness of the given text. Remove jargon, simplify complex sentences, and ensure the main message is clear.';
        userPrompt = `Improve the clarity of the following text:\n\n${text}`;
        break;
      case 'modify-tone':
        systemPrompt = 'You are a professional content editor. Modify the tone of the given text to be more professional, engaging, and educational. Ensure it sounds encouraging and clear.';
        userPrompt = `Modify the tone of the following text to be more professional and engaging:\n\n${text}`;
        break;
      case 'expand':
        systemPrompt = 'You are a content writer. Expand the given text by adding more detail, examples, and explanations while keeping it relevant and engaging.';
        userPrompt = `Expand the following text with more detail and examples:\n\n${text}`;
        break;
      case 'simplify':
        systemPrompt = 'You are an educational content writer. Simplify the given text to make it easier to understand for learners, using simpler language and shorter sentences.';
        userPrompt = `Simplify the following text for better understanding:\n\n${text}`;
        break;
      case 'summarize':
        systemPrompt = 'You are a content summarizer. Create a concise summary of the given text, capturing the key points and main ideas.';
        userPrompt = `Summarize the following text:\n\n${text}`;
        break;
      case 'generate-section':
        systemPrompt = 'You are an expert course creator. Generate a new educational content section based on the course topic and stage objectives. Return the content in a structured format with heading and main content.';
        userPrompt = `Generate a new content section for this course.`;
        break;
    }

    // Add context if available
    if (context) {
      if (context.courseTitle) {
        userPrompt += `\n\nContext: This is from a course titled "${context.courseTitle}".`;
      }
      if (context.stageTitle) {
        userPrompt += ` This text is from the stage "${context.stageTitle}".`;
      }
    }

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
          result = await aiProvider.chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ], {
            model,
            temperature: 0.7,
            maxTokens: 2000,
          });
          break;
        } catch (error) {
          lastError = error;
          console.log(`Model ${model} failed, trying next...`);
        }
      }

      if (!result) {
        throw lastError || new Error('All models failed');
      }
    } else {
      result = await aiProvider.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.7,
        maxTokens: 2000,
      });
    }

    return NextResponse.json({
      result: result.content,
      action,
    });
  } catch (error) {
    console.error('Text transformation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to transform text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

