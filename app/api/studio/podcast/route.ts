import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { courseId, state } = await request.json();

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

    const prompt = `Based on the following content, create a podcast script for a microlearning course. The podcast should:
1. Have 2-3 speakers (host and expert)
2. Be conversational and engaging
3. Cover key concepts in 10-15 minutes
4. Include dialogue segments with natural transitions

Content:
${sampleText}

Return ONLY valid JSON in this format:
{
  "title": "Podcast Title",
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "Episode Title",
      "segments": [
        {
          "speaker": "Host",
          "content": "Welcome to..."
        },
        {
          "speaker": "Expert",
          "content": "Thank you for having me..."
        }
      ]
    }
  ]
}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert podcast script writer. Always respond with valid JSON only, no additional text.',
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

    let podcastScript;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        podcastScript = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      podcastScript = {
        title: 'Course Podcast',
        episodes: [
          {
            episodeNumber: 1,
            title: 'Introduction',
            segments: [
              { speaker: 'Host', content: 'Welcome to the course podcast' },
              { speaker: 'Expert', content: 'Thank you for having me' },
            ],
          },
        ],
      };
    }

    return NextResponse.json({
      type: 'podcast',
      script: podcastScript,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Podcast generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate podcast',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
