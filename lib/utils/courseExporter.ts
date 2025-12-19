import { promises as fs } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { generateVideoHTML } from '@/lib/generators/videoHtml';
import { generatePodcastHTML } from '@/lib/generators/podcastHtml';
import { createTTSProvider, getDefaultVoices } from '@/lib/tts/factory';

const OUTPUT_DIR = join(process.cwd(), 'output', 'courses');

/**
 * Ensure the output directory exists
 */
async function ensureOutputDir(): Promise<string> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  return OUTPUT_DIR;
}

/**
 * Save course to output folder with all assets
 */
export async function saveCourseToOutput(
  courseData: CourseData,
  config?: Partial<CourseConfig>,
  courseId?: string
): Promise<string> {
  try {
    const outputDir = await ensureOutputDir();
    
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
    
    // Create unique folder name with timestamp
    const timestamp = Date.now();
    const timestampStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-').substring(0, 19); // Format: 2025-01-15T10-30-45
    const courseFolderName = courseId 
      ? `${safeTitle}-${timestampStr}-${courseId}`
      : `${safeTitle}-${timestampStr}`;
    const courseFolderPath = join(outputDir, courseFolderName);
    
    // Create course folder
    await fs.mkdir(courseFolderPath, { recursive: true });
    
    // Get TTS provider from config (defaults to EdgeTTS)
    const ttsConfig = config?.ttsConfig || {};
    const ttsProvider = createTTSProvider(ttsConfig);
    const defaultVoices = getDefaultVoices(ttsConfig.provider || 'edge');
    const voices = ttsConfig.voices || defaultVoices;
    
    // Generate HTML files
    const templateId = (config?.templateId as TemplateId) || 'birb';
    const courseHTML = generateCourseHTMLWithTemplate(courseData, config || {}, templateId);
    const videoHTML = generateVideoHTML(courseData, config || {});
    const podcastHTML = generatePodcastHTML(courseData, config || {});
    
    // Save HTML files
    await fs.writeFile(join(courseFolderPath, `${safeTitle}.html`), courseHTML, 'utf-8');
    await fs.writeFile(join(courseFolderPath, `${safeTitle}-video.html`), videoHTML, 'utf-8');
    await fs.writeFile(join(courseFolderPath, `${safeTitle}-podcast.html`), podcastHTML, 'utf-8');
    
    // Create audio directory
    const audioDir = join(courseFolderPath, 'audio');
    await fs.mkdir(audioDir, { recursive: true });
    
    // Generate video scenes from course stages if empty
    let videoScenes = courseData.videoScenes || [];
    if (videoScenes.length === 0 && config?.includeVideo !== false) {
      // Generate from course stages
      videoScenes = [{
        id: 0,
        text: courseData.course.title,
        duration: 4000,
      }];
      
      courseData.course.stages?.forEach((stage) => {
        // Stage title scene
        videoScenes.push({
          id: videoScenes.length,
          text: stage.title,
          duration: 4000,
        });
        
        // Stage objective scene
        if (stage.objective) {
          videoScenes.push({
            id: videoScenes.length,
            text: stage.objective,
            duration: 5000,
          });
        }
        
        // Key points scenes
        stage.keyPoints?.forEach((point) => {
          videoScenes.push({
            id: videoScenes.length,
            text: point,
            duration: 4000,
          });
        });
        
        // Content summary scene
        if (stage.content?.summary) {
          videoScenes.push({
            id: videoScenes.length,
            text: stage.content.summary,
            duration: 5000,
          });
        }
      });
    }
    
    // Generate and save audio files for video scenes
    if (videoScenes.length > 0) {
      for (let i = 0; i < videoScenes.length; i++) {
        const scene = videoScenes[i];
        if (scene.text && scene.text.trim()) {
          try {
            const audioBuffer = await ttsProvider.generateAudio(scene.text, voices.video);
            const audioPath = join(audioDir, `scene-${scene.id.toString().padStart(4, '0')}.mp3`);
            await fs.writeFile(audioPath, audioBuffer);
          } catch (error) {
            console.warn(`Failed to generate audio for video scene ${scene.id}:`, error);
          }
        }
      }
    }
    
    // Generate podcast dialogue from course stages if empty
    let podcastDialogue = courseData.podcastDialogue || [];
    if (podcastDialogue.length === 0 && config?.includePodcast !== false) {
      // Introduction from host
      podcastDialogue.push({
        speaker: 'host' as const,
        text: `Welcome to ${courseData.course.title}. ${courseData.course.description || "Let's dive in!"}`,
      });
      
      // Dialogue from stages
      courseData.course.stages?.forEach((stage) => {
        // Host introduces the stage
        podcastDialogue.push({
          speaker: 'host' as const,
          text: `In this stage, we'll explore: ${stage.title}. ${stage.objective || ''}`,
        });
        
        // Expert explains key points
        stage.keyPoints?.forEach((point) => {
          podcastDialogue.push({
            speaker: 'expert' as const,
            text: point,
          });
        });
        
        // Host summarizes
        if (stage.content?.summary) {
          podcastDialogue.push({
            speaker: 'host' as const,
            text: `To summarize: ${stage.content.summary}`,
          });
        }
      });
      
      // Closing from host
      podcastDialogue.push({
        speaker: 'host' as const,
        text: 'That concludes our course. Thank you for listening!',
      });
    }
    
    // Generate and save audio files for podcast dialogue
    if (podcastDialogue.length > 0) {
      for (let i = 0; i < podcastDialogue.length; i++) {
        const segment = podcastDialogue[i];
        if (segment.text && segment.text.trim()) {
          try {
            const voice = segment.speaker === 'host' ? voices.podcastHost : voices.podcastExpert;
            const audioBuffer = await ttsProvider.generateAudio(segment.text, voice);
            const audioPath = join(audioDir, `podcast-segment-${i.toString().padStart(4, '0')}.mp3`);
            await fs.writeFile(audioPath, audioBuffer);
          } catch (error) {
            console.warn(`Failed to generate audio for podcast segment ${i}:`, error);
          }
        }
      }
    }
    
    // Save course data JSON
    await fs.writeFile(
      join(courseFolderPath, 'course-data.json'),
      JSON.stringify(courseData, null, 2),
      'utf-8'
    );
    
    // Save config JSON
    if (config) {
      await fs.writeFile(
        join(courseFolderPath, 'course-config.json'),
        JSON.stringify(config, null, 2),
        'utf-8'
      );
    }
    
    // Create README
    const readmeContent = `# ${courseTitle}

## Course Files

- \`${safeTitle}.html\` - Interactive course (main)
- \`${safeTitle}-video.html\` - Video version with kinetic typography
- \`${safeTitle}-podcast.html\` - Podcast version with dialogue
- \`course-data.json\` - Complete course data in JSON format
- \`course-config.json\` - Course configuration

## Audio Files

Audio files are located in the \`audio/\` directory:
- Video scene audio: \`scene-XXXX.mp3\`
- Podcast dialogue segments: \`podcast-segment-XXXX.mp3\`

## Usage

1. Open \`${safeTitle}.html\` in a web browser
2. The course is fully self-contained and works offline
3. All assets are included in this folder

## Features

- Interactive quizzes and exercises
- Progress tracking
- Dark mode support
- Responsive design
- Audio narration (video and podcast versions)

Generated by ByteLab - AI-Powered Microlearning Course Builder
Generated on: ${new Date().toISOString()}
Course ID: ${courseId || 'N/A'}
`;
    
    await fs.writeFile(join(courseFolderPath, 'README.md'), readmeContent, 'utf-8');
    
    console.log(`Course saved to: ${courseFolderPath}`);
    return courseFolderPath;
  } catch (error) {
    console.error('Error saving course to output folder:', error);
    throw error;
  }
}

/**
 * Create a ZIP file of the course folder
 */
export async function createCourseZip(courseFolderPath: string): Promise<string> {
  try {
    const { createWriteStream } = await import('fs');
    const zipPath = `${courseFolderPath}.zip`;
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`ZIP created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve(zipPath);
      });
      
      archive.on('error', (err) => {
        reject(err);
      });
      
      archive.pipe(output);
      archive.directory(courseFolderPath, false);
      archive.finalize();
    });
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw error;
  }
}

