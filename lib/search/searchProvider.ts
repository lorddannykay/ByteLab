// Abstract search provider interface
export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  relevanceScore: number;
}

export interface SearchOptions {
  maxResults?: number;
  language?: string;
  safeSearch?: 'off' | 'medium' | 'high';
}

export interface SearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  isAvailable(): boolean;
}

