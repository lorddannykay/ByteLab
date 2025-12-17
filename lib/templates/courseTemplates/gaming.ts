import { CourseData, CourseConfig } from '@/types/course';

export function generateGamingTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#e67e22';
  const accent2 = config?.accentColor2 || '#f39c12';
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
    const level = idx + 1;
    return `
      <div class="level" data-stage="${stage.id}">
        <div class="level-header">
          <div class="level-badge">
            <span class="level-number">Lv. ${level}</span>
            <div class="badge-icon">🎮</div>
          </div>
          <div class="level-info">
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
            <div class="xp-bar">
              <div class="xp-fill" style="width: ${((level / course.stages.length) * 100)}%"></div>
              <span class="xp-text">+${level * 100} XP</span>
            </div>
          </div>
        </div>
        <div class="level-content">
          ${content.introduction ? `<div class="introduction">${escapeHtml(content.introduction)}</div>` : ''}
          ${content.sections?.map(section => `
            <div class="section">
              <div class="section-badge">💡</div>
              <div class="section-content">
                <h3>${escapeHtml(section.heading)}</h3>
                <p>${escapeHtml(section.content || '')}</p>
                ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
              </div>
            </div>
          `).join('') || ''}
          ${content.summary ? `
            <div class="achievement">
              <div class="achievement-icon">🏆</div>
              <div class="achievement-content">
                <h3>Achievement Unlocked!</h3>
                <p>${escapeHtml(content.summary)}</p>
              </div>
            </div>
          ` : ''}
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .course-header {
      max-width: 1000px;
      margin: 0 auto 60px;
      text-align: center;
      background: rgba(255,255,255,0.95);
      padding: 50px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .course-header h1 {
      font-size: 48px;
      font-weight: 800;
      color: ${accent1};
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .course-header p {
      font-size: 18px;
      color: #666;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .level {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border: 3px solid ${accent1};
      position: relative;
      overflow: hidden;
    }
    .level::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, ${accent1} 0%, ${accent2} 100%);
    }
    .level-header {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
      padding-bottom: 25px;
      border-bottom: 2px dashed #ecf0f1;
    }
    .level-badge {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .level-number {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .badge-icon {
      font-size: 32px;
    }
    .level-info {
      flex: 1;
    }
    .level-info h2 {
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 10px;
    }
    .objective {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 15px;
    }
    .xp-bar {
      position: relative;
      height: 30px;
      background: #ecf0f1;
      border-radius: 15px;
      overflow: hidden;
    }
    .xp-fill {
      height: 100%;
      background: linear-gradient(90deg, ${accent1} 0%, ${accent2} 100%);
      transition: width 0.3s ease;
    }
    .xp-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 700;
      color: white;
      text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .introduction, .section {
      margin-bottom: 25px;
    }
    .section {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid ${accent1};
    }
    .section-badge {
      font-size: 32px;
      flex-shrink: 0;
    }
    .section-content h3 {
      font-size: 22px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 12px;
    }
    .section-content p {
      font-size: 16px;
      color: #34495e;
      line-height: 1.7;
      margin-bottom: 15px;
    }
    .section-content ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    .section-content li {
      font-size: 16px;
      color: #34495e;
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .achievement {
      margin-top: 30px;
      padding: 25px;
      background: linear-gradient(135deg, ${accent1}15 0%, ${accent2}15 100%);
      border-radius: 15px;
      border: 2px solid ${accent1};
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .achievement-icon {
      font-size: 48px;
      flex-shrink: 0;
    }
    .achievement-content h3 {
      font-size: 20px;
      font-weight: 700;
      color: ${accent1};
      margin-bottom: 8px;
    }
    .achievement-content p {
      font-size: 16px;
      color: #555;
      line-height: 1.7;
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


