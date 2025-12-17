import { embedText } from '../together/embeddings';
import { rerankResults } from '../together/rerank';
import { VectorStore, StoredChunk } from './vectorStore';
import { RetrievalResult } from '../types/course';

export async function retrieveContext(
  query: string,
  vectorStore: VectorStore,
  topK: number = 5,
  useReranking: boolean = true
): Promise<RetrievalResult[]> {
  // 1. Embed the query
  const queryEmbedding = await embedText(query);

  // 2. Semantic search in vector store
  const candidates = vectorStore.search(queryEmbedding, topK * 2);

  if (candidates.length === 0) {
    return [];
  }

  // 3. Optionally rerank for better precision
  if (useReranking && candidates.length > topK) {
    const documents = candidates.map(c => c.text);
    const reranked = await rerankResults(query, documents, topK);

    return reranked.map(result => ({
      text: result.text,
      score: result.score,
      metadata: candidates[result.index].metadata,
    }));
  }

  // Return top K without reranking
  return candidates.slice(0, topK).map(chunk => ({
    text: chunk.text,
    score: 0.8, // Default score for semantic search
    metadata: chunk.metadata,
  }));
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

