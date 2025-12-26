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
  enableContentValidation?: boolean; // Toggle content validation via web search
  enableAutoImages?: boolean; // Toggle automatic image fetching
  imageProvider?: 'pexels' | 'unsplash' | 'both'; // Image source preference
  useAdvancedPrompting?: boolean; // Enable advanced chain-of-thought prompting (30-40% more tokens, 3-5x better quality)
}

// Course Content Structure
export interface CourseData {
  course: {
    title: string;
    description: string;
    duration: string;
    stages: CourseStage[];
    generatedAt?: number;
    updatedAt?: number;
    templateId?: string;
  };
  videoScenes: VideoScene[];
  podcastDialogue: DialogueSegment[];
}

export interface CourseStage {
  id: number;
  title: string;
  objective: string;
  keyPoints?: string[]; // Key learning points for the stage
  estimatedDuration?: string; // Estimated time to complete
  content: StageContent;
  interactiveElements: InteractiveElement[];
  blocks?: InteractiveElement[]; // Unified blocks (sections + interactive)
  quizQuestions: QuizQuestion[];
  sideCard?: SideCardContent;
  subStages?: CourseStage[]; // Nested sub-stages
  parentStageId?: number; // ID of parent stage if this is a sub-stage
}

export interface StageContent {
  introduction: string;
  sections: ContentSection[];
  summary: string;
}

export interface ImageMetadata {
  url: string;
  thumbnailUrl: string;
  attribution: string;
  photographer: string;
  photographerUrl?: string;
  width: number;
  height: number;
  provider: 'pexels' | 'unsplash' | 'google' | 'duckduckgo' | 'giphy' | 'upload' | 'pexels-video';
  mediaType?: 'image' | 'gif' | 'video-loop';
  loop?: boolean; // For video loops
  autoplay?: boolean; // For video loops
}

export interface ContentSection {
  heading: string;
  content: string;
  type?: 'text' | 'list' | 'code' | 'diagram';
  items?: string[];
  image?: ImageMetadata; // Optional image for the section
}

export interface InteractiveElement {
  id?: string;
  type: 'quiz' | 'matching' | 'code-demo' | 'expandable' | 'diagram' | 'video' | 'audio' | 'flashcard' | 'dragdrop' | 'code' | 'progress' | 'image' | 'canvas' | 'section';
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

