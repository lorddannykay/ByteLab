import { CourseData, CourseConfig } from '@/types/course';
import { generateFullCourseHTML } from '../templates/courseTemplate';

export function generateCourseHTML(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  // Use the full rich template
  return generateFullCourseHTML(courseData, config);
}

