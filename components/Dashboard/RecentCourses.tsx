'use client';

import { CourseMetadata } from '@/types/courseMetadata';
import CourseCard from './CourseCard';

interface RecentCoursesProps {
  courses: CourseMetadata[];
  onDeleteCourse?: (id: string) => void;
}

export default function RecentCourses({ courses, onDeleteCourse }: RecentCoursesProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-text-primary">Recent Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CourseCard isCreateNew onDelete={onDeleteCourse} course={{} as CourseMetadata} />
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} onDelete={onDeleteCourse} />
        ))}
      </div>
    </div>
  );
}
