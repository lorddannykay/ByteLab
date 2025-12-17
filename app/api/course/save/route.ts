import { NextRequest, NextResponse } from 'next/server';
import { CourseData, CourseConfig } from '@/types/course';
import { saveCourseToOutput } from '@/lib/utils/courseExporter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseData, config, courseId }: { courseData: CourseData; config?: Partial<CourseConfig>; courseId?: string } = body;

    if (!courseData) {
      return NextResponse.json(
        { error: 'Course data is required' },
        { status: 400 }
      );
    }

    // Save course to output folder
    const courseFolderPath = await saveCourseToOutput(courseData, config, courseId);

    return NextResponse.json({
      success: true,
      message: 'Course saved successfully',
      path: courseFolderPath,
    });
  } catch (error) {
    console.error('Error saving course:', error);
    return NextResponse.json(
      {
        error: 'Failed to save course',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

