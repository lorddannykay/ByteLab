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
    const sampleText = allChunks.slice(0, 30).map(c => c.text).join('\n\n').substring(0, 7000);

    const prompt = `Based on the following content, create a mind map structure in JSON format. The mind map should have:
- A central topic (main theme)
- Major branches (main categories, 3-5 branches)
- Sub-branches (subtopics under each category, 2-4 per branch)
- Key terms or concepts for each node

Content:
${sampleText}

Return ONLY valid JSON in this format:
{
  "centralTopic": "Main Topic",
  "branches": [
    {
      "label": "Branch 1",
      "subBranches": [
        {"label": "Sub-branch 1.1", "concepts": ["concept1", "concept2"]},
        {"label": "Sub-branch 1.2", "concepts": ["concept3"]}
      ]
    }
  ]
}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at creating mind maps. Always respond with valid JSON only, no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.6,
      maxTokens: 2000,
    });

    let mindMap;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mindMap = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      mindMap = {
        centralTopic: 'Main Topic',
        branches: [
          {
            label: 'Category 1',
            subBranches: [{ label: 'Sub-topic', concepts: ['concept1'] }],
          },
        ],
      };
    }

    return NextResponse.json({
      type: 'mindmap',
      mindMap,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Mind map generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate mind map',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
