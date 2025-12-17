/**
 * Edge TTS Integration
 * Free text-to-speech using Microsoft Edge TTS
 * No API key required
 * 
 * Note: edge-tts npm package provides a Node.js wrapper for Edge TTS
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { TTSProvider, Voice } from './types';

const execAsync = promisify(exec);

export interface EdgeVoice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
}

// Default voices for different use cases
export const DEFAULT_VOICES = {
  video: 'en-US-AriaNeural', // Female, clear narration
  podcastHost: 'en-US-JennyNeural', // Female host
  podcastExpert: 'en-US-GuyNeural', // Male expert
};

/**
 * EdgeTTS Provider Implementation
 * Implements TTSProvider interface for use with factory
 */
export class EdgeTTSProvider implements TTSProvider {
  name = 'edge';

  async generateAudio(text: string, voice: string = DEFAULT_VOICES.video): Promise<Buffer> {
    return generateAudio(text, voice);
  }

  async listVoices(): Promise<Voice[]> {
    const edgeVoices = await listVoices();
    return edgeVoices.map(voice => ({
      id: voice.ShortName,
      name: voice.Name,
      gender: voice.Gender,
      locale: voice.Locale,
      provider: 'edge',
    }));
  }
}

/**
 * Generate audio from text using Edge TTS
 * @param text - Text to convert to speech
 * @param voice - Voice ID (e.g., 'en-US-AriaNeural')
 * @returns Buffer containing MP3 audio data
 */
export async function generateAudio(text: string, voice: string = DEFAULT_VOICES.video): Promise<Buffer> {
  try {
    // Create temporary file paths
    const tempDir = tmpdir();
    const outputFile = join(tempDir, `edge-tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`);
    
    // Escape text for command line
    const escapedText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
    
    // Use edge-tts command line tool
    // Format: edge-tts --voice "voice" --text "text" --write-media "output.mp3"
    const command = `npx edge-tts --voice "${voice}" --text "${escapedText}" --write-media "${outputFile}"`;
    
    await execAsync(command);
    
    // Read the generated audio file
    const audioBuffer = await readFile(outputFile);
    
    // Clean up temporary file
    try {
      await unlink(outputFile);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }
    
    return audioBuffer;
  } catch (error) {
    console.error('Edge TTS generation error:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate audio and return as base64 data URL
 * @param text - Text to convert to speech
 * @param voice - Voice ID
 * @returns Base64 data URL (data:audio/mpeg;base64,...)
 */
export async function generateAudioDataURL(text: string, voice: string = DEFAULT_VOICES.video): Promise<string> {
  const buffer = await generateAudio(text, voice);
  const base64 = buffer.toString('base64');
  return `data:audio/mpeg;base64,${base64}`;
}

/**
 * List all available Edge TTS voices
 * @returns Array of available EdgeVoice objects
 */
export async function listVoices(): Promise<EdgeVoice[]> {
  try {
    const { stdout } = await execAsync('npx edge-tts --list-voices');
    
    // Parse the output (JSON format)
    const lines = stdout.trim().split('\n');
    const voices: EdgeVoice[] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          // Edge TTS outputs JSON lines
          const voice = JSON.parse(line);
          voices.push({
            Name: voice.Name || voice.name,
            ShortName: voice.ShortName || voice.shortName,
            Gender: voice.Gender || voice.gender,
            Locale: voice.Locale || voice.locale,
          });
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }
    }
    
    return voices;
  } catch (error) {
    console.error('Error listing voices:', error);
    // Return default voices if listing fails
    return [
      { Name: 'Aria', ShortName: 'en-US-AriaNeural', Gender: 'Female', Locale: 'en-US' },
      { Name: 'Davis', ShortName: 'en-US-DavisNeural', Gender: 'Male', Locale: 'en-US' },
    ];
  }
}

/**
 * Get voices filtered by locale
 * @param locale - Locale code (e.g., 'en-US')
 * @returns Array of voices for the specified locale
 */
export async function getVoicesByLocale(locale: string = 'en-US'): Promise<EdgeVoice[]> {
  const allVoices = await listVoices();
  return allVoices.filter(voice => 
    (voice.Locale || '').toLowerCase().startsWith(locale.toLowerCase())
  );
}

/**
 * Find a voice by name or short name
 * @param searchTerm - Voice name or short name to search for
 * @returns Voice object or null if not found
 */
export async function findVoice(searchTerm: string): Promise<EdgeVoice | null> {
  const voices = await listVoices();
  const searchLower = searchTerm.toLowerCase();
  
  return voices.find(voice => 
    (voice.Name || '').toLowerCase().includes(searchLower) ||
    (voice.ShortName || '').toLowerCase().includes(searchLower)
  ) || null;
}

