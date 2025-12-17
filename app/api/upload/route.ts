import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/parsers/pdfParser';
import { parseDOCX } from '@/lib/parsers/docxParser';
import { parseFileByExtension } from '@/lib/parsers/textParser';
import { chunkText } from '@/lib/rag/chunker';
import { globalVectorStore } from '@/lib/rag/vectorStore';

interface ContentQuality {
  score: number; // 0-100
  textLength: number;
  hasHeadings: boolean;
  hasParagraphs: boolean;
  wordCount: number;
  suggestions: string[];
}

function analyzeContentQuality(text: string): ContentQuality {
  const textLength = text.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  // Check for structure
  const hasHeadings = /^#+\s|^[A-Z][^\n]{0,100}$/m.test(text) || 
                      /<h[1-6]|Heading|Chapter|Section/i.test(text);
  const hasParagraphs = text.split(/\n\n/).length > 3 || 
                        text.split(/\.\s+/).length > 5;
  
  // Calculate quality score
  let score = 0;
  const suggestions: string[] = [];
  
  // Text length (0-30 points)
  if (textLength >= 2000) {
    score += 30;
  } else if (textLength >= 1000) {
    score += 20;
    suggestions.push('Document is relatively short. Consider adding more content for a comprehensive course.');
  } else if (textLength >= 500) {
    score += 10;
    suggestions.push('Document is quite short. You may want to provide more detailed content.');
  } else {
    suggestions.push('Document is very short. Consider uploading a more detailed document or providing additional context.');
  }
  
  // Word count (0-20 points)
  if (wordCount >= 500) {
    score += 20;
  } else if (wordCount >= 250) {
    score += 15;
  } else if (wordCount >= 100) {
    score += 10;
  } else {
    suggestions.push('Low word count. The document may not have enough content for a complete course.');
  }
  
  // Structure (0-30 points)
  if (hasHeadings && hasParagraphs) {
    score += 30;
  } else if (hasHeadings || hasParagraphs) {
    score += 15;
    if (!hasHeadings) {
      suggestions.push('Consider adding headings or sections to organize the content better.');
    }
    if (!hasParagraphs) {
      suggestions.push('Content appears to lack paragraph structure. Well-structured content improves course quality.');
    }
  } else {
    suggestions.push('Content lacks clear structure. Consider organizing with headings and paragraphs.');
  }
  
  // Content coherence (0-20 points)
  // Check for repeated words (indicates potential issues)
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    if (word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  const maxFreq = Math.max(...Object.values(wordFreq));
  const uniqueWords = Object.keys(wordFreq).length;
  const diversity = uniqueWords / words.length;
  
  if (diversity > 0.3 && maxFreq < words.length * 0.1) {
    score += 20;
  } else if (diversity > 0.2) {
    score += 10;
  } else {
    suggestions.push('Content may lack variety. Consider adding more diverse explanations and examples.');
  }
  
  // Ensure score is between 0-100
  score = Math.min(100, Math.max(0, score));
  
  // Add general suggestions based on score
  if (score < 50) {
    suggestions.push('This document may not be sufficient for generating a comprehensive course. Consider providing more detailed content or using AI to generate additional material.');
  } else if (score < 70) {
    suggestions.push('The document quality is moderate. You may want to enhance it with more details or examples.');
  }
  
  return {
    score,
    textLength,
    hasHeadings,
    hasParagraphs,
    wordCount,
    suggestions,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const clearExisting = formData.get('clearExisting') === 'true';

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Clear existing chunks if requested
    if (clearExisting) {
      globalVectorStore.clear();
    }

    const processedFiles = [];

    for (const file of files) {
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

      // Analyze content quality
      const qualityAnalysis = analyzeContentQuality(text);

      // Chunk the text (chunker now uses token-aware sizing, default is safe for 512 token limit)
      const chunks = chunkText(text, undefined, 200, file.name);

      // Add chunks to vector store
      await globalVectorStore.addChunks(chunks);

      processedFiles.push({
        name: file.name,
        size: file.size,
        chunks: chunks.length,
        textLength: text.length,
        quality: qualityAnalysis,
      });
    }

    return NextResponse.json({
      success: true,
      files: processedFiles,
      totalChunks: globalVectorStore.size(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear vector store
export async function DELETE(request: NextRequest) {
  try {
    globalVectorStore.clear();
    return NextResponse.json({
      success: true,
      message: 'Vector store cleared successfully',
    });
  } catch (error) {
    console.error('Clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear vector store', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

