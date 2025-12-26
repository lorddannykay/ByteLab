'use client';

import { useState, useCallback } from 'react';
import { CourseData, CourseConfig, CourseStage, InteractiveElement } from '@/types/course';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentLibrary from './ComponentLibrary';
import AIContentAssistant from './AIContentAssistant';
import MediaUpload from './MediaUpload';
import ImageSearchModal from './ImageSearchModal';
import { TextBlock, HeadingBlock, ListBlock, QuizBlock, ImageBlock, DragDropBlock, VideoBlock, AudioBlock, CodeBlock, FlashcardBlock, ProgressBlock, FreeFormBlock, SectionBlock } from './blocks';
import { PlusIcon, SparklesIcon, VideoCameraIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/Icons/AppleIcons';
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

  // Ensure content.sections is always an array
  const content = currentStage?.content ? {
    ...currentStage.content,
    sections: Array.isArray(currentStage.content.sections)
      ? currentStage.content.sections
      : [],
  } : {
    introduction: '',
    sections: [],
    summary: '',
  };

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

    const elementType = (typeMap[componentType] || componentType) as InteractiveElement['type'];

    const newElement: InteractiveElement = {
      type: elementType,
      data: data || {},
      id: `element-${Date.now()}`,
    };

    const allBlocks = [
      ...(currentStage.blocks || []),
      ...((!currentStage.blocks && content.sections) ? content.sections.map(s => ({ type: 'section' as const, data: s })) : []),
      ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
    ];

    handleUpdateStage({
      ...currentStage,
      blocks: [...allBlocks, newElement],
      interactiveElements: [], // Clear legacy
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
          const newElement: InteractiveElement = {
            type: 'image',
            data: {
              id: mediaAsset.id,
              src: imageData,
              alt: file.name,
              title: file.name,
            },
          };

          const allBlocks = [
            ...(currentStage.blocks || []),
            ...((!currentStage.blocks && content.sections) ? content.sections.map(s => ({ type: 'section' as const, data: s })) : []),
            ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
          ];

          handleUpdateStage({
            ...currentStage,
            blocks: [...allBlocks, newElement],
            interactiveElements: [],
          });
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    } else {
      // For video/audio, add directly
      const mediaUrl = url || URL.createObjectURL(file);
      const newElement: InteractiveElement = {
        type: type as any,
        data: {
          id: `media-${Date.now()}`,
          src: mediaUrl,
          alt: file.name,
          title: file.name,
        },
      };

      const allBlocks: InteractiveElement[] = [
        ...(currentStage.blocks || []),
        ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
        ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
      ];

      handleUpdateStage({
        ...currentStage,
        blocks: [...allBlocks, newElement],
        interactiveElements: [],
      });
    }
  }, [currentStage, handleUpdateStage, addMediaAsset]);

  const handleSelectMediaFromLibrary = useCallback((asset: MediaAsset) => {
    if (!currentStage) return;

    const newElement: InteractiveElement = {
      type: (asset.type === 'image' ? 'image' : 'video') as any,
      data: {
        id: asset.id,
        src: asset.imageData || asset.thumbnailUrl || '',
        alt: asset.name,
        title: asset.name,
      },
    };

    const allBlocks = [
      ...(currentStage.blocks || []),
      ...((!currentStage.blocks && content.sections) ? content.sections.map(s => ({ type: 'section' as const, data: s })) : []),
      ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
    ];

    handleUpdateStage({
      ...currentStage,
      blocks: [...allBlocks, newElement],
      interactiveElements: [],
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

  const handleMoveBlock = useCallback((index: number, direction: number, allBlocks: InteractiveElement[]) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= allBlocks.length) return;

    const blocks = [...allBlocks];
    const [moved] = blocks.splice(index, 1);
    blocks.splice(newIndex, 0, moved);

    const updatedStage = {
      ...currentStage!,
      blocks: blocks,
      interactiveElements: [], // Clear legacy to avoid conflicts
    };

    handleUpdateStage(updatedStage);
    
    // Ensure onUpdate is called to sync with parent
    onUpdate({
      ...courseData,
      course: {
        ...courseData.course,
        stages: courseData.course.stages.map(s =>
          s.id === selectedStageId ? updatedStage : s
        ),
      },
    });
  }, [handleUpdateStage, currentStage, courseData, selectedStageId, onUpdate]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedItem({ type: 'element', index }); // unified as 'element' for drag state
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleApplyAIResult = useCallback((newText: string) => {
    if (!selectedElement || !currentStage) return;

    // 1. Identify where to apply
    const blockEl = selectedElement.closest('[data-block-id]');
    const field = selectedElement.closest('[data-field]')?.getAttribute('data-field');
    const blockId = blockEl?.getAttribute('data-block-id');

    if (blockId && field) {
      // Get all blocks
      const allBlocks: InteractiveElement[] = [
        ...(currentStage.blocks || []),
        ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
        ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
      ];

      // Find block index
      let blockIndex = -1;
      if (blockId.startsWith('block-')) {
        blockIndex = parseInt(blockId.replace('block-', ''));
      } else {
        blockIndex = allBlocks.findIndex(b => b.id === blockId);
      }

      if (blockIndex !== -1) {
        // We trigger the state update by using execCommand or input replacement,
        // which our components (SectionBlock, TextBlock, etc.) handle via onChange.
        // This is safer than manually updating state here because it preserves selection-based replacement.
      }
    }

    // Focus the element
    selectedElement.focus();

    // Check if it's an input or textarea
    if (selectedElement instanceof HTMLInputElement || selectedElement instanceof HTMLTextAreaElement) {
      // For controlled inputs, we try to trigger a change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;

      if (selectedElement instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(selectedElement, newText);
      } else if (selectedElement instanceof HTMLInputElement && nativeInputValueSetter) {
        nativeInputValueSetter.call(selectedElement, newText);
      } else {
        selectedElement.value = newText;
      }

      const event = new Event('input', { bubbles: true });
      selectedElement.dispatchEvent(event);
    } else {
      // For contenteditable or other elements
      document.execCommand('insertText', false, newText);
    }
  }, [selectedElement, currentStage, content]);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number, type: 'section' | 'element') => {
    e.preventDefault();
    setDragOverIndex(null);

    // For unified blocks, we don't strictly need the 'type' check if they are in the same list
    if (!draggedItem || draggedItem.index === targetIndex) {
      setDraggedItem(null);
      return;
    }

    if (!currentStage) return;

    // Get all blocks
    const allBlocks = [
      ...(currentStage.blocks || []),
      ...((!currentStage.blocks && content.sections) ? content.sections.map(s => ({ type: 'section' as const, data: s })) : []),
      ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
    ];

    const blocks = [...allBlocks];
    const [moved] = blocks.splice(draggedItem.index, 1);
    blocks.splice(targetIndex, 0, moved);

    handleUpdateStage({
      ...currentStage,
      blocks: blocks,
    });

    setDraggedItem(null);
  }, [draggedItem, currentStage, handleUpdateStage, content.sections]);

  if (!currentStage) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>No stages available</p>
      </div>
    );
  }


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
      sideCard: undefined,
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
      sideCard: undefined,
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
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedStageId === stage.id && !stage.parentStageId
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
                              className={`w-full text-left p-2 rounded-lg transition-colors text-xs ${selectedStageId === subStage.id
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

            {/* Unified Blocks */}
            {(() => {
              const allBlocks: InteractiveElement[] = [
                ...(currentStage.blocks || []),
                ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
                ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
              ];

              return (
                <AnimatePresence mode="popLayout">
                  {allBlocks.map((block, index) => {
                    const handleBlockChange = (updatedData: any) => {
                      const updatedBlocks = [...allBlocks];
                      updatedBlocks[index] = { ...block, data: updatedData };
                      handleUpdateStage({ ...currentStage, blocks: updatedBlocks, interactiveElements: [] });
                    };

                    const handleBlockDelete = (e?: React.MouseEvent) => {
                      if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                      if (confirm('Are you sure you want to delete this component?')) {
                        const updatedBlocks = allBlocks.filter((_, i) => i !== index);
                        handleUpdateStage({ 
                          ...currentStage, 
                          blocks: updatedBlocks,
                          interactiveElements: [] // Clear legacy to avoid conflicts
                        });
                        // Ensure onUpdate is called to sync with parent
                        onUpdate({
                          ...courseData,
                          course: {
                            ...courseData.course,
                            stages: courseData.course.stages.map(s =>
                              s.id === selectedStageId ? { ...currentStage, blocks: updatedBlocks, interactiveElements: [] } : s
                            ),
                          },
                        });
                      }
                    };

                const renderBlock = () => {
                  switch (block.type) {
                    case 'section':
                      return (
                        <div data-block-id={block.id || `block-${index}`} data-field="content">
                          <SectionBlock
                            section={block.data}
                            onChange={handleBlockChange}
                            onDelete={handleBlockDelete}
                            onSearchImage={() => {
                              setSelectedImageSection({ sectionIndex: index });
                              setShowImageSearch(true);
                            }}
                          />
                        </div>
                      );
                    case 'quiz':
                      return <div data-block-id={block.id || `block-${index}`} data-field="quiz"><QuizBlock quiz={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'dragdrop':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><DragDropBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'video':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><VideoBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'audio':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><AudioBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'image':
                      return (
                        <div data-block-id={block.id || `block-${index}`} data-field="data">
                          <ImageBlock
                            src={block.data?.src || block.data?.imageData || ''}
                            alt={block.data?.alt || block.data?.title || ''}
                            imageMetadata={block.data?.imageMetadata}
                            onUpdate={(src, alt, imageMetadata) => handleBlockChange({ ...block.data, src, alt, imageMetadata })}
                            onDelete={handleBlockDelete}
                          />
                        </div>
                      );
                    case 'code':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><CodeBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'canvas':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><FreeFormBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'flashcard':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><FlashcardBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    case 'progress':
                      return <div data-block-id={block.id || `block-${index}`} data-field="data"><ProgressBlock data={block.data} onChange={handleBlockChange} onDelete={handleBlockDelete} /></div>;
                    default:
                      return null;
                  }
                };

                    return (
                      <motion.div
                        key={block.id || `block-${index}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index, 'element')}
                        className={`mb-6 p-4 bg-bg2 border border-border rounded-lg cursor-move transition-all duration-200 ${dragOverIndex === index ? 'border-accent1 bg-accent1/10 scale-[1.02]' : ''
                          } ${draggedItem?.index === index ? 'opacity-50' : ''}`}
                      >
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                      <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                        <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        {block.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            handleMoveBlock(index, -1, allBlocks); 
                          }}
                          disabled={index === 0}
                          className="p-2.5 hover:bg-accent1/20 hover:text-accent1 rounded-lg text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-accent1/30 bg-accent1/5"
                          title="Move up"
                          aria-label="Move component up"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            handleMoveBlock(index, 1, allBlocks); 
                          }}
                          disabled={index === allBlocks.length - 1}
                          className="p-2.5 hover:bg-accent1/20 hover:text-accent1 rounded-lg text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95 border-2 border-transparent hover:border-accent1/30 bg-accent1/5"
                          title="Move down"
                          aria-label="Move component down"
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border mx-1"></div>
                        <button
                          onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation(); 
                            handleBlockDelete(e); 
                          }}
                          className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-text-secondary transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-red-500/20"
                          title="Delete component"
                          aria-label="Delete component"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      </div>
                      {renderBlock()}
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              );
            })()}

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

            {/* Add Section Button (now adds a section block) */}
            <button
              onClick={() => {
                const allBlocks: InteractiveElement[] = [
                  ...(currentStage.blocks || []),
                  ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
                  ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
                ];
                handleUpdateStage({
                  ...currentStage,
                  blocks: [...allBlocks, { type: 'section', data: { heading: 'New Section', content: '' } }]
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
              const allBlocks = [
                ...(currentStage.blocks || []),
                ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
                ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
              ];

              const updatedBlocks = [...allBlocks];
              const block = updatedBlocks[selectedImageSection.sectionIndex];

              if (block && block.type === 'section') {
                updatedBlocks[selectedImageSection.sectionIndex] = {
                  ...block,
                  data: {
                    ...block.data,
                    image,
                  },
                };
              }

              handleUpdateStage({
                ...currentStage,
                blocks: updatedBlocks,
                interactiveElements: [],
              });
            }
            setShowImageSearch(false);
            setSelectedImageSection(null);
          }}
          currentImage={selectedImageSection && (() => {
            const allBlocks: InteractiveElement[] = [
              ...(currentStage.blocks || []),
              ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
              ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
            ];
            return allBlocks[selectedImageSection.sectionIndex]?.data?.image;
          })()}
          searchQuery={selectedImageSection && (() => {
            const allBlocks: InteractiveElement[] = [
              ...(currentStage.blocks || []),
              ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
              ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
            ];
            return allBlocks[selectedImageSection.sectionIndex]?.data?.heading;
          })()}
          context={selectedImageSection && (() => {
            const allBlocks: InteractiveElement[] = [
              ...(currentStage.blocks || []),
              ...((!currentStage.blocks && content.sections) ? content.sections.map((s, i) => ({ type: 'section' as const, data: s, id: `legacy-section-${i}` })) : []),
              ...((!currentStage.blocks && currentStage.interactiveElements) ? currentStage.interactiveElements : [])
            ];
            const block = allBlocks[selectedImageSection.sectionIndex];
            if (block && block.type === 'section') {
              return {
                heading: block.data.heading,
                content: block.data.content,
                topic: courseData.course.title || courseConfig.topic || ''
              };
            }
            return { topic: courseData.course.title || courseConfig.topic || '' };
          })()}
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
              onApplyResult={handleApplyAIResult}
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

