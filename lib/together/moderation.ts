import { together, MODELS } from './client';
import { chatCompletion } from './chat';

export interface ModerationResult {
  safe: boolean;
  categories?: {
    violence?: number;
    hate?: number;
    harassment?: number;
    self_harm?: number;
    sexual?: number;
    spam?: number;
    illegal_activity?: number;
  };
  reason?: string;
}

export async function moderateContent(
  text: string
): Promise<ModerationResult> {
  try {
    const result = await chatCompletion(
      [
        {
          role: 'user',
          content: text,
        },
      ],
      {
        model: MODELS.MODERATION,
        temperature: 0,
        maxTokens: 100,
      }
    );

    // Llama Guard returns "SAFE" or "UNSAFE" followed by categories
    const isSafe = result.trim().toUpperCase().startsWith('SAFE');
    
    return {
      safe: isSafe,
      reason: result,
    };
  } catch (error) {
    console.error('Error in content moderation:', error);
    // Default to safe if moderation fails
    return {
      safe: true,
      reason: 'Moderation check failed, defaulting to safe',
    };
  }
}

