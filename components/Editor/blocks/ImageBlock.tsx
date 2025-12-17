'use client';

import { useState } from 'react';

interface ImageBlockProps {
  src?: string;
  alt?: string;
  onUpdate: (src: string, alt: string) => void;
  onDelete?: () => void;
}

export default function ImageBlock({ src, alt, onUpdate, onDelete }: ImageBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localSrc, setLocalSrc] = useState(src || '');
  const [localAlt, setLocalAlt] = useState(alt || '');

  const handleSave = () => {
    onUpdate(localSrc, localAlt);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mb-4 p-4 bg-bg2 border border-border rounded-lg">
        <div className="mb-2">
          <label className="block text-sm font-medium text-text-primary mb-1">Image URL</label>
          <input
            type="text"
            value={localSrc}
            onChange={(e) => setLocalSrc(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-text-primary mb-1">Alt Text</label>
          <input
            type="text"
            value={localAlt}
            onChange={(e) => setLocalAlt(e.target.value)}
            placeholder="Description of image"
            className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-accent1 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Save
          </button>
          <button
            onClick={() => {
              setLocalSrc(src || '');
              setLocalAlt(alt || '');
              setIsEditing(false);
            }}
            className="px-4 py-2 bg-bg3 text-text-primary rounded-lg hover:bg-bg4 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (src) {
    return (
      <div className="mb-4 relative group">
        <img
          src={src}
          alt={localAlt}
          className="w-full rounded-lg border border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
          }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-bg1/90 rounded hover:bg-bg2 transition-colors"
            title="Edit image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/90 rounded hover:bg-red-600 transition-colors"
              title="Delete image"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="mb-4 p-8 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-accent1 transition-colors"
    >
      <svg className="w-12 h-12 mx-auto mb-2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-text-secondary">Click to add image</p>
    </div>
  );
}

