'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { CourseMetadata, CourseFolder } from '@/types/courseMetadata';
import AnimatedCourseCard from './AnimatedCourseCard';
import FolderManager from './FolderManager';
import CourseCardSkeleton from './CourseCardSkeleton';
import SearchFilterBar, { FilterState, SortOption } from './SearchFilterBar';
import DashboardBulkActionsBar from './DashboardBulkActionsBar';
import { useCourses } from '@/contexts/CourseContext';

interface RecentCoursesProps {
  courses: CourseMetadata[];
  onDeleteCourse?: (id: string) => void;
}

export default function RecentCourses({ courses, onDeleteCourse }: RecentCoursesProps) {
  const { folders, createFolder, updateFolder, deleteFolder, moveCourseToFolder, getCoursesByFolder, getSubfolders, isLoading, deleteCourse: deleteCourseFromContext } = useCourses();
  const [viewMode, setViewMode] = useState<'list' | 'folder'>('list');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  
  // Expose moveCourseToFolder globally for drag and drop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).dragCourseToFolder = (courseId: string, folderId: string) => {
        moveCourseToFolder(courseId, folderId);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).dragCourseToFolder;
      }
    };
  }, [moveCourseToFolder]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: [],
    selectedCategory: null,
    selectedFolder: null,
    sortOption: 'date-modified-desc',
  });

  // Group courses by category for auto-categorization
  const coursesByCategory = courses.reduce((acc, course) => {
    const category = course.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(course);
    return acc;
  }, {} as Record<string, CourseMetadata[]>);

  const rootCourses = getCoursesByFolder(null);
  const selectedFolderCourses = selectedFolder ? getCoursesByFolder(selectedFolder) : [];
  const folderFilteredCourses = selectedFolder ? selectedFolderCourses : rootCourses;

  // Apply search and filters
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = [...folderFilteredCourses];

    // Apply search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          (course.description || '').toLowerCase().includes(query)
      );
    }

    // Apply tag filter (course must have ALL selected tags)
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter((course) => {
        const courseTags = course.tags || [];
        return filters.selectedTags.every((tag) => courseTags.includes(tag));
      });
    }

    // Apply category filter
    if (filters.selectedCategory) {
      filtered = filtered.filter((course) => course.category === filters.selectedCategory);
    }

    // Note: Folder filter from search bar is handled separately from sidebar folder selection
    // If search bar folder is selected, it overrides sidebar selection
    if (filters.selectedFolder) {
      filtered = filtered.filter((course) => course.folderId === filters.selectedFolder);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortOption) {
        case 'date-created-desc':
          return b.createdAt - a.createdAt;
        case 'date-created-asc':
          return a.createdAt - b.createdAt;
        case 'date-modified-desc':
          return b.lastModified - a.lastModified;
        case 'date-modified-asc':
          return a.lastModified - b.lastModified;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'stages-desc':
          return (b.stageCount || 0) - (a.stageCount || 0);
        case 'stages-asc':
          return (a.stageCount || 0) - (b.stageCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [folderFilteredCourses, filters]);

  const displayedCourses = filteredAndSortedCourses;

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

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
  };

  const handleSelectCourse = useCallback((courseId: string, selected: boolean) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(courseId);
      } else {
        next.delete(courseId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCourses((prev) => {
      if (prev.size === displayedCourses.length && displayedCourses.length > 0) {
        // Deselect all
        return new Set();
      } else {
        // Select all displayed courses
        return new Set(displayedCourses.map(c => c.id));
      }
    });
  }, [displayedCourses]);

  const handleBulkDelete = useCallback(() => {
    const count = selectedCourses.size;
    if (count === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${count} ${count === 1 ? 'course' : 'courses'}? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    // Delete each selected course
    selectedCourses.forEach((courseId) => {
      if (onDeleteCourse) {
        onDeleteCourse(courseId);
      } else if (deleteCourseFromContext) {
        deleteCourseFromContext(courseId);
      }
    });

    // Clear selection after deletion
    setSelectedCourses(new Set());
  }, [selectedCourses, onDeleteCourse, deleteCourseFromContext]);

  const handleBulkMoveToFolder = useCallback((folderId: string | null) => {
    selectedCourses.forEach((courseId) => {
      moveCourseToFolder(courseId, folderId);
    });
    // Optionally clear selection after moving
    // setSelectedCourses(new Set());
  }, [selectedCourses, moveCourseToFolder]);

  const handleClearSelection = useCallback(() => {
    setSelectedCourses(new Set());
  }, []);

  return (
    <div className="flex gap-6">
      {/* Sidebar with folders and categories */}
      <div className="w-64 flex-shrink-0">
        <FolderManager
          folders={folders}
          onCreateFolder={createFolder}
          onUpdateFolder={updateFolder}
          onDeleteFolder={deleteFolder}
          getSubfolders={getSubfolders}
        />

        {/* Auto-categorized sections */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Categories</h3>
          <div className="space-y-2">
            {Object.keys(coursesByCategory).map((category) => (
              <button
                key={category}
                onClick={() => handleFolderSelect(null)}
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
                        handleFolderSelect(selectedFolder === folder.id ? null : folder.id);
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
        <SearchFilterBar
          courses={courses}
          folders={folders}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <h2 className="neu-section-title">
              {selectedFolder
                ? folders.find((f) => f.id === selectedFolder)?.name || 'Courses'
                : 'Recent Courses'}
            </h2>
            {selectedCourses.size > 0 && (
              <span className="text-sm text-text-secondary">
                ({selectedCourses.size} selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-accent1 text-white'
                  : 'bg-bg2 text-text-primary hover:bg-bg3'
              }`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </button>
            <button
              onClick={() => setViewMode('folder')}
              className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'folder'
                  ? 'bg-accent1 text-white'
                  : 'bg-bg2 text-text-primary hover:bg-bg3'
              }`}
              title="Folder view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Folders
            </button>
          </div>
          {displayedCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAll();
                }}
                className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 bg-bg2 text-text-primary hover:bg-bg3 border border-border"
                aria-label={selectedCourses.size === displayedCourses.length && displayedCourses.length > 0 ? "Deselect all" : "Select all"}
                title={selectedCourses.size === displayedCourses.length && displayedCourses.length > 0 ? "Deselect all" : "Select all"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {selectedCourses.size === displayedCourses.length && displayedCourses.length > 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {selectedCourses.size === displayedCourses.length && displayedCourses.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
        <main className="animated-cards-container">
          {isLoading ? (
            // Show skeleton loaders while courses are loading
            <>
              <CourseCardSkeleton />
              {[...Array(3)].map((_, i) => (
                <CourseCardSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          ) : viewMode === 'folder' ? (
            // Folder View
            <>
              <AnimatedCourseCard 
                isCreateNew 
                onDelete={onDeleteCourse} 
                course={{} as CourseMetadata} 
              />
              {/* Root level courses (no folder) */}
              {(() => {
                const rootCourses = displayedCourses.filter(c => !c.folderId);
                if (rootCourses.length > 0) {
                  return (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-text-secondary mb-3 px-2">Unorganized</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rootCourses.map((course) => (
                          <AnimatedCourseCard
                            key={course.id}
                            course={course}
                            onDelete={onDeleteCourse}
                            onMoveToFolder={moveCourseToFolder}
                            folders={folders}
                            allCourses={courses}
                            isSelected={selectedCourses.has(course.id)}
                            onSelect={handleSelectCourse}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {/* Folders with their courses */}
              {(getSubfolders ? getSubfolders(null) : folders.filter(f => !f.parentId)).map((folder) => {
                const folderCourses = displayedCourses.filter(c => c.folderId === folder.id);
                if (folderCourses.length === 0 && !getSubfolders?.(folder.id)?.length) return null;
                
                return (
                  <div key={folder.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: folder.color }}
                      />
                      <h3 className="text-sm font-semibold text-text-primary">{folder.name}</h3>
                      <span className="text-xs text-text-tertiary">({folderCourses.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {folderCourses.map((course) => (
                        <AnimatedCourseCard
                          key={course.id}
                          course={course}
                          onDelete={onDeleteCourse}
                          onMoveToFolder={moveCourseToFolder}
                          folders={folders}
                          allCourses={courses}
                          isSelected={selectedCourses.has(course.id)}
                          onSelect={handleSelectCourse}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            // List View (default)
            <>
              <AnimatedCourseCard 
                isCreateNew 
                onDelete={onDeleteCourse} 
                course={{} as CourseMetadata} 
              />
              {displayedCourses.map((course) => (
                <AnimatedCourseCard
                  key={course.id}
                  course={course}
                  onDelete={onDeleteCourse}
                  onMoveToFolder={moveCourseToFolder}
                  folders={folders}
                  allCourses={courses}
                  isSelected={selectedCourses.has(course.id)}
                  onSelect={handleSelectCourse}
                />
              ))}
            </>
          )}
        </main>
      </div>

      {/* Bulk Actions Bar */}
      <DashboardBulkActionsBar
        selectedCount={selectedCourses.size}
        onDeleteAll={handleBulkDelete}
        onMoveToFolder={handleBulkMoveToFolder}
        onClearSelection={handleClearSelection}
        folders={folders}
      />
    </div>
  );
}
