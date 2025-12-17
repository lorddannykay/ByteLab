'use client';

import Link from 'next/link';
import { CourseMetadata } from '@/types/courseMetadata';
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

export default function CourseCard({ course, isCreateNew, onDelete }: CourseCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (isCreateNew) {
    return (
      <Link
        href="/course/new"
        className="group bg-bg2 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center hover:border-accent1 hover:bg-bg3 transition-all cursor-pointer min-h-[200px]"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent1 to-accent2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <span className="text-3xl text-white">+</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">Create new course</h3>
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

  return (
    <div className="group relative glass glass-shadow rounded-lg p-6 hover:glass-strong transition-all">
      <Link href={`/course/${course.id}`} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-lg glass-button flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-text-primary" />
          </div>
          {!course.isFeatured && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-bg3 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          )}
        </div>

        {showMenu && onDelete && (
          <div className="absolute top-12 right-4 bg-bg1 border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this course?')) {
                  onDelete(course.id);
                }
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-bg3 text-red-500 rounded-lg"
            >
              Delete
            </button>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2 text-text-primary line-clamp-2">
          {course.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>{formatDate(course.lastModified)}</span>
          <span>•</span>
          <span>{course.stageCount || 0} {course.stageCount === 1 ? 'stage' : 'stages'}</span>
          {course.sourceCount > 0 && (
            <>
              <span>•</span>
              <span>{course.sourceCount} {course.sourceCount === 1 ? 'source' : 'sources'}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
