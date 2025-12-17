'use client';

import { useState } from 'react';

interface VideoData {
  url: string;
  type: 'youtube' | 'vimeo' | 'upload';
  title?: string;
  description?: string;
}

interface VideoBlockProps {
  data: VideoData;
  onChange: (data: VideoData) => void;
  onDelete: () => void;
}

export default function VideoBlock({ data, onChange, onDelete }: VideoBlockProps) {
  const [localData, setLocalData] = useState(data);

  const handleUpdate = (updates: Partial<VideoData>) => {
    const updated = { ...localData, ...updates };
    setLocalData(updated);
    onChange(updated);
  };

  const getEmbedUrl = () => {
    if (!localData.url) return null;
    if (localData.type === 'youtube') {
      const videoId = localData.url.includes('youtube.com/watch?v=')
        ? localData.url.split('v=')[1]?.split('&')[0]
        : localData.url.includes('youtu.be/')
        ? localData.url.split('youtu.be/')[1]?.split('?')[0]
        : localData.url;
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (localData.type === 'vimeo') {
      const videoId = localData.url.split('/').pop()?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return localData.url;
  };

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Video</h3>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-500/20 rounded transition-colors"
          title="Delete component"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Video Type</label>
        <select
          value={localData.type}
          onChange={(e) => handleUpdate({ type: e.target.value as VideoData['type'] })}
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="upload">Uploaded Video</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          {localData.type === 'upload' ? 'Video URL' : 'Video URL or ID'}
        </label>
        <input
          type="text"
          value={localData.url}
          onChange={(e) => handleUpdate({ url: e.target.value })}
          placeholder={
            localData.type === 'youtube'
              ? 'https://www.youtube.com/watch?v=...'
              : localData.type === 'vimeo'
              ? 'https://vimeo.com/...'
              : 'https://...'
          }
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>

      {localData.type !== 'upload' && getEmbedUrl() && (
        <div className="mb-4 aspect-video bg-bg1 rounded overflow-hidden">
          <iframe
            src={getEmbedUrl() || ''}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">Title (optional)</label>
        <input
          type="text"
          value={localData.title || ''}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          placeholder="Video title"
          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
        />
      </div>
    </div>
  );
}


