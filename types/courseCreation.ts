// Course Creation Context Types
import { CourseConfig, CourseData, Chunk } from './course';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string; // Auto-generated from first user message or files
  messages: ChatMessage[];
  fileNames: string[]; // Files associated with this session
  createdAt: number;
  lastUpdated: number;
  contextSessionId: string; // Links to the context session
}

export interface AIInsights {
  suggestedTitle?: string;
  suggestedTopic?: string;
  suggestedDescription?: string;
  suggestedObjectives?: string[];
  suggestedTargetAudience?: string;
  suggestedStageCount?: number;
  suggestedContentStyle?: 'formal' | 'conversational' | 'technical';
  extractedFromChat: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: number;
  chunks: Chunk[];
  content?: string; // Optional full content for text/url sources
}

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  imageData: string; // Base64 data URL for images
  jsonData?: string; // JSON data for canvas state (if from editor)
  thumbnailUrl?: string; // URL for external assets
  width: number;
  height: number;
  createdAt: number;
  attribution?: string; // For Pexels/Unsplash assets
}

export interface CourseCreationState {
  // Stage 1: Upload
  uploadedFiles: UploadedFile[];
  totalChunks: number;

  // Stage 2: AI Planning
  chatHistory: ChatMessage[]; // Current active chat (for backward compatibility)
  chatSessions: ChatSession[]; // All chat sessions
  currentChatSessionId: string | null; // ID of currently active session
  aiInsights: AIInsights | null;

  // Stage 3: Configure
  courseConfig: Partial<CourseConfig> | null;

  // Stage 4: Generate
  courseData: CourseData | null;
  generationProgress: {
    stage: string;
    progress: number;
    status: string;
  } | null;

  // Media Library
  mediaAssets: MediaAsset[];

  // Generation Status
  videoGenerationStatus?: {
    status: 'idle' | 'generating' | 'complete' | 'failed';
    progress: number;
    message?: string;
    error?: string;
  };
  audioGenerationStatus?: {
    status: 'idle' | 'generating' | 'complete' | 'failed';
    progress: number;
    message?: string;
    error?: string;
  };

  // Metadata
  createdAt: number;
  lastUpdated: number;
  currentStage: number;
  contextSessionId: string; // Unique ID for each context session
}

export interface CourseCreationContextValue {
  state: CourseCreationState;
  updateState: (updates: Partial<CourseCreationState>) => void;
  resetState: () => void;
  clearState: () => void; // Clear all context and start fresh session
  saveToStorage: () => void;
  loadFromStorage: () => void;
  loadStateForCourse: (courseId: string | null, courseState?: CourseCreationState) => void; // Load state for a specific course

  // Helper methods
  addUploadedFiles: (files: UploadedFile[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  extractAIInsights: (chatHistory: ChatMessage[]) => AIInsights | null;
  updateConfig: (config: Partial<CourseConfig>) => void;
  setCourseData: (data: CourseData) => void;
  setGenerationProgress: (progress: { stage: string; progress: number; status: string } | null) => void;

  // Media methods
  addMediaAsset: (asset: MediaAsset) => void;
  removeMediaAsset: (assetId: string) => void;

  // Chat session methods
  createNewChatSession: (fileNames: string[]) => string; // Returns session ID
  switchChatSession: (sessionId: string) => void;
  deleteChatSession: (sessionId: string) => void;
  getCurrentChatSession: () => ChatSession | null;
}

