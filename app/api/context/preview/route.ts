import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { retrieveContext } from '@/lib/rag/retrieval';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'course content topics main themes';

    if (globalVectorStore.size() === 0) {
      return NextResponse.json({
        totalChunks: 0,
        topics: [],
        sampleChunks: [],
        message: 'No context available. Please upload files first.',
      });
    }

    // Get sample chunks to analyze topics
    const results = await retrieveContext(query, globalVectorStore, 10, false);
    
    // Extract topics/keywords from chunks
    const topics = new Set<string>();
    results.forEach(result => {
      const text = result.text.toLowerCase();
      // Simple keyword extraction (can be enhanced with NLP)
      const words = text.split(/\s+/).filter(w => w.length > 4);
      words.forEach(word => {
        if (word.length > 4 && !word.match(/^(the|this|that|with|from|about|which|their|there)/)) {
          topics.add(word);
        }
      });
    });

    // Get file sources
    const fileSources = new Set<string>();
    results.forEach(result => {
      if (result.metadata?.source) {
        fileSources.add(result.metadata.source);
      }
    });

    return NextResponse.json({
      totalChunks: globalVectorStore.size(),
      topics: Array.from(topics).slice(0, 20), // Top 20 topics
      sampleChunks: results.slice(0, 5).map(r => ({
        text: r.text.substring(0, 200) + '...',
        source: r.metadata?.source || 'Unknown',
        score: r.score,
      })),
      fileSources: Array.from(fileSources),
      message: `Found ${globalVectorStore.size()} chunks from ${fileSources.size} file(s)`,
    });
  } catch (error) {
    console.error('Context preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate context preview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



