import { CourseConfig, CourseStage } from '@/types/course';

export function buildContentPrompt(
  config: CourseConfig,
  stage: { id: number; title: string; objective: string; keyPoints: string[] },
  context?: string
): string {
  return `You are creating content for Stage ${stage.id} of a microlearning course.

Course Context:
- Title: ${config.title}
- Topic: ${config.topic}
- Target Audience: ${config.targetAudience}
- Content Style: ${config.contentStyle}

Stage Details:
- Title: ${stage.title}
- Learning Objective: ${stage.objective}
- Key Points: ${stage.keyPoints.join(', ')}

${context ? `\nRelevant Context:\n${context}\n` : ''}

Create comprehensive, engaging content for this stage. Follow these requirements:

CONTENT REQUIREMENTS:
1. Introduction: Write 2-4 sentences (minimum 100 characters) that hook the learner and set context
2. Sections: Create at least 2 detailed sections covering each key point. Each section should:
   - Have a clear, descriptive heading
   - Contain 3-5 sentences of substantive content (not generic filler)
   - Include practical examples, steps, or scenarios when relevant
   - Use bullet points (items array) when listing multiple concepts
3. Summary: Provide 2-3 sentences summarizing key takeaways
4. Interactive Elements: Include 1-2 quiz questions that:
   - Test understanding of the stage content
   - Have 3-4 meaningful answer choices (NOT just letters like "A", "B", "C")
   - Each option must be a complete, descriptive answer (minimum 10 characters)
   - Include clear explanations for the correct answer
5. Side Card: Provide helpful tips, best practices, or relevant statistics

IMPORTANT: Quiz options must be actual meaningful answers, not placeholder letters.

Output as JSON matching this structure:
{
  "introduction": "Engaging opening paragraph that hooks the learner (minimum 100 characters)",
  "sections": [
    {
      "heading": "Descriptive section heading",
      "content": "Detailed, substantive content with examples and practical information (3-5 sentences minimum)",
      "type": "text",
      "items": ["Bullet point 1", "Bullet point 2"] // Optional: use for lists
    }
  ],
  "summary": "Key takeaways summary (2-3 sentences)",
  "interactiveElements": [
    {
      "type": "quiz",
      "data": {
        "question": "What is the main benefit of using this approach?",
        "options": [
          "It reduces processing time by 50% and improves accuracy",
          "It requires more manual intervention and increases costs",
          "It only works in specific environments with limited compatibility",
          "It provides no measurable improvements over traditional methods"
        ],
        "correctAnswer": "It reduces processing time by 50% and improves accuracy",
        "explanation": "This approach significantly reduces processing time while maintaining high accuracy, making it the optimal solution."
      }
    }
  ],
  "sideCard": {
    "title": "Pro Tips",
    "content": "Helpful information or relevant statistics",
    "tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"]
  }
}`;
}

