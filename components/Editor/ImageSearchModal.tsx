'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageMetadata } from '@/types/course';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageMetadata) => void;
  currentImage?: ImageMetadata;
  searchQuery?: string;
}

type MediaProvider = 'all' | 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'video';
type MediaType = 'all' | 'image' | 'gif' | 'video-loop';

interface MediaResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  attribution: string;
  photographer: string;
  photographerUrl?: string;
  width: number;
  height: number;
  provider: 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'upload' | 'pexels-video';
  mediaType: 'image' | 'gif' | 'video-loop';
  title?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export default function ImageSearchModal({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  searchQuery: initialQuery = '',
}: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || currentImage?.attribution || '');
  const [media, setMedia] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<MediaProvider>('all');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && searchQuery && activeTab === 'search') {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMedia([]);

    try {
      const allMedia: MediaResult[] = [];

      // Search based on provider and media type
      const searchPromises: Promise<void>[] = [];

      // Pexels (images)
      if ((provider === 'all' || provider === 'pexels') && (mediaType === 'all' || mediaType === 'image')) {
        searchPromises.push(
          fetch(`/api/media/pexels/images?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer,
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'pexels',
                      mediaType: 'image',
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('Pexels search error:', err))
        );
      }

      // Unsplash (images)
      if ((provider === 'all' || provider === 'unsplash') && (mediaType === 'all' || mediaType === 'image')) {
        searchPromises.push(
          fetch(`/api/media/unsplash?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer,
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'unsplash',
                      mediaType: 'image',
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('Unsplash search error:', err))
        );
      }

      // Google (images)
      if ((provider === 'all' || provider === 'google') && (mediaType === 'all' || mediaType === 'image')) {
        searchPromises.push(
          fetch(`/api/media/google/images?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer || 'Google',
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'google',
                      mediaType: 'image',
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('Google search error:', err))
        );
      }

      // DuckDuckGo (images)
      if ((provider === 'all' || provider === 'duckduckgo') && (mediaType === 'all' || mediaType === 'image')) {
        searchPromises.push(
          fetch(`/api/media/duckduckgo/images?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer || 'DuckDuckGo',
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'duckduckgo',
                      mediaType: 'image',
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('DuckDuckGo search error:', err))
        );
      }

      // Giphy (GIFs)
      if ((provider === 'all' || provider === 'giphy') && (mediaType === 'all' || mediaType === 'gif')) {
        searchPromises.push(
          fetch(`/api/media/giphy?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer || 'Giphy',
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'giphy',
                      mediaType: 'gif',
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('Giphy search error:', err))
        );
      }

      // Video Loops
      if ((provider === 'all' || provider === 'video') && (mediaType === 'all' || mediaType === 'video-loop')) {
        searchPromises.push(
          fetch(`/api/media/video-loops?query=${encodeURIComponent(searchQuery)}&per_page=10`)
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                if (data.images) {
                  data.images.forEach((img: any) => {
                    allMedia.push({
                      id: img.id,
                      url: img.fullUrl || img.rawUrl,
                      thumbnailUrl: img.thumbnailUrl,
                      attribution: img.attribution,
                      photographer: img.photographer || 'Pexels',
                      photographerUrl: img.photographerUrl,
                      width: img.width,
                      height: img.height,
                      provider: 'pexels-video',
                      mediaType: 'video-loop',
                      loop: img.loop,
                      autoplay: img.autoplay,
                    });
                  });
                }
              }
            })
            .catch((err) => console.error('Video loop search error:', err))
        );
      }

      await Promise.all(searchPromises);

      // Shuffle and limit results
      const shuffled = allMedia.sort(() => Math.random() - 0.5);
      setMedia(shuffled.slice(0, 50));
    } catch (error) {
      console.error('Media search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (mediaItem: MediaResult) => {
    const imageMetadata: ImageMetadata = {
      url: mediaItem.url,
      thumbnailUrl: mediaItem.thumbnailUrl,
      attribution: mediaItem.attribution,
      photographer: mediaItem.photographer,
      photographerUrl: mediaItem.photographerUrl,
      width: mediaItem.width,
      height: mediaItem.height,
      provider: mediaItem.provider,
      mediaType: mediaItem.mediaType,
      loop: mediaItem.loop,
      autoplay: mediaItem.autoplay,
    };
    onSelect(imageMetadata);
    onClose();
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
        if (!validTypes.includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Please upload images (JPG, PNG, GIF, WEBP) or videos (MP4, WEBM).`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          
          // Determine media type
          let detectedMediaType: 'image' | 'gif' | 'video-loop' = 'image';
          if (file.type === 'image/gif') {
            detectedMediaType = 'gif';
          } else if (file.type.startsWith('video/')) {
            detectedMediaType = 'video-loop';
          }

          // Add to media list
          const uploadedMedia: MediaResult = {
            id: data.id,
            url: data.url,
            thumbnailUrl: data.url, // Use same URL for thumbnail
            attribution: `Uploaded: ${file.name}`,
            photographer: 'You',
            width: 0,
            height: 0,
            provider: 'upload',
            mediaType: detectedMediaType,
            loop: detectedMediaType === 'video-loop',
            autoplay: detectedMediaType === 'video-loop',
          };

          setMedia((prev) => [uploadedMedia, ...prev]);
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      'pexels': '📷',
      'unsplash': '📸',
      'google': '🔍',
      'duckduckgo': '🦆',
      'giphy': '🎬',
      'pexels-video': '🎥',
      'upload': '📁',
    };
    return icons[provider] || '📷';
  };

  const getMediaTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'image': { label: 'Image', color: 'bg-blue-500' },
      'gif': { label: 'GIF', color: 'bg-purple-500' },
      'video-loop': { label: 'Video', color: 'bg-red-500' },
    };
    return badges[type] || badges['image'];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg1 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Search Media</h2>
            <p className="text-sm text-text-secondary mt-1">
              Find images, GIFs, and video loops from multiple sources
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg2 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-accent1 border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'text-accent1 border-b-2 border-accent1'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Upload
          </button>
        </div>

        {activeTab === 'search' ? (
          <>
            {/* Search Bar */}
            <div className="p-6 border-b border-border">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for images, GIFs, or videos..."
                    className="w-full px-4 py-3 pl-10 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className="px-4 py-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images Only</option>
                  <option value="gif">GIFs Only</option>
                  <option value="video-loop">Video Loops Only</option>
                </select>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as MediaProvider)}
                  className="px-4 py-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                >
                  <option value="all">All Sources</option>
                  <option value="pexels">Pexels</option>
                  <option value="unsplash">Unsplash</option>
                  <option value="google">Google</option>
                  <option value="duckduckgo">DuckDuckGo</option>
                  <option value="giphy">Giphy</option>
                  <option value="video">Video Loops</option>
                </select>
                <button
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="px-6 py-3 bg-accent1 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Current Image (if exists) */}
            {currentImage && (
              <div className="p-6 border-b border-border bg-bg2/50">
                <p className="text-sm font-medium text-text-secondary mb-2">Current Media:</p>
                <div className="flex items-center gap-4">
                  {currentImage.mediaType === 'video-loop' ? (
                    <video
                      src={currentImage.thumbnailUrl || currentImage.url}
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={currentImage.thumbnailUrl || currentImage.url}
                      alt="Current"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{currentImage.attribution}</p>
                    <p className="text-xs text-text-tertiary">Provider: {currentImage.provider}</p>
                    {currentImage.mediaType && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${getMediaTypeBadge(currentImage.mediaType).color} text-white`}>
                        {getMediaTypeBadge(currentImage.mediaType).label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
                    <p className="text-text-secondary">Searching for media...</p>
                  </div>
                </div>
              ) : media.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text-secondary">No media found. Try a different search term.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {media.map((item) => {
                    const badge = getMediaTypeBadge(item.mediaType);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-border hover:border-accent1 transition-all"
                      >
                        {item.mediaType === 'video-loop' ? (
                          <video
                            src={item.thumbnailUrl}
                            className="w-full h-32 object-cover"
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.attribution}
                            className="w-full h-32 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                            Select
                          </span>
                        </div>
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`px-2 py-0.5 text-xs rounded text-white ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="px-2 py-0.5 text-xs rounded bg-black/60 text-white">
                            {getProviderIcon(item.provider)}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs truncate">{item.photographer}</p>
                          <p className="text-white/80 text-[10px] truncate">{item.provider}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Upload Section */}
            <div className="flex-1 overflow-y-auto p-6">
              <div
                ref={dropZoneRef}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-accent1 bg-accent1/10'
                    : 'border-border hover:border-accent1/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFileUpload(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-text-primary font-medium mb-2">Drag and drop files here</p>
                <p className="text-text-secondary text-sm mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-3 bg-accent1 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Browse Files'}
                </button>
                <p className="text-text-tertiary text-xs mt-4">
                  Supported: JPG, PNG, GIF, WEBP, MP4, WEBM
                </p>
              </div>

              {/* Uploaded Files Grid */}
              {media.filter((m) => m.provider === 'upload').length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Uploaded Files</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media
                      .filter((m) => m.provider === 'upload')
                      .map((item) => {
                        const badge = getMediaTypeBadge(item.mediaType);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-border hover:border-accent1 transition-all"
                          >
                            {item.mediaType === 'video-loop' ? (
                              <video
                                src={item.thumbnailUrl}
                                className="w-full h-32 object-cover"
                                muted
                                loop
                                playsInline
                              />
                            ) : (
                              <img
                                src={item.thumbnailUrl}
                                alt={item.attribution}
                                className="w-full h-32 object-cover"
                                loading="lazy"
                              />
                            )}
                            <div className="absolute top-2 left-2">
                              <span className={`px-2 py-0.5 text-xs rounded text-white ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                              <p className="text-white text-xs truncate">{item.attribution}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            {activeTab === 'search'
              ? media.length > 0
                ? `${media.length} media items found`
                : 'Search for media to get started'
              : `${media.filter((m) => m.provider === 'upload').length} file(s) uploaded`}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg2 text-text-primary rounded-lg hover:bg-bg3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
