'use client';

import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { useState, useEffect } from 'react';
import { EyeIcon } from '@/components/Icons/AppleIcons';

interface LivePreviewPanelProps {
  courseData: CourseData;
  config: CourseConfig;
  onClose: () => void;
  templateId?: TemplateId;
}

export default function LivePreviewPanel({ courseData, config, onClose, templateId = 'modern' }: LivePreviewPanelProps) {
  const [html, setHtml] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const generatedHtml = generateCourseHTMLWithTemplate(courseData, config, templateId);
    setHtml(generatedHtml);
  }, [courseData, config, templateId]);

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="w-96 bg-bg2 border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between glass glass-light">
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5" />
          <h2 className="font-semibold text-text-primary">Live Preview</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-bg3 rounded transition-colors"
          aria-label="Close preview"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview Mode Selector */}
      <div className="p-3 border-b border-border flex items-center gap-2 glass glass-light">
        <button
          onClick={() => setPreviewMode('desktop')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'desktop'
              ? 'bg-accent1 text-white'
              : 'bg-bg1 text-text-secondary hover:text-text-primary'
          }`}
        >
          Desktop
        </button>
        <button
          onClick={() => setPreviewMode('tablet')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'tablet'
              ? 'bg-accent1 text-white'
              : 'bg-bg1 text-text-secondary hover:text-text-primary'
          }`}
        >
          Tablet
        </button>
        <button
          onClick={() => setPreviewMode('mobile')}
          className={`px-3 py-1 text-xs rounded transition-colors ${
            previewMode === 'mobile'
              ? 'bg-accent1 text-white'
              : 'bg-bg1 text-text-secondary hover:text-text-primary'
          }`}
        >
          Mobile
        </button>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4 bg-bg1">
        <div
          className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all"
          style={{
            width: previewWidths[previewMode],
            maxWidth: '100%',
          }}
        >
          {html ? (
            <iframe
              srcDoc={html}
              className="w-full border-0"
              style={{
                height: '600px',
                minHeight: '600px',
              }}
              title="Course Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] text-text-secondary">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent1 mx-auto mb-2"></div>
                <p className="text-sm">Generating preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border glass glass-light">
        <button
          onClick={() => {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${config.title || 'course'}.html`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Download HTML
        </button>
      </div>
    </div>
  );
}



