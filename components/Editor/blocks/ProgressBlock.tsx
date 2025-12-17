'use client';

import { useState } from 'react';

interface ProgressData {
  current: number;
  total: number;
  label: string;
  showPercentage?: boolean;
}

interface ProgressBlockProps {
  data: ProgressData;
  onChange: (data: ProgressData) => void;
  onDelete: () => void;
}

export default function ProgressBlock({ data, onChange, onDelete }: ProgressBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<ProgressData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  const percentage = localData.total > 0 ? (localData.current / localData.total) * 100 : 0;

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Progress Tracker</h3>
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
        <label className="block text-sm font-medium text-text-primary mb-2">Label</label>
        <input
          type="text"
          value={localData.label}
          onChange={(e) => handleUpdate({ label: e.target.value })}
          placeholder="Progress label"
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Current</label>
          <input
            type="number"
            value={localData.current}
            onChange={(e) => handleUpdate({ current: parseInt(e.target.value) || 0 })}
            min={0}
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Total</label>
          <input
            type="number"
            value={localData.total}
            onChange={(e) => handleUpdate({ total: parseInt(e.target.value) || 0 })}
            min={1}
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.showPercentage}
            onChange={(e) => handleUpdate({ showPercentage: e.target.checked })}
            className="w-4 h-4 text-accent1"
          />
          <span className="text-sm text-text-primary">Show percentage</span>
        </label>
      </div>

      {/* Preview */}
      <div className="p-3 bg-bg1 rounded border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-primary">{localData.label}</span>
          {localData.showPercentage && (
            <span className="text-sm text-text-secondary">{Math.round(percentage)}%</span>
          )}
        </div>
        <div className="w-full bg-bg2 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent1 to-accent2 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-text-secondary text-right">
          {localData.current} / {localData.total}
        </div>
      </div>
    </div>
  );
}


