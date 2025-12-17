import { CourseData, CourseConfig } from '@/types/course';

export function generateDashboardTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#27ae60';
  const accent2 = config?.accentColor2 || '#16a085';
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const progress = (idx: number) => ((idx + 1) / course.stages.length) * 100;

  const stagesHTML = course.stages.map((stage, idx) => {
    const content = stage.content || { introduction: '', sections: [], summary: '' };
    return `
      <div class="dashboard-stage" data-stage="${stage.id}">
        <div class="stage-metrics">
          <div class="metric">
            <div class="metric-value">${idx + 1}</div>
            <div class="metric-label">Stage</div>
          </div>
          <div class="metric">
            <div class="metric-value">${Math.round(progress(idx))}%</div>
            <div class="metric-label">Progress</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress(idx)}%"></div>
          </div>
        </div>
        <div class="stage-content">
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
      line-height: 1.6;
      color: #2c3e50;
      background: #ecf0f1;
      padding: 0;
    }
    .course-header {
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      color: white;
      padding: 60px 40px;
      margin-bottom: 40px;
    }
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
      align-items: center;
    }
    .course-header h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    .course-header p {
      font-size: 18px;
      opacity: 0.95;
    }
    .header-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .stat-card {
      background: rgba(255,255,255,0.2);
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px 80px;
    }
    .dashboard-stage {
      background: white;
      border-radius: 12px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .stage-metrics {
      display: flex;
      align-items: center;
      gap: 30px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ecf0f1;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 36px;
      font-weight: 700;
      color: ${accent1};
      margin-bottom: 5px;
    }
    .metric-label {
      font-size: 12px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .progress-bar {
      flex: 1;
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${accent1} 0%, ${accent2} 100%);
      transition: width 0.3s ease;
    }
    .stage-header {
      margin-bottom: 25px;
    }
    .stage-header h2 {
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
      line-height: 1.7;
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
      line-height: 1.6;
    }
    .summary {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid ${accent1};
      font-size: 15px;
      color: #555;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="course-header">
    <div class="header-content">
      <div>
        <h1>${escapeHtml(course.title)}</h1>
        <p>${escapeHtml(course.description || '')}</p>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <div class="stat-value">${course.stages.length}</div>
          <div class="stat-label">Stages</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">100%</div>
          <div class="stat-label">Complete</div>
        </div>
      </div>
    </div>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}


