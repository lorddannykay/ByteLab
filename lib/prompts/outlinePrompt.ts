import { CourseConfig } from '@/types/course';

export function buildOutlinePrompt(config: CourseConfig, context?: string): string {
  return `You are an expert instructional designer creating a microlearning course.

Course Details:
- Title: ${config.title}
- Topic: ${config.topic}
- Description: ${config.description}
- Learning Objectives: ${config.objectives.join(', ')}
- Target Audience: ${config.targetAudience}
- Content Style: ${config.contentStyle}
- Number of Stages: ${config.stageCount}

${context ? `\nRelevant Context from Uploaded Files:\n${context}\n` : ''}

Create a detailed course outline with EXACTLY ${config.stageCount} stages. 

CRITICAL REQUIREMENTS:
- You MUST generate exactly ${config.stageCount} stages - no more, no less
- Each stage should:
  1. Have a clear, specific learning objective
  2. Build logically on previous stages
  3. Be completable in 3-10 minutes
  4. Include interactive elements where appropriate

CRITICAL: Respond with ONLY valid JSON. No text before or after. Complete the entire JSON structure.

Required JSON structure:
{
  "course": {
    "title": "${config.title}",
    "description": "${config.description}",
    "duration": "${config.estimatedDuration}",
    "stages": [
      {
        "id": 1,
        "title": "Stage title",
        "objective": "Learning objective",
        "keyPoints": ["key point 1", "key point 2"],
        "estimatedDuration": "3-5 minutes"
      }
    ]
  }
}

REMEMBER: Generate EXACTLY ${config.stageCount} stages in the stages array. Count them carefully before responding.`;
}

