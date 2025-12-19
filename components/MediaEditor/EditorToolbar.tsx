'use client';

import { EditorTool } from '@/lib/canvas/canvasUtils';

interface EditorToolbarProps {
  currentTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onExport?: () => void;
}

export default function EditorToolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onExport,
}: EditorToolbarProps) {
  const tools: Array<{ id: EditorTool; label: string; icon: string }> = [
    { id: 'select', label: 'Select', icon: '↖' },
    { id: 'text', label: 'Text', icon: 'T' },
    { id: 'rectangle', label: 'Rectangle', icon: '▭' },
    { id: 'circle', label: 'Circle', icon: '○' },
    { id: 'line', label: 'Line', icon: '─' },
    { id: 'image', label: 'Image', icon: '🖼' },
  ];

  return (
    <div className="flex items-center gap-2 p-3 bg-bg1 border-b border-border">
      {/* Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-accent1 text-white'
                : 'bg-bg2 text-text-primary hover:bg-bg3'
            }`}
            title={tool.label}
          >
            <span className="text-lg font-semibold">{tool.icon}</span>
          </button>
        ))}
      </div>

      {/* History */}
      {(onUndo || onRedo) && (
        <div className="flex items-center gap-1 border-r border-border pr-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-3 py-2 rounded-lg bg-bg2 text-text-primary hover:bg-bg3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-3 py-2 rounded-lg bg-bg2 text-text-primary hover:bg-bg3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Export */}
      {onExport && (
        <div className="ml-auto">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Export
          </button>
        </div>
      )}
    </div>
  );
}

