'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseMetadata, CourseFolder } from '@/types/courseMetadata';
import { CourseData, CourseConfig } from '@/types/course';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useCourses } from '@/contexts/CourseContext';
import CoursePreview from '@/components/Workspace/CoursePreview';
import TagEditor from './TagEditor';
import JSZip from 'jszip';

interface AnimatedCourseCardProps {
  course: CourseMetadata;
  isCreateNew?: boolean;
  onDelete?: (id: string) => void;
  onMoveToFolder?: (courseId: string, folderId: string | null) => void;
  folders?: CourseFolder[];
  isSelected?: boolean;
  onSelect?: (courseId: string, selected: boolean) => void;
  selectionMode?: boolean;
  allCourses?: CourseMetadata[];
}

// CSS Pattern definitions - using CSS variables for theme colors
type PatternStyle = {
  backgroundColor: string;
  opacity: string;
  backgroundImage?: string;
  background?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  backgroundBlendMode?: string;
};

const getPatternStyles = (baseColor: string, patternColor: string): PatternStyle[] => [
  // wavy
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `repeating-radial-gradient(circle at 0 0, transparent 0, ${baseColor} 10px), repeating-linear-gradient(${patternColor}55, ${patternColor})`,
  },
  // rhombus
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `linear-gradient(135deg, ${patternColor} 25%, transparent 25%), linear-gradient(225deg, ${patternColor} 25%, transparent 25%), linear-gradient(45deg, ${patternColor} 25%, transparent 25%), linear-gradient(315deg, ${patternColor} 25%, ${baseColor} 25%)`,
    backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
    backgroundSize: '10px 10px',
    backgroundRepeat: 'repeat',
  },
  // zigzag
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `linear-gradient(135deg, ${patternColor} 25%, transparent 25%), linear-gradient(225deg, ${patternColor} 25%, transparent 25%), linear-gradient(45deg, ${patternColor} 25%, transparent 25%), linear-gradient(315deg, ${patternColor} 25%, ${baseColor} 25%)`,
    backgroundPosition: '10px 0, 10px 0, 0 0, 0 0',
    backgroundSize: '20px 20px',
    backgroundRepeat: 'repeat',
  },
  // moon
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `radial-gradient(ellipse farthest-corner at 10px 10px, ${patternColor}, ${patternColor} 50%, ${baseColor} 50%)`,
    backgroundSize: '10px 10px',
  },
  // circles
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `radial-gradient(circle at center center, ${patternColor}, ${baseColor}), repeating-radial-gradient(circle at center center, ${patternColor}, ${patternColor}, 10px, transparent 20px, transparent 10px)`,
    backgroundBlendMode: 'multiply',
  },
  // diagonal
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    background: `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 5px, ${baseColor} 5px, ${baseColor} 25px)`,
  },
  // diagonal 2
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    background: `repeating-linear-gradient(-45deg, ${patternColor}, ${patternColor} 5px, ${baseColor} 5px, ${baseColor} 25px)`,
  },
  // isometric
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `linear-gradient(30deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}), linear-gradient(150deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}), linear-gradient(30deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}), linear-gradient(150deg, ${patternColor} 12%, transparent 12.5%, transparent 87%, ${patternColor} 87.5%, ${patternColor}), linear-gradient(60deg, ${patternColor}77 25%, transparent 25.5%, transparent 75%, ${patternColor}77 75%, ${patternColor}77), linear-gradient(60deg, ${patternColor}77 25%, transparent 25.5%, transparent 75%, ${patternColor}77 75%, ${patternColor}77)`,
    backgroundSize: '20px 35px',
    backgroundPosition: '0 0, 0 0, 10px 18px, 10px 18px, 0 0, 10px 18px',
  },
  // polka
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `radial-gradient(${patternColor} 0.5px, ${baseColor} 0.5px)`,
    backgroundSize: '10px 10px',
  },
  // lines
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `linear-gradient(0deg, ${baseColor} 50%, ${patternColor} 50%)`,
    backgroundSize: '10px 10px',
  },
  // triangle
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    backgroundImage: `linear-gradient(45deg, ${patternColor} 50%, ${baseColor} 50%)`,
    backgroundSize: '10px 10px',
  },
  // cross
  {
    backgroundColor: baseColor,
    opacity: '0.8',
    background: `radial-gradient(circle, transparent 20%, ${baseColor} 20%, ${baseColor} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${baseColor} 20%, ${baseColor} 80%, transparent 80%, transparent) 25px 25px, linear-gradient(${patternColor} 2px, transparent 2px) 0 -1px, linear-gradient(90deg, ${patternColor} 2px, ${baseColor} 2px) -1px 0`,
    backgroundSize: '50px 50px, 50px 50px, 25px 25px, 25px 25px',
  },
];

