import { embedText } from '../together/embeddings';
import { rerankResults } from '../together/rerank';
import { VectorStore, StoredChunk } from './vectorStore';
import { RetrievalResult } from '@/types/course';

export async function retrieveContext(
  query: string,
  vectorStore: VectorStore,
  topK: number = 5,
  useReranking: boolean = true
): Promise<RetrievalResult[]> {
  console.log(`[RAG] Retrieving context for query: "${query.substring(0, 100)}..."`);
  console.log(`[RAG] Parameters: top-K=${topK}, reranking=${useReranking}`);

  // 1. Embed the query
  const queryEmbedding = await embedText(query);
  console.log(`[RAG] Query embedded (${queryEmbedding.length} dimensions)`);

  // 2. Semantic search in vector store
  const candidates = vectorStore.search(queryEmbedding, topK * 2);

  console.log(`[RAG] Found ${candidates.length} candidates from vector search`);

  if (candidates.length === 0) {
    console.warn(`[RAG] ⚠️  No candidates found! Check if content was vectorized.`);
    console.log(`[RAG] Vector store size: ${vectorStore.size()} chunks`);
    return [];
  }

  // 3. Optionally rerank for better precision
  if (useReranking && candidates.length > topK) {
    console.log(`[RAG] Reranking ${candidates.length} candidates to top ${topK}...`);
    const documents = candidates.map(c => c.text);
    const reranked = await rerankResults(query, documents, topK);

    console.log(`[RAG] Reranking complete. Top ${reranked.length} results:`);
    reranked.slice(0, 3).forEach((result, i) => {
      console.log(`[RAG]   ${i + 1}. Score: ${result.score.toFixed(3)} | ${result.text.substring(0, 80)}...`);
    });

    return reranked.map(result => ({
      text: result.text,
      score: result.score,
      metadata: candidates[result.index].metadata,
    }));
  }

  // Return top K without reranking
  const results = candidates.slice(0, topK).map(chunk => ({
    text: chunk.text,
    score: 0.8, // Default score for semantic search
    metadata: chunk.metadata,
  }));

  console.log(`[RAG] Returning ${results.length} results (no reranking):`);
  results.slice(0, 3).forEach((result, i) => {
    console.log(`[RAG]   ${i + 1}. ${result.text.substring(0, 80)}...`);
  });

  return results;
}

export function formatContextForPrompt(
  results: RetrievalResult[],
  maxLength: number = 2000
): string {
  let formatted = '';
  for (const result of results) {
    const addition = `\n\n---\n${result.text}`;
    if (formatted.length + addition.length > maxLength) {
      break;
    }
    formatted += addition;
  }
  return formatted.trim();
}

