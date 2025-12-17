'use client';

import { useState } from 'react';
import { CourseConfig } from '@/types/course';

interface ConfigExtractionModalProps {
  extractedConfig: Partial<CourseConfig>;
  confidence: Record<string, number>;
  onApprove: (config: CourseConfig) => void;
  onEdit: (config: CourseConfig) => void;
  onCancel: () => void;
}

export default function ConfigExtractionModal({
  extractedConfig,
  confidence,
  onApprove,
  onEdit,
  onCancel,
}: ConfigExtractionModalProps) {
  const [editedConfig, setEditedConfig] = useState<Partial<CourseConfig>>(extractedConfig);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'text-green-500';
    if (conf >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.7) return 'High';
    if (conf >= 0.4) return 'Medium';
    return 'Low';
  };

  const handleApprove = () => {
    const fullConfig: CourseConfig = {
      title: editedConfig.title || 'Untitled Course',
      topic: editedConfig.topic || 'General',
      description: editedConfig.description || 'A microlearning course',
      objectives: editedConfig.objectives || ['Learn key concepts'],
      targetAudience: editedConfig.targetAudience || 'General audience',
      organizationalGoals: editedConfig.organizationalGoals || '',
      contentStyle: editedConfig.contentStyle || 'conversational',
      stageCount: editedConfig.stageCount || 5,
      estimatedDuration: editedConfig.estimatedDuration || '15-20 minutes',
      accentColor1: editedConfig.accentColor1 || '#4a90e2',
      accentColor2: editedConfig.accentColor2 || '#50c9c3',
      voiceId: editedConfig.voiceId || '',
      includeVideo: editedConfig.includeVideo || false,
      includePodcast: editedConfig.includePodcast || false,
    };
    onApprove(fullConfig);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg1 border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Course Configuration</h2>
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

          <p className="text-sm text-text-secondary mb-6">
            I've extracted course configuration from our conversation. Review and edit as needed before generating your course.
          </p>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Course Title
                {confidence.title !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.title)}`}>
                    ({getConfidenceLabel(confidence.title)} confidence)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={editedConfig.title || ''}
                onChange={(e) => setEditedConfig({ ...editedConfig, title: e.target.value })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                placeholder="Enter course title"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Topic
                {confidence.topic !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.topic)}`}>
                    ({getConfidenceLabel(confidence.topic)} confidence)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={editedConfig.topic || ''}
                onChange={(e) => setEditedConfig({ ...editedConfig, topic: e.target.value })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                placeholder="Enter topic"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
                {confidence.description !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.description)}`}>
                    ({getConfidenceLabel(confidence.description)} confidence)
                  </span>
                )}
              </label>
              <textarea
                value={editedConfig.description || ''}
                onChange={(e) => setEditedConfig({ ...editedConfig, description: e.target.value })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1 resize-none"
                rows={3}
                placeholder="Enter course description"
              />
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Learning Objectives
                {confidence.objectives !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.objectives)}`}>
                    ({getConfidenceLabel(confidence.objectives)} confidence)
                  </span>
                )}
              </label>
              <textarea
                value={editedConfig.objectives?.join('\n') || ''}
                onChange={(e) => {
                  const objectives = e.target.value.split('\n').filter(o => o.trim());
                  setEditedConfig({ ...editedConfig, objectives });
                }}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1 resize-none"
                rows={4}
                placeholder="Enter learning objectives (one per line)"
              />
              <p className="text-xs text-text-secondary mt-1">Enter one objective per line</p>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Target Audience
                {confidence.targetAudience !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.targetAudience)}`}>
                    ({getConfidenceLabel(confidence.targetAudience)} confidence)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={editedConfig.targetAudience || ''}
                onChange={(e) => setEditedConfig({ ...editedConfig, targetAudience: e.target.value })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
                placeholder="e.g., Beginners, Professionals, Students"
              />
            </div>

            {/* Content Style */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Content Style
                {confidence.contentStyle !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.contentStyle)}`}>
                    ({getConfidenceLabel(confidence.contentStyle)} confidence)
                  </span>
                )}
              </label>
              <select
                value={editedConfig.contentStyle || 'conversational'}
                onChange={(e) => setEditedConfig({ ...editedConfig, contentStyle: e.target.value as any })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              >
                <option value="conversational">Conversational</option>
                <option value="formal">Formal</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            {/* Stage Count */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Number of Stages
                {confidence.stageCount !== undefined && (
                  <span className={`ml-2 text-xs ${getConfidenceColor(confidence.stageCount)}`}>
                    ({getConfidenceLabel(confidence.stageCount)} confidence)
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={editedConfig.stageCount || 5}
                onChange={(e) => setEditedConfig({ ...editedConfig, stageCount: parseInt(e.target.value) || 5 })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApprove}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Use This Configuration
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
