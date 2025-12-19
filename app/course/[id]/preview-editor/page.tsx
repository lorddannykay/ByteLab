'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { CourseData, CourseConfig } from '@/types/course';
import VisualHTMLEditor from '@/components/Editor/VisualHTMLEditor';
import LivePreviewPanel from '@/components/Editor/LivePreviewPanel';
import HTMLPreview from '@/components/Editor/HTMLPreview';

export default function PreviewEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourse, updateCourse } = useCourses();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseConfig, setCourseConfig] = useState<CourseConfig | null>(null);
  const [previewMode, setPreviewMode] = useState<'editor' | 'html' | 'live'>('editor');
  const [previewKey, setPreviewKey] = useState(0); // Force refresh key

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

  // Auto-save and refresh preview
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
      // Force preview refresh after save
      setPreviewKey(prev => prev + 1);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [courseData, courseConfig, courseId, loading, course]);

  // Refresh preview when course data changes
  useEffect(() => {
    if (previewMode !== 'editor' && courseData) {
      setPreviewKey(prev => prev + 1);
    }
  }, [courseData, courseConfig, previewMode]);

  const handleUpdateCourseData = (updated: CourseData) => {
    setCourseData(updated);
  };

  const handleUpdateConfig = (updated: CourseConfig) => {
    setCourseConfig(updated);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + P: Toggle preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        if (previewMode === 'editor') {
          setPreviewMode('live');
        } else {
          setPreviewMode('editor');
        }
      }
      // Ctrl/Cmd + R: Refresh preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'r' && previewMode !== 'editor') {
        e.preventDefault();
        setPreviewKey(prev => prev + 1);
      }
      // Ctrl/Cmd + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        updateCourse(courseId, {
          state: {
            ...course?.state,
            courseData,
            courseConfig,
          },
        });
        setPreviewKey(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [previewMode, courseId, course, courseData, courseConfig]);

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
          {/* Preview Mode Selector */}
          <div className="flex items-center gap-1 bg-bg2 rounded-lg p-1 border border-border">
            <button
              onClick={() => setPreviewMode('editor')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                previewMode === 'editor'
                  ? 'bg-accent1 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setPreviewMode('html')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                previewMode === 'html'
                  ? 'bg-accent1 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              HTML Preview
            </button>
            <button
              onClick={() => setPreviewMode('live')}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                previewMode === 'live'
                  ? 'bg-accent1 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Live Preview
            </button>
          </div>
          {previewMode !== 'editor' && (
            <button
              onClick={() => setPreviewKey(prev => prev + 1)}
              className="px-3 py-1.5 text-sm bg-bg2 border border-border rounded-lg hover:bg-bg3 transition-colors flex items-center gap-2"
              title="Refresh preview (Ctrl/Cmd + R)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
          <button
            onClick={() => {
              updateCourse(courseId, {
                state: {
                  ...course?.state,
                  courseData,
                  courseConfig,
                },
              });
              setPreviewKey(prev => prev + 1);
            }}
            className="px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {previewMode === 'editor' && (
          <div className="flex-1">
            <VisualHTMLEditor
              courseData={courseData}
              courseConfig={courseConfig}
              onUpdate={handleUpdateCourseData}
              onUpdateConfig={handleUpdateConfig}
            />
          </div>
        )}
        {previewMode === 'html' && courseData && courseConfig && (
          <div className="flex-1 overflow-hidden">
            <HTMLPreview
              courseData={courseData}
              config={courseConfig}
              key={previewKey}
            />
          </div>
        )}
        {previewMode === 'live' && courseData && courseConfig && (
          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1">
              <VisualHTMLEditor
                courseData={courseData}
                courseConfig={courseConfig}
                onUpdate={handleUpdateCourseData}
                onUpdateConfig={handleUpdateConfig}
              />
            </div>
            <LivePreviewPanel
              courseData={courseData}
              config={courseConfig}
              templateId={courseConfig.templateId as any}
              onClose={() => setPreviewMode('editor')}
              key={previewKey}
            />
          </div>
        )}
      </div>
    </div>
  );
}


