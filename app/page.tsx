'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import FeaturedCourses from '@/components/Dashboard/FeaturedCourses';
import RecentCourses from '@/components/Dashboard/RecentCourses';
import { useCourses } from '@/contexts/CourseContext';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const { featuredCourses, recentCourses, deleteCourse } = useCourses();

  const activeTab = tab === 'my' ? 'my' : tab === 'featured' ? 'featured' : 'all';

  return (
    <div className="min-h-screen bg-bg1">
      <DashboardHeader activeTab={activeTab} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'all' && (
          <>
            {featuredCourses.length > 0 && <FeaturedCourses courses={featuredCourses} />}
            <RecentCourses courses={recentCourses} onDeleteCourse={deleteCourse} />
            {featuredCourses.length === 0 && recentCourses.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4 text-text-primary">Create Your First Microlearning Course</h2>
                  <p className="text-lg text-text-secondary mb-8">
                    ByteLab helps you create engaging, bite-sized learning experiences. Upload your content, 
                    chat with AI to plan your course structure, and generate interactive microlearning courses 
                    with quizzes, videos, and more.
                  </p>
                  <Link
                    href="/course/new"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
                  >
                    + Create Your First Course
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === 'featured' && (
          <FeaturedCourses courses={featuredCourses} />
        )}
        {activeTab === 'my' && (
          <RecentCourses courses={recentCourses} onDeleteCourse={deleteCourse} />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

