import { getGoogleImageSearch, ImageSearchResult as GoogleImageResult } from './googleImageSearch';
import { getDuckDuckGoImageSearch, ImageSearchResult as DuckDuckGoImageResult } from './duckDuckGoImageSearch';
import { getGiphySearch, GifSearchResult } from './giphySearch';
import { getVideoLoopSearch, VideoLoopSearchResult } from './videoLoopSearch';

export type MediaProvider = 'all' | 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'video';
export type MediaType = 'image' | 'gif' | 'video-loop';

export interface UnifiedMediaResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  attribution: string;
  photographer?: string;
  photographerUrl?: string;
  provider: 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'upload' | 'pexels-video';
  mediaType: MediaType;
  title?: string;
  contextUrl?: string;
  loop?: boolean;
  autoplay?: boolean;
  duration?: number;
  relevanceScore?: number;
}

export interface UnifiedSearchOptions {
  maxResults?: number;
  provider?: MediaProvider;
  mediaType?: MediaType | 'all';
}

export class UnifiedImageSearch {
  async search(query: string, options: UnifiedSearchOptions = {}): Promise<UnifiedMediaResult[]> {
    const maxResults = options.maxResults || 30;
    const provider = options.provider || 'all';
    const mediaType = options.mediaType || 'all';

    const allResults: UnifiedMediaResult[] = [];

    // Search based on provider selection
    if (provider === 'all' || provider === 'google') {
      try {
        const googleSearch = getGoogleImageSearch();
        if (googleSearch.isAvailable() && (mediaType === 'all' || mediaType === 'image')) {
          const results = await googleSearch.search(query, { maxResults: 10 });
          allResults.push(...this.transformGoogleResults(results));
        }
      } catch (error) {
        console.warn('Google image search failed:', error);
      }
    }

    if (provider === 'all' || provider === 'duckduckgo') {
      try {
        const duckDuckGoSearch = getDuckDuckGoImageSearch();
        if (duckDuckGoSearch.isAvailable() && (mediaType === 'all' || mediaType === 'image')) {
          const results = await duckDuckGoSearch.search(query, { maxResults: 10 });
          allResults.push(...this.transformDuckDuckGoResults(results));
        }
      } catch (error) {
        console.warn('DuckDuckGo image search failed:', error);
      }
    }

    if (provider === 'all' || provider === 'giphy') {
      try {
        const giphySearch = getGiphySearch();
        if (giphySearch.isAvailable() && (mediaType === 'all' || mediaType === 'gif')) {
          const results = await giphySearch.search(query, { maxResults: 10 });
          allResults.push(...this.transformGiphyResults(results));
        }
      } catch (error) {
        console.warn('Giphy search failed:', error);
      }
    }

    if (provider === 'all' || provider === 'video') {
      try {
        const videoSearch = getVideoLoopSearch();
        if (videoSearch.isAvailable() && (mediaType === 'all' || mediaType === 'video-loop')) {
          const results = await videoSearch.search(query, { maxResults: 10 });
          allResults.push(...this.transformVideoResults(results));
        }
      } catch (error) {
        console.warn('Video loop search failed:', error);
      }
    }

    // Note: Pexels and Unsplash are handled separately via existing endpoints
    // They can be added here if needed, or kept separate for backward compatibility

    // Filter by media type if specified
    let filteredResults = allResults;
    if (mediaType !== 'all') {
      filteredResults = allResults.filter(r => r.mediaType === mediaType);
    }

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const uniqueResults = filteredResults.filter(result => {
      if (seenUrls.has(result.url)) {
        return false;
      }
      seenUrls.add(result.url);
      return true;
    });

    // Sort by relevance score (if available) or provider priority
    uniqueResults.sort((a, b) => {
      const scoreA = a.relevanceScore || this.getProviderPriority(a.provider);
      const scoreB = b.relevanceScore || this.getProviderPriority(b.provider);
      return scoreB - scoreA;
    });

    return uniqueResults.slice(0, maxResults);
  }

  private transformGoogleResults(results: GoogleImageResult[]): UnifiedMediaResult[] {
    return results.map((result, index) => ({
      id: `google-${Date.now()}-${index}`,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      width: result.width,
      height: result.height,
      attribution: result.title || 'Image from Google',
      provider: 'google' as const,
      mediaType: 'image' as const,
      title: result.title,
      contextUrl: result.contextUrl,
      relevanceScore: 1 - (index / results.length),
    }));
  }

  private transformDuckDuckGoResults(results: DuckDuckGoImageResult[]): UnifiedMediaResult[] {
    return results.map((result, index) => ({
      id: `duckduckgo-${Date.now()}-${index}`,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      width: result.width,
      height: result.height,
      attribution: result.title || 'Image from DuckDuckGo',
      provider: 'duckduckgo' as const,
      mediaType: 'image' as const,
      title: result.title,
      contextUrl: result.contextUrl,
      relevanceScore: 0.8 - (index / results.length) * 0.2,
    }));
  }

  private transformGiphyResults(results: GifSearchResult[]): UnifiedMediaResult[] {
    return results.map((result, index) => ({
      id: `giphy-${Date.now()}-${index}`,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      width: result.width,
      height: result.height,
      attribution: result.title || 'GIF from Giphy',
      provider: 'giphy' as const,
      mediaType: 'gif' as const,
      title: result.title,
      contextUrl: result.giphyUrl,
      relevanceScore: 0.9 - (index / results.length) * 0.1,
    }));
  }

  private transformVideoResults(results: VideoLoopSearchResult[]): UnifiedMediaResult[] {
    return results.map((result, index) => ({
      id: `video-${Date.now()}-${index}`,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl || result.url,
      width: result.width,
      height: result.height,
      attribution: result.title || 'Video from Pexels',
      provider: 'pexels-video' as const,
      mediaType: 'video-loop' as const,
      title: result.title,
      loop: true,
      autoplay: true,
      duration: result.duration,
      relevanceScore: 0.85 - (index / results.length) * 0.15,
    }));
  }

  private getProviderPriority(provider: string): number {
    // Priority order: Google > Giphy > DuckDuckGo > Pexels Video
    const priorities: Record<string, number> = {
      'google': 1.0,
      'giphy': 0.9,
      'duckduckgo': 0.8,
      'pexels-video': 0.7,
      'pexels': 0.6,
      'unsplash': 0.6,
      'upload': 0.5,
    };
    return priorities[provider] || 0.5;
  }
}

// Singleton instance
let unifiedImageSearchInstance: UnifiedImageSearch | null = null;

export function getUnifiedImageSearch(): UnifiedImageSearch {
  if (!unifiedImageSearchInstance) {
    unifiedImageSearchInstance = new UnifiedImageSearch();
  }
  return unifiedImageSearchInstance;
}



