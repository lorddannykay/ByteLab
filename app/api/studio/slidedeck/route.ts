import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { labId, state } = await request.json();

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

    const prompt = `Based on the following content, create a slide deck with 8-12 slides. Each slide should have:
- slideNumber: Sequential number
- title: Slide title
- content: Main points (bullet points)
- notes: Speaker notes (optional)

Content:
${sampleText}

Return ONLY valid JSON in this format:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Title Slide",
      "content": ["Point 1", "Point 2"],
      "notes": "Speaker notes here"
    }
  ]
}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert presentation designer. Always respond with valid JSON only, no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.6,
      maxTokens: 3000,
    });

    let slideDeck;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        slideDeck = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      slideDeck = {
        slides: [
          {
            slideNumber: 1,
            title: 'Title Slide',
            content: ['Main point'],
            notes: 'Speaker notes',
          },
        ],
      };
    }

    return NextResponse.json({
      type: 'slidedeck',
      deck: slideDeck,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Slide deck generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate slide deck',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
