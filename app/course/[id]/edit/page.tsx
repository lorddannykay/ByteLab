'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { CourseData, CourseConfig } from '@/types/course';
import EditorCanvas from '@/components/Editor/EditorCanvas';
import EditorToolbar from '@/components/Editor/EditorToolbar';
import EditorSidebar from '@/components/Editor/EditorSidebar';
import AIAssistPanel from '@/components/Editor/AIAssistPanel';
import StyleEditor from '@/components/Editor/StyleEditor';
import LivePreview from '@/components/Editor/LivePreview';

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourse, updateCourse } = useCourses();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseConfig, setCourseConfig] = useState<CourseConfig | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<CourseData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load course data
  useEffect(() => {
    if (!courseId) return;

    const courseData = getCourse(courseId);
    if (courseData) {
      setCourse(courseData);
      setCourseData(courseData.state.courseData || null);
      setCourseConfig(courseData.state.courseConfig || null);
      if (courseData.state.courseData?.course.stages.length > 0) {
        setSelectedStageId(courseData.state.courseData.course.stages[0].id);
      }
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [courseId]);

  // Initialize history
  useEffect(() => {
    if (courseData) {
      setHistory([JSON.parse(JSON.stringify(courseData))]);
      setHistoryIndex(0);
    }
  }, []);

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
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(updated)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCourseData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCourseData(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const handleSave = () => {
    if (courseData && courseId) {
      updateCourse(courseId, {
        state: {
          ...course?.state,
          courseData,
          courseConfig,
        },
      });
    }
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

  if (!course || !courseData) {
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

  const currentStage = courseData.course.stages.find(s => s.id === selectedStageId);

  return (
    <div className="h-screen flex flex-col bg-bg1">
      {/* Header */}
      <header className="liquid-glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/course/${courseId}`} className="text-accent1 hover:underline">
            ← Back to Workspace
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">Editing: {course.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-sm bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Save
          </button>
        </div>
      </header>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Stage Navigation */}
        <EditorSidebar
          stages={courseData.course.stages}
          selectedStageId={selectedStageId}
          onSelectStage={setSelectedStageId}
        />

        {/* Center - Editor Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorToolbar
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onToggleStyleEditor={() => setShowStyleEditor(!showStyleEditor)}
            showStyleEditor={showStyleEditor}
          />
          <div className="flex-1 overflow-y-auto p-6">
            <EditorCanvas
              courseData={courseData}
              courseConfig={courseConfig}
              selectedStageId={selectedStageId}
              onUpdate={handleUpdateCourseData}
              onUpdateConfig={setCourseConfig}
            />
          </div>
        </div>

        {/* Right Sidebar - AI Assistant */}
        <AIAssistPanel
          courseData={courseData}
          selectedStageId={selectedStageId}
          onUpdate={handleUpdateCourseData}
        />
      </div>

      {/* Style Editor Modal */}
      {showStyleEditor && courseConfig && (
        <StyleEditor
          config={courseConfig}
          onUpdate={setCourseConfig}
          onClose={() => setShowStyleEditor(false)}
        />
      )}

      {/* Live Preview Modal */}
      {showPreview && courseData && courseConfig && (
        <LivePreview
          courseData={courseData}
          config={courseConfig}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

