import onboarding from './onboarding.json';
import compliance from './compliance.json';
import productTraining from './productTraining.json';
import salesEnablement from './salesEnablement.json';
import customerEducation from './customerEducation.json';
import technicalTutorial from './technicalTutorial.json';
import softSkills from './softSkills.json';
import safetyTraining from './safetyTraining.json';
import processDocumentation from './processDocumentation.json';
import quickReference from './quickReference.json';

export interface CourseTemplate {
  title: string;
  description: string;
  topic: string;
  objectives: string[];
  targetAudience: string;
  contentStyle: 'formal' | 'conversational' | 'technical';
  stageCount: number;
  estimatedDuration: string;
  accentColor1: string;
  accentColor2: string;
  includeVideo: boolean;
  includePodcast: boolean;
}

export const templates: Record<string, CourseTemplate> = {
  onboarding,
  compliance,
  productTraining,
  salesEnablement,
  customerEducation,
  technicalTutorial,
  softSkills,
  safetyTraining,
  processDocumentation,
  quickReference,
};

export const templateList = [
  { id: 'onboarding', name: 'Employee Onboarding', ...onboarding },
  { id: 'compliance', name: 'Compliance 101', ...compliance },
  { id: 'productTraining', name: 'Product Training', ...productTraining },
  { id: 'salesEnablement', name: 'Sales Enablement', ...salesEnablement },
  { id: 'customerEducation', name: 'Customer Education', ...customerEducation },
  { id: 'technicalTutorial', name: 'Technical Tutorial', ...technicalTutorial },
  { id: 'softSkills', name: 'Soft Skills Development', ...softSkills },
  { id: 'safetyTraining', name: 'Safety Training', ...safetyTraining },
  { id: 'processDocumentation', name: 'Process Documentation', ...processDocumentation },
  { id: 'quickReference', name: 'Quick Reference Guide', ...quickReference },
];

