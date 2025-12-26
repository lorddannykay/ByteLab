import { NextRequest, NextResponse } from 'next/server';
import { extractSearchKeywords, generateSearchQueries, rankImagesByRelevance } from '@/lib/media/imageRelevanceEngine';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'nature';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    // Optional context for intelligent search
    const sectionHeading = searchParams.get('heading') || '';
    const sectionContent = searchParams.get('content') || '';
    const courseTopic = searchParams.get('topic') || '';
    const useRelevance = searchParams.get('useRelevance') === 'true';

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Pexels API key not configured' },
        { status: 500 }
      );
    }

    let searchQuery = query;
    let keywords: ReturnType<typeof extractSearchKeywords> | null = null;

    // Use intelligent search if context provided
    if (useRelevance && sectionHeading && sectionContent && courseTopic) {
      keywords = extractSearchKeywords(sectionHeading, sectionContent, courseTopic);
      const queries = generateSearchQueries(keywords);
      searchQuery = queries[0] || query; // Use most specific query

      console.log('Intelligent image search:', {
        originalQuery: query,
        optimizedQuery: searchQuery,
        geographic: keywords.geographic,
        region: keywords.region
      });
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch images from Pexels' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Pexels response to our format
    let images = data.photos?.map((photo: any) => ({
      id: photo.id.toString(),
      type: 'image' as const,
      thumbnailUrl: photo.src?.medium || photo.src?.small || '',
      fullUrl: photo.src?.large || photo.src?.original || '',
      rawUrl: photo.src?.original || '',
      width: photo.width,
      height: photo.height,
      attribution: `Photo by ${photo.photographer || 'Unknown'} from Pexels`,
      photographer: photo.photographer || 'Unknown',
      photographerUrl: photo.photographer_url || '',
      downloadUrl: photo.url || '',
      alt: photo.alt || '',
    })) || [];

    // Apply relevance ranking if context provided
    if (useRelevance && keywords && images.length > 0) {
      images = rankImagesByRelevance(images, keywords, searchQuery, 10);
      console.log(`Ranked ${images.length} images by relevance. Top score: ${images[0]?.relevanceScore || 0}`);
    }

    return NextResponse.json({
      images,
      page: data.page || page,
      perPage: data.per_page || perPage,
      totalResults: data.total_results || 0,
      totalPages: Math.ceil((data.total_results || 0) / perPage),
      searchQuery: searchQuery, // Return the actual query used
      relevanceApplied: useRelevance && keywords !== null,
    });
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


