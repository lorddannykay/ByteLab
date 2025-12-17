import { CourseData, CourseConfig } from '@/types/course';

export function generateCorporateTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#1e40af';
  const accent2 = config?.accentColor2 || '#3b82f6';
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
        <div class="stage-card">
          <div class="stage-header">
            <div class="stage-badge">Module ${idx + 1}</div>
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
          </div>
          ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
          ${content.sections?.map(section => `
            <div class="section">
              <h3>${escapeHtml(section.heading)}</h3>
              <p>${escapeHtml(section.content || '')}</p>
              ${section.items ? `<ul class="bullet-list">${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('') || ''}
          ${content.summary ? `<div class="summary-box"><strong>Key Takeaways:</strong> ${escapeHtml(content.summary)}</div>` : ''}
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
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.8;
      color: #2c3e50;
      background: #f8f9fa;
      padding: 0;
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 80px 40px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .course-header h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    .course-header p {
      font-size: 18px;
      opacity: 0.95;
      font-weight: 300;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 60px 40px;
    }
    .stage {
      margin-bottom: 40px;
    }
    .stage-card {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-left: 4px solid ${accent1};
    }
    .stage-header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }
    .stage-badge {
      display: inline-block;
      background: ${accent1};
      color: white;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .stage-header h2 {
      font-size: 32px;
      color: #1a1a1a;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .objective {
      font-size: 16px;
      color: #6c757d;
      font-style: italic;
    }
    .introduction {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 24px;
      border-left: 3px solid ${accent2};
    }
    .section {
      margin-bottom: 28px;
    }
    .section h3 {
      font-size: 22px;
      color: ${accent1};
      margin-bottom: 12px;
      font-weight: 600;
    }
    .section p {
      font-size: 16px;
      line-height: 1.8;
      color: #495057;
      margin-bottom: 12px;
    }
    .bullet-list {
      margin-left: 24px;
      margin-top: 12px;
    }
    .bullet-list li {
      margin-bottom: 8px;
      line-height: 1.7;
      color: #495057;
    }
    .summary-box {
      background: #e7f3ff;
      border: 1px solid ${accent2};
      border-radius: 6px;
      padding: 20px;
      margin-top: 24px;
    }
    .summary-box strong {
      color: ${accent1};
      display: block;
      margin-bottom: 8px;
    }
    @media (max-width: 768px) {
      .course-header { padding: 60px 20px; }
      .course-header h1 { font-size: 36px; }
      .container { padding: 40px 20px; }
      .stage-card { padding: 24px; }
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1>${escapeHtml(course.title)}</h1>
    <p>${escapeHtml(course.description || 'Professional Training Course')}</p>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}



