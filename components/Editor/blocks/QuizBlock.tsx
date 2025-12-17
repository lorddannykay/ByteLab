'use client';

import { useState } from 'react';

interface QuizData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizBlockProps {
  quiz: QuizData;
  onChange: (quiz: QuizData) => void;
  onDelete: () => void;
}

export default function QuizBlock({ quiz, onChange, onDelete }: QuizBlockProps) {
  const [localQuiz, setLocalQuiz] = useState(quiz);
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<QuizData>) => {
    const updated = { ...localQuiz, ...updates };
    setLocalQuiz(updated);
    onChange(updated);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...localQuiz.options];
    updatedOptions[index] = value;
    handleUpdate({ options: updatedOptions });
  };

  const handleAddOption = () => {
    handleUpdate({ options: [...localQuiz.options, 'New option'] });
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = localQuiz.options.filter((_, i) => i !== index);
    handleUpdate({ options: updatedOptions });
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Quiz Question</h3>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-500/20 rounded transition-colors"
          title="Delete quiz"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Question */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Question</label>
        <textarea
          value={localQuiz.question}
          onChange={(e) => handleUpdate({ question: e.target.value })}
          placeholder="Enter quiz question..."
          className="w-full p-3 border border-border rounded-lg bg-bg1 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
          rows={2}
        />
      </div>

      {/* Options */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Options</label>
        <div className="space-y-2">
          {localQuiz.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${localQuiz.question}`}
                checked={localQuiz.correctAnswer === option}
                onChange={() => handleUpdate({ correctAnswer: option })}
                className="w-4 h-4 text-accent1"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
              <button
                onClick={() => handleDeleteOption(index)}
                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                title="Delete option"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={handleAddOption}
          className="mt-2 text-sm text-accent1 hover:text-accent2 transition-colors"
        >
          + Add option
        </button>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">Explanation (optional)</label>
        <textarea
          value={localQuiz.explanation || ''}
          onChange={(e) => handleUpdate({ explanation: e.target.value })}
          placeholder="Explain why this is the correct answer..."
          className="w-full p-3 border border-border rounded-lg bg-bg1 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent1"
          rows={2}
        />
      </div>
    </div>
  );
}

