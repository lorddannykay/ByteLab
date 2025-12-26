'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourses } from '@/contexts/CourseContext';
import { useCourseCreation } from '@/contexts/CourseCreationContext';
import SourcesPanel from '@/components/Workspace/SourcesPanel';
import ChatPanel from '@/components/Workspace/ChatPanel';
import StudioPanel from '@/components/Workspace/StudioPanel';
import ResizablePanel from '@/components/Workspace/ResizablePanel';
import WorkflowProgress from '@/components/Workspace/WorkflowProgress';
import ConfigExtractionModal from '@/components/Workspace/ConfigExtractionModal';
import OutlineReviewModal from '@/components/Workspace/OutlineReviewModal';
import GenerationProgress from '@/components/Workspace/GenerationProgress';
import CoursePreview from '@/components/Workspace/CoursePreview';
import AddSourcesModal from '@/components/Workspace/AddSourcesModal';
import UploadProgressLoader from '@/components/Workspace/UploadProgressLoader';
import { ChatMessage, UploadedFile } from '@/types/courseCreation';
import { CourseConfig, CourseData } from '@/types/course';

export default function CourseWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { getCourse, updateCourse, deleteCourse } = useCourses();
  const { state, updateState, addChatMessage, addUploadedFiles, loadStateForCourse } = useCourseCreation();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sourcesCollapsed, setSourcesCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [studioCollapsed, setStudioCollapsed] = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [showAddSourcesModal, setShowAddSourcesModal] = useState(false);
  const [showUploadLoader, setShowUploadLoader] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [studioOutputs, setStudioOutputs] = useState<Record<string, any>>({});
  const [contentSummary, setContentSummary] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  // Generation state
  const [generating, setGenerating] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<{
    status: 'idle' | 'extracting' | 'outline' | 'generating' | 'complete';
    progress: number;
    currentStage?: number;
    totalStages?: number;
    message?: string;
  }>({ status: 'idle', progress: 0 });

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [extractedConfig, setExtractedConfig] = useState<{ config: Partial<CourseConfig>; confidence: Record<string, number> } | null>(null);
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<CourseData['course'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoursePreview, setShowCoursePreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load course data
  useEffect(() => {
    if (!courseId) return;

    const courseData = getCourse(courseId);
    if (courseData) {
      setCourse(courseData);

      // For new courses (no uploaded files), start with welcome message
      const isNewCourse = !courseData.state.uploadedFiles || courseData.state.uploadedFiles.length === 0;
      let stateToLoad = { ...courseData.state };

      if (isNewCourse) {
        // Add welcome message if chat is empty
        const hasWelcome = stateToLoad.chatHistory?.some(
          msg => msg.content.includes('Welcome to ByteLab') || msg.content.includes('👋')
        );

        if (!hasWelcome && (!stateToLoad.chatHistory || stateToLoad.chatHistory.length === 0)) {
          const welcomeMessage: ChatMessage = {
            role: 'assistant',
            content: '👋 Welcome to ByteLab! I\'m here to help you create an amazing microlearning course.\n\nTo get started, click "+ Add Source" to upload PDFs, text files, URLs, or paste text directly. I\'ll automatically analyze your content and provide insights.\n\nOr just tell me what topic you\'d like to create a course about and I\'ll help you plan it out!\n\nWhat would you like to teach today? 🚀',
            timestamp: Date.now(),
          };

          stateToLoad = {
            ...stateToLoad,
            chatHistory: [welcomeMessage],
          };
        }
      }

      // Load course state into context using the new course-scoped method
      // This ensures state is isolated per course
      loadStateForCourse(courseId, stateToLoad);

      // Load course data into outputs if it exists and has actual content
      // Only load if the course data matches the current context (has sources)
      // Clear outputs if no sources or if course data doesn't match current context
      const hasSources = courseData.state.uploadedFiles && courseData.state.uploadedFiles.length > 0;

      // Clear any stale notifications/toasts on load
      setToast(null);

      // Check if course data matches current context
      if (hasSources && courseData.state.courseData && courseData.state.courseData.course?.stages?.length > 0) {
        // Verify course data is recent (within last 24 hours) or matches current sources
        const courseDataAge = Date.now() - (courseData.lastModified || 0);
        const isRecentCourse = courseDataAge < 24 * 60 * 60 * 1000; // 24 hours

        // Check if course data has content (not just outline)
        const hasContent = courseData.state.courseData.course.stages[0]?.content;

        // Only load if course has content AND is recent OR matches current sources
        if (hasContent && (isRecentCourse || hasSources)) {
          setStudioOutputs({
            course: {
              type: 'course',
              course: courseData.state.courseData.course,
              config: courseData.state.courseConfig,
              generatedAt: courseData.lastModified,
            },
          });
        } else {
          // Has outline but no content, or stale data - clear to allow regeneration
          setStudioOutputs({});
          // Clear stale course data if it's old or doesn't match
          if (!isRecentCourse || !hasSources) {
            updateState({ courseData: null, courseConfig: null });
          }
        }
      } else {
        // Clear outputs for new courses or courses without sources
        setStudioOutputs({});
        // Clear any stale course data
        if (courseData.state.courseData && !hasSources) {
          updateState({ courseData: null, courseConfig: null });
        }
      }

      // Load content summary if available - pass source count
      const sourceCount = courseData.state.uploadedFiles?.length || 0;
      loadContentSummary(sourceCount);

      // If there are uploaded files but no analysis in chat, analyze them
      if (!isNewCourse && courseData.state.uploadedFiles.length > 0) {
        // Check if analysis already exists in chat
        const hasAnalysis = stateToLoad.chatHistory.some(
          msg => msg.role === 'assistant' &&
            (msg.content.includes('Content Overview') || msg.content.includes('Course Planning') ||
              msg.content.includes('analyzed your uploaded content'))
        );

        if (!hasAnalysis) {
          analyzeAndAddToChat(courseData.state.uploadedFiles.map(f => f.name));
        }
      }
    } else {
      // Course not found immediately - wait a bit for async course loading, then check again
      setTimeout(() => {
        const retryCourse = getCourse(courseId);
        if (!retryCourse) {
          // Only redirect if still not found after retry
          router.push('/');
        } else {
          // Course found on retry, load it
          setCourse(retryCourse);
          
          // Load state similar to the main loading logic
          const isNewCourse = !retryCourse.state.uploadedFiles || retryCourse.state.uploadedFiles.length === 0;
          let stateToLoad = { ...retryCourse.state };

          if (isNewCourse) {
            const hasWelcome = stateToLoad.chatHistory?.some(
              msg => msg.content.includes('Welcome to ByteLab') || msg.content.includes('👋')
            );

            if (!hasWelcome && (!stateToLoad.chatHistory || stateToLoad.chatHistory.length === 0)) {
              const welcomeMessage: ChatMessage = {
                role: 'assistant',
                content: '👋 Welcome to ByteLab! I\'m here to help you create an amazing microlearning course.\n\nTo get started, click "+ Add Source" to upload PDFs, text files, URLs, or paste text directly. I\'ll automatically analyze your content and provide insights.\n\nOr just tell me what topic you\'d like to create a course about and I\'ll help you plan it out!\n\nWhat would you like to teach today? 🚀',
                timestamp: Date.now(),
              };

              stateToLoad = {
                ...stateToLoad,
                chatHistory: [welcomeMessage],
              };
            }
          }

          loadStateForCourse(courseId, stateToLoad);
          setLoading(false);
        }
      }, 500);
      // Don't set loading to false immediately - wait for retry
      return;
    }
    setLoading(false);
  }, [courseId]);

  // Save course state whenever context changes (debounced)
  useEffect(() => {
    if (course && courseId) {
      const timeoutId = setTimeout(() => {
        updateCourse(courseId, {
          state,
          stageCount: state.courseData?.course.stages?.length || 0,
        });
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state, courseId]);

  // Keyboard shortcuts for panel toggling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + 1: Toggle Sources Panel
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setSourcesCollapsed(!sourcesCollapsed);
      }
      // Cmd/Ctrl + 2: Toggle Chat Panel
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setChatCollapsed(!chatCollapsed);
      }
      // Cmd/Ctrl + 3: Toggle Studio Panel
      if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setStudioCollapsed(!studioCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sourcesCollapsed, chatCollapsed, studioCollapsed]);

  const loadContentSummary = async (sourceCount?: number) => {
    try {
      const hasSources = (sourceCount !== undefined ? sourceCount : state.uploadedFiles.length) > 0;

      // If no sources, set default questions immediately - focus on course building
      if (!hasSources) {
        setSuggestedQuestions([
          'Create a course about JavaScript basics',
          'Help me build a leadership training course',
          'I want to teach data science fundamentals',
          'How do I create a course from my content?',
        ]);
        return; // Don't call API if no sources
      }

      const response = await fetch('/api/context/guide');
      if (response.ok) {
        const data = await response.json();
        setContentSummary(data.summary || '');
        setSuggestedQuestions(data.suggestedQuestions || []);
      }
    } catch (error) {
      console.error('Failed to load content summary:', error);
      // If error and no sources, show default questions
      const currentSourceCount = sourceCount !== undefined ? sourceCount : state.uploadedFiles.length;
      if (currentSourceCount === 0) {
        setSuggestedQuestions([
          'Create a course about JavaScript basics',
          'Help me build a leadership training course',
          'I want to teach data science fundamentals',
          'How do I create a course from my content?',
        ]);
      }
    }
  };

  const analyzeAndAddToChat = async (fileNames: string[]) => {
    try {
      console.log('[RAG] Analyzing files:', fileNames);

      const errorMessageText = 'I encountered an error analyzing your content';

      // Show loading state
      const loadingMessage: ChatMessage = {
        role: 'assistant',
        content: `Analyzing ${fileNames.length} new source(s): ${fileNames.join(', ')}...`,
        timestamp: Date.now(),
      };
      addChatMessage(loadingMessage);

      const response = await fetch('/api/context/analyze-for-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNames }),
      });

      if (response.ok) {
        const data = await response.json();

        // Remove loading message and any previous error messages
        const currentHistory = state.chatHistory.filter(
          msg => !msg.content.includes('Analyzing your uploaded content') &&
            !msg.content.includes(errorMessageText)
        );
        updateState({ chatHistory: currentHistory });

        // Add analysis as assistant message to chat
        const analysisMessage: ChatMessage = {
          role: 'assistant',
          content: data.analysis,
          timestamp: Date.now(),
        };

        addChatMessage(analysisMessage);

        // Update suggested questions with quick options
        if (data.quickOptions) {
          setSuggestedQuestions(data.quickOptions);
        }
      } else {
        // Remove loading message and any previous error messages
        const errorMessageText = 'I encountered an error analyzing your content';
        const hasExistingError = state.chatHistory.some(
          msg => msg.role === 'assistant' && msg.content.includes(errorMessageText)
        );

        const currentHistory = state.chatHistory.filter(
          msg => !msg.content.includes('Analyzing your uploaded content') &&
            !msg.content.includes(errorMessageText)
        );
        updateState({ chatHistory: currentHistory });

        // Only add error if we don't already have one
        if (!hasExistingError) {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: 'I encountered an error analyzing your content. Please try uploading again or ask me a question.',
            timestamp: Date.now(),
          };
          addChatMessage(errorMessage);
        }
      }
    } catch (error) {
      console.error('Failed to analyze content:', error);
      // Remove loading message and check for existing errors
      const errorMessageText = 'I encountered an error analyzing your content';
      const hasExistingError = state.chatHistory.some(
        msg => msg.role === 'assistant' && msg.content.includes(errorMessageText)
      );

      const currentHistory = state.chatHistory.filter(
        msg => !msg.content.includes('Analyzing your uploaded content') &&
          !msg.content.includes(errorMessageText)
      );
      updateState({ chatHistory: currentHistory });

      // Only add error if we don't already have one
      if (!hasExistingError) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'I encountered an error analyzing your content. Please try uploading again or ask me a question.',
          timestamp: Date.now(),
        };
        addChatMessage(errorMessage);
      }
    }
  };

  const handleExtractConfigFromChat = async () => {
    try {
      setGenerationProgress({ status: 'extracting', progress: 10, message: 'Extracting configuration...' });

      const extractResponse = await fetch('/api/context/extract-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: state.chatHistory,
          uploadedFiles: state.uploadedFiles,
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract course configuration');
      }

      const extractData = await extractResponse.json();
      // Preserve templateId from existing config if it exists
      const existingTemplateId = (state.courseConfig as any)?.templateId;
      if (existingTemplateId && extractData.config && !extractData.config.templateId) {
        extractData.config.templateId = existingTemplateId;
      }
      setExtractedConfig(extractData);
      setShowConfigModal(true);

      // Update course title immediately if extracted
      if (extractData.config.title && extractData.config.title !== 'Untitled Course' && course && course.title === 'Untitled course') {
        updateCourse(courseId, { title: extractData.config.title });
        setCourse({ ...course, title: extractData.config.title });
      }

      // Add message to chat
      const configMessage: ChatMessage = {
        role: 'assistant',
        content: `I've extracted the course configuration from our conversation. Here's what I found:\n\n**Title**: ${extractData.config.title || 'Not specified'}\n**Topic**: ${extractData.config.topic || 'Not specified'}\n**Stages**: ${extractData.config.stageCount || 5}\n**Style**: ${extractData.config.contentStyle || 'conversational'}\n\nReview and edit the configuration in the modal, then you can generate your course!`,
        timestamp: Date.now(),
      };
      addChatMessage(configMessage);

      setGenerationProgress({ status: 'idle', progress: 0 });
    } catch (error) {
      console.error('Config extraction error:', error);
      setError(error instanceof Error ? error.message : 'Failed to extract configuration');
      setGenerationProgress({ status: 'idle', progress: 0 });
    }
  };

  const generateContextualOptions = (response: string, conversationHistory: ChatMessage[] = []): string[] => {
    // Generate contextual quick options based on the AI response and conversation context
    const options: string[] = [];
    const responseLower = response.toLowerCase();
    const lastUserMessage = conversationHistory.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';

    // Analyze response content for context
    if (responseLower.includes('outline') || responseLower.includes('stage') || responseLower.includes('structure')) {
      options.push('Show me the course outline', 'What stages should I include?', 'Help me refine the structure', 'Can you break this down into modules?');
    }

    if (responseLower.includes('objective') || responseLower.includes('goal') || responseLower.includes('learn') || responseLower.includes('achieve')) {
      options.push('What are the learning objectives?', 'Help me define clear goals', 'What should learners achieve?', 'How do I measure success?');
    }

    if (responseLower.includes('quiz') || responseLower.includes('assessment') || responseLower.includes('test') || responseLower.includes('evaluate')) {
      options.push('Add interactive quizzes', 'What assessments should I include?', 'Suggest quiz questions', 'How do I test understanding?');
    }

    if (responseLower.includes('content') || responseLower.includes('material') || responseLower.includes('topic') || responseLower.includes('lesson')) {
      options.push('Generate course content', 'What topics should I cover?', 'Help me organize the content', 'Can you expand on this?');
    }

    if (responseLower.includes('audience') || responseLower.includes('learner') || responseLower.includes('student') || responseLower.includes('target')) {
      options.push('Who is this course for?', 'What background do learners need?', 'Is this suitable for beginners?', 'What prerequisites are needed?');
    }

    if (responseLower.includes('source') || responseLower.includes('upload') || responseLower.includes('file') || responseLower.includes('document')) {
      options.push('How do I add sources?', 'What files can I upload?', 'Can I use external resources?', 'How do sources help?');
    }

    if (responseLower.includes('generate') || responseLower.includes('create') || responseLower.includes('build')) {
      options.push('Generate course content', 'Create the course outline', 'Build the full course', 'Start generating now');
    }

    // Analyze conversation flow for better suggestions
    if (conversationHistory.length === 0 || conversationHistory.length <= 2) {
      // Early in conversation - suggest getting started
      if (!options.length) {
        options.push('What topic should I teach?', 'Help me get started', 'What makes a good course?', 'How do I create engaging content?');
      }
    } else if (conversationHistory.length > 5) {
      // Later in conversation - suggest action items
      if (!options.length) {
        options.push('Generate the course outline', 'Create course content', 'Review what we discussed', 'What\'s the next step?');
      }
    }

    // Default options if no specific context
    if (options.length === 0) {
      options.push('Tell me more', 'What should I do next?', 'Help me plan the course', 'Generate the course outline');
    }

    return options.slice(0, 4); // Return max 4 options
  };

  const handleAddSources = () => {
    setShowAddSourcesModal(true);
  };

  const handleFileUpload = async (files: File[], clearExisting: boolean) => {
    // Show upload loader
    setUploadingFiles(files);
    setShowUploadLoader(true);
    setShowAddSourcesModal(false);
  };

  const handleUploadComplete = async () => {
    setShowUploadLoader(false);

    // Process files based on type
    const regularFiles: File[] = [];
    const urlFiles: Array<{ url: string; filename: string }> = [];
    const textFiles: Array<{ text: string; filename: string }> = [];

    uploadingFiles.forEach((file) => {
      if ((file as any).isUrl) {
        urlFiles.push({ url: (file as any).url, filename: file.name });
      } else if ((file as any).isText) {
        textFiles.push({ text: (file as any).text, filename: file.name });
      } else {
        regularFiles.push(file);
      }
    });

    try {
      const allUploadedFiles: UploadedFile[] = [];

      // Upload regular files
      if (regularFiles.length > 0) {
        const formData = new FormData();
        regularFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('clearExisting', 'false');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

        const data = await response.json();
        const uploaded: UploadedFile[] = data.files.map((file: any, index: number) => ({
          id: `file-${Date.now()}-${index}`,
          name: file.name || file.filename || `file-${index}`,
          type: file.type || 'application/octet-stream',
          size: file.size || 0,
          uploadedAt: Date.now(),
          chunks: [],
        }));
        allUploadedFiles.push(...uploaded);
      }

      // Upload URLs
      for (const urlFile of urlFiles) {
        const response = await fetch('/api/upload/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlFile.url }),
        });

        if (!response.ok) {
          throw new Error('URL processing failed');
        }

        const data = await response.json();
        allUploadedFiles.push({
          id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.filename || urlFile.filename,
          type: 'text/html',
          size: data.size || 0,
          uploadedAt: Date.now(),
          chunks: [],
        });
      }

      // Upload text
      for (const textFile of textFiles) {
        const response = await fetch('/api/upload/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textFile.text, filename: textFile.filename }),
        });

        if (!response.ok) {
          throw new Error('Text processing failed');
        }

        const data = await response.json();
        allUploadedFiles.push({
          id: `text-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: data.filename || textFile.filename,
          type: 'text/plain',
          size: textFile.text.length,
          uploadedAt: Date.now(),
          chunks: [],
        });
      }

      if (allUploadedFiles.length > 0) {
        // Filter out any duplicates that might have been created by race conditions
        const uniqueUploadedFiles = allUploadedFiles.filter((file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
        );
        addUploadedFiles(uniqueUploadedFiles);

        // Deduplicate filenames for analysis
        const fileNamesForAnalysis = Array.from(new Set(uniqueUploadedFiles.map(f => f.name)));

        // Automatically analyze content and add to chat
        await analyzeAndAddToChat(fileNamesForAnalysis);

        loadContentSummary();
      }

      setUploadingFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
      setUploadingFiles([]);
    }
  };

  const handleUploadError = (error: string) => {
    setShowUploadLoader(false);
    alert(error || 'Failed to process files');
    setUploadingFiles([]);
  };

  const handleUrlUpload = async (url: string) => {
    setShowAddSourcesModal(false);

    // Show loading message in chat
    const loadingMessage: ChatMessage = {
      role: 'assistant',
      content: `🔗 Fetching content from URL: ${url}\n\nPlease wait while I extract and analyze the content...`,
      timestamp: Date.now(),
    };
    addChatMessage(loadingMessage);

    try {
      // Directly call the URL upload API
      const response = await fetch('/api/upload/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch URL content');
      }

      const data = await response.json();

      // Add to uploaded files
      const urlFile: UploadedFile = {
        id: `url-${Date.now()}`,
        name: data.filename || url.split('/').pop() || 'webpage',
        type: 'text/html',
        size: data.size || 0,
        uploadedAt: Date.now(),
        chunks: [],
      };
      addUploadedFiles([urlFile]);

      // Remove loading message and add success message
      const currentHistory = state.chatHistory.filter(
        msg => !msg.content.includes('Fetching content from URL')
      );
      updateState({ chatHistory: currentHistory });

      // Add success message with content summary
      const successMessage: ChatMessage = {
        role: 'assistant',
        content: `✅ **Successfully extracted content from URL!**

**Source:** ${url}
**Content size:** ${(data.size / 1024).toFixed(1)} KB
**Chunks created:** ${data.chunks} text chunks indexed for search

The content has been added to your sources and is ready to use. I can now help you create a course based on this content!

**What would you like to do next?**`,
        timestamp: Date.now(),
      };
      addChatMessage(successMessage);

      // Update suggested questions
      setSuggestedQuestions([
        'Analyze this content for course creation',
        'Create a course outline from this content',
        'What are the main topics covered?',
        'How many stages should this course have?',
      ]);

      // Also run the full analysis
      await analyzeAndAddToChat([urlFile.name]);
      loadContentSummary();

    } catch (error) {
      console.error('URL upload error:', error);

      // Remove loading message
      const currentHistory = state.chatHistory.filter(
        msg => !msg.content.includes('Fetching content from URL')
      );
      updateState({ chatHistory: currentHistory });

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ **Failed to fetch content from URL**

I couldn't extract content from: ${url}

**Possible reasons:**
- The URL might be blocked or require authentication
- The website might be using JavaScript to load content
- The URL might not be accessible from this server

**Try these alternatives:**
1. Copy the text from the webpage and use "Paste Text" option
2. Download the page as PDF and upload it
3. Use a different URL that's publicly accessible`,
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    }
  };

  const handleTextUpload = async (text: string) => {
    // Create a file object from text for the loader
    const textFile = new File([text], 'pasted-text.txt', { type: 'text/plain' });
    setUploadingFiles([textFile]);
    setShowUploadLoader(true);
    setShowAddSourcesModal(false);

    // Store text for later processing
    (textFile as any).isText = true;
    (textFile as any).text = text;
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: state.chatHistory,
          uploadedFiles: state.uploadedFiles.map(f => ({ name: f.name })),
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error.',
        timestamp: Date.now(),
      };

      addChatMessage(assistantMessage);

      // Store API quick options if available (used as fallback)
      // SmartSuggestions component will generate dynamic suggestions based on context
      if (data.quickOptions && data.quickOptions.length > 0) {
        setSuggestedQuestions(data.quickOptions);
      } else {
        // Clear old suggestions - let SmartSuggestions component generate dynamically
        setSuggestedQuestions([]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      addChatMessage(errorMessage);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateOutput = async (type: string) => {
    setGenerating(type);
    setError(null);

    try {
      // For Interactive Course, implement progressive generation
      if (type === 'course') {
        await handleProgressiveCourseGeneration();
      } else {
        // For other outputs, use simple generation
        const response = await fetch(`/api/studio/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            state,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setStudioOutputs((prev) => ({
            ...prev,
            [type]: data,
          }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to generate ${type}`);
        }
      }
    } catch (error) {
      console.error('Failed to generate output:', error);
      setError(error instanceof Error ? error.message : `Failed to generate ${type}`);
    } finally {
      setGenerating(null);
      setGenerationProgress({ status: 'idle', progress: 0 });
    }
  };

  const handleProgressiveCourseGeneration = async () => {
    try {
      // Step 1: Check prerequisites - Allow generation if either:
      // - Sources are uploaded, OR
      // - User has had a conversation discussing the course (3+ messages)
      const hasSources = state.uploadedFiles.length > 0;
      const hasConversation = state.chatHistory.length >= 3;

      if (!hasSources && !hasConversation) {
        throw new Error('Please upload sources or describe your course topic in the chat first');
      }

      // Clear any old course data from outputs to prevent showing stale data
      setStudioOutputs({});
      setGenerating('course');

      // Check if we have an outline but no content - allow continuing
      if (state.courseData?.course.stages && state.courseData.course.stages.length > 0) {
        const hasContent = state.courseData.course.stages[0]?.content;
        if (!hasContent && state.courseConfig) {
          // We have outline but no content - generate content for existing outline
          await generateCourseStages(state.courseData.course, state.courseConfig as CourseConfig);
          return;
        }
        // If we have content, check if it's recent (generated in last 5 minutes) - if so, don't ask
        if (hasContent) {
          const courseGeneratedAt = state.courseData.course.generatedAt || 0;
          const isRecent = Date.now() - courseGeneratedAt < 5 * 60 * 1000; // 5 minutes

          if (!isRecent) {
            // Only ask if course is not recent (likely from previous session)
            const shouldRegenerate = window.confirm('A course already exists for this workspace. Do you want to generate a new course? This will replace the existing course.');
            if (!shouldRegenerate) {
              setGenerating(null);
              return;
            }
          }
          // Clear existing course data
          updateState({ courseData: null, courseConfig: null });
        } else {
          // No content, just clear the old outline and continue
          updateState({ courseData: null, courseConfig: null });
        }
      }

      // Step 2: Extract or get course config
      let config: CourseConfig;

      if (state.courseConfig) {
        // Use existing config
        config = state.courseConfig as CourseConfig;
      } else {
        // Extract config from chat
        setGenerationProgress({ status: 'extracting', progress: 10, message: 'Extracting course configuration from conversation...' });

        const extractResponse = await fetch('/api/context/extract-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatHistory: state.chatHistory,
            uploadedFiles: state.uploadedFiles,
          }),
        });

        if (!extractResponse.ok) {
          throw new Error('Failed to extract course configuration');
        }

        const extractData = await extractResponse.json();
        setExtractedConfig(extractData);
        setShowConfigModal(true);

        // Wait for user to approve config (handled by modal callback)
        return; // Modal will continue the flow
      }

      // Step 3: Generate outline (or use existing)
      // Only use existing outline if it matches current context (has sources)
      const hasMatchingContext = state.uploadedFiles.length > 0;
      if (hasMatchingContext && state.courseData?.course.stages && state.courseData.course.stages.length > 0) {
        // We already have an outline
        const outline = state.courseData.course;
        const hasContent = outline.stages[0]?.content;

        if (!hasContent) {
          // We have outline but no content - show outline modal to continue
          setGeneratedOutline(outline);
          setShowOutlineModal(true);
          setGenerationProgress({ status: 'idle', progress: 0 });
        } else {
          // Already complete - check if it's recent (generated in last 5 minutes)
          const courseGeneratedAt = outline.generatedAt || 0;
          const isRecent = Date.now() - courseGeneratedAt < 5 * 60 * 1000; // 5 minutes

          if (!isRecent) {
            // Only ask if course is not recent (likely from previous session)
            const shouldRegenerate = window.confirm('A course already exists. Do you want to generate a new course? This will replace the existing course.');
            if (!shouldRegenerate) {
              setGenerating(null);
              setGenerationProgress({ status: 'idle', progress: 0 });
              return;
            }
          }
          // Clear old course data and generate new
          updateState({ courseData: null });
          await generateCourseOutline(config);
        }
      } else {
        // Generate new outline (no existing outline or context mismatch)
        await generateCourseOutline(config);
      }
    } catch (error) {
      console.error('Course generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate course';

      // Provide specific error messages based on error type
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('Failed to extract')) {
        userFriendlyMessage = 'Failed to extract course configuration from conversation. Please try providing more details about your course requirements.';
      } else if (errorMessage.includes('Failed to generate course outline')) {
        userFriendlyMessage = 'Failed to generate course outline. This might be due to insufficient source material or unclear requirements. Please try again or provide more context.';
      } else if (errorMessage.includes('No sources')) {
        userFriendlyMessage = 'Please upload source materials before generating a course.';
      }

      setError(userFriendlyMessage);
      setGenerating(null);
      setGenerationProgress({ status: 'idle', progress: 0 });

      // Add error message to chat for user visibility
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `I encountered an error: ${userFriendlyMessage}\n\nYou can:\n- Try generating again\n- Upload more source materials\n- Provide more details about your course requirements`,
        timestamp: Date.now(),
      };
      addChatMessage(errorChatMessage);

      throw error;
    }
  };

  const handleConfigApproved = async (config: CourseConfig) => {
    setShowConfigModal(false);
    updateState({ courseConfig: config });

    // Update course title if config has a title - do this immediately
    if (config.title && config.title !== 'Untitled Course') {
      if (course) {
        updateCourse(courseId, { title: config.title });
        setCourse({ ...course, title: config.title });
      } else {
        // If course not loaded yet, update it when it loads
        updateCourse(courseId, { title: config.title });
      }
    }

    await generateCourseOutline(config);
  };

  const generateCourseOutline = async (config: CourseConfig) => {
    try {
      setGenerationProgress({ status: 'outline', progress: 20, message: 'Generating course outline...' });

      const outlineResponse = await fetch('/api/generate/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          provider: 'together',
          chatHistory: state.chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!outlineResponse.ok) {
        const errorData = await outlineResponse.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || 'Failed to generate course outline';
        throw new Error(errorMessage);
      }

      const outlineData = await outlineResponse.json();
      
      // Validate response structure
      if (!outlineData || !outlineData.course) {
        throw new Error('Invalid response from outline generation API: missing course data');
      }

      const outline = outlineData.course;

      // Validate outline has required fields
      if (!outline.stages || !Array.isArray(outline.stages) || outline.stages.length === 0) {
        throw new Error('Generated outline has no stages. Please try regenerating with more specific requirements.');
      }

      setGeneratedOutline(outline);
      setShowOutlineModal(true);

      // Ensure outline uses title from config if available
      if (config.title && config.title !== 'Untitled Course') {
        outline.title = config.title;
      }

      // Update course title from outline if available
      if (outline.title && course && (course.title === 'Untitled course' || course.title === 'Untitled Course')) {
        updateCourse(courseId, { title: outline.title });
        setCourse({ ...course, title: outline.title });
      }

      // Store outline in course state (without content yet)
      const outlineOnlyData: CourseData = {
        course: outline,
        videoScenes: [],
        podcastDialogue: [],
      };

      const updatedState = {
        ...state,
        courseData: outlineOnlyData,
        courseConfig: config,
      };
      updateState(updatedState);
      updateCourse(courseId, {
        state: updatedState,
        stageCount: outline.stages?.length || 0,
        title: outline.title || course?.title,
      });

      // Store outline in outputs
      setStudioOutputs((prev) => ({
        ...prev,
        course: {
          type: 'course',
          course: outline,
          config,
          generatedAt: Date.now(),
        },
      }));

      setGenerationProgress({ status: 'idle', progress: 0 });
    } catch (error) {
      console.error('Outline generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate outline');
      throw error;
    }
  };

  const handleOutlineApproved = async () => {
    setShowOutlineModal(false);
    if (!generatedOutline) return;

    // Use existing config or create default
    // Preserve templateId from existing config if it exists
    const existingConfig = state.courseConfig as CourseConfig;
    const config = existingConfig || {
      title: generatedOutline.title,
      topic: 'General',
      description: generatedOutline.description,
      objectives: [],
      targetAudience: 'General audience',
      organizationalGoals: '',
      contentStyle: 'conversational',
      stageCount: generatedOutline.stages.length,
      estimatedDuration: generatedOutline.duration,
      accentColor1: '#4a90e2',
      accentColor2: '#50c9c3',
      voiceId: '',
      includeVideo: false,
      includePodcast: false,
      templateId: (existingConfig as any)?.templateId, // Preserve templateId from existing config
    };

    // Check if stages already have content
    const hasContent = generatedOutline.stages[0]?.content;
    if (hasContent) {
      // Already has content, just update state
      const fullCourseData: CourseData = {
        course: generatedOutline,
        videoScenes: [],
        podcastDialogue: [],
      };
      updateState({ courseData: fullCourseData, courseConfig: config });
      setToast({ message: 'Course updated successfully!', type: 'success' });
      setGenerating(null);
      return;
    }

    await generateCourseStages(generatedOutline, config);
  };

  const handleOutlineRegenerate = async () => {
    setShowOutlineModal(false);
    if (!state.courseConfig) return;
    await generateCourseOutline(state.courseConfig as CourseConfig);
  };

  const generateCourseStages = async (outline: CourseData['course'], config: CourseConfig) => {
    try {
      const stages = outline.stages;
      const totalStages = stages.length;
      const generatedStages: any[] = [];

      setGenerationProgress({
        status: 'generating',
        progress: 30,
        currentStage: 0,
        totalStages,
        message: 'Starting content generation...',
      });

      // Generate each stage progressively with retry logic
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageProgress = 30 + ((i + 1) / totalStages) * 60;

        setGenerationProgress({
          status: 'generating',
          progress: stageProgress,
          currentStage: i + 1,
          totalStages,
          message: `Generating content for Stage ${i + 1}: ${stage.title}...`,
        });

        let content;
        let retries = 3;
        let lastError;

        // Retry logic for stage generation
        while (retries > 0) {
          try {
            const contentResponse = await fetch('/api/generate/content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                config,
                stage: {
                  id: stage.id,
                  title: stage.title,
                  objective: stage.objective,
                  keyPoints: stage.keyPoints || [],
                },
                provider: 'together',
              }),
            });

            if (!contentResponse.ok) {
              const errorData = await contentResponse.json().catch(() => ({}));
              const errorMessage = errorData.error || errorData.details || `HTTP ${contentResponse.status}: Failed to generate content for stage ${i + 1}`;
              throw new Error(errorMessage);
            }

            content = await contentResponse.json();
            break; // Success, exit retry loop
          } catch (error) {
            lastError = error;
            retries--;

            if (retries > 0) {
              setGenerationProgress({
                status: 'generating',
                progress: stageProgress,
                currentStage: i + 1,
                totalStages,
                message: `Retrying Stage ${i + 1}... (${4 - retries}/3 attempts)`,
              });
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        if (!content) {
          throw new Error(
            lastError instanceof Error
              ? `Failed to generate Stage ${i + 1}: ${lastError.message}`
              : `Failed to generate content for stage ${i + 1} after 3 attempts`
          );
        }

        // Wrap content in proper structure for template rendering
        generatedStages.push({
          ...stage,
          content: {
            introduction: content.introduction || '',
            sections: content.sections || [],
            summary: content.summary || '',
          },
          interactiveElements: content.interactiveElements || [],
          sideCard: content.sideCard || null,
        });

        // Update course data after each stage
        const partialCourseData: CourseData = {
          course: {
            ...outline,
            stages: generatedStages,
          },
          videoScenes: [],
          podcastDialogue: [],
        };

        const updatedState = {
          ...state,
          courseData: partialCourseData,
        };
        updateState(updatedState);
        updateCourse(courseId, {
          state: updatedState,
          stageCount: generatedStages.length,
        });

        setStudioOutputs((prev) => ({
          ...prev,
          course: {
            ...prev.course,
            course: {
              ...outline,
              stages: generatedStages,
            },
          },
        }));
      }

      // Generate media (optional, can be done later)
      setGenerationProgress({
        status: 'generating',
        progress: 90,
        message: 'Generating video and podcast content...',
      });

      // Generate video scenes and podcast dialogue if config includes them
      let videoScenes: any[] = [];
      let podcastDialogue: any[] = [];

      if (config.includeVideo || config.includePodcast) {
        try {
          // Generate video scenes
          if (config.includeVideo) {
            const videoResponse = await fetch('/api/studio/video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId,
                state: {
                  ...state,
                  courseData: {
                    course: { ...outline, stages: generatedStages },
                    videoScenes: [],
                    podcastDialogue: [],
                  },
                },
              }),
            });
            if (videoResponse.ok) {
              const videoData = await videoResponse.json();
              // Map video script scenes to VideoScene format
              videoScenes = videoData.script?.scenes || videoData.scenes || [];
            }
          }

          // Generate podcast dialogue
          if (config.includePodcast) {
            const podcastResponse = await fetch('/api/studio/podcast', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseId,
                state: {
                  ...state,
                  courseData: {
                    course: { ...outline, stages: generatedStages },
                    videoScenes: [],
                    podcastDialogue: [],
                  },
                },
              }),
            });
            if (podcastResponse.ok) {
              const podcastData = await podcastResponse.json();
              // Map podcast script segments to DialogueSegment format
              const episodes = podcastData.script?.episodes || podcastData.episodes || [];
              podcastDialogue = episodes.flatMap((ep: any) =>
                (ep.segments || []).map((seg: any) => ({
                  speaker: seg.speaker || 'Host',
                  content: seg.content || '',
                  timestamp: seg.timestamp || 0,
                }))
              );
            }
          }
        } catch (error) {
          console.error('Media generation error (non-critical):', error);
          // Continue even if media generation fails
        }
      }

      setGenerationProgress({
        status: 'generating',
        progress: 95,
        message: 'Finalizing course...',
      });

      // Ensure course title is set from config if available
      const courseTitle = config.title && config.title !== 'Untitled Course'
        ? config.title
        : outline.title || 'Untitled Course';

      const fullCourseData: CourseData = {
        course: {
          ...outline,
          title: courseTitle,
          stages: generatedStages,
          generatedAt: Date.now(), // Add timestamp to track when course was generated
        },
        videoScenes,
        podcastDialogue,
      };

      updateState({ courseData: fullCourseData });
      setStudioOutputs((prev) => ({
        ...prev,
        course: {
          ...prev.course,
          course: fullCourseData.course,
        },
      }));

      setGenerationProgress({
        status: 'complete',
        progress: 100,
        message: 'Course generation complete!',
      });

      // Update course metadata
      const updatedState = {
        ...state,
        courseData: fullCourseData,
        courseConfig: config,
      };
      updateCourse(courseId, { state: updatedState });
      updateState(updatedState);

      // Save course to output folder via API (async, non-blocking)
      // This will also generate video and podcast audio files
      fetch('/api/course/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseData: fullCourseData,
          config: config,
          courseId: courseId,
        }),
      })
        .then(async (response) => {
          if (response.ok) {
            const result = await response.json();
            // Update status after save completes (which includes audio generation)
            if (config.includeVideo) {
              updateState({
                videoGenerationStatus: {
                  status: 'complete',
                  progress: 100,
                  message: 'Video generated successfully',
                },
              });
            }
            if (config.includePodcast) {
              updateState({
                audioGenerationStatus: {
                  status: 'complete',
                  progress: 100,
                  message: 'Podcast audio generated successfully',
                },
              });
            }
          } else {
            // Handle errors
            if (config.includeVideo) {
              updateState({
                videoGenerationStatus: {
                  status: 'failed',
                  progress: 0,
                  message: 'Video generation failed',
                  error: 'Failed to save course',
                },
              });
            }
            if (config.includePodcast) {
              updateState({
                audioGenerationStatus: {
                  status: 'failed',
                  progress: 0,
                  message: 'Podcast generation failed',
                  error: 'Failed to save course',
                },
              });
            }
          }
        })
        .catch((error) => {
          console.error('Failed to save course to output folder:', error);
          if (config.includeVideo) {
            updateState({
              videoGenerationStatus: {
                status: 'failed',
                progress: 0,
                message: 'Video generation failed',
                error: error.message || 'Unknown error',
              },
            });
          }
          if (config.includePodcast) {
            updateState({
              audioGenerationStatus: {
                status: 'failed',
                progress: 0,
                message: 'Podcast generation failed',
                error: error.message || 'Unknown error',
              },
            });
          }
        });

      // Show success message and auto-open preview
      setToast({ message: `Course generated successfully with ${totalStages} stages!`, type: 'success' });
      setTimeout(() => {
        setGenerationProgress({ status: 'idle', progress: 0 });
        setGenerating(null);
        // Auto-open course preview after generation
        setShowCoursePreview(true);
      }, 1500);
    } catch (error) {
      console.error('Stage generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate course stages';

      // Provide specific error messages
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('Failed to generate')) {
        userFriendlyMessage = 'Failed to generate course content. This might be due to:\n- Network issues\n- Insufficient source material\n- AI service temporarily unavailable\n\nYou can try generating again or generate individual stages.';
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        userFriendlyMessage = 'The generation took too long and timed out. Please try again with fewer stages or simpler content.';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('Rate limit')) {
        userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
      }

      setError(userFriendlyMessage);
      setGenerationProgress({ status: 'idle', progress: 0 });

      // Add error message to chat with recovery options
      const errorChatMessage: ChatMessage = {
        role: 'assistant',
        content: `I encountered an error while generating the course: ${userFriendlyMessage}\n\n**What you can do:**\n- Try generating again (the partial course data has been saved)\n- Generate individual stages if the full course fails\n- Check your source materials and add more context if needed`,
        timestamp: Date.now(),
      };
      addChatMessage(errorChatMessage);

      throw error;
    }
  };

  const handleSelectSource = (id: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedSources.size === state.uploadedFiles.length) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(state.uploadedFiles.map(f => f.id)));
    }
  };

  const handleDeleteSource = (id: string) => {
    const updatedFiles = state.uploadedFiles.filter(f => f.id !== id);
    updateState({ uploadedFiles: updatedFiles });
    setSelectedSources(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleRenameFile = (id: string, newName: string) => {
    const updatedFiles = state.uploadedFiles.map(f =>
      f.id === id ? { ...f, name: newName } : f
    );
    updateState({ uploadedFiles: updatedFiles });
  };

  const handleDuplicateFile = (id: string) => {
    const file = state.uploadedFiles.find(f => f.id === id);
    if (file) {
      const duplicated: UploadedFile = {
        ...file,
        id: `${file.id}-copy-${Date.now()}`,
        name: `${file.name} (copy)`,
        uploadedAt: Date.now(),
      };
      addUploadedFiles([duplicated]);
    }
  };

  const handleCreateFolder = (name: string) => {
    // Folder management will be handled in context
    // For now, just show a toast
    setToast({ message: `Folder "${name}" created`, type: 'success' });
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    // Folder management will be handled in context
    setToast({ message: `Folder renamed to "${newName}"`, type: 'success' });
  };

  const handleDeleteFolder = (folderId: string) => {
    // Folder management will be handled in context
    setToast({ message: 'Folder deleted', type: 'success' });
  };

  const handleMoveToFolder = (fileId: string, folderId: string | null) => {
    // Folder management will be handled in context
    setToast({ message: 'File moved', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-bg1 font-geist tracking-tight">
      {/* Header */}
      <header className="liquid-glass-header px-8 py-5 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-accent1 hover:text-accent2 transition-colors flex items-center gap-2 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <div className="h-6 w-px bg-border/40" />
          <h1 className="text-2xl font-bold text-text-primary tracking-tightest">{course.title}</h1>
          <div className="flex items-center gap-2">
            {course.stageCount && (
              <span className="px-2 py-0.5 bg-bg3 text-text-secondary rounded-full text-xs font-semibold">
                {course.stageCount} {course.stageCount === 1 ? 'Stage' : 'Stages'}
              </span>
            )}
            {state.courseData?.course.stages && state.courseData.course.stages[0]?.content && (
              <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-widest">
                Ready
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {state.courseData?.course.stages && state.courseData.course.stages[0]?.content && (
            <Link
              href={`/course/${courseId}/edit`}
              className="px-6 py-2.5 bg-accent1 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-accent1/20 transition-all active:scale-95"
            >
              Edit Course
            </Link>
          )}
          <button 
            className="p-2.5 hover:bg-bg3 rounded-full transition-colors text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
            aria-label="Settings"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Workflow Progress Indicator */}
      <WorkflowProgress state={state} />

      <div className="flex-1 flex overflow-hidden relative gap-2 p-2 pt-0">
        {/* Sources Panel - Collapsible Sheet */}
        <motion.div 
          className={`flex shrink-0 ${sourcesCollapsed ? 'w-14' : 'w-80'}`}
          animate={{ width: sourcesCollapsed ? 56 : 320 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden shadow-2xl relative">
            <AnimatePresence mode="wait">
              {sourcesCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center py-6 gap-6"
                >
                  <button
                    onClick={() => setSourcesCollapsed(false)}
                    className="p-3 bg-bg3/50 hover:bg-bg3 rounded-2xl transition-all hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                    aria-label="Expand sources panel"
                    title="Expand Sources"
                  >
                    <svg className="w-6 h-6 text-accent1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </button>
                  <div className="w-px h-full bg-border/20" />
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1"
                >
                  <SourcesPanel
                sources={state.uploadedFiles}
                isCollapsed={false}
                onToggleCollapse={() => setSourcesCollapsed(true)}
                onAddSources={handleAddSources}
                onSelectSource={handleSelectSource}
                selectedSources={selectedSources}
                onSelectAll={handleSelectAll}
                onClearSelection={() => setSelectedSources(new Set())}
                onDeleteSource={handleDeleteSource}
                onRenameFile={handleRenameFile}
                onDuplicateFile={handleDuplicateFile}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                    onMoveToFolder={handleMoveToFolder}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Workspace & Chat */}
        <div className="flex-1 flex overflow-hidden gap-2">
          {/* Main Chat Area */}
          <motion.div 
            className={`flex-1 flex flex-col glass-panel rounded-3xl shadow-2xl ${chatCollapsed ? 'flex-none w-14' : ''}`}
            style={{ overflow: chatCollapsed ? 'hidden' : 'visible' }}
            animate={{ width: chatCollapsed ? 56 : 'auto', flex: chatCollapsed ? 'none' : 1 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <AnimatePresence mode="wait">
              {chatCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center py-6 gap-6"
                >
                  <button
                    onClick={() => setChatCollapsed(false)}
                    className="p-3 bg-bg3/50 hover:bg-bg3 rounded-2xl transition-all hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                    aria-label="Expand chat panel"
                    title="Expand Chat"
                  >
                    <svg className="w-6 h-6 text-accent1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 overflow-hidden"
                >
                  <ChatPanel
                labTitle="AI Workspace"
                courseTitle={course.title}
                sourceCount={state.uploadedFiles.length}
                messages={state.chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={chatLoading}
                contentSummary={contentSummary}
                suggestedQuestions={suggestedQuestions}
                isCollapsed={false}
                onToggleCollapse={() => setChatCollapsed(true)}
                onExtractConfig={handleExtractConfigFromChat}
                hasConfig={!!state.courseConfig}
                onGenerateCourse={handleProgressiveCourseGeneration}
                    isGenerating={generating === 'course' || (generationProgress && generationProgress.status !== 'idle')}
                    hasOutline={!!(state.courseData?.course.stages && state.courseData.course.stages.length > 0)}
                    hasContent={!!(state.courseData?.course.stages?.[0]?.content)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Studio/Preview Panel */}
          <motion.div 
            className={`flex shrink-0 ${studioCollapsed ? 'w-14' : 'w-96'}`}
            animate={{ width: studioCollapsed ? 56 : 384 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden shadow-2xl relative">
              <AnimatePresence mode="wait">
                {studioCollapsed ? (
                  <motion.div
                    key="collapsed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center py-6 gap-6"
                  >
                    <button
                      onClick={() => setStudioCollapsed(false)}
                      className="p-3 bg-bg3/50 hover:bg-bg3 rounded-2xl transition-all hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                      aria-label="Expand studio panel"
                      title="Expand Studio"
                    >
                      <svg className="w-6 h-6 text-accent1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <StudioPanel
                  isCollapsed={false}
                  onToggleCollapse={() => setStudioCollapsed(true)}
                  onGenerateOutput={handleGenerateOutput}
                  outputs={studioOutputs}
                  generating={generating}
                  generationProgress={generationProgress}
                  hasSources={state.uploadedFiles.length > 0 || state.chatHistory.length >= 3}
                  onViewCourse={(courseData) => {
                    const fullCourseData: CourseData = {
                      course: courseData.course,
                      videoScenes: courseData.videoScenes || [],
                      podcastDialogue: courseData.podcastDialogue || [],
                    };
                    updateState({ courseData: fullCourseData });
                    updateCourse(courseId, {
                      state: {
                        ...state,
                        courseData: fullCourseData,
                      },
                    });
                    setShowCoursePreview(true);
                  }}
                  onRemoveOutput={(type) => {
                    setStudioOutputs((prev) => {
                      const next = { ...prev };
                      delete next[type];
                      return next;
                    });
                    }}
                  />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Generation Progress Display */}
        {generationProgress.status !== 'idle' && (
          <div className="absolute bottom-6 right-6 w-96 z-50">
            <div className="glass-panel rounded-3xl p-1 shadow-2xl">
              <GenerationProgress
                status={generationProgress.status}
                progress={generationProgress.progress}
                currentStage={generationProgress.currentStage}
                totalStages={generationProgress.totalStages}
                message={generationProgress.message}
                onCancel={() => {
                  setGenerating(null);
                  setGenerationProgress({ status: 'idle', progress: 0 });
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {showConfigModal && extractedConfig && (
        <ConfigExtractionModal
          extractedConfig={extractedConfig.config}
          confidence={extractedConfig.confidence}
          onApprove={handleConfigApproved}
          onEdit={(config) => {
            updateState({ courseConfig: config });
            setShowConfigModal(false);
            handleConfigApproved(config);
          }}
          onCancel={() => {
            setShowConfigModal(false);
            setGenerating(null);
            setGenerationProgress({ status: 'idle', progress: 0 });
          }}
        />
      )}

      {showOutlineModal && generatedOutline && (
        <OutlineReviewModal
          outline={generatedOutline}
          expectedStageCount={state.courseConfig?.stageCount}
          onApprove={handleOutlineApproved}
          onRegenerate={handleOutlineRegenerate}
          onEdit={(editedOutline) => {
            setGeneratedOutline(editedOutline);
            const updatedOutlineData: CourseData = {
              course: editedOutline,
              videoScenes: [],
              podcastDialogue: [],
            };
            updateState({ courseData: updatedOutlineData });
            setStudioOutputs((prev) => ({
              ...prev,
              course: {
                ...prev.course,
                course: editedOutline,
              },
            }));
          }}
          onCancel={() => {
            setShowOutlineModal(false);
            setGenerating(null);
            setGenerationProgress({ status: 'idle', progress: 0 });
          }}
          isContinuing={!!state.courseData?.course.stages && !state.courseData.course.stages[0]?.content}
        />
      )}

      {showCoursePreview && state.courseData && (
        <CoursePreview
          courseData={state.courseData}
          config={state.courseConfig as CourseConfig}
          courseId={courseId}
          onClose={() => setShowCoursePreview(false)}
          onConfigUpdate={(updatedConfig) => {
            // Update the course config when template is changed in preview
            updateState({ courseConfig: updatedConfig });
          }}
          onExport={async () => {
            try {
              const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  courseData: state.courseData,
                  courseConfig: {
                    ...state.courseConfig,
                    // Ensure templateId is included in export
                    templateId: state.courseConfig?.templateId || 'modern',
                  },
                  courseId: courseId,
                }),
              });

              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${state.courseConfig?.title || 'course'}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              }
            } catch (error) {
              console.error('Export error:', error);
              setError('Failed to export course');
            }
          }}
        />
      )}

      {/* Add Sources Modal */}
      {showAddSourcesModal && (
        <AddSourcesModal
          onClose={() => setShowAddSourcesModal(false)}
          onFileUpload={handleFileUpload}
          onUrlUpload={handleUrlUpload}
          onTextUpload={handleTextUpload}
        />
      )}

      {showUploadLoader && uploadingFiles.length > 0 && (
        <UploadProgressLoader
          files={uploadingFiles}
          onComplete={handleUploadComplete}
          onError={handleUploadError}
        />
      )}

      {/* Toasts */}
      {(toast || error) && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[100]">
          {toast && (
            <div className={`glass shadow-2xl border-l-4 ${toast.type === 'success' ? 'border-green-500' : 'border-blue-500'} p-4 rounded-2xl min-w-[320px] animate-in slide-in-from-right duration-300`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{toast.message}</p>
                <button 
                  onClick={() => setToast(null)} 
                  className="ml-4 p-1 hover:bg-bg3 rounded-full focus-visible:outline-2 focus-visible:outline-accent1 focus-visible:outline-offset-2"
                  aria-label="Close notification"
                  title="Close notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /></svg>
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="glass shadow-2xl border-l-4 border-red-500 p-4 rounded-2xl min-w-[320px] animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Error</p>
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-4 p-1 hover:bg-bg3 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
