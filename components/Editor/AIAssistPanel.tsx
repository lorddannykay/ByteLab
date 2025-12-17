'use client';

import { useState } from 'react';
import { CourseData } from '@/types/course';
import { PencilIcon, PlusIcon, ChevronDownIcon, DocumentTextIcon, QuestionMarkIcon } from '@/components/Icons/AppleIcons';

interface AIAssistPanelProps {
  courseData: CourseData;
  selectedStageId: number;
  onUpdate: (data: CourseData) => void;
}

export default function AIAssistPanel({ courseData, selectedStageId, onUpdate }: AIAssistPanelProps) {
  const [selectedText, setSelectedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'rewrite' | 'expand' | 'simplify' | 'summarize' | null>(null);

  const currentStage = courseData.course.stages.find(s => s.id === selectedStageId);

  const handleAIAction = async (actionType: 'rewrite' | 'expand' | 'simplify' | 'summarize') => {
    if (!selectedText.trim()) {
      alert('Please select some text first');
      return;
    }

    setIsProcessing(true);
    setAction(actionType);

    try {
      const response = await fetch('/api/ai/transform-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          action: actionType,
          context: {
            courseTitle: courseData.course.title,
            stageTitle: currentStage?.title,
            stageObjective: currentStage?.objective,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI transformation failed');
      }

      const data = await response.json();
      // The transformed text would be applied to the selected content
      // This is a simplified version - in a full implementation, you'd need to track
      // which block/field the selected text belongs to and update it
      alert(`AI ${actionType} completed. Result: ${data.result.substring(0, 100)}...`);
    } catch (error) {
      console.error('AI action error:', error);
      alert('Failed to process AI action. Please try again.');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!currentStage) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/generate/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageContent: currentStage.content,
          stageTitle: currentStage.title,
          stageObjective: currentStage.objective,
        }),
      });

      if (!response.ok) {
        throw new Error('Quiz generation failed');
      }

      const data = await response.json();
      
      // Add quiz to interactive elements
      const updatedStage = {
        ...currentStage,
        interactiveElements: [
          ...(currentStage.interactiveElements || []),
          {
            type: 'quiz',
            data: data.quiz,
          },
        ],
      };

      const updatedStages = courseData.course.stages.map(s =>
        s.id === selectedStageId ? updatedStage : s
      );

      onUpdate({
        ...courseData,
        course: {
          ...courseData.course,
          stages: updatedStages,
        },
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-80 bg-bg2 border-l border-border overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-text-primary mb-4">AI Assistant</h2>

        {/* Text Selection Info */}
        <div className="mb-4 p-3 bg-bg1 border border-border rounded-lg">
          <p className="text-xs text-text-secondary mb-2">Selected Text</p>
          {selectedText ? (
            <p className="text-sm text-text-primary line-clamp-3">{selectedText}</p>
          ) : (
            <p className="text-xs text-text-tertiary italic">Select text in the editor to use AI features</p>
          )}
        </div>

        {/* AI Actions */}
        <div className="space-y-2 mb-4">
          <button
            onClick={() => handleAIAction('rewrite')}
            disabled={!selectedText || isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Rewrite
          </button>
          <button
            onClick={() => handleAIAction('expand')}
            disabled={!selectedText || isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Expand
          </button>
          <button
            onClick={() => handleAIAction('simplify')}
            disabled={!selectedText || isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronDownIcon className="w-4 h-4" />
            Simplify
          </button>
          <button
            onClick={() => handleAIAction('summarize')}
            disabled={!selectedText || isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Summarize
          </button>
        </div>

        {/* Generate Quiz */}
        <div className="border-t border-border pt-4">
          <button
            onClick={handleGenerateQuiz}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              'Generating...'
            ) : (
              <>
                <QuestionMarkIcon className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </button>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent1 mx-auto"></div>
            <p className="text-xs text-text-secondary mt-2">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}

