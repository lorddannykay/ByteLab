import { together, MODELS } from './client';

export interface RerankResult {
  index: number;
  score: number;
  text: string;
}

export async function rerankResults(
  query: string,
  documents: string[],
  topK?: number
): Promise<RerankResult[]> {
  try {
    const response = await fetch(`${together.baseURL}/rerank`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${together.apiKey}`,
      },
      body: JSON.stringify({
        model: MODELS.RERANK,
        query,
        documents,
        top_k: topK || documents.length,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Rerank API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    return data.results.map((result: any) => ({
      index: result.index,
      score: result.relevance_score || result.score || 0.5,
      text: documents[result.index],
    }));
  } catch (error) {
    console.error('Error in reranking:', error);
    // Fallback: return documents with equal scores
    return documents.map((text, index) => ({
      index,
      score: 0.5,
      text,
    }));
  }
}

