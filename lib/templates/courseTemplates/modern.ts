import { CourseData, CourseConfig } from '@/types/course';
import { generateInteractiveElement } from '../helpers';

export function generateModernTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#4a90e2';
  const accent2 = config?.accentColor2 || '#50c9c3';
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const stagesHTML = course.stages.map((stage, idx) => {
    const content = stage.content || { introduction: '', sections: [], summary: '' };
    return `
      <section class="stage" data-stage="${stage.id}">
        <div class="stage-header">
          <div class="stage-number">${idx + 1}</div>
          <div class="stage-content">
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
          </div>
        </div>
        ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
        ${content.sections?.map(section => {
      const imageHtml = section.image
        ? (() => {
          const mediaType = section.image.mediaType || 'image';
          const isVideoLoop = mediaType === 'video-loop' || (section.image.loop && section.image.autoplay);

          if (isVideoLoop) {
            return `<div style="margin:20px 0;text-align:center;">
                    <video src="${escapeHtml(section.image.url)}" 
                           alt="${escapeHtml(section.heading || '')}" 
                           style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
                           loop autoplay muted playsinline />
                    <p style="font-size:12px;color:#666;margin-top:8px;font-style:italic;">
                      ${escapeHtml(section.image.attribution)}
                      ${section.image.photographerUrl ? ` — <a href="${escapeHtml(section.image.photographerUrl)}" target="_blank" rel="noopener noreferrer" style="color:${accent1};">View profile</a>` : ''}
                    </p>
                  </div>`;
          } else {
            return `<div style="margin:20px 0;text-align:center;">
                    <img src="${escapeHtml(section.image.url)}" 
                         alt="${escapeHtml(section.heading || '')}" 
                         style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
                         loading="lazy" />
                    <p style="font-size:12px;color:#666;margin-top:8px;font-style:italic;">
                      ${escapeHtml(section.image.attribution)}
                      ${section.image.photographerUrl ? ` — <a href="${escapeHtml(section.image.photographerUrl)}" target="_blank" rel="noopener noreferrer" style="color:${accent1};">View profile</a>` : ''}
                    </p>
                  </div>`;
          }
        })()
        : '';
      return `
          <div class="section">
            <h3>${escapeHtml(section.heading)}</h3>
            ${imageHtml}
            <p>${escapeHtml(section.content || '')}</p>
            ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
          </div>
        `;
    }).join('') || ''}
        ${stage.interactiveElements?.map(element => generateInteractiveElement(element, stage.id)).join('') || ''}
        ${content.summary ? `<div class="summary">${escapeHtml(content.summary)}</div>` : ''}
      </section>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(course.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 0;
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 100px 40px;
      text-align: center;
      margin-bottom: 60px;
    }
    .course-header h1 {
      font-size: 56px;
      font-weight: 800;
      margin-bottom: 20px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .course-header p {
      font-size: 20px;
      opacity: 0.95;
      font-weight: 300;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 40px 80px;
    }
    .stage {
      background: white;
      border-radius: 20px;
      padding: 50px;
      margin-bottom: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .stage:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 50px rgba(0,0,0,0.15);
    }
    .stage-header {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
    }
    .stage-number {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .stage-content h2 {
      font-size: 36px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    .objective {
      font-size: 18px;
      color: #666;
      font-weight: 400;
    }
    .introduction, .section {
      margin-bottom: 30px;
    }
    .section h3 {
      font-size: 28px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 20px;
      margin-top: 40px;
    }
    .section p, .introduction {
      font-size: 18px;
      color: #444;
      line-height: 1.9;
      margin-bottom: 20px;
    }
    .section ul {
      margin: 20px 0;
      padding-left: 30px;
    }
    .section li {
      font-size: 18px;
      color: #444;
      margin-bottom: 12px;
      line-height: 1.8;
    }
    .summary {
      margin-top: 40px;
      padding: 30px;
      background: linear-gradient(135deg, ${accent1}15 0%, ${accent2}15 100%);
      border-radius: 15px;
      border-left: 4px solid ${accent1};
      font-size: 17px;
      color: #555;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1>${escapeHtml(course.title)}</h1>
    <p>${escapeHtml(course.description || '')}</p>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}


