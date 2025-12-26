'use client';

import { useState } from 'react';
import { CourseFolder } from '@/types/courseMetadata';

interface FolderManagerProps {
  folders: CourseFolder[];
  onCreateFolder: (name: string, color?: string, parentId?: string | null) => void;
  onUpdateFolder: (id: string, updates: Partial<CourseFolder>) => void;
  onDeleteFolder: (id: string) => void;
  getSubfolders?: (parentId: string | null) => CourseFolder[];
}

export default function FolderManager({
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  getSubfolders,
}: FolderManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CourseFolder | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#6366f1');
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
  ];

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), folderColor, parentFolderId);
      setFolderName('');
      setFolderColor('#6366f1');
      setParentFolderId(null);
      setShowCreateModal(false);
    }
  };

  const handleStartEdit = (folder: CourseFolder) => {
    setEditingFolderId(folder.id);
    setFolderName(folder.name);
    setFolderColor(folder.color || '#6366f1');
    setParentFolderId(folder.parentId ?? null);
  };

  const handleSaveEdit = () => {
    if (editingFolderId && folderName.trim()) {
      onUpdateFolder(editingFolderId, { 
        name: folderName.trim(), 
        color: folderColor,
        parentId: parentFolderId ?? null
      });
      setEditingFolderId(null);
      setFolderName('');
      setFolderColor('#6366f1');
      setParentFolderId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setFolderName('');
    setFolderColor('#6366f1');
    setParentFolderId(null);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setDragOverFolder(null);
    }
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    
    const courseId = e.dataTransfer.getData('courseId') || e.dataTransfer.getData('text/plain');
    if (courseId && typeof window !== 'undefined' && (window as any).dragCourseToFolder) {
      (window as any).dragCourseToFolder(courseId, folderId);
    }
  };

  const renderFolder = (folder: CourseFolder, level: number = 0) => {
    const subfolders = getSubfolders ? getSubfolders(folder.id) : folders.filter(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isEditing = editingFolderId === folder.id;
    const hasSubfolders = subfolders.length > 0;

    const isDragOver = dragOverFolder === folder.id;

    return (
      <div key={folder.id} className={level > 0 ? 'ml-4 mt-2' : ''}>
        <div 
          className={`flex items-center gap-3 p-3 bg-bg2 border border-border rounded-lg group hover:bg-bg3 transition-colors ${
            isDragOver ? 'ring-2 ring-accent1 bg-accent1/10 border-accent1' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder.id)}
        >
          {hasSubfolders ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="p-1 hover:bg-bg2 rounded transition-colors flex-shrink-0"
              aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
            >
              <svg
                className={`w-4 h-4 text-text-tertiary transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="w-6 flex-shrink-0" />
          )}
          <div
            className="w-4 h-4 rounded flex-shrink-0"
            style={{ backgroundColor: folder.color }}
          />
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="flex-1 px-2 py-1 text-sm bg-bg1 border border-border rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 hover:bg-green-500/20 rounded text-green-500"
                title="Save"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-red-500/20 rounded text-red-500"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm text-text-primary">
                {folder.name}
                {hasSubfolders && !isExpanded && (
                  <span className="ml-2 text-xs text-text-tertiary">
                    ({subfolders.length})
                  </span>
                )}
              </span>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setParentFolderId(folder.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg2 rounded transition-opacity flex-shrink-0"
                title="Create subfolder"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => handleStartEdit(folder)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg2 rounded transition-opacity flex-shrink-0"
                title="Edit folder"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(folder)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity text-red-500 flex-shrink-0"
                title="Delete folder"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
        {isExpanded && hasSubfolders && (
          <div className="mt-2 space-y-2">
            {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleUpdate = () => {
    if (editingFolder && folderName.trim()) {
      onUpdateFolder(editingFolder.id, { name: folderName.trim(), color: folderColor });
      setEditingFolder(null);
      setFolderName('');
      setFolderColor('#6366f1');
    }
  };

  const handleDelete = (folder: CourseFolder) => {
    if (confirm(`Delete folder "${folder.name}"? Courses in this folder will be moved to the root.`)) {
      onDeleteFolder(folder.id);
    }
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">Folders</h3>
          <div className="flex items-center gap-2">
            {folders.length > 0 && (
              <button
                onClick={() => {
                  // Expand all folders that have subfolders
                  const foldersWithSubfolders = folders.filter(f => {
                    const subs = getSubfolders ? getSubfolders(f.id) : folders.filter(sf => sf.parentId === f.id);
                    return subs.length > 0;
                  });
                  setExpandedFolders(new Set(foldersWithSubfolders.map(f => f.id)));
                }}
                className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2 h-[38px]"
                title="Expand all folders"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Expand All
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2 h-[38px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Folder
            </button>
          </div>
        </div>

        <div 
          className={`space-y-2 min-h-[100px] p-2 rounded-lg transition-colors ${
            dragOverFolder === 'root' ? 'bg-accent1/10 ring-2 ring-accent1 border border-accent1' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setDragOverFolder('root');
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.currentTarget === e.target) {
              setDragOverFolder(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverFolder(null);
            
            const courseId = e.dataTransfer.getData('courseId') || e.dataTransfer.getData('text/plain');
            if (courseId && typeof window !== 'undefined' && (window as any).dragCourseToFolder) {
              (window as any).dragCourseToFolder(courseId, null);
            }
          }}
        >
          {dragOverFolder === 'root' && (
            <div className="text-center py-4 text-sm text-accent1 font-medium">
              Drop here to move to root
            </div>
          )}
          {folders.length > 0 && (
            <>
              {(getSubfolders ? getSubfolders(null) : folders.filter(f => !f.parentId)).map((folder) => 
                renderFolder(folder, 0)
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFolderId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass glass-panel rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editingFolderId ? 'Edit Folder' : parentFolderId ? 'Create Subfolder' : 'Create Folder'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      editingFolderId ? handleSaveEdit() : handleCreate();
                    } else if (e.key === 'Escape') {
                      setShowCreateModal(false);
                      setEditingFolderId(null);
                      setFolderName('');
                      setFolderColor('#6366f1');
                      setParentFolderId(null);
                    }
                  }}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                  placeholder="Enter folder name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Parent Folder (optional)
                </label>
                <select
                  value={parentFolderId || ''}
                  onChange={(e) => setParentFolderId(e.target.value || null)}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                >
                  <option value="">Root (No parent)</option>
                  {folders
                    .filter(f => (!editingFolderId || f.id !== editingFolderId))
                    .map((folder) => {
                      // Build folder path for display
                      const getFolderPath = (f: CourseFolder, path: string[] = []): string[] => {
                        if (!f.parentId) return [f.name];
                        const parent = folders.find(p => p.id === f.parentId);
                        if (!parent) return [f.name];
                        return getFolderPath(parent, []).concat(f.name);
                      };
                      const path = getFolderPath(folder);
                      return (
                        <option key={folder.id} value={folder.id}>
                          {path.join(' / ')}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFolderColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        folderColor === color
                          ? 'border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={editingFolderId ? handleSaveEdit : handleCreate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {editingFolderId ? 'Save' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFolder(null);
                  setEditingFolderId(null);
                  setFolderName('');
                  setFolderColor('#6366f1');
                  setParentFolderId(null);
                }}
                className="px-4 py-2 bg-bg2 border border-border text-text-primary rounded-lg font-semibold hover:bg-bg3 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

