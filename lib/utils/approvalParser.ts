/**
 * Parse approval commands from user messages
 * Detects various forms of approval intent
 */

export function parseApprovalCommand(message: string): boolean {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const normalizedMessage = message.trim().toLowerCase();

  // Exact matches (case-insensitive, punctuation-insensitive)
  const exactMatches = [
    '/approve',
    'approved',
    'approve it',
    'i approve',
    'yes, approve',
    'yes approve',
    'approve this',
    'approve the outline',
    'approve outline',
  ];

  // Remove punctuation for comparison
  const cleanMessage = normalizedMessage.replace(/[.,!?;:]/g, '').trim();
  
  if (exactMatches.some(match => {
    const cleanMatch = match.replace(/[.,!?;:]/g, '').trim();
    return cleanMessage === cleanMatch || normalizedMessage === match;
  })) {
    return true;
  }

  // Pattern matches - messages that start with approval phrases
  const approvalStarters = [
    'approved',
    'approve',
    'looks good',
    'looks great',
    'sounds good',
    'sounds great',
    'perfect',
    'that works',
    'go ahead',
    'proceed',
    'continue',
    'yes',
    'yep',
    'yeah',
    'ok',
    'okay',
    'sure',
    'fine',
    'agreed',
    'i agree',
    'i like it',
    'i like this',
    'this is good',
    'this looks good',
  ];

  // Check if message starts with an approval phrase
  for (const starter of approvalStarters) {
    if (normalizedMessage.startsWith(starter)) {
      // Additional check: if it's a very short message or ends with punctuation, it's likely approval
      const words = normalizedMessage.split(/\s+/);
      if (words.length <= 3 || normalizedMessage.match(/^[a-z\s]+[.!?]?$/)) {
        return true;
      }
    }
  }

  // Check for approval intent with context words
  const approvalContext = [
    'approve',
    'approved',
    'looks good',
    'sounds good',
    'proceed',
    'continue',
    'go ahead',
  ];

  const contextWords = [
    'outline',
    'this',
    'it',
    'that',
    'plan',
    'course',
    'structure',
  ];

  // Check if message contains approval context + context words
  const hasApprovalContext = approvalContext.some(ctx => normalizedMessage.includes(ctx));
  const hasContextWord = contextWords.some(word => normalizedMessage.includes(word));

  if (hasApprovalContext && (hasContextWord || normalizedMessage.length < 50)) {
    return true;
  }

  // Negative patterns - if message contains these, it's NOT approval
  const negativePatterns = [
    'not approved',
    "don't approve",
    'do not approve',
    'reject',
    'regenerate',
    'change',
    'modify',
    'edit',
    'revise',
    'different',
    'instead',
    'but',
    'however',
    'although',
  ];

  if (negativePatterns.some(pattern => normalizedMessage.includes(pattern))) {
    return false;
  }

  return false;
}

/**
 * Check if message is a clear approval (high confidence)
 */
export function isClearApproval(message: string): boolean {
  const normalizedMessage = message.trim().toLowerCase();
  
  const clearApprovals = [
    'approved',
    'approve',
    '/approve',
    'approve it',
    'i approve',
    'yes, approve',
    'looks good',
    'sounds good',
    'proceed',
    'go ahead',
    'continue',
  ];

  return clearApprovals.some(approval => normalizedMessage === approval || normalizedMessage.startsWith(approval + ' '));
}



