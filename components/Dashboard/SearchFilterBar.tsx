'use client';

import { useState, useRef, useEffect } from 'react';
import { CourseMetadata, CourseFolder } from '@/types/courseMetadata';

export type SortOption = 
  | 'date-created-desc'
  | 'date-created-asc'
  | 'date-modified-desc'
  | 'date-modified-asc'
  | 'title-asc'
  | 'title-desc'
  | 'stages-desc'
  | 'stages-asc';

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedCategory: string | null;
  selectedFolder: string | null;
  sortOption: SortOption;
}

interface SearchFilterBarProps {
  courses: CourseMetadata[];
  folders: CourseFolder[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function SearchFilterBar({
  courses,
  folders,
  filters,
  onFiltersChange,
}: SearchFilterBarProps) {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Get all unique tags from courses
  const allTags = Array.from(
    new Set(
      courses
        .flatMap(course => course.tags || [])
        .filter(tag => tag && tag.trim().length > 0)
    )
  ).sort();

  // Get all unique categories
  const allCategories = Array.from(
    new Set(
      courses
        .map(course => course.category)
        .filter((cat): cat is string => !!cat)
    )
  ).sort();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTagDropdown(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        folderDropdownRef.current &&
        !folderDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFolderDropdown(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    updateFilters({ selectedTags: newTags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedTags: [],
      selectedCategory: null,
      selectedFolder: null,
      sortOption: 'date-modified-desc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery.length > 0 ||
    filters.selectedTags.length > 0 ||
    filters.selectedCategory !== null ||
    filters.selectedFolder !== null ||
    filters.sortOption !== 'date-modified-desc';

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-modified-desc', label: 'Last Modified (Newest)' },
    { value: 'date-modified-asc', label: 'Last Modified (Oldest)' },
    { value: 'date-created-desc', label: 'Date Created (Newest)' },
    { value: 'date-created-asc', label: 'Date Created (Oldest)' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'stages-desc', label: 'Most Stages' },
    { value: 'stages-asc', label: 'Fewest Stages' },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="w-full px-4 py-2 pl-10 bg-bg2 border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent1/50 focus:border-accent1"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tags Filter */}
          <div className="relative" ref={tagDropdownRef}>
            <button
              onClick={() => {
                setShowTagDropdown(!showTagDropdown);
                setShowCategoryDropdown(false);
                setShowFolderDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                filters.selectedTags.length > 0
                  ? 'bg-accent1/20 text-accent1 border border-accent1/30'
                  : 'bg-bg2 text-text-primary border border-border hover:bg-bg3'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tags
              {filters.selectedTags.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-accent1 text-white rounded-full">
                  {filters.selectedTags.length}
                </span>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTagDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-bg1 border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center gap-2 p-2 hover:bg-bg3 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="w-4 h-4 text-accent1 rounded border-border focus:ring-accent1"
                        />
                        <span className="text-sm text-text-primary">{tag}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-text-tertiary p-2">No tags available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowTagDropdown(false);
                setShowFolderDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                filters.selectedCategory
                  ? 'bg-accent1/20 text-accent1 border border-accent1/30'
                  : 'bg-bg2 text-text-primary border border-border hover:bg-bg3'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Category
              {filters.selectedCategory && (
                <span className="px-1.5 py-0.5 text-xs bg-accent1 text-white rounded-full">
                  1
                </span>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-bg1 border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => {
                      updateFilters({ selectedCategory: null });
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-bg3 ${
                      !filters.selectedCategory
                        ? 'bg-accent1/10 text-accent1'
                        : 'text-text-primary'
                    }`}
                  >
                    All Categories
                  </button>
                  {allCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        updateFilters({ selectedCategory: category });
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-bg3 ${
                        filters.selectedCategory === category
                          ? 'bg-accent1/10 text-accent1'
                          : 'text-text-primary'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Folder Filter */}
          <div className="relative" ref={folderDropdownRef}>
            <button
              onClick={() => {
                setShowFolderDropdown(!showFolderDropdown);
                setShowTagDropdown(false);
                setShowCategoryDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                filters.selectedFolder
                  ? 'bg-accent1/20 text-accent1 border border-accent1/30'
                  : 'bg-bg2 text-text-primary border border-border hover:bg-bg3'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Folder
              {filters.selectedFolder && (
                <span className="px-1.5 py-0.5 text-xs bg-accent1 text-white rounded-full">
                  1
                </span>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showFolderDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-bg1 border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => {
                      updateFilters({ selectedFolder: null });
                      setShowFolderDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-bg3 ${
                      !filters.selectedFolder
                        ? 'bg-accent1/10 text-accent1'
                        : 'text-text-primary'
                    }`}
                  >
                    All Folders
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        updateFilters({ selectedFolder: folder.id });
                        setShowFolderDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-bg3 flex items-center gap-2 ${
                        filters.selectedFolder === folder.id
                          ? 'bg-accent1/10 text-accent1'
                          : 'text-text-primary'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowTagDropdown(false);
                setShowCategoryDropdown(false);
                setShowFolderDropdown(false);
              }}
              className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 bg-bg2 text-text-primary border border-border hover:bg-bg3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
              <svg
                className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-bg1 border border-border rounded-lg shadow-xl z-50">
                <div className="p-2 space-y-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilters({ sortOption: option.value });
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-bg3 ${
                        filters.sortOption === option.value
                          ? 'bg-accent1/10 text-accent1'
                          : 'text-text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-sm rounded-lg transition-colors bg-bg2 text-text-primary border border-border hover:bg-bg3 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-tertiary">Active filters:</span>
          {filters.searchQuery && (
            <span className="px-2 py-1 text-xs bg-bg2 border border-border rounded text-text-primary">
              Search: &quot;{filters.searchQuery}&quot;
            </span>
          )}
          {filters.selectedTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-accent1/20 text-accent1 border border-accent1/30 rounded flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:text-accent1/70"
              >
                ×
              </button>
            </span>
          ))}
          {filters.selectedCategory && (
            <span className="px-2 py-1 text-xs bg-accent1/20 text-accent1 border border-accent1/30 rounded flex items-center gap-1">
              Category: {filters.selectedCategory}
              <button
                onClick={() => updateFilters({ selectedCategory: null })}
                className="hover:text-accent1/70"
              >
                ×
              </button>
            </span>
          )}
          {filters.selectedFolder && (
            <span className="px-2 py-1 text-xs bg-accent1/20 text-accent1 border border-accent1/30 rounded flex items-center gap-1">
              Folder: {folders.find(f => f.id === filters.selectedFolder)?.name || 'Unknown'}
              <button
                onClick={() => updateFilters({ selectedFolder: null })}
                className="hover:text-accent1/70"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

