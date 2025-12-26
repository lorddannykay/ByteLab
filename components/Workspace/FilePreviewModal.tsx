'use client';

import { useState, useEffect } from 'react';
import { UploadedFile } from '@/types/courseCreation';

interface FilePreviewModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) {
      setPreviewContent('');
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine file type
        const isUrl = file.id.startsWith('url-');
        const isText = file.id.startsWith('text-');
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        const isTextFile = file.name.toLowerCase().endsWith('.txt') ||
          file.name.toLowerCase().endsWith('.md');

        if (isUrl) {
          // For URLs, show metadata
          setPreviewContent(`URL: ${file.name}\n\nThis is a web page that has been indexed. The content has been extracted and is available for course generation.`);
        } else if (isText || isTextFile) {
          // For text files, fetch content
          const response = await fetch(`/api/files/preview?fileId=${file.id}&filename=${encodeURIComponent(file.name)}`);
          if (response.ok) {
            const data = await response.json();
            setPreviewContent(data.content || 'No content available');
          } else {
            setPreviewContent('Content preview not available');
          }
        } else if (isPdf) {
          // For PDFs, show first page info
          setPreviewContent(`PDF Document: ${file.name}\n\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nPDF preview requires a PDF viewer. The content has been extracted and indexed for course generation.`);
        } else {
          setPreviewContent(`File: ${file.name}\n\nType: ${file.type}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nThis file has been processed and indexed for course generation.`);
        }
      } catch (err) {
        setError('Failed to load preview');
        console.error('Preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-bg1 border border-border rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col glass glass-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-text-primary truncate">{file.name}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {file.type} • {(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-bg3 rounded-lg transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-bg2">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent1 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="bg-bg1 border border-border rounded-lg p-6">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono max-h-[60vh] overflow-y-auto">
                {previewContent}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-bg2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg3 text-text-primary rounded-lg hover:bg-bg4 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

