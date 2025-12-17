import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { chunkText } from '@/lib/rag/chunker';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let urlObj: URL;
    try {
      urlObj = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch content from URL
    const fetchResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ByteLab/1.0)',
      },
    });

    if (!fetchResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${fetchResponse.statusText}` },
        { status: fetchResponse.status }
      );
    }

    const html = await fetchResponse.text();
    
    // Extract text content from HTML (simple extraction)
    // In production, you might want to use a library like cheerio or jsdom
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!textContent || textContent.length < 100) {
      return NextResponse.json(
        { error: 'Unable to extract meaningful content from URL' },
        { status: 400 }
      );
    }

    // Chunk the text
    const chunks = chunkText(textContent, undefined, 200, url);

    // Add chunks to vector store
    await globalVectorStore.addChunks(chunks);

    // Extract filename from URL
    const filename = urlObj.pathname.split('/').pop() || 'webpage.txt';
    const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '-');

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      size: textContent.length,
      chunks: chunks.length,
      totalChunks: globalVectorStore.size(),
    });
  } catch (error) {
    console.error('URL upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

