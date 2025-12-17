'use client';

import { useState, useEffect } from 'react';
import { CourseAnalytics, getAllAnalytics } from '@/lib/analytics/tracker';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const allAnalytics = getAllAnalytics();
    setAnalytics(allAnalytics);
    if (allAnalytics.length > 0 && !selectedCourse) {
      setSelectedCourse(allAnalytics[0].courseId);
    }
  }, []);

  const selected = analytics.find(a => a.courseId === selectedCourse);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getCompletionPercentage = (analytics: CourseAnalytics): number => {
    if (analytics.totalStages === 0) return 0;
    return Math.round((analytics.stagesCompleted.length / analytics.totalStages) * 100);
  };

  const getAverageQuizScore = (analytics: CourseAnalytics): number => {
    if (analytics.quizScores.length === 0) return 0;
    const total = analytics.quizScores.reduce((sum, q) => sum + (q.score / q.maxScore) * 100, 0);
    return Math.round(total / analytics.quizScores.length);
  };

  return (
    <div className="min-h-screen bg-bg1 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Analytics Dashboard</h1>

        {analytics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No analytics data available yet.</p>
            <p className="text-sm text-text-tertiary mt-2">Analytics will appear here as learners complete courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course List */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Courses</h2>
              <div className="space-y-2">
                {analytics.map((course) => (
                  <button
                    key={course.courseId}
                    onClick={() => setSelectedCourse(course.courseId)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedCourse === course.courseId
                        ? 'bg-accent1/20 border-accent1'
                        : 'bg-bg2 border-border hover:bg-bg3'
                    }`}
                  >
                    <div className="font-semibold text-text-primary mb-1">{course.courseTitle}</div>
                    <div className="text-xs text-text-secondary">
                      {getCompletionPercentage(course)}% complete
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Course Details */}
            {selected && (
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-text-primary mb-4">{selected.courseTitle}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-bg2 border border-border rounded-lg p-4">
                    <div className="text-sm text-text-secondary mb-1">Completion</div>
                    <div className="text-2xl font-bold text-text-primary">
                      {getCompletionPercentage(selected)}%
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {selected.stagesCompleted.length} / {selected.totalStages} stages
                    </div>
                  </div>

                  <div className="bg-bg2 border border-border rounded-lg p-4">
                    <div className="text-sm text-text-secondary mb-1">Time Spent</div>
                    <div className="text-2xl font-bold text-text-primary">
                      {formatTime(selected.totalTimeSpent)}
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Started {new Date(selected.startedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-bg2 border border-border rounded-lg p-4">
                    <div className="text-sm text-text-secondary mb-1">Quiz Average</div>
                    <div className="text-2xl font-bold text-text-primary">
                      {getAverageQuizScore(selected)}%
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      {selected.quizScores.length} quizzes
                    </div>
                  </div>
                </div>

                {/* Stage Progress */}
                <div className="bg-bg2 border border-border rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-text-primary mb-3">Stage Progress</h3>
                  <div className="space-y-2">
                    {Array.from({ length: selected.totalStages }, (_, i) => i + 1).map((stageId) => {
                      const isCompleted = selected.stagesCompleted.includes(stageId);
                      const timeSpent = selected.timeSpent[stageId] || 0;
                      return (
                        <div key={stageId} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-bg3 text-text-secondary'
                          }`}>
                            {isCompleted ? '✓' : stageId}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-text-primary">Stage {stageId}</div>
                            {timeSpent > 0 && (
                              <div className="text-xs text-text-secondary">{formatTime(timeSpent)}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quiz Scores */}
                {selected.quizScores.length > 0 && (
                  <div className="bg-bg2 border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-text-primary mb-3">Quiz Scores</h3>
                    <div className="space-y-2">
                      {selected.quizScores.map((quiz, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="text-sm text-text-primary">Stage {quiz.stageId}</div>
                          <div className="text-sm font-semibold text-text-primary">
                            {Math.round((quiz.score / quiz.maxScore) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

