import { CourseCreationState } from './courseCreation';

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  icon?: string;
  createdAt: number;
  lastModified: number;
  sourceCount: number;
  stageCount?: number;
  isFeatured?: boolean;
  state: CourseCreationState; // Full state of the course
}

export interface CourseMetadata {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  icon?: string;
  createdAt: number;
  lastModified: number;
  sourceCount: number;
  stageCount?: number;
  isFeatured?: boolean;
}
