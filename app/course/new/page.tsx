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
  const { state, resetState, updateState } = useCourseCreation();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);

  const handleTemplateSelect = (templateId: TemplateId) => {
    // Update state with template ID in course config
    updateState({
      courseConfig: {
        ...state.courseConfig,
        templateId,
      } as any,
    });
    
    // Create course with template ID stored in config
    const courseId = createCourse('Untitled course', {
      ...state,
      courseConfig: {
        ...state.courseConfig,
        templateId,
      } as any,
    });
    
    // Reset state for new course
    resetState();
    
    // Navigate to the new course workspace
    router.push(`/course/${courseId}`);
  };

  const handleSkipTemplate = () => {
    // Create a new course without template
    const courseId = createCourse('Untitled course', state);
    resetState();
    router.push(`/course/${courseId}`);
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
