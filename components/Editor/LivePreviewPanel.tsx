'use client';

import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { useState, useEffect, useRef, useCallback } from 'react';
import { EyeIcon } from '@/components/Icons/AppleIcons';

interface LivePreviewPanelProps {
  courseData: CourseData;
  config: CourseConfig;
  onClose: () => void;
  templateId?: TemplateId;
  key?: number;
}

export default function LivePreviewPanel({ courseData, config, onClose, templateId, key }: LivePreviewPanelProps) {
  // Use templateId from props, or from config, or default to 'birb-classic'
  const effectiveTemplateId = templateId || (config.templateId as TemplateId) || 'birb-classic';
  const [html, setHtml] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewHeight, setPreviewHeight] = useState(600);
  const [width, setWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generatedHtml = generateCourseHTMLWithTemplate(courseData, config, effectiveTemplateId);
    setHtml(generatedHtml);
  }, [courseData, config, effectiveTemplateId, key]);

  const previewWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      if (panelRef.current) {
        const container = panelRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const newWidth = containerRect.right - e.clientX;
          const minWidth = 300;
          const maxWidth = containerRect.width * 0.8;
          const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
          setWidth(clampedWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div 
      ref={panelRef}
      className="bg-bg2 border-l border-border flex flex-col h-full relative"
      style={{ width: `${width}px`, minWidth: '300px', maxWidth: '80%' }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent1 transition-colors z-10 group"
        style={{ marginLeft: '-2px' }}
      >
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-border group-hover:bg-accent1 rounded transition-colors opacity-0 group-hover:opacity-100" />
      </div>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between glass glass-light">
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5" />
          <h2 className="font-semibold text-text-primary">Live Preview</h2>
          <span className="text-xs text-text-tertiary">({Math.round(width)}px)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWidth(600)}
            className="px-2 py-1 text-xs bg-bg1 text-text-secondary hover:text-text-primary rounded transition-colors"
            title="Reset to default width"
          >
            Reset
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Send close message to iframe if it exists
              const iframe = document.querySelector('iframe[title="Course Preview"]') as HTMLIFrameElement;
              if (iframe?.contentWindow) {
                try {
                  iframe.contentWindow.postMessage({ action: 'closeModal' }, '*');
                } catch (err) {
                  console.log('Could not send message to iframe:', err);
                }
              }
              onClose();
            }}
            className="p-1.5 hover:bg-bg3 rounded-lg transition-colors z-50 relative hover:scale-110 active:scale-95"
            aria-label="Close preview"
            style={{ pointerEvents: 'auto' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
        <div className="flex flex-col items-center gap-4">
          {/* Height Control */}
          <div className="w-full max-w-4xl flex items-center gap-2">
            <label className="text-xs text-text-secondary whitespace-nowrap">Preview Height:</label>
            <input
              type="range"
              min="400"
              max="1200"
              step="50"
              value={previewHeight}
              onChange={(e) => setPreviewHeight(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-text-secondary w-16">{previewHeight}px</span>
          </div>

          {/* Preview Frame with Device Mockup */}
          <div
            className="mx-auto relative"
            style={{
              width: previewMode === 'desktop' ? previewWidths[previewMode] : 
                     previewMode === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
            }}
          >
            {html ? (
              <>
                {/* Device Frame (for mobile/tablet) */}
                {(previewMode === 'mobile' || previewMode === 'tablet') && (
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div 
                      className="absolute inset-0 rounded-[2.5rem] border-[8px] border-sf-gray-800 shadow-2xl"
                      style={{ 
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)'
                      }}
                    >
                      {/* Notch (for mobile) */}
                      {previewMode === 'mobile' && (
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-sf-gray-800 rounded-b-2xl z-20" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Preview Content */}
                <div 
                  className={`mx-auto bg-white shadow-2xl overflow-hidden transition-all border-2 border-border ${
                    previewMode === 'mobile' ? 'rounded-[2rem]' : 
                    previewMode === 'tablet' ? 'rounded-[1.5rem]' : 
                    'rounded-lg'
                  }`}
                  style={{
                    width: previewWidths[previewMode],
                    maxWidth: '100%',
                    marginTop: previewMode === 'mobile' || previewMode === 'tablet' ? '8px' : '0',
                    marginLeft: previewMode === 'mobile' || previewMode === 'tablet' ? '8px' : '0',
                    marginRight: previewMode === 'mobile' || previewMode === 'tablet' ? '8px' : '0',
                    marginBottom: previewMode === 'mobile' || previewMode === 'tablet' ? '8px' : '0',
                  }}
                >
                  <iframe
                    srcDoc={html}
                    className="w-full border-0"
                    style={{
                      height: `${previewHeight}px`,
                      minHeight: `${previewHeight}px`,
                    }}
                    title="Course Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-text-secondary bg-bg2 rounded-lg" style={{ height: `${previewHeight}px` }}>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent1 mx-auto mb-2"></div>
                  <p className="text-sm">Generating preview...</p>
                </div>
              </div>
            )}
          </div>
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