// Hash function to deterministically select pattern based on course ID
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get CSS variable value from computed styles
const getCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '#f4f5f6'; // Default fallback for baseColor
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || (variable.includes('bg') ? '#f4f5f6' : '#4a90e2');
};

export default function AnimatedCourseCard({ 
  course, 
  isCreateNew, 
  onDelete, 
  onMoveToFolder, 
  folders = [],
  isSelected = false,
  onSelect,
  selectionMode = false,
  allCourses = []
}: AnimatedCourseCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [patternStyle, setPatternStyle] = useState<PatternStyle | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { getCourse, updateCourseTags } = useCourses();
  
  // Get pattern style for course - computed after mount to ensure CSS variables are available
  useEffect(() => {
    if (isCreateNew) {
      setPatternStyle(null);
      return;
    }
    // Use a small timeout to ensure DOM is ready and CSS variables are computed
    const timer = setTimeout(() => {
      const hash = hashString(course.id);
      const baseColor = getCSSVariable('--bg1');
      const patternColor = getCSSVariable('--accent1');
      if (baseColor && patternColor) {
        const patterns = getPatternStyles(baseColor, patternColor);
        setPatternStyle(patterns[hash % patterns.length]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [course.id, isCreateNew]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  if (isCreateNew) {
    return (
      <div className="card-animation-layer">
        <article className="animated-card">
          <Link href="/course/new" className="block">
            <div className="w-full aspect-square bg-gradient-to-br from-accent1 to-accent2 rounded-lg mb-2 flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-text-primary font-semibold mb-2">Create new course</p>
            <span className="text-accent1 text-sm">
              Start building
            </span>
          </Link>
        </article>
      </div>
    );
  }

  const imageUrl = course.thumbnail;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle card click if tag editor is open
    if (showTagEditor) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Don't handle card click if menu is open
    if (showMenu) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Don't handle card click if clicking on checkbox or its container
    const target = e.target as HTMLElement;
    if (target.closest('input[type="checkbox"]') || target.closest('.checkbox-container')) {
      return;
    }
    // Don't handle if clicking on Link content in selection mode
    if (selectionMode && target.closest('a')) {
      e.preventDefault();
    }
    if (selectionMode && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(course.id, !isSelected);
    }
  };

  // Get full course data for exports
  const getFullCourseData = (): { courseData: CourseData | null; config: CourseConfig | null } => {
    const fullCourse = getCourse(course.id);
    if (!fullCourse || !fullCourse.state.courseData) {
      return { courseData: null, config: null };
    }
    return {
      courseData: fullCourse.state.courseData,
      config: fullCourse.state.courseConfig || null,
    };
  };

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string = 'text/html') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Extract file from ZIP
  const extractFileFromZip = async (zipBlob: Blob, filename: string): Promise<string | null> => {
    try {
      const zip = await JSZip.loadAsync(zipBlob);
      const file = zip.file(filename);
      if (!file) return null;
      return await file.async('string');
    } catch (error) {
      console.error('Error extracting file from ZIP:', error);
      return null;
    }
  };

  // Export handlers
  const handleExportSCORM = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) {
      alert('Course data not available. Please ensure the course is fully generated.');
      return;
    }

    setIsExporting(true);
    setExportType('SCORM');
    try {
      const response = await fetch('/api/export/scorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseData, config }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = (config.title || course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.download = `${safeTitle}-scorm.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export SCORM package');
      }
    } catch (error) {
      console.error('SCORM export error:', error);
      alert('Failed to export SCORM package');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowMenu(false);
    }
  };

  const handleDownloadHTML = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) {
      alert('Course data not available. Please ensure the course is fully generated.');
      return;
    }

    setIsExporting(true);
    setExportType('HTML');
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseData, config, courseId: course.id }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const safeTitle = (config.title || course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const htmlContent = await extractFileFromZip(zipBlob, `${safeTitle}.html`);
        if (htmlContent) {
          downloadFile(htmlContent, `${safeTitle}.html`, 'text/html');
        } else {
          alert('Failed to extract HTML file from ZIP');
        }
      } else {
        alert('Failed to download HTML course');
      }
    } catch (error) {
      console.error('HTML download error:', error);
      alert('Failed to download HTML course');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowMenu(false);
    }
  };

  const handleDownloadVideo = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) {
      alert('Course data not available. Please ensure the course is fully generated.');
      return;
    }

    setIsExporting(true);
    setExportType('Video');
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseData, config, courseId: course.id }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const safeTitle = (config.title || course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const htmlContent = await extractFileFromZip(zipBlob, `${safeTitle}-video.html`);
        if (htmlContent) {
          downloadFile(htmlContent, `${safeTitle}-video.html`, 'text/html');
        } else {
          alert('Failed to extract video HTML file from ZIP');
        }
      } else {
        alert('Failed to download video course');
      }
    } catch (error) {
      console.error('Video download error:', error);
      alert('Failed to download video course');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowMenu(false);
    }
  };

  const handleDownloadPodcast = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) {
      alert('Course data not available. Please ensure the course is fully generated.');
      return;
    }

    setIsExporting(true);
    setExportType('Podcast');
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseData, config, courseId: course.id }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const safeTitle = (config.title || course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const htmlContent = await extractFileFromZip(zipBlob, `${safeTitle}-podcast.html`);
        if (htmlContent) {
          downloadFile(htmlContent, `${safeTitle}-podcast.html`, 'text/html');
        } else {
          alert('Failed to extract podcast HTML file from ZIP');
        }
      } else {
        alert('Failed to download podcast course');
      }
    } catch (error) {
      console.error('Podcast download error:', error);
      alert('Failed to download podcast course');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowMenu(false);
    }
  };

  const handleDownloadZIP = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) {
      alert('Course data not available. Please ensure the course is fully generated.');
      return;
    }

    setIsExporting(true);
    setExportType('ZIP');
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseData, config, courseId: course.id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = (config.title || course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.download = `${safeTitle}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download course ZIP');
      }
    } catch (error) {
      console.error('ZIP download error:', error);
      alert('Failed to download course ZIP');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setShowMenu(false);
    }
  };

  const handleEditCourse = () => {
    router.push(`/course/${course.id}/edit`);
    setShowMenu(false);
  };

  const handleViewCourse = () => {
    router.push(`/course/${course.id}`);
    setShowMenu(false);
  };

  const handlePreviewCourse = () => {
    setShowPreview(true);
    setShowMenu(false);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handlePreviewExport = async () => {
    const { courseData, config } = getFullCourseData();
    if (!courseData || !config) return;
    await handleDownloadZIP();
  };

  const fullCourse = getCourse(course.id);
  const courseData = fullCourse?.state.courseData || null;
  const courseConfig = fullCourse?.state.courseConfig || null;

  return (
    <>
      <div className="card-animation-layer" style={{ position: 'relative', zIndex: showTagEditor ? '1' : '1' }}>
        <article 
          className={`animated-card group relative ${
            isSelected ? 'ring-2 ring-accent1 ring-offset-2 bg-accent1/5' : ''
          } ${selectionMode ? 'cursor-pointer' : ''} ${showTagEditor ? 'pointer-events-none' : ''} ${
            isDragging ? 'opacity-50 scale-95' : ''
          }`}
          draggable={!isCreateNew && onMoveToFolder ? true : false}
          onDragStart={(e) => {
            if (!isCreateNew && onMoveToFolder) {
              setIsDragging(true);
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('courseId', course.id);
              e.dataTransfer.setData('text/plain', course.id);
            }
          }}
          onDragEnd={() => {
            setIsDragging(false);
          }}
          onClick={handleCardClick}
          style={{ 
            zIndex: showTagEditor ? '1' : undefined,
            cursor: !isCreateNew && onMoveToFolder ? 'grab' : undefined
          }}
          onMouseEnter={(e) => {
            // Increase z-index on hover to bring card to front, but not if tag editor is open
            if (!selectionMode && !showTagEditor) {
              const card = e.currentTarget as HTMLElement;
              card.style.zIndex = '100';
              // Also update parent layer
              const layer = card.closest('.card-animation-layer') as HTMLElement;
              if (layer) {
                layer.style.zIndex = '100';
              }
            }
          }}
          onMouseLeave={(e) => {
            // Reset z-index when not hovering
            if (!selectionMode && !showTagEditor) {
              const card = e.currentTarget as HTMLElement;
              card.style.zIndex = '1';
              // Also reset parent layer
              const layer = card.closest('.card-animation-layer') as HTMLElement;
              if (layer) {
                layer.style.zIndex = '1';
              }
            }
          }}
        >
          {/* Selection checkbox */}
          {selectionMode && onSelect && (
            <div 
              className="checkbox-container absolute top-2 left-2 z-[100] bg-bg1 rounded p-1 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  const checked = e.target.checked;
                  onSelect(course.id, checked);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-5 h-5 rounded border-2 border-border bg-bg1 text-accent1 focus:ring-accent1 focus:ring-2 cursor-pointer accent-accent1"
              />
            </div>
          )}
          
          <Link 
            href={`/course/${course.id}`} 
            className="block"
            onClick={(e) => {
              if (selectionMode) {
                e.preventDefault();
              }
            }}
          >
            {/* Image or pattern */}
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={course.title} 
                className="card-img"
                loading="lazy"
              />
            ) : (
              <div 
                className="w-full aspect-square rounded-lg mb-2 relative overflow-hidden bg-gradient-to-br from-accent1 to-accent2"
                style={patternStyle ? {
                  backgroundColor: patternStyle.backgroundColor,
                  opacity: patternStyle.opacity,
                  ...(patternStyle.background ? { background: patternStyle.background } : {}),
                  ...(patternStyle.backgroundImage ? { backgroundImage: patternStyle.backgroundImage } : {}),
                  ...(patternStyle.backgroundPosition ? { backgroundPosition: patternStyle.backgroundPosition } : {}),
                  ...(patternStyle.backgroundSize ? { backgroundSize: patternStyle.backgroundSize } : {}),
                  ...(patternStyle.backgroundRepeat ? { backgroundRepeat: patternStyle.backgroundRepeat } : {}),
                  ...(patternStyle.backgroundBlendMode ? { backgroundBlendMode: patternStyle.backgroundBlendMode as any } : {}),
                } : {}}
              />
            )}
            
            {/* Description/Title */}
            <p className="text-text-primary font-medium mb-2 line-clamp-2">
              {course.title}
            </p>
            
            {/* Category text - removed nested link to fix hydration error */}
            <span className="text-accent1 text-sm">
              {course.category || 'View course'}
            </span>
          </Link>

          {/* Options menu button */}
          {!selectionMode && !course.isFeatured && (
            <>
              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full bg-bg1/80 backdrop-blur-sm flex items-center justify-center hover:bg-bg2 z-20 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                aria-label="Course options menu"
                title="Course options"
                aria-expanded={showMenu}
              >
                <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown menu - positioned absolutely to stick with card */}
              {showMenu && (
                <div 
                  ref={menuRef}
                  className="absolute top-10 right-0 neu-card bg-bg1 z-[9999] min-w-[220px] p-2 shadow-xl max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    maxWidth: 'calc(100vw - 16px)',
                  }}
                >
                  {/* View/Edit Actions */}
                  <div className="mb-2 pb-2 border-b border-border">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewCourse();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                      aria-label="Open workspace"
                      title="Open workspace"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Open Workspace
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePreviewCourse();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                      aria-label="Preview course"
                      title="Preview course"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Preview Course
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditCourse();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                      aria-label="Edit course"
                      title="Edit course"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Course
                    </button>
                    {onSelect && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelect(course.id, !isSelected);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                        aria-label={isSelected ? "Deselect course" : "Select course"}
                        title={isSelected ? "Deselect course" : "Select course"}
                      >
                        {isSelected ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {isSelected ? 'Deselect' : 'Select'}
                      </button>
                    )}
                  </div>

                  {/* Export Actions */}
                  <div className="mb-2 pb-2 border-b border-border">
                    <div className="px-3 py-1 text-xs font-semibold text-text-tertiary uppercase">Export</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExportSCORM();
                      }}
                      disabled={isExporting && exportType === 'SCORM'}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Export to SCORM"
                      title="Export to SCORM"
                    >
                      {isExporting && exportType === 'SCORM' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Export to SCORM
                    </button>
                  </div>

                  {/* Download Actions */}
                  <div className="mb-2 pb-2 border-b border-border">
                    <div className="px-3 py-1 text-xs font-semibold text-text-tertiary uppercase">Download</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadZIP();
                      }}
                      disabled={isExporting && exportType === 'ZIP'}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Download ZIP"
                      title="Download ZIP"
                    >
                      {isExporting && exportType === 'ZIP' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      Download ZIP
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadHTML();
                      }}
                      disabled={isExporting && exportType === 'HTML'}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Download HTML course"
                      title="Download HTML course"
                    >
                      {isExporting && exportType === 'HTML' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      Download HTML Course
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadVideo();
                      }}
                      disabled={isExporting && exportType === 'Video'}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Download video course"
                      title="Download video course"
                    >
                      {isExporting && exportType === 'Video' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      Download Video Course
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadPodcast();
                      }}
                      disabled={isExporting && exportType === 'Podcast'}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Download podcast course"
                      title="Download podcast course"
                    >
                      {isExporting && exportType === 'Podcast' ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                      Download Podcast
                    </button>
                  </div>

                  {/* Tag Management */}
                  <div className="mb-2 pb-2 border-b border-border">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTagEditor(true);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Edit Tags
                      {course.tags && course.tags.length > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 text-xs bg-accent1/20 text-accent1 rounded">
                          {course.tags.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Folder Management */}
                  {onMoveToFolder && folders.length > 0 && (
                    <div className="mb-2 pb-2 border-b border-border">
                      <div className="px-3 py-1 text-xs font-semibold text-text-tertiary uppercase">Move to Folder</div>
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMoveToFolder(course.id, folder.id);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: folder.color }}
                          />
                          {folder.name}
                        </button>
                      ))}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMoveToFolder(course.id, null);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-text-primary rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove from folder
                      </button>
                    </div>
                  )}

                  {/* Delete Action */}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this course?')) {
                          onDelete(course.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-bg3 text-red-500 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </article>
      </div>

      {/* Course Preview Modal */}
      {showPreview && courseData && courseConfig && (
        <CoursePreview
          courseData={courseData}
          config={courseConfig}
          onClose={handleClosePreview}
          onExport={handlePreviewExport}
          courseId={course.id}
        />
      )}

      {/* Tag Editor Modal */}
      {showTagEditor && (
        <TagEditor
          course={course}
          allCourses={allCourses}
          isOpen={showTagEditor}
          onClose={() => setShowTagEditor(false)}
          onSave={(tags) => {
            updateCourseTags(course.id, tags);
          }}
        />
      )}
    </>
  );
}

