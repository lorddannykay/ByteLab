'use client';

import { useState, useRef } from 'react';
import { useCourseCreation } from '@/contexts/CourseCreationContext';
import { MediaAsset } from '@/types/courseCreation';
import MediaEditor from '@/components/MediaEditor/MediaEditor';

interface MediaLibraryPanelProps {
  onSelectMedia?: (asset: MediaAsset) => void;
}

export default function MediaLibraryPanel({ onSelectMedia }: MediaLibraryPanelProps) {
  const { state, addMediaAsset, removeMediaAsset } = useCourseCreation();
  const [showMediaEditor, setShowMediaEditor] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediaAssets = state.mediaAssets || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const mediaAsset: MediaAsset = {
              id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: 'image',
              imageData: imageData,
              width: img.width,
              height: img.height,
              createdAt: Date.now(),
            };
            addMediaAsset(mediaAsset);
          };
          img.src = imageData;
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this media asset?')) {
      removeMediaAsset(assetId);
    }
  };

  return (
    <>
      <div className="border-t border-border/30">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-3 flex items-center justify-between hover:bg-bg3 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-accent1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-text-primary">Media Library</span>
            {mediaAssets.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-accent1/20 text-accent1 rounded-full">
                {mediaAssets.length}
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="px-3 pb-3 space-y-2">
            {/* Upload Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 text-xs bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>
              <button
                onClick={() => setShowMediaEditor(true)}
                className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-accent1/10 to-accent2/10 border border-accent1/30 rounded-lg hover:border-accent1/50 transition-colors flex items-center justify-center gap-1 text-accent1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editor
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Media Grid */}
            {mediaAssets.length === 0 ? (
              <div className="text-center py-6 text-text-tertiary">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">No media yet</p>
                <p className="text-xs mt-1">Upload images or create with editor</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative group aspect-square bg-bg1 border border-border rounded-lg overflow-hidden cursor-pointer hover:border-accent1/50 transition-colors"
                    onClick={() => onSelectMedia?.(asset)}
                  >
                    {asset.type === 'image' && asset.imageData && (
                      <img
                        src={asset.imageData}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {asset.type === 'image' && asset.thumbnailUrl && (
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {asset.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Editor Modal */}
      {showMediaEditor && (
        <MediaEditor
          onClose={() => setShowMediaEditor(false)}
          onSave={(imageData, jsonData) => {
            // Create a media asset from the saved data
            const mediaAsset: MediaAsset = {
              id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: `Media ${new Date().toLocaleDateString()}`,
              type: 'image',
              imageData: imageData,
              jsonData: jsonData,
              width: 800, // Default canvas width
              height: 600, // Default canvas height
              createdAt: Date.now(),
            };
            
            // Save to course context
            addMediaAsset(mediaAsset);
            
            // Close editor
            setShowMediaEditor(false);
          }}
        />
      )}
    </>
  );
}



