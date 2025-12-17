'use client';

import { useState, useEffect } from 'react';
import { PencilIcon, PlusIcon, ChevronDownIcon, DocumentTextIcon } from '@/components/Icons/AppleIcons';

interface InlineAIMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onAction: (action: 'rewrite' | 'expand' | 'simplify' | 'summarize') => void;
  onClose: () => void;
}

export default function InlineAIMenu({ selectedText, position, onAction, onClose }: InlineAIMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.inline-ai-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = async (action: 'rewrite' | 'expand' | 'simplify' | 'summarize') => {
    setIsProcessing(true);
    await onAction(action);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div
      className="inline-ai-menu fixed glass glass-panel rounded-xl shadow-lg z-50 p-3 min-w-[180px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 120}px`,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="text-xs text-text-secondary mb-2 px-2 font-medium">AI Actions</div>
      <div className="space-y-1">
        <button
          onClick={() => handleAction('rewrite')}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-sm text-left glass-button rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <PencilIcon className="w-4 h-4" />
          Rewrite
        </button>
        <button
          onClick={() => handleAction('expand')}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-sm text-left glass-button rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Expand
        </button>
        <button
          onClick={() => handleAction('simplify')}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-sm text-left glass-button rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <ChevronDownIcon className="w-4 h-4" />
          Simplify
        </button>
        <button
          onClick={() => handleAction('summarize')}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-sm text-left glass-button rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Summarize
        </button>
      </div>
      {isProcessing && (
        <div className="mt-2 pt-2 border-t border-border/30 text-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent1 mx-auto"></div>
        </div>
      )}
    </div>
  );
}

