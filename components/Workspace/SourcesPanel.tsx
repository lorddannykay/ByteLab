'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadedFile } from '@/types/courseCreation';
import { SourceFolder, OrganizedFile, SourceType } from '@/types/fileOrganization';
import { DocumentTextIcon, LinkIcon, CloudIcon } from '@/components/Icons/AppleIcons';
import FilePreviewModal from './FilePreviewModal';
import FileContextMenu from './FileContextMenu';
import BulkActionsBar from './BulkActionsBar';

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
  onRenameFile?: (fileId: string, newName: string) => void;
  onDuplicateFile?: (fileId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
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
  onRenameFile,
  onDuplicateFile,
  onRenameFolder,
  onDeleteFolder,
}: SourcesPanelProps) {
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [contextMenu, setContextMenu] = useState<{ file: UploadedFile; x: number; y: number } | null>(null);
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderRename, setNewFolderRename] = useState('');
  const fileRefs = useRef<Record<string, HTMLDivElement>>({});
  
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

  const handleFileRightClick = (e: React.MouseEvent, file: OrganizedFile) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ file, x: e.clientX, y: e.clientY });
  };

  const handleFileClick = (file: OrganizedFile) => {
    if (!renamingFile) {
      setPreviewFile(file);
    }
  };

  const handleRenameFile = (fileId: string) => {
    const file = sources.find(f => f.id === fileId);
    if (file) {
      setRenamingFile(fileId);
      setNewFileName(file.name);
    }
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setRenamingFolder(folderId);
      setNewFolderRename(folder.name);
    }
  };

  const saveFileRename = () => {
    if (renamingFile && newFileName.trim() && onRenameFile) {
      onRenameFile(renamingFile, newFileName.trim());
      setRenamingFile(null);
      setNewFileName('');
    }
  };

  const saveFolderRename = () => {
    if (renamingFolder && newFolderRename.trim() && onRenameFolder) {
      onRenameFolder(renamingFolder, newFolderRename.trim());
      setRenamingFolder(null);
      setNewFolderRename('');
    }
  };

  const handleBulkDelete = () => {
    if (selectedSources.size > 0 && onDeleteSource) {
      if (confirm(`Delete ${selectedSources.size} file(s)?`)) {
        selectedSources.forEach(id => onDeleteSource(id));
        setSelectedSources(new Set());
      }
    }
  };

  const handleBulkMove = () => {
    // This will be handled by a folder selection modal
    // For now, just show a message
    alert('Move functionality - select folder from dropdown');
  };

  const handleBulkExport = () => {
    const selectedFiles = sources.filter(f => selectedSources.has(f.id));
    const exportData = JSON.stringify(selectedFiles, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-sources.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);
  
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
              const isRenaming = renamingFolder === folder.id;
              return (
                <div key={folder.id} className="space-y-1">
                  <div
                    className="group flex items-center gap-2 p-2 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors cursor-pointer"
                    onClick={() => !isRenaming && toggleFolder(folder.id)}
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
                    {isRenaming ? (
                      <input
                        type="text"
                        value={newFolderRename}
                        onChange={(e) => setNewFolderRename(e.target.value)}
                        onBlur={saveFolderRename}
                        onKeyPress={(e) => e.key === 'Enter' && saveFolderRename()}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1 bg-bg2 border border-accent1 rounded text-sm text-text-primary focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-text-primary">{folder.name}</span>
                        <span className="text-xs text-text-secondary">({folderFiles.length})</span>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          {onRenameFolder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameFolder(folder.id);
                              }}
                              className="p-1 hover:bg-bg4 rounded"
                              title="Rename folder"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {onDeleteFolder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete folder "${folder.name}"? Files will be moved to root.`)) {
                                  onDeleteFolder(folder.id);
                                }
                              }}
                              className="p-1 hover:bg-red-500/10 text-red-500 rounded"
                              title="Delete folder"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {folderFiles.map((source) => {
                        const isRenaming = renamingFile === source.id;
                        return (
                          <div
                            key={source.id}
                            ref={(el) => { if (el) fileRefs.current[source.id] = el; }}
                            className="group relative p-2 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors cursor-pointer"
                            onClick={() => handleFileClick(source)}
                            onContextMenu={(e) => handleFileRightClick(e, source)}
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
                                {isRenaming ? (
                                  <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    onBlur={saveFileRename}
                                    onKeyPress={(e) => e.key === 'Enter' && saveFileRename()}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-2 py-1 bg-bg2 border border-accent1 rounded text-xs text-text-primary focus:outline-none"
                                    autoFocus
                                  />
                                ) : (
                                  <>
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
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Root files (not in folders) */}
            {rootFiles.map((source) => {
              const isRenaming = renamingFile === source.id;
              return (
                <div
                  key={source.id}
                  ref={(el) => { if (el) fileRefs.current[source.id] = el; }}
                  className="group relative p-3 bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors cursor-pointer"
                  onClick={() => handleFileClick(source)}
                  onContextMenu={(e) => handleFileRightClick(e, source)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSources.has(source.id)}
                      onChange={() => onSelectSource(source.id)}
                      className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getSourceIcon(source.sourceType)}
                          {isRenaming ? (
                            <input
                              type="text"
                              value={newFileName}
                              onChange={(e) => setNewFileName(e.target.value)}
                              onBlur={saveFileRename}
                              onKeyPress={(e) => e.key === 'Enter' && saveFileRename()}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 px-2 py-1 bg-bg2 border border-accent1 rounded text-sm text-text-primary focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm font-medium text-text-primary truncate">
                              {source.name}
                            </p>
                          )}
                        </div>
                        {!isRenaming && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteMenu(showDeleteMenu === source.id ? null : source.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg4 rounded transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {!isRenaming && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span>{new Date(source.uploadedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{(source.size / 1024).toFixed(1)} KB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {showDeleteMenu === source.id && onDeleteSource && (
                    <div className="absolute top-12 right-2 bg-bg1 border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {sources.length === 0 && (
        <div className="p-4 border-t border-border text-xs text-text-secondary">
          <p>Click Add source above to add PDFs, websites, text, videos, or audio files.</p>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />

      {/* Context Menu */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onRename={handleRenameFile}
          onDuplicate={(fileId) => {
            if (onDuplicateFile) {
              onDuplicateFile(fileId);
            }
          }}
          onMove={(fileId) => {
            // Show folder selection modal
            if (onMoveToFolder && folders.length > 0) {
              const folderId = prompt(`Move to folder:\n${folders.map(f => `${f.id}: ${f.name}`).join('\n')}\n\nEnter folder ID or press Cancel to move to root`);
              if (folderId !== null) {
                onMoveToFolder(fileId, folderId || null);
              }
            }
          }}
          onDelete={(fileId) => {
            if (onDeleteSource && confirm('Delete this file?')) {
              onDeleteSource(fileId);
            }
          }}
          folders={folders}
        />
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedSources.size}
        onDeleteAll={handleBulkDelete}
        onMoveAll={handleBulkMove}
        onExportSelection={handleBulkExport}
        onClearSelection={() => setSelectedSources(new Set())}
        folders={folders}
      />
    </div>
  );
}
