'use client';

import { useState, useCallback } from 'react';
import { CourseData, CourseConfig, CourseStage } from '@/types/course';
import ComponentLibrary from './ComponentLibrary';
import AIContentAssistant from './AIContentAssistant';
import MediaUpload from './MediaUpload';
import ImageSearchModal from './ImageSearchModal';
import { TextBlock, HeadingBlock, ListBlock, QuizBlock, ImageBlock, DragDropBlock, VideoBlock, AudioBlock, CodeBlock, FlashcardBlock, ProgressBlock } from './blocks';
import { PlusIcon, SparklesIcon, VideoCameraIcon } from '@/components/Icons/AppleIcons';
import { useCourseCreation } from '@/contexts/CourseCreationContext';
import { MediaAsset } from '@/types/courseCreation';
import { ImageMetadata } from '@/types/course';

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
  const { state, addMediaAsset } = useCourseCreation();
  const [selectedStageId, setSelectedStageId] = useState<number>(
    courseData.course.stages[0]?.id || 1
  );
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [selectedImageSection, setSelectedImageSection] = useState<{ sectionIndex: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'section' | 'element'; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [stagesSidebarVisible, setStagesSidebarVisible] = useState(true);

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

    // Add to media library if it's an image
    if (type === 'image' && file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const mediaAsset: MediaAsset = {
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: 'image',
            imageData: imageData,
            width: img.width,
            height: img.height,
            createdAt: Date.now(),
          };
          addMediaAsset(mediaAsset);

          // Add to stage
          const newElement = {
            type: 'image',
            data: {
              id: mediaAsset.id,
              src: imageData,
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
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    } else {
      // For video/audio, add directly
      const mediaUrl = url || URL.createObjectURL(file);
      const newElement = {
        type: type,
        data: {
          id: `media-${Date.now()}`,
          src: mediaUrl,
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
    }
  }, [currentStage, handleUpdateStage, addMediaAsset]);

  const handleSelectMediaFromLibrary = useCallback((asset: MediaAsset) => {
    if (!currentStage) return;

    const newElement = {
      type: asset.type === 'image' ? 'image' : 'video',
      data: {
        id: asset.id,
        src: asset.imageData || asset.thumbnailUrl || '',
        alt: asset.name,
        title: asset.name,
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

    setShowMediaLibrary(false);
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

    if (type === 'section') {
      const currentSections = Array.isArray(currentStage.content?.sections) 
        ? currentStage.content.sections 
        : [];
      if (currentSections.length === 0) return;
      
      const sections = [...currentSections];
      const [moved] = sections.splice(draggedItem.index, 1);
      sections.splice(targetIndex, 0, moved);
      
      handleUpdateStage({
        ...currentStage,
        content: {
          ...currentStage.content || { introduction: '', sections: [], summary: '' },
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

  // Ensure content.sections is always an array
  const content = currentStage.content ? {
    ...currentStage.content,
    sections: Array.isArray(currentStage.content.sections) 
      ? currentStage.content.sections 
      : [],
  } : {
    introduction: '',
    sections: [],
    summary: '',
  };

  const topLevelStages = courseData.course.stages.filter(s => !s.parentStageId);
  
  const getSubStages = (stageId: number) => {
    return courseData.course.stages.filter(s => s.parentStageId === stageId);
  };

  const handleAddSubStage = useCallback((parentStageId: number) => {
    const parentStage = courseData.course.stages.find(s => s.id === parentStageId);
    if (!parentStage) return;

    const maxSubStageId = courseData.course.stages
      .filter(s => s.parentStageId === parentStageId)
      .reduce((max, s) => Math.max(max, s.id), 0);
    
    const newSubStage: CourseStage = {
      id: maxSubStageId + 1,
      title: `Sub-Stage ${maxSubStageId + 1}`,
      objective: '',
      content: {
        introduction: '',
        sections: [],
        summary: '',
      },
      interactiveElements: [],
      quizQuestions: [],
      sideCard: null,
      parentStageId: parentStageId,
    };

    const updatedStages = [...courseData.course.stages, newSubStage];
    onUpdate({
      ...courseData,
      course: {
        ...courseData.course,
        stages: updatedStages,
      },
    });
  }, [courseData, onUpdate]);

  const handleAddStage = useCallback(() => {
    const maxStageId = courseData.course.stages
      .filter(s => !s.parentStageId)
      .reduce((max, s) => Math.max(max, s.id), 0);
    
    const newStage: CourseStage = {
      id: maxStageId + 1,
      title: `Stage ${maxStageId + 1}`,
      objective: '',
      content: {
        introduction: '',
        sections: [],
        summary: '',
      },
      interactiveElements: [],
      quizQuestions: [],
      sideCard: null,
    };

    const updatedStages = [...courseData.course.stages, newStage];
    onUpdate({
      ...courseData,
      course: {
        ...courseData.course,
        stages: updatedStages,
      },
    });
  }, [courseData, onUpdate]);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar - Stage Navigation */}
      {stagesSidebarVisible && (
        <div className="w-64 bg-bg2 border-r border-border overflow-y-auto flex-shrink-0 transition-all">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Stages</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddStage}
                  className="p-1.5 hover:bg-bg3 rounded transition-colors"
                  title="Add new stage"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStagesSidebarVisible(false)}
                  className="p-1.5 hover:bg-bg3 rounded transition-colors"
                  title="Hide stages sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          <div className="space-y-2">
            {topLevelStages.map((stage) => {
              const hasContent = !!stage.content;
              const subStages = getSubStages(stage.id);
              const isExpanded = selectedStageId === stage.id || subStages.some(s => s.id === selectedStageId);
              
              return (
                <div key={stage.id}>
                  <button
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedStageId === stage.id && !stage.parentStageId
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
                  {subStages.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-border pl-2">
                      {subStages.map((subStage) => {
                        const hasSubContent = !!subStage.content;
                        return (
                          <button
                            key={subStage.id}
                            onClick={() => setSelectedStageId(subStage.id)}
                            className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${
                              selectedStageId === subStage.id
                                ? 'bg-accent1/20 border border-accent1'
                                : 'bg-bg1 border border-border/50 hover:bg-bg3'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-accent1/70">Sub {subStage.id}</span>
                              {hasSubContent && (
                                <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-500 rounded text-[10px]">
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-medium text-text-primary line-clamp-1">{subStage.title}</div>
                          </button>
                        );
                      })}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSubStage(stage.id);
                        }}
                        className="w-full text-left p-2 text-xs text-text-tertiary hover:text-accent1 transition-colors flex items-center gap-1"
                      >
                        <PlusIcon className="w-3 h-3" />
                        Add Sub-Stage
                      </button>
                    </div>
                  )}
                  {subStages.length === 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubStage(stage.id);
                      }}
                      className="ml-4 mt-1 text-xs text-text-tertiary hover:text-accent1 transition-colors flex items-center gap-1"
                    >
                      <PlusIcon className="w-3 h-3" />
                      Add Sub-Stage
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Show Stages Button (when hidden) */}
      {!stagesSidebarVisible && (
        <button
          onClick={() => setStagesSidebarVisible(true)}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50 p-2 bg-bg2 border-r border-t border-b border-border rounded-r-lg shadow-lg hover:bg-bg3 transition-colors"
          title="Show stages sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

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
            onClick={() => {
              setShowMediaUpload(true);
              setShowMediaLibrary(false);
            }}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <VideoCameraIcon className="w-4 h-4" />
            Upload Media
          </button>
          <button
            onClick={() => {
              setShowMediaLibrary(true);
              setShowMediaUpload(false);
            }}
            className="px-3 py-1.5 text-sm glass-button rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Media Library
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
            {content.sections.map((section, index) => (
              <div
                key={`section-${index}`}
                draggable
                onDragStart={(e) => {
                  handleDragStart('section', index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(e, index);
                }}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop(e, index, 'section');
                }}
                className={`mb-6 p-4 bg-bg2 border border-border rounded-lg group cursor-move transition-all ${
                  dragOverIndex === index && draggedItem?.type === 'section' ? 'border-accent1 bg-accent1/10' : ''
                } ${draggedItem?.type === 'section' && draggedItem.index === index ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-text-tertiary cursor-move" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <span className="text-xs text-text-tertiary">Drag to reorder</span>
                </div>
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
                {/* Section Image */}
                <div className="mb-4">
                  {section.image ? (
                    <div className="relative group">
                      <img
                        src={section.image.thumbnailUrl || section.image.url}
                        alt={section.image.attribution || section.heading}
                        className="w-full rounded-lg border border-border max-h-64 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedImageSection({ sectionIndex: index });
                            setShowImageSearch(true);
                          }}
                          className="p-2 bg-bg1/90 rounded hover:bg-bg2 transition-colors"
                          title="Change image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            const updatedSections = [...content.sections];
                            updatedSections[index] = { ...section, image: undefined };
                            handleUpdateStage({
                              ...currentStage,
                              content: {
                                ...content,
                                sections: updatedSections,
                              },
                            });
                          }}
                          className="p-2 bg-red-500/90 rounded hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="truncate">{section.image.attribution}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedImageSection({ sectionIndex: index });
                        setShowImageSearch(true);
                      }}
                      className="w-full p-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-accent1 transition-colors bg-bg1/50"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-text-secondary text-sm">Add image to section</p>
                      <p className="text-text-tertiary text-xs mt-1">Search from Pexels & Unsplash</p>
                    </button>
                  )}
                </div>
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
                    if (confirm('Are you sure you want to delete this section?')) {
                      const updatedSections = content.sections.filter((_, i) => i !== index);
                      handleUpdateStage({
                        ...currentStage,
                        content: {
                          ...content,
                          sections: updatedSections,
                        },
                      });
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 mt-2 text-sm text-red-500 hover:text-red-600 transition-opacity flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
                if (confirm('Are you sure you want to delete this component?')) {
                  const updatedElements = currentStage.interactiveElements?.filter((_, i) => i !== index) || [];
                  handleUpdateStage({
                    ...currentStage,
                    interactiveElements: updatedElements,
                  });
                }
              };

              const renderElement = () => {
                switch (element.type) {
                  case 'quiz':
                    return (
                      <QuizBlock
                        quiz={element.data || { question: '', options: [], correctAnswer: '' }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'dragdrop':
                    return (
                      <DragDropBlock
                        data={element.data || { instruction: '', items: [] }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'video':
                    return (
                      <VideoBlock
                        data={element.data || { type: 'url', url: '', title: '' }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'audio':
                    return (
                      <AudioBlock
                        data={element.data || { url: '', title: '' }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'image':
                    return (
                      <ImageBlock
                        src={element.data?.src || element.data?.imageData || ''}
                        alt={element.data?.alt || element.data?.title || ''}
                        imageMetadata={element.data?.imageMetadata}
                        onUpdate={(src, alt, imageMetadata) => handleElementChange({ ...element.data, src, alt, imageMetadata })}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'code':
                    return (
                      <CodeBlock
                        data={element.data || { language: 'javascript', code: '', title: '' }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'flashcard':
                    return (
                      <FlashcardBlock
                        data={element.data || { title: '', cards: [] }}
                        onChange={handleElementChange}
                        onDelete={handleElementDelete}
                      />
                    );
                  case 'progress':
                    return (
                      <ProgressBlock
                        data={element.data || { label: '', current: 0, total: 100 }}
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
                const currentSections = content.sections || [];
                const updatedSections = [...currentSections, { heading: 'New Section', content: '', type: 'text' }];
                handleUpdateStage({
                  ...currentStage,
                  content: {
                    ...content,
                    sections: updatedSections,
                  },
                });
              }}
              className="w-full p-4 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-accent1 hover:text-accent1 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {/* Image Search Modal */}
      {showImageSearch && selectedImageSection && (
        <ImageSearchModal
          isOpen={showImageSearch}
          onClose={() => {
            setShowImageSearch(false);
            setSelectedImageSection(null);
          }}
          onSelect={(image: ImageMetadata) => {
            if (selectedImageSection && currentStage) {
              const updatedSections = [...content.sections];
              updatedSections[selectedImageSection.sectionIndex] = {
                ...updatedSections[selectedImageSection.sectionIndex],
                image,
              };
              handleUpdateStage({
                ...currentStage,
                content: {
                  ...content,
                  sections: updatedSections,
                },
              });
            }
            setShowImageSearch(false);
            setSelectedImageSection(null);
          }}
          currentImage={selectedImageSection ? content.sections[selectedImageSection.sectionIndex]?.image : undefined}
          searchQuery={selectedImageSection ? content.sections[selectedImageSection.sectionIndex]?.heading : ''}
        />
      )}

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

      {/* Media Library Sidebar */}
      {showMediaLibrary && (
        <div className="w-80 bg-bg2 border-l border-border overflow-y-auto">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Media Library</h2>
            <button
              onClick={() => setShowMediaLibrary(false)}
              className="p-1 hover:bg-bg3 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            {state.mediaAssets && state.mediaAssets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {state.mediaAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => handleSelectMediaFromLibrary(asset)}
                    className="relative aspect-square bg-bg1 border border-border rounded-lg overflow-hidden cursor-pointer hover:border-accent1 transition-colors group"
                  >
                    {asset.type === 'image' && asset.imageData && (
                      <img
                        src={asset.imageData}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {asset.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-tertiary">
                <p className="text-sm">No media in library</p>
                <p className="text-xs mt-1">Upload media to add it here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

