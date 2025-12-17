'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { useState } from 'react';

interface DashboardHeaderProps {
  activeTab?: 'all' | 'my' | 'featured';
}

export default function DashboardHeader({ activeTab = 'all' }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 liquid-glass-header">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-accent1 to-accent2">
                {/* Logo Image with gradient overlay effect */}
                <div className="relative w-full h-full">
                  <Image
                    src="/assets/logo/ByteB_black.png"
                    alt="ByteLab Logo"
                    fill
                    className="object-contain opacity-90"
                    style={{ mixBlendMode: 'lighten' }}
                    priority
                  />
                </div>
              </div>
              <span className="text-xl font-bold text-text-primary">ByteLab</span>
              <span className="text-sm text-text-secondary hidden md:inline">Microlearning Course Builder</span>
            </Link>
            <nav className="flex items-center gap-1">
            <Link
              href="/?tab=all"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-bg3 text-text-primary underline decoration-2 underline-offset-4'
                  : 'text-text-secondary hover:bg-bg2'
              }`}
            >
              All
            </Link>
            <Link
              href="/?tab=my"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-bg3 text-text-primary underline decoration-2 underline-offset-4'
                  : 'text-text-secondary hover:bg-bg2'
              }`}
            >
              My Courses
            </Link>
            <Link
              href="/?tab=featured"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'featured'
                  ? 'bg-bg3 text-text-primary underline decoration-2 underline-offset-4'
                  : 'text-text-secondary hover:bg-bg2'
              }`}
            >
              Featured Courses
            </Link>
            <Link
              href="/analytics"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-text-secondary hover:bg-bg2"
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
              className="px-6 py-2 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              + Create Course
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-bg2 transition-colors"
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
