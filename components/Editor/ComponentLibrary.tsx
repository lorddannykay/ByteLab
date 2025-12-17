'use client';

import { useState } from 'react';
import { 
  QuestionMarkIcon, 
  ArrowPathIcon, 
  VideoCameraIcon, 
  SpeakerWaveIcon, 
  CodeBracketIcon, 
  ChartBarIcon, 
  RectangleStackIcon, 
  PresentationChartLineIcon 
} from '@/components/Icons/AppleIcons';

interface ComponentLibraryProps {
  onAddComponent: (type: string, data?: any) => void;
  onClose: () => void;
}

const componentTypes = [
  { id: 'quiz', label: 'Quiz', Icon: QuestionMarkIcon, description: 'Multiple choice, true/false questions' },
  { id: 'dragdrop', label: 'Drag & Drop', Icon: ArrowPathIcon, description: 'Match items, order sequences' },
  { id: 'video', label: 'Video', Icon: VideoCameraIcon, description: 'Embed YouTube, Vimeo, or uploaded video' },
  { id: 'audio', label: 'Audio', Icon: SpeakerWaveIcon, description: 'Audio player with controls' },
  { id: 'code', label: 'Code Editor', Icon: CodeBracketIcon, description: 'Syntax highlighting, run code' },
  { id: 'diagram', label: 'Interactive Diagram', Icon: ChartBarIcon, description: 'Clickable hotspots, expandable' },
  { id: 'flashcard', label: 'Flashcards', Icon: RectangleStackIcon, description: 'Flip cards for key concepts' },
  { id: 'progress', label: 'Progress Tracker', Icon: PresentationChartLineIcon, description: 'Visual progress bars' },
];

export default function ComponentLibrary({ onAddComponent, onClose }: ComponentLibraryProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAdd = (type: string) => {
    let defaultData: any = {};

    switch (type) {
      case 'quiz':
        defaultData = {
          question: 'What is the main concept?',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 'Option 1',
          explanation: 'This is the correct answer because...',
        };
        break;
      case 'dragdrop':
        defaultData = {
          items: [
            { id: '1', label: 'Item 1', match: 'Match 1' },
            { id: '2', label: 'Item 2', match: 'Match 2' },
          ],
        };
        break;
      case 'video':
        defaultData = {
          url: '',
          type: 'youtube', // youtube, vimeo, upload
        };
        break;
      case 'audio':
        defaultData = {
          url: '',
          title: 'Audio Title',
        };
        break;
      case 'code':
        defaultData = {
          language: 'javascript',
          code: '// Your code here',
          runnable: false,
        };
        break;
      case 'flashcard':
        defaultData = {
          cards: [
            { front: 'Front side', back: 'Back side' },
          ],
        };
        break;
      case 'progress':
        defaultData = {
          current: 0,
          total: 100,
          label: 'Progress',
        };
        break;
    }

    onAddComponent(type, defaultData);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text-primary">Component Library</h2>
        <button
          onClick={onClose}
          className="p-1.5 glass-button rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2">
        {componentTypes.map((component) => {
          const IconComponent = component.Icon;
          return (
            <button
              key={component.id}
              onClick={() => handleAdd(component.id)}
              className="w-full text-left p-4 glass glass-shadow-light rounded-lg hover:glass-strong transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-bg3/50 group-hover:bg-accent1/10 transition-colors">
                  <IconComponent className="w-5 h-5 text-text-primary group-hover:text-accent1 transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-text-primary mb-1 group-hover:text-accent1 transition-colors">
                    {component.label}
                  </div>
                  <div className="text-xs text-text-secondary">{component.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


