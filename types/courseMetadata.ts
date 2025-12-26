import { CourseCreationState } from './courseCreation';

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  icon?: string;
  createdAt: number;
  lastModified: number;
  sourceCount: number;
  stageCount?: number;
  isFeatured?: boolean;
  state: CourseCreationState; // Full state of the course
}

export interface CourseFolder {
  id: string;
  name: string;
  color?: string;
  parentId?: string | null; // ID of parent folder for subfolders
  createdAt: number;
  lastModified: number;
}

export interface CourseMetadata {
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
  icon?: string;
  createdAt: number;
  lastModified: number;
  sourceCount: number;
  stageCount?: number;
  isFeatured?: boolean;
  folderId?: string; // ID of folder this course belongs to
}
