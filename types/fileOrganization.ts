import { UploadedFile } from './courseCreation';

export type SourceType = 'file' | 'url' | 'text' | 'drive';

export interface SourceFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  color?: string;
}

export interface OrganizedFile extends UploadedFile {
  folderId: string | null;
  sourceType: SourceType;
  tags?: string[];
}

export interface FileOrganization {
  folders: SourceFolder[];
  files: OrganizedFile[];
  expandedFolders: Set<string>;
}



