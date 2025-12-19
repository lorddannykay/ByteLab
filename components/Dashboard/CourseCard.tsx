'use client';

import Link from 'next/link';
import { CourseMetadata, CourseFolder } from '@/types/courseMetadata';
import { useState } from 'react';
import { 
  SwatchIcon, 
  BriefcaseIcon, 
  BeakerIcon, 
  ComputerDesktopIcon, 
  BookIcon, 
  GlobeAltIcon, 
  HeartIcon 
} from '@/components/Icons/AppleIcons';

interface CourseCardProps {
  course: CourseMetadata;
  isCreateNew?: boolean;
  onDelete?: (id: string) => void;
  onMoveToFolder?: (courseId: string, folderId: string | null) => void;
  folders?: CourseFolder[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  'Arts & Culture': SwatchIcon,
  'Business': BriefcaseIcon,
  'Science': BeakerIcon,
  'Technology': ComputerDesktopIcon,
  'Education': BookIcon,
  'Social Science': GlobeAltIcon,
  'Health': HeartIcon,
  'Default': BookIcon,
};

// Slack-inspired command icon (similar to UIverse)
const CommandIcon = () => (
  <svg
    viewBox="0 0 80 80"
    className="w-6 h-6"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="currentColor">
      <path d="M64,48L64,48h-8V32h8c8.836,0,16-7.164,16-16S72.836,0,64,0c-8.837,0-16,7.164-16,16v8H32v-8c0-8.836-7.164-16-16-16
        S0,7.164,0,16s7.164,16,16,16h8v16h-8l0,0l0,0C7.164,48,0,55.164,0,64s7.164,16,16,16c8.837,0,16-7.164,16-16l0,0v-8h16v7.98
        c0,0.008-0.001,0.014-0.001,0.02c0,8.836,7.164,16,16,16s16-7.164,16-16S72.836,48.002,64,48z M64,8c4.418,0,8,3.582,8,8
        s-3.582,8-8,8h-8v-8C56,11.582,59.582,8,64,8z M8,16c0-4.418,3.582-8,8-8s8,3.582,8,8v8h-8C11.582,24,8,20.417,8,16z M16,72
        c-4.418,0-8-3.582-8-8s3.582-8,8-8l0,0h8v8C24,68.418,20.418,72,16,72z M32,48V32h16v16H32z M64,72c-4.418,0-8-3.582-8-8l0,0v-8
        h7.999c4.418,0,8,3.582,8,8S68.418,72,64,72z" />
    </g>
  </svg>
);

export default function CourseCard({ course, isCreateNew, onDelete, onMoveToFolder, folders = [] }: CourseCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (isCreateNew) {
    return (
      <Link
        href="/course/new"
        className="neu-create-card group flex flex-col items-center justify-center p-8 cursor-pointer min-h-[200px]"
      >
        <div className="neu-float w-16 h-16 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-accent1 to-accent2 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent1 transition-colors">
          Create new course
        </h3>
        <p className="text-sm text-text-tertiary mt-1">
          Start building
        </p>
      </Link>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const IconComponent = categoryIcons[course.category || ''] || categoryIcons['Default'];

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('courseId', course.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`group relative neu-card p-6 min-h-[200px] flex flex-col ${
        isDragging ? 'opacity-50' : ''
      }`}
      draggable={!isCreateNew && onMoveToFolder !== undefined}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Link href={`/course/${course.id}`} className="block flex-1">
        {/* Header with icon and menu */}
        <div className="flex items-start justify-between mb-4">
          <div className="neu-button-content p-3 rounded-xl bg-bg2 border border-border w-14 h-14 flex items-center justify-center">
            <div className="text-text-tertiary group-hover:text-accent1 transition-colors duration-300 transform group-hover:-translate-y-1">
              <IconComponent className="w-6 h-6" />
            </div>
          </div>
          
          {/* Options menu button */}
          {!course.isFeatured && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 neu-icon-button w-9 h-9"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        {showMenu && (onDelete || onMoveToFolder) && (
          <div className="absolute top-16 right-4 neu-card bg-bg1 z-10 min-w-[180px] p-2 shadow-xl">
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

        {/* Title */}
        <h3 className="text-lg font-semibold mb-3 text-text-primary line-clamp-2 group-hover:text-accent1 transition-colors duration-300">
          {course.title}
        </h3>

        {/* Category badge */}
        {course.category && (
          <span className="neu-badge inline-block mb-3">
            {course.category}
          </span>
        )}
      </Link>

      {/* Footer stats */}
      <div className="flex items-center gap-3 text-sm text-text-secondary mt-auto pt-4 border-t border-border">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDate(course.lastModified)}
        </span>
        <span className="text-text-tertiary">•</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          {course.stageCount || 0} {course.stageCount === 1 ? 'stage' : 'stages'}
        </span>
        {course.sourceCount > 0 && (
          <>
            <span className="text-text-tertiary">•</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {course.sourceCount}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
