'use client';

import { useState } from 'react';

interface ListBlockProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export default function ListBlock({ items, onChange }: ListBlockProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState(items);

  const handleItemChange = (index: number, value: string) => {
    const updated = [...localItems];
    updated[index] = value;
    setLocalItems(updated);
  };

  const handleItemBlur = (index: number) => {
    onChange(localItems);
    setEditingIndex(null);
  };

  const handleAddItem = () => {
    const updated = [...localItems, 'New item'];
    setLocalItems(updated);
    setEditingIndex(updated.length - 1);
    onChange(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = localItems.filter((_, i) => i !== index);
    setLocalItems(updated);
    onChange(updated);
  };

  return (
    <div className="mb-4">
      <ul className="list-disc list-inside space-y-2">
        {localItems.map((item, index) => (
          <li key={index} className="flex items-center gap-2 group">
            {editingIndex === index ? (
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
                onBlur={() => handleItemBlur(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleItemBlur(index);
                  }
                  if (e.key === 'Escape') {
                    setLocalItems(items);
                    setEditingIndex(null);
                  }
                }}
                className="flex-1 p-2 border-2 border-accent1 rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                autoFocus
              />
            ) : (
              <>
                <span
                  onClick={() => setEditingIndex(index)}
                  className="flex-1 cursor-text hover:text-accent1 transition-colors"
                >
                  {item || <span className="text-text-tertiary italic">Click to edit...</span>}
                </span>
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                  title="Delete item"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={handleAddItem}
        className="mt-2 text-sm text-accent1 hover:text-accent2 transition-colors"
      >
        + Add item
      </button>
    </div>
  );
}

