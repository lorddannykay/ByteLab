import { providerManager } from '@/lib/ai/providers';
import { AIProvider } from '@/lib/ai/providers/types';
import { CourseCreationState } from '@/types/courseCreation';

export interface TagGenerationOptions {
  title: string;
  description?: string;
  topic?: string;
  stageTitles?: string[];
  stageObjectives?: string[];
  provider?: AIProvider;
}

/**
 * Generates relevant tags for a course using AI analysis
 * Returns 5-10 tags including topic keywords, difficulty level, content type, and subject area
 */
export async function generateCourseTags(
  options: TagGenerationOptions,
  courseState?: CourseCreationState
): Promise<string[]> {
  const {
    title,
    description = '',
    topic = '',
    stageTitles = [],
    stageObjectives = [],
    provider = 'together',
  } = options;

  // Get AI provider
  const aiProvider = providerManager.getProvider(provider);
  if (!aiProvider) {
    // Fallback to basic keyword extraction if AI provider is not available
    return extractBasicTags(title, description, topic);
  }

  // Build context from course state if available
  let stageContext = '';
  if (courseState?.courseData?.course?.stages) {
    const stages = courseState.courseData.course.stages;
    stageContext = stages
      .map((stage, idx) => `Stage ${idx + 1}: ${stage.title} - ${stage.objective || ''}`)
      .join('\n');
  } else if (stageTitles.length > 0) {
    stageContext = stageTitles
      .map((title, idx) => `Stage ${idx + 1}: ${title}`)
      .join('\n');
  }

  // Build the prompt for tag generation
  const prompt = `Analyze this course and generate 5-10 relevant tags that would help categorize and find it in a course library.

Course Title: ${title}
${description ? `Description: ${description}\n` : ''}
${topic ? `Topic: ${topic}\n` : ''}
${stageContext ? `Course Stages:\n${stageContext}\n` : ''}

Generate tags that include:
1. Main topic/subject keywords (2-3 tags)
2. Difficulty level (e.g., "beginner", "intermediate", "advanced")
3. Content type (e.g., "tutorial", "guide", "reference", "hands-on")
4. Subject area/category (e.g., "programming", "design", "business", "science")
5. Specific skills or concepts covered (2-3 tags)

Return ONLY a valid JSON array of tag strings. No explanations, no markdown, no text before or after. Just the JSON array.

Example format: ["javascript", "beginner", "tutorial", "web-development", "programming-basics"]`;

  try {
    const response = await aiProvider.generateJSON<string[]>(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates relevant tags for educational content. Return only valid JSON arrays of tag strings.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 200,
        retries: 1,
      }
    );

    // Validate and clean tags
    if (Array.isArray(response)) {
      const tags = response
        .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim().toLowerCase())
        .filter((tag, index, self) => self.indexOf(tag) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10 tags

      return tags.length > 0 ? tags : extractBasicTags(title, description, topic);
    }

    return extractBasicTags(title, description, topic);
  } catch (error) {
    console.error('Error generating tags with AI, falling back to basic extraction:', error);
    return extractBasicTags(title, description, topic);
  }
}

/**
 * Fallback function to extract basic tags from title, description, and topic
 * Used when AI generation fails or provider is unavailable
 */
function extractBasicTags(title: string, description: string, topic: string): string[] {
  const tags: string[] = [];
  const text = `${title} ${description} ${topic}`.toLowerCase();

  // Common educational tags
  const commonTags = [
    'beginner', 'intermediate', 'advanced',
    'tutorial', 'guide', 'reference', 'hands-on',
    'programming', 'design', 'business', 'science', 'technology',
  ];

  // Extract keywords from text
  const words = text
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that'].includes(word));

  // Add topic-related keywords
  if (topic) {
    const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    tags.push(...topicWords.slice(0, 3));
  }

  // Add title keywords
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  tags.push(...titleWords.slice(0, 2));

  // Add matching common tags
  commonTags.forEach(tag => {
    if (text.includes(tag) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });

  // Remove duplicates and limit
  return [...new Set(tags)].slice(0, 8);
}

