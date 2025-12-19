import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get chunks for this file
    const allChunks = globalVectorStore.getAllChunks();
    const fileChunks = allChunks.filter(chunk => {
      const source = chunk.metadata?.source || '';
      return source.includes(fileId) || source === fileId;
    });

    if (fileChunks.length === 0) {
      return NextResponse.json(
        { error: 'File not found or no content available' },
        { status: 404 }
      );
    }

    // Combine chunks into preview content (first 5000 characters)
    const previewText = fileChunks
      .map(chunk => chunk.text)
      .join('\n\n')
      .substring(0, 5000);

    return NextResponse.json({
      content: previewText,
      totalChunks: fileChunks.length,
      previewLength: previewText.length,
    });
  } catch (error) {
    console.error('File preview error:', error);
    return NextResponse.json(
      { error: 'Failed to load preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

