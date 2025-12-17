import archiver from 'archiver';
import { CourseData, CourseConfig } from '@/types/course';
import { generateCourseHTMLWithTemplate, TemplateId } from '@/lib/templates/templateSelector';
import { generateSCORM12Manifest, generateSCORMAPIWrapper, generateSCORMCommonJS } from './manifestGenerator';

export async function createSCORMPackage(
  courseData: CourseData,
  config: CourseConfig
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    // Generate manifest
    const manifest = generateSCORM12Manifest(courseData, config);
    archive.append(manifest, { name: 'imsmanifest.xml' });

    // Generate SCORM API wrapper
    const scormAPI = generateSCORMAPIWrapper();
    archive.append(scormAPI, { name: 'scorm_api.js' });

    // Generate common JS
    const commonJS = generateSCORMCommonJS();
    archive.append(commonJS, { name: 'common.js' });

    // Generate course HTML with SCORM integration using template from config
    const templateId = (config.templateId as TemplateId) || 'modern';
    const courseHTML = generateCourseHTMLWithTemplate(courseData, config, templateId);
    // Inject SCORM scripts into HTML
    const scormHTML = courseHTML.replace(
      '</head>',
      `<script src="scorm_api.js"></script>
<script src="common.js"></script>
</head>`
    );
    archive.append(scormHTML, { name: 'index.html' });

    // Generate individual stage HTML files
    courseData.course.stages.forEach((stage) => {
      const stageHTML = generateStageHTML(stage, courseData, config);
      archive.append(stageHTML, { name: `stage-${stage.id}.html` });
    });

    archive.finalize();
  });
}

function generateStageHTML(
  stage: any,
  courseData: CourseData,
  config: CourseConfig
): string {
  // Simplified stage HTML - in production, you'd want full rendering
  const content = stage.content || {};
  const sections = content.sections || [];
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${stage.title}</title>
  <script src="../scorm_api.js"></script>
  <script src="../common.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: ${config.accentColor1}; }
    .section { margin: 20px 0; }
  </style>
</head>
<body>
  <h1>${stage.title}</h1>
  <p><strong>Objective:</strong> ${stage.objective}</p>
  
  ${content.introduction ? `<div class="section"><p>${content.introduction}</p></div>` : ''}
  
  ${sections.map((section: any) => `
    <div class="section">
      <h2>${section.heading}</h2>
      <p>${section.content}</p>
    </div>
  `).join('')}
  
  ${content.summary ? `<div class="section"><p><strong>Summary:</strong> ${content.summary}</p></div>` : ''}
  
  <script>
    // Track progress when stage is viewed
    if (window.SCORMCommon) {
      const stageIndex = ${courseData.course.stages.findIndex(s => s.id === stage.id) + 1};
      const totalStages = ${courseData.course.stages.length};
      window.SCORMCommon.trackProgress(stageIndex, totalStages);
    }
  </script>
</body>
</html>`;

  return html;
}

