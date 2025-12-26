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
    console.log(`[RAG] Adding ${chunks.length} chunks to vector store`);

    // Log first few chunks for debugging
    chunks.slice(0, 3).forEach((chunk, i) => {
      console.log(`[RAG] Chunk ${i + 1}/${chunks.length}: ${chunk.text.substring(0, 100)}...`);
    });
    if (chunks.length > 3) {
      console.log(`[RAG] ... and ${chunks.length - 3} more chunks`);
    }

    // Batch embed for efficiency
    const texts = chunks.map(c => c.text);
    const embeddings = await embedBatch(texts);

    console.log(`[RAG] Generated ${embeddings.length} embeddings for ${chunks.length} chunks`);

    // Handle potential mismatch if embedBatch's safety net split any texts
    if (embeddings.length !== chunks.length) {
      console.warn(`[RAG] ⚠️  Embedding count mismatch: ${embeddings.length} embeddings for ${chunks.length} chunks`);

      // If we have more embeddings than chunks, some were split
      let embeddingIndex = 0;
      for (const chunk of chunks) {
        const splitTexts = splitTextForEmbedding(chunk.text);
        const numSplits = splitTexts.length;

        for (let i = 0; i < numSplits && embeddingIndex < embeddings.length; i++) {
          this.chunks.push({
            text: splitTexts[i],
            index: chunk.index * 1000 + i,
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

    console.log(`[RAG] ✓ Vector store now contains ${this.chunks.length} total chunks`);
  }

  search(queryEmbedding: number[], topK: number = 5): StoredChunk[] {
    console.log(`[RAG] Searching vector store (${this.chunks.length} chunks, top-${topK})`);

    if (this.chunks.length === 0) {
      console.warn(`[RAG] ⚠️  Vector store is empty! No chunks to search.`);
      return [];
    }

    // Calculate cosine similarity for all chunks
    const scored = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // Sort by score and return top K
    const results = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);

    console.log(`[RAG] Found ${results.length} results (top score: ${scored[0]?.score.toFixed(3) || 'N/A'})`);

    return results;
  }

  getAllChunks(): StoredChunk[] {
    return [...this.chunks];
  }

  clear(): void {
    console.log(`[RAG] Vector store cleared (${this.chunks.length} chunks removed)`);
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

// Singleton instance for the application with HMR support
// This prevents multiple instances in development when files are re-compiled
const globalForVectorStore = globalThis as unknown as {
  globalVectorStore: VectorStore | undefined;
};

export const globalVectorStore =
  globalForVectorStore.globalVectorStore ?? new VectorStore();

if (process.env.NODE_ENV !== 'production') {
  globalForVectorStore.globalVectorStore = globalVectorStore;
}

