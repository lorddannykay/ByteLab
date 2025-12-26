import { SearchProvider, SearchResult, SearchOptions } from './searchProvider';

/**
 * Open Web Search Provider
 * This is a fallback provider that can use various free search APIs
 * For now, we'll use DuckDuckGo HTML scraping as a free alternative
 * Note: This is a basic implementation and may need rate limiting
 */
export class OpenWebSearchProvider implements SearchProvider {
  isAvailable(): boolean {
    // Always available as a fallback
    return true;
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const maxResults = options.maxResults || 10;
    
    try {
      // Use DuckDuckGo Instant Answer API (free, no API key needed)
      const instantAnswerUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(instantAnswerUrl);
      if (!response.ok) {
        throw new Error(`DuckDuckGo API failed: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      // Extract from AbstractText if available
      if (data.AbstractText) {
        results.push({
          title: data.Heading || query,
          snippet: data.AbstractText,
          url: data.AbstractURL || '',
          relevanceScore: 0.9,
        });
      }

      // Extract from RelatedTopics if available
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        data.RelatedTopics.slice(0, maxResults - results.length).forEach((topic: any, index: number) => {
          if (topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || query,
              snippet: topic.Text,
              url: topic.FirstURL || '',
              relevanceScore: 0.8 - (index * 0.1),
            });
          }
        });
      }

      // If we have results, return them
      if (results.length > 0) {
        return results.slice(0, maxResults);
      }

      // Fallback: Use a simple web scraping approach for DuckDuckGo HTML
      // Note: This is a basic implementation and may break if DuckDuckGo changes their HTML
      const htmlUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const htmlResponse = await fetch(htmlUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        // Simple regex extraction (this is basic and may need improvement)
        const linkMatches = html.match(/<a class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g);
        const snippetMatches = html.match(/<a class="result__snippet"[^>]*>([^<]*)<\/a>/g);

        if (linkMatches && snippetMatches) {
          for (let i = 0; i < Math.min(linkMatches.length, snippetMatches.length, maxResults); i++) {
            const linkMatch = linkMatches[i].match(/href="([^"]*)"/);
            const titleMatch = linkMatches[i].match(/>([^<]*)</);
            const snippetMatch = snippetMatches[i].match(/>([^<]*)</);

            if (linkMatch && titleMatch && snippetMatch) {
              results.push({
                title: titleMatch[1],
                snippet: snippetMatch[1],
                url: linkMatch[1],
                relevanceScore: 0.7 - (i * 0.05),
              });
            }
          }
        }
      }

      return results.slice(0, maxResults);
    } catch (error) {
      console.error('Open Web Search error:', error);
      // Return empty results rather than throwing - graceful degradation
      return [];
    }
  }
}



