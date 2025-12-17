'use client';

import { useState } from 'react';

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardData {
  cards: Flashcard[];
  title?: string;
}

interface FlashcardBlockProps {
  data: FlashcardData;
  onChange: (data: FlashcardData) => void;
  onDelete: () => void;
}

export default function FlashcardBlock({ data, onChange, onDelete }: FlashcardBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<FlashcardData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  const handleCardChange = (index: number, field: 'front' | 'back', value: string) => {
    const updatedCards = [...localData.cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    handleUpdate({ cards: updatedCards });
  };

  const handleAddCard = () => {
    handleUpdate({
      cards: [...localData.cards, { front: 'Front side', back: 'Back side' }],
    });
  };

  const handleDeleteCard = (index: number) => {
    handleUpdate({
      cards: localData.cards.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Flashcards</h3>
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

      {localData.title && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
          <input
            type="text"
            value={localData.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Flashcard set title"
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
      )}

      <div className="space-y-3">
        {localData.cards.map((card, index) => (
          <div key={index} className="p-3 bg-bg1 rounded border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-accent1">Card {index + 1}</span>
              <button
                onClick={() => handleDeleteCard(index)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Front</label>
                <textarea
                  value={card.front}
                  onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                  placeholder="Front side"
                  className="w-full p-2 border border-border rounded bg-bg2 text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Back</label>
                <textarea
                  value={card.back}
                  onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                  placeholder="Back side"
                  className="w-full p-2 border border-border rounded bg-bg2 text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={handleAddCard}
          className="text-sm text-accent1 hover:text-accent2 transition-colors"
        >
          + Add flashcard
        </button>
      </div>
    </div>
  );
}


