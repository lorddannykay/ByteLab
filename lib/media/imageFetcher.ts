import { extractImageKeywords, generateImageSearchQuery, scoreImageRelevance } from './imageSelector';

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  attribution: string;
  photographer: string;
  photographerUrl?: string;
  width: number;
  height: number;
  provider: 'pexels' | 'unsplash';
  relevanceScore: number;
}

/**
 * Fetch image from Pexels
 */
async function fetchFromPexels(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&page=1`;
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      console.warn('Pexels API error:', response.status);
      return [];
    }

    const data = await response.json();
    const images: ImageResult[] = [];

    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((photo: any) => {
        images.push({
          url: photo.src?.large || photo.src?.original || '',
          thumbnailUrl: photo.src?.medium || photo.src?.small || '',
          attribution: `Photo by ${photo.photographer || 'Unknown'} from Pexels`,
          photographer: photo.photographer || 'Unknown',
          photographerUrl: photo.photographer_url || '',
          width: photo.width || 0,
          height: photo.height || 0,
          provider: 'pexels',
          relevanceScore: 0.8, // Default score, will be refined by selector
        });
      });
    }

    return images;
  } catch (error) {
    console.error('Pexels fetch error:', error);
    return [];
  }
}

/**
 * Fetch image from Unsplash
 */
async function fetchFromUnsplash(query: string): Promise<ImageResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return [];
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&page=1`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      console.warn('Unsplash API error:', response.status);
      return [];
    }

    const data = await response.json();
    const images: ImageResult[] = [];

    if (data.results && Array.isArray(data.results)) {
      data.results.forEach((photo: any) => {
        images.push({
          url: photo.urls?.regular || photo.urls?.full || '',
          thumbnailUrl: photo.urls?.thumb || photo.urls?.small || '',
          attribution: `Photo by ${photo.user?.name || 'Unknown'} on Unsplash`,
          photographer: photo.user?.name || 'Unknown',
          photographerUrl: photo.user?.links?.html || '',
          width: photo.width || 0,
          height: photo.height || 0,
          provider: 'unsplash',
          relevanceScore: 0.8, // Default score, will be refined by selector
        });
      });
    }

    return images;
  } catch (error) {
    console.error('Unsplash fetch error:', error);
    return [];
  }
}

/**
 * Fetch the best matching image for content
 */
export async function fetchImageForContent(
  content: string,
  heading?: string,
  provider: 'pexels' | 'unsplash' | 'both' = 'both'
): Promise<ImageResult | null> {
  // Extract keywords
  const keywords = extractImageKeywords(content, heading);
  if (keywords.length === 0) {
    return null;
  }

  // Generate search query
  const searchQuery = generateImageSearchQuery(keywords);

  // Fetch from providers with error handling
  const allImages: ImageResult[] = [];

  try {
    if (provider === 'pexels' || provider === 'both') {
      try {
        const pexelsImages = await fetchFromPexels(searchQuery);
        // Score images by relevance
        pexelsImages.forEach(img => {
          img.relevanceScore = scoreImageRelevance(
            img.attribution,
            searchQuery,
            keywords
          );
        });
        allImages.push(...pexelsImages);
      } catch (error) {
        console.warn('Pexels fetch failed, trying Unsplash:', error);
        // Continue to try Unsplash
      }
    }

    if (provider === 'unsplash' || provider === 'both') {
      try {
        const unsplashImages = await fetchFromUnsplash(searchQuery);
        // Score images by relevance
        unsplashImages.forEach(img => {
          img.relevanceScore = scoreImageRelevance(
            img.attribution,
            searchQuery,
            keywords
          );
        });
        allImages.push(...unsplashImages);
      } catch (error) {
        console.warn('Unsplash fetch failed:', error);
        // Continue with whatever we have
      }
    }
  } catch (error) {
    console.error('Image fetching error:', error);
    return null;
  }

  if (allImages.length === 0) {
    return null;
  }

  // Sort by relevance score and return the best match
  allImages.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return allImages[0];
}

/**
 * Fetch multiple images for different sections
 */
export async function fetchImagesForSections(
  sections: Array<{ heading: string; content: string }>,
  provider: 'pexels' | 'unsplash' | 'both' = 'both'
): Promise<Map<string, ImageResult | null>> {
  const imageMap = new Map<string, ImageResult | null>();

  // Fetch images in parallel (with rate limiting consideration)
  const promises = sections.map(async (section) => {
    const image = await fetchImageForContent(section.content, section.heading, provider);
    return { heading: section.heading, image };
  });

  const results = await Promise.all(promises);
  results.forEach(({ heading, image }) => {
    imageMap.set(heading, image);
  });

  return imageMap;
}

