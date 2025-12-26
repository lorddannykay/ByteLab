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

    // Extract title from HTML if possible
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    // Extract text content from HTML (simple extraction)
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

    // Extract filename from URL or title
    let generatedFilename = pageTitle
      ? `${pageTitle.substring(0, 30)}.html`
      : (urlObj.pathname.split('/').pop() || `${urlObj.hostname}.html`);

    if (generatedFilename.length < 5 || generatedFilename === 'index.html') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      generatedFilename = `${urlObj.hostname}-${timestamp}.html`;
    }

    const safeFilename = generatedFilename.replace(/[^a-z0-9.-]/gi, '-');

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

