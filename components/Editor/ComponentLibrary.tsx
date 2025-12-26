'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {componentTypes.map((component, index) => {
          const IconComponent = component.Icon;
          return (
            <motion.button
              key={component.id}
              onClick={() => handleAdd(component.id)}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative p-4 glass glass-shadow-light rounded-xl hover:glass-strong transition-all text-left overflow-hidden"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-3 rounded-xl bg-gradient-to-br from-accent1/10 to-accent2/10 group-hover:from-accent1/20 group-hover:to-accent2/20 transition-all"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <IconComponent className="w-6 h-6 text-accent1" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-text-primary group-hover:text-accent1 transition-colors">
                      {component.label}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  {component.description}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent1/0 to-accent2/0 group-hover:from-accent1/5 group-hover:to-accent2/5 transition-all rounded-xl" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


