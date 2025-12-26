
import { getProviderManager } from '@/lib/ai/providers';
import { ChatMessage } from '@/lib/ai/providers/types';

export interface SmartImageQuery {
  provider: 'google' | 'pexels' | 'unsplash' | 'giphy';
  query: string;
  usage: 'hero' | 'illustration' | 'background' | 'icon';
}

export interface SmartImageSelectionResult {
  visualType: 'photo' | 'illustration' | 'diagram' | 'icon';
  queries: SmartImageQuery[];
  reasoning: string;
}

/**
 * Generate smart search queries for images using LLM
 */
export async function generateSmartImageQueries(
  content: string,
  heading?: string,
  courseContext?: string
): Promise<SmartImageSelectionResult> {
  const providerManager = getProviderManager();
  const provider = providerManager.getProvider(providerManager.getDefaultProvider());

  if (!provider) {
    // Fallback if no provider available
    console.warn('No AI provider available for smart image selection');
    return generateFallbackQueries(content, heading);
  }

  const prompt = `
    You are an expert Visual Director for an educational content platform.
    Your task is to analyze a section of a course and determine the best visual to accompany it.
    
    Course Context: ${courseContext || 'General education'}
    
    Section Heading: ${heading || 'Untitled'}
    Section Content: ${content.substring(0, 500)}... (truncated)

    1. Determine the best "Visual Type" (Photo, Illustration, Diagram, Icon).
    2. Create specific search queries for different providers.
       - Pexels/Unsplash: Needs artistic, high-quality photography terms. Abstract concepts work well.
       - Google: Good for diagrams, specific entities, data charts.
    3. The query should be descriptive but keyword-rich.
    
    Output JSON format:
    {
      "visualType": "photo" | "illustration" | "diagram" | "icon",
      "queries": [
        { "provider": "pexels", "query": "search term", "usage": "hero" },
        { "provider": "google", "query": "search term", "usage": "illustration" }
      ],
      "reasoning": "Explain why this visual fits the content."
    }
  `;

  const messages: ChatMessage[] = [
    { role: 'system', content: 'You are a JSON-only API for visual content direction.' },
    { role: 'user', content: prompt }
  ];

  try {
    const result = await provider.generateJSON<SmartImageSelectionResult>(messages, {
      responseFormat: 'json_object',
      retries: 2
    });
    return result;
  } catch (error) {
    console.error('Smart image selection failed:', error);
    return generateFallbackQueries(content, heading);
  }
}

function generateFallbackQueries(content: string, heading?: string): SmartImageSelectionResult {
  const keywords = extractKeywords(content, heading);
  const query = keywords.slice(0, 3).join(' ');
  return {
    visualType: 'photo',
    queries: [
      { provider: 'pexels', query, usage: 'illustration' },
      { provider: 'unsplash', query, usage: 'illustration' },
      { provider: 'google', query, usage: 'illustration' }
    ],
    reasoning: 'Fallback keyword extraction'
  };
}

function extractKeywords(content: string, heading?: string): string[] {
    const fullText = `${heading || ''} ${content}`.toLowerCase();
    const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'with', 'and', 'but', 'is', 'are']);
    return fullText
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w));
}
