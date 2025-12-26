/**
 * Intelligent Image Relevance Engine
 * Provides smart image search with geographic awareness and context-based relevance scoring
 */

/**
 * Geographic context mapping for better image search
 */
const GEOGRAPHIC_CONTEXT: Record<string, { primary: string; alternatives: string[]; region: string }> = {
    // India
    'bombay': { primary: 'Mumbai', alternatives: ['Mumbai India', 'Maharashtra', 'Bombay India', 'Mumbai marine life', 'Bombay marine life', 'Arabian Sea', 'Mumbai coast', 'Mumbai Bay', 'Bombay Bay', 'Mumbai harbor', 'Bombay harbor'], region: 'India' },
    'mumbai': { primary: 'Mumbai', alternatives: ['Mumbai India', 'Maharashtra', 'Bombay India', 'Mumbai marine life', 'Arabian Sea', 'Mumbai coast', 'Mumbai Bay', 'Bombay Bay', 'Mumbai harbor', 'Bombay harbor'], region: 'India' },
    'calcutta': { primary: 'Kolkata', alternatives: ['Kolkata India', 'West Bengal'], region: 'India' },
    'kolkata': { primary: 'Kolkata', alternatives: ['Kolkata India', 'West Bengal'], region: 'India' },
    'madras': { primary: 'Chennai', alternatives: ['Chennai India', 'Tamil Nadu'], region: 'India' },
    'chennai': { primary: 'Chennai', alternatives: ['Chennai India', 'Tamil Nadu'], region: 'India' },
    'bangalore': { primary: 'Bengaluru', alternatives: ['Bengaluru India', 'Karnataka'], region: 'India' },
    'bengaluru': { primary: 'Bengaluru', alternatives: ['Bengaluru India', 'Karnataka'], region: 'India' },
    'delhi': { primary: 'New Delhi', alternatives: ['Delhi India', 'NCR'], region: 'India' },

    // Japan
    'tokyo': { primary: 'Tokyo', alternatives: ['Tokyo Japan', 'Kanto'], region: 'Japan' },
    'kyoto': { primary: 'Kyoto', alternatives: ['Kyoto Japan', 'Kansai'], region: 'Japan' },
    'osaka': { primary: 'Osaka', alternatives: ['Osaka Japan', 'Kansai'], region: 'Japan' },

    // China
    'beijing': { primary: 'Beijing', alternatives: ['Beijing China', 'Peking'], region: 'China' },
    'shanghai': { primary: 'Shanghai', alternatives: ['Shanghai China'], region: 'China' },

    // Add more as needed
};

/**
 * Extract keywords and context from content
 */
export function extractSearchKeywords(
    sectionHeading: string,
    sectionContent: string,
    courseTopic: string
): {
    primary: string[];
    secondary: string[];
    geographic: string | null;
    region: string | null;
} {
    // Include course topic more prominently for better context
    const combinedText = `${courseTopic} ${courseTopic} ${sectionHeading} ${sectionContent}`.toLowerCase();

    // Detect geographic context
    let geographic: string | null = null;
    let region: string | null = null;

    for (const [key, value] of Object.entries(GEOGRAPHIC_CONTEXT)) {
        if (combinedText.includes(key)) {
            geographic = value.primary;
            region = value.region;
            break;
        }
    }

    // Extract primary keywords from heading (most important)
    const headingWords = sectionHeading
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !isStopWord(word));

    // Extract secondary keywords from topic (weighted more heavily)
    const topicWords = courseTopic
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !isStopWord(word));
    
    // Add topic words to primary if they're not already there (for better relevance)
    const uniqueTopicWords = topicWords.filter(word => !headingWords.includes(word));

    // Extract key phrases (2-3 word combinations)
    const phrases = extractKeyPhrases(sectionContent);

    return {
        primary: [...new Set([...headingWords, ...uniqueTopicWords, ...phrases])].slice(0, 7),
        secondary: [...new Set(topicWords)].slice(0, 3),
        geographic,
        region
    };
}

/**
 * Generate optimized search queries with fallback strategies
 */
export function generateSearchQueries(keywords: ReturnType<typeof extractSearchKeywords>): string[] {
    const queries: string[] = [];

    // Query 1: Most specific - geographic + primary keywords
    if (keywords.geographic && keywords.primary.length > 0) {
        queries.push(`${keywords.geographic} ${keywords.primary.slice(0, 2).join(' ')}`);
    }

    // Query 2: Primary keywords + region
    if (keywords.region && keywords.primary.length > 0) {
        queries.push(`${keywords.primary.slice(0, 2).join(' ')} ${keywords.region}`);
    }

    // Query 3: Primary keywords only
    if (keywords.primary.length > 0) {
        queries.push(keywords.primary.slice(0, 3).join(' '));
    }

    // Query 4: Primary + secondary keywords
    if (keywords.primary.length > 0 && keywords.secondary.length > 0) {
        queries.push(`${keywords.primary[0]} ${keywords.secondary[0]}`);
    }

    // Query 5: Fallback - just the most important keyword
    if (keywords.primary.length > 0) {
        queries.push(keywords.primary[0]);
    }

    // Remove duplicates and empty queries
    return [...new Set(queries)].filter(q => q.trim().length > 0);
}

/**
 * Score image relevance based on metadata
 */
