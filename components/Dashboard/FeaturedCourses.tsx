'use client';

import { CourseMetadata } from '@/types/courseMetadata';
import Link from 'next/link';

interface FeaturedCoursesProps {
  courses: CourseMetadata[];
}

const categoryGradients: Record<string, string> = {
  'Arts & Culture': 'from-purple-500 to-pink-500',
  'Business': 'from-blue-500 to-cyan-500',
  'Science': 'from-green-500 to-emerald-500',
  'Technology': 'from-indigo-500 to-violet-500',
  'Education': 'from-yellow-500 to-orange-500',
  'Social Science': 'from-orange-500 to-red-500',
  'Health': 'from-red-500 to-rose-500',
};

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-10">
        <h2 className="neu-section-title">Featured Courses</h2>
        {courses.length > 7 && (
          <Link 
            href="/?tab=featured" 
            className="text-accent1 hover:text-accent2 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            See all 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-4 neu-scroll">
        {courses.slice(0, 7).map((course) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className="flex-shrink-0 w-72 neu-card overflow-hidden group"
          >
            {/* Thumbnail / Gradient header */}
            {course.thumbnail ? (
              <div className="w-full h-36 relative overflow-hidden">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg1/80 to-transparent" />
              </div>
            ) : (
              <div className={`w-full h-36 bg-gradient-to-br ${categoryGradients[course.category || ''] || 'from-accent1 to-accent2'} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-bg1/60 to-transparent" />
              </div>
            )}
            
            {/* Content */}
            <div className="p-5">
              {course.category && (
                <div className="mb-3">
                  <span className="neu-badge">
                    {course.category}
                  </span>
                </div>
              )}
              
              <h3 className="font-semibold mb-3 text-text-primary line-clamp-2 group-hover:text-accent1 transition-colors duration-300">
                {course.title}
              </h3>
              
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(course.lastModified)}
                </span>
                <span className="text-text-tertiary">•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  {course.stageCount || 0} stages
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
