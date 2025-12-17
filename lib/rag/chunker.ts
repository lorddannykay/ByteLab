export interface Chunk {
  text: string;
  index: number;
  metadata?: {
    source: string;
    page?: number;
  };
}

// Token estimation - be very conservative
// Using 2.5 chars per token to be safe (512 tokens ≈ 1280 chars max)
const CHARS_PER_TOKEN = 2.5;
const MAX_TOKENS = 512; // Embedding model limit
const SAFE_MAX_CHARS = Math.floor(MAX_TOKENS * CHARS_PER_TOKEN * 0.85); // 85% to be extra safe (~1088 chars)

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function chunkText(
  text: string,
  chunkSize: number = SAFE_MAX_CHARS, // Default to safe token limit
  overlap: number = 200,
  source?: string
): Chunk[] {
  // Split by paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    
    // If adding this paragraph would exceed chunk size, save current chunk
    if (currentChunk.length + trimmed.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
        metadata: source ? { source } : undefined,
      });
      
      // Start new chunk with overlap (last N characters)
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + trimmed;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex++,
      metadata: source ? { source } : undefined,
    });
  }

  // Validate chunks by token count and split if needed
  const finalChunks: Chunk[] = [];
  for (const chunk of chunks) {
    const tokenCount = estimateTokenCount(chunk.text);
    
    if (tokenCount <= MAX_TOKENS) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences to respect token limit
      const sentences = chunk.text.split(/(?<=[.!?])\s+/);
      let sentenceChunk = '';
      
      for (const sentence of sentences) {
        const testChunk = sentenceChunk + (sentenceChunk ? ' ' : '') + sentence;
        const testTokenCount = estimateTokenCount(testChunk);
        
        if (testTokenCount > MAX_TOKENS && sentenceChunk.length > 0) {
          finalChunks.push({
            text: sentenceChunk.trim(),
            index: finalChunks.length,
            metadata: chunk.metadata,
          });
          sentenceChunk = sentence;
        } else {
          sentenceChunk = testChunk;
        }
      }
      
      if (sentenceChunk.trim().length > 0) {
        // Final check - if still too large, split by words
        const finalTokenCount = estimateTokenCount(sentenceChunk);
        if (finalTokenCount > MAX_TOKENS) {
          const words = sentenceChunk.split(/\s+/);
          let wordChunk = '';
          
          for (const word of words) {
            const testChunk = wordChunk + (wordChunk ? ' ' : '') + word;
            const testTokenCount = estimateTokenCount(testChunk);
            
            if (testTokenCount > MAX_TOKENS && wordChunk.length > 0) {
              finalChunks.push({
                text: wordChunk.trim(),
                index: finalChunks.length,
                metadata: chunk.metadata,
              });
              wordChunk = word;
            } else {
              wordChunk = testChunk;
            }
          }
          
          if (wordChunk.trim().length > 0) {
            finalChunks.push({
              text: wordChunk.trim(),
              index: finalChunks.length,
              metadata: chunk.metadata,
            });
          }
        } else {
          finalChunks.push({
            text: sentenceChunk.trim(),
            index: finalChunks.length,
            metadata: chunk.metadata,
          });
        }
      }
    }
  }

  return finalChunks;
}

