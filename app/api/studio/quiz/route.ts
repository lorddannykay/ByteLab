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
    const sampleText = allChunks.slice(0, 25).map(c => c.text).join('\n\n').substring(0, 6000);

    const prompt = `Based on the following content, create a quiz with 10 multiple-choice questions. Each question should have:
- question: The question text
- options: Array of 4 answer options
- correct: The index (0-3) of the correct answer

Content:
${sampleText}

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    }
  ]
}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert at creating educational quizzes. Always respond with valid JSON only, no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await aiProvider.chatCompletion(messages, {
      model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
      temperature: 0.6,
      maxTokens: 2500,
    });

    let quizData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      quizData = {
        questions: [
          {
            question: 'What is the main topic?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 0,
          },
        ],
      };
    }

    return NextResponse.json({
      type: 'quiz',
      quiz: quizData,
      generatedAt: Date.now(),
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
