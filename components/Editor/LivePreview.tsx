'use client';

import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTML } from '@/lib/generators/courseHtml';
import { useState, useEffect } from 'react';

interface LivePreviewProps {
  courseData: CourseData;
  config: CourseConfig;
  onClose: () => void;
}

export default function LivePreview({ courseData, config, onClose }: LivePreviewProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const generatedHtml = generateCourseHTML(courseData, config);
    setHtml(generatedHtml);
  }, [courseData, config]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg1 border border-border rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">Course Preview</h2>
          <div className="flex items-center gap-2">
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
              className="px-4 py-2 text-sm bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors"
            >
              Download HTML
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-bg2 rounded transition-colors z-50 relative"
              style={{ pointerEvents: 'auto' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-bg2 p-8 flex items-center justify-center">
          {html ? (
            <div className="relative w-full max-w-4xl" style={{ aspectRatio: '16/9' }}>
              {/* Device Mockup Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-sf-gray-100 to-sf-gray-200 rounded-[2.5rem] p-2 shadow-2xl" style={{ 
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)'
              }}>
                {/* Screen Bezel */}
                <div className="w-full h-full bg-black rounded-[2rem] p-1">
                  {/* Notch (for mobile) */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
                  {/* Screen Content */}
                  <div className="w-full h-full bg-white rounded-[1.75rem] overflow-hidden">
                    <iframe
                      srcDoc={html}
                      className="w-full h-full border-0"
                      title="Course Preview"
                      sandbox="allow-scripts allow-same-origin"
                      onLoad={(e) => {
                        // Listen for postMessage from iframe to handle close requests
                        const iframe = e.target as HTMLIFrameElement;
                        if (iframe?.contentWindow) {
                          window.addEventListener('message', (event) => {
                            if (event.data === 'closePreview' || event.data?.type === 'closePreview') {
                              onClose();
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
                <p className="text-text-secondary">Generating preview...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

