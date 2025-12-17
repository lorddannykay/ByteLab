/**
 * TTS Provider Factory
 * Creates TTS providers based on configuration
 * Defaults to EdgeTTS (free, no API key required)
 */

import { TTSProvider, TTSConfig, DEFAULT_EDGE_VOICES } from './types';
import { EdgeTTSProvider } from './edgeTTS';
import { ElevenLabsTTSProvider } from './elevenLabsTTS';

/**
 * Create a TTS provider based on configuration
 * @param config - TTS configuration
 * @returns TTS provider instance
 */
export function createTTSProvider(config?: Partial<TTSConfig>): TTSProvider {
  const providerType = config?.provider || 'edge';
  const apiKey = config?.apiKey;

  switch (providerType) {
    case 'elevenlabs':
      if (!apiKey) {
        console.warn('ElevenLabs requires an API key. Falling back to EdgeTTS.');
        return new EdgeTTSProvider();
      }
      return new ElevenLabsTTSProvider(apiKey);

    case 'openai':
      if (!apiKey) {
        console.warn('OpenAI TTS requires an API key. Falling back to EdgeTTS.');
        return new EdgeTTSProvider();
      }
      // TODO: Implement OpenAI TTS provider
      console.warn('OpenAI TTS not yet implemented. Falling back to EdgeTTS.');
      return new EdgeTTSProvider();

    case 'edge':
    default:
      return new EdgeTTSProvider();
  }
}

/**
 * Get default voices for a provider
 * @param provider - Provider type
 * @returns Default voice configuration
 */
export function getDefaultVoices(provider: string = 'edge') {
  switch (provider) {
    case 'elevenlabs':
      return {
        video: 'Rachel',
        podcastHost: 'Rachel',
        podcastExpert: 'Adam',
      };
    case 'openai':
      return {
        video: 'alloy',
        podcastHost: 'nova',
        podcastExpert: 'echo',
      };
    case 'edge':
    default:
      return DEFAULT_EDGE_VOICES;
  }
}

