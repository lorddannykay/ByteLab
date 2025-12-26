'use client';

import { useState } from 'react';
import { CourseData } from '@/types/course';

interface OutlineReviewModalProps {
  outline: CourseData['course'];
  expectedStageCount?: number;
  onApprove: () => void;
  onRegenerate: () => void;
  onEdit: (editedOutline: CourseData['course']) => void;
  onCancel: () => void;
  isContinuing?: boolean;
}

export default function OutlineReviewModal({
  outline,
  expectedStageCount,
  onApprove,
  onRegenerate,
  onEdit,
  onCancel,
  isContinuing = false,
}: OutlineReviewModalProps) {
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editedStages, setEditedStages] = useState(outline.stages || []);

  const handleEditStage = (stageId: number, field: 'title' | 'objective', value: string) => {
    setEditedStages(prev =>
      prev.map(stage =>
        stage.id === stageId
          ? { ...stage, [field]: value }
          : stage
      )
    );
  };

  const handleSaveEdit = () => {
    onEdit({ ...outline, stages: editedStages });
    setEditingStage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Course Outline</h2>
              <p className="text-sm text-text-secondary mt-1">
                {isContinuing 
                  ? 'Continue generating content for this outline'
                  : 'Review the course structure before generating content'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-bg2 rounded transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-bg2 rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">{outline.title}</h3>
            <p className="text-sm text-text-secondary">{outline.description}</p>
            <p className="text-xs text-text-tertiary mt-2">Duration: {outline.duration}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">Stages ({editedStages?.length || 0})</h3>
              {expectedStageCount !== undefined && expectedStageCount !== (editedStages?.length || 0) && (
                <span className="text-xs text-yellow-500 font-medium">
                  Expected {expectedStageCount}, got {editedStages?.length || 0}
                </span>
              )}
            </div>
            {(editedStages || []).map((stage, index) => (
              <div
                key={stage.id}
                className="p-4 bg-bg2 border border-border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {editingStage === stage.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={stage.title}
                          onChange={(e) => handleEditStage(stage.id, 'title', e.target.value)}
                          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                          placeholder="Stage title"
                        />
                        <textarea
                          value={stage.objective}
                          onChange={(e) => handleEditStage(stage.id, 'objective', e.target.value)}
                          className="w-full p-2 border border-border rounded bg-bg1 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1 resize-none"
                          rows={2}
                          placeholder="Learning objective"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 text-sm bg-accent1 text-white rounded hover:opacity-90"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-accent1">Stage {stage.id}</span>
                          <h4 className="font-semibold text-text-primary">{stage.title}</h4>
                        </div>
                        <p className="text-sm text-text-secondary">{stage.objective}</p>
                        {stage.keyPoints && stage.keyPoints.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-text-tertiary mb-1">Key points:</p>
                            <ul className="list-disc list-inside text-xs text-text-secondary">
                              {stage.keyPoints.slice(0, 3).map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {editingStage !== stage.id && (
                    <button
                      onClick={() => setEditingStage(stage.id)}
                      className="p-1 hover:bg-bg3 rounded transition-colors ml-2"
                      aria-label="Edit stage"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onApprove}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Approve & Generate Content
            </button>
            <button
              onClick={onRegenerate}
              className="px-6 py-3 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors text-text-primary"
            >
              Regenerate Outline
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
