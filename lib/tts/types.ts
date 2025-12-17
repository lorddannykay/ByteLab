/**
 * TTS Provider Interface and Types
 * Defines the standard interface for all TTS providers
 */

export interface Voice {
  id: string;
  name: string;
  gender?: string;
  locale?: string;
  provider: string;
}

export interface TTSProvider {
  name: string;
  generateAudio(text: string, voice: string): Promise<Buffer>;
  listVoices(): Promise<Voice[]>;
}

export interface TTSConfig {
  provider: 'edge' | 'elevenlabs' | 'openai';
  apiKey?: string; // Only needed for paid providers
  voices?: {
    video: string;
    podcastHost: string;
    podcastExpert: string;
  };
}

// Default voices for EdgeTTS (free)
export const DEFAULT_EDGE_VOICES = {
  video: 'en-US-AriaNeural', // Female, clear narration
  podcastHost: 'en-US-JennyNeural', // Female host
  podcastExpert: 'en-US-GuyNeural', // Male expert
};

