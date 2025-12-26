'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartSuggestion } from '@/lib/suggestions/smartSuggestions';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onSelectSuggestion: (text: string) => void;
  onCustomInput: (text: string) => void;
  isLoading?: boolean;
  showCustomInput?: boolean;
}

export default function SmartSuggestions({
  suggestions,
  onSelectSuggestion,
  onCustomInput,
  isLoading = false,
  showCustomInput = true,
}: SmartSuggestionsProps) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleCustomSubmit = () => {
    if (customText.trim() && !isLoading) {
      onCustomInput(customText.trim());
      setCustomText('');
      setShowTextInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    } else if (e.key === 'Escape') {
      setShowTextInput(false);
      setCustomText('');
    }
  };

  const getSuggestionIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'question':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'action':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'clarification':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'progression':
        return (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
    }
  };

  const getSuggestionColor = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'question':
        return 'bg-accent1/10 border-accent1/30 text-accent1 hover:bg-accent1/20';
      case 'action':
        return 'bg-gradient-to-r from-accent1/20 to-accent2/20 border-accent1/40 text-accent1 hover:from-accent1/30 hover:to-accent2/30';
      case 'clarification':
        return 'bg-bg3 border-border text-text-primary hover:bg-bg2';
      case 'progression':
        return 'bg-gradient-to-r from-accent1 to-accent2 border-transparent text-white hover:opacity-90';
    }
  };

  if (suggestions.length === 0 && !showCustomInput) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* AI-Generated Suggestions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.text}-${index}`}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                onClick={() => !isLoading && onSelectSuggestion(suggestion.text)}
                disabled={isLoading}
                className={`
                  px-3 py-2 text-xs rounded-lg border transition-all
                  flex items-center gap-1.5 text-left shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${getSuggestionColor(suggestion.type)}
                `}
              >
                {getSuggestionIcon(suggestion.type)}
                <span className="flex-1">{suggestion.text}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Custom Input Option */}
      {showCustomInput && (
        <AnimatePresence mode="wait">
          {!showTextInput ? (
            <motion.button
              key="show-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setShowTextInput(true)}
              disabled={isLoading}
              className="px-3 py-2 text-xs rounded-lg border border-border bg-bg2 text-text-primary hover:bg-bg3 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Or type your own...</span>
            </motion.button>
          ) : (
            <motion.div
              key="text-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                autoFocus
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-bg2 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent1/50 focus:border-accent1 disabled:opacity-50"
              />
              <button
                onClick={handleCustomSubmit}
                disabled={isLoading || !customText.trim()}
                className="px-3 py-2 text-xs rounded-lg bg-gradient-to-r from-accent1 to-accent2 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setCustomText('');
                }}
                disabled={isLoading}
                className="px-2 py-2 text-xs rounded-lg border border-border bg-bg2 text-text-primary hover:bg-bg3 transition-colors disabled:opacity-50"
                aria-label="Cancel"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

