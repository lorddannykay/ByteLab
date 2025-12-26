/**
 * Advanced Prompt Engineering Utilities
 * Implements world-class techniques: Chain-of-Thought, Few-Shot Learning, Self-Critique
 */

import { CourseConfig, CourseStage } from '@/types/course';

/**
 * Few-shot examples of world-class microlearning content
 */
export const EXEMPLAR_CONTENT = {
    introduction: `The average person checks their phone 96 times a day. That's once every 10 minutes during waking hours. But here's what most people don't realize: each interruption costs you far more than the 30 seconds you spend scrolling. Research from UC Irvine shows it takes an average of 23 minutes to fully regain focus after a distraction. This stage reveals the hidden architecture of attention and gives you practical tools to reclaim your focus in a world designed to fragment it.`,

    section: {
        heading: "The Attention Residue Effect",
        content: `When Sophie, a software engineer at a fintech startup, switched from checking Slack every 5 minutes to batching her messages twice daily, her code review completion time dropped from 4 hours to 90 minutes. The reason? A phenomenon called "attention residue."

When you switch tasks, part of your attention remains stuck on the previous task. Professor Sophie Leroy's research at the University of Minnesota found that this residue significantly impairs performance on the subsequent task. The effect is strongest when you switch before completing the first task, and when the first task was unbounded (like email or chat).

Here's the practical application: Create "attention blocks" of 90 minutes for deep work. During these blocks, close all communication tools, put your phone in another room, and work on a single, clearly defined task. Use a simple rule: if a task will take less than 2 minutes, do it immediately. Everything else goes into your attention block.

The transformation isn't immediate. Sophie reported the first week felt "uncomfortable and slightly anxious." By week three, she described it as "like upgrading from dial-up to fiber optic internet for my brain."`
    },

    quiz: {
        question: "Maya is a marketing manager who needs to write a campaign proposal. She has 3 hours available. Which approach will likely produce the best results based on attention residue research?",
        options: [
            "Work for 30 minutes, check email, work for 30 minutes, take a call, work for 30 minutes, review social media, finish the last hour",
            "Work for 90 minutes uninterrupted, take a 15-minute break, then work for another 75 minutes uninterrupted",
            "Multitask by writing the proposal while monitoring email and Slack to stay responsive to her team",
            "Work for 60 minutes, switch to easier tasks like email for 30 minutes to 'rest her brain,' then return to the proposal"
        ],
        correctAnswer: "Work for 90 minutes uninterrupted, take a 15-minute break, then work for another 75 minutes uninterrupted",
        explanation: "Option 2 is correct because it minimizes attention residue by creating uninterrupted blocks aligned with natural focus cycles. Option 1 creates multiple task switches that compound attention residue. Option 3 (multitasking) creates constant residue and prevents deep engagement. Option 4 seems reasonable but the 'easier tasks' still create residue that impairs the return to deep work. The 90-minute blocks allow Maya to fully engage with the complex cognitive demands of proposal writing without fragmenting her attention."
    },

    flashcard: {
        title: "Key Concepts: Attention Management",
        cards: [
            {
                front: "Attention Residue",
                back: "The cognitive phenomenon where part of your attention remains focused on a previous task even after switching to a new one, impairing performance on the current task. Strongest when switching before task completion."
            },
            {
                front: "What's the optimal deep work block duration?",
                back: "90 minutes - aligns with ultradian rhythms (natural 90-120 minute cycles of peak alertness). Longer blocks risk diminishing returns; shorter blocks don't allow full cognitive engagement."
            },
            {
                front: "2-Minute Rule Application",
                back: "If a task takes less than 2 minutes, do it immediately. Otherwise, schedule it for an attention block. Prevents small tasks from creating attention residue while maintaining momentum."
            }
        ]
    }
};

/**
 * Expert persona definition for content generation
 */
