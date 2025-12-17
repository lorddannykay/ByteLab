import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { labId, state, language = 'English' } = await request.json();

    if (globalVectorStore.size() === 0) {
      return NextResponse.json(
        { error: 'No sources available. Please upload sources first.' },
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

    const allChunks = globalVectorStore.getAllChunks();
    const sampleText = allChunks.slice(0, 30).map(c => c.text).join('\n\n').substring(0, 8000);

    const prompt = `Based on the following content, create an audio overview script that:
1. Provides a 3-5 minute spoken overview (approximately 500-800 words)
2. Introduces the main topics
3. Highlights key concepts
4. Concludes with a summary

Write in a conversational, engaging style suitable for audio narration.

Content:
${sampleText}

Language: ${language}

Create the script as plain text, ready for text-to-speech conversion.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert script writer for educational audio content. Create engaging, conversational scripts.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      type: 'audio',
      script: response.content,
      language,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Audio overview generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate audio overview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
