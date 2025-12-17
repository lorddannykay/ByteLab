import { CourseConfig } from '@/types/course';

/**
 * Generate prompt for video-specific content
 * Video content should be concise, visual-focused, and readable on screen
 */
export function buildVideoPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints?: string[] },
  context?: string
): string {
  return `You are creating content for a typography-based video course. The text will be displayed on screen with animated typography.

IMPORTANT CONSTRAINTS:
- Each scene should be 5-15 words maximum (for readability on screen)
- Focus on key concepts, definitions, and takeaways
- Use action verbs and clear, punchy statements
- Break complex ideas into multiple short scenes if needed
- Make it visually impactful - think about how it will look animated
- Avoid long sentences or paragraphs

Course Topic: ${config.topic}
Course Title: ${config.title}
Target Audience: ${config.targetAudience || 'General learners'}

Current Stage:
- Stage ${stage.id}: ${stage.title}
- Objective: ${stage.objective}
${stage.keyPoints && stage.keyPoints.length > 0 ? `- Key Points: ${stage.keyPoints.join(', ')}` : ''}

${context ? `\nRelevant Context:\n${context}\n` : ''}

Generate 3-8 video scenes for this stage. Each scene should be a short, impactful statement that:
1. Teaches one specific concept or fact
2. Is visually engaging when displayed as animated typography
3. Builds on previous scenes logically
4. Uses clear, simple language

Return ONLY a JSON array of scene objects, each with:
{
  "id": number (sequential, starting from 1),
  "text": "Short, punchy text (5-15 words max)"
}

Example format:
[
  {"id": 1, "text": "APIs enable modularity. Build independently."},
  {"id": 2, "text": "Integrate seamlessly via clear interfaces."},
  {"id": 3, "text": "Teams collaborate without tight coupling."}
]

Generate the scenes now:`;
}



