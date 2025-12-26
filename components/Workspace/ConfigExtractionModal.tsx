'use client';

import { useState } from 'react';
import { CourseConfig } from '@/types/course';
import { TEMPLATES, TemplateId } from '@/lib/templates/templateSelector';

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
  // Preserve templateId from extractedConfig if it exists
  const [editedConfig, setEditedConfig] = useState<Partial<CourseConfig>>({
    ...extractedConfig,
    templateId: extractedConfig.templateId, // Explicitly preserve templateId
  });

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
      templateId: editedConfig.templateId, // Preserve templateId if it exists
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

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-yellow-500 mb-1">Review Required</h3>
                <p className="text-sm text-text-secondary">
                  The AI has extracted configuration from your conversation, but some values may need adjustment.
                  <strong className="text-text-primary"> Please review all fields carefully</strong> and edit as needed before generating your course.
                  Confidence scores indicate how certain the AI is about each value.
                </p>
              </div>
            </div>
          </div>

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

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Course Template
                <span className="ml-2 text-xs text-text-secondary">(Visual design theme)</span>
              </label>
              <select
                value={editedConfig.templateId || 'modern'}
                onChange={(e) => setEditedConfig({ ...editedConfig, templateId: e.target.value as TemplateId })}
                className="w-full p-3 border border-border rounded-lg bg-bg2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent1"
              >
                {TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-secondary mt-1">
                {TEMPLATES.find(t => t.id === editedConfig.templateId)?.bestFor || 'Choose a template that matches your course content'}
              </p>
            </div>

            {/* Media Generation Options */}
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Additional Content</h3>
              <p className="text-xs text-text-secondary mb-4">
                Generate additional multimedia versions of your course content.
              </p>

              <div className="space-y-3">
                {/* Advanced Prompting */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedConfig.useAdvancedPrompting !== false} // Default to true
                    onChange={(e) => setEditedConfig({ ...editedConfig, useAdvancedPrompting: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">Advanced Content Quality</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Uses chain-of-thought prompting with expert persona and quality validation.
                      <span className="text-yellow-500"> Increases token usage by 30-40%</span> but produces
                      <span className="text-green-500"> 3-5x better quality</span> content with specific examples and deeper insights.
                    </p>
                  </div>
                </label>

                {/* Include Video */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedConfig.includeVideo || false}
                    onChange={(e) => setEditedConfig({ ...editedConfig, includeVideo: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">Generate Video Lesson</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Create a typography-based animated video with narration for each stage
                    </p>
                  </div>
                </label>

                {/* Include Podcast */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editedConfig.includePodcast || false}
                    onChange={(e) => setEditedConfig({ ...editedConfig, includePodcast: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-border text-accent1 focus:ring-accent1"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">Generate Podcast</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Create a conversational podcast with two speakers discussing the course content
                    </p>
                  </div>
                </label>
              </div>
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
