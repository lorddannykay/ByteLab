'use client';

import { useState, useRef, useEffect } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import { MediaAsset } from '@/types/courseCreation';

export default function MediaLibrary() {
  const { courses } = useCourses();
  const [allMediaAssets, setAllMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all media assets from all courses
  useEffect(() => {
    const media: MediaAsset[] = [];
    courses.forEach((course) => {
      if (course.state?.mediaAssets) {
        course.state.mediaAssets.forEach((asset) => {
          media.push({
            ...asset,
            // Add course context
            name: `${course.title} - ${asset.name}`,
          });
        });
      }
    });
    setAllMediaAssets(media);
  }, [courses]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For now, just show a message - in a full implementation, this would
    // save to a global media storage
    alert('Global media upload will be implemented with the API route. For now, upload media within individual courses.');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    if (confirm('Are you sure you want to delete this media asset?')) {
      // Find which course this asset belongs to and remove it
      courses.forEach((course) => {
        if (course.state?.mediaAssets) {
          const asset = course.state.mediaAssets.find(a => a.id === assetId);
          if (asset) {
            // In a full implementation, we'd update the course state
            // For now, just remove from local state
            setAllMediaAssets(prev => prev.filter(a => a.id !== assetId));
          }
        }
      });
    }
  };

  const filteredAssets = selectedFolder
    ? allMediaAssets.filter(asset => asset.name.includes(selectedFolder))
    : allMediaAssets;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Media Library</h1>
          <p className="text-text-secondary">Manage all your media assets across courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="neu-accent-button px-4 py-2 text-white font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Media
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neu-card p-4">
          <div className="text-sm text-text-secondary mb-1">Total Media</div>
          <div className="text-2xl font-bold text-text-primary">{allMediaAssets.length}</div>
        </div>
        <div className="neu-card p-4">
          <div className="text-sm text-text-secondary mb-1">Images</div>
          <div className="text-2xl font-bold text-text-primary">
            {allMediaAssets.filter(a => a.type === 'image').length}
          </div>
        </div>
        <div className="neu-card p-4">
          <div className="text-sm text-text-secondary mb-1">Videos</div>
          <div className="text-2xl font-bold text-text-primary">
            {allMediaAssets.filter(a => a.type === 'video').length}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredAssets.length === 0 ? (
        <div className="neu-empty-state text-center py-16">
          <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Media Yet</h3>
          <p className="text-text-secondary mb-6">Upload media files or create them in your courses</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="neu-accent-button px-6 py-3 text-white font-semibold inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Your First Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="neu-card p-2 group relative aspect-square overflow-hidden rounded-lg"
            >
              {asset.type === 'image' && asset.imageData && (
                <img
                  src={asset.imageData}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded"
                />
              )}
              {asset.type === 'image' && asset.thumbnailUrl && (
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover rounded"
                />
              )}
              {asset.type === 'video' && asset.thumbnailUrl && (
                <div className="relative w-full h-full">
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDeleteAsset(asset.id)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {asset.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



