'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/courseCreation';
import { LightBulbIcon } from '@/components/Icons/AppleIcons';

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
}

interface QuickOption {
  text: string;
  action: () => void;
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
}: ChatPanelProps) {
  const title = courseTitle || labTitle;
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleQuickOption = (option: string) => {
    if (isLoading) return; // Prevent clicking while loading
    onSendMessage(option);
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
    <div className="flex-1 bg-bg1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
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
        <div className="p-4 border-b border-border bg-bg2">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-text-secondary text-sm">
            <p>Start a conversation by typing a message or clicking a suggested question above.</p>
          </div>
        )}
        {messages.map((message, index) => {
          const isLastAssistant = message.role === 'assistant' && index === messages.length - 1;
          const showQuickOptions = isLastAssistant && suggestedQuestions && suggestedQuestions.length > 0;
          
          return (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-accent1 to-accent2 text-white'
                      : 'bg-bg2 text-text-primary'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              
              {/* Quick Response Options after assistant messages */}
              {showQuickOptions && !isLoading && (
                <div className="flex justify-start pl-2">
                  <div className="max-w-[80%] space-y-2">
                    <p className="text-xs text-text-secondary mb-2 font-medium flex items-center gap-1">
                      <LightBulbIcon className="w-3 h-3" />
                      Quick responses:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.slice(0, 4).map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleQuickOption(option)}
                          disabled={isLoading}
                          className="px-3 py-2 text-xs bg-bg3 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary text-left shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg2 rounded-lg p-4">
              <p className="text-text-secondary">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Generate Course Button - Show when sources are uploaded */}
      {sourceCount > 0 && onGenerateCourse && (
        <div className="p-4 border-t border-border bg-gradient-to-r from-accent1/10 to-accent2/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">
                Ready to generate your course?
              </p>
              <p className="text-xs text-text-secondary">
                {hasConfig 
                  ? 'Generate your interactive microlearning course with stages, quizzes, and more!'
                  : 'I\'ll extract the configuration from our conversation and generate your course.'}
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

      {/* Suggested Questions - Show when no messages or only initial message */}
      {suggestedQuestions && suggestedQuestions.length > 0 && messages.length <= 1 && (
        <div className="p-4 border-t border-border bg-bg2">
          <p className="text-xs text-text-secondary mb-3 font-medium flex items-center gap-1">
            <LightBulbIcon className="w-3 h-3" />
            Suggested questions to get started:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickOption(question)}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-bg1 border border-border rounded-lg hover:bg-accent1/10 hover:border-accent1 transition-all text-text-primary text-left shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {question}
              </button>
            ))}
          </div>
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
