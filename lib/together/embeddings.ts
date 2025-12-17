import { together, MODELS } from './client';

// Estimate token count - be very conservative
// For English text, average is ~4 chars/token, but for technical content it can be higher
// Using 2.5 chars per token to be very safe (this means 512 tokens ≈ 1280 chars max)
const MAX_TOKENS = 512;
const CHARS_PER_TOKEN = 2.5; // Very conservative estimate

export function estimateTokenCount(text: string): number {
  // Rough estimation: count words and add some overhead
  // More accurate: split by whitespace and estimate
  const words = text.trim().split(/\s+/).length;
  // Average word length is ~5 chars, so tokens ≈ chars / 3.5
  const estimatedTokens = Math.ceil(text.length / CHARS_PER_TOKEN);
  return estimatedTokens;
}

export function splitTextForEmbedding(text: string, maxTokens: number = MAX_TOKENS): string[] {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return [text];
  }
  
  // Need to split the text - be very conservative
  const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN * 0.8); // 80% to be extra safe
  const chunks: string[] = [];
  
  // Split by sentences first
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const testChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;
    
    if (estimateTokenCount(testChunk) > maxTokens && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = testChunk;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If any chunk is still too large, split by words
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (estimateTokenCount(chunk) <= maxTokens) {
      finalChunks.push(chunk);
    } else {
      // Split by words
      const words = chunk.split(/\s+/);
      let wordChunk = '';
      
      for (const word of words) {
        const testChunk = wordChunk + (wordChunk ? ' ' : '') + word;
        if (estimateTokenCount(testChunk) > maxTokens && wordChunk) {
          finalChunks.push(wordChunk.trim());
          wordChunk = word;
        } else {
          wordChunk = testChunk;
        }
      }
      
      if (wordChunk.trim()) {
        finalChunks.push(wordChunk.trim());
      }
    }
  }
  
  return finalChunks;
}

export async function embedText(
  text: string,
  useLongContext: boolean = false
): Promise<number[]> {
  if (!together.apiKey) {
    throw new Error('TOGETHER_API_KEY is not configured. Please set it in .env.local');
  }

  const model = useLongContext ? MODELS.EMBEDDING_LONG : MODELS.EMBEDDING;
  
  try {
    const response = await fetch(`${together.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${together.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No embedding data returned');
    }
    
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

export async function embedBatch(
  texts: string[],
  useLongContext: boolean = false
): Promise<number[][]> {
  const model = useLongContext ? MODELS.EMBEDDING_LONG : MODELS.EMBEDDING;
  const maxTokens = useLongContext ? 32000 : MAX_TOKENS; // Long context model supports 32k tokens
  
  try {
    // First, validate and split any oversized chunks - be very aggressive
    const processedTexts: string[] = [];
    for (const text of texts) {
      const estimatedTokens = estimateTokenCount(text);
      if (estimatedTokens <= maxTokens) {
        processedTexts.push(text);
      } else {
        // Split into smaller chunks
        const chunks = splitTextForEmbedding(text, maxTokens);
        processedTexts.push(...chunks);
      }
    }
    
    // Final validation pass - remove or truncate any that still exceed limit
    const validatedTexts: string[] = [];
    for (const text of processedTexts) {
      const tokens = estimateTokenCount(text);
      if (tokens <= maxTokens) {
        validatedTexts.push(text);
      } else {
        // Last resort: truncate to safe length
        console.warn(`Truncating oversized text: ${tokens} tokens, max is ${maxTokens}`);
        const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN * 0.7); // 70% to be very safe
        validatedTexts.push(text.substring(0, maxChars));
      }
    }
    
    // Process in batches to avoid rate limits
    const batchSize = 10;
    const results: number[][] = [];

    for (let i = 0; i < validatedTexts.length; i += batchSize) {
      const batch = validatedTexts.slice(i, i + batchSize);
      
      // Final safety check - ensure no text exceeds limit
      const safeBatch = batch.map(text => {
        const tokens = estimateTokenCount(text);
        if (tokens > maxTokens) {
          const maxChars = Math.floor(maxTokens * CHARS_PER_TOKEN * 0.7);
          return text.substring(0, maxChars);
        }
        return text;
      });
      
      const response = await fetch(`${together.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${together.apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: safeBatch,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Embedding API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      results.push(...data.data.map((item: any) => item.embedding));
    }
    
    return results;
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw error;
  }
}

