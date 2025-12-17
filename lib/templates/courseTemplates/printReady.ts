import { CourseData, CourseConfig } from '@/types/course';

export function generatePrintReadyTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#000000';
  const accent2 = config?.accentColor2 || '#333333';
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
        <div class="page-break">
          <div class="stage-header-print">
            <div class="stage-number-print">${idx + 1}</div>
            <div>
              <h2>${escapeHtml(stage.title)}</h2>
              <p class="objective-print">${escapeHtml(stage.objective)}</p>
            </div>
          </div>
          ${content.introduction ? `<div class="introduction-print">${escapeHtml(content.introduction)}</div>` : ''}
          ${content.sections?.map(section => `
            <div class="section-print">
              <h3>${escapeHtml(section.heading)}</h3>
              <p>${escapeHtml(section.content || '')}</p>
              ${section.items ? `<ul class="print-list">${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('') || ''}
          ${content.summary ? `<div class="summary-print"><strong>Summary:</strong> ${escapeHtml(content.summary)}</div>` : ''}
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
    @media print {
      @page {
        size: A4;
        margin: 2cm;
      }
      .page-break {
        page-break-after: always;
      }
      .no-print { display: none; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      color: #000;
      background: white;
      padding: 0;
      font-size: 12pt;
    }
    .course-header {
      background: white;
      color: ${accent1};
      padding: 40px 0;
      text-align: center;
      border-bottom: 3px solid ${accent1};
      margin-bottom: 40px;
    }
    .course-header h1 {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 12px;
      color: ${accent1};
    }
    .course-header p {
      font-size: 14pt;
      color: #666;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 0 20mm;
    }
    .stage {
      margin-bottom: 30mm;
    }
    .page-break {
      padding-bottom: 20mm;
    }
    .stage-header-print {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${accent1};
    }
    .stage-number-print {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      background: ${accent1};
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18pt;
      font-weight: 700;
    }
    .stage-header-print h2 {
      font-size: 20pt;
      color: ${accent1};
      margin-bottom: 8px;
      font-weight: 700;
    }
    .objective-print {
      font-size: 11pt;
      color: #666;
      font-style: italic;
    }
    .introduction-print {
      background: #f5f5f5;
      padding: 12px;
      border-left: 4px solid ${accent1};
      margin-bottom: 16px;
      font-size: 11pt;
    }
    .section-print {
      margin-bottom: 20px;
    }
    .section-print h3 {
      font-size: 14pt;
      color: ${accent1};
      margin-bottom: 8px;
      font-weight: 700;
      page-break-after: avoid;
    }
    .section-print p {
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      margin-bottom: 10px;
      text-align: justify;
    }
    .print-list {
      margin-left: 20px;
      margin-top: 8px;
      margin-bottom: 12px;
    }
    .print-list li {
      margin-bottom: 6px;
      line-height: 1.5;
      font-size: 11pt;
      page-break-inside: avoid;
    }
    .summary-print {
      background: #f9f9f9;
      border: 1px solid ${accent1};
      padding: 12px;
      margin-top: 16px;
      font-size: 11pt;
      page-break-inside: avoid;
    }
    .summary-print strong {
      color: ${accent1};
      display: block;
      margin-bottom: 6px;
    }
    @media screen {
      body {
        background: #f5f5f5;
        padding: 20px;
      }
      .container {
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
        padding: 40px;
        margin: 20px auto;
      }
    }
  </style>
</head>
<body>
  <div class="course-header">
    <h1>${escapeHtml(course.title)}</h1>
    <p>${escapeHtml(course.description || 'Course Material')}</p>
  </div>
  <div class="container">
    ${stagesHTML}
  </div>
</body>
</html>`;
}



