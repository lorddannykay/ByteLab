import { CourseData, CourseConfig } from '@/types/course';

export function generateCardBasedTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#9b59b6';
  const accent2 = config?.accentColor2 || '#e74c3c';
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
    const sections = content.sections || [];
    return `
      <div class="stage-section" data-stage="${stage.id}">
        <div class="stage-card-header">
          <div class="stage-number">${idx + 1}</div>
          <div>
            <h2>${escapeHtml(stage.title)}</h2>
            <p class="objective">${escapeHtml(stage.objective)}</p>
          </div>
        </div>
        ${content.introduction ? `
          <div class="card introduction-card">
            <p>${escapeHtml(content.introduction)}</p>
          </div>
        ` : ''}
        <div class="cards-grid">
          ${sections.map(section => `
            <div class="card">
              <h3>${escapeHtml(section.heading)}</h3>
              <p>${escapeHtml(section.content || '')}</p>
              ${section.items ? `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('')}
        </div>
        ${content.summary ? `
          <div class="card summary-card">
            <h3>Summary</h3>
            <p>${escapeHtml(content.summary)}</p>
          </div>
        ` : ''}
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
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .course-header {
      max-width: 1200px;
      margin: 0 auto 60px;
      text-align: center;
      color: white;
    }
    .course-header h1 {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 15px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .course-header p {
      font-size: 20px;
      opacity: 0.95;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .stage-section {
      margin-bottom: 60px;
    }
    .stage-card-header {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .stage-number {
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .stage-card-header h2 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .objective {
      font-size: 16px;
      color: #666;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 25px;
    }
    .card {
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .card h3 {
      font-size: 22px;
      font-weight: 600;
      color: ${accent1};
      margin-bottom: 15px;
    }
    .card p {
      font-size: 16px;
      color: #444;
      line-height: 1.7;
      margin-bottom: 15px;
    }
    .card ul {
      margin: 15px 0;
      padding-left: 25px;
    }
    .card li {
      font-size: 15px;
      color: #555;
      margin-bottom: 8px;
      line-height: 1.6;
    }
    .introduction-card, .summary-card {
      background: linear-gradient(135deg, ${accent1}15 0%, ${accent2}15 100%);
      border-left: 4px solid ${accent1};
    }
    .summary-card h3 {
      color: ${accent1};
      margin-bottom: 12px;
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


