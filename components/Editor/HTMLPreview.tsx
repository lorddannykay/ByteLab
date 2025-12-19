'use client';

import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { useState, useEffect } from 'react';

interface HTMLPreviewProps {
  courseData: CourseData;
  config: CourseConfig;
  key?: number;
}

export default function HTMLPreview({ courseData, config, key }: HTMLPreviewProps) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const template = (config.templateId as TemplateId) || 'modern';
    const generatedHtml = generateCourseHTMLWithTemplate(courseData, config, template);
    setHtml(generatedHtml);
  }, [courseData, config, key]);

  return (
    <div className="h-full w-full bg-bg1">
      {html ? (
        <iframe
          key={key}
          srcDoc={html}
          className="w-full h-full border-0"
          title="Course HTML Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto mb-4"></div>
            <p>Generating HTML preview...</p>
          </div>
        </div>
      )}
    </div>
  );
}

