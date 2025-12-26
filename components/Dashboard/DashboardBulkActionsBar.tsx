'use client';

import { useState, useEffect, useRef } from 'react';
import { CourseFolder } from '@/types/courseMetadata';

interface DashboardBulkActionsBarProps {
  selectedCount: number;
  onDeleteAll: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  onClearSelection: () => void;
  folders?: CourseFolder[];
}

export default function DashboardBulkActionsBar({
  selectedCount,
  onDeleteAll,
  onMoveToFolder,
  onClearSelection,
  folders = [],
}: DashboardBulkActionsBarProps) {
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFolderMenu(false);
      }
    };

    if (showFolderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFolderMenu]);

  if (selectedCount === 0) return null;

  const handleMoveToFolder = (folderId: string | null) => {
    onMoveToFolder(folderId);
    setShowFolderMenu(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 neu-card p-4 shadow-2xl flex items-center gap-4 min-w-[400px]">
      <div className="text-sm font-semibold text-text-primary">
        {selectedCount} {selectedCount === 1 ? 'course' : 'courses'} selected
      </div>
      
      <div className="border-l border-border h-6" />
      
      {/* Move to Folder */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowFolderMenu(!showFolderMenu)}
          className="px-4 py-2 text-sm bg-bg2 text-text-primary rounded-lg hover:bg-bg3 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Move to Folder
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showFolderMenu && (
          <div className="absolute bottom-full left-0 mb-2 neu-card bg-bg1 min-w-[200px] p-2 shadow-xl z-10">
            <div className="px-3 py-1 text-xs font-semibold text-text-tertiary uppercase mb-2">Move to Folder</div>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleMoveToFolder(folder.id)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </button>
            ))}
            <button
              onClick={() => handleMoveToFolder(null)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors mt-1 border-t border-border pt-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Remove from folders
            </button>
          </div>
        )}
      </div>
      
      {/* Delete All */}
      <button
        onClick={onDeleteAll}
        className="px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete All
      </button>
      
      <div className="border-l border-border h-6" />
      
      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