export const EXPERT_PERSONA = `You are Dr. Sarah Chen, an award-winning instructional designer with 15+ years of experience creating microlearning content for Fortune 500 companies and top universities. You hold a Ph.D. in Educational Psychology from Stanford and have published 23 peer-reviewed papers on cognitive load theory and engagement in digital learning.

Your expertise includes:
- Applying Bloom's Taxonomy to create measurable learning outcomes
- Using storytelling and narrative structure to increase retention by 65%
- Implementing spaced repetition and retrieval practice principles
- Creating scenario-based assessments that test application, not recall
- Writing at the optimal cognitive load level for adult learners

Your content has won 7 industry awards and maintains a 4.8/5 learner satisfaction rating across 2.3 million completions.`;

/**
 * Build system prompt with expert persona and global quality gates
 * This should be used as the system message in API calls
 */
export function buildSystemPrompt(config: CourseConfig): string {
  return `${EXPERT_PERSONA}

GLOBAL QUALITY GATES (Apply to ALL content):
✓ Reading level: 8th-10th grade (Flesch-Kincaid)
✓ Every example includes specific names, numbers, or locations
✓ At least one counterintuitive insight per section
✓ Zero generic phrases ("In this section", "Let's dive in", "It's important to note")
✓ Quiz tests application in a realistic scenario
✓ Emotional engagement: content evokes curiosity, surprise, or recognition
✓ ALL content must be relevant to the course topic: "${config.topic}"

OUTPUT REQUIREMENTS:
- You MUST respond with ONLY valid JSON
- No explanations, no markdown, no text before or after the JSON
- The response must be a valid JSON object matching the requested structure exactly
- Start your response with { and end with }`;
}

/**
 * Build user prompt for Chain-of-Thought content generation
 * This should be used as the user message in API calls (system message comes from buildSystemPrompt)
 */
