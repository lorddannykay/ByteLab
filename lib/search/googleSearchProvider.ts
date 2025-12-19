import { SearchProvider, SearchResult, SearchOptions } from './searchProvider';
import { getRateLimiter } from './rateLimiter';

export class GoogleSearchProvider implements SearchProvider {
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

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Google Search API is not configured. Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID');
    }

    // Check rate limits
    const rateLimitCheck = this.rateLimiter.canMakeQuery();
    if (!rateLimitCheck.allowed) {
      console.warn(`Google Search rate limit exceeded: ${rateLimitCheck.reason}`);
      throw new Error(`Rate limit exceeded: ${rateLimitCheck.reason}. Retry after ${rateLimitCheck.retryAfter}s`);
    }

    const maxResults = options.maxResults || 10;
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.apiKey!);
    url.searchParams.set('cx', this.searchEngineId!);
    url.searchParams.set('q', query);
    url.searchParams.set('num', Math.min(maxResults, 10).toString()); // Google limits to 10 per request

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Search API error:', errorText);
        
        // Check for quota exceeded errors
        if (response.status === 429 || response.status === 403) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message?.includes('quota') || errorData.error?.message?.includes('Quota')) {
              console.error('Google Search API quota exceeded');
              throw new Error('Google Search API quota exceeded. Please check your usage limits.');
            }
          } catch {
            // If we can't parse the error, still throw with status
          }
          
          if (response.status === 429) {
            throw new Error('Google Search API rate limit exceeded. Please try again later.');
          }
        }
        
        throw new Error(`Google Search API failed: ${response.status}`);
      }

      const data = await response.json();

      // Record successful query
      this.rateLimiter.recordQuery(query);

      if (!data.items || !Array.isArray(data.items)) {
        return [];
      }

      return data.items.map((item: any, index: number) => ({
        title: item.title || '',
        snippet: item.snippet || '',
        url: item.link || '',
        relevanceScore: 1 - (index / data.items.length), // Higher score for earlier results
      }));
    } catch (error) {
      // Only record query if it's not a rate limit error (to avoid double counting)
      if (!(error instanceof Error && error.message.includes('rate limit'))) {
        this.rateLimiter.recordQuery(query);
      }
      console.error('Google Search error:', error);
      throw error;
    }
  }

  /**
   * Get current API usage statistics
   */
  getUsageStats() {
    return this.rateLimiter.getUsage();
  }
}

