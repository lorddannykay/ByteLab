'use client';

import { useState } from 'react';
import { CourseFolder } from '@/types/courseMetadata';

interface FolderManagerProps {
  folders: CourseFolder[];
  onCreateFolder: (name: string, color?: string) => void;
  onUpdateFolder: (id: string, updates: Partial<CourseFolder>) => void;
  onDeleteFolder: (id: string) => void;
}

export default function FolderManager({
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
}: FolderManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CourseFolder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#6366f1');

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
  ];

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), folderColor);
      setFolderName('');
      setFolderColor('#6366f1');
      setShowCreateModal(false);
    }
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Folder
          </button>
        </div>

        {folders.length > 0 && (
          <div className="space-y-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center gap-3 p-3 bg-bg2 border border-border rounded-lg group hover:bg-bg3 transition-colors"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 text-sm text-text-primary">{folder.name}</span>
                <button
                  onClick={() => {
                    setEditingFolder(folder);
                    setFolderName(folder.name);
                    setFolderColor(folder.color || '#6366f1');
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg2 rounded transition-opacity"
                  title="Edit folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(folder)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity text-red-500"
                  title="Delete folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFolder) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass glass-panel rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">
              {editingFolder ? 'Edit Folder' : 'Create Folder'}
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
                      editingFolder ? handleUpdate() : handleCreate();
                    }
                  }}
                  className="w-full px-4 py-2 bg-bg2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                  placeholder="Enter folder name"
                  autoFocus
                />
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
                onClick={editingFolder ? handleUpdate : handleCreate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                {editingFolder ? 'Save' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingFolder(null);
                  setFolderName('');
                  setFolderColor('#6366f1');
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

