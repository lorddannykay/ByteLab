/**
 * Template registry - maps template IDs to generator functions
 * Allows dynamic template selection based on template ID
 */

import { CourseData, CourseConfig } from '@/types/course';
import { generateEcoLumeTemplate } from './ecoLumeTemplate';
import { generateAquaNovaTemplate } from './aquaNovaTemplate';
import { generateNeuralPortfolioTemplate } from './neuralPortfolioTemplate';
import { generateInnerPeaceTemplate } from './innerPeaceTemplate';
// Import other generators as they are created

export type TemplateGenerator = (
  courseData: CourseData,
  config?: Partial<CourseConfig>
) => string;

export const templateGenerators: Record<string, TemplateGenerator> = {
  'eco-lume': generateEcoLumeTemplate,
  'aqua-nova': generateAquaNovaTemplate,
  'neural-portfolio': generateNeuralPortfolioTemplate,
  'inner-peace': generateInnerPeaceTemplate,
  // Legacy IDs for backward compatibility
  '2145_eco_lume': generateEcoLumeTemplate,
  '2138_aqua_nova': generateAquaNovaTemplate,
  '2139_neural_portfolio': generateNeuralPortfolioTemplate,
  '2143_inner_peace': generateInnerPeaceTemplate,
};

/**
 * Get a template generator by template ID
 */
export function getTemplateGenerator(templateId: string): TemplateGenerator | undefined {
  return templateGenerators[templateId];
}

/**
 * Generate course HTML using a template ID
 */
export function generateCourseWithTemplate(
  templateId: string,
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const generator = getTemplateGenerator(templateId);
  if (!generator) {
    throw new Error(`Template generator not found for template ID: ${templateId}`);
  }
  return generator(courseData, config);
}
