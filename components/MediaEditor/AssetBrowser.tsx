'use client';

import { useState } from 'react';

interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  thumbnailUrl: string;
  fullUrl: string;
  width: number;
  height: number;
  attribution: string;
}

interface AssetBrowserProps {
  onSelectAsset: (asset: MediaAsset) => void;
}

export default function AssetBrowser({ onSelectAsset }: AssetBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState<'image' | 'video'>('image');
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const searchAssets = async (query: string, type: 'image' | 'video', pageNum: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const endpoint = type === 'image' ? '/api/media/unsplash' : '/api/media/pexels';
      const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=20`);
      
      if (response.ok) {
        const data = await response.json();
        const newAssets = type === 'image' 
          ? (data.images || []).map((img: any) => ({
              id: img.id,
              type: 'image' as const,
              thumbnailUrl: img.thumbnailUrl,
              fullUrl: img.fullUrl,
              width: img.width,
              height: img.height,
              attribution: img.attribution,
            }))
          : (data.videos || []).map((vid: any) => ({
              id: vid.id,
              type: 'video' as const,
              thumbnailUrl: vid.thumbnailUrl,
              fullUrl: vid.fullUrl,
              width: vid.width,
              height: vid.height,
              attribution: vid.attribution,
            }));
        
        if (pageNum === 1) {
          setAssets(newAssets);
        } else {
          setAssets(prev => [...prev, ...newAssets]);
        }
      }
    } catch (error) {
      console.error('Asset search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchAssets(searchQuery, assetType, 1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchAssets(searchQuery, assetType, nextPage);
  };

  return (
    <div className="w-80 bg-bg1 border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary mb-3">Media Library</h3>
        
        {/* Type Selector */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setAssetType('image')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              assetType === 'image'
                ? 'bg-accent1 text-white'
                : 'bg-bg2 text-text-primary hover:bg-bg3'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setAssetType('video')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              assetType === 'video'
                ? 'bg-accent1 text-white'
                : 'bg-bg2 text-text-primary hover:bg-bg3'
            }`}
          >
            Videos
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${assetType}s...`}
            className="flex-1 px-3 py-2 bg-bg2 border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent1"
          />
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 bg-accent1 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {assets.length === 0 && !loading && (
          <div className="text-center py-12 text-text-secondary text-sm">
            {searchQuery ? 'No results found' : 'Search for images or videos'}
          </div>
        )}
        
        {loading && assets.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent1 border-t-transparent mx-auto" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="relative aspect-video bg-bg2 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-accent1 transition-all group"
              onClick={() => onSelectAsset(asset)}
            >
              {asset.type === 'image' ? (
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.attribution}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-bg3 flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium">
                  Add
                </span>
              </div>
            </div>
          ))}
        </div>

        {assets.length > 0 && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full mt-4 px-4 py-2 bg-bg2 text-text-primary rounded-lg hover:bg-bg3 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}

