import { NextRequest, NextResponse } from 'next/server';
import { getDuckDuckGoImageSearch } from '@/lib/media/duckDuckGoImageSearch';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const maxResults = parseInt(searchParams.get('per_page') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const duckDuckGoImageSearch = getDuckDuckGoImageSearch();
    
    if (!duckDuckGoImageSearch.isAvailable()) {
      return NextResponse.json(
        { error: 'DuckDuckGo Image Search is not available' },
        { status: 500 }
      );
    }

    const results = await duckDuckGoImageSearch.search(query, {
      maxResults: Math.min(maxResults, 20),
    });

    // Transform to match the format expected by ImageSearchModal
    const images = results.map((result, index) => ({
      id: `duckduckgo-${Date.now()}-${index}`,
      type: 'image' as const,
      thumbnailUrl: result.thumbnailUrl || result.url,
      fullUrl: result.url,
      rawUrl: result.url,
      width: result.width,
      height: result.height,
      attribution: result.title || 'Image from DuckDuckGo',
      photographer: 'DuckDuckGo',
      photographerUrl: result.contextUrl || '',
      provider: 'duckduckgo' as const,
      mediaType: 'image' as const,
    }));

    return NextResponse.json({
      images,
      totalResults: images.length,
    });
  } catch (error) {
    console.error('DuckDuckGo Image Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch images from DuckDuckGo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



