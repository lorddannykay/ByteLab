import { CourseData, CourseConfig } from '@/types/course';

export function generateDarkModeTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#00d4ff';
  const accent2 = config?.accentColor2 || '#5b9bd5';
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
          <div class="stage-indicator">
            <span class="stage-num">${idx + 1}</span>
          </div>
          <div class="stage-info">
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
          </div>
        </div>
        <div class="stage-body">
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
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #e0e0e0;
      background: #0d1117;
      padding: 40px 20px;
    }
    .course-header {
      max-width: 1000px;
      margin: 0 auto 60px;
      text-align: center;
      padding: 60px 40px;
      background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
      border: 1px solid #30363d;
      border-radius: 12px;
    }
    .course-header h1 {
      font-size: 42px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 20px;
      text-shadow: 0 0 20px ${accent1}40;
    }
    .course-header p {
      font-size: 18px;
      color: #8b949e;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .stage {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 30px;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .stage:hover {
      border-color: ${accent1};
      box-shadow: 0 0 20px ${accent1}20;
    }
    .stage-header {
      display: flex;
      align-items: center;
      gap: 25px;
      margin-bottom: 35px;
      padding-bottom: 25px;
      border-bottom: 1px solid #30363d;
    }
    .stage-indicator {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 15px ${accent1}40;
    }
    .stage-num {
      font-size: 20px;
      font-weight: 700;
      color: #0d1117;
    }
    .stage-info h2 {
      font-size: 28px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 10px;
    }
    .objective {
      font-size: 16px;
      color: #8b949e;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .introduction, .section {
      margin-bottom: 30px;
    }
    .section h3 {
      font-size: 22px;
      font-weight: 600;
      color: ${accent2};
      margin-bottom: 15px;
      margin-top: 35px;
    }
    .section p, .introduction {
      font-size: 16px;
      color: #c9d1d9;
      line-height: 1.9;
      margin-bottom: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .section ul {
      margin: 20px 0;
      padding-left: 30px;
    }
    .section li {
      font-size: 16px;
      color: #c9d1d9;
      margin-bottom: 12px;
      line-height: 1.8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .section code {
      background: #21262d;
      color: ${accent1};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 14px;
      border: 1px solid #30363d;
    }
    .summary {
      margin-top: 40px;
      padding: 25px;
      background: #0d1117;
      border: 1px solid ${accent1}40;
      border-left: 3px solid ${accent1};
      border-radius: 8px;
      font-size: 15px;
      color: #8b949e;
      line-height: 1.8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    ::selection {
      background: ${accent1}40;
      color: ${accent1};
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


