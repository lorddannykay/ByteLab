'use client';

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function SuccessMessage({ message, onDismiss }: SuccessMessageProps) {
  return (
    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-green-800 mb-2">Success</h4>
          <p className="text-green-700 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-500 hover:text-green-700 ml-4"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

