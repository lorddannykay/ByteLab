'use client';

import { CourseMetadata } from '@/types/courseMetadata';
import Link from 'next/link';

interface FeaturedCoursesProps {
  courses: CourseMetadata[];
}

const categoryColors: Record<string, string> = {
  'Arts & Culture': 'bg-purple-500',
  'Business': 'bg-blue-500',
  'Science': 'bg-green-500',
  'Technology': 'bg-indigo-500',
  'Education': 'bg-yellow-500',
  'Social Science': 'bg-orange-500',
  'Health': 'bg-red-500',
};

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Featured Courses</h2>
        {courses.length > 7 && (
          <Link href="/?tab=featured" className="text-accent1 hover:underline text-sm">
            See all &gt;
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {courses.slice(0, 7).map((course) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className="flex-shrink-0 w-64 bg-bg2 border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group"
          >
            {course.thumbnail ? (
              <div className="w-full h-32 bg-bg3 relative overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-full h-32 ${categoryColors[course.category || ''] || 'bg-gradient-to-r from-accent1 to-accent2'}`} />
            )}
            <div className="p-4">
              {course.category && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-bg3 rounded text-text-secondary">
                    {course.category}
                  </span>
                </div>
              )}
              <h3 className="font-semibold mb-2 text-text-primary line-clamp-2 group-hover:text-accent1 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span>{formatDate(course.lastModified)}</span>
                <span>•</span>
                <span>{course.stageCount || 0} {course.stageCount === 1 ? 'stage' : 'stages'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