export function scoreImageRelevance(
    image: any,
    keywords: ReturnType<typeof extractSearchKeywords>,
    searchQuery: string
): number {
    let score = 0;

    const imageText = `${image.alt || ''} ${image.description || ''} ${image.tags?.join(' ') || ''}`.toLowerCase();

    // Geographic match (highest priority) - check for exact matches and alternatives
    if (keywords.geographic) {
        const geoLower = keywords.geographic.toLowerCase();
        if (imageText.includes(geoLower)) {
            score += 50;
        }
        // Also check for common variations and related terms
        if (geoLower === 'mumbai') {
            if (imageText.includes('bombay') || imageText.includes('maharashtra')) {
                score += 40;
            }
            // Boost for marine/coastal context when searching for Mumbai/Bombay
            if (imageText.includes('marine') || imageText.includes('coast') || imageText.includes('sea') || imageText.includes('ocean')) {
                score += 20;
            }
        }
        // Check for alternative names in GEOGRAPHIC_CONTEXT
        const geoContext = GEOGRAPHIC_CONTEXT[geoLower] || Object.values(GEOGRAPHIC_CONTEXT).find(v => v.primary.toLowerCase() === geoLower);
        if (geoContext) {
            geoContext.alternatives.forEach(alt => {
                if (imageText.includes(alt.toLowerCase())) {
                    score += 30;
                }
            });
        }
    }

    // Region match (very high priority for geographic relevance)
    if (keywords.region && imageText.includes(keywords.region.toLowerCase())) {
        score += 40;
    }
    
    // Penalize mismatched regions (e.g., African images for Indian topics)
    if (keywords.region) {
        const mismatchedRegions = {
            'India': ['Africa', 'African', 'America', 'American', 'Europe', 'European', 'China', 'Chinese', 'Japan', 'Japanese'],
            'Japan': ['India', 'Indian', 'Africa', 'African', 'America', 'American'],
            'China': ['India', 'Indian', 'Africa', 'African', 'America', 'American'],
        };
        const regionMismatches = mismatchedRegions[keywords.region as keyof typeof mismatchedRegions] || [];
        regionMismatches.forEach(mismatch => {
            if (imageText.includes(mismatch.toLowerCase())) {
                score -= 30; // Heavy penalty for geographic mismatch
            }
        });
    }

    // Primary keyword matches
    keywords.primary.forEach(keyword => {
        if (imageText.includes(keyword.toLowerCase())) {
            score += 15;
        }
    });

    // Secondary keyword matches
    keywords.secondary.forEach(keyword => {
        if (imageText.includes(keyword.toLowerCase())) {
            score += 5;
        }
    });

    // Search query match
    const queryWords = searchQuery.toLowerCase().split(/\s+/);
    queryWords.forEach(word => {
        if (word.length > 3 && imageText.includes(word)) {
            score += 10;
        }
    });

    // Penalize generic terms that might indicate irrelevant images
    const genericTerms = ['stock', 'generic', 'abstract', 'background', 'texture', 'pattern'];
    genericTerms.forEach(term => {
        if (imageText.includes(term)) {
            score -= 10;
        }
    });

    // Bonus for photographer location if it matches region
    if (keywords.region && image.photographer_location?.includes(keywords.region)) {
        score += 20;
    }

    return Math.max(0, score);
}

/**
 * Filter and rank images by relevance
 */
export function rankImagesByRelevance(
    images: any[],
    keywords: ReturnType<typeof extractSearchKeywords>,
    searchQuery: string,
    minScore: number = 20
): any[] {
    const scoredImages = images.map(image => ({
        ...image,
        relevanceScore: scoreImageRelevance(image, keywords, searchQuery)
    }));

    // Filter by minimum score and sort by relevance
    return scoredImages
        .filter(img => img.relevanceScore >= minScore)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Helper: Check if word is a stop word
 */
function isStopWord(word: string): boolean {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
        'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what',
        'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too',
        'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after'
    ]);
    return stopWords.has(word.toLowerCase());
}

/**
 * Helper: Extract key phrases (2-3 word combinations)
 */
function extractKeyPhrases(text: string): string[] {
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !isStopWord(word));

    const phrases: string[] = [];

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
        if (!isStopWord(words[i]) && !isStopWord(words[i + 1])) {
            phrases.push(`${words[i]} ${words[i + 1]}`);
        }
    }

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
        if (!isStopWord(words[i]) && !isStopWord(words[i + 2])) {
            phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
        }
    }

    // Count frequency and return top phrases
    const frequency = new Map<string, number>();
    phrases.forEach(phrase => {
        frequency.set(phrase, (frequency.get(phrase) || 0) + 1);
    });

    return Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([phrase]) => phrase);
}

/**
 * Main function: Get relevant images for a section
 */
export async function findRelevantImages(
    sectionHeading: string,
    sectionContent: string,
    courseTopic: string,
    imageSearchFn: (query: string) => Promise<any[]>,
    maxResults: number = 10
): Promise<any[]> {
    // Extract keywords and context
    const keywords = extractSearchKeywords(sectionHeading, sectionContent, courseTopic);

    // Generate search queries with fallback
    const queries = generateSearchQueries(keywords);

    console.log('Image search keywords:', keywords);
    console.log('Generated queries:', queries);

    // Try queries in order until we get good results
    for (const query of queries) {
        try {
            const images = await imageSearchFn(query);

            if (images && images.length > 0) {
                // Rank by relevance
                const rankedImages = rankImagesByRelevance(images, keywords, query);

                if (rankedImages.length > 0) {
                    console.log(`Found ${rankedImages.length} relevant images for query: "${query}"`);
                    console.log('Top image score:', rankedImages[0].relevanceScore);
                    return rankedImages.slice(0, maxResults);
                }
            }
        } catch (error) {
            console.warn(`Image search failed for query "${query}":`, error);
            // Continue to next query
        }
    }

    // If all queries fail, return empty array
    console.warn('No relevant images found for any query');
    return [];
}
