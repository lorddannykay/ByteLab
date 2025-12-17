import { CourseData, CourseConfig } from '@/types/course';

export function generateAcademicTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#8b5cf6';
  const accent2 = config?.accentColor2 || '#a78bfa';
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
        <div class="stage-wrapper">
          <div class="stage-number">${idx + 1}</div>
          <div class="stage-content">
            <h2 class="stage-title">${escapeHtml(stage.title)}</h2>
            <p class="stage-objective">${escapeHtml(stage.objective)}</p>
            ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
            ${content.sections?.map(section => `
              <div class="section">
                <h3>${escapeHtml(section.heading)}</h3>
                <div class="section-content">
                  <p>${escapeHtml(section.content || '')}</p>
                  ${section.items ? `<ul class="academic-list">${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
                </div>
              </div>
            `).join('') || ''}
            ${content.summary ? `<div class="summary"><h4>Summary</h4><p>${escapeHtml(content.summary)}</p></div>` : ''}
          </div>
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
      font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
      line-height: 1.9;
      color: #2d3748;
      background: #fafafa;
      padding: 0;
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 100px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .course-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.3;
    }
    .course-header h1 {
      font-size: 52px;
      font-weight: 400;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
      letter-spacing: 2px;
    }
    .course-header p {
      font-size: 20px;
      opacity: 0.95;
      position: relative;
      z-index: 1;
      font-weight: 300;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .stage {
      margin-bottom: 60px;
    }
    .stage-wrapper {
      display: flex;
      gap: 30px;
      align-items: flex-start;
    }
    .stage-number {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      background: ${accent1};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .stage-content {
      flex: 1;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      border-top: 3px solid ${accent1};
    }
    .stage-title {
      font-size: 36px;
      color: #1a202c;
      margin-bottom: 16px;
      font-weight: 400;
      letter-spacing: -0.5px;
    }
    .stage-objective {
      font-size: 18px;
      color: #718096;
      margin-bottom: 24px;
      font-style: italic;
      border-left: 3px solid ${accent2};
      padding-left: 16px;
    }
    .introduction {
      background: #f7fafc;
      padding: 24px;
      border-radius: 6px;
      margin-bottom: 28px;
      font-size: 17px;
      line-height: 1.8;
    }
    .section {
      margin-bottom: 32px;
    }
    .section h3 {
      font-size: 26px;
      color: ${accent1};
      margin-bottom: 16px;
      font-weight: 500;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }
    .section-content p {
      font-size: 17px;
      line-height: 1.9;
      color: #4a5568;
      margin-bottom: 16px;
      text-align: justify;
    }
    .academic-list {
      margin-left: 32px;
      margin-top: 16px;
    }
    .academic-list li {
      margin-bottom: 12px;
      line-height: 1.8;
      color: #4a5568;
      font-size: 17px;
    }
    .summary {
      background: #edf2f7;
      border-left: 4px solid ${accent1};
      padding: 24px;
      border-radius: 6px;
      margin-top: 32px;
    }
    .summary h4 {
      font-size: 20px;
      color: ${accent1};
      margin-bottom: 12px;
      font-weight: 600;
    }
    .summary p {
      font-size: 17px;
      line-height: 1.8;
      color: #4a5568;
    }
    @media (max-width: 768px) {
      .course-header { padding: 60px 20px; }
      .course-header h1 { font-size: 32px; }
      .container { padding: 40px 20px; }
      .stage-wrapper { flex-direction: column; }
      .stage-content { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1>${escapeHtml(course.title)}</h1>
    <p>${escapeHtml(course.description || 'Academic Course')}</p>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}



