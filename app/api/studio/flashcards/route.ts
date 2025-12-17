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

    // Retrieve key concepts
    const allChunks = globalVectorStore.getAllChunks();
    const sampleText = allChunks.slice(0, 25).map(c => c.text).join('\n\n').substring(0, 6000);

    const prompt = `Based on the following content, create flashcards in JSON format. Each flashcard should have:
- front: The question or term
- back: The answer or definition

Generate 15-20 flashcards covering the most important concepts, terms, and facts.

Content:
${sampleText}

Return ONLY valid JSON array in this format:
[
  {"front": "Question 1", "back": "Answer 1"},
  {"front": "Question 2", "back": "Answer 2"}
]`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at creating educational flashcards. Always respond with valid JSON only, no additional text.',
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

    // Parse JSON
    let flashcards;
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found');
      }
    } catch (parseError) {
      // Fallback: create simple flashcards
      flashcards = [
        { front: 'What are the main topics?', back: 'Extract from content' },
      ];
    }

    return NextResponse.json({
      type: 'flashcards',
      cards: flashcards,
      generatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Flashcards generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate flashcards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
