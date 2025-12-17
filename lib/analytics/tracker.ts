// Learner Analytics Tracker
// Tracks course progress, quiz scores, and time spent

export interface AnalyticsEvent {
  type: 'stage_view' | 'stage_complete' | 'quiz_submit' | 'course_complete';
  courseId: string;
  stageId?: number;
  timestamp: number;
  data?: {
    quizScore?: number;
    maxScore?: number;
    timeSpent?: number; // in seconds
  };
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  startedAt: number;
  lastActivity: number;
  completedAt?: number;
  stagesCompleted: number[];
  totalStages: number;
  quizScores: Array<{
    stageId: number;
    score: number;
    maxScore: number;
    timestamp: number;
  }>;
  timeSpent: Record<number, number>; // stageId -> seconds
  totalTimeSpent: number; // total seconds
  lastStageId?: number;
  lastStageViewTime?: number;
}

const STORAGE_KEY_PREFIX = 'bytelab_analytics_';

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;

  try {
    const analytics = getCourseAnalytics(event.courseId);
    
    switch (event.type) {
      case 'stage_view':
        // Track time spent on previous stage if any
        if (analytics.lastStageId && analytics.lastStageViewTime) {
          const timeSpent = Math.floor((Date.now() - analytics.lastStageViewTime) / 1000);
          analytics.timeSpent[analytics.lastStageId] = 
            (analytics.timeSpent[analytics.lastStageId] || 0) + timeSpent;
          analytics.totalTimeSpent += timeSpent;
        }
        analytics.lastStageId = event.stageId;
        analytics.lastStageViewTime = Date.now();
        break;

      case 'stage_complete':
        if (event.stageId && !analytics.stagesCompleted.includes(event.stageId)) {
          analytics.stagesCompleted.push(event.stageId);
        }
        if (analytics.lastStageViewTime && event.stageId) {
          const timeSpent = Math.floor((Date.now() - analytics.lastStageViewTime) / 1000);
          analytics.timeSpent[event.stageId] = 
            (analytics.timeSpent[event.stageId] || 0) + timeSpent;
          analytics.totalTimeSpent += timeSpent;
        }
        analytics.lastActivity = Date.now();
        break;

      case 'quiz_submit':
        if (event.stageId && event.data) {
          analytics.quizScores.push({
            stageId: event.stageId,
            score: event.data.quizScore || 0,
            maxScore: event.data.maxScore || 1,
            timestamp: Date.now(),
          });
        }
        analytics.lastActivity = Date.now();
        break;

      case 'course_complete':
        analytics.completedAt = Date.now();
        analytics.lastActivity = Date.now();
        // Final time tracking
        if (analytics.lastStageViewTime && analytics.lastStageId) {
          const timeSpent = Math.floor((Date.now() - analytics.lastStageViewTime) / 1000);
          analytics.timeSpent[analytics.lastStageId] = 
            (analytics.timeSpent[analytics.lastStageId] || 0) + timeSpent;
          analytics.totalTimeSpent += timeSpent;
        }
        break;
    }

    saveCourseAnalytics(event.courseId, analytics);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export function getCourseAnalytics(courseId: string): CourseAnalytics {
  if (typeof window === 'undefined') {
    return createEmptyAnalytics(courseId, '');
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${courseId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
  }

  return createEmptyAnalytics(courseId, '');
}

function createEmptyAnalytics(courseId: string, courseTitle: string): CourseAnalytics {
  return {
    courseId,
    courseTitle,
    startedAt: Date.now(),
    lastActivity: Date.now(),
    stagesCompleted: [],
    totalStages: 0,
    quizScores: [],
    timeSpent: {},
    totalTimeSpent: 0,
  };
}

function saveCourseAnalytics(courseId: string, analytics: CourseAnalytics): void {
  if (typeof window === 'undefined') return;

  try {
    const key = `${STORAGE_KEY_PREFIX}${courseId}`;
    localStorage.setItem(key, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error saving analytics:', error);
  }
}

export function initializeCourseAnalytics(courseId: string, courseTitle: string, totalStages: number): void {
  const analytics = getCourseAnalytics(courseId);
  if (analytics.startedAt === 0) {
    analytics.courseTitle = courseTitle;
    analytics.totalStages = totalStages;
    analytics.startedAt = Date.now();
    analytics.lastActivity = Date.now();
    saveCourseAnalytics(courseId, analytics);
  }
}

export function getAllAnalytics(): CourseAnalytics[] {
  if (typeof window === 'undefined') return [];

  const analytics: CourseAnalytics[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          analytics.push(JSON.parse(stored));
        }
      }
    }
  } catch (error) {
    console.error('Error loading all analytics:', error);
  }

  return analytics.sort((a, b) => b.lastActivity - a.lastActivity);
}

