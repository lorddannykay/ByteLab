'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, CourseMetadata } from '@/types/courseMetadata';
import { CourseCreationState } from '@/types/courseCreation';

const COURSES_STORAGE_KEY = 'bytelab_courses';
const MAX_COURSES = 100;

interface CourseContextValue {
  courses: CourseMetadata[];
  featuredCourses: CourseMetadata[];
  recentCourses: CourseMetadata[];
  createCourse: (title: string, state: CourseCreationState, metadata?: Partial<CourseMetadata>) => string;
  updateCourse: (id: string, updates: Partial<CourseMetadata> | { state: CourseCreationState }) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | null;
  getCourseState: (id: string) => CourseCreationState | null;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<CourseMetadata[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load courses from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(COURSES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCourses(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setMounted(true);
    }
  }, []);

  // Save courses to localStorage
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      // Only save metadata, not full state
      const metadata = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        icon: course.icon,
        createdAt: course.createdAt,
        lastModified: course.lastModified,
        sourceCount: course.sourceCount,
        stageCount: course.stageCount,
        isFeatured: course.isFeatured,
      }));
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving courses:', error);
    }
  }, [courses, mounted]);

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
      createdAt: now,
      lastModified: now,
      sourceCount: state.uploadedFiles.length,
      stageCount: state.courseData?.course.stages.length,
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

    return id;
  }, []);

  const updateCourse = useCallback((
    id: string,
    updates: Partial<CourseMetadata> | { state: CourseCreationState }
  ) => {
    setCourses((prev) => {
      const course = prev.find(c => c.id === id);
      if (!course) return prev;

      const updated: CourseMetadata = {
        ...course,
        ...('state' in updates ? {} : updates),
        lastModified: Date.now(),
        ...('state' in updates && 'state' in updates ? {
          sourceCount: updates.state.uploadedFiles.length,
          stageCount: updates.state.courseData?.course.stages.length,
        } : {}),
      };

      // If updating state, save it separately
      if ('state' in updates) {
        try {
          const courseStateKey = `${COURSES_STORAGE_KEY}_state_${id}`;
          localStorage.setItem(courseStateKey, JSON.stringify(updates.state));
        } catch (error) {
          console.error('Error saving course state:', error);
        }
      }

      return prev.map(c => c.id === id ? updated : c);
    });
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

  const featuredCourses = courses.filter(c => c.isFeatured).slice(0, 10);
  const recentCourses = courses
    .filter(c => !c.isFeatured)
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 20);

  const value: CourseContextValue = {
    courses,
    featuredCourses,
    recentCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    getCourseState,
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
