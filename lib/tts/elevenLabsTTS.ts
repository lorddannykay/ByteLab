/**
 * ElevenLabs TTS Integration
 * Premium text-to-speech using ElevenLabs API
 * Requires API key
 */

import { TTSProvider, Voice } from './types';

export class ElevenLabsTTSProvider implements TTSProvider {
  name = 'elevenlabs';
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Generate audio from text using ElevenLabs TTS
   * @param text - Text to convert to speech
   * @param voice - Voice ID (e.g., 'Rachel', 'Adam')
   * @returns Buffer containing MP3 audio data
   */
  async generateAudio(text: string, voice: string = 'Rachel'): Promise<Buffer> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('ElevenLabs TTS generation error:', error);
      throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all available ElevenLabs voices
   * @returns Array of available voices
   */
  async listVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return (data.voices || []).map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        gender: voice.labels?.gender || undefined,
        locale: voice.labels?.accent || undefined,
        provider: 'elevenlabs',
      }));
    } catch (error) {
      console.error('Error listing ElevenLabs voices:', error);
      // Return default voices if listing fails
      return [
        { id: 'Rachel', name: 'Rachel', gender: 'female', provider: 'elevenlabs' },
        { id: 'Adam', name: 'Adam', gender: 'male', provider: 'elevenlabs' },
      ];
    }
  }
}

