'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, CourseMetadata, CourseFolder } from '@/types/courseMetadata';
import { CourseCreationState } from '@/types/courseCreation';
import { generateCourseTags } from '@/lib/tagging/autoTagGenerator';

const COURSES_STORAGE_KEY = 'bytelab_courses';
const FOLDERS_STORAGE_KEY = 'bytelab_folders';
const MAX_COURSES = 100;

interface CourseContextValue {
  courses: CourseMetadata[];
  featuredCourses: CourseMetadata[];
  recentCourses: CourseMetadata[];
  folders: CourseFolder[];
  isLoading: boolean; // Loading state from localStorage
  createCourse: (title: string, state: CourseCreationState, metadata?: Partial<CourseMetadata>) => string;
  updateCourse: (id: string, updates: Partial<CourseMetadata> | { state: CourseCreationState }) => void;
  updateCourseTags: (id: string, tags: string[]) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | null;
  getCourseState: (id: string) => CourseCreationState | null;
  // Folder management
  createFolder: (name: string, color?: string, parentId?: string | null) => string;
  updateFolder: (id: string, updates: Partial<CourseFolder>) => void;
  deleteFolder: (id: string) => void;
  moveCourseToFolder: (courseId: string, folderId: string | null) => void;
  getCoursesByFolder: (folderId: string | null) => CourseMetadata[];
  getSubfolders: (parentId: string | null) => CourseFolder[];
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<CourseMetadata[]>([]);
  const [folders, setFolders] = useState<CourseFolder[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load courses and folders from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses);
        if (Array.isArray(parsed)) {
          setCourses(parsed);
        }
      }

      const savedFolders = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (savedFolders) {
        const parsed = JSON.parse(savedFolders);
        if (Array.isArray(parsed)) {
          setFolders(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading courses/folders:', error);
    } finally {
      setMounted(true);
    }
  }, []);

  // Save courses and folders to localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      // Only save metadata, not full state
      const metadata = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        tags: course.tags,
        thumbnail: course.thumbnail,
        icon: course.icon,
        createdAt: course.createdAt,
        lastModified: course.lastModified,
        sourceCount: course.sourceCount,
        stageCount: course.stageCount,
        isFeatured: course.isFeatured,
        folderId: course.folderId,
      }));
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(metadata));
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving courses/folders:', error);
    }
  }, [courses, folders, mounted]);

  const createCourse = useCallback((
    title: string,
    state: CourseCreationState,
    metadata?: Partial<CourseMetadata>
  ): string => {
    const id = `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newCourse: CourseMetadata = {
      id,
      title,
      description: metadata?.description,
      category: metadata?.category,
      thumbnail: metadata?.thumbnail,
      icon: metadata?.icon,
      tags: metadata?.tags, // Use provided tags if available
      createdAt: now,
      lastModified: now,
      sourceCount: state.uploadedFiles.length,
      stageCount: state.courseData?.course.stages?.length || 0,
      isFeatured: metadata?.isFeatured || false,
    };

    // Save full course state to separate storage
    try {
      const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
      localStorage.setItem(courseStateKey, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving course state:', error);
    }

    setCourses((prev) => {
      const updated = [newCourse, ...prev];
      // Limit to MAX_COURSES
      return updated.slice(0, MAX_COURSES);
    });

    // Generate tags asynchronously if not provided
    if (!metadata?.tags) {
      generateCourseTags(
        {
          title,
          description: metadata?.description,
          topic: state.courseConfig?.topic,
          stageTitles: state.courseData?.course.stages?.map(s => s.title) || [],
          stageObjectives: state.courseData?.course.stages?.map(s => s.objective || '') || [],
        },
        state
      )
        .then((tags) => {
          if (tags.length > 0) {
            setCourses((prev) =>
              prev.map((course) =>
                course.id === id ? { ...course, tags } : course
              )
            );
          }
        })
        .catch((error) => {
          console.error('Error generating tags:', error);
        });
    }

    return id;
  }, []);

  const updateCourse = useCallback((
    id: string,
    updates: Partial<CourseMetadata> | { state: CourseCreationState }
  ) => {
    setCourses((prev) => {
      const course = prev.find(c => c.id === id);
      if (!course) return prev;

      const titleChanged = 'title' in updates && updates.title !== course.title;
      const descriptionChanged = 'description' in updates && updates.description !== course.description;
      const shouldRegenerateTags = (titleChanged || descriptionChanged) && !('tags' in updates);

      const updated: CourseMetadata = {
        ...course,
        ...('state' in updates ? {} : updates),
        lastModified: Date.now(),
        ...('state' in updates && 'state' in updates ? {
          sourceCount: updates.state.uploadedFiles.length,
          stageCount: updates.state.courseData?.course.stages?.length || 0,
        } : {}),
      };

      // If updating state, save it separately
      let courseState: CourseCreationState | null = null;
      if ('state' in updates) {
        courseState = updates.state;
        try {
          const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
          localStorage.setItem(courseStateKey, JSON.stringify(updates.state));
        } catch (error) {
          console.error('Error saving course state:', error);
        }
      } else {
        // Try to load existing state for tag generation
        try {
          const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
          const stateJson = localStorage.getItem(courseStateKey);
          if (stateJson) {
            courseState = JSON.parse(stateJson) as CourseCreationState;
          }
        } catch (error) {
          // Ignore errors loading state
        }
      }

      // Regenerate tags if title or description changed
      if (shouldRegenerateTags && courseState) {
        generateCourseTags(
          {
            title: updated.title,
            description: updated.description,
            topic: courseState.courseConfig?.topic,
            stageTitles: courseState.courseData?.course.stages?.map(s => s.title) || [],
            stageObjectives: courseState.courseData?.course.stages?.map(s => s.objective || '') || [],
          },
          courseState
        )
          .then((tags) => {
            if (tags.length > 0) {
              setCourses((prev) =>
                prev.map((c) =>
                  c.id === id ? { ...c, tags } : c
                )
              );
            }
          })
          .catch((error) => {
            console.error('Error regenerating tags:', error);
          });
      }

      return prev.map(c => c.id === id ? updated : c);
    });
  }, []);

  const updateCourseTags = useCallback((id: string, tags: string[]) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? { ...course, tags, lastModified: Date.now() }
          : course
      )
    );
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter(c => c.id !== id));
    // Also delete state
    try {
      const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
      localStorage.removeItem(courseStateKey);
    } catch (error) {
      console.error('Error deleting course state:', error);
    }
  }, []);

  const getCourse = useCallback((id: string): Course | null => {
    const metadata = courses.find(c => c.id === id);
    if (!metadata) return null;

    try {
      const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
      const stateJson = localStorage.getItem(courseStateKey);
      if (!stateJson) return null;

      const state = JSON.parse(stateJson) as CourseCreationState;
      return {
        ...metadata,
        state,
      };
    } catch (error) {
      console.error('Error loading course state:', error);
      return null;
    }
  }, [courses]);

  const getCourseState = useCallback((id: string): CourseCreationState | null => {
    try {
      const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
      const stateJson = localStorage.getItem(courseStateKey);
      if (!stateJson) return null;
      return JSON.parse(stateJson) as CourseCreationState;
    } catch (error) {
      console.error('Error loading course state:', error);
      return null;
    }
  }, []);

  const createFolder = useCallback((name: string, color?: string, parentId?: string | null): string => {
    const id = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newFolder: CourseFolder = {
      id,
      name,
      color: color || '#6366f1',
      parentId: parentId ?? null,
      createdAt: now,
      lastModified: now,
    };

    setFolders((prev) => [...prev, newFolder]);
    return id;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<CourseFolder>) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id
          ? { ...folder, ...updates, lastModified: Date.now() }
          : folder
      )
    );
  }, []);

  const deleteFolder = useCallback((id: string) => {
    // Move subfolders to parent folder (or root if no parent)
    setFolders((prev) => {
      const folderToDelete = prev.find(f => f.id === id);
      const parentId = folderToDelete?.parentId ?? null;
      
      return prev.map((folder) => {
        if (folder.parentId === id) {
          // Move subfolder to parent
          return { ...folder, parentId: parentId ?? null, lastModified: Date.now() };
        }
        return folder;
      }).filter((f) => f.id !== id);
    });
    
    // Move courses in this folder to parent folder (or root if no parent)
    setCourses((prev) =>
      prev.map((course) => {
        if (course.folderId === id) {
          const folderToDelete = folders.find(f => f.id === id);
          const parentId = folderToDelete?.parentId ?? null;
          return { ...course, folderId: parentId ?? undefined, lastModified: Date.now() };
        }
        return course;
      })
    );
  }, [folders]);

  const moveCourseToFolder = useCallback((courseId: string, folderId: string | null) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, folderId: folderId || undefined, lastModified: Date.now() }
          : course
      )
    );
  }, []);

  const getCoursesByFolder = useCallback(
    (folderId: string | null): CourseMetadata[] => {
      if (folderId === null) {
        return courses.filter((c) => !c.folderId && !c.isFeatured);
      }
      return courses.filter((c) => c.folderId === folderId);
    },
    [courses]
  );

  const getSubfolders = useCallback(
    (parentId: string | null): CourseFolder[] => {
      return folders.filter((f) => f.parentId === parentId);
    },
    [folders]
  );

  const featuredCourses = courses.filter(c => c.isFeatured).slice(0, 10);
  const recentCourses = courses
    .filter(c => !c.isFeatured)
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 20);

  const value: CourseContextValue = {
    courses,
    featuredCourses,
    recentCourses,
    folders,
    isLoading: !mounted,
    createCourse,
    updateCourse,
    updateCourseTags,
    deleteCourse,
    getCourse,
    getCourseState,
    createFolder,
    updateFolder,
    deleteFolder,
    moveCourseToFolder,
    getCoursesByFolder,
    getSubfolders,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
