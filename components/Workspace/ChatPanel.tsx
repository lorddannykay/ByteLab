'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '@/types/courseCreation';
import { LightBulbIcon } from '@/components/Icons/AppleIcons';
import { motion, AnimatePresence } from 'framer-motion';
import SmartSuggestions from './SmartSuggestions';
import { generateSmartSuggestions, generateFallbackSuggestions, SmartSuggestion } from '@/lib/suggestions/smartSuggestions';

// Simple markdown-like renderer for chat messages
function renderFormattedText(text: string): React.ReactNode {
  // Split into lines first
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'numbered' | 'bullet' | null = null;
  
  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'numbered') {
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 ml-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-text-primary">{renderInlineFormatting(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2 ml-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-text-primary">{renderInlineFormatting(item)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    // Check for numbered list (1. 2. etc)
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (listType !== 'numbered') {
        flushList();
        listType = 'numbered';
      }
      listItems.push(numberedMatch[2]);
      return;
    }
    
    // Check for bullet list (- item, * item, • item)
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      if (listType !== 'bullet') {
        flushList();
        listType = 'bullet';
      }
      listItems.push(bulletMatch[1]);
      return;
    }
    
    // Flush any pending list
    flushList();
    
    // Check for headers
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={index} className="text-base font-bold text-text-primary mt-3 mb-1">
          {renderInlineFormatting(line.slice(3))}
        </h3>
      );
      return;
    }
    
    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />);
      return;
    }
    
    // Regular paragraph with inline formatting
    elements.push(
      <p key={index} className="text-text-primary">
        {renderInlineFormatting(line)}
      </p>
    );
  });
  
  // Flush remaining list
  flushList();
  
  return <div className="space-y-1">{elements}</div>;
}

