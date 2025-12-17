// AI Provider Types
export type AIProvider = 'together' | 'openai' | 'anthropic';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface JSONGenerationOptions extends Omit<ChatOptions, 'responseFormat'> {
  schema?: any;
  retries?: number;
}

// Provider interface
export interface AIProviderInterface {
  name: string;
  chatCompletion(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  generateJSON<T>(messages: ChatMessage[], options?: JSONGenerationOptions): Promise<T>;
  isAvailable(): boolean;
  getAvailableModels(): string[];
}

