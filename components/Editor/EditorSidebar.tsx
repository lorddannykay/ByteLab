'use client';

import { CourseStage } from '@/types/course';

interface EditorSidebarProps {
  stages: CourseStage[];
  selectedStageId: number;
  onSelectStage: (stageId: number) => void;
}

export default function EditorSidebar({ stages, selectedStageId, onSelectStage }: EditorSidebarProps) {
  return (
    <div className="w-64 bg-bg2 border-r border-border overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-text-primary mb-4">Stages</h2>
        <div className="space-y-2">
          {stages.map((stage) => {
            const hasContent = !!stage.content;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedStageId === stage.id
                    ? 'bg-accent1/20 border-2 border-accent1'
                    : 'bg-bg1 border border-border hover:bg-bg3'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-accent1">Stage {stage.id}</span>
                  {hasContent && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-text-primary line-clamp-2">{stage.title}</div>
                {stage.objective && (
                  <div className="text-xs text-text-secondary mt-1 line-clamp-1">{stage.objective}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

