'use client';

import { useState, useCallback } from 'react';
import { CourseData, CourseConfig, CourseStage } from '@/types/course';
import ComponentLibrary from './ComponentLibrary';
import AIContentAssistant from './AIContentAssistant';
import MediaUpload from './MediaUpload';
import { TextBlock, HeadingBlock, ListBlock, QuizBlock, ImageBlock, DragDropBlock, VideoBlock, AudioBlock, CodeBlock, FlashcardBlock, ProgressBlock } from './blocks';
import { PlusIcon, SparklesIcon, VideoCameraIcon } from '@/components/Icons/AppleIcons';

interface VisualHTMLEditorProps {
  courseData: CourseData;
  courseConfig: CourseConfig;
  onUpdate: (data: CourseData) => void;
  onUpdateConfig: (config: CourseConfig) => void;
}

export default function VisualHTMLEditor({
  courseData,
  courseConfig,
  onUpdate,
  onUpdateConfig,
}: VisualHTMLEditorProps) {
  const [selectedStageId, setSelectedStageId] = useState<number>(
    courseData.course.stages[0]?.id || 1
  );
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'section' | 'element'; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentStage = courseData.course.stages.find(s => s.id === selectedStageId);

  const handleUpdateStage = useCallback((updatedStage: CourseStage) => {
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
  }, [courseData, selectedStageId, onUpdate]);

  const handleAddComponent = useCallback((componentType: string, data?: any) => {
    if (!currentStage) return;

    // Map component library IDs to element types
    const typeMap: Record<string, string> = {
      'quiz': 'quiz',
      'dragdrop': 'dragdrop',
      'video': 'video',
      'audio': 'audio',
      'code': 'code',
      'diagram': 'diagram', // Not implemented yet
      'flashcard': 'flashcard',
      'progress': 'progress',
    };

    const elementType = typeMap[componentType] || componentType;

    const newElement = {
      type: elementType,
      data: data || {},
      id: `element-${Date.now()}`,
    };

    const updatedElements = [
      ...(currentStage.interactiveElements || []),
      newElement,
    ];

    handleUpdateStage({
      ...currentStage,
      interactiveElements: updatedElements,
    });

    setShowComponentLibrary(false);
  }, [currentStage, handleUpdateStage]);

  const handleMediaUpload = useCallback((type: 'image' | 'video' | 'audio', file: File, url?: string) => {
    if (!currentStage) return;

    const newElement = {
      type: type === 'image' ? 'image' : type,
      data: {
        id: `media-${Date.now()}`,
        src: url || URL.createObjectURL(file),
        alt: file.name,
        title: file.name,
      },
    };

    const updatedElements = [
      ...(currentStage.interactiveElements || []),
      newElement,
    ];

    handleUpdateStage({
      ...currentStage,
      interactiveElements: updatedElements,
    });
  }, [currentStage, handleUpdateStage]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
      setSelectedElement(selection.anchorNode?.parentElement as HTMLElement || null);
      setShowAIAssistant(true);
    }
  }, []);

  const handleDragStart = useCallback((type: 'section' | 'element', index: number) => {
    setDraggedItem({ type, index });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number, type: 'section' | 'element') => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem || draggedItem.type !== type || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }

    if (!currentStage) return;

    if (type === 'section' && currentStage.content?.sections) {
      const sections = [...currentStage.content.sections];
      const [moved] = sections.splice(draggedItem.index, 1);
      sections.splice(targetIndex, 0, moved);
      
      handleUpdateStage({
        ...currentStage,
        content: {
          ...currentStage.content,
          sections,
        },
      });
    } else if (type === 'element' && currentStage.interactiveElements) {
      const elements = [...currentStage.interactiveElements];
      const [moved] = elements.splice(draggedItem.index, 1);
      elements.splice(targetIndex, 0, moved);
      
      handleUpdateStage({
        ...currentStage,
        interactiveElements: elements,
      });
    }

    setDraggedItem(null);
  }, [draggedItem, currentStage, handleUpdateStage]);

  if (!currentStage) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>No stages available</p>
      </div>
    );
  }

  const content = currentStage.content || {
    introduction: '',
    sections: [],
    summary: '',
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar - Stage Navigation */}
      <div className="w-64 bg-bg2 border-r border-border overflow-y-auto">
        <div className="p-4">
          <h2 className="font-semibold text-text-primary mb-4">Stages</h2>
          <div className="space-y-2">
            {courseData.course.stages.map((stage) => {
              const hasContent = !!stage.content;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStageId(stage.id)}
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
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center - Editor Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="glass glass-light border-b border-border/30 px-4 py-2 flex items-center gap-2">
          <button
            onClick={() => setShowComponentLibrary(!showComponentLibrary)}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Component
          </button>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            AI Assistant
          </button>
          <button
            onClick={() => setShowMediaUpload(true)}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <VideoCameraIcon className="w-4 h-4" />
            Add Media
          </button>
          <div className="flex-1" />
          <span className="text-xs text-text-secondary">
            Select text for AI actions
          </span>
        </div>

        {/* Editor Content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          onMouseUp={handleTextSelection}
        >
          <div className="max-w-4xl mx-auto">
            {/* Stage Header */}
            <div className="mb-6">
              <HeadingBlock
                value={currentStage.title}
                onChange={(value) => {
                  handleUpdateStage({
                    ...currentStage,
                    title: value,
                  });
                }}
                level={1}
              />
              {currentStage.objective && (
                <TextBlock
                  value={currentStage.objective}
                  onChange={(value) => {
                    handleUpdateStage({
                      ...currentStage,
                      objective: value,
                    });
                  }}
                  placeholder="Stage objective..."
                  label="Objective"
                />
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
                />
              </div>
            )}

            {/* Sections */}
            {content.sections && content.sections.map((section, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart('section', index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index, 'section')}
                className={`mb-6 p-4 bg-bg2 border border-border rounded-lg group cursor-move transition-all ${
                  dragOverIndex === index && draggedItem?.type === 'section' ? 'border-accent1 bg-accent1/10' : ''
                } ${draggedItem?.type === 'section' && draggedItem.index === index ? 'opacity-50' : ''}`}
              >
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
                  level={3}
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
                  />
                )}
                <button
                  onClick={() => {
                    const updatedSections = content.sections.filter((_, i) => i !== index);
                    handleUpdateStage({
                      ...currentStage,
                      content: {
                        ...content,
                        sections: updatedSections,
                      },
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 mt-2 text-sm text-red-500 hover:text-red-600 transition-opacity"
                >
                  Delete section
                </button>
              </div>
            ))}

            {/* Interactive Elements */}
            {currentStage.interactiveElements && currentStage.interactiveElements.map((element, index) => {
              const handleElementChange = (updatedData: any) => {
                const updatedElements = [...(currentStage.interactiveElements || [])];
                updatedElements[index] = { ...element, data: updatedData };
                handleUpdateStage({
                  ...currentStage,
                  interactiveElements: updatedElements,
                });
              };

              const handleElementDelete = () => {
                const updatedElements = currentStage.interactiveElements?.filter((_, i) => i !== index) || [];
                handleUpdateStage({
                  ...currentStage,
                  interactiveElements: updatedElements,
                });
              };

              const renderElement = () => {
                switch (element.type) {
                  case 'quiz':
                    return (
                      <QuizBlock
                        quiz={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'dragdrop':
                    return (
                      <DragDropBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'video':
                    return (
                      <VideoBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'audio':
                    return (
                      <AudioBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'code':
                    return (
                      <CodeBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'flashcard':
                    return (
                      <FlashcardBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'progress':
                    return (
                      <ProgressBlock
                        data={element.data}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  default:
                    return null;
                }
              };

              return (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart('element', index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index, 'element')}
                  className={`mb-6 p-4 bg-bg2 border border-border rounded-lg cursor-move transition-all ${
                    dragOverIndex === index && draggedItem?.type === 'element' ? 'border-accent1 bg-accent1/10' : ''
                  } ${draggedItem?.type === 'element' && draggedItem.index === index ? 'opacity-50' : ''}`}
                >
                  {renderElement()}
                </div>
              );
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
        </div>
      </div>

      {/* Right Sidebar - Component Library / AI Assistant */}
      {(showComponentLibrary || showAIAssistant) && (
        <div className="w-80 bg-bg2 border-l border-border overflow-y-auto">
          {showComponentLibrary && (
            <ComponentLibrary
              onAddComponent={handleAddComponent}
              onClose={() => setShowComponentLibrary(false)}
            />
          )}
          {showAIAssistant && (
            <AIContentAssistant
              courseData={courseData}
              selectedStageId={selectedStageId}
              selectedText={selectedText}
              selectedElement={selectedElement}
              onUpdate={handleUpdateStage}
              onClose={() => {
                setShowAIAssistant(false);
                setSelectedText('');
                setSelectedElement(null);
              }}
            />
          )}
        </div>
      )}

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload
          onUpload={handleMediaUpload}
          onClose={() => setShowMediaUpload(false)}
        />
      )}
    </div>
  );
}

