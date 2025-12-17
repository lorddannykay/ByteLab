'use client';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

export default function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-red-800 mb-2">Error</h4>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 ml-4"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