// Handle inline formatting like **bold** and emojis
function renderInlineFormatting(text: string): React.ReactNode {
  // Replace **text** with bold spans
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-text-primary">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

interface ChatPanelProps {
  labTitle: string;
  courseTitle?: string;
  sourceCount: number;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  contentSummary?: string;
  suggestedQuestions?: string[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onExtractConfig?: () => void;
  hasConfig?: boolean;
  onGenerateCourse?: () => void;
  isGenerating?: boolean;
  hasOutline?: boolean;
  hasContent?: boolean;
}

interface QuickOption {
  text: string;
  action: () => void;
}

interface OnboardingState {
  step: number;
  answers: {
    topic?: string;
    audience?: string;
    objectives?: string;
    tone?: string;
    stageCount?: string;
  };
}

export default function ChatPanel({
  labTitle,
  courseTitle,
  sourceCount,
  messages,
  onSendMessage,
  isLoading,
  contentSummary,
  suggestedQuestions,
  isCollapsed,
  onToggleCollapse,
  onExtractConfig,
  hasConfig = false,
  onGenerateCourse,
  isGenerating = false,
  hasOutline = false,
  hasContent = false,
}: ChatPanelProps) {
  const title = courseTitle || labTitle;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(
    // Start onboarding if no sources and minimal conversation
    sourceCount === 0 && messages.length <= 1 ? { step: 0, answers: {} } : null
  );

  // Reset onboarding if user provides substantial conversation (more than just answers)
  useEffect(() => {
    if (onboarding && messages.length > 2) {
      // If conversation has progressed beyond simple Q&A, allow free-form conversation
      // Don't force onboarding - let AI handle it naturally
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content.length > 200) {
        // AI provided a substantial response, allow conversation to flow naturally
        // Keep onboarding state but don't force it
      }
    }
  }, [messages, onboarding]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate smart suggestions for the last assistant message (outside of map to avoid hooks violation)
  const lastAssistantMessage = useMemo(() => {
    return messages.filter(m => m.role === 'assistant').pop();
  }, [messages]);

  const smartSuggestionsForLastMessage = useMemo(() => {
    if (!lastAssistantMessage || !lastAssistantMessage.content) {
      return [];
    }
    
    const lastAssistantIndex = messages.findIndex(m => m === lastAssistantMessage);
    const isLastMessage = lastAssistantIndex === messages.length - 1;
    
    if (!isLastMessage) {
      return [];
    }

    try {
      return generateSmartSuggestions(
        messages,
        lastAssistantMessage.content,
        sourceCount > 0,
        hasOutline || false,
        hasContent || false
      );
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      // Fallback to string-based suggestions if available
      if (suggestedQuestions && suggestedQuestions.length > 0) {
        return suggestedQuestions.map((q, i) => ({
          text: q,
          type: 'question' as const,
          priority: 10 - i,
        }));
      }
      return generateFallbackSuggestions(messages, lastAssistantMessage.content);
    }
  }, [lastAssistantMessage, messages, sourceCount, hasOutline, hasContent, suggestedQuestions]);

  const onboardingQuestions = [
    { key: 'topic', question: "What topic would you like to teach? (e.g., 'Introduction to marine life of Bombay', 'JavaScript basics', 'Leadership skills')" },
    { key: 'audience', question: "Who is your target audience? (e.g., 'Beginners', 'Working professionals', 'Students aged 18-25')" },
    { key: 'objectives', question: "What learning objectives should learners achieve? (e.g., 'Understand core concepts', 'Apply skills in real scenarios', 'Master advanced techniques')" },
    { key: 'tone', question: "What tone/style do you prefer? (conversational, formal, technical, or friendly)" },
    { key: 'stageCount', question: "How many stages should the course have? (e.g., '5', '7', or 'Let AI decide')" },
  ];

  const handleOnboardingAnswer = (answer: string, shouldAdvance: boolean = true) => {
    if (!onboarding) return;
    
    const currentQuestion = onboardingQuestions[onboarding.step];
    const updatedAnswers = { ...onboarding.answers, [currentQuestion.key]: answer };
    
    // Only advance if explicitly told to, or if we're at the end
    if (shouldAdvance && onboarding.step < onboardingQuestions.length - 1) {
      // Move to next question after a delay to let AI respond
      setTimeout(() => {
        setOnboarding({ step: onboarding.step + 1, answers: updatedAnswers });
      }, 1500);
    } else if (onboarding.step >= onboardingQuestions.length - 1) {
      // Complete onboarding
      setOnboarding(null);
    } else {
      // Update answers but don't advance - user provided unrelated info
      setOnboarding({ ...onboarding, answers: updatedAnswers });
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    const userInput = input.trim();
    
    // Always send the message - let AI handle it naturally
    onSendMessage(userInput);
    
    // If in onboarding, try to extract answer but don't force advancement
    if (onboarding && onboarding.step < onboardingQuestions.length) {
      // Check if the user's input seems to directly answer the current question
      // If it's very short or seems like a direct answer, advance
      // Otherwise, let the AI handle it and don't force advancement
      const currentQuestion = onboardingQuestions[onboarding.step];
      const isDirectAnswer = userInput.length < 100 && 
        (userInput.toLowerCase().includes(currentQuestion.key) || 
         userInput.split(' ').length < 20);
      
      // Update answers but only advance if it seems like a direct answer
      handleOnboardingAnswer(userInput, isDirectAnswer);
    }
    
    setInput('');
  };

  const handleQuickOption = (option: string) => {
    if (isLoading) return; // Prevent clicking while loading
    
    // Check if this is a course generation action
    const generationKeywords = ['generate course', 'create course', 'build course', 'start building', 'create the full course', 'build my course', 'generate course outline', 'create course structure'];
    const isGenerationAction = generationKeywords.some(keyword => 
      option.toLowerCase().includes(keyword)
    );
    
    if (isGenerationAction && onGenerateCourse) {
      // Trigger course generation directly
      onGenerateCourse();
    } else {
      // Send as regular message
      onSendMessage(option);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-bg2 border-r border-border flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-bg3 rounded transition-colors"
          aria-label="Expand chat panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg1 flex flex-col h-full overflow-hidden" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary">{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</p>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-bg2 rounded transition-colors"
          aria-label="Collapse chat panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Summary */}
      {contentSummary && (
        <div className="flex-shrink-0 p-4 border-b border-border bg-bg2">
          <div className="prose prose-sm max-w-none text-text-primary">
            <div dangerouslySetInnerHTML={{ __html: contentSummary }} />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button 
              className="px-3 py-1 text-sm bg-bg3 rounded hover:bg-bg4 transition-colors text-text-primary"
              aria-label="Save to note"
            >
              Save to note
            </button>
            <button 
              className="p-1 hover:bg-bg4 rounded transition-colors"
              aria-label="Copy"
              onClick={() => {
                navigator.clipboard.writeText(contentSummary.replace(/<[^>]*>/g, ''));
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              className="p-1 hover:bg-bg4 rounded transition-colors"
              aria-label="Thumbs up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>
            <button 
              className="p-1 hover:bg-bg4 rounded transition-colors"
              aria-label="Thumbs down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17.5 13m-7 10v-5a2 2 0 012-2h2.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-scroll p-4 space-y-4 min-h-0 scrollbar-visible" 
        style={{ 
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 1,
          /* Add extra right padding to account for scrollbar */
          paddingRight: 'calc(1rem + 20px)',
          marginRight: '0'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center h-full text-text-secondary text-sm"
          >
            <p>Start a conversation by typing a message or clicking a suggested question above.</p>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isLastAssistant = message.role === 'assistant' && index === messages.length - 1;
            const isLastMessage = index === messages.length - 1;
            
            // Use pre-calculated smart suggestions only for the last assistant message
            const smartSuggestions = isLastAssistant && isLastMessage && message === lastAssistantMessage
              ? smartSuggestionsForLastMessage
              : [];
            
            const showQuickOptions = isLastAssistant && smartSuggestions.length > 0;
            
            return (
              <motion.div
                key={message.timestamp || index}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: message.role === 'user' ? 20 : -20 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.34, 1.56, 0.64, 1],
                  delay: index === messages.length - 1 ? 0 : 0
                }}
                layout
                className="space-y-2"
              >
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                    whileHover={{ scale: 1.02 }}
                    className={`max-w-[80%] rounded-xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-accent1 to-accent2 text-white shadow-lg shadow-accent1/20'
                        : 'bg-bg2 text-text-primary border border-border/50'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      renderFormattedText(message.content)
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </motion.div>
                </div>
              
              {/* Smart Suggestions after assistant messages */}
              {showQuickOptions && !isLoading && (
                <div className="flex justify-start pl-2 mb-4">
                  <div className="max-w-[80%]">
                    <SmartSuggestions
                      suggestions={smartSuggestions}
                      onSelectSuggestion={handleQuickOption}
                      onCustomInput={onSendMessage}
                      isLoading={isLoading}
                      showCustomInput={true}
                    />
                  </div>
                </div>
              )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg2 rounded-lg p-4">
              <p className="text-text-secondary">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Generate Course Button - Show when sources uploaded OR conversation has course outline */}
      {onGenerateCourse && (sourceCount > 0 || messages.length >= 3) && (
        <div className="p-4 border-t border-border bg-gradient-to-r from-accent1/10 to-accent2/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">
                Ready to generate your course?
              </p>
              <p className="text-xs text-text-secondary">
                {hasConfig 
                  ? 'Generate your interactive microlearning course with stages, quizzes, and more!'
                  : sourceCount > 0 
                    ? 'I\'ll extract the configuration from our conversation and generate your course.'
                    : 'I\'ll use our conversation to generate your course outline and content.'}
              </p>
            </div>
            <button
              onClick={onGenerateCourse}
              disabled={isLoading || isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Config Extraction Prompt - Show when no config but have messages */}
      {messages.length > 3 && !hasConfig && onExtractConfig && sourceCount > 0 && (
        <div className="p-4 border-t border-border bg-bg2">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary mb-2">
                Or extract configuration first?
              </p>
              <p className="text-xs text-text-secondary mb-3">
                I can extract the course configuration from our conversation before generating.
              </p>
              <button
                onClick={onExtractConfig}
                disabled={isLoading || isGenerating}
                className="px-4 py-2 text-sm bg-bg3 border border-border rounded-lg hover:bg-bg4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
              >
                Extract Course Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Questions */}
      {onboarding && onboarding.step < onboardingQuestions.length && (
        <div className="p-4 border-t border-border bg-gradient-to-r from-accent1/10 to-accent2/10">
          <div className="mb-3">
            <p className="text-sm font-semibold text-text-primary mb-1">
              Step {onboarding.step + 1} of {onboardingQuestions.length}
            </p>
            <div className="w-full bg-bg3 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-accent1 to-accent2 h-1.5 rounded-full transition-all"
                style={{ width: `${((onboarding.step + 1) / onboardingQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-sm font-medium text-text-primary mb-2">
            {onboardingQuestions[onboarding.step].question}
          </p>
          <p className="text-xs text-text-tertiary mb-3 italic">
            💡 You can also share any other information or ask questions - I'll adapt to your needs!
          </p>
          <div className="flex flex-wrap gap-2">
            {onboarding.step === 0 && (
              <>
                <button
                  onClick={() => handleOnboardingAnswer('Introduction to marine life of Bombay')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  Example: Marine life of Bombay
                </button>
              </>
            )}
            {onboarding.step === 3 && (
              <>
                <button
                  onClick={() => handleOnboardingAnswer('conversational')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  Conversational
                </button>
                <button
                  onClick={() => handleOnboardingAnswer('formal')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  Formal
                </button>
                <button
                  onClick={() => handleOnboardingAnswer('technical')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  Technical
                </button>
              </>
            )}
            {onboarding.step === 4 && (
              <>
                <button
                  onClick={() => handleOnboardingAnswer('5')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  5 stages
                </button>
                <button
                  onClick={() => handleOnboardingAnswer('7')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  7 stages
                </button>
                <button
                  onClick={() => handleOnboardingAnswer('Let AI decide')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary"
                >
                  Let AI decide
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Suggested Questions - Show when no messages or only initial message (and not in onboarding) */}
      {!onboarding && suggestedQuestions && suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="p-4 border-t border-border bg-bg2">
          <p className="text-xs text-text-secondary mb-3 font-medium flex items-center gap-1">
            <LightBulbIcon className="w-3 h-3" />
            Suggested questions to get started:
          </p>
          <SmartSuggestions
            suggestions={suggestedQuestions.map((q, i) => ({
              text: q,
              type: 'question' as const,
              priority: 10 - i,
            }))}
            onSelectSuggestion={handleQuickOption}
            onCustomInput={onSendMessage}
            isLoading={isLoading}
            showCustomInput={true}
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-bg1">
        <div className="flex gap-2 mb-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or click a quick response above..."
            className="flex-1 p-3 border border-border rounded-lg bg-bg2 resize-none focus:outline-none focus:ring-2 focus:ring-accent1 text-text-primary placeholder:text-text-tertiary"
            rows={2}
          />
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-text-secondary">{sourceCount} {sourceCount === 1 ? 'source' : 'sources'}</span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              →
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary">
            ByteLab can be inaccurate; please double check its responses.
          </p>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <kbd className="px-2 py-1 bg-bg2 border border-border rounded">Enter</kbd>
            <span>to send</span>
            <kbd className="px-2 py-1 bg-bg2 border border-border rounded">Shift+Enter</kbd>
            <span>for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
