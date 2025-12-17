import { NextRequest, NextResponse } from 'next/server';
import { CourseData, CourseConfig } from '@/types/course';
import { createSCORMPackage } from '@/lib/scorm/scormPackager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseData, config }: { courseData: CourseData; config?: CourseConfig } = body;

    if (!courseData || !config) {
      return NextResponse.json(
        { error: 'Course data and config are required' },
        { status: 400 }
      );
    }

    // Create SCORM package
    const scormPackage = await createSCORMPackage(courseData, config as CourseConfig);

    const safeTitle = (courseData.course.title || 'course').replace(/[^a-z0-9]/gi, '-').toLowerCase();

    return new NextResponse(scormPackage, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeTitle}-scorm.zip"`,
      },
    });
  } catch (error) {
    console.error('SCORM export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export SCORM package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

