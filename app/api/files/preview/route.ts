import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const filename = searchParams.get('filename');

    if (!fileId && !filename) {
      return NextResponse.json(
        { error: 'fileId or filename is required' },
        { status: 400 }
      );
    }

    // Find chunks for this file
    const allChunks = globalVectorStore.getAllChunks();
    // Check both fileId and filename in metadata.source
    const fileIdLower = fileId ? fileId.toLowerCase() : '';
    const filenameLower = filename ? filename.toLowerCase() : '';

    const fileChunks = allChunks.filter(chunk => {
      const source = chunk.metadata?.source?.toLowerCase();
      return (fileIdLower && source === fileIdLower) || (filenameLower && source === filenameLower);
    });

    if (fileChunks.length === 0) {
      console.warn(`[Preview] No chunks found for ${filename} (${fileId})`);
      return NextResponse.json(
        { error: 'File content not found in vector store. Chunks may have been cleared.' },
        { status: 404 }
      );
    }

    // Sort chunks by index to reconstruct text
    const sortedChunks = fileChunks.sort((a, b) => a.index - b.index);
    const fullText = sortedChunks.map(c => c.text).join('\n\n');

    return NextResponse.json({
      content: fullText,
      filename: filename || fileChunks[0].metadata?.source,
      chunks: fileChunks.length,
    });
  } catch (error) {
    console.error('File preview error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve file content' },
      { status: 500 }
    );
  }
}
