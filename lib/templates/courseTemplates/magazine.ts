import { CourseData, CourseConfig } from '@/types/course';

export function generateMagazineTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#e74c3c';
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
      <article class="stage" data-stage="${stage.id}">
        <header class="stage-header">
          <span class="stage-label">Stage ${idx + 1}</span>
          <h2>${escapeHtml(stage.title)}</h2>
          <p class="objective">${escapeHtml(stage.objective)}</p>
        </header>
        <div class="content-columns">
          <div class="column">
            ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
            ${content.sections?.slice(0, Math.ceil((content.sections?.length || 0) / 2)).map(section => `
              <div class="section">
                <h3>${escapeHtml(section.heading)}</h3>
                <p>${escapeHtml(section.content || '')}</p>
                ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
              </div>
            `).join('') || ''}
          </div>
          <div class="column">
            ${content.sections?.slice(Math.ceil((content.sections?.length || 0) / 2)).map(section => `
              <div class="section">
                <h3>${escapeHtml(section.heading)}</h3>
                <p>${escapeHtml(section.content || '')}</p>
                ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
              </div>
            `).join('') || ''}
            ${content.summary ? `<div class="summary">${escapeHtml(content.summary)}</div>` : ''}
          </div>
        </div>
      </article>
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
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #f5f5f5;
      padding: 0;
    }
    .course-header {
      background: ${accent1};
      color: white;
      padding: 80px 40px;
      text-align: center;
      margin-bottom: 60px;
    }
    .course-header h1 {
      font-size: 64px;
      font-weight: 700;
      margin-bottom: 20px;
      letter-spacing: -1px;
      text-transform: uppercase;
    }
    .course-header p {
      font-size: 20px;
      opacity: 0.9;
      font-style: italic;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px 80px;
    }
    .stage {
      background: white;
      padding: 60px;
      margin-bottom: 60px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .stage-header {
      border-bottom: 3px solid ${accent1};
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    .stage-label {
      display: inline-block;
      background: ${accent1};
      color: white;
      padding: 5px 15px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    .stage-header h2 {
      font-size: 42px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 15px;
      line-height: 1.2;
    }
    .objective {
      font-size: 18px;
      color: #666;
      font-style: italic;
    }
    .content-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
    }
    .introduction, .section {
      margin-bottom: 30px;
    }
    .section h3 {
      font-size: 24px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 15px;
      margin-top: 30px;
    }
    .section p, .introduction {
      font-size: 17px;
      color: #333;
      line-height: 1.9;
      margin-bottom: 20px;
      text-align: justify;
    }
    .section ul {
      margin: 20px 0;
      padding-left: 25px;
    }
    .section li {
      font-size: 17px;
      color: #333;
      margin-bottom: 12px;
      line-height: 1.8;
    }
    .summary {
      margin-top: 40px;
      padding: 25px;
      background: #f8f8f8;
      border-left: 4px solid ${accent1};
      font-size: 16px;
      color: #555;
      line-height: 1.8;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .content-columns {
        grid-template-columns: 1fr;
        gap: 30px;
      }
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


