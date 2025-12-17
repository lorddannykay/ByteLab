import { CourseData, CourseConfig } from '@/types/course';

export function generateCreativeTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#ec4899';
  const accent2 = config?.accentColor2 || '#f59e0b';
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
        <div class="stage-container">
          <div class="stage-header-creative">
            <div class="stage-icon">${idx + 1}</div>
            <div>
              <h2>${escapeHtml(stage.title)}</h2>
              <p class="objective">${escapeHtml(stage.objective)}</p>
            </div>
          </div>
          ${content.introduction ? `<div class="introduction-creative">${escapeHtml(content.introduction)}</div>` : ''}
          ${content.sections?.map((section, secIdx) => `
            <div class="section-creative ${secIdx % 2 === 0 ? 'section-left' : 'section-right'}">
              <h3>${escapeHtml(section.heading)}</h3>
              <p>${escapeHtml(section.content || '')}</p>
              ${section.items ? `<ul class="creative-list">${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('') || ''}
          ${content.summary ? `<div class="summary-creative"><span class="summary-label">Key Points</span>${escapeHtml(content.summary)}</div>` : ''}
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
      font-family: 'Comic Sans MS', 'Trebuchet MS', sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
      padding: 0;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 120px 40px;
      text-align: center;
      position: relative;
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
    }
    .course-header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-top: 30px solid ${accent2};
    }
    .course-header h1 {
      font-size: 64px;
      font-weight: 900;
      margin-bottom: 24px;
      text-shadow: 4px 4px 0px rgba(0,0,0,0.2);
      transform: rotate(-2deg);
      animation: bounce 2s ease infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: rotate(-2deg) translateY(0); }
      50% { transform: rotate(-2deg) translateY(-10px); }
    }
    .course-header p {
      font-size: 24px;
      opacity: 0.95;
      font-weight: 600;
      text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 80px 40px;
    }
    .stage {
      margin-bottom: 60px;
    }
    .stage-container {
      background: white;
      border-radius: 24px;
      padding: 50px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      transition: transform 0.3s;
    }
    .stage-container:hover {
      transform: scale(1.02);
    }
    .stage-header-creative {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 4px dashed ${accent1};
    }
    .stage-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 900;
      box-shadow: 0 8px 20px rgba(236, 72, 153, 0.4);
      animation: pulse 2s ease infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    .stage-header-creative h2 {
      font-size: 40px;
      color: ${accent1};
      margin-bottom: 8px;
      font-weight: 900;
    }
    .objective {
      font-size: 18px;
      color: #6b7280;
      font-weight: 600;
    }
    .introduction-creative {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 3px solid ${accent2};
      font-size: 18px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
    .section-creative {
      margin-bottom: 32px;
      padding: 24px;
      border-radius: 16px;
      position: relative;
    }
    .section-left {
      background: linear-gradient(135deg, #ddd6fe 0%, #e9d5ff 100%);
      border-left: 6px solid ${accent1};
    }
    .section-right {
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
      border-right: 6px solid ${accent2};
    }
    .section-creative h3 {
      font-size: 28px;
      color: ${accent1};
      margin-bottom: 16px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .section-creative p {
      font-size: 18px;
      line-height: 1.9;
      color: #374151;
      margin-bottom: 16px;
      font-weight: 500;
    }
    .creative-list {
      margin-left: 32px;
      margin-top: 16px;
    }
    .creative-list li {
      margin-bottom: 12px;
      line-height: 1.8;
      color: #4b5563;
      font-size: 17px;
      font-weight: 500;
      position: relative;
    }
    .creative-list li::before {
      content: '✨';
      margin-right: 8px;
    }
    .summary-creative {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 28px;
      border-radius: 20px;
      margin-top: 32px;
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
    }
    .summary-label {
      display: block;
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
      opacity: 0.9;
    }
    .summary-creative {
      font-size: 18px;
      line-height: 1.8;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      .course-header { padding: 80px 20px; clip-path: polygon(0 0, 100% 0, 100% 90%, 0 100%); }
      .course-header h1 { font-size: 40px; }
      .container { padding: 40px 20px; }
      .stage-container { padding: 30px; transform: none !important; }
      .stage-header-creative { flex-direction: column; text-align: center; }
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1>${escapeHtml(course.title)}</h1>
    <p>${escapeHtml(course.description || 'Creative Learning Experience')}</p>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}

