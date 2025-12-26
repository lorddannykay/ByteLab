import { CourseData, CourseConfig } from '@/types/course';
import { generateFullCourseHTML } from './courseTemplate';
import { generateDimensionTemplate } from './courseTemplates/dimensionTemplate';
import { generateEditorialTemplate } from './courseTemplates/editorialTemplate';

export type TemplateId = 'birb-classic' | 'dimension' | 'editorial';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  bestFor: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'birb-classic',
    name: 'Birb Classic',
    description: 'Original birb template with sidebar navigation and grid layout',
    preview: 'Classic design, sidebar navigation, grid layout',
    bestFor: 'All course types',
  },
  {
    id: 'dimension',
    name: 'Dimension',
    description: 'Modal-style navigation with article-based content display',
    preview: 'Modern modal navigation, article-based layout',
    bestFor: 'Structured courses with clear progression',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-style layout with sidebar navigation and article cards',
    preview: 'Sidebar navigation, article cards, magazine layout',
    bestFor: 'Content-rich courses with multiple stages',
  },
];

export function generateCourseHTMLWithTemplate(
  courseData: CourseData,
  config: Partial<CourseConfig>,
  templateId: TemplateId = 'birb-classic'
): string {
  // Handle legacy 'birb' template ID for backward compatibility
  if (templateId === 'birb-classic' || (config?.templateId as string) === 'birb' || templateId === 'birb') {
    return generateFullCourseHTML(courseData, config);
  }
  
  // Handle dimension template
  if (templateId === 'dimension') {
    return generateDimensionTemplate(courseData, config);
  }
  
  // Handle editorial template
  if (templateId === 'editorial') {
    return generateEditorialTemplate(courseData, config);
  }
  
  // Default to birb-classic for any unrecognized template IDs
  return generateFullCourseHTML(courseData, config);
}


