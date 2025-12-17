'use client';

import { useState } from 'react';

interface DragDropItem {
  id: string;
  label: string;
  match: string;
}

interface DragDropData {
  items: DragDropItem[];
  instruction?: string;
}

interface DragDropBlockProps {
  data: DragDropData;
  onChange: (data: DragDropData) => void;
  onDelete: () => void;
}

export default function DragDropBlock({ data, onChange, onDelete }: DragDropBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<DragDropData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  const handleItemChange = (index: number, field: 'label' | 'match', value: string) => {
    const updatedItems = [...localData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleUpdate({ items: updatedItems });
  };

  const handleAddItem = () => {
    handleUpdate({
      items: [
        ...localData.items,
        { id: `item-${Date.now()}`, label: 'Item', match: 'Match' },
      ],
    });
  };

  const handleDeleteItem = (index: number) => {
    handleUpdate({
      items: localData.items.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Drag & Drop Exercise</h3>
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
        <label className="block text-sm font-medium text-text-primary mb-2">Instruction</label>
        <input
          type="text"
          value={localData.instruction || ''}
          onChange={(e) => handleUpdate({ instruction: e.target.value })}
          placeholder="Drag items to match..."
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary mb-2">Items to Match</label>
        {localData.items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 p-2 bg-bg1 rounded border border-border">
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleItemChange(index, 'label', e.target.value)}
              placeholder="Item label"
              className="flex-1 p-2 border border-border rounded bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
            />
            <span className="text-text-secondary">→</span>
            <input
              type="text"
              value={item.match}
              onChange={(e) => handleItemChange(index, 'match', e.target.value)}
              placeholder="Match to"
              className="flex-1 p-2 border border-border rounded bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
            />
            <button
              onClick={() => handleDeleteItem(index)}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        <button
          onClick={handleAddItem}
          className="text-sm text-accent1 hover:text-accent2 transition-colors"
        >
          + Add item pair
        </button>
      </div>
    </div>
  );
}


