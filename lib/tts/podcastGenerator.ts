/**
 * Podcast Generator
 * Utilities for generating multi-speaker podcast audio
 */

import { TTSProvider } from './types';
import { DialogueSegment } from '@/types/course';

export interface PodcastAudioSegment {
  speaker: 'host' | 'expert';
  text: string;
  audioBuffer: Buffer;
  duration?: number;
}

/**
 * Generate audio for all podcast dialogue segments
 * @param dialogue - Array of dialogue segments
 * @param ttsProvider - TTS provider instance
 * @param voices - Voice configuration
 * @returns Array of audio segments with buffers
 */
export async function generatePodcastAudioSegments(
  dialogue: DialogueSegment[],
  ttsProvider: TTSProvider,
  voices: { podcastHost: string; podcastExpert: string }
): Promise<PodcastAudioSegment[]> {
  const segments: PodcastAudioSegment[] = [];

  for (const segment of dialogue) {
    if (!segment.text || !segment.text.trim()) {
      continue;
    }

    try {
      const voice = segment.speaker === 'host' ? voices.podcastHost : voices.podcastExpert;
      const audioBuffer = await ttsProvider.generateAudio(segment.text, voice);
      
      segments.push({
        speaker: segment.speaker,
        text: segment.text,
        audioBuffer,
      });
    } catch (error) {
      console.warn(`Failed to generate audio for podcast segment (${segment.speaker}):`, error);
      // Continue without this segment
    }
  }

  return segments;
}

/**
 * Note: Full audio concatenation into a single MP3 file requires ffmpeg or similar tools.
 * For now, individual segments are generated and the HTML player handles sequential playback.
 * 
 * To create a single podcast.mp3 file, you would need to:
 * 1. Use ffmpeg to concatenate all segment files
 * 2. Or use a Node.js audio library like node-ffmpeg or fluent-ffmpeg
 * 
 * Example ffmpeg command:
 * ffmpeg -i "concat:segment1.mp3|segment2.mp3|segment3.mp3" -c copy podcast.mp3
 */

