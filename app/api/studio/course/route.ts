import { NextRequest, NextResponse } from 'next/server';
import { buildOutlinePrompt } from '@/lib/prompts/outlinePrompt';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { CourseConfig } from '@/types/course';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider } from '@/lib/ai/providers/types';
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

    // Use existing course config from state, or create a default one
    const config: CourseConfig = state.courseConfig || {
      title: 'Untitled Course',
      topic: 'General',
      description: 'A microlearning course',
      objectives: ['Learn key concepts'],
      targetAudience: 'General audience',
      organizationalGoals: '',
      contentStyle: 'conversational',
      stageCount: 5,
      estimatedDuration: '15-20 minutes',
      accentColor1: '#4a90e2',
      accentColor2: '#50c9c3',
      voiceId: '',
      includeVideo: false,
      includePodcast: false,
    };

    const aiProvider = providerManager.getProvider('together');
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Retrieve relevant context
    let contextText = '';
    if (globalVectorStore.size() > 0) {
      const query = `${config.title} ${config.topic} ${config.objectives.join(' ')}`;
      const results = await retrieveContext(query, globalVectorStore, 5, true);
      contextText = formatContextForPrompt(results, 2000);
    }

    // Build prompt
    const prompt = buildOutlinePrompt(config, contextText);

    // Generate course outline
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert instructional designer creating microlearning courses. Always respond with ONLY valid JSON. No text before or after.',
      },
      {
        role: 'user' as const,
        content: prompt + '\n\nIMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after. Just the JSON object.',
      },
    ];

    let response;
    try {
      response = await aiProvider.chatCompletion(messages, {
        model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
        temperature: 0.5,
        maxTokens: 4000,
      });
    } catch (error) {
      console.error('Course generation failed:', error);
      return NextResponse.json(
        { error: 'Failed to generate course outline' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let courseData;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse course JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse course outline' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      type: 'course',
      course: courseData,
      config,
      generatedAt: Date.now(),
      message: 'Course outline generated successfully. You can now generate content for each stage.',
    });
  } catch (error) {
    console.error('Course generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate course',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
