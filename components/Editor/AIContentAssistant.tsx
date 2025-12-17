'use client';

import { useState } from 'react';
import { CourseData, CourseStage } from '@/types/course';
import { PencilIcon, PlusIcon, ChevronDownIcon, DocumentTextIcon, QuestionMarkIcon, SparklesIcon } from '@/components/Icons/AppleIcons';

interface AIContentAssistantProps {
  courseData: CourseData;
  selectedStageId: number;
  selectedText: string;
  selectedElement: HTMLElement | null;
  onUpdate: (stage: CourseStage) => void;
  onClose: () => void;
}

export default function AIContentAssistant({
  courseData,
  selectedStageId,
  selectedText,
  selectedElement,
  onUpdate,
  onClose,
}: AIContentAssistantProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const currentStage = courseData.course.stages.find(s => s.id === selectedStageId);

  const handleAIAction = async (actionType: string) => {
    if (!selectedText.trim() && actionType !== 'generate-quiz' && actionType !== 'generate-section') {
      alert('Please select some text first');
      return;
    }

    setIsProcessing(true);
    setAction(actionType);

    try {
      let result: string = '';

      if (actionType === 'generate-quiz' || actionType === 'generate-section') {
        // Generate new content
        const response = await fetch('/api/generate/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stageContent: currentStage?.content,
            stageTitle: currentStage?.title,
            stageObjective: currentStage?.objective,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (actionType === 'generate-quiz') {
            // Add quiz to interactive elements
            if (currentStage) {
              const updatedElements = [
                ...(currentStage.interactiveElements || []),
                {
                  type: 'quiz',
                  data: data.quiz,
                  id: `quiz-${Date.now()}`,
                },
              ];
              onUpdate({
                ...currentStage,
                interactiveElements: updatedElements,
              });
            }
            setIsProcessing(false);
            setAction(null);
            onClose();
            return;
          }
        }
      } else {
        // Transform selected text
        const response = await fetch('/api/ai/transform-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: selectedText,
            action: actionType === 'summarize' ? 'summarize' : actionType,
            context: {
              courseTitle: courseData.course.title,
              stageTitle: currentStage?.title,
              stageObjective: currentStage?.objective,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          result = data.result || data.transformedText;

          // Replace selected text in the element
          if (selectedElement && selectedText && result) {
            // This is a simplified version - in production, you'd track which block/field contains the selection
            // For now, we'll show the result and let the user manually apply it
            alert(`AI ${actionType} result:\n\n${result.substring(0, 200)}${result.length > 200 ? '...' : ''}\n\nPlease apply this manually to your content.`);
          }
        }
      }
    } catch (error) {
      console.error('AI action error:', error);
      alert('Failed to process AI action. Please try again.');
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text-primary">AI Assistant</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-bg3 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected Text Info */}
      {selectedText && (
        <div className="mb-4 p-3 bg-bg1 border border-border rounded-lg">
          <p className="text-xs text-text-secondary mb-2">Selected Text</p>
          <p className="text-sm text-text-primary line-clamp-3">{selectedText}</p>
        </div>
      )}

      {/* Text Actions */}
      {selectedText && (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-text-secondary mb-2">Text Actions</p>
          <button
            onClick={() => handleAIAction('rewrite')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 flex items-center gap-2"
          >
            <PencilIcon className="w-4 h-4" />
            Rewrite
          </button>
          <button
            onClick={() => handleAIAction('expand')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Expand
          </button>
          <button
            onClick={() => handleAIAction('simplify')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronDownIcon className="w-4 h-4" />
            Simplify
          </button>
          <button
            onClick={() => handleAIAction('summarize')}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors text-left disabled:opacity-50 flex items-center gap-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Summarize
          </button>
        </div>
      )}

      {/* Generate Actions */}
      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-text-secondary mb-2">Generate Content</p>
        <button
          onClick={() => handleAIAction('generate-quiz')}
          disabled={isProcessing}
          className="w-full px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mb-2 flex items-center justify-center gap-2"
        >
          <QuestionMarkIcon className="w-4 h-4" />
          Generate Quiz
        </button>
        <button
          onClick={() => handleAIAction('generate-section')}
          disabled={isProcessing}
          className="w-full px-4 py-2 text-sm glass-button rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          Generate New Section
        </button>
      </div>

      {!selectedText && (
        <div className="mt-4 p-3 bg-bg1 border border-border rounded-lg">
          <p className="text-xs text-text-tertiary text-center">
            Select text in the editor to use AI text actions
          </p>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent1 mx-auto"></div>
          <p className="text-xs text-text-secondary mt-2">Processing...</p>
        </div>
      )}
    </div>
  );
}

