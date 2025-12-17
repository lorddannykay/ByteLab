import { NextResponse } from 'next/server';
import { providerManager } from '@/lib/ai/providers';

export async function GET() {
  try {
    const available = providerManager.getAvailableProviders();
    const defaultProvider = providerManager.getDefaultProvider();

    return NextResponse.json({
      available,
      default: defaultProvider,
    });
  } catch (error) {
    return NextResponse.json(
      {
        available: [],
        default: 'together',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

