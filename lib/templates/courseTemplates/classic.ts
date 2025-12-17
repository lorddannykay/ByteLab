import { CourseData, CourseConfig } from '@/types/course';

export function generateClassicTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#2c3e50';
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
          <h2>Chapter ${idx + 1}: ${escapeHtml(stage.title)}</h2>
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
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.8;
      color: #2c3e50;
      background: #fafafa;
      padding: 40px;
    }
    .course-header {
      max-width: 800px;
      margin: 0 auto 60px;
      text-align: center;
      padding: 40px 0;
      border-bottom: 3px solid ${accent1};
    }
    .course-header h1 {
      font-size: 36px;
      font-weight: bold;
      color: ${accent1};
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .course-header p {
      font-size: 16px;
      color: #555;
      font-style: italic;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 50px;
      box-shadow: 0 0 20px rgba(0,0,0,0.1);
    }
    .stage {
      margin-bottom: 60px;
      page-break-inside: avoid;
    }
    .stage-header {
      border-bottom: 2px solid ${accent1};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .stage-header h2 {
      font-size: 28px;
      font-weight: bold;
      color: ${accent1};
      margin-bottom: 10px;
    }
    .objective {
      font-size: 16px;
      color: #666;
      font-style: italic;
    }
    .introduction, .section {
      margin-bottom: 30px;
    }
    .section h3 {
      font-size: 22px;
      font-weight: bold;
      color: #34495e;
      margin-bottom: 15px;
      margin-top: 30px;
    }
    .section p, .introduction {
      font-size: 16px;
      color: #2c3e50;
      line-height: 1.9;
      margin-bottom: 15px;
      text-align: justify;
    }
    .section ul {
      margin: 20px 0;
      padding-left: 30px;
    }
    .section li {
      font-size: 16px;
      color: #2c3e50;
      margin-bottom: 10px;
      line-height: 1.8;
    }
    .summary {
      margin-top: 40px;
      padding: 25px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-left: 4px solid ${accent1};
      font-size: 15px;
      color: #495057;
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


