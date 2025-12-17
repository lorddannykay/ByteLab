import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { chunkText } from '@/lib/rag/chunker';

export async function POST(request: NextRequest) {
  try {
    const { text, filename = 'pasted-text.txt' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      );
    }

    if (text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text content is too short (minimum 50 characters)' },
        { status: 400 }
      );
    }

    // Chunk the text
    const chunks = chunkText(text, undefined, 200, filename);

    // Add chunks to vector store
    await globalVectorStore.addChunks(chunks);

    const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '-') || 'pasted-text.txt';

    return NextResponse.json({
      success: true,
      filename: safeFilename,
      size: text.length,
      chunks: chunks.length,
      totalChunks: globalVectorStore.size(),
    });
  } catch (error) {
    console.error('Text upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

