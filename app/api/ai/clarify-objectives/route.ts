import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, uploadedFiles = [] } = await request.json();

    // Get AI provider
    const aiProvider = providerManager.getProvider('together');
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Get context from uploaded files if available
    let contextText = '';
    if (globalVectorStore.size() > 0) {
      // Use a general query to get relevant context
      const results = await retrieveContext('course objectives learning goals', globalVectorStore, 3, false);
      contextText = formatContextForPrompt(results, 1000);
    }

    // Analyze conversation to determine what clarification questions to ask
    const clarificationPrompt = `You are an expert instructional designer helping create a microlearning course.

${contextText ? `Content context from uploaded files:\n${contextText}\n\n` : ''}
${uploadedFiles.length > 0 ? `The user has uploaded: ${uploadedFiles.map((f: any) => f.name).join(', ')}\n\n` : ''}
Based on the conversation history, identify what information is still needed to create an effective course. Generate 3-5 specific, actionable clarification questions that will help define:

1. Learning objectives and goals
2. Target audience characteristics
3. Course duration and format preferences
4. Content style and tone
5. Assessment and interaction needs

${chatHistory && chatHistory.length > 0 ? `Recent conversation:\n${chatHistory.slice(-5).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n')}\n\n` : ''}

Generate questions that are:
- Specific and actionable
- Based on what's already been discussed (don't repeat)
- Focused on missing critical information
- Conversational and helpful

Return ONLY the questions, one per line, formatted as a simple list.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert instructional designer. Generate specific, actionable clarification questions to help create effective microlearning courses.',
      },
      {
        role: 'user',
        content: clarificationPrompt,
      },
    ];

    let response;
    try {
      response = await aiProvider.chatCompletion(messages, {
        model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
        temperature: 0.7,
        maxTokens: 500,
      });
    } catch (error) {
      console.error('Clarification questions generation failed:', error);
      // Fallback questions
      return NextResponse.json({
        questions: [
          'What are the main learning objectives for this course?',
          'Who is your target audience?',
          'How long should each learning module be?',
          'What style of content do you prefer (formal, conversational, technical)?',
        ],
      });
    }

    // Parse questions from response
    const content = String(response.content || response);
    const questions = content
      .split('\n')
      .map((q: string) => q.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter((q: string) => q.length > 10 && q.endsWith('?'))
      .slice(0, 5);

    // Fallback if parsing fails
    if (questions.length === 0) {
      questions.push(
        'What are the main learning objectives for this course?',
        'Who is your target audience?',
        'How long should each learning module be?',
      );
    }

    return NextResponse.json({
      questions,
    });
  } catch (error) {
    console.error('Clarification questions error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate clarification questions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

