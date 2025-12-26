import { ChatMessage } from '@/lib/ai/providers/types';

export type CourseCreationStage = 
  | 'discovery'      // Exploring topic, initial questions
  | 'planning'       // Defining objectives, audience, structure
  | 'content'        // Generating content, adding materials
  | 'refinement';    // Reviewing, editing, finalizing

export interface ConversationContext {
  stage: CourseCreationStage;
  topic?: string;
  audience?: string;
  objectives?: string[];
  hasOutline: boolean;
  hasContent: boolean;
  hasSources: boolean;
  missingInfo: string[];
  nextSteps: string[];
}

/**
 * Analyzes conversation history to extract context and determine current stage
 */
export function analyzeConversationContext(
  messages: ChatMessage[],
  hasSources: boolean = false,
  hasOutline: boolean = false,
  hasContent: boolean = false
): ConversationContext {
  const context: ConversationContext = {
    stage: 'discovery',
    hasOutline,
    hasContent,
    hasSources,
    missingInfo: [],
    nextSteps: [],
  };

  // Extract all text from conversation
  const conversationText = messages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Extract topic
  const topicPatterns = [
    /(?:topic|course|teach|learn|about|subject).{0,50}?([a-z][a-z\s]{10,50}?)(?:course|learn|teach|about|subject|\.|$)/i,
    /(?:create|build|make|generate).{0,30}?course.{0,30}?about.{0,30}?([a-z][a-z\s]{10,50}?)(?:\.|$)/i,
    /(?:i want|i'd like|i need).{0,30}?to.{0,30}?(?:teach|create|build).{0,30}?([a-z][a-z\s]{10,50}?)(?:\.|$)/i,
  ];

  for (const pattern of topicPatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      context.topic = match[1].trim();
      break;
    }
  }

  // Extract audience
  const audiencePatterns = [
    /(?:audience|learners|students|for|target).{0,30}?([a-z][a-z\s]{5,40}?)(?:\.|$)/i,
    /(?:beginners|professionals|students|adults|kids|children)/i,
  ];

  for (const pattern of audiencePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      context.audience = match[1].trim();
      break;
    }
  }

  // Extract objectives
  const objectiveKeywords = ['objective', 'goal', 'learn', 'achieve', 'understand', 'master', 'skill'];
  const objectives: string[] = [];
  messages.forEach(msg => {
    if (msg.role === 'user') {
      objectiveKeywords.forEach(keyword => {
        if (msg.content.toLowerCase().includes(keyword)) {
          // Extract sentence or phrase containing the keyword
          const sentences = msg.content.split(/[.!?]/);
          sentences.forEach(sentence => {
            if (sentence.toLowerCase().includes(keyword) && sentence.length > 20) {
              objectives.push(sentence.trim());
            }
          });
        }
      });
    }
  });
  if (objectives.length > 0) {
    context.objectives = objectives.slice(0, 3);
  }

  // Determine stage based on conversation and state
  if (hasContent) {
    context.stage = 'refinement';
  } else if (hasOutline) {
    context.stage = 'content';
  } else if (context.topic && (context.audience || context.objectives?.length)) {
    context.stage = 'planning';
  } else if (context.topic || messages.length > 2) {
    context.stage = 'discovery';
  }

  // Identify missing information
  if (!context.topic && messages.length > 0) {
    context.missingInfo.push('topic');
  }
  if (!context.audience && context.stage !== 'discovery') {
    context.missingInfo.push('audience');
  }
  if (!context.objectives || context.objectives.length === 0) {
    if (context.stage !== 'discovery') {
      context.missingInfo.push('objectives');
    }
  }

  // Determine next steps based on stage
  switch (context.stage) {
    case 'discovery':
      if (!context.topic) {
        context.nextSteps.push('define_topic');
      } else if (!context.audience) {
        context.nextSteps.push('define_audience');
      } else {
        context.nextSteps.push('define_objectives');
      }
      break;
    case 'planning':
      if (!hasOutline) {
        context.nextSteps.push('create_outline');
      } else {
        context.nextSteps.push('generate_content');
      }
      break;
    case 'content':
      context.nextSteps.push('generate_content');
      context.nextSteps.push('add_materials');
      break;
    case 'refinement':
      context.nextSteps.push('review_content');
      context.nextSteps.push('edit_course');
      context.nextSteps.push('export_course');
      break;
  }

  return context;
}

/**
 * Extracts key entities from conversation
 */
export function extractEntities(messages: ChatMessage[]): {
  topics: string[];
  keywords: string[];
  questions: string[];
} {
  const topics: string[] = [];
  const keywords: string[] = [];
  const questions: string[] = [];

  messages.forEach(msg => {
    const content = msg.content;
    
    // Extract questions
    const questionMatches = content.match(/[^.!?]*\?/g);
    if (questionMatches) {
      questions.push(...questionMatches.map(q => q.trim()));
    }

    // Extract potential topics (capitalized phrases)
    const topicMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}\b/g);
    if (topicMatches) {
      topics.push(...topicMatches);
    }

    // Extract keywords (important terms)
    const importantWords = content.match(/\b(?:course|learn|teach|objective|audience|stage|content|outline|module|lesson|quiz|assessment)\w*/gi);
    if (importantWords) {
      keywords.push(...importantWords.map(w => w.toLowerCase()));
    }
  });

  return {
    topics: [...new Set(topics)].slice(0, 5),
    keywords: [...new Set(keywords)].slice(0, 10),
    questions: [...new Set(questions)].slice(0, 5),
  };
}