export function buildChainOfThoughtUserPrompt(
    config: CourseConfig,
    stage: { id: number; title: string; objective: string; keyPoints: string[] },
    context?: string
): string {
    return `TASK: Create exceptional microlearning content for Stage ${stage.id}

COURSE CONTEXT:
- Title: ${config.title}
- Topic: ${config.topic}
- Target Audience: ${config.targetAudience}
- Content Style: ${config.contentStyle}

STAGE REQUIREMENTS:
- Title: ${stage.title}
- Learning Objective: ${stage.objective}
- Key Points to Cover: ${stage.keyPoints.join(', ')}

${context ? `CRITICAL: ADDITIONAL CONTEXT FROM SOURCE MATERIAL:\n${context}\n\nIMPORTANT: You MUST use this source material as the factual foundation for your content. Reference specific details, examples, and information from this context. Do NOT generate generic content - ground everything in the provided source material. If the context mentions specific places, people, or facts, use them.` : ''}

${!context ? `WARNING: No source material context provided. You must still create high-quality content, but be aware that you're working without specific source material. Focus on general best practices and common knowledge for the topic "${config.topic}".` : ''}

STEP 1 - ANALYZE THE LEARNING NEED:
First, think through:
- What is the core problem or opportunity this stage addresses?
- What misconceptions might learners have about this topic?
- What real-world scenarios would make this immediately relevant?
- What emotional hook will capture attention in the first 10 seconds?
${context ? `- What specific information from the source material is most relevant to this stage?` : ''}
${config.topic ? `- How does this stage relate to the overall course topic: "${config.topic}"?` : ''}

STEP 2 - DESIGN THE LEARNING EXPERIENCE:
Plan your approach:
- What narrative structure will you use? (Problem-solution? Before-after? Journey?)
- What specific, named example will illustrate each key concept?
- How will you scaffold from simple to complex?
- What Bloom's Taxonomy level are you targeting? (Remember, Understand, Apply, Analyze, Evaluate, Create)

STEP 3 - CRAFT THE CONTENT:
Now create the content following these STRICT QUALITY CRITERIA:

🚨 TOPIC RELEVANCE CHECK:
- Every piece of content MUST relate to "${config.topic}" and "${stage.title}"
- All examples, names, and scenarios MUST be relevant to the course topic
- DO NOT use generic productivity examples unless the course is about productivity
- If the course is about "${config.topic}", ALL content must be about "${config.topic}"

**Introduction (3-4 sentences, ~80 words):**
- Start with a surprising statistic, provocative question, or relatable scenario
- NO generic phrases like "In this section..." or "Let's explore..."
- Create immediate relevance - why should they care RIGHT NOW?
- End with a clear promise of what they'll be able to DO

**Sections (2-3 sections, 150-200 words each):**
- Each section tells a mini-story with a specific, named protagonist
- Use concrete details: names, numbers, locations, specific outcomes
- Explain both WHY (the principle) and HOW (the application)
- Include at least one "aha moment" - a counterintuitive insight
- Vary sentence length: mix short punchy sentences with longer explanatory ones
- Use active voice and present tense for immediacy

**Interactive Elements:**
- Flashcards (3-5 cards): Focus on concepts that require memorization or quick recall
  * Front: Term, question, or scenario
  * Back: Clear definition or solution with context
- Quiz (1 scenario-based question): Test APPLICATION not recall
  * Question: Realistic scenario requiring judgment
  * 4 options: 1 clearly correct, 3 plausible but wrong for specific reasons
  * Explanation: Why correct answer works AND why each wrong answer fails

**Side Card (Pro Tip or Common Pitfall):**
- Actionable advice from an expert perspective
- Include 2-3 specific tips
- Reference real-world application

**Summary:**
- 2-3 sentences maximum
- Focus on the transformation: what can they now DO that they couldn't before?
- Include a forward-looking statement connecting to next steps

QUALITY GATES (Your content MUST meet these):
✓ Reading level: 8th-10th grade (Flesch-Kincaid)
✓ Every example includes specific names, numbers, or locations
✓ At least one counterintuitive insight per section
✓ Zero generic phrases ("In this section", "Let's dive in", "It's important to note")
✓ Quiz tests application in a realistic scenario
✓ Emotional engagement: content evokes curiosity, surprise, or recognition

⚠️ CRITICAL: EXEMPLAR CONTENT IS FOR STYLE REFERENCE ONLY ⚠️

The examples below show QUALITY LEVEL and WRITING STYLE only. DO NOT copy the topics, names, or content. 
You MUST create content about "${config.topic}" and the stage topic "${stage.title}".

STYLE EXAMPLES (Study the quality, NOT the content):

Introduction Style Example (note the hook, specificity, and promise):
"${EXEMPLAR_CONTENT.introduction}"

Section Style Example (note the named protagonist, concrete details, and practical application):
Heading: "${EXEMPLAR_CONTENT.section.heading}"
Content: "${EXEMPLAR_CONTENT.section.content}"

Quiz Style Example (note the scenario-based question and detailed explanation):
Question: "${EXEMPLAR_CONTENT.quiz.question}"
Options: ${JSON.stringify(EXEMPLAR_CONTENT.quiz.options, null, 2)}
Correct: "${EXEMPLAR_CONTENT.quiz.correctAnswer}"
Explanation: "${EXEMPLAR_CONTENT.quiz.explanation}"

Flashcard Style Example (note the clear front/back structure):
${JSON.stringify(EXEMPLAR_CONTENT.flashcard, null, 2)}

🚨 REMINDER: Your content MUST be about "${config.topic}" and "${stage.title}". 
DO NOT use "Sophie", "Maya", "attention residue", or any content from the examples above.
Create NEW content relevant to the actual course topic.

STEP 4 - SELF-CRITIQUE:
Before finalizing, review your content:
- 🚨 TOPIC CHECK: Is ALL content about "${config.topic}" and "${stage.title}"? (If not, regenerate)
- Does every section have a specific, named example relevant to the course topic?
- Would a busy professional find this immediately applicable to "${config.topic}"?
- Is there at least one "I never thought of it that way" moment related to "${config.topic}"?
- Are you showing, not just telling, with examples from "${config.topic}"?
- Does the quiz require thinking about "${config.topic}", not just remembering?
- Have you avoided copying any content from the style examples above?

Return ONLY a single, valid JSON object that strictly follows the schema below. 
No explanations, no markdown, no text before or after the JSON.

OUTPUT FORMAT (JSON):
{
  "introduction": "Your engaging introduction...",
  "sections": [
    {
      "heading": "Compelling Section Title",
      "content": "Rich, story-driven content with specific examples...",
      "type": "text"
    }
  ],
  "interactiveElements": [
    {
      "type": "flashcard",
      "data": {
        "title": "Key Concepts",
        "cards": [
          { "front": "Term or Question", "back": "Clear explanation with context" }
        ]
      }
    },
    {
      "type": "quiz",
      "data": {
        "question": "Realistic scenario question...",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "The correct option",
        "explanation": "Detailed explanation of why this is correct and why others are wrong..."
      }
    }
  ],
  "summary": "Transformation-focused summary...",
  "sideCard": {
    "title": "Pro Tip" or "Common Pitfall",
    "content": "Expert insight...",
    "tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"]
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
 * Chain-of-Thought reasoning template (backward compatibility)
 * @deprecated Use buildSystemPrompt() and buildChainOfThoughtUserPrompt() separately for better control
 */
export function buildChainOfThoughtPrompt(
    config: CourseConfig,
    stage: { id: number; title: string; objective: string; keyPoints: string[] },
    context?: string
): string {
    // For backward compatibility, combine system and user prompts
    return `${buildSystemPrompt(config)}\n\n${buildChainOfThoughtUserPrompt(config, stage, context)}`;
}

/**
 * Extract key concepts for better context integration
 * Prioritizes course topic terms and important concepts
 */
export function extractKeyConcepts(text: string, courseTopic?: string): string[] {
    // Simple keyword extraction - in production, could use NLP library
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'what', 'when', 'where', 'why', 'how', 'which', 'who']);

    const textLower = text.toLowerCase();
    const words = textLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count frequency
    const frequency = new Map<string, number>();
    words.forEach(word => {
        // Boost score for course topic terms
        const baseScore = 1;
        const topicBoost = courseTopic && textLower.includes(courseTopic.toLowerCase()) && word.includes(courseTopic.toLowerCase().split(/\s+/)[0]) ? 3 : 0;
        frequency.set(word, (frequency.get(word) || 0) + baseScore + topicBoost);
    });

    // Extract key phrases (2-3 word combinations) that might be important concepts
    const phrases: string[] = [];
    const wordsArray = textLower.split(/\s+/);
    for (let i = 0; i < wordsArray.length - 1; i++) {
        const word1 = wordsArray[i];
        const word2 = wordsArray[i + 1];
        if (word1.length > 3 && word2.length > 3 && !stopWords.has(word1) && !stopWords.has(word2)) {
            phrases.push(`${word1} ${word2}`);
        }
    }

    // Count phrase frequency
    phrases.forEach(phrase => {
        frequency.set(phrase, (frequency.get(phrase) || 0) + 2); // Phrases worth more
    });

    // Return top concepts, prioritizing longer phrases and topic-related terms
    return Array.from(frequency.entries())
        .sort((a, b) => {
            // Sort by frequency first
            if (b[1] !== a[1]) return b[1] - a[1];
            // Then by length (prefer phrases)
            return b[0].length - a[0].length;
        })
        .slice(0, 10)
        .map(([concept]) => concept);
}

