// TTS Configuration
export interface TTSConfig {
  provider?: 'edge' | 'elevenlabs' | 'openai';
  apiKey?: string; // Only needed for paid providers
  voices?: {
    video: string;
    podcastHost: string;
    podcastExpert: string;
  };
}

// Course Configuration
export interface CourseConfig {
  title: string;
  topic: string;
  description: string;
  objectives: string[];
  targetAudience: string;
  organizationalGoals: string;
  contentStyle: 'formal' | 'conversational' | 'technical';
  stageCount: number;
  estimatedDuration: string;
  accentColor1: string;
  accentColor2: string;
  voiceId: string;
  includeVideo: boolean;
  includePodcast: boolean;
  templateId?: string; // Design template ID (e.g., 'minimal', 'modern', 'magazine')
  tts?: TTSConfig; // TTS provider configuration
}

// Course Content Structure
export interface CourseData {
  course: {
    title: string;
    description: string;
    duration: string;
    stages: CourseStage[];
  };
  videoScenes: VideoScene[];
  podcastDialogue: DialogueSegment[];
}

export interface CourseStage {
  id: number;
  title: string;
  objective: string;
  content: StageContent;
  interactiveElements: InteractiveElement[];
  quizQuestions: QuizQuestion[];
  sideCard: SideCardContent;
}

export interface StageContent {
  introduction: string;
  sections: ContentSection[];
  summary: string;
}

export interface ContentSection {
  heading: string;
  content: string;
  type?: 'text' | 'list' | 'code' | 'diagram';
  items?: string[];
}

export interface InteractiveElement {
  type: 'quiz' | 'matching' | 'code-demo' | 'expandable' | 'diagram';
  data: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SideCardContent {
  title: string;
  content: string;
  tips?: string[];
}

export interface VideoScene {
  id: number;
  text: string;
  duration?: number;
  audioDataURL?: string; // Base64 data URL for Edge TTS audio
}

export interface DialogueSegment {
  speaker: 'host' | 'expert';
  text: string;
  audioDataURL?: string; // Base64 data URL for Edge TTS audio
}

// Vector Store Types
export interface Chunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: {
    source: string;
    page?: number;
    chunkIndex: number;
  };
}

// RAG Types
export interface RetrievalResult {
  text: string;
  score: number;
  metadata?: any;
}

