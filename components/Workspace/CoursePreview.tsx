'use client';

import { CourseData, CourseConfig } from '@/types/course';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TemplateSelector from '@/components/Templates/TemplateSelector';
import { generateCourseHTMLWithTemplate, TemplateId, TEMPLATES } from '@/lib/templates/templateSelector';
import { SwatchIcon } from '@/components/Icons/AppleIcons';

interface CoursePreviewProps {
  courseData: CourseData;
  config?: Partial<CourseConfig>;
  onClose: () => void;
  onExport?: () => void;
  onConfigUpdate?: (config: Partial<CourseConfig>) => void; // Callback to update config when template changes
  courseId?: string;
}

export default function CoursePreview({ courseData, config, onClose, onExport, onConfigUpdate, courseId }: CoursePreviewProps) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'structured' | 'html'>('structured');
  const [courseHtml, setCourseHtml] = useState<string>('');
  // Initialize selectedTemplate from config, or default to null
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(
    (config?.templateId as TemplateId) || null
  );
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const currentStage = courseData.course.stages.find(s => s.id === selectedStage);
  
  // Generate HTML with selected template
  useEffect(() => {
    if (viewMode === 'html') {
      // Use selectedTemplate if set, otherwise use config.templateId, otherwise default to 'modern'
      const template = (selectedTemplate || (config?.templateId as TemplateId) || 'modern') as TemplateId;
      const html = generateCourseHTMLWithTemplate(courseData, config || {}, template);
      setCourseHtml(html);
    }
  }, [viewMode, courseData, config, selectedTemplate]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`glass glass-panel rounded-xl ${viewMode === 'html' ? 'max-w-[95vw] w-full' : 'max-w-5xl w-full'} max-h-[95vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-border/30 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{courseData.course.title}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {courseData.course.stages.length} stages • {courseData.course.duration}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 glass glass-light rounded-lg p-1">
              <button
                onClick={() => setViewMode('structured')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'structured'
                    ? 'bg-accent1 text-white'
                    : 'text-text-secondary hover:text-text-primary glass-button'
                }`}
              >
                Visual Editor
              </button>
              <button
                onClick={() => setViewMode('html')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  viewMode === 'html'
                    ? 'bg-accent1 text-white'
                    : 'text-text-secondary hover:text-text-primary glass-button'
                }`}
              >
                HTML Preview
              </button>
            </div>
            {viewMode === 'html' && (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
                title="Choose template"
              >
                <SwatchIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {TEMPLATES.find(t => t.id === (selectedTemplate || config?.templateId || 'modern'))?.name || 'Template'}
                </span>
                <span className="sm:hidden">Template</span>
              </button>
            )}
            {viewMode === 'structured' && courseId && (
              <button
                onClick={() => {
                  const editorUrl = `${window.location.origin}/course/${courseId}/preview-editor`;
                  window.open(
                    editorUrl,
                    'courseEditor',
                    'width=1400,height=900,resizable=yes,scrollbars=yes'
                  );
                }}
                className="px-3 py-1.5 text-sm bg-bg1 border border-border rounded hover:bg-bg3 transition-colors"
                title="Open in new window"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                New Window
              </button>
            )}
            {onExport && (
              <div className="flex gap-2">
                <button
                  onClick={onExport}
                  className="px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Export ZIP
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/export/scorm', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          courseData,
                          config,
                        }),
                      });
                      
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${config?.title || 'course'}-scorm.zip`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } else {
                        alert('Failed to export SCORM package');
                      }
                    } catch (error) {
                      console.error('SCORM export error:', error);
                      alert('Failed to export SCORM package');
                    }
                  }}
                  className="px-4 py-2 bg-bg2 border border-border text-text-primary rounded-lg font-semibold hover:bg-bg3 transition-colors"
                >
                  Export SCORM
                </button>
              </div>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-bg2 rounded transition-colors z-50 relative"
              aria-label="Close"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {viewMode === 'html' ? (
            /* HTML Preview Mode */
            <div className="flex-1 overflow-hidden w-full h-full min-h-0">
              {courseHtml ? (
                <iframe
                  srcDoc={courseHtml}
                  className="w-full h-full border-0 min-h-[600px]"
                  title="Course HTML Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  style={{ minHeight: '600px' }}
                  onLoad={(e) => {
                    // Listen for postMessage from iframe to handle close requests
                    const iframe = e.target as HTMLIFrameElement;
                    if (iframe?.contentWindow) {
                      // Set up message listener for iframe communication
                      const handleMessage = (event: MessageEvent) => {
                        // Accept messages from same origin or iframe
                        if (event.data === 'closePreview' || 
                            event.data?.action === 'closeModal' ||
                            event.data?.type === 'closePreview') {
                          onClose();
                        }
                      };
                      window.addEventListener('message', handleMessage);
                      
                      // Cleanup on unmount
                      return () => {
                        window.removeEventListener('message', handleMessage);
                      };
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[600px] text-text-secondary">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
                    <p>Generating HTML preview...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Visual Editor Mode - Redirect to full editor */
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-accent1 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">Visual HTML Editor</h3>
                <p className="text-text-secondary mb-6">
                  Edit your course content with a powerful visual editor. Add interactive components, use AI assistance, and customize your course design.
                </p>
                <div className="flex flex-col gap-3">
                  {courseId && (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/course/${courseId}/preview-editor`);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Open Visual Editor
                      </button>
                      <button
                        onClick={() => {
                          const editorUrl = `${window.location.origin}/course/${courseId}/preview-editor`;
                          window.open(
                            editorUrl,
                            'courseEditor',
                            'width=1400,height=900,resizable=yes,scrollbars=yes'
                          );
                        }}
                        className="px-6 py-3 bg-bg2 border border-border text-text-primary rounded-lg font-semibold hover:bg-bg3 transition-colors"
                      >
                        Open in New Window
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(templateId) => {
            setSelectedTemplate(templateId);
          }}
          onApply={(templateId) => {
            setSelectedTemplate(templateId);
            setShowTemplateSelector(false);
            // Update config with new template
            const updatedConfig = {
              ...config,
              templateId: templateId,
            };
            // Notify parent component of config change
            if (onConfigUpdate) {
              onConfigUpdate(updatedConfig);
            }
          }}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
