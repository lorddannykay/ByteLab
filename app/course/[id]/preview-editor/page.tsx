'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { CourseData, CourseConfig } from '@/types/course';
import VisualHTMLEditor from '@/components/Editor/VisualHTMLEditor';
import LivePreviewPanel from '@/components/Editor/LivePreviewPanel';

export default function PreviewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourse, updateCourse } = useCourses();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseConfig, setCourseConfig] = useState<CourseConfig | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load course data
  useEffect(() => {
    if (!courseId) return;

    const courseData = getCourse(courseId);
    if (courseData) {
      setCourse(courseData);
      setCourseData(courseData.state.courseData || null);
      setCourseConfig(courseData.state.courseConfig || null);
    } else {
      // Don't redirect immediately - might be loading
      console.warn('Course not found:', courseId);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Auto-save
  useEffect(() => {
    if (!courseData || !courseId || loading) return;

    const timeoutId = setTimeout(() => {
      updateCourse(courseId, {
        state: {
          ...course?.state,
          courseData,
          courseConfig,
        },
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [courseData, courseConfig, courseId]);

  const handleUpdateCourseData = (updated: CourseData) => {
    setCourseData(updated);
  };

  const handleUpdateConfig = (updated: CourseConfig) => {
    setCourseConfig(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!course || !courseData || !courseConfig) {
    return (
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Course not found or no content available.</p>
          <Link href="/" className="text-accent1 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg1">
      {/* Header */}
      <header className="liquid-glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/course/${courseId}`} className="text-accent1 hover:underline">
            ← Back to Workspace
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Visual Editor: {course.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm bg-bg2 border border-border rounded-lg font-semibold hover:bg-bg3 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={() => {
              updateCourse(courseId, {
                state: {
                  ...course?.state,
                  courseData,
                  courseConfig,
                },
              });
              alert('Changes saved!');
            }}
            className="px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </header>

      {/* Visual Editor */}
      <div className="flex-1 overflow-hidden flex">
        <div className={showPreview ? 'flex-1' : 'flex-1'}>
          <VisualHTMLEditor
            courseData={courseData}
            courseConfig={courseConfig}
            onUpdate={handleUpdateCourseData}
            onUpdateConfig={handleUpdateConfig}
          />
        </div>
        {showPreview && courseData && courseConfig && (
          <LivePreviewPanel
            courseData={courseData}
            config={courseConfig}
            templateId={courseConfig.templateId as any}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}


