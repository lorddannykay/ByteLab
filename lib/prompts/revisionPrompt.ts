import { CourseConfig } from '@/types/course';
import { ContentQualityScore } from './advancedPromptEngineering';

/**
 * Build revision prompt for low-quality content
 * Used when content quality score is below threshold
 */
export function buildRevisionPrompt(
  content: any,
  qualityScore: ContentQualityScore,
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] }
): string {
  return `The following content was generated but has quality issues. 
Please revise it to fix the specific problems listed below.

COURSE CONTEXT:
- Topic: ${config.topic}
- Stage: ${stage.title}
- Objective: ${stage.objective}
- Key Points: ${stage.keyPoints.join(', ')}

ISSUES TO FIX:
${qualityScore.issues.map(issue => `- ${issue}`).join('\n')}

${qualityScore.suggestions.length > 0 ? `SUGGESTIONS:\n${qualityScore.suggestions.map(s => `- ${s}`).join('\n')}` : ''}

${qualityScore.dimensions ? `QUALITY DIMENSIONS (focus on improving low scores):
- Resemblance (use of key concepts): ${qualityScore.dimensions.resemblance}/10
- Clarity (readability): ${qualityScore.dimensions.clarity}/10
- Applicability (scenarios): ${qualityScore.dimensions.applicability}/10

Focus on improving the dimensions with scores below 8.` : ''}

CURRENT CONTENT (JSON):
${JSON.stringify(content, null, 2)}

REVISION INSTRUCTIONS:
1. Fix ALL issues listed above
2. Maintain the same JSON structure exactly
3. Ensure content is about "${config.topic}" and "${stage.title}"
4. Improve the specific dimensions that scored low
5. Add specific examples, names, numbers, or locations relevant to "${config.topic}"
6. Remove any generic phrases or content not related to "${config.topic}"

Return ONLY the revised JSON object. No explanations, no markdown, no text before or after the JSON.`;

}

