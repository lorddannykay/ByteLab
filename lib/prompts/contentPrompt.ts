import { CourseConfig, CourseStage } from '@/types/course';
import { buildSystemPrompt, buildChainOfThoughtUserPrompt, buildChainOfThoughtPrompt, enrichContextFromSources, extractKeyConcepts } from './advancedPromptEngineering';

/**
 * Build system and user prompts separately for better API control
 * Returns both prompts for use in system/user message separation
 */
export function buildContentPrompts(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] },
  context?: string,
  sourceChunks?: string[],
  useAdvancedPrompting: boolean = true
): { systemPrompt: string; userPrompt: string } {
  // Enrich context with relevant source material if available
  // Prioritize sourceChunks over general context for better factual grounding
  const enrichedContext = sourceChunks && sourceChunks.length > 0
    ? enrichContextFromSources(sourceChunks, stage.objective, stage.keyPoints)
    : context || '';
  
  // If we have both context and sourceChunks, combine them intelligently
  let finalContext = sourceChunks && sourceChunks.length > 0 && context
    ? `${enrichContextFromSources(sourceChunks, stage.objective, stage.keyPoints)}\n\nADDITIONAL CONTEXT:\n${context}`
    : enrichedContext;

  // Extract key concepts from context if available
  let keyConceptsSection = '';
  if (finalContext) {
    const keyConcepts = extractKeyConcepts(finalContext, config.topic);
    if (keyConcepts.length > 0) {
      keyConceptsSection = `\n\nKEY CONCEPTS TO PRIORITIZE: ${keyConcepts.join(', ')}\nMake sure these concepts appear explicitly in your sections, quiz, and flashcards.`;
    }
    
    // Label context as authoritative
    finalContext = `AUTHORITATIVE SOURCE MATERIAL:\n${finalContext}\n\nTreat the above as authoritative source material. Do not contradict it. Prefer examples and wording that are consistent with this material.`;
  } else {
    // Add warning when no context
    finalContext = `WARNING: No source material context provided. You must still create high-quality content, but be aware that you're working without specific source material. Focus on general best practices and common knowledge for the topic "${config.topic}".\n\nDo not invent specific statistics, names, or organizations. Use generic but realistic placeholders instead.`;
  }

  // Build system prompt (expert persona + quality gates)
  const systemPrompt = buildSystemPrompt(config);

  // Build user prompt (task-specific content)
  let userPrompt: string;
  if (useAdvancedPrompting) {
    userPrompt = buildChainOfThoughtUserPrompt(config, stage, finalContext) + keyConceptsSection;
  } else {
    userPrompt = buildStandardUserPrompt(config, stage, finalContext) + keyConceptsSection;
  }

  return { systemPrompt, userPrompt };
}

/**
 * Build content generation prompt (backward compatibility - returns combined prompt)
 * @param useAdvancedPrompting - Enable advanced chain-of-thought prompting (uses 30-40% more tokens but 3-5x better quality)
 * @deprecated Use buildContentPrompts() for better system/user message separation
 */
export function buildContentPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] },
  context?: string,
  sourceChunks?: string[],
  useAdvancedPrompting: boolean = true
): string {
  const { systemPrompt, userPrompt } = buildContentPrompts(config, stage, context, sourceChunks, useAdvancedPrompting);
  // For backward compatibility, combine them
  return `${systemPrompt}\n\n${userPrompt}`;
}

/**
 * Standard user prompt for faster generation with lower token usage
 * More direct and shorter than advanced prompt - no step-by-step analysis
 * Use when speed/cost is prioritized over maximum quality
 */
function buildStandardUserPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] },
  context?: string
): string {
  return `TASK: Create engaging microlearning content for Stage ${stage.id}

COURSE CONTEXT:
- Title: ${config.title}
- Topic: ${config.topic}
- Target Audience: ${config.targetAudience}
- Content Style: ${config.contentStyle}

STAGE REQUIREMENTS:
- Title: ${stage.title}
- Learning Objective: ${stage.objective}
- Key Points: ${stage.keyPoints.join(', ')}

${context ? `${context}\n` : ''}

🚨 TOPIC RELEVANCE: All content MUST be about "${config.topic}" and "${stage.title}".

INSTRUCTIONS:
Create high-quality, engaging content that feels professional and actionable.
- Start with a strong hook - avoid generic phrases like "In this section..."
- Include specific, realistic examples relevant to "${config.topic}"
- Focus on practical application
- Use concrete details: names, numbers, locations, specific outcomes

CONTENT STRUCTURE:
1. **Introduction**: 3-4 sentences that frame the problem or opportunity (relevant to "${config.topic}")
2. **Sections**: 2-3 sections (100-150 words each)
   - Use short paragraphs and varied sentence structure
   - Explain why it matters and how to apply it
   - Include specific examples related to "${config.topic}"
3. **Interactive Elements**:
   - 1 Flashcard Deck (3 cards minimum) - concepts related to "${config.topic}"
   - 1 Quiz Question (scenario-based, 4 options) - scenario about "${config.topic}"
4. **Side Card**: Pro tip or common pitfall related to "${config.topic}"

Return ONLY a single, valid JSON object that strictly follows the schema below. 
No explanations, no markdown, no text before or after the JSON.

OUTPUT JSON FORMAT:
{
  "introduction": "Engaging introduction...",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Content with examples...",
      "type": "text"
    }
  ],
  "interactiveElements": [
    {
      "type": "flashcard",
      "data": {
        "title": "Key Concepts",
        "cards": [
          { "front": "Term/Question", "back": "Definition/Answer" }
        ]
      }
    },
    {
      "type": "quiz",
      "data": {
        "question": "Scenario question...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Correct option",
        "explanation": "Why this is correct..."
      }
    }
  ],
  "summary": "Brief recap...",
  "sideCard": {
    "title": "Pro Tip",
    "content": "Practical advice...",
    "tips": ["Tip 1", "Tip 2"]
  }
}

// TypeScript-style schema hint (do not explain, just follow)
interface MicrolearningContent {
  introduction: string;
  sections: { heading: string; content: string; type: "text" }[];
  interactiveElements: (
    | { type: "flashcard"; data: { title: string; cards: { front: string; back: string }[] } }
    | { type: "quiz"; data: { question: string; options: string[]; correctAnswer: string; explanation: string } }
  )[];
  summary: string;
  sideCard: { title: string; content: string; tips: string[] };
}`;
}

/**
 * Standard prompt (backward compatibility - returns combined prompt)
 * @deprecated Use buildContentPrompts() for better system/user message separation
 */
function buildStandardPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] },
  context?: string
): string {
  const systemPrompt = buildSystemPrompt(config);
  const userPrompt = buildStandardUserPrompt(config, stage, context);
  return `${systemPrompt}\n\n${userPrompt}`;
}

// Export for backward compatibility and testing
export { buildChainOfThoughtPrompt, enrichContextFromSources } from './advancedPromptEngineering';
