import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || 'nature';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Pexels API key not configured' },
        { status: 500 }
      );
    }

    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch videos from Pexels' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Pexels response to our format
    const videos = data.videos?.map((video: any) => {
      // Get the best quality video file
      const videoFile = video.video_files?.sort((a: any, b: any) => b.width - a.width)[0] || video.video_files?.[0];
      
      return {
        id: video.id.toString(),
        type: 'video' as const,
        thumbnailUrl: video.image,
        fullUrl: videoFile?.link || video.video_files?.[0]?.link,
        width: video.width,
        height: video.height,
        duration: video.duration,
        attribution: `Video by ${video.user?.name || 'Unknown'} from Pexels`,
        photographer: video.user?.name,
        photographerUrl: video.user?.url,
      };
    }) || [];

    return NextResponse.json({
      videos,
      page: data.page || page,
      perPage: data.per_page || perPage,
      totalResults: data.total_results || 0,
      nextPage: data.next_page || null,
    });
  } catch (error) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

