import { NextRequest, NextResponse } from 'next/server';
import { MODELS } from '@/lib/together/client';

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_BASE = 'https://api.together.xyz/v1';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context }: { prompt: string; context?: any } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!TOGETHER_API_KEY) {
      return NextResponse.json(
        { error: 'TOGETHER_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    if (context) {
      if (context.courseTitle) {
        enhancedPrompt = `Course: ${context.courseTitle}. ${enhancedPrompt}`;
      }
      if (context.stageTitle) {
        enhancedPrompt = `Stage: ${context.stageTitle}. ${enhancedPrompt}`;
      }
    }
    enhancedPrompt += '. Educational illustration, clean, professional, suitable for microlearning course.';

    // Call TogetherAI image generation API
    const response = await fetch(`${TOGETHER_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.IMAGE, // 'black-forest-labs/FLUX.1-schnell-Free'
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Image generation failed');
    }

    const data = await response.json();
    
    // TogetherAI returns image data in data array
    if (data.data && data.data.length > 0 && data.data[0].url) {
      return NextResponse.json({
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt || enhancedPrompt,
      });
    }

    throw new Error('No image URL in response');
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

