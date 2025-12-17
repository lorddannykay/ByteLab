'use client';

import { useState } from 'react';
import { CourseData, CourseConfig, CourseStage } from '@/types/course';
import TextBlock from './blocks/TextBlock';
import HeadingBlock from './blocks/HeadingBlock';
import ListBlock from './blocks/ListBlock';
import QuizBlock from './blocks/QuizBlock';
import ImageBlock from './blocks/ImageBlock';

interface EditorCanvasProps {
  courseData: CourseData;
  courseConfig: CourseConfig | null;
  selectedStageId: number;
  onUpdate: (data: CourseData) => void;
  onUpdateConfig: (config: CourseConfig) => void;
}

export default function EditorCanvas({
  courseData,
  courseConfig,
  selectedStageId,
  onUpdate,
  onUpdateConfig,
}: EditorCanvasProps) {
  const currentStage = courseData.course.stages.find(s => s.id === selectedStageId);
  
  if (!currentStage) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>Select a stage to edit</p>
      </div>
    );
  }

  const handleUpdateStage = (updatedStage: CourseStage) => {
    const updatedStages = courseData.course.stages.map(s =>
      s.id === selectedStageId ? updatedStage : s
    );
    onUpdate({
      ...courseData,
      course: {
        ...courseData.course,
        stages: updatedStages,
      },
    });
  };

  const content = currentStage.content || {
    introduction: '',
    sections: [],
    summary: '',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stage Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-text-primary mb-2">{currentStage.title}</h2>
        {currentStage.objective && (
          <p className="text-text-secondary">{currentStage.objective}</p>
        )}
      </div>

      {/* Introduction */}
      {content.introduction && (
        <div className="mb-6">
          <TextBlock
            value={content.introduction}
            onChange={(value) => {
              handleUpdateStage({
                ...currentStage,
                content: {
                  ...content,
                  introduction: value,
                },
              });
            }}
            placeholder="Stage introduction..."
            label="Introduction"
            onAIAction={async (action, selectedText) => {
              const response = await fetch('/api/ai/transform-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: selectedText,
                  action,
                  context: {
                    courseTitle: courseData.course.title,
                    stageTitle: currentStage.title,
                    stageObjective: currentStage.objective,
                  },
                }),
              });
              const data = await response.json();
              return data.result;
            }}
          />
        </div>
      )}

      {/* Sections */}
      {content.sections && content.sections.map((section, index) => (
        <div key={index} className="mb-6">
          <HeadingBlock
            value={section.heading}
            onChange={(value) => {
              const updatedSections = [...content.sections];
              updatedSections[index] = { ...section, heading: value };
              handleUpdateStage({
                ...currentStage,
                content: {
                  ...content,
                  sections: updatedSections,
                },
              });
            }}
          />
          {section.items && section.items.length > 0 ? (
            <ListBlock
              items={section.items}
              onChange={(items) => {
                const updatedSections = [...content.sections];
                updatedSections[index] = { ...section, items };
                handleUpdateStage({
                  ...currentStage,
                  content: {
                    ...content,
                    sections: updatedSections,
                  },
                });
              }}
            />
          ) : (
            <TextBlock
              value={section.content || ''}
              onChange={(value) => {
                const updatedSections = [...content.sections];
                updatedSections[index] = { ...section, content: value };
                handleUpdateStage({
                  ...currentStage,
                  content: {
                    ...content,
                    sections: updatedSections,
                  },
                });
              }}
              placeholder="Section content..."
              onAIAction={async (action, selectedText) => {
                const response = await fetch('/api/ai/transform-text', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    text: selectedText,
                    action,
                    context: {
                      courseTitle: courseData.course.title,
                      stageTitle: currentStage.title,
                      stageObjective: currentStage.objective,
                    },
                  }),
                });
                const data = await response.json();
                return data.result;
              }}
            />
          )}
        </div>
      ))}

      {/* Interactive Elements */}
      {currentStage.interactiveElements && currentStage.interactiveElements.map((element, index) => {
        if (element.type === 'quiz' && element.data) {
          return (
            <div key={index} className="mb-6">
              <QuizBlock
                quiz={element.data}
                onChange={(updatedQuiz) => {
                  const updatedElements = [...(currentStage.interactiveElements || [])];
                  updatedElements[index] = { ...element, data: updatedQuiz };
                  handleUpdateStage({
                    ...currentStage,
                    interactiveElements: updatedElements,
                  });
                }}
                onDelete={() => {
                  const updatedElements = currentStage.interactiveElements?.filter((_, i) => i !== index) || [];
                  handleUpdateStage({
                    ...currentStage,
                    interactiveElements: updatedElements,
                  });
                }}
              />
            </div>
          );
        }
        return null;
      })}

      {/* Summary */}
      {content.summary && (
        <div className="mb-6">
          <TextBlock
            value={content.summary}
            onChange={(value) => {
              handleUpdateStage({
                ...currentStage,
                content: {
                  ...content,
                  summary: value,
                },
              });
            }}
            placeholder="Stage summary..."
            label="Summary"
            onAIAction={async (action, selectedText) => {
              const response = await fetch('/api/ai/transform-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: selectedText,
                  action,
                  context: {
                    courseTitle: courseData.course.title,
                    stageTitle: currentStage.title,
                    stageObjective: currentStage.objective,
                  },
                }),
              });
              const data = await response.json();
              return data.result;
            }}
          />
        </div>
      )}

      {/* Add Section Button */}
      <button
        onClick={() => {
          const updatedSections = [...content.sections, { heading: 'New Section', content: '', type: 'text' }];
          handleUpdateStage({
            ...currentStage,
            content: {
              ...content,
              sections: updatedSections,
            },
          });
        }}
        className="w-full p-4 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-accent1 hover:text-accent1 transition-colors"
      >
        + Add Section
      </button>
    </div>
  );
}

