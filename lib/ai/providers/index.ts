import { AIProvider, AIProviderInterface, AIProviderConfig } from './types';
import { TogetherAIProvider } from './togetherProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';

// Provider factory
export function createProvider(config: AIProviderConfig): AIProviderInterface {
  switch (config.provider) {
    case 'together':
      return new TogetherAIProvider();
    case 'openai':
      return new OpenAIProvider(config.apiKey);
    case 'anthropic':
      return new AnthropicProvider(config.apiKey);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// Get default provider based on available API keys
export function getDefaultProvider(): AIProvider {
  if (process.env.TOGETHER_API_KEY) return 'together';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'together'; // Fallback to TogetherAI
}

// Get all available providers
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.TOGETHER_API_KEY) providers.push('together');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  return providers;
}

// Provider manager
export class ProviderManager {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private initialized = false;

  constructor() {
    // Don't initialize in constructor - use lazy initialization
  }

  private initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize available providers
      if (process.env.TOGETHER_API_KEY) {
        this.providers.set('together', new TogetherAIProvider());
      }
      if (process.env.OPENAI_API_KEY) {
        this.providers.set('openai', new OpenAIProvider());
      }
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.set('anthropic', new AnthropicProvider());
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing providers:', error);
    }
  }

  getProvider(provider: AIProvider): AIProviderInterface | null {
    this.initialize();
    return this.providers.get(provider) || null;
  }

  getAvailableProviders(): AIProvider[] {
    this.initialize();
    return Array.from(this.providers.keys());
  }

  getDefaultProvider(): AIProvider {
    this.initialize();
    const available = this.getAvailableProviders();
    if (available.includes('together')) return 'together';
    if (available.includes('openai')) return 'openai';
    if (available.includes('anthropic')) return 'anthropic';
    throw new Error('No AI providers available. Please configure at least one API key.');
  }
}

// Lazy singleton - only create when needed
let _providerManager: ProviderManager | null = null;

export function getProviderManager(): ProviderManager {
  if (!_providerManager) {
    _providerManager = new ProviderManager();
  }
  return _providerManager;
}

export const providerManager = getProviderManager();

