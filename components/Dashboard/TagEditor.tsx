'use client';

import { useState, useEffect, useRef } from 'react';
import { CourseMetadata } from '@/types/courseMetadata';

interface TagEditorProps {
  course: CourseMetadata;
  allCourses: CourseMetadata[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

export default function TagEditor({
  course,
  allCourses,
  isOpen,
  onClose,
  onSave,
}: TagEditorProps) {
  const [tags, setTags] = useState<string[]>(course.tags || []);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get all unique tags from all courses for autocomplete
  const allAvailableTags = Array.from(
    new Set(
      allCourses
        .flatMap(c => c.tags || [])
        .filter(tag => tag && tag.trim().length > 0)
    )
  ).sort();

  // Filter suggestions based on input
  const suggestions = inputValue.trim()
    ? allAvailableTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(tag)
        )
        .slice(0, 10)
    : [];

  useEffect(() => {
    if (isOpen) {
      setTags(course.tags || []);
      setInputValue('');
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, course]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = () => {
    onSave(tags);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div
        className="bg-bg1 border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">Edit Tags</h2>
              <p className="text-sm text-text-tertiary mt-1">{course.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-bg3 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Current Tags */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Current Tags ({tags.length})
              </label>
              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-bg2 border border-border rounded-lg">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent1/20 text-accent1 border border-accent1/30 rounded-lg text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-accent1/70 transition-colors"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-text-tertiary text-sm">No tags yet. Add some below.</span>
                )}
              </div>
            </div>

            {/* Add Tag Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Add Tags
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Type a tag and press Enter, or select from suggestions..."
                  className="w-full px-4 py-2.5 bg-bg2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent1/50 focus:border-accent1"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-bg1 border border-border rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg3 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-2">
                Press Enter to add a tag. Tags help organize and find your courses.
              </p>
            </div>

            {/* Suggested Tags */}
            {allAvailableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Popular Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allAvailableTags
                    .filter(tag => !tags.includes(tag))
                    .slice(0, 20)
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="px-3 py-1.5 text-sm bg-bg2 border border-border rounded-lg text-text-primary hover:bg-bg3 hover:border-accent1/30 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-bg2 text-text-primary hover:bg-bg3 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-accent1 to-accent2 text-white hover:opacity-90 transition-opacity"
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}

