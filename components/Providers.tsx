'use client';

import { Suspense } from 'react';
import { CourseCreationProvider } from '@/contexts/CourseCreationContext';
import { CourseProvider } from '@/contexts/CourseContext';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CourseProvider>
        <CourseCreationProvider>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </CourseCreationProvider>
      </CourseProvider>
    </ThemeProvider>
  );
}


