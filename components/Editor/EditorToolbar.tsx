'use client';

import { SwatchIcon } from '@/components/Icons/AppleIcons';

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleStyleEditor: () => void;
  showStyleEditor: boolean;
}

export default function EditorToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleStyleEditor,
  showStyleEditor,
}: EditorToolbarProps) {
  return (
    <div className="glass glass-light border-b border-border/30 px-4 py-2 flex items-center gap-2">
      <div className="flex items-center gap-1 border-r border-border/30 pr-2 mr-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 glass-button rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 glass-button rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      <button
        onClick={onToggleStyleEditor}
        className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
          showStyleEditor
            ? 'bg-accent1 text-white'
            : 'glass-button text-text-primary'
        }`}
      >
        <SwatchIcon className="w-4 h-4" />
        Style
      </button>

      <div className="flex-1" />

      <div className="text-xs text-text-secondary">
        Press <kbd className="px-1.5 py-0.5 glass-button rounded">Ctrl+Z</kbd> to undo,{' '}
        <kbd className="px-1.5 py-0.5 glass-button rounded">Ctrl+Y</kbd> to redo
      </div>
    </div>
  );
}

