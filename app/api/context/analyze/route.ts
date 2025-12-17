import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { embedText } from '@/lib/together/embeddings';
import { parsePDF } from '@/lib/parsers/pdfParser';
import { parseDOCX } from '@/lib/parsers/docxParser';
import { parseFileByExtension } from '@/lib/parsers/textParser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if there's existing context
    const existingChunks = globalVectorStore.getAllChunks();
    if (existingChunks.length === 0) {
      return NextResponse.json({
        related: false,
        similarity: 0,
        suggestion: 'clear',
        reason: 'No existing context found. This will start a fresh session.',
      });
    }

    // Parse the new file
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    let text = '';

    // Parse based on file type
    if (extension === 'pdf') {
      text = await parsePDF(buffer);
    } else if (extension === 'docx') {
      text = await parseDOCX(buffer);
    } else if (extension === 'txt' || extension === 'md') {
      text = await parseFileByExtension(buffer.toString('utf-8'), `.${extension}`);
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${extension}` },
        { status: 400 }
      );
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'File appears to be empty or could not be parsed' },
        { status: 400 }
      );
    }

    // Get a representative sample of the new file (first 2000 chars for embedding)
    const sampleText = text.substring(0, 2000);
    const newFileEmbedding = await embedText(sampleText);

    // Compare with existing chunks using semantic similarity
    let maxSimilarity = 0;
    let totalSimilarity = 0;
    let comparedCount = 0;

    // Sample up to 10 existing chunks for comparison (for efficiency)
    const sampleSize = Math.min(10, existingChunks.length);
    const sampledChunks = existingChunks
      .sort(() => Math.random() - 0.5) // Random sample
      .slice(0, sampleSize);

    for (const chunk of sampledChunks) {
      const similarity = cosineSimilarity(newFileEmbedding, chunk.embedding);
      maxSimilarity = Math.max(maxSimilarity, similarity);
      totalSimilarity += similarity;
      comparedCount++;
    }

    const avgSimilarity = comparedCount > 0 ? totalSimilarity / comparedCount : 0;
    // Use max similarity as primary indicator, but consider avg for edge cases
    const finalSimilarity = Math.max(maxSimilarity, avgSimilarity * 0.8);

    // Threshold: 0.6 for related content
    const related = finalSimilarity >= 0.6;
    const suggestion = related ? 'merge' : 'clear';

    let reason = '';
    if (related) {
      reason = `This file appears related to your existing context (${(finalSimilarity * 100).toFixed(0)}% similarity). You can merge it with existing files or start fresh.`;
    } else {
      reason = `This file appears unrelated to your existing context (${(finalSimilarity * 100).toFixed(0)}% similarity). Starting fresh is recommended to avoid confusion.`;
    }

    return NextResponse.json({
      related,
      similarity: finalSimilarity,
      suggestion,
      reason,
    });
  } catch (error) {
    console.error('Context analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze context',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dotProduct / (magA * magB);
}



