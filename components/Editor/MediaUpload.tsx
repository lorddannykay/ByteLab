'use client';

import { useState, useRef } from 'react';
import { ImageBlock, VideoBlock, AudioBlock } from './blocks';
import { DocumentTextIcon, VideoCameraIcon, SpeakerWaveIcon } from '@/components/Icons/AppleIcons';

interface MediaUploadProps {
  onUpload: (type: 'image' | 'video' | 'audio', file: File, url?: string) => void;
  onClose: () => void;
}

export default function MediaUpload({ onUpload, onClose }: MediaUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (type: 'image' | 'video' | 'audio', files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const file = files[0];
      
      // For now, create a data URL. In production, upload to a storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onUpload(type, file, dataUrl);
        setUploading(false);
        onClose();
      };
      reader.onerror = () => {
        setUploading(false);
        alert('Failed to read file');
      };
      
      if (type === 'image') {
        reader.readAsDataURL(file);
      } else {
        // For video/audio, we'll use the file object directly
        const url = URL.createObjectURL(file);
        onUpload(type, file, url);
        setUploading(false);
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert('Failed to upload file');
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    
    // Determine type from URL or let user specify
    const url = urlInput.trim();
    const isVideo = /\.(mp4|webm|ogg|youtube|vimeo)/i.test(url) || url.includes('youtube.com') || url.includes('vimeo.com');
    const isAudio = /\.(mp3|wav|ogg|m4a)/i.test(url);
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url);
    
    let type: 'image' | 'video' | 'audio' = 'image';
    if (isVideo) type = 'video';
    else if (isAudio) type = 'audio';
    
    // Create a dummy file object for URL-based media
    const dummyFile = new File([], url.split('/').pop() || 'media', { type: `media/${type}` });
    onUpload(type, dummyFile, url);
    setUrlInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-lg max-w-2xl w-full glass glass-panel">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Upload Media</h2>
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
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'upload'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === 'url'
                ? 'bg-bg2 text-text-primary border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            From URL
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                  Image
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect('image', e.target.files)}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Select Image'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <VideoCameraIcon className="w-4 h-4 inline mr-2" />
                  Video
                </label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect('video', e.target.files)}
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Select Video'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <SpeakerWaveIcon className="w-4 h-4 inline mr-2" />
                  Audio
                </label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect('audio', e.target.files)}
                />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Select Audio'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Media URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg or YouTube/Vimeo URL"
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
                <p className="text-xs text-text-secondary mt-2">
                  Supports images, videos (including YouTube/Vimeo), and audio files
                </p>
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Processing...' : 'Add Media'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



