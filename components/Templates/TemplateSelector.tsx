'use client';

import { useState } from 'react';
import { TEMPLATES, TemplateId, generateCourseHTMLWithTemplate } from '@/lib/templates/templateSelector';
import TemplateCard from './TemplateCard';
import { CourseData, CourseConfig } from '@/types/course';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId | null;
  onSelectTemplate: (templateId: TemplateId) => void;
  onClose?: () => void;
  onApply?: (templateId: TemplateId) => void; // Optional callback for "Apply Template" button
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  onClose,
  onApply,
}: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(selectedTemplate);
  const [isApplying, setIsApplying] = useState(false);

  // Create a sample course data for preview
  const sampleCourseData: CourseData = {
    course: {
      title: 'Sample Course',
      description: 'This is a preview of how your course will look with this template.',
      duration: '10-15 minutes',
      stages: [
        {
          id: 1,
          title: 'Introduction',
          objective: 'Learn the basics',
          content: {
            introduction: 'Welcome to this course!',
            sections: [
              {
                heading: 'Getting Started',
                content: 'This is a sample section to show how content will be displayed in this template.',
                type: 'text',
              },
            ],
            summary: 'This template provides a great learning experience.',
          },
          interactiveElements: [],
          quizQuestions: [],
          sideCard: {
            title: 'Pro Tip',
            content: 'This is a sample side card showing additional information.',
            tips: []
          },
        },
      ],
    },
    videoScenes: [],
    podcastDialogue: [],
  };

  const sampleConfig: Partial<CourseConfig> = {
    title: 'Sample Course',
    accentColor1: '#4a90e2',
    accentColor2: '#50c9c3',
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);

    try {
      if (onApply) {
        await onApply(selectedTemplate);
      } else {
        onSelectTemplate(selectedTemplate);
      }
      onClose?.();
    } catch (error) {
      console.error('Error applying template:', error);
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Choose Course Template</h2>
            <p className="text-sm text-text-secondary mt-1">
              Select a design template for your course. You can preview each template before finalizing.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              disabled={isApplying}
              className="p-2 hover:bg-bg2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplate === template.id}
                isPreviewing={previewTemplate === template.id}
                onSelect={() => !isApplying && onSelectTemplate(template.id)}
                onPreview={() => !isApplying && setPreviewTemplate(template.id === previewTemplate ? null : template.id)}
              />
            ))}
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-bg1 border border-border rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  Preview: {TEMPLATES.find(t => t.id === previewTemplate)?.name}
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  disabled={isApplying}
                  className="p-2 hover:bg-bg2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close preview"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-bg2">
                <iframe
                  srcDoc={generateCourseHTMLWithTemplate(sampleCourseData, sampleConfig, previewTemplate)}
                  className="w-full h-full min-h-[600px] border border-border rounded-lg bg-white"
                  title="Template Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {selectedTemplate ? (
              <span>Selected: <strong className="text-text-primary">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong></span>
            ) : (
              <span>No template selected</span>
            )}
          </div>
          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                disabled={isApplying}
                className="px-4 py-2 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || isApplying}
              className="px-6 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Applying...</span>
                </>
              ) : (
                'Apply Template'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
