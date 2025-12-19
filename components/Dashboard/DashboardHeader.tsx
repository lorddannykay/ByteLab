'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

interface DashboardHeaderProps {
  activeTab?: 'all' | 'my' | 'featured' | 'library';
}

export default function DashboardHeader({ activeTab = 'all' }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 neu-header">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 neu-float flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent1 to-accent2 opacity-90" />
                <Image
                  src="/assets/logo/ByteB_black.png"
                  alt="ByteLab Logo"
                  fill
                  sizes="40px"
                  className="object-contain opacity-90 p-1"
                  style={{ mixBlendMode: 'lighten' }}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text-primary group-hover:text-accent1 transition-colors">
                  ByteLab
                </span>
                <span className="text-xs text-text-tertiary hidden md:inline">
                  Microlearning Course Builder
                </span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-2 bg-bg2 rounded-2xl p-1.5">
              <Link
                href="/?tab=all"
                className={`neu-nav-pill text-sm ${activeTab === 'all' ? 'active' : ''}`}
              >
                All
              </Link>
              <Link
                href="/?tab=my"
                className={`neu-nav-pill text-sm ${activeTab === 'my' ? 'active' : ''}`}
              >
                My Courses
              </Link>
              <Link
                href="/?tab=featured"
                className={`neu-nav-pill text-sm ${activeTab === 'featured' ? 'active' : ''}`}
              >
                Featured Courses
              </Link>
              <Link
                href="/?tab=library"
                className={`neu-nav-pill text-sm ${activeTab === 'library' ? 'active' : ''}`}
              >
                Library
              </Link>
              <Link
                href="/analytics"
                className="neu-nav-pill text-sm"
              >
                Analytics
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Create New Button */}
            <Link
              href="/course/new"
              className="neu-accent-button px-6 py-2.5 text-white font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Course
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="neu-icon-button"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
