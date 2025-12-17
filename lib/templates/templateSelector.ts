import { CourseData, CourseConfig } from '@/types/course';
import { generateMinimalTemplate } from './courseTemplates/minimal';
import { generateModernTemplate } from './courseTemplates/modern';
import { generateClassicTemplate } from './courseTemplates/classic';
import { generateMagazineTemplate } from './courseTemplates/magazine';
import { generateCardBasedTemplate } from './courseTemplates/cardBased';
import { generateTimelineTemplate } from './courseTemplates/timeline';
import { generateStorybookTemplate } from './courseTemplates/storybook';
import { generateDashboardTemplate } from './courseTemplates/dashboard';
import { generateGamingTemplate } from './courseTemplates/gaming';
import { generateDarkModeTemplate } from './courseTemplates/darkMode';
import { generateCorporateTemplate } from './courseTemplates/corporate';
import { generateAcademicTemplate } from './courseTemplates/academic';
import { generateCreativeTemplate } from './courseTemplates/creative';
import { generatePrintReadyTemplate } from './courseTemplates/printReady';

export type TemplateId = 
  | 'minimal' 
  | 'modern' 
  | 'classic' 
  | 'magazine' 
  | 'card-based' 
  | 'timeline' 
  | 'storybook' 
  | 'dashboard' 
  | 'gaming' 
  | 'dark-mode'
  | 'corporate'
  | 'academic'
  | 'creative'
  | 'print-ready';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  preview: string;
  bestFor: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design with lots of whitespace',
    preview: 'Clean lines, ample spacing, professional',
    bestFor: 'Professional training',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold colors, gradients, and smooth animations',
    preview: 'Vibrant gradients, dynamic animations',
    bestFor: 'Tech courses',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional, formal layout with structured content',
    preview: 'Formal structure, traditional design',
    bestFor: 'Corporate training',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Editorial style with column layouts',
    preview: 'Editorial columns, rich typography',
    bestFor: 'Content-heavy courses',
  },
  {
    id: 'card-based',
    name: 'Card Based',
    description: 'Pinterest-style card layout for visual learning',
    preview: 'Card grid, visual focus',
    bestFor: 'Visual learning',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological flow with visual timeline',
    preview: 'Timeline view, sequential flow',
    bestFor: 'Process courses',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Narrative style with storytelling elements',
    preview: 'Storytelling, narrative flow',
    bestFor: 'Soft skills',
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Data-driven design with metrics and analytics',
    preview: 'Data visualization, metrics',
    bestFor: 'Analytics courses',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Gamified experience with badges and levels',
    preview: 'Gamification, badges, levels',
    bestFor: 'Engagement-focused',
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Dark theme optimized for extended viewing',
    preview: 'Dark theme, reduced eye strain',
    bestFor: 'Developer courses',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business theme with structured layout',
    preview: 'Business professional, structured design',
    bestFor: 'Corporate training',
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'University-style layout with scholarly design',
    preview: 'Academic style, scholarly presentation',
    bestFor: 'Educational courses',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Artistic, colorful design with dynamic elements',
    preview: 'Colorful, artistic, dynamic',
    bestFor: 'Creative courses',
  },
  {
    id: 'print-ready',
    name: 'Print Ready',
    description: 'Optimized for PDF export and printing',
    preview: 'Print-optimized, clean layout',
    bestFor: 'Printable materials',
  },
];

export function generateCourseHTMLWithTemplate(
  courseData: CourseData,
  config: Partial<CourseConfig>,
  templateId: TemplateId = 'modern'
): string {
  // Use birb template (generateFullCourseHTML) as default if no template specified
  if (!templateId || templateId === 'modern') {
    const { generateFullCourseHTML } = require('./courseTemplate');
    return generateFullCourseHTML(courseData, config);
  }
  switch (templateId) {
    case 'minimal':
      return generateMinimalTemplate(courseData, config);
    case 'modern':
      return generateModernTemplate(courseData, config);
    case 'classic':
      return generateClassicTemplate(courseData, config);
    case 'magazine':
      return generateMagazineTemplate(courseData, config);
    case 'card-based':
      return generateCardBasedTemplate(courseData, config);
    case 'timeline':
      return generateTimelineTemplate(courseData, config);
    case 'storybook':
      return generateStorybookTemplate(courseData, config);
    case 'dashboard':
      return generateDashboardTemplate(courseData, config);
    case 'gaming':
      return generateGamingTemplate(courseData, config);
    case 'dark-mode':
      return generateDarkModeTemplate(courseData, config);
    case 'corporate':
      return generateCorporateTemplate(courseData, config);
    case 'academic':
      return generateAcademicTemplate(courseData, config);
    case 'creative':
      return generateCreativeTemplate(courseData, config);
    case 'print-ready':
      return generatePrintReadyTemplate(courseData, config);
    default:
      return generateModernTemplate(courseData, config);
  }
}


