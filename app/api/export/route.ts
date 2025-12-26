import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { CourseData } from '@/types/course';
import { generateCourseHTML } from '@/lib/generators/courseHtml';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { generateVideoHTML } from '@/lib/generators/videoHtml';
import { generatePodcastHTML } from '@/lib/generators/podcastHtml';
import { createTTSProvider, getDefaultVoices } from '@/lib/tts/factory';
import { DEFAULT_EDGE_VOICES } from '@/lib/tts/types';
import { saveCourseToOutput, createCourseZip } from '@/lib/utils/courseExporter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseData, config, courseId }: { courseData: CourseData; config?: any; courseId?: string } = body;
    
    // Save course to output folder (async, don't wait)
    saveCourseToOutput(courseData, config, courseId).catch((error) => {
      console.error('Failed to save course to output folder (non-blocking):', error);
    });

    // Create a stream for the ZIP file
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Collect chunks
    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Handle errors
    archive.on('error', (err) => {
      throw err;
    });

    // Get course title from config first, then courseData, with fallback
    let courseTitle = config?.title || courseData.course.title || 'Untitled Course';
    
    // If title is still "Untitled Course", try to get a better name
    if (courseTitle === 'Untitled Course' || courseTitle === 'Untitled course') {
      // Try to infer from topic or description
      if (config?.topic && config.topic !== 'General') {
        courseTitle = config.topic;
      } else if (courseData.course.description && courseData.course.description !== 'A microlearning course') {
        // Use first few words of description
        const descWords = courseData.course.description.split(' ').slice(0, 5).join(' ');
        courseTitle = descWords.length > 50 ? descWords.substring(0, 50) : descWords;
      }
    }
    
    // Sanitize title for folder/file names
    const safeTitle = courseTitle
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .toLowerCase()
      .trim()
      .substring(0, 50) // Limit length
      || 'untitled-course';

    // Get TTS provider from config (defaults to EdgeTTS)
    const ttsConfig = config?.tts || {};
    const ttsProvider = createTTSProvider(ttsConfig);
    const defaultVoices = getDefaultVoices(ttsConfig.provider || 'edge');
    const voices = ttsConfig.voices || defaultVoices;

    // Generate audio files for video scenes
    if (courseData.videoScenes && courseData.videoScenes.length > 0) {
      const audioDir = 'audio';
      for (let i = 0; i < courseData.videoScenes.length; i++) {
        const scene = courseData.videoScenes[i];
        if (scene.text && scene.text.trim()) {
          try {
            const audioBuffer = await ttsProvider.generateAudio(scene.text, voices.video);
            archive.append(audioBuffer, { name: `${audioDir}/scene-${scene.id.toString().padStart(4, '0')}.mp3` });
          } catch (error) {
            console.warn(`Failed to generate audio for video scene ${scene.id}:`, error);
            // Continue without audio for this scene
          }
        }
      }
    }

    // Generate audio files for podcast dialogue
    if (courseData.podcastDialogue && courseData.podcastDialogue.length > 0) {
      const audioDir = 'audio';
      for (let i = 0; i < courseData.podcastDialogue.length; i++) {
        const segment = courseData.podcastDialogue[i];
        if (segment.text && segment.text.trim()) {
          try {
            const voice = segment.speaker === 'host' ? voices.podcastHost : voices.podcastExpert;
            const audioBuffer = await ttsProvider.generateAudio(segment.text, voice);
            archive.append(audioBuffer, { name: `${audioDir}/podcast-segment-${i.toString().padStart(4, '0')}.mp3` });
          } catch (error) {
            console.warn(`Failed to generate audio for podcast segment ${i}:`, error);
            // Continue without audio for this segment
          }
        }
      }
    }

    // Generate HTML files with config for colors
    // Use template from config if available, otherwise use default birb-classic template
    const templateId = (config?.templateId as TemplateId) || 'birb-classic';
    const courseHTML = generateCourseHTMLWithTemplate(courseData, config || {}, templateId);
    const videoHTML = generateVideoHTML(courseData, config || {});
    const podcastHTML = generatePodcastHTML(courseData, config || {});

    // Add HTML files to archive
    archive.append(courseHTML, { name: `${safeTitle}.html` });
    archive.append(videoHTML, { name: `${safeTitle}-video.html` });
    archive.append(podcastHTML, { name: `${safeTitle}-podcast.html` });

    // Add course data JSON
    archive.append(JSON.stringify(courseData, null, 2), {
      name: 'course-data.json',
    });

    // Add README with instructions
    const readmeContent = `# ${courseTitle}

## Course Files

- \`${safeTitle}.html\` - Interactive course (main)
- \`${safeTitle}-video.html\` - Video version with kinetic typography
- \`${safeTitle}-podcast.html\` - Podcast version with dialogue
- \`course-data.json\` - Complete course data in JSON format

## Audio Files

Audio files are located in the \`audio/\` directory:
- Video scene audio: \`scene-XXXX.mp3\`
- Podcast dialogue segments: \`podcast-segment-XXXX.mp3\`

## Usage

1. Extract all files from this ZIP
2. Open \`${safeTitle}.html\` in a web browser
3. The course is fully self-contained and works offline

## Features

- Interactive quizzes and exercises
- Progress tracking
- Dark mode support
- Responsive design
- Audio narration (video and podcast versions)

Generated by ByteLab - AI-Powered Microlearning Course Builder
`;

    archive.append(readmeContent, { name: 'README.md' });

    // Finalize the archive
    archive.finalize();

    // Wait for all chunks and return response
    return new Promise<NextResponse>((resolve, reject) => {
      archive.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          resolve(
            new NextResponse(buffer, {
              headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${safeTitle}-course.zip"`,
              },
            })
          );
        } catch (err) {
          reject(err);
        }
      });

      archive.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export course',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

