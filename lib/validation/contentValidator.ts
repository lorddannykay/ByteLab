import { StageContent, ContentSection } from '@/types/course';
import { getSearchService } from '../search/searchService';
import { extractClaims, checkFact, FactualClaim, FactCheckResult } from './factChecker';

export interface ValidationIssue {
  type: 'hallucination' | 'unverified' | 'conflicting';
  severity: 'low' | 'medium' | 'high';
  section?: string;
  claim: string;
  explanation: string;
  suggestions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  overallConfidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
  validatedAt: number;
}

/**
 * Validate course content against web search results
 */
export async function validateContent(
  content: StageContent,
  topic: string,
  enableValidation: boolean = true
): Promise<ValidationResult> {
  if (!enableValidation) {
    return {
      isValid: true,
      overallConfidence: 1.0,
      issues: [],
      suggestions: [],
      validatedAt: Date.now(),
    };
  }

  const searchService = getSearchService();
  const issues: ValidationIssue[] = [];
  const allSuggestions: string[] = [];
  let totalConfidence = 0;
  let claimCount = 0;

  // Limit total number of searches to prevent excessive API usage
  // Reduced default to be more conservative with API usage
  const MAX_SEARCHES_PER_VALIDATION = parseInt(process.env.MAX_SEARCHES_PER_VALIDATION || '5');
  let searchCount = 0;
  
  // Add delay between searches to respect rate limits
  const delayBetweenSearches = async (ms: number = 200) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  };

  // Validate introduction
  const introClaims = extractClaims(content.introduction);
  for (const claim of introClaims) {
    if (searchCount >= MAX_SEARCHES_PER_VALIDATION) {
      console.warn(`Reached max searches limit (${MAX_SEARCHES_PER_VALIDATION}), skipping remaining validation`);
      break;
    }
    
    const searchQuery = `${topic} ${claim.text}`;
    const searchResults = await searchService.search(searchQuery, { maxResults: 5 });
    searchCount++;
    await delayBetweenSearches(300); // 300ms delay between searches
    const factCheck = checkFact(claim, searchResults);

    totalConfidence += factCheck.confidence;
    claimCount++;

    if (!factCheck.isValid) {
      issues.push({
        type: factCheck.confidence < 0.3 ? 'hallucination' : 'unverified',
        severity: factCheck.confidence < 0.3 ? 'high' : 'medium',
        section: 'introduction',
        claim: claim.text,
        explanation: factCheck.explanation,
        suggestions: factCheck.supportingEvidence.length > 0
          ? [`Consider using information from: ${factCheck.supportingEvidence[0].url}`]
          : ['Consider verifying this information from authoritative sources'],
      });
    }
  }

  // Validate each section
  for (const section of content.sections) {
    if (searchCount >= MAX_SEARCHES_PER_VALIDATION) {
      break;
    }
    
    const sectionClaims = extractClaims(`${section.heading} ${section.content}`);
    
    for (const claim of sectionClaims) {
      if (searchCount >= MAX_SEARCHES_PER_VALIDATION) {
        break;
      }
      
      const searchQuery = `${topic} ${section.heading} ${claim.text}`;
      const searchResults = await searchService.search(searchQuery, { maxResults: 5 });
      searchCount++;
      await delayBetweenSearches(300); // 300ms delay between searches
      const factCheck = checkFact(claim, searchResults);

      totalConfidence += factCheck.confidence;
      claimCount++;

      if (!factCheck.isValid) {
        const severity = factCheck.confidence < 0.3 ? 'high' : factCheck.confidence < 0.5 ? 'medium' : 'low';
        
        issues.push({
          type: factCheck.confidence < 0.3 ? 'hallucination' : 'unverified',
          severity,
          section: section.heading,
          claim: claim.text,
          explanation: factCheck.explanation,
          suggestions: factCheck.supportingEvidence.length > 0
            ? [`Verify with: ${factCheck.supportingEvidence[0].url}`]
            : ['Double-check this information from reliable sources'],
        });
      } else if (factCheck.supportingEvidence.length > 0) {
        // Add suggestions for enrichment
        allSuggestions.push(
          `Consider adding more detail from: ${factCheck.supportingEvidence[0].url}`
        );
      }
    }
  }

  // Validate summary
  const summaryClaims = extractClaims(content.summary);
  for (const claim of summaryClaims) {
    if (searchCount >= MAX_SEARCHES_PER_VALIDATION) {
      break;
    }
    
    const searchQuery = `${topic} ${claim.text}`;
    const searchResults = await searchService.search(searchQuery, { maxResults: 5 });
    searchCount++;
    await delayBetweenSearches(300); // 300ms delay between searches
    const factCheck = checkFact(claim, searchResults);

    totalConfidence += factCheck.confidence;
    claimCount++;

    if (!factCheck.isValid) {
      issues.push({
        type: factCheck.confidence < 0.3 ? 'hallucination' : 'unverified',
        severity: factCheck.confidence < 0.3 ? 'high' : 'medium',
        section: 'summary',
        claim: claim.text,
        explanation: factCheck.explanation,
      });
    }
  }

  const overallConfidence = claimCount > 0 ? totalConfidence / claimCount : 1.0;
  const isValid = overallConfidence > 0.6 && issues.filter(i => i.severity === 'high').length === 0;

  return {
    isValid,
    overallConfidence,
    issues,
    suggestions: allSuggestions.slice(0, 5), // Limit suggestions
    validatedAt: Date.now(),
  };
}

/**
 * Enrich content with information from search results
 */
export async function enrichContentWithSearch(
  content: StageContent,
  topic: string
): Promise<{ enrichedContent: StageContent; sources: string[] }> {
  const searchService = getSearchService();
  const sources: string[] = [];

  // Search for additional context on the topic
  const searchQuery = `${topic} ${content.sections.map(s => s.heading).join(' ')}`;
  const searchResults = await searchService.search(searchQuery, { maxResults: 3 });

  // Add sources
  searchResults.forEach(result => {
    if (result.url && !sources.includes(result.url)) {
      sources.push(result.url);
    }
  });

  // For now, return content as-is (enrichment can be enhanced later)
  // In a full implementation, you might use AI to incorporate search results
  return {
    enrichedContent: content,
    sources: sources.slice(0, 5),
  };
}

