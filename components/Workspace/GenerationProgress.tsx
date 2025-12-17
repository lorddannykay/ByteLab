'use client';

import { useState, useEffect } from 'react';

interface GenerationProgressProps {
  status: 'idle' | 'extracting' | 'outline' | 'generating' | 'complete';
  progress: number;
  currentStage?: number;
  totalStages?: number;
  message?: string;
  onCancel?: () => void;
}

export default function GenerationProgress({
  status,
  progress,
  currentStage,
  totalStages,
  message,
  onCancel,
}: GenerationProgressProps) {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status === 'idle' || status === 'complete') return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startTime]);

  if (status === 'idle' || status === 'complete') {
    return null;
  }

  const getStatusText = () => {
    switch (status) {
      case 'extracting':
        return 'Extracting course configuration...';
      case 'outline':
        return 'Generating course outline...';
      case 'generating':
        return currentStage && totalStages
          ? `Generating Stage ${currentStage} of ${totalStages}...`
          : 'Generating course content...';
      default:
        return 'Processing...';
    }
  };

  const getProgressFlow = () => {
    const steps = [
      { name: 'Config', completed: status !== 'idle' && status !== 'extracting' },
      { name: 'Outline', completed: status === 'generating' || status === 'complete' },
      { name: 'Content', completed: status === 'complete' },
    ];
    return steps;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const estimateTimeRemaining = () => {
    if (progress === 0) return null;
    const elapsed = elapsedTime;
    const rate = progress / elapsed; // progress per millisecond
    if (rate === 0) return null;
    const remaining = (100 - progress) / rate;
    return formatTime(remaining);
  };

  const progressFlow = getProgressFlow();
  const timeRemaining = estimateTimeRemaining();

  return (
    <div className="p-4 bg-bg2 border border-border rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">{getStatusText()}</span>
        <div className="flex items-center gap-3">
          {timeRemaining && (
            <span className="text-xs text-text-secondary">~{timeRemaining} remaining</span>
          )}
          <span className="text-sm text-text-secondary font-semibold">{Math.round(progress)}%</span>
        </div>
      </div>
      
      {/* Overall progress flow */}
      <div className="flex items-center gap-2 mb-3">
        {progressFlow.map((step, index) => (
          <div key={step.name} className="flex items-center flex-1">
            <div className="flex items-center flex-1">
              <div
                className={`flex-1 h-1.5 rounded ${
                  step.completed
                    ? 'bg-accent1'
                    : index === 0 && status === 'extracting'
                    ? 'bg-accent2 animate-pulse'
                    : index === 1 && status === 'outline'
                    ? 'bg-accent2 animate-pulse'
                    : 'bg-bg3'
                }`}
              />
              <span
                className={`text-xs ml-2 whitespace-nowrap ${
                  step.completed
                    ? 'text-accent1 font-semibold'
                    : index === 0 && status === 'extracting'
                    ? 'text-accent2'
                    : index === 1 && status === 'outline'
                    ? 'text-accent2'
                    : 'text-text-secondary'
                }`}
              >
                {step.name}
              </span>
            </div>
            {index < progressFlow.length - 1 && (
              <div className="w-2 h-2 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-bg3 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-accent1 to-accent2 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {message && (
        <p className="text-xs text-text-secondary mt-2">{message}</p>
      )}
      
      {currentStage && totalStages && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-secondary">Stage Progress</span>
            <span className="text-xs text-text-secondary font-semibold">
              {currentStage} / {totalStages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalStages }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded transition-all ${
                  i + 1 < currentStage
                    ? 'bg-accent1'
                    : i + 1 === currentStage
                    ? 'bg-accent2 animate-pulse'
                    : 'bg-bg3'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      {onCancel && status !== 'complete' && (
        <button
          onClick={onCancel}
          className="mt-3 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
