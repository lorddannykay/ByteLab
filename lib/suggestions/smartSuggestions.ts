import { ChatMessage } from '@/lib/ai/providers/types';
import { analyzeConversationContext, ConversationContext, CourseCreationStage } from './contextAnalyzer';

export interface SmartSuggestion {
  text: string;
  type: 'question' | 'action' | 'clarification' | 'progression';
  priority: number;
}

/**
 * Generates smart, context-aware suggestions based on conversation stage and context
 */
export function generateSmartSuggestions(
  messages: ChatMessage[],
  aiResponse: string,
  hasSources: boolean = false,
  hasOutline: boolean = false,
  hasContent: boolean = false
): SmartSuggestion[] {
  const context = analyzeConversationContext(messages, hasSources, hasOutline, hasContent);
  const suggestions: SmartSuggestion[] = [];

  // Generate stage-specific suggestions
  switch (context.stage) {
    case 'discovery':
      suggestions.push(...generateDiscoverySuggestions(context, aiResponse));
      break;
    case 'planning':
      suggestions.push(...generatePlanningSuggestions(context, aiResponse));
      break;
    case 'content':
      suggestions.push(...generateContentSuggestions(context, aiResponse));
      break;
    case 'refinement':
      suggestions.push(...generateRefinementSuggestions(context, aiResponse));
      break;
  }

  // Sort by priority and return top 4
  return suggestions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);
}

function generateDiscoverySuggestions(
  context: ConversationContext,
  aiResponse: string
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const responseLower = aiResponse.toLowerCase();

  if (!context.topic) {
    suggestions.push({
      text: 'What topic would you like to teach?',
      type: 'question',
      priority: 10,
    });
    suggestions.push({
      text: 'Help me choose a course topic',
      type: 'clarification',
      priority: 9,
    });
  } else if (!context.audience) {
    suggestions.push({
      text: 'Who is your target audience?',
      type: 'question',
      priority: 10,
    });
    suggestions.push({
      text: 'Help me define my learners',
      type: 'clarification',
      priority: 9,
    });
  } else if (!context.objectives || context.objectives.length === 0) {
    suggestions.push({
      text: 'What are the learning objectives?',
      type: 'question',
      priority: 10,
    });
    suggestions.push({
      text: 'Help me define clear goals',
      type: 'clarification',
      priority: 9,
    });
  } else {
    suggestions.push({
      text: 'Generate course outline',
      type: 'action',
      priority: 10,
    });
    suggestions.push({
      text: 'Create course structure',
      type: 'action',
      priority: 9,
    });
    suggestions.push({
      text: 'Start building my course',
      type: 'progression',
      priority: 8,
    });
  }

  // Add contextual suggestions based on AI response
  if (responseLower.includes('topic') || responseLower.includes('subject')) {
    suggestions.push({
      text: 'Tell me more about this topic',
      type: 'question',
      priority: 8,
    });
  }

  if (responseLower.includes('audience') || responseLower.includes('learner')) {
    suggestions.push({
      text: 'What background do learners need?',
      type: 'question',
      priority: 8,
    });
  }

  return suggestions;
}

function generatePlanningSuggestions(
  context: ConversationContext,
  aiResponse: string
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const responseLower = aiResponse.toLowerCase();

  if (!context.hasOutline) {
    suggestions.push({
      text: 'Generate course outline',
      type: 'action',
      priority: 10,
    });
    suggestions.push({
      text: 'Create the course structure',
      type: 'action',
      priority: 9,
    });
    suggestions.push({
      text: 'How many stages should the course have?',
      type: 'question',
      priority: 8,
    });
  } else {
    suggestions.push({
      text: 'Generate course content',
      type: 'action',
      priority: 10,
    });
    suggestions.push({
      text: 'Create the full course',
      type: 'progression',
      priority: 9,
    });
    suggestions.push({
      text: 'Build my course now',
      type: 'progression',
      priority: 8,
    });
  }

  if (responseLower.includes('outline') || responseLower.includes('structure')) {
    suggestions.push({
      text: 'Review the outline',
      type: 'action',
      priority: 7,
    });
  }

  return suggestions;
}

function generateContentSuggestions(
  context: ConversationContext,
  aiResponse: string
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const responseLower = aiResponse.toLowerCase();

  suggestions.push({
    text: 'Generate course content',
    type: 'action',
    priority: 10,
  });

  if (!context.hasSources) {
    suggestions.push({
      text: 'Add source materials',
      type: 'action',
      priority: 8,
    });
  }

  suggestions.push({
    text: 'Add interactive elements',
    type: 'action',
    priority: 7,
  });

  if (responseLower.includes('content') || responseLower.includes('material')) {
    suggestions.push({
      text: 'What content should I include?',
      type: 'question',
      priority: 6,
    });
  }

  return suggestions;
}

function generateRefinementSuggestions(
  context: ConversationContext,
  aiResponse: string
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  suggestions.push({
    text: 'Review and edit course',
    type: 'action',
    priority: 10,
  });

  suggestions.push({
    text: 'Add more content',
    type: 'action',
    priority: 9,
  });

  suggestions.push({
    text: 'Export course',
    type: 'action',
    priority: 8,
  });

  suggestions.push({
    text: 'Preview course',
    type: 'action',
    priority: 7,
  });

  return suggestions;
}

/**
 * Generates fallback suggestions when context analysis fails
 */
export function generateFallbackSuggestions(
  messages: ChatMessage[],
  aiResponse: string
): SmartSuggestion[] {
  const responseLower = aiResponse.toLowerCase();
  const suggestions: SmartSuggestion[] = [];

  // Generic but helpful suggestions
  if (messages.length === 0 || messages.length === 1) {
    suggestions.push(
      { text: 'What topic would you like to teach?', type: 'question', priority: 10 },
      { text: 'Help me get started', type: 'clarification', priority: 9 },
      { text: 'How do I create a course?', type: 'question', priority: 8 }
    );
  } else {
    suggestions.push(
      { text: 'Tell me more', type: 'question', priority: 8 },
      { text: 'What should I do next?', type: 'question', priority: 7 },
      { text: 'Help me continue', type: 'clarification', priority: 6 }
    );
  }

  // Add response-specific suggestions
  if (responseLower.includes('outline')) {
    suggestions.push({ text: 'Show me the outline', type: 'action', priority: 9 });
  }
  if (responseLower.includes('content')) {
    suggestions.push({ text: 'Generate content', type: 'action', priority: 9 });
  }
  if (responseLower.includes('objective') || responseLower.includes('goal')) {
    suggestions.push({ text: 'Define objectives', type: 'action', priority: 9 });
  }

  return suggestions.slice(0, 4);
}

