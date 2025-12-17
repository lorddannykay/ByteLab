import { CourseData, CourseConfig } from '@/types/course';

export function generateStorybookTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#8b4513';
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
      <div class="chapter" data-stage="${stage.id}">
        <div class="chapter-header">
          <span class="chapter-number">Chapter ${idx + 1}</span>
          <h2>${escapeHtml(stage.title)}</h2>
          <p class="objective">${escapeHtml(stage.objective)}</p>
        </div>
        <div class="chapter-content">
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
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.9;
      color: #2c1810;
      background: #f5e6d3;
      padding: 0;
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, #6b3410 100%);
      color: #f5e6d3;
      padding: 100px 40px;
      text-align: center;
      margin-bottom: 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .course-header h1 {
      font-size: 52px;
      font-weight: 400;
      margin-bottom: 20px;
      font-style: italic;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .course-header p {
      font-size: 20px;
      opacity: 0.95;
      font-style: italic;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 40px 80px;
    }
    .chapter {
      background: white;
      padding: 60px 50px;
      margin-bottom: 50px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.15);
      border: 1px solid #d4a574;
      position: relative;
    }
    .chapter::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 5px;
      background: ${accent1};
    }
    .chapter-header {
      text-align: center;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 2px dashed #d4a574;
    }
    .chapter-number {
      display: block;
      font-size: 14px;
      color: ${accent1};
      font-weight: 600;
      letter-spacing: 2px;
      margin-bottom: 15px;
      text-transform: uppercase;
    }
    .chapter-header h2 {
      font-size: 36px;
      font-weight: 400;
      color: #2c1810;
      margin-bottom: 15px;
      font-style: italic;
    }
    .objective {
      font-size: 18px;
      color: #6b4e3d;
      font-style: italic;
    }
    .chapter-content {
      text-align: justify;
    }
    .introduction, .section {
      margin-bottom: 35px;
    }
    .section h3 {
      font-size: 24px;
      font-weight: 400;
      color: ${accent1};
      margin-bottom: 20px;
      margin-top: 40px;
      font-style: italic;
      text-align: left;
    }
    .section p, .introduction {
      font-size: 18px;
      color: #2c1810;
      line-height: 2;
      margin-bottom: 25px;
      text-indent: 30px;
    }
    .section ul {
      margin: 25px 0;
      padding-left: 40px;
      text-align: left;
    }
    .section li {
      font-size: 17px;
      color: #2c1810;
      margin-bottom: 15px;
      line-height: 1.9;
    }
    .summary {
      margin-top: 50px;
      padding: 30px;
      background: #f5e6d3;
      border: 2px solid ${accent1};
      border-radius: 8px;
      font-size: 17px;
      color: #2c1810;
      line-height: 1.9;
      font-style: italic;
      text-align: center;
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


