'use client';

import { useState, useRef, useEffect } from 'react';
import InlineAIMenu from '../InlineAIMenu';

interface TextBlockProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  onAIAction?: (action: 'rewrite' | 'expand' | 'simplify' | 'summarize', selectedText: string) => Promise<string>;
}

export default function TextBlock({ value, onChange, placeholder, label, onAIAction }: TextBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [selectedText, setSelectedText] = useState<string>('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(localValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  const handleTextSelection = () => {
    if (isEditing && textareaRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 10) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(selectedText);
          setMenuPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }
      }
    } else if (!isEditing && displayRef.current) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim();
        if (selectedText.length > 10) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectedText(selectedText);
          setMenuPosition({
            x: rect.left + rect.width / 2,
            y: rect.top,
          });
        }
      }
    }
  };

  const handleAIAction = async (action: 'rewrite' | 'expand' | 'simplify' | 'summarize') => {
    if (!onAIAction || !selectedText) return;

    try {
      const result = await onAIAction(action, selectedText);
      // Replace selected text with result
      if (isEditing && textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = localValue.substring(0, start) + result + localValue.substring(end);
        setLocalValue(newValue);
        onChange(newValue);
      } else {
        // Replace in display mode - would need to track selection position
        const newValue = value.replace(selectedText, result);
        onChange(newValue);
      }
      setMenuPosition(null);
      setSelectedText('');
    } catch (error) {
      console.error('AI action error:', error);
      alert('Failed to process AI action');
    }
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onMouseUp={handleTextSelection}
          placeholder={placeholder}
          className="w-full p-3 border-2 border-accent1 rounded-lg bg-bg1 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
          rows={Math.max(3, localValue.split('\n').length)}
        />
        <p className="text-xs text-text-secondary mt-1">Press Enter to save, Escape to cancel. Select text for AI actions.</p>
        {menuPosition && selectedText && (
          <InlineAIMenu
            selectedText={selectedText}
            position={menuPosition}
            onAction={handleAIAction}
            onClose={() => {
              setMenuPosition(null);
              setSelectedText('');
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>}
      <div
        ref={displayRef}
        onMouseUp={handleTextSelection}
        onClick={() => {
          if (!menuPosition) {
            setIsEditing(true);
          }
        }}
        className="p-3 border border-border rounded-lg bg-bg2 hover:border-accent1 cursor-text transition-colors min-h-[60px]"
      >
        {value || (
          <span className="text-text-tertiary italic">{placeholder || 'Click to edit...'}</span>
        )}
      </div>
      {menuPosition && selectedText && (
        <InlineAIMenu
          selectedText={selectedText}
          position={menuPosition}
          onAction={handleAIAction}
          onClose={() => {
            setMenuPosition(null);
            setSelectedText('');
          }}
        />
      )}
    </div>
  );
}