/**
 * Validate content quality with multi-dimensional scoring
 */
export interface ContentQualityScore {
    score: number; // 0-100 (overall)
    issues: string[];
    suggestions: string[];
    dimensions?: {
        resemblance?: number; // 0-10 (use of key concepts, source material)
        clarity?: number; // 0-10 (readability, sentence structure)
        applicability?: number; // 0-10 (scenarios, actionability)
    };
}

export function validateContentQuality(
    content: any,
    config?: CourseConfig,
    stage?: { title: string; objective: string; keyPoints: string[] },
    sourceContext?: string
): ContentQualityScore {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    // Dimension scores (0-10 each)
    let resemblanceScore = 10; // Use of key concepts, source material
    let clarityScore = 10; // Readability, sentence structure
    let applicabilityScore = 10; // Scenarios, actionability

    // Check introduction
    if (content.introduction) {
        if (content.introduction.length < 50) {
            issues.push('Introduction is too short (< 50 characters)');
            score -= 15;
        }
        if (content.introduction.toLowerCase().includes('in this section') ||
            content.introduction.toLowerCase().includes("let's dive") ||
            content.introduction.toLowerCase().includes("let's explore")) {
            issues.push('Introduction contains generic phrases');
            score -= 10;
        }
        if (!/\d/.test(content.introduction)) {
            suggestions.push('Consider adding a specific statistic or number to the introduction');
            score -= 5;
        }
    }

    // Check sections
    if (content.sections && Array.isArray(content.sections)) {
        content.sections.forEach((section: any, index: number) => {
            if (section.content && section.content.length < 100) {
                issues.push(`Section ${index + 1} is too short (< 100 characters)`);
                score -= 10;
            }
            if (section.content && !/[A-Z][a-z]+/.test(section.content)) {
                suggestions.push(`Section ${index + 1} should include specific names or proper nouns`);
                score -= 5;
            }
        });
    }

    // Check quiz quality
    const quizElement = content.interactiveElements?.find((el: any) => el.type === 'quiz');
    if (quizElement) {
      if (!quizElement.data.explanation || quizElement.data.explanation.length < 50) {
        issues.push('Quiz explanation is too brief or missing');
        score -= 15;
      }
      if (quizElement.data.options && quizElement.data.options.length < 4) {
        issues.push('Quiz should have at least 4 options');
        score -= 10;
      }
    }

    // Check flashcards
    const flashcards = content.interactiveElements?.find((el: any) => el.type === 'flashcard');
    if (flashcards && flashcards.data.cards) {
        if (flashcards.data.cards.length < 3) {
            suggestions.push('Consider adding more flashcards (minimum 3 recommended)');
            score -= 5;
        }
    }

    // Calculate dimension scores
    
    // RESEMBLANCE: Check if content uses key concepts and source material
    if (config && stage && sourceContext) {
        const allContent = JSON.stringify(content).toLowerCase();
        const topicLower = config.topic.toLowerCase();
        const stageTitleLower = stage.title.toLowerCase();
        const keyPointsLower = stage.keyPoints.join(' ').toLowerCase();
        const contextLower = sourceContext.toLowerCase();
        
        // Check topic relevance
        const topicMentions = (allContent.match(new RegExp(topicLower.split(/\s+/)[0], 'g')) || []).length;
        const stageMentions = (allContent.match(new RegExp(stageTitleLower.split(/\s+/)[0], 'g')) || []).length;
        const keyPointMentions = stage.keyPoints.filter(kp => allContent.includes(kp.toLowerCase().split(/\s+/)[0])).length;
        
        // Check if forbidden generic topics appear
        const forbiddenTopics = ['attention residue', 'sophie', 'maya', 'productivity', 'email', 'slack'];
        const hasForbiddenTopic = forbiddenTopics.some(topic => allContent.includes(topic));
        
        if (hasForbiddenTopic) {
            resemblanceScore -= 5;
            issues.push('Content contains generic examples not related to course topic');
        }
        
        if (topicMentions === 0 && stageMentions === 0) {
            resemblanceScore -= 4;
            issues.push('Content does not mention course topic or stage title');
        } else if (topicMentions < 2) {
            resemblanceScore -= 2;
            suggestions.push('Consider mentioning the course topic more explicitly');
        }
        
        if (keyPointMentions < stage.keyPoints.length * 0.5) {
            resemblanceScore -= 2;
            suggestions.push('Consider incorporating more key points from the stage requirements');
        }
        
        // Check if source context concepts are used
        const keyConcepts = extractKeyConcepts(sourceContext, config.topic);
        const conceptsUsed = keyConcepts.filter(concept => allContent.includes(concept.toLowerCase())).length;
        if (keyConcepts.length > 0 && conceptsUsed < keyConcepts.length * 0.3) {
            resemblanceScore -= 1;
            suggestions.push('Consider using more concepts from the source material');
        }
    }
    
    // CLARITY: Check readability and sentence structure
    const allText = [
        content.introduction || '',
        ...(content.sections || []).map((s: any) => s.content || ''),
        content.summary || ''
    ].join(' ');
    
    // Check sentence length variety (good writing has variety)
    const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
        const avgLength = sentences.reduce((sum: number, s: string) => sum + s.split(/\s+/).length, 0) / sentences.length;
        if (avgLength > 25) {
            clarityScore -= 2;
            suggestions.push('Consider using shorter sentences for better readability');
        } else if (avgLength < 8) {
            clarityScore -= 1;
            suggestions.push('Consider varying sentence length for better flow');
        }
        
        // Check for generic phrases
        const genericPhrases = ['in this section', "let's dive", "let's explore", 'it is important', 'it should be noted'];
        const hasGenericPhrases = genericPhrases.some(phrase => allText.toLowerCase().includes(phrase));
        if (hasGenericPhrases) {
            clarityScore -= 2;
            issues.push('Content contains generic phrases that reduce clarity');
        }
    }
    
    // Check for specific details (names, numbers, locations)
    const hasSpecificDetails = /\d+/.test(allText) && /[A-Z][a-z]+ [A-Z][a-z]+/.test(allText);
    if (!hasSpecificDetails) {
        clarityScore -= 2;
        suggestions.push('Add specific names, numbers, or locations for better clarity');
    }
    
    // APPLICABILITY: Check for scenarios and actionability
    const hasScenarios = /scenario|example|case|situation|when|if/.test(allText.toLowerCase());
    if (!hasScenarios) {
        applicabilityScore -= 2;
        suggestions.push('Add more scenarios or examples to show practical application');
    }
    
    const quizElementForApplicability = content.interactiveElements?.find((el: any) => el.type === 'quiz');
    if (quizElementForApplicability) {
        const quizText = (quizElementForApplicability.data.question || '').toLowerCase();
        const isScenarioBased = /scenario|situation|case|if|when/.test(quizText);
        if (!isScenarioBased) {
            applicabilityScore -= 2;
            suggestions.push('Quiz should be scenario-based to test application');
        }
    }
    
    const hasActionableTips = content.sideCard?.tips && content.sideCard.tips.length > 0;
    if (!hasActionableTips) {
        applicabilityScore -= 1;
        suggestions.push('Add actionable tips in the side card');
    }

    // Normalize dimension scores to 0-10
    resemblanceScore = Math.max(0, Math.min(10, resemblanceScore));
    clarityScore = Math.max(0, Math.min(10, clarityScore));
    applicabilityScore = Math.max(0, Math.min(10, applicabilityScore));

    return {
        score: Math.max(0, score),
        issues,
        suggestions,
        dimensions: {
            resemblance: Math.round(resemblanceScore * 10) / 10,
            clarity: Math.round(clarityScore * 10) / 10,
            applicability: Math.round(applicabilityScore * 10) / 10
        }
    };
}

