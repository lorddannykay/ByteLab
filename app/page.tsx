'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import FeaturedCourses from '@/components/Dashboard/FeaturedCourses';
import RecentCourses from '@/components/Dashboard/RecentCourses';
import MediaLibrary from '@/components/Dashboard/MediaLibrary';
import CourseCardSkeleton from '@/components/Dashboard/CourseCardSkeleton';
import { useCourses } from '@/contexts/CourseContext';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const { featuredCourses, recentCourses, deleteCourse, isLoading } = useCourses();

  const activeTab = tab === 'my' ? 'my' : tab === 'featured' ? 'featured' : tab === 'library' ? 'library' : 'all';

  return (
    <div className="min-h-screen bg-bg1">
      <DashboardHeader activeTab={activeTab} />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'all' && (
          <>
            {featuredCourses.length > 0 && <FeaturedCourses courses={featuredCourses} />}
            <RecentCourses courses={recentCourses} onDeleteCourse={deleteCourse} />
            {featuredCourses.length === 0 && recentCourses.length === 0 && (
              <div className="neu-empty-state max-w-2xl mx-auto mt-8">
                {/* Decorative floating elements */}
                <div className="flex justify-center gap-4 mb-8">
                  <div className="neu-float w-12 h-12 flex items-center justify-center text-accent1 animate-bounce" style={{ animationDelay: '0ms' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="neu-float w-12 h-12 flex items-center justify-center text-accent2 animate-bounce" style={{ animationDelay: '150ms' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="neu-float w-12 h-12 flex items-center justify-center text-accent1 animate-bounce" style={{ animationDelay: '300ms' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-4 text-text-primary">
                  Create Your First Microlearning Course
                </h2>
                <p className="text-lg text-text-secondary mb-10 max-w-lg mx-auto leading-relaxed">
                  ByteLab helps you create engaging, bite-sized learning experiences. Upload your content, 
                  chat with AI to plan your course structure, and generate interactive microlearning courses 
                  with quizzes, videos, and more.
                </p>
                
                <Link
                  href="/course/new"
                  className="neu-accent-button inline-flex items-center gap-3 px-10 py-4 text-white font-semibold text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First Course
                </Link>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-10 border-t border-border">
                  <div className="text-center">
                    <div className="neu-icon-button w-12 h-12 mx-auto mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">Upload Content</h3>
                    <p className="text-sm text-text-tertiary">PDFs, docs, or paste text</p>
                  </div>
                  <div className="text-center">
                    <div className="neu-icon-button w-12 h-12 mx-auto mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">Chat with AI</h3>
                    <p className="text-sm text-text-tertiary">Plan your course structure</p>
                  </div>
                  <div className="text-center">
                    <div className="neu-icon-button w-12 h-12 mx-auto mb-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">Generate Course</h3>
                    <p className="text-sm text-text-tertiary">Interactive content in minutes</p>
                  </div>
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
        {activeTab === 'library' && (
          <MediaLibrary />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg1 flex items-center justify-center">
        {/* Neumorphic loading spinner */}
        <div className="neu-card p-8 flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-bg3"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent1 animate-spin"></div>
          </div>
          <span className="text-text-secondary">Loading...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
