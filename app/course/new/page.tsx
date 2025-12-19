'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourses } from '@/contexts/CourseContext';
import { useCourseCreation } from '@/contexts/CourseCreationContext';
import TemplateSelector from '@/components/Templates/TemplateSelector';
import { TemplateId } from '@/lib/templates/templateSelector';

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse } = useCourses();
  const { state, resetState, updateState, clearState } = useCourseCreation();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);

  const handleTemplateSelect = (templateId: TemplateId) => {
    // Clear any existing state first to ensure fresh start
    clearState();
    
    // Wait a tick for state to clear, then create course with fresh state
    setTimeout(() => {
      // Get fresh state after clearing
      const freshState = {
        uploadedFiles: [],
        totalChunks: 0,
        chatHistory: [],
        chatSessions: [],
        currentChatSessionId: null,
        aiInsights: null,
        courseConfig: { templateId } as any,
        courseData: null,
        generationProgress: null,
        mediaAssets: [],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        currentStage: 1,
        contextSessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Create course with fresh state
      const courseId = createCourse('Untitled course', freshState);
      
      // Navigate to the new course workspace
      router.push(`/course/${courseId}`);
    }, 0);
  };

  const handleSkipTemplate = () => {
    // Clear any existing state first to ensure fresh start
    clearState();
    
    // Wait a tick for state to clear, then create course with fresh state
    setTimeout(() => {
      // Get fresh state after clearing
      const freshState = {
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
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        currentStage: 1,
        contextSessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      
      // Create course with fresh state
      const courseId = createCourse('Untitled course', freshState);
      
      // Navigate to the new course workspace
      router.push(`/course/${courseId}`);
    }, 0);
  };

  return (
    <TemplateSelector
      selectedTemplate={selectedTemplate}
      onSelectTemplate={(templateId) => {
        // Just update the selected template when clicking a card
        setSelectedTemplate(templateId);
      }}
      onApply={(templateId) => {
        // Create course when "Apply Template" is clicked
        handleTemplateSelect(templateId);
      }}
      onClose={handleSkipTemplate}
    />
  );
}
