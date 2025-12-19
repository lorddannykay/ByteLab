import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'nature';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch images from Unsplash' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Unsplash response to our format
    const images = data.results?.map((photo: any) => ({
      id: photo.id,
      type: 'image' as const,
      thumbnailUrl: photo.urls.thumb,
      fullUrl: photo.urls.regular,
      rawUrl: photo.urls.raw,
      width: photo.width,
      height: photo.height,
      attribution: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`,
      photographer: photo.user?.name,
      photographerUrl: photo.user?.links?.html,
      downloadUrl: photo.links?.download,
    })) || [];

    return NextResponse.json({
      images,
      page: data.page || page,
      perPage: data.per_page || perPage,
      totalResults: data.total || 0,
      totalPages: data.total_pages || 0,
    });
  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

