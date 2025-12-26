export interface ImageSearchResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  title?: string;
  contextUrl?: string;
}

export interface ImageSearchOptions {
  maxResults?: number;
}

export class DuckDuckGoImageSearch {
  isAvailable(): boolean {
    // DuckDuckGo doesn't require API keys, so it's always available
    return true;
  }

  async search(query: string, options: ImageSearchOptions = {}): Promise<ImageSearchResult[]> {
    const maxResults = options.maxResults || 20;
    
    try {
      // DuckDuckGo image search using their HTML interface
      // We'll use a simple approach to get image results
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
      
      // Since DuckDuckGo doesn't have a public API, we'll use their vqd token approach
      // First, get the vqd token
      const vqdResponse = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!vqdResponse.ok) {
        throw new Error('Failed to fetch DuckDuckGo search page');
      }

      const html = await vqdResponse.text();
      
      // Extract vqd token from the HTML
      const vqdMatch = html.match(/vqd="([^"]+)"/);
      if (!vqdMatch) {
        // Fallback: try to extract images directly from the HTML
        return this.extractImagesFromHTML(html, maxResults);
      }

      const vqd = vqdMatch[1];
      
      // Use DuckDuckGo's image search API endpoint
      const apiUrl = `https://duckduckgo.com/i.js?q=${encodeURIComponent(query)}&vqd=${vqd}&o=json&p=1&s=0`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://duckduckgo.com/',
        },
      });

      if (!response.ok) {
        // Fallback to HTML parsing
        return this.extractImagesFromHTML(html, maxResults);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.slice(0, maxResults).map((item: any) => ({
        url: item.image || item.url || '',
        thumbnailUrl: item.thumbnail || item.image || '',
        width: item.width || 0,
        height: item.height || 0,
        title: item.title || '',
        contextUrl: item.url || '',
      }));
    } catch (error) {
      console.error('DuckDuckGo Image Search error:', error);
      // Return empty array on error (graceful fallback)
      return [];
    }
  }

  private extractImagesFromHTML(html: string, maxResults: number): ImageSearchResult[] {
    const results: ImageSearchResult[] = [];
    
    try {
      // Try to extract image URLs from the HTML
      // DuckDuckGo embeds image data in script tags or data attributes
      const imagePattern = /"image":"([^"]+)"/g;
      const thumbnailPattern = /"thumbnail":"([^"]+)"/g;
      const titlePattern = /"title":"([^"]+)"/g;
      
      let match;
      const images: string[] = [];
      const thumbnails: string[] = [];
      const titles: string[] = [];
      
      while ((match = imagePattern.exec(html)) !== null && images.length < maxResults) {
        images.push(match[1]);
      }
      
      while ((match = thumbnailPattern.exec(html)) !== null && thumbnails.length < maxResults) {
        thumbnails.push(match[1]);
      }
      
      while ((match = titlePattern.exec(html)) !== null && titles.length < maxResults) {
        titles.push(match[1]);
      }
      
      const count = Math.min(images.length, maxResults);
      for (let i = 0; i < count; i++) {
        results.push({
          url: images[i] || '',
          thumbnailUrl: thumbnails[i] || images[i] || '',
          width: 0,
          height: 0,
          title: titles[i] || '',
          contextUrl: '',
        });
      }
    } catch (error) {
      console.error('Error extracting images from HTML:', error);
    }
    
    return results;
  }
}

// Singleton instance
let duckDuckGoImageSearchInstance: DuckDuckGoImageSearch | null = null;

export function getDuckDuckGoImageSearch(): DuckDuckGoImageSearch {
  if (!duckDuckGoImageSearchInstance) {
    duckDuckGoImageSearchInstance = new DuckDuckGoImageSearch();
  }
  return duckDuckGoImageSearchInstance;
}



