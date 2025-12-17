import { CourseData, CourseConfig } from '@/types/course';

export function generateMinimalTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#4a90e2';
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.8;
      color: #333;
      background: #ffffff;
      padding: 60px 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    .course-header {
      margin-bottom: 80px;
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 1px solid #e0e0e0;
    }
    .course-header h1 {
      font-size: 42px;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    .course-header p {
      font-size: 18px;
      color: #666;
      font-weight: 300;
    }
    .stage {
      margin-bottom: 100px;
      padding: 0;
    }
    .stage-header {
      margin-bottom: 50px;
    }
    .stage-header h2 {
      font-size: 32px;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }
    .objective {
      font-size: 16px;
      color: #666;
      font-weight: 300;
    }
    .introduction, .section {
      margin-bottom: 40px;
    }
    .section h3 {
      font-size: 24px;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 16px;
      margin-top: 40px;
    }
    .section p, .introduction {
      font-size: 17px;
      color: #444;
      line-height: 1.9;
      margin-bottom: 20px;
    }
    .section ul {
      margin: 20px 0;
      padding-left: 24px;
    }
    .section li {
      font-size: 17px;
      color: #444;
      margin-bottom: 12px;
      line-height: 1.8;
    }
    .summary {
      margin-top: 50px;
      padding: 30px;
      background: #f8f8f8;
      border-left: 3px solid ${accent1};
      font-size: 16px;
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
  ${stagesHTML}
</body>
</html>`;
}


