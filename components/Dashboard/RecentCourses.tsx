'use client';

import { useState } from 'react';
import { CourseMetadata, CourseFolder } from '@/types/courseMetadata';
import CourseCard from './CourseCard';
import FolderManager from './FolderManager';
import { useCourses } from '@/contexts/CourseContext';

interface RecentCoursesProps {
  courses: CourseMetadata[];
  onDeleteCourse?: (id: string) => void;
}

export default function RecentCourses({ courses, onDeleteCourse }: RecentCoursesProps) {
  const { folders, createFolder, updateFolder, deleteFolder, moveCourseToFolder, getCoursesByFolder } = useCourses();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Group courses by category for auto-categorization
  const coursesByCategory = courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(course);
    return acc;
  }, {} as Record<string, CourseMetadata[]>);

  const rootCourses = getCoursesByFolder(null);
  const selectedFolderCourses = selectedFolder ? getCoursesByFolder(selectedFolder) : [];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar with folders and categories */}
      <div className="w-64 flex-shrink-0">
        <FolderManager
          folders={folders}
          onCreateFolder={createFolder}
          onUpdateFolder={updateFolder}
          onDeleteFolder={deleteFolder}
        />

        {/* Auto-categorized sections */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Categories</h3>
          <div className="space-y-2">
            {Object.keys(coursesByCategory).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFolder(null)}
                className="w-full text-left px-3 py-2 text-sm bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors text-text-primary"
              >
                {category} ({coursesByCategory[category].length})
              </button>
            ))}
          </div>
        </div>

        {/* Manual folders */}
        {folders.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">My Folders</h3>
            <div className="space-y-1">
              {folders.map((folder) => {
                const folderCourses = getCoursesByFolder(folder.id);
                return (
                  <div key={folder.id}>
                    <button
                      onClick={() => {
                        toggleFolder(folder.id);
                        setSelectedFolder(selectedFolder === folder.id ? null : folder.id);
                      }}
                      className="w-full text-left px-3 py-2 text-sm bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="flex-1 text-text-primary">{folder.name}</span>
                      <span className="text-xs text-text-tertiary">({folderCourses.length})</span>
                      <svg
                        className={`w-4 h-4 text-text-tertiary transition-transform ${
                          expandedFolders.has(folder.id) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-10">
          <h2 className="neu-section-title">
            {selectedFolder
              ? folders.find((f) => f.id === selectedFolder)?.name || 'Courses'
              : 'Recent Courses'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <CourseCard isCreateNew onDelete={onDeleteCourse} course={{} as CourseMetadata} />
          {(selectedFolder ? selectedFolderCourses : rootCourses).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={onDeleteCourse}
              onMoveToFolder={moveCourseToFolder}
              folders={folders}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
