'use client';

import { useState } from 'react';

interface CodeData {
  language: string;
  code: string;
  runnable: boolean;
  title?: string;
}

interface CodeBlockProps {
  data: CodeData;
  onChange: (data: CodeData) => void;
  onDelete: () => void;
}

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'sql',
  'json', 'xml', 'yaml', 'markdown', 'bash', 'shell',
];

export default function CodeBlock({ data, onChange, onDelete }: CodeBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<CodeData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Code Editor</h3>
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
        <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
        <select
          value={localData.language}
          onChange={(e) => handleUpdate({ language: e.target.value })}
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Code</label>
        <textarea
          value={localData.code}
          onChange={(e) => handleUpdate({ code: e.target.value })}
          placeholder="// Your code here"
          className="w-full p-3 border border-border rounded bg-bg1 text-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
          rows={10}
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.runnable}
            onChange={(e) => handleUpdate({ runnable: e.target.checked })}
            className="w-4 h-4 text-accent1"
          />
          <span className="text-sm text-text-primary">Allow code execution (sandboxed)</span>
        </label>
      </div>

      {localData.title && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Title (optional)</label>
          <input
            type="text"
            value={localData.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Code example title"
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
      )}
    </div>
  );
}


