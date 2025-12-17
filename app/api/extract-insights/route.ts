import { NextRequest, NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider } from '@/lib/ai/providers/types';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, provider = 'together' }: { chatHistory: string; provider?: AIProvider } = await request.json();

    const aiProvider = providerManager.getProvider(provider);
    if (!aiProvider) {
      // Return null if provider not available - will use pattern matching fallback
      return NextResponse.json({ insights: null });
    }

    const prompt = `Extract course configuration insights from this conversation. Return ONLY a JSON object with these fields if mentioned:
- suggestedTitle: string (course title)
- suggestedTopic: string (main topic)
- suggestedDescription: string (brief description)
- suggestedObjectives: string[] (learning objectives as array)
- suggestedTargetAudience: string (target audience)
- suggestedStageCount: number (number of stages)
- suggestedContentStyle: "formal" | "conversational" | "technical"

Conversation:
${chatHistory}

Return ONLY the JSON object, no other text.`;

    const response = await aiProvider.chatCompletion([
      {
        role: 'system',
        content: 'You are a data extraction assistant. Extract structured information from conversations and return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      temperature: 0.3,
      maxTokens: 1000,
      responseFormat: 'json_object',
    });

    try {
      const insights = JSON.parse(response.content);
      return NextResponse.json({ insights });
    } catch (error) {
      // If parsing fails, return null to use fallback
      return NextResponse.json({ insights: null });
    }
  } catch (error) {
    console.error('Error extracting insights:', error);
    return NextResponse.json({ insights: null });
  }
}