/**
 * Enhance context with source material
 */
export function enrichContextFromSources(
    sourceChunks: string[],
    stageObjective: string,
    keyPoints: string[]
): string {
    if (!sourceChunks || sourceChunks.length === 0) {
        return '';
    }

    // Find most relevant chunks based on objective and key points
    const searchTerms = [
        ...stageObjective.toLowerCase().split(/\s+/),
        ...keyPoints.flatMap(kp => kp.toLowerCase().split(/\s+/))
    ].filter(term => term.length > 3);

    const scoredChunks = sourceChunks.map(chunk => {
        const chunkLower = chunk.toLowerCase();
        const relevanceScore = searchTerms.reduce((score, term) => {
            return score + (chunkLower.includes(term) ? 1 : 0);
        }, 0);
        return { chunk, score: relevanceScore };
    });

    // Get top 3 most relevant chunks
    const topChunks = scoredChunks
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .filter(item => item.score > 0)
        .map(item => item.chunk);

    // Check if context is weakly related
    const topScore = scoredChunks.length > 0 ? scoredChunks.sort((a, b) => b.score - a.score)[0].score : 0;
    
    if (topChunks.length === 0 || topScore < 2) {
        return `NOTE: Retrieved context is only weakly related to this stage. 
Use it cautiously and ignore if it conflicts with the stage objective: "${stageObjective}".

${topChunks.length > 0 ? `WEAKLY RELATED SOURCE MATERIAL:\n${topChunks.join('\n\n---\n\n')}` : ''}`;
    }

    return `RELEVANT SOURCE MATERIAL:\n${topChunks.join('\n\n---\n\n')}\n\nUse this material as factual foundation, but transform it into engaging, story-driven content. Don't just paraphrase - add examples, scenarios, and practical applications.`;
}
