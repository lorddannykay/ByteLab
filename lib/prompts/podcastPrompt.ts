import { CourseConfig } from '@/types/course';

/**
 * Generate prompt for podcast-specific content
 * Podcast content should be natural, conversational dialogue between host and expert
 */
export function buildPodcastPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints?: string[] },
  context?: string
): string {
  return `You are creating content for a conversational podcast episode. Two speakers will have a natural dialogue about the course topic.

IMPORTANT CONSTRAINTS:
- Generate natural, conversational dialogue between a HOST and an EXPERT
- Host asks questions, introduces topics, and transitions between sections
- Expert provides explanations, examples, and insights
- Use natural speech patterns, contractions, and conversational flow
- Each dialogue segment should be 2-4 sentences for natural pacing
- Make it sound like a real conversation, not a lecture
- Include natural transitions and follow-up questions

Course Topic: ${config.topic}
Course Title: ${config.title}
Target Audience: ${config.targetAudience || 'General learners'}

Current Stage:
- Stage ${stage.id}: ${stage.title}
- Objective: ${stage.objective}
${stage.keyPoints && stage.keyPoints.length > 0 ? `- Key Points: ${stage.keyPoints.join(', ')}` : ''}

${context ? `\nRelevant Context:\n${context}\n` : ''}

Generate 4-8 dialogue segments for this stage. Alternate between HOST and EXPERT speakers. The dialogue should:
1. Start with the host introducing the topic or asking a question
2. Have the expert provide clear, engaging explanations
3. Include natural follow-up questions from the host
4. Use real-world examples and analogies
5. Sound like a natural conversation, not scripted

Return ONLY a JSON array of dialogue objects, each with:
{
  "speaker": "host" | "expert",
  "text": "Natural conversational text (2-4 sentences)"
}

Example format:
[
  {"speaker": "host", "text": "So let's talk about APIs. What exactly are they, and why should developers care about them?"},
  {"speaker": "expert", "text": "Great question! An API, or Application Programming Interface, is essentially a contract for how different software components communicate. Think of it like a restaurant menu - it tells you what's available and how to order it, but you don't need to know how the kitchen works."},
  {"speaker": "host", "text": "That's a really helpful analogy! So APIs basically let different systems talk to each other without needing to understand each other's internal workings?"},
  {"speaker": "expert", "text": "Exactly! And that's what makes them so powerful. You can build a mobile app that uses Google Maps for location services, Stripe for payments, and Twitter for social sharing - all through their APIs, without having to build those features yourself."}
]

Generate the dialogue now:`;
}



