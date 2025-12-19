import { getRateLimiter } from '../search/rateLimiter';

export interface ImageSearchResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  title?: string;
  contextUrl?: string; // URL of the page containing the image
}

export interface ImageSearchOptions {
  maxResults?: number;
  safeSearch?: 'active' | 'off';
  imageSize?: 'huge' | 'icon' | 'large' | 'medium' | 'small' | 'xlarge' | 'xxlarge';
  imageType?: 'clipart' | 'face' | 'lineart' | 'stock' | 'photo' | 'animated';
}

export class GoogleImageSearch {
  private apiKey: string | undefined;
  private searchEngineId: string | undefined;
  private rateLimiter = getRateLimiter();

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  }

  isAvailable(): boolean {
    return !!(this.apiKey && this.searchEngineId);
  }

  async search(query: string, options: ImageSearchOptions = {}): Promise<ImageSearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Image Search API is not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID');
    }

    // Check rate limits
    const rateLimitCheck = this.rateLimiter.canMakeQuery();
    if (!rateLimitCheck.allowed) {
      console.warn(`Google Image Search rate limit exceeded: ${rateLimitCheck.reason}`);
      throw new Error(`Rate limit exceeded: ${rateLimitCheck.reason}. Retry after ${rateLimitCheck.retryAfter}s`);
    }

    const maxResults = options.maxResults || 10;
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.apiKey!);
    url.searchParams.set('cx', this.searchEngineId!);
    url.searchParams.set('q', query);
    url.searchParams.set('searchType', 'image'); // This is the key parameter for image search
    url.searchParams.set('num', Math.min(maxResults, 10).toString()); // Google limits to 10 per request

    // Add optional parameters
    if (options.safeSearch) {
      url.searchParams.set('safe', options.safeSearch);
    }
    if (options.imageSize) {
      url.searchParams.set('imgSize', options.imageSize);
    }
    if (options.imageType) {
      url.searchParams.set('imgType', options.imageType);
    }

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Image Search API error:', errorText);
        
        // Check for quota exceeded errors
        if (response.status === 429 || response.status === 403) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('Quota')) {
              console.error('Google Image Search API quota exceeded');
              throw new Error('Google Image Search API quota exceeded. Please check your usage limits.');
            }
          } catch {
            // If we can't parse the error, still throw with status
          }
          
          if (response.status === 429) {
            throw new Error('Google Image Search API rate limit exceeded. Please try again later.');
          }
        }
        
        throw new Error(`Google Image Search API failed: ${response.status}`);
      }

      const data = await response.json();

      // Record successful query
      this.rateLimiter.recordQuery(query);

      if (!data.items || !Array.isArray(data.items)) {
        return [];
      }

      return data.items.map((item: any) => ({
        url: item.link || '', // Full-size image URL
        thumbnailUrl: item.image?.thumbnailLink || item.link || '', // Thumbnail URL
        width: item.image?.width || 0,
        height: item.image?.height || 0,
        title: item.title || '',
        contextUrl: item.image?.contextLink || item.displayLink || '', // Page URL
      }));
    } catch (error) {
      // Only record query if it's not a rate limit error
      if (!(error instanceof Error && error.message.includes('rate limit'))) {
        this.rateLimiter.recordQuery(query);
      }
      console.error('Google Image Search error:', error);
      throw error;
    }
  }
}

// Singleton instance
let googleImageSearchInstance: GoogleImageSearch | null = null;

export function getGoogleImageSearch(): GoogleImageSearch {
  if (!googleImageSearchInstance) {
    googleImageSearchInstance = new GoogleImageSearch();
  }
  return googleImageSearchInstance;
}

