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

    // Generate a descriptive filename from text content
    let generatedFilename = filename;
    if (generatedFilename === 'pasted-text.txt') {
      const words = text.trim().split(/\s+/).slice(0, 5).join('-');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const random = Math.random().toString(36).substring(2, 7);
      const prefix = words.replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 20);
      generatedFilename = `pasted-${prefix || 'content'}-${timestamp}-${random}.txt`;
    }

    const safeFilename = generatedFilename.replace(/[^a-z0-9.-]/gi, '-') || 'pasted-text.txt';

    // Chunk the text with the FINAL filename for the metadata
    const chunks = chunkText(text, undefined, 200, safeFilename);

    console.log(`[Upload/Text] Indexed chunks with source: ${safeFilename}`);

    // Add chunks to vector store
    await globalVectorStore.addChunks(chunks);

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

