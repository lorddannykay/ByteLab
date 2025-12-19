'use client';

import { useState, useRef } from 'react';
import { LinkIcon, DocumentTextIcon, CloudIcon } from '@/components/Icons/AppleIcons';

interface AddSourcesModalProps {
  onClose: () => void;
  onFileUpload: (files: File[], clearExisting: boolean) => void;
  onUrlUpload?: (url: string) => void;
  onTextUpload?: (text: string) => void;
  onDriveUpload?: () => void;
}

type UploadTab = 'files' | 'url' | 'text' | 'drive';

export default function AddSourcesModal({
  onClose,
  onFileUpload,
  onUrlUpload,
  onTextUpload,
  onDriveUpload,
}: AddSourcesModalProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>('files');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const { valid, invalid } = validateFiles(fileArray);
      
      if (invalid.length > 0) {
        alert(`The following files are not supported: ${invalid.map(f => f.name).join(', ')}\n\nSupported formats: PDF, DOCX, TXT, MD`);
      }
      
      if (valid.length > 0) {
        onFileUpload(valid, false);
        onClose();
      } else if (invalid.length > 0) {
        // Don't close if all files are invalid
        return;
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim() || !onUrlUpload) return;
    setIsUploading(true);
    try {
      await onUrlUpload(urlInput.trim());
      setUrlInput('');
      onClose();
    } catch (error) {
      console.error('URL upload error:', error);
      alert('Failed to process URL. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || !onTextUpload) return;
    setIsUploading(true);
    try {
      await onTextUpload(textInput.trim());
      setTextInput('');
      onClose();
    } catch (error) {
      console.error('Text upload error:', error);
      alert('Failed to process text. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriveClick = () => {
    if (onDriveUpload) {
      onDriveUpload();
    } else {
      alert('Google Drive integration coming soon!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col glass glass-panel">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Add Sources</h2>
            <p className="text-sm text-text-secondary mt-1">
              Upload files, add URLs, paste text, or connect Google Drive
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg2 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-border flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'files'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'url'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'text'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'drive'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CloudIcon className="w-4 h-4" />
            <span>Drive</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'files' && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? 'border-accent1 bg-accent1/10' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
              <p className="text-text-primary mb-2 font-medium">
                {isDragging ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-text-secondary mb-6 text-sm">
                or click to browse (PDF, DOCX, TXT, MD)
              </p>
              <label className="inline-block px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                Select Files
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  title="Select multiple files (PDF, DOCX, TXT, MD)"
                />
              </label>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Enter URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <p className="text-xs text-text-secondary mt-2">
                  We'll extract and analyze the content from this URL
                </p>
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isUploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Processing...' : 'Add URL'}
              </button>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Paste your text content
                </label>
                <textarea
                  ref={textAreaRef}
                  value={textInput}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setTextInput(newValue);
                  }}
                  onPaste={(e) => {
                    // Let the default paste behavior happen, then ensure state updates
                    // The onChange handler will catch it, but we ensure it's processed
                    setTimeout(() => {
                      if (textAreaRef.current) {
                        setTextInput(textAreaRef.current.value);
                      }
                    }, 0);
                  }}
                  placeholder="Paste your content here..."
                  rows={12}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1 resize-none font-mono text-sm"
                />
                <p className="text-xs text-text-secondary mt-2">
                  {textInput.length} {textInput.length === 1 ? 'character' : 'characters'}
                </p>
              </div>
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isUploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Processing...' : 'Add Text'}
              </button>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="text-center py-12">
              <CloudIcon className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Connect Google Drive
              </h3>
              <p className="text-text-secondary mb-6">
                Import files directly from your Google Drive
              </p>
              <button
                onClick={handleDriveClick}
                className="px-6 py-3 bg-bg2 border border-border rounded-lg font-semibold hover:bg-bg3 transition-colors"
              >
                Connect Google Drive
              </button>
              <p className="text-xs text-text-secondary mt-4">
                Google Drive integration coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

