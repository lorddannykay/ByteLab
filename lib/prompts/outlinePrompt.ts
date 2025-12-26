import { CourseConfig } from '@/types/course';

export function buildOutlinePrompt(config: CourseConfig, context?: string): string {
  // Safely handle potentially undefined or null values
  const objectives = config.objectives && Array.isArray(config.objectives) && config.objectives.length > 0 
    ? config.objectives.join(', ') 
    : 'Learn the key concepts of the topic';
  
  return `You are an expert instructional designer creating a microlearning course.

Course Details:
- Title: ${config.title || 'Untitled Course'}
- Topic: ${config.topic || 'General'}
- Description: ${config.description || 'A microlearning course'}
- Learning Objectives: ${objectives}
- Target Audience: ${config.targetAudience || 'General audience'}
- Content Style: ${config.contentStyle || 'conversational'}
- Number of Stages: ${config.stageCount && config.stageCount > 0 ? config.stageCount : 5}

${context ? `\nRelevant Context from Uploaded Files:\n${context}\n` : ''}

Create a detailed course outline with EXACTLY ${config.stageCount && config.stageCount > 0 ? config.stageCount : 5} stages. 

CRITICAL REQUIREMENTS:
- You MUST generate exactly ${config.stageCount && config.stageCount > 0 ? config.stageCount : 5} stages - no more, no less
- Each stage should:
  1. Have a clear, specific learning objective
  2. Build logically on previous stages
  3. Be completable in 3-10 minutes
  4. Include interactive elements where appropriate

Return ONLY a single, valid JSON object that strictly follows the schema below. 
No explanations, no markdown, no text before or after the JSON.

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

CRITICAL FIELD RESTRICTIONS:
- Do not include any fields other than course, title, description, duration, and stages
- Do not include null or undefined values
- All fields must have valid string values (except stages which is an array)

Before responding, silently count the stages you are about to output and confirm 
they are EXACTLY ${config.stageCount && config.stageCount > 0 ? config.stageCount : 5} in the stages array.

// TypeScript-style schema hint (do not explain, just follow)
interface CourseOutline {
  course: {
    title: string;
    description: string;
    duration: string;
    stages: Array<{
      id: number;
      title: string;
      objective: string;
      keyPoints: string[];
      estimatedDuration: string;
    }>;
  };
}

REMEMBER: Generate EXACTLY ${config.stageCount && config.stageCount > 0 ? config.stageCount : 5} stages in the stages array. Count them carefully before responding.`;
}

