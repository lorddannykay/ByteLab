'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourses } from '@/contexts/CourseContext';
import { useCourseCreation } from '@/contexts/CourseCreationContext';
import SourcesPanel from '@/components/Workspace/SourcesPanel';
import ChatPanel from '@/components/Workspace/ChatPanel';
import StudioPanel from '@/components/Workspace/StudioPanel';
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
  const { state, updateState, addChatMessage, addUploadedFiles } = useCourseCreation();

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
            content: '👋 Welcome to ByteLab! I\'m here to help you create an amazing microlearning course.\n\n**Quick Start Guide:**\n1. **Upload Sources**: Click "+ Add Source" to upload PDFs, text files, URLs, or paste text directly\n2. **Content Analysis**: I\'ll automatically analyze your content and provide insights\n3. **Course Generation**: Click "Generate Course" to create your interactive microlearning course\n4. **Customization**: Review and edit the course outline, then generate full content\n\n**Tips for Best Results:**\n- Provide clear learning objectives in your conversation\n- Specify your target audience (e.g., "for beginners", "for developers")\n- Mention desired number of stages (e.g., "6-8 stages")\n- Describe the content style (conversational, formal, or technical)\n\n**Need Help?**\n- Ask me questions about your content\n- Request course generation when ready\n- I\'ll guide you through each step\n\nLet\'s create something great together! 🚀',
            timestamp: Date.now(),
          };
          
          stateToLoad = {
            ...stateToLoad,
            chatHistory: [welcomeMessage],
          };
        }
      }
      
      // Load course state into context
      updateState(stateToLoad);
      
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
      // Course not found, redirect to dashboard
      router.push('/');
    }
    setLoading(false);
  }, [courseId]);

  // Save course state whenever context changes (debounced)
  useEffect(() => {
    if (course && courseId) {
      const timeoutId = setTimeout(() => {
        updateCourse(courseId, { 
          state,
          stageCount: state.courseData?.course.stages.length,
        });
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [state, courseId]);

  const loadContentSummary = async (sourceCount?: number) => {
    try {
      const hasSources = (sourceCount !== undefined ? sourceCount : state.uploadedFiles.length) > 0;
      
      // If no sources, set default questions immediately
      if (!hasSources) {
        setSuggestedQuestions([
          'How do I upload source materials?',
          'What types of files can I upload?',
          'How do I create a course from my content?',
          'What is a microlearning course?',
          'Can I customize the course style?',
          'How many stages should my course have?',
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
          'How do I upload source materials?',
          'What types of files can I upload?',
          'How do I create a course from my content?',
          'What is a microlearning course?',
          'Can I customize the course style?',
          'How many stages should my course have?',
        ]);
      }
    }
  };

  const analyzeAndAddToChat = async (fileNames: string[]) => {
    try {
      // Check if we already have an analysis or error message for these files
      const errorMessageText = 'I encountered an error analyzing your content';
      const hasExistingError = state.chatHistory.some(
        msg => msg.role === 'assistant' && msg.content.includes(errorMessageText)
      );
      
      // Don't add duplicate error messages
      if (hasExistingError) {
        return;
      }

      // Show loading state
      const loadingMessage: ChatMessage = {
        role: 'assistant',
        content: 'Analyzing your uploaded content...',
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
        const currentHistory = state.chatHistory.filter(
          msg => !msg.content.includes('Analyzing your uploaded content') &&
                 !msg.content.includes(errorMessageText)
        );
        updateState({ chatHistory: currentHistory });
        
        // Only add error message if we don't already have one
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

  const generateContextualOptions = (response: string): string[] => {
    // Generate contextual quick options based on the AI response
    const options: string[] = [];
    
    if (response.toLowerCase().includes('outline') || response.toLowerCase().includes('stage')) {
      options.push('Show me the course outline', 'What stages should I include?', 'Help me refine the structure');
    }
    
    if (response.toLowerCase().includes('objective') || response.toLowerCase().includes('goal')) {
      options.push('What are the learning objectives?', 'Help me define clear goals', 'What should learners achieve?');
    }
    
    if (response.toLowerCase().includes('quiz') || response.toLowerCase().includes('assessment')) {
      options.push('Add interactive quizzes', 'What assessments should I include?', 'Suggest quiz questions');
    }
    
    if (response.toLowerCase().includes('content') || response.toLowerCase().includes('material')) {
      options.push('Generate course content', 'What topics should I cover?', 'Help me organize the content');
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
          id: `url-${Date.now()}`,
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
          id: `text-${Date.now()}`,
          name: data.filename || textFile.filename,
          type: 'text/plain',
          size: textFile.text.length,
          uploadedAt: Date.now(),
          chunks: [],
        });
      }

      if (allUploadedFiles.length > 0) {
        addUploadedFiles(allUploadedFiles);
        
        // Automatically analyze content and add to chat
        await analyzeAndAddToChat(allUploadedFiles.map(f => f.name));
        
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
    // Create a dummy file object for the loader
    const dummyFile = new File([url], url.split('/').pop() || 'webpage.html', { type: 'text/html' });
    setUploadingFiles([dummyFile]);
    setShowUploadLoader(true);
    setShowAddSourcesModal(false);
    
    // Store URL for later processing
    (dummyFile as any).isUrl = true;
    (dummyFile as any).url = url;
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
      
      // Update quick options based on the response
      if (data.quickOptions) {
        setSuggestedQuestions(data.quickOptions);
      } else if (data.response) {
        // Generate contextual quick options from the response
        const contextualOptions = generateContextualOptions(data.response);
        if (contextualOptions.length > 0) {
          setSuggestedQuestions(contextualOptions);
        }
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
      // Step 1: Check prerequisites
      if (state.uploadedFiles.length === 0) {
        throw new Error('Please upload sources first before generating a course');
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
        throw new Error('Failed to generate course outline');
      }

      const outlineData = await outlineResponse.json();
      const outline = outlineData.course;
      
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
        stageCount: outline.stages.length,
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
    const config = state.courseConfig as CourseConfig || {
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
              throw new Error(errorData.error || `Failed to generate content for stage ${i + 1}`);
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
      fetch('/api/course/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseData: fullCourseData,
          config: config,
          courseId: courseId,
        }),
      }).catch((error) => {
        console.error('Failed to save course to output folder:', error);
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
    <div className="h-screen flex flex-col bg-bg1">
      {/* Header */}
      <header className="liquid-glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-accent1 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-text-primary">{course.title}</h1>
          {course.stageCount && (
            <span className="text-sm text-text-secondary">
              {course.stageCount} {course.stageCount === 1 ? 'stage' : 'stages'}
            </span>
          )}
          {state.courseData?.course.stages && state.courseData.course.stages[0]?.content && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">
              Complete
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {state.courseData?.course.stages && state.courseData.course.stages[0]?.content && (
            <Link
              href={`/course/${courseId}/edit`}
              className="px-4 py-2 text-sm bg-bg1 border border-border rounded-lg hover:bg-bg3 transition-colors"
            >
              Edit Course
            </Link>
          )}
          <button className="p-2 hover:bg-bg3 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <SourcesPanel
          sources={state.uploadedFiles}
          isCollapsed={sourcesCollapsed}
          onToggleCollapse={() => setSourcesCollapsed(!sourcesCollapsed)}
          onAddSources={handleAddSources}
          onSelectSource={handleSelectSource}
          selectedSources={selectedSources}
          onSelectAll={handleSelectAll}
        />

        <ChatPanel
          courseTitle={course.title}
          sourceCount={state.uploadedFiles.length}
          messages={state.chatHistory}
          onSendMessage={handleSendMessage}
          isLoading={chatLoading}
          contentSummary={contentSummary}
          suggestedQuestions={suggestedQuestions}
          isCollapsed={chatCollapsed}
          onToggleCollapse={() => setChatCollapsed(!chatCollapsed)}
          onExtractConfig={handleExtractConfigFromChat}
          hasConfig={!!state.courseConfig}
          onGenerateCourse={handleProgressiveCourseGeneration}
          isGenerating={generating === 'course' || generationProgress?.status !== 'idle'}
        />

        <StudioPanel
          isCollapsed={studioCollapsed}
          onToggleCollapse={() => setStudioCollapsed(!studioCollapsed)}
          onGenerateOutput={handleGenerateOutput}
          outputs={studioOutputs}
          generating={generating}
          generationProgress={generationProgress}
          hasSources={state.uploadedFiles.length > 0}
          onViewCourse={(courseData) => {
            // Ensure course data is saved to state
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
        
        {/* Generation Progress Display */}
        {generationProgress.status !== 'idle' && (
          <div className="absolute bottom-4 right-4 w-80 z-40">
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
        )}
      </div>

      {/* Config Extraction Modal */}
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

      {/* Outline Review Modal */}
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

      {/* Course Preview Modal */}
      {showCoursePreview && state.courseData && (
        <CoursePreview
          courseData={state.courseData}
          config={state.courseConfig as CourseConfig}
          courseId={courseId}
          onClose={() => setShowCoursePreview(false)}
          onExport={async () => {
            try {
              const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  courseData: state.courseData,
                  courseConfig: state.courseConfig,
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

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white p-4 rounded-lg shadow-lg z-50 max-w-md`}>
          <div className="flex items-center justify-between">
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-4 p-1 hover:bg-black/20 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 p-1 hover:bg-red-600 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
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
    </div>
  );
}
