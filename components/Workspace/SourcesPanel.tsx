'use client';

import { useState } from 'react';
import { UploadedFile } from '@/types/courseCreation';
import { SourceFolder, OrganizedFile, SourceType } from '@/types/fileOrganization';
import { DocumentTextIcon, LinkIcon, CloudIcon } from '@/components/Icons/AppleIcons';

interface SourcesPanelProps {
  sources: UploadedFile[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddSources: () => void;
  onSelectSource: (id: string) => void;
  selectedSources: Set<string>;
  onSelectAll: () => void;
  onDeleteSource?: (id: string) => void;
  folders?: SourceFolder[];
  onCreateFolder?: (name: string) => void;
  onMoveToFolder?: (fileId: string, folderId: string | null) => void;
}

export default function SourcesPanel({
  sources,
  isCollapsed,
  onToggleCollapse,
  onAddSources,
  onSelectSource,
  selectedSources,
  onSelectAll,
  onDeleteSource,
  folders = [],
  onCreateFolder,
  onMoveToFolder,
}: SourcesPanelProps) {
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Organize files by folder
  const organizedFiles = sources.map(file => {
    // Determine source type from file name/type
    let sourceType: SourceType = 'file';
    if (file.name.startsWith('http://') || file.name.startsWith('https://')) {
      sourceType = 'url';
    } else if (file.id.startsWith('text-')) {
      sourceType = 'text';
    } else if (file.id.startsWith('drive-')) {
      sourceType = 'drive';
    }
    return { ...file, folderId: null, sourceType } as OrganizedFile;
  });
  
  const filesByFolder = organizedFiles.reduce((acc, file) => {
    const folderId = file.folderId || 'root';
    if (!acc[folderId]) acc[folderId] = [];
    acc[folderId].push(file);
    return acc;
  }, {} as Record<string, OrganizedFile[]>);
  
  const rootFiles = filesByFolder['root'] || [];
  
  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowCreateFolder(false);
    }
  };
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };
  
  const getSourceIcon = (sourceType: SourceType) => {
    switch (sourceType) {
      case 'url':
        return <LinkIcon className="w-4 h-4" />;
      case 'drive':
        return <CloudIcon className="w-4 h-4" />;
      case 'text':
        return <DocumentTextIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-bg2 border-r border-border flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-bg3 rounded transition-colors"
          aria-label="Expand sources panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  const allSelected = sources.length > 0 && selectedSources.size === sources.length;

  return (
    <div className="w-80 bg-bg2 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Sources</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-bg3 rounded transition-colors"
          aria-label="Collapse sources panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Add Sources Button */}
      <div className="p-4 border-b border-border space-y-2">
        <button
          onClick={onAddSources}
          className="w-full px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          + Add sources
        </button>
        {onCreateFolder && (
          <button
            onClick={() => setShowCreateFolder(!showCreateFolder)}
            className="w-full px-4 py-2 bg-bg1 border border-border rounded-lg font-medium hover:bg-bg3 transition-colors text-text-primary text-sm"
          >
            + New Folder
          </button>
        )}
        {showCreateFolder && onCreateFolder && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder name"
              className="flex-1 px-3 py-2 bg-bg1 border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent1"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="px-3 py-2 bg-accent1 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Create
            </button>
          </div>
        )}
      </div>

      {/* Source List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sources.length > 0 && (
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
              />
              <span>Select all sources</span>
            </label>
          </div>
        )}

        {sources.length === 0 && folders.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p className="mb-2">No sources yet</p>
            <p className="text-sm">Click "Add sources" to upload files</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Folders */}
            {folders.map((folder) => {
              const folderFiles = filesByFolder[folder.id] || [];
              const isExpanded = expandedFolders.has(folder.id);
              return (
                <div key={folder.id} className="space-y-1">
                  <div
                    className="group flex items-center gap-2 p-2 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors cursor-pointer"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    <svg
                      className={`w-4 h-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="flex-1 text-sm font-medium text-text-primary">{folder.name}</span>
                    <span className="text-xs text-text-secondary">({folderFiles.length})</span>
                  </div>
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {folderFiles.map((source) => (
                        <div
                          key={source.id}
                          className="group relative p-2 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSources.has(source.id)}
                              onChange={() => onSelectSource(source.id)}
                              className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getSourceIcon(source.sourceType)}
                                <p className="text-xs font-medium text-text-primary truncate">
                                  {source.name}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-secondary">
                                <span>{new Date(source.uploadedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{(source.size / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Root files (not in folders) */}
            {rootFiles.map((source) => (
              <div
                key={source.id}
                className="group relative p-3 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSources.has(source.id)}
                    onChange={() => onSelectSource(source.id)}
                    className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(source.sourceType)}
                        <p className="text-sm font-medium text-text-primary truncate">
                          {source.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteMenu(showDeleteMenu === source.id ? null : source.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg4 rounded transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span>{new Date(source.uploadedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{(source.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                </div>

                {showDeleteMenu === source.id && onDeleteSource && (
                  <div className="absolute top-12 right-2 bg-bg1 border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        onDeleteSource(source.id);
                        setShowDeleteMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-red-500 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {sources.length === 0 && (
        <div className="p-4 border-t border-border text-xs text-text-secondary">
          <p>Click Add source above to add PDFs, websites, text, videos, or audio files.</p>
        </div>
      )}
    </div>
  );
}
