'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CourseCreationState, CourseCreationContextValue, ChatMessage, AIInsights, UploadedFile, ChatSession, MediaAsset } from '@/types/courseCreation';
import { CourseConfig, CourseData } from '@/types/course';

const STORAGE_KEY_PREFIX = 'bytelab_course_creation_state';
const GLOBAL_STORAGE_KEY = 'bytelab_course_creation_state'; // For backward compatibility
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Create initial state function to avoid Date.now() during SSR
const createInitialState = (): CourseCreationState => ({
  uploadedFiles: [],
  totalChunks: 0,
  chatHistory: [],
  chatSessions: [],
  currentChatSessionId: null,
  aiInsights: null,
  courseConfig: null,
  courseData: null,
  generationProgress: null,
  mediaAssets: [],
  createdAt: typeof window !== 'undefined' ? Date.now() : 0,
  lastUpdated: typeof window !== 'undefined' ? Date.now() : 0,
  currentStage: 1,
  contextSessionId: typeof window !== 'undefined' ? `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : '',
});

const CourseCreationContext = createContext<CourseCreationContextValue | undefined>(undefined);

export function CourseCreationProvider({ children }: { children: React.ReactNode }) {
  // Start with initial state to avoid hydration mismatch
  const [state, setState] = useState<CourseCreationState>(() => createInitialState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  // Get storage key for current course
  const getStorageKey = useCallback((courseId: string | null): string => {
    if (courseId) {
      return `${STORAGE_KEY_PREFIX}_${courseId}`;
    }
    return GLOBAL_STORAGE_KEY;
  }, []);

  // Define saveToStorage BEFORE useEffect that uses it
  const saveToStorage = useCallback(() => {
    // Only save on client and after hydration
    if (typeof window === 'undefined' || !isHydrated) return;

    const storageKey = getStorageKey(currentCourseId);

    try {
      const serialized = JSON.stringify(state);
      
      // Check size before saving
      if (serialized.length > MAX_STORAGE_SIZE) {
        console.warn('State too large for localStorage, clearing old data');
        // Keep only essential data
        const minimalState = {
          ...state,
          chatHistory: state.chatHistory.slice(-20), // Keep last 20 messages
          uploadedFiles: state.uploadedFiles.map(f => ({
            ...f,
            chunks: [], // Remove chunk data to save space
          })),
        };
        localStorage.setItem(storageKey, JSON.stringify(minimalState));
      } else {
        localStorage.setItem(storageKey, JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving course creation state:', error);
      // If quota exceeded, try minimal save
      try {
        const minimalState = {
          ...state,
          chatHistory: state.chatHistory.slice(-10),
          uploadedFiles: [],
        };
        localStorage.setItem(storageKey, JSON.stringify(minimalState));
      } catch (e) {
        console.error('Failed to save minimal state:', e);
      }
    }
  }, [state, isHydrated, currentCourseId, getStorageKey]);

  // Load from localStorage on mount (client-side only) - only load global state if no course ID
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Don't auto-load if we have a course ID - let the workspace page load it
    if (currentCourseId) {
      setIsHydrated(true);
      return;
    }

    try {
      const saved = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate and merge with initial state
        const loadedState = createInitialState();
        setState({
          ...loadedState,
          ...parsed,
          // Ensure arrays are arrays
          uploadedFiles: Array.isArray(parsed.uploadedFiles) ? parsed.uploadedFiles : [],
          chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
          mediaAssets: Array.isArray(parsed.mediaAssets) ? parsed.mediaAssets : [],
          // Ensure contextSessionId exists, generate if missing
          contextSessionId: parsed.contextSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          // Update timestamps on load
          lastUpdated: Date.now(),
        });
      } else {
        // Even if no saved state, update timestamps
        setState(prev => ({ ...prev, createdAt: Date.now(), lastUpdated: Date.now() }));
      }
    } catch (error) {
      console.error('Error loading course creation state:', error);
      // Keep initial state if loading fails, but update timestamps
      setState(prev => ({ ...prev, createdAt: Date.now(), lastUpdated: Date.now() }));
    } finally {
      // Mark as hydrated after attempting to load
      setIsHydrated(true);
    }
  }, [currentCourseId]);

  // Save to localStorage whenever state changes (debounced)
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [state, isHydrated, saveToStorage]);

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined' || !isHydrated) return;

    const storageKey = getStorageKey(currentCourseId);

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          ...createInitialState(),
          ...parsed,
          uploadedFiles: Array.isArray(parsed.uploadedFiles) ? parsed.uploadedFiles : [],
          chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
          mediaAssets: Array.isArray(parsed.mediaAssets) ? parsed.mediaAssets : [],
        });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }, [isHydrated, currentCourseId, getStorageKey]);

  // Load state for a specific course
  const loadStateForCourse = useCallback((courseId: string | null, courseState?: CourseCreationState) => {
    if (typeof window === 'undefined' || !isHydrated) return;

    // Update current course ID
    setCurrentCourseId(courseId);

    if (courseState) {
      // Load from provided course state (from CourseContext)
      setState({
        ...createInitialState(),
        ...courseState,
        uploadedFiles: Array.isArray(courseState.uploadedFiles) ? courseState.uploadedFiles : [],
        chatHistory: Array.isArray(courseState.chatHistory) ? courseState.chatHistory : [],
        mediaAssets: Array.isArray(courseState.mediaAssets) ? courseState.mediaAssets : [],
        lastUpdated: Date.now(),
      });
    } else if (courseId) {
      // Try to load from localStorage for this course
      const storageKey = getStorageKey(courseId);
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setState({
            ...createInitialState(),
            ...parsed,
            uploadedFiles: Array.isArray(parsed.uploadedFiles) ? parsed.uploadedFiles : [],
            chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
            mediaAssets: Array.isArray(parsed.mediaAssets) ? parsed.mediaAssets : [],
            lastUpdated: Date.now(),
          });
        } else {
          // No saved state for this course, start fresh
          const newState = createInitialState();
          newState.contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setState(newState);
        }
      } catch (error) {
        console.error('Error loading course state:', error);
        const newState = createInitialState();
        newState.contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setState(newState);
      }
    } else {
      // No course ID, reset to initial state
      const newState = createInitialState();
      newState.contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setState(newState);
    }
  }, [isHydrated, getStorageKey]);

  const updateState = useCallback((updates: Partial<CourseCreationState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      lastUpdated: Date.now(),
    }));
  }, []);

  const resetState = useCallback(() => {
    const newState = createInitialState();
    // Generate new session ID when resetting
    newState.contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(newState);
    if (typeof window !== 'undefined' && isHydrated) {
      const storageKey = getStorageKey(currentCourseId);
      localStorage.removeItem(storageKey);
    }
  }, [isHydrated, currentCourseId, getStorageKey]);

  const clearState = useCallback(() => {
    // Clear all context-related state but keep metadata
    const newState = createInitialState();
    // Generate new session ID
    newState.contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setState(newState);
    if (typeof window !== 'undefined' && isHydrated) {
      const storageKey = getStorageKey(currentCourseId);
      localStorage.removeItem(storageKey);
    }
    // Also clear vector store via API
    if (typeof window !== 'undefined') {
      fetch('/api/upload', { method: 'DELETE' }).catch(console.error);
    }
  }, [isHydrated, currentCourseId, getStorageKey]);

  const addUploadedFiles = useCallback((files: UploadedFile[]) => {
    setState((prev) => {
      const newFiles = [...prev.uploadedFiles, ...files];
      const totalChunks = newFiles.reduce((sum, f) => sum + (f.chunks?.length || 0), 0);
      return {
        ...prev,
        uploadedFiles: newFiles,
        totalChunks,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, message],
      lastUpdated: Date.now(),
    }));
  }, []);

  const extractAIInsights = useCallback(async (chatHistory: ChatMessage[]): Promise<AIInsights | null> => {
    if (chatHistory.length === 0) return null;

    // Extract insights from assistant messages
    const assistantMessages = chatHistory
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content)
      .join('\n');

    // Try to extract using AI if available, otherwise fall back to pattern matching
    try {
      const response = await fetch('/api/extract-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: assistantMessages }),
      });

      if (response.ok) {
        const aiExtracted = await response.json();
        if (aiExtracted.insights) {
          return { ...aiExtracted.insights, extractedFromChat: true };
        }
      }
    } catch (error) {
      console.log('AI extraction failed, using pattern matching:', error);
    }

    // Fallback to pattern matching
    const insights: AIInsights = {
      extractedFromChat: true,
    };

    const titleMatch = assistantMessages.match(/title[:\s]+["']?([^"'\n]+)["']?/i);
    if (titleMatch) insights.suggestedTitle = titleMatch[1].trim();

    const topicMatch = assistantMessages.match(/topic[:\s]+["']?([^"'\n]+)["']?/i);
    if (topicMatch) insights.suggestedTopic = topicMatch[1].trim();

    const descMatch = assistantMessages.match(/description[:\s]+["']?([^"'\n]{20,200})["']?/i);
    if (descMatch) insights.suggestedDescription = descMatch[1].trim();

    const objectivesMatch = assistantMessages.match(/objectives?[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is);
    if (objectivesMatch) {
      const objectivesText = objectivesMatch[1];
      insights.suggestedObjectives = objectivesText
        .split(/[•\-\d+\.]/)
        .map((o) => o.trim())
        .filter((o) => o.length > 10)
        .slice(0, 5);
    }

    const audienceMatch = assistantMessages.match(/audience[:\s]+["']?([^"'\n]+)["']?/i);
    if (audienceMatch) insights.suggestedTargetAudience = audienceMatch[1].trim();

    const stageMatch = assistantMessages.match(/(\d+)\s*stages?/i);
    if (stageMatch) insights.suggestedStageCount = parseInt(stageMatch[1]);

    const styleMatch = assistantMessages.match(/(formal|conversational|technical)\s*style/i);
    if (styleMatch) {
      insights.suggestedContentStyle = styleMatch[1] as 'formal' | 'conversational' | 'technical';
    }

    // Only return if we extracted at least one insight
    if (Object.keys(insights).length > 1) {
      return insights;
    }

    return null;
  }, []);

  const updateConfig = useCallback((config: Partial<CourseConfig>) => {
    setState((prev) => ({
      ...prev,
      courseConfig: { ...prev.courseConfig, ...config },
      lastUpdated: Date.now(),
    }));
  }, []);

  const setCourseData = useCallback((data: CourseData) => {
    setState((prev) => ({
      ...prev,
      courseData: data,
      lastUpdated: Date.now(),
    }));
  }, []);

  const setGenerationProgress = useCallback((progress: { stage: string; progress: number; status: string } | null) => {
    setState((prev) => ({
      ...prev,
      generationProgress: progress,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Chat session management
  const createNewChatSession = useCallback((fileNames: string[]): string => {
    const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const contextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const title = fileNames.length > 0 
      ? `Chat: ${fileNames.slice(0, 2).join(', ')}${fileNames.length > 2 ? '...' : ''}`
      : 'New Chat';
    
    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [{
        role: 'assistant',
        content: "Hello! I'm your AI course planning assistant. Upload files to get started, or tell me what course you'd like to create.",
        timestamp: Date.now(),
      }],
      fileNames,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      contextSessionId,
    };

    setState((prev) => ({
      ...prev,
      chatSessions: [...prev.chatSessions, newSession],
      currentChatSessionId: sessionId,
      chatHistory: newSession.messages,
      contextSessionId,
      lastUpdated: Date.now(),
    }));

    return sessionId;
  }, []);

  const switchChatSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const session = prev.chatSessions.find(s => s.id === sessionId);
      if (!session) return prev;

      return {
        ...prev,
        currentChatSessionId: sessionId,
        chatHistory: session.messages,
        contextSessionId: session.contextSessionId,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const deleteChatSession = useCallback((sessionId: string) => {
    setState((prev) => {
      const updatedSessions = prev.chatSessions.filter(s => s.id !== sessionId);
      const wasCurrent = prev.currentChatSessionId === sessionId;
      
      // If deleting current session, switch to most recent or create new
      let newCurrentId = prev.currentChatSessionId;
      let newChatHistory = prev.chatHistory;
      let newContextSessionId = prev.contextSessionId;

      if (wasCurrent) {
        if (updatedSessions.length > 0) {
          const mostRecent = updatedSessions.sort((a, b) => b.lastUpdated - a.lastUpdated)[0];
          newCurrentId = mostRecent.id;
          newChatHistory = mostRecent.messages;
          newContextSessionId = mostRecent.contextSessionId;
        } else {
          newCurrentId = null;
          newChatHistory = [];
          newContextSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      }

      return {
        ...prev,
        chatSessions: updatedSessions,
        currentChatSessionId: newCurrentId,
        chatHistory: newChatHistory,
        contextSessionId: newContextSessionId,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const getCurrentChatSession = useCallback((): ChatSession | null => {
    return state.chatSessions.find(s => s.id === state.currentChatSessionId) || null;
  }, [state.chatSessions, state.currentChatSessionId]);

  // Media asset management
  const addMediaAsset = useCallback((asset: MediaAsset) => {
    setState((prev) => ({
      ...prev,
      mediaAssets: [...prev.mediaAssets, asset],
      lastUpdated: Date.now(),
    }));
  }, []);

  const removeMediaAsset = useCallback((assetId: string) => {
    setState((prev) => ({
      ...prev,
      mediaAssets: prev.mediaAssets.filter(a => a.id !== assetId),
      lastUpdated: Date.now(),
    }));
  }, []);

  // Update addChatMessage to also update the current session
  const addChatMessageToSession = useCallback((message: ChatMessage) => {
    setState((prev) => {
      const updatedHistory = [...prev.chatHistory, message];
      
      // If no current session, create one first
      if (!prev.currentChatSessionId || prev.chatSessions.length === 0) {
        const sessionId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const contextSessionId = prev.contextSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fileNames = prev.uploadedFiles.map(f => f.name);
        const title = fileNames.length > 0 
          ? `Chat: ${fileNames.slice(0, 2).join(', ')}${fileNames.length > 2 ? '...' : ''}`
          : 'New Chat';
        
        const newSession: ChatSession = {
          id: sessionId,
          title,
          messages: updatedHistory,
          fileNames,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          contextSessionId,
        };

        return {
          ...prev,
          chatSessions: [...prev.chatSessions, newSession],
          currentChatSessionId: sessionId,
          chatHistory: updatedHistory,
          contextSessionId,
          lastUpdated: Date.now(),
        };
      }

      // Update existing session
      const updatedSessions = prev.chatSessions.map(session => {
        if (session.id === prev.currentChatSessionId) {
          return {
            ...session,
            messages: updatedHistory,
            lastUpdated: Date.now(),
          };
        }
        return session;
      });

      return {
        ...prev,
        chatHistory: updatedHistory,
        chatSessions: updatedSessions,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const value: CourseCreationContextValue = {
    state,
    updateState,
    resetState,
    clearState,
    saveToStorage,
    loadFromStorage,
    loadStateForCourse,
    addUploadedFiles,
    addChatMessage: addChatMessageToSession,
    extractAIInsights,
    updateConfig,
    setCourseData,
    setGenerationProgress,
    addMediaAsset,
    removeMediaAsset,
    createNewChatSession,
    switchChatSession,
    deleteChatSession,
    getCurrentChatSession,
  };

  // Prevent hydration mismatch by ensuring consistent initial render
  // On server, always use initial state. On client, load from storage after mount.
  return (
    <CourseCreationContext.Provider value={value}>
      {children}
    </CourseCreationContext.Provider>
  );
}

export function useCourseCreation() {
  const context = useContext(CourseCreationContext);
  if (context === undefined) {
    throw new Error('useCourseCreation must be used within a CourseCreationProvider');
  }
  return context;
}

