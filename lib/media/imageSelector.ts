/**
 * Extract keywords from content for image search
 */
export function extractImageKeywords(content: string, heading?: string): string[] {
  // Combine heading and content
  const fullText = `${heading || ''} ${content}`.toLowerCase();
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this',
    'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
  ]);

  // Extract meaningful words (3+ characters, not stop words)
  const words = fullText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));

  // Count word frequency
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  const sortedWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return sortedWords;
}

/**
 * Generate search query from keywords
 */
export function generateImageSearchQuery(keywords: string[]): string {
  // Combine top 3 keywords for better results
  return keywords.slice(0, 3).join(' ');
}

/**
 * Score image relevance based on keywords
 */
export function scoreImageRelevance(
  imageTitle: string,
  imageDescription: string,
  keywords: string[]
): number {
  const text = `${imageTitle} ${imageDescription}`.toLowerCase();
  let score = 0;
  let matches = 0;

  keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      matches++;
      score += 1;
    }
  });

  // Normalize score (0-1)
  return keywords.length > 0 ? Math.min(score / keywords.length, 1) : 0.5;
}



