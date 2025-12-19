import { SearchProvider, SearchResult, SearchOptions } from './searchProvider';
import { GoogleSearchProvider } from './googleSearchProvider';
import { OpenWebSearchProvider } from './openWebSearchProvider';

// Simple in-memory cache for search results
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class SearchService {
  private providers: SearchProvider[];
  private cacheEnabled: boolean;

  constructor(cacheEnabled: boolean = true) {
    this.cacheEnabled = cacheEnabled;
    this.providers = [
      new GoogleSearchProvider(),
      new OpenWebSearchProvider(), // Always available as fallback
    ];
  }

  /**
   * Search using available providers with fallback
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    // Check cache first
    if (this.cacheEnabled) {
      const cacheKey = `${query}_${JSON.stringify(options)}`;
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.results;
      }
    }

    // Try providers in order
    for (const provider of this.providers) {
      if (provider.isAvailable()) {
        try {
          const results = await provider.search(query, options);
          
          // Cache results
          if (this.cacheEnabled && results.length > 0) {
            const cacheKey = `${query}_${JSON.stringify(options)}`;
            searchCache.set(cacheKey, {
              results,
              timestamp: Date.now(),
            });
          }

          return results;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // If it's a rate limit/quota error, log it but continue to fallback
          if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('Rate limit')) {
            console.warn(`Search provider ${provider.constructor.name} rate limited, trying fallback:`, errorMessage);
            // Continue to next provider (fallback)
            continue;
          }
          
          console.warn(`Search provider ${provider.constructor.name} failed:`, errorMessage);
          // Continue to next provider
          continue;
        }
      }
    }

    // If all providers fail, return empty results
    console.warn('All search providers failed, returning empty results');
    return [];
  }

  /**
   * Clear the search cache
   */
  clearCache(): void {
    searchCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    return {
      size: searchCache.size,
      entries: searchCache.size,
    };
  }
}

// Singleton instance
let searchServiceInstance: SearchService | null = null;

export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
}

