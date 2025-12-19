export interface VideoLoopSearchResult {
  url: string; // Video URL
  thumbnailUrl: string; // Video thumbnail/preview
  width: number;
  height: number;
  duration?: number; // Duration in seconds
  title?: string;
  provider?: string;
}

export interface VideoLoopSearchOptions {
  maxResults?: number;
  maxDuration?: number; // Maximum duration in seconds (default 30)
}

export class VideoLoopSearch {
  private pexelsApiKey: string | undefined;

  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
  }

  isAvailable(): boolean {
    return !!this.pexelsApiKey;
  }

  async search(query: string, options: VideoLoopSearchOptions = {}): Promise<VideoLoopSearchResult[]> {
    if (!this.isAvailable()) {
      throw new Error('Pexels API is not configured. Please set PEXELS_API_KEY');
    }

    const maxResults = options.maxResults || 20;
    const maxDuration = options.maxDuration || 30; // Default 30 seconds for loops

    try {
      // Search Pexels videos
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${Math.min(maxResults, 15)}&page=1`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': this.pexelsApiKey!,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pexels Video API error:', errorText);
        throw new Error(`Pexels Video API failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.videos || !Array.isArray(data.videos)) {
        return [];
      }

      // Filter videos by duration and transform to our format
      const results: VideoLoopSearchResult[] = [];

      for (const video of data.videos) {
        const duration = video.duration || 0;
        
        // Only include videos that are short enough for looping
        if (duration <= maxDuration) {
          // Get the best quality video file
          const videoFiles = video.video_files || [];
          const bestVideo = videoFiles
            .filter((f: any) => f.width && f.height) // Has dimensions
            .sort((a: any, b: any) => {
              // Prefer MP4, then by file size (smaller is better for loops)
              if (a.file_type === 'video/mp4' && b.file_type !== 'video/mp4') return -1;
              if (b.file_type === 'video/mp4' && a.file_type !== 'video/mp4') return 1;
              return (a.width * a.height) - (b.width * b.height);
            })[0] || videoFiles[0];

          // Get thumbnail
          const thumbnail = video.image || video.pictures?.[0]?.picture || '';

          if (bestVideo?.link) {
            results.push({
              url: bestVideo.link,
              thumbnailUrl: thumbnail,
              width: bestVideo.width || video.width || 0,
              height: bestVideo.height || video.height || 0,
              duration: duration,
              title: video.user?.name ? `Video by ${video.user.name}` : '',
              provider: 'pexels',
            });
          }
        }

        if (results.length >= maxResults) {
          break;
        }
      }

      return results;
    } catch (error) {
      console.error('Video Loop Search error:', error);
      throw error;
    }
  }

  /**
   * Search for popular/trending short videos
   */
  async getPopular(options: VideoLoopSearchOptions = {}): Promise<VideoLoopSearchResult[]> {
    // Use common search terms that typically return short videos
    const popularTerms = ['nature', 'abstract', 'background', 'motion', 'loop'];
    const allResults: VideoLoopSearchResult[] = [];

    for (const term of popularTerms) {
      try {
        const results = await this.search(term, { ...options, maxResults: 5 });
        allResults.push(...results);
        
        if (allResults.length >= (options.maxResults || 20)) {
          break;
        }
      } catch (error) {
        console.error(`Error searching for ${term}:`, error);
      }
    }

    // Shuffle and limit
    const shuffled = allResults.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, options.maxResults || 20);
  }
}

// Singleton instance
let videoLoopSearchInstance: VideoLoopSearch | null = null;

export function getVideoLoopSearch(): VideoLoopSearch {
  if (!videoLoopSearchInstance) {
    videoLoopSearchInstance = new VideoLoopSearch();
  }
  return videoLoopSearchInstance;
}

