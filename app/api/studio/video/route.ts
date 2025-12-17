import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { courseId, labId, state } = await request.json();

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

    const prompt = `Based on the following content, create a video script with scenes. Each scene should have:
- sceneNumber: Sequential number
- title: Scene title
- narration: What will be spoken
- visuals: Description of what should be shown
- duration: Estimated duration in seconds

Content:
${sampleText}

Create 5-8 scenes for a 3-5 minute video overview.

Return ONLY valid JSON in this format:
{
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Introduction",
      "narration": "Welcome to...",
      "visuals": "Show title card",
      "duration": 30
    }
  ]
}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert video script writer. Always respond with valid JSON only, no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.7,
      maxTokens: 3000,
    });

    let videoScript;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        videoScript = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      videoScript = {
        scenes: [
          {
            sceneNumber: 1,
            title: 'Introduction',
            narration: 'Welcome to this overview',
            visuals: 'Title card',
            duration: 30,
          },
        ],
      };
    }

    return NextResponse.json({
      type: 'video',
      script: videoScript,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Video overview generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate video overview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
