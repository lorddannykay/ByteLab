export interface GifSearchResult {
  url: string; // Full-size animated GIF URL
  thumbnailUrl: string; // Preview/thumbnail URL
  width: number;
  height: number;
  title?: string;
  giphyUrl?: string; // Link to Giphy page
}

export interface GifSearchOptions {
  maxResults?: number;
  rating?: 'g' | 'pg' | 'pg-13' | 'r';
  lang?: string;
}

export class GiphySearch {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GIPHY_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async search(query: string, options: GifSearchOptions = {}): Promise<GifSearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Giphy API is not configured. Please set GIPHY_API_KEY');
    }

    const maxResults = options.maxResults || 20;
    const rating = options.rating || 'g';
    const lang = options.lang || 'en';

    try {
      const url = new URL('https://api.giphy.com/v1/gifs/search');
      url.searchParams.set('api_key', this.apiKey!);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', Math.min(maxResults, 50).toString()); // Giphy allows up to 50
      url.searchParams.set('rating', rating);
      url.searchParams.set('lang', lang);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Giphy API error:', errorText);
        throw new Error(`Giphy API failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((gif: any) => ({
        url: gif.images?.original?.url || gif.images?.downsized?.url || '',
        thumbnailUrl: gif.images?.preview_gif?.url || gif.images?.fixed_height_small?.url || gif.images?.downsized_small?.url || '',
        width: parseInt(gif.images?.original?.width || gif.images?.downsized?.width || '0'),
        height: parseInt(gif.images?.original?.height || gif.images?.downsized?.height || '0'),
        title: gif.title || '',
        giphyUrl: gif.url || '',
      }));
    } catch (error) {
      console.error('Giphy search error:', error);
      throw error;
    }
  }

  /**
   * Get trending GIFs
   */
  async getTrending(options: GifSearchOptions = {}): Promise<GifSearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Giphy API is not configured. Please set GIPHY_API_KEY');
    }

    const maxResults = options.maxResults || 20;
    const rating = options.rating || 'g';

    try {
      const url = new URL('https://api.giphy.com/v1/gifs/trending');
      url.searchParams.set('api_key', this.apiKey!);
      url.searchParams.set('limit', Math.min(maxResults, 50).toString());
      url.searchParams.set('rating', rating);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Giphy API failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((gif: any) => ({
        url: gif.images?.original?.url || gif.images?.downsized?.url || '',
        thumbnailUrl: gif.images?.preview_gif?.url || gif.images?.fixed_height_small?.url || '',
        width: parseInt(gif.images?.original?.width || '0'),
        height: parseInt(gif.images?.original?.height || '0'),
        title: gif.title || '',
        giphyUrl: gif.url || '',
      }));
    } catch (error) {
      console.error('Giphy trending error:', error);
      throw error;
    }
  }
}

// Singleton instance
let giphySearchInstance: GiphySearch | null = null;

export function getGiphySearch(): GiphySearch {
  if (!giphySearchInstance) {
    giphySearchInstance = new GiphySearch();
  }
  return giphySearchInstance;
}

