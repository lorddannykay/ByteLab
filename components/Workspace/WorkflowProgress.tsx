'use client';

import { CourseCreationState } from '@/types/courseCreation';

interface WorkflowProgressProps {
  state: CourseCreationState;
}

type WorkflowStage = 'upload' | 'plan' | 'configure' | 'generate' | 'edit' | 'publish';

const workflowStages: { id: WorkflowStage; label: string; description: string }[] = [
  { id: 'upload', label: 'Upload', description: 'Add sources and content' },
  { id: 'plan', label: 'Plan', description: 'Chat with AI to plan course' },
  { id: 'configure', label: 'Configure', description: 'Set course settings' },
  { id: 'generate', label: 'Generate', description: 'Create course content' },
  { id: 'edit', label: 'Edit', description: 'Refine and customize' },
  { id: 'publish', description: 'Export and publish', label: 'Publish' },
];

export default function WorkflowProgress({ state }: WorkflowProgressProps) {
  const getCurrentStage = (): WorkflowStage => {
    if (state.courseData?.course.stages && state.courseData.course.stages.length > 0) {
      if (state.courseData.course.stages[0]?.content) {
        return 'edit';
      }
      return 'generate';
    }
    if (state.courseConfig) {
      return 'configure';
    }
    if (state.chatHistory.length >= 3 || state.uploadedFiles.length > 0) {
      return 'plan';
    }
    return 'upload';
  };

  const currentStage = getCurrentStage();
  const currentIndex = workflowStages.findIndex(s => s.id === currentStage);

  return (
    <div className="px-6 py-3 bg-bg2 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {workflowStages.map((stage, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={stage.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-accent1 text-white ring-2 ring-accent1/50'
                        : 'bg-bg3 text-text-tertiary'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-1 text-center">
                    <div className={`text-xs font-medium ${
                      isActive ? 'text-accent1' : isCompleted ? 'text-green-500' : 'text-text-tertiary'
                    }`}>
                      {stage.label}
                    </div>
                  </div>
                </div>
                {index < workflowStages.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    isCompleted ? 'bg-green-500' : 'bg-border'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="ml-4 text-right">
          <div className="text-xs text-text-secondary">
            Current: <span className="font-semibold text-accent1">{workflowStages[currentIndex]?.label}</span>
          </div>
          <div className="text-xs text-text-tertiary mt-0.5">
            {workflowStages[currentIndex]?.description}
          </div>
        </div>
      </div>
    </div>
  );
}

