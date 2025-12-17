'use client';

import { useState } from 'react';

interface StudioPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onGenerateOutput: (type: string) => void;
  outputs: Record<string, any>;
  generating?: string | null;
  generationProgress?: {
    status: 'idle' | 'extracting' | 'outline' | 'generating' | 'complete';
    progress: number;
    currentStage?: number;
    totalStages?: number;
    message?: string;
  };
  hasSources?: boolean;
  onViewCourse?: (courseData: any) => void;
  onRemoveOutput?: (type: string) => void;
}

import { BookIcon, EyeIcon, BoltIcon } from '@/components/Icons/AppleIcons';

const outputTypes = [
  { id: 'course', label: 'Interactive Course', Icon: BookIcon, primary: true },
];

export default function StudioPanel({
  isCollapsed,
  onToggleCollapse,
  onGenerateOutput,
  outputs,
  generating = null,
  generationProgress,
  hasSources = false,
  onViewCourse,
  onRemoveOutput,
}: StudioPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  if (isCollapsed) {
    return (
      <div className="w-12 bg-bg2 border-l border-border flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-bg3 rounded transition-colors"
          aria-label="Expand studio panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-bg2 border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/30 glass glass-light flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">Course Generator</h2>
          <p className="text-xs text-text-secondary">Generate microlearning content</p>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 glass-button rounded-lg transition-colors"
          aria-label="Collapse studio panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Output Tiles */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {outputTypes.map((type) => {
            const hasOutput = outputs[type.id];
            const isGenerating = generating === type.id;
            const isDisabled = !hasSources && type.primary;
            
            return (
              <button
                key={type.id}
                onClick={() => !isGenerating && !isDisabled && onGenerateOutput(type.id)}
                disabled={isGenerating || isDisabled}
                className={`relative w-full p-4 glass glass-shadow rounded-xl transition-all text-left group ${
                  hasOutput ? 'ring-2 ring-accent1/50 border-accent1/30' : ''
                } ${type.primary ? 'bg-gradient-to-br from-accent1/10 to-accent2/10' : ''} ${
                  isGenerating ? 'opacity-75 cursor-wait' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:glass-strong'
                }`}
              >
                {type.beta && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-yellow-500 text-white rounded">
                    BETA
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="relative p-2 rounded-lg bg-bg3/30">
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent1 border-t-transparent" />
                    ) : (
                      <type.Icon className="w-6 h-6 text-text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">{type.label}</div>
                    {type.primary && (
                      <div className="text-xs text-text-secondary mt-1">
                        {isDisabled ? 'Upload sources first' : 'Full interactive course with stages'}
                      </div>
                    )}
                    {isGenerating && generationProgress && (
                      <div className="mt-2">
                        <div className="w-full bg-bg3 rounded-full h-1">
                          <div
                            className="bg-accent1 h-1 rounded-full transition-all"
                            style={{ width: `${generationProgress.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{generationProgress.message || 'Generating...'}</p>
                      </div>
                    )}
                  </div>
                </div>
                {hasOutput && !isGenerating && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Area */}
      <div className="p-4 border-t border-border">
        {Object.keys(outputs).length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p className="text-sm mb-2 font-medium text-text-primary">Ready to generate your course</p>
            <p className="text-xs">
              {hasSources 
                ? 'Generate an interactive microlearning course with stages, quizzes, and more!'
                : 'Upload sources first, then generate your course'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(outputs).map(([type, output]) => {
              const outputType = outputTypes.find(t => t.id === type);
              const isCourse = type === 'course';
              const hasStages = isCourse && output.course?.stages?.length > 0;
              const hasContent = isCourse && hasStages && output.course.stages[0]?.content;
              const stageCount = hasStages ? output.course.stages.length : 0;
              
              return (
                <div key={type} className={`p-4 bg-bg1 border-2 rounded-lg transition-all ${
                  isCourse && hasContent 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : isCourse && hasStages 
                    ? 'border-accent1/50 bg-accent1/5'
                    : 'border-border'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-semibold text-text-primary">
                          {outputType?.label || type}
                        </span>
                        {isCourse && hasContent && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
                            ✓ Complete
                          </span>
                        )}
                        {isCourse && !hasContent && hasStages && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-accent1/20 text-accent1 rounded-full">
                            Outline Ready
                          </span>
                        )}
                      </div>
                      {isCourse && hasStages && (
                        <p className="text-xs text-text-secondary">
                          {stageCount} {stageCount === 1 ? 'stage' : 'stages'} • {output.course?.duration || 'N/A'}
                        </p>
                      )}
                    </div>
                    {onRemoveOutput && (
                      <button 
                        onClick={() => onRemoveOutput(type)}
                        className="p-1 hover:bg-bg3 rounded transition-colors ml-2"
                        aria-label="Remove"
                        title="Remove output"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {isCourse && hasStages && onViewCourse && (
                      <button
                        onClick={() => {
                          // Build full CourseData from output
                          const courseData = {
                            course: output.course,
                            videoScenes: output.videoScenes || [],
                            podcastDialogue: output.podcastDialogue || [],
                          };
                          onViewCourse(courseData);
                        }}
                        className="w-full px-4 py-2 text-sm font-semibold bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2"
                        aria-label="View course"
                      >
                        <EyeIcon className="w-4 h-4" />
                        {hasContent ? 'View Full Course' : 'View Outline'}
                      </button>
                    )}
                    {isCourse && !hasContent && hasStages && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateOutput('course');
                        }}
                        className="w-full px-4 py-2 text-sm font-semibold bg-accent1/10 text-accent1 border-2 border-accent1 rounded-lg hover:bg-accent1/20 transition-colors flex items-center justify-center gap-2"
                        title="Generate content for stages"
                      >
                        <BoltIcon className="w-4 h-4" />
                        Generate Content
                      </button>
                    )}
                    {isCourse && hasContent && (
                      <p className="text-xs text-text-tertiary text-center mt-1">
                        Course is ready to view and export
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
