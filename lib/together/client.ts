// TogetherAI API client using fetch
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const TOGETHER_API_BASE = 'https://api.together.xyz/v1';

if (!TOGETHER_API_KEY) {
  console.warn('⚠️ TOGETHER_API_KEY is not set. API calls will fail.');
}

export const together = {
  apiKey: TOGETHER_API_KEY,
  baseURL: TOGETHER_API_BASE,
};

// Model constants
export const MODELS = {
  EMBEDDING: 'BAAI/bge-large-en-v1.5',
  EMBEDDING_LONG: 'togethercomputer/m2-bert-80M-32k-retrieval',
  CHAT: 'Qwen/Qwen3-Next-80B-A3b-Instruct',
  CHAT_BUDGET: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
  CHAT_FREE: 'servicenow-ai/Apriel-1.6-15B-Thinker',
  RERANK: 'Salesforce/Llama-Rank-V1',
  MODERATION: 'meta-llama/Llama-Guard-4-12B',
  IMAGE: 'black-forest-labs/FLUX.1-schnell-Free',
} as const;

