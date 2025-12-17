import { CourseData, CourseConfig } from '@/types/course';

export function generateTimelineTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#3498db';
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
      <div class="timeline-item" data-stage="${stage.id}">
        <div class="timeline-marker">
          <div class="marker-dot"></div>
          ${idx < course.stages.length - 1 ? '<div class="marker-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="step-number">Step ${idx + 1}</span>
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
          </div>
          ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
          ${content.sections?.map(section => `
            <div class="section">
              <h3>${escapeHtml(section.heading)}</h3>
              <p>${escapeHtml(section.content || '')}</p>
              ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('') || ''}
          ${content.summary ? `<div class="summary">${escapeHtml(content.summary)}</div>` : ''}
        </div>
      </div>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      color: #2c3e50;
      background: #ecf0f1;
      padding: 40px 20px;
    }
    .course-header {
      max-width: 900px;
      margin: 0 auto 80px;
      text-align: center;
    }
    .course-header h1 {
      font-size: 42px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .course-header p {
      font-size: 18px;
      color: #7f8c8d;
    }
    .timeline-container {
      max-width: 900px;
      margin: 0 auto;
      position: relative;
      padding-left: 60px;
    }
    .timeline-item {
      position: relative;
      margin-bottom: 60px;
    }
    .timeline-marker {
      position: absolute;
      left: -60px;
      top: 0;
      width: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .marker-dot {
      width: 20px;
      height: 20px;
      background: ${accent1};
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 0 0 3px ${accent1};
      z-index: 2;
    }
    .marker-line {
      width: 2px;
      height: calc(100% + 60px);
      background: ${accent1};
      margin-top: 20px;
      opacity: 0.3;
    }
    .timeline-content {
      background: white;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 3px 15px rgba(0,0,0,0.1);
      border-left: 4px solid ${accent1};
    }
    .timeline-header {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ecf0f1;
    }
    .step-number {
      display: inline-block;
      background: ${accent1};
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 15px;
    }
    .timeline-header h2 {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .objective {
      font-size: 16px;
      color: #7f8c8d;
    }
    .introduction, .section {
      margin-bottom: 25px;
    }
    .section h3 {
      font-size: 20px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 12px;
      margin-top: 25px;
    }
    .section p, .introduction {
      font-size: 16px;
      color: #34495e;
      line-height: 1.8;
      margin-bottom: 15px;
    }
    .section ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    .section li {
      font-size: 16px;
      color: #34495e;
      margin-bottom: 10px;
      line-height: 1.7;
    }
    .summary {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 3px solid ${accent1};
      font-size: 15px;
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
  <div class="timeline-container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}


