import { embedText, embedBatch, splitTextForEmbedding } from '../together/embeddings';
import { Chunk } from '../rag/chunker';

export interface StoredChunk {
  text: string;
  index: number;
  embedding: number[];
  metadata?: {
    source: string;
    page?: number;
  };
}

export class VectorStore {
  private chunks: StoredChunk[] = [];

  async addChunk(chunk: Chunk): Promise<void> {
    const embedding = await embedText(chunk.text);
    this.chunks.push({
      text: chunk.text,
      index: chunk.index,
      embedding,
      metadata: chunk.metadata,
    });
  }

  async addChunks(chunks: Chunk[]): Promise<void> {
    // Batch embed for efficiency
    // The chunker ensures chunks are token-safe, so embedBatch should not need to split
    const texts = chunks.map(c => c.text);
    const embeddings = await embedBatch(texts);
    
    // Handle potential mismatch if embedBatch's safety net split any texts
    if (embeddings.length !== chunks.length) {
      console.warn(`Embedding count mismatch: ${embeddings.length} embeddings for ${chunks.length} chunks. Some chunks may have been split.`);
      
      // If we have more embeddings than chunks, some were split
      // Process each chunk and match embeddings sequentially
      let embeddingIndex = 0;
      for (const chunk of chunks) {
        const splitTexts = splitTextForEmbedding(chunk.text);
        const numSplits = splitTexts.length;
        
        for (let i = 0; i < numSplits && embeddingIndex < embeddings.length; i++) {
          this.chunks.push({
            text: splitTexts[i],
            index: chunk.index * 1000 + i, // Offset index for split chunks
            embedding: embeddings[embeddingIndex],
            metadata: chunk.metadata,
          });
          embeddingIndex++;
        }
      }
    } else {
      // Normal case: 1:1 mapping
      chunks.forEach((chunk, index) => {
        this.chunks.push({
          text: chunk.text,
          index: chunk.index,
          embedding: embeddings[index],
          metadata: chunk.metadata,
        });
      });
    }
  }

  search(queryEmbedding: number[], topK: number = 5): StoredChunk[] {
    if (this.chunks.length === 0) {
      return [];
    }

    // Calculate cosine similarity for all chunks
    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score and return top K
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);
  }

  getAllChunks(): StoredChunk[] {
    return [...this.chunks];
  }

  clear(): void {
    this.chunks = [];
  }

  size(): number {
    return this.chunks.length;
  }

  getChunksBySource(source: string): StoredChunk[] {
    return this.chunks.filter(chunk => chunk.metadata?.source === source);
  }

  removeChunksBySource(source: string): void {
    this.chunks = this.chunks.filter(chunk => chunk.metadata?.source !== source);
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

// Singleton instance for the application
export const globalVectorStore = new VectorStore();

