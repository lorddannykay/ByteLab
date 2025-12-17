'use client';

import { useState } from 'react';

interface AudioData {
  url: string;
  title: string;
  description?: string;
}

interface AudioBlockProps {
  data: AudioData;
  onChange: (data: AudioData) => void;
  onDelete: () => void;
}

export default function AudioBlock({ data, onChange, onDelete }: AudioBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<AudioData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Audio Player</h3>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-500/20 rounded transition-colors"
          title="Delete component"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Audio URL</label>
        <input
          type="text"
          value={localData.url}
          onChange={(e) => handleUpdate({ url: e.target.value })}
          placeholder="https://... or /audio/file.mp3"
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
        <input
          type="text"
          value={localData.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="Audio title"
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>

      {localData.url && (
        <div className="mb-4 p-3 bg-bg1 rounded border border-border">
          <audio controls className="w-full">
            <source src={localData.url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Description (optional)</label>
        <textarea
          value={localData.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          placeholder="Audio description"
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
          rows={2}
        />
      </div>
    </div>
  );
}


