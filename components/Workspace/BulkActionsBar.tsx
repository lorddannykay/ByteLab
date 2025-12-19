'use client';

interface BulkActionsBarProps {
  selectedCount: number;
  onDeleteAll: () => void;
  onMoveAll: () => void;
  onExportSelection: () => void;
  onClearSelection: () => void;
  folders?: Array<{ id: string; name: string }>;
}

export default function BulkActionsBar({
  selectedCount,
  onDeleteAll,
  onMoveAll,
  onExportSelection,
  onClearSelection,
  folders = [],
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-bg1 border border-border rounded-lg shadow-2xl p-3 flex items-center gap-3">
      <div className="text-sm font-medium text-text-primary">
        {selectedCount} {selectedCount === 1 ? 'file' : 'files'} selected
      </div>
      
      <div className="border-l border-border h-6" />
      
      {folders.length > 0 && (
        <button
          onClick={onMoveAll}
          className="px-3 py-1.5 text-sm bg-bg2 text-text-primary rounded-lg hover:bg-bg3 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Move All
        </button>
      )}
      
      <button
        onClick={onExportSelection}
        className="px-3 py-1.5 text-sm bg-bg2 text-text-primary rounded-lg hover:bg-bg3 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>
      
      <button
        onClick={onDeleteAll}
        className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete All
      </button>
      
      <div className="border-l border-border h-6" />
      
      <button
        onClick={onClearSelection}
        className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        Clear
      </button>
    </div>
  );
}

