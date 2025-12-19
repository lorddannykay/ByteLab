import { SearchResult } from '../search/searchProvider';

export interface FactualClaim {
  text: string;
  type: 'fact' | 'statistic' | 'definition' | 'relationship';
  confidence: number;
}

export interface FactCheckResult {
  isValid: boolean;
  confidence: number;
  supportingEvidence: SearchResult[];
  conflictingEvidence: SearchResult[];
  explanation: string;
}

/**
 * Extract factual claims from content text
 * Smart extraction that skips greetings, obvious statements, and focuses on verifiable facts
 */
export function extractClaims(content: string): FactualClaim[] {
  const claims: FactualClaim[] = [];
  
  // Skip patterns - these are usually not verifiable facts
  const skipPatterns = [
    /^(welcome|get ready|let's|let us|in this|by the end|you'll|you will)/i,
    /^(here|there|this|that|these|those)\s+(is|are|will|can)/i,
    /^(we|you|they)\s+(will|can|should|may|might)/i,
    /^(it|this|that)\s+(is|will|can)\s+(a|an|the)/i,
    /^(as|when|if|while|because)\s+(we|you|they|it)/i,
  ];
  
  // Split content into sentences
  const sentences = content.split(/[.!?]+/).filter(s => {
    const trimmed = s.trim();
    // Filter out very short sentences and skip patterns
    return trimmed.length > 30 && !skipPatterns.some(pattern => pattern.test(trimmed));
  });
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    
    // Skip if it's a greeting or instruction
    if (/^(welcome|get ready|let's|in this stage|by the end|you'll learn|you'll discover)/i.test(trimmed)) {
      continue;
    }
    
    // Detect statistics (numbers with units or percentages) - high priority
    if (/\d+%/.test(trimmed) || /\d+\s*(percent|million|billion|thousand|hundred)/i.test(trimmed)) {
      claims.push({
        text: trimmed,
        type: 'statistic',
        confidence: 0.8,
      });
    }
    // Detect definitions (contains "is", "are", "means", "refers to") - but skip obvious ones
    else if (/\b(is|are|means|refers to|defined as)\b/i.test(trimmed) && 
             !/^(this|that|it|they|we|you)\s+(is|are)/i.test(trimmed)) {
      // Only include if it contains technical terms or specific concepts
      if (/\b(function|variable|array|object|class|method|property|syntax|keyword)\b/i.test(trimmed) ||
          trimmed.length > 50) {
        claims.push({
          text: trimmed,
          type: 'definition',
          confidence: 0.7,
        });
      }
    }
    // Detect relationships (contains "because", "due to", "leads to", "causes")
    else if (/\b(because|due to|leads to|causes|results in|enables|allows)\b/i.test(trimmed)) {
      claims.push({
        text: trimmed,
        type: 'relationship',
        confidence: 0.6,
      });
    }
    // General factual statements - but only if they contain specific technical terms
    else if (trimmed.length > 50 && 
             (/\b(can|may|will|should|must|requires|supports|provides|offers)\b/i.test(trimmed) ||
              /\b(function|method|class|object|variable|array|string|number|boolean)\b/i.test(trimmed))) {
      claims.push({
        text: trimmed,
        type: 'fact',
        confidence: 0.5,
      });
    }
  }
  
  // Prioritize statistics and definitions, limit to top 3 most important claims
  const prioritized = claims.sort((a, b) => {
    const priority = { statistic: 3, definition: 2, relationship: 1, fact: 0 };
    return priority[b.type] - priority[a.type] || b.confidence - a.confidence;
  });
  
  return prioritized.slice(0, 3); // Reduced from 5 to 3 to save API calls
}

/**
 * Check a factual claim against search results
 */
export function checkFact(claim: FactualClaim, searchResults: SearchResult[]): FactCheckResult {
  if (searchResults.length === 0) {
    return {
      isValid: false,
      confidence: 0,
      supportingEvidence: [],
      conflictingEvidence: [],
      explanation: 'No search results found to validate this claim',
    };
  }

  // Extract key terms from the claim
  const claimTerms = claim.text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !/^(the|and|or|but|is|are|was|were|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can)$/.test(word))
    .slice(0, 5);

  let supportingCount = 0;
  let conflictingCount = 0;
  const supportingEvidence: SearchResult[] = [];
  const conflictingEvidence: SearchResult[] = [];

  for (const result of searchResults) {
    const resultText = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Count how many key terms appear in the result
    const matchingTerms = claimTerms.filter(term => resultText.includes(term));
    const matchRatio = matchingTerms.length / claimTerms.length;

    // If more than 50% of key terms match, consider it supporting evidence
    if (matchRatio > 0.5) {
      supportingCount++;
      supportingEvidence.push(result);
    } else if (matchRatio < 0.2) {
      // Low match might indicate conflicting information
      conflictingCount++;
      conflictingEvidence.push(result);
    }
  }

  // Calculate confidence based on supporting vs conflicting evidence
  const totalRelevant = supportingCount + conflictingCount;
  const confidence = totalRelevant > 0 
    ? supportingCount / totalRelevant 
    : 0.5; // Default to neutral if no clear evidence

  const isValid = confidence > 0.6 && supportingCount > conflictingCount;

  let explanation = '';
  if (isValid) {
    explanation = `Claim validated with ${supportingCount} supporting source(s)`;
  } else if (supportingCount === 0) {
    explanation = `No supporting evidence found for this claim`;
  } else {
    explanation = `Mixed evidence: ${supportingCount} supporting, ${conflictingCount} conflicting sources`;
  }

  return {
    isValid,
    confidence,
    supportingEvidence: supportingEvidence.slice(0, 3),
    conflictingEvidence: conflictingEvidence.slice(0, 2),
    explanation,
  };
}

/**
 * Simple semantic similarity check (basic implementation)
 * In a production system, you'd use embeddings for better similarity
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

