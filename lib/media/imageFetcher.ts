import { findRelevantImages } from './imageRelevanceEngine';
import { getUnifiedImageSearch, UnifiedMediaResult } from './unifiedImageSearch';

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  attribution: string;
  photographer: string;
  photographerUrl?: string;
  width: number;
  height: number;
  provider: 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'upload' | 'pexels-video';
  relevanceScore: number;
}

/**
 * Fetch the best matching image for content using the Unified Image Search and Relevance Engine
 */
export async function fetchImageForContent(
  content: string,
  heading?: string,
  provider: 'pexels' | 'unsplash' | 'both' = 'both'
): Promise<ImageResult | null> {
  // Use a default topic if not provided (could be improved by passing topic to this function)
  const courseTopic = 'Course Content';

  const unifiedSearch = getUnifiedImageSearch();

  // Adapter function to connect Relevance Engine with Unified Search
  const searchFn = async (query: string): Promise<any[]> => {
    try {
      // Map 'both' to 'all' or specific providers for UnifiedSearch
      let searchProvider: any = 'all';
      if (provider === 'pexels') searchProvider = 'pexels';
      if (provider === 'unsplash') searchProvider = 'unsplash';

      const results = await unifiedSearch.search(query, {
        provider: searchProvider,
        mediaType: 'image',
        maxResults: 15
      });

      // Map UnifiedMediaResult to format expected by scoreImageRelevance (alt, description, tags)
      return results.map(r => ({
        ...r,
        // Map available fields to what relevance engine looks for
        alt: r.title || r.attribution,
        description: r.title,
        tags: r.title ? r.title.split(' ') : [],
        photographer_location: '' // UnifiedResult currently doesn't carry this, could be added later
      }));
    } catch (error) {
      console.warn(`Unified search failed for query "${query}":`, error);
      return [];
    }
  };

  try {
    // findRelevantImages handles keyword extraction, query generation, searching, and ranking
    const relevantImages = await findRelevantImages(
      heading || '',
      content,
      courseTopic,
      searchFn,
      5 // Get top 5
    );

    if (relevantImages.length > 0) {
      const bestMatch = relevantImages[0] as UnifiedMediaResult & { relevanceScore: number };

      return {
        url: bestMatch.url,
        thumbnailUrl: bestMatch.thumbnailUrl,
        attribution: bestMatch.attribution,
        photographer: bestMatch.photographer || 'Unknown',
        photographerUrl: bestMatch.photographerUrl,
        width: bestMatch.width,
        height: bestMatch.height,
        provider: bestMatch.provider,
        relevanceScore: bestMatch.relevanceScore
      };
    }
  } catch (error) {
    console.error('Error in fetchImageForContent:', error);
  }

  return null;
}

/**
 * Fetch multiple images for different sections
 */
export async function fetchImagesForSections(
  sections: Array<{ heading: string; content: string }>,
  provider: 'pexels' | 'unsplash' | 'both' = 'both'
): Promise<Map<string, ImageResult | null>> {
  const imageMap = new Map<string, ImageResult | null>();

  // Fetch images in parallel (with rate limiting consideration handled by providers internally if needed)
  // We process them sequentially here to avoid hammering the API if many sections
  for (const section of sections) {
    try {
      // Small delay to be nice to APIs
      if (imageMap.size > 0) await new Promise(r => setTimeout(r, 200));

      const image = await fetchImageForContent(section.content, section.heading, provider);
      imageMap.set(section.heading, image);
    } catch (e) {
      console.error(`Failed to fetch image for section ${section.heading}`, e);
      imageMap.set(section.heading, null);
    }
  }

  return imageMap;
}


