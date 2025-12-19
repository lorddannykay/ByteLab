'use client';

import { UploadedFile } from '@/types/courseCreation';

interface FileContextMenuProps {
  file: UploadedFile;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: (fileId: string) => void;
  onDuplicate: (fileId: string) => void;
  onMove: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  folders?: Array<{ id: string; name: string }>;
}

export default function FileContextMenu({
  file,
  position,
  onClose,
  onRename,
  onDuplicate,
  onMove,
  onDelete,
  folders = [],
}: FileContextMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div
        className="fixed z-50 bg-bg1 border border-border rounded-lg shadow-xl min-w-[180px] py-1"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={() => handleAction(() => onRename(file.id))}
          className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg3 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Rename
        </button>
        
        <button
          onClick={() => handleAction(() => onDuplicate(file.id))}
          className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg3 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Duplicate
        </button>
        
        {folders.length > 0 && (
          <button
            onClick={() => handleAction(() => onMove(file.id))}
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg3 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Move to folder
          </button>
        )}
        
        <div className="border-t border-border my-1" />
        
        <button
          onClick={() => handleAction(() => onDelete(file.id))}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </>
  );
}

