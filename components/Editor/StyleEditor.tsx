'use client';

import { useState } from 'react';
import { CourseConfig } from '@/types/course';

interface StyleEditorProps {
  config: CourseConfig;
  onUpdate: (config: CourseConfig) => void;
  onClose: () => void;
}

export default function StyleEditor({ config, onUpdate, onClose }: StyleEditorProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleUpdate = (updates: Partial<CourseConfig>) => {
    const updated = { ...localConfig, ...updates };
    setLocalConfig(updated);
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg1 border border-border rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Style Editor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg2 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Accent Colors */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Accent Color 1</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localConfig.accentColor1}
                onChange={(e) => handleUpdate({ accentColor1: e.target.value })}
                className="w-16 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={localConfig.accentColor1}
                onChange={(e) => handleUpdate({ accentColor1: e.target.value })}
                className="flex-1 p-2 border border-border rounded bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                placeholder="#4a90e2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Accent Color 2</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localConfig.accentColor2}
                onChange={(e) => handleUpdate({ accentColor2: e.target.value })}
                className="w-16 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={localConfig.accentColor2}
                onChange={(e) => handleUpdate({ accentColor2: e.target.value })}
                className="flex-1 p-2 border border-border rounded bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                placeholder="#50c9c3"
              />
            </div>
          </div>

          {/* Content Style */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Content Style</label>
            <select
              value={localConfig.contentStyle}
              onChange={(e) => handleUpdate({ contentStyle: e.target.value as 'formal' | 'conversational' | 'technical' })}
              className="w-full p-2 border border-border rounded bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
            >
              <option value="formal">Formal</option>
              <option value="conversational">Conversational</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          {/* Preview */}
          <div className="p-4 bg-bg2 border border-border rounded-lg">
            <h3 className="text-sm font-medium text-text-primary mb-3">Preview</h3>
            <div className="space-y-2">
              <div
                className="p-3 rounded"
                style={{
                  background: `linear-gradient(to right, ${localConfig.accentColor1}, ${localConfig.accentColor2})`,
                  color: 'white',
                }}
              >
                Sample gradient background
              </div>
              <button
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{
                  background: `linear-gradient(to right, ${localConfig.accentColor1}, ${localConfig.accentColor2})`,
                }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

