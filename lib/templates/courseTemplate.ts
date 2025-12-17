import { CourseData, CourseConfig } from '@/types/course';

export function generateFullCourseHTML(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const accent1 = config?.accentColor1 || '#4a90e2';
  const accent2 = config?.accentColor2 || '#50c9c3';
  const totalStages = course.stages.length;

  // Escape HTML in text content
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate stage navigation links
  const generateStageLinks = () => {
    return course.stages
      .map(
        (stage, idx) =>
          `<a href="#" id="stage-link-${stage.id}">stage ${stage.id}: ${escapeHtml(stage.title.toLowerCase())}</a>`
      )
      .join('\n            ');
  };

  // Generate navigation menu
  const generateNavMenu = () => {
    const stagesPerGroup = Math.ceil(totalStages / 2);
    const firstGroup = course.stages.slice(0, stagesPerGroup);
    const secondGroup = course.stages.slice(stagesPerGroup);

    return `
        <div>
          <h1>foundations</h1>
          ${firstGroup
            .map(
              (stage) =>
                `<a href="#" data-stage="${stage.id}">${escapeHtml(stage.title.toLowerCase())}</a>`
            )
            .join('\n          ')}
        </div>
        ${secondGroup.length > 0 ? `<div>
          <h1>application</h1>
          ${secondGroup
            .map(
              (stage) =>
                `<a href="#" data-stage="${stage.id}">${escapeHtml(stage.title.toLowerCase())}</a>`
            )
            .join('\n          ')}
        </div>` : ''}
      `;
  };

  // Generate interactive elements HTML
  const generateInteractiveElement = (element: any, stageId: number) => {
    if (!element || !element.type) return '';

    switch (element.type) {
      case 'quiz':
        if (element.data && element.data.question) {
          const options = element.data.options || [];
          return `
                <div class="quiz-question" data-qid="q-${stageId}-${element.data.id || '1'}">
                  <strong>${escapeHtml(element.data.question)}</strong><br>
                  ${options
                    .map(
                      (opt: string, idx: number) =>
                        `<span class="choice" data-value="${String.fromCharCode(65 + idx)}">${escapeHtml(opt)}</span>`
                    )
                    .join('\n                  ')}
                </div>`;
        }
        return '';

      case 'matching':
        if (element.data && element.data.items) {
          const items = element.data.items;
          return `
                <div class="matching-exercise">
                  <h4>Match the items:</h4>
                  <div style="margin-bottom:10px;">
                    ${items
                      .slice(0, Math.ceil(items.length / 2))
                      .map(
                        (item: any, idx: number) =>
                          `<div class="match-item" data-match="${idx}" onclick="selectMatch(this, '${idx}', event)">${escapeHtml(item.label || item)}</div>`
                      )
                      .join('\n                    ')}
                  </div>
                  <div>
                    ${items
                      .slice(Math.ceil(items.length / 2))
                      .map(
                        (item: any, idx: number) =>
                          `<div class="match-item" data-match="${idx}" onclick="matchWith(this, '${idx}', event)">${escapeHtml(item.match || item)}</div>`
                      )
                      .join('\n                    ')}
                  </div>
                </div>`;
        }
        return '';

      case 'expandable':
        if (element.data && element.data.title && element.data.content) {
          return `
                <div class="expandable-section">
                  <div class="expandable-header" onclick="toggleExpand(this, event)">
                    <h5>${escapeHtml(element.data.title)}</h5>
                    <span class="expand-icon">▼</span>
                  </div>
                  <div class="expandable-content">
                    ${typeof element.data.content === 'string'
                      ? `<p>${escapeHtml(element.data.content)}</p>`
                      : Array.isArray(element.data.content)
                        ? `<ul>${element.data.content.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
                        : ''}
                  </div>
                </div>`;
        }
        return '';

      case 'code-demo':
        if (element.data && element.data.code) {
          return `
                <div class="interactive-demo">
                  <h5>${escapeHtml(element.data.title || 'Code Example')}</h5>
                  <div class="code-editor">
                    <pre>${escapeHtml(element.data.code)}</pre>
                  </div>
                  ${element.data.explanation ? `<div class="output-box" id="output-${stageId}"></div>` : ''}
                </div>`;
        }
        return '';

      default:
        return '';
    }
  };

  // Generate stage content
  const generateStageContent = (stage: any) => {
    // Handle both data structures: content at stage level (old) or inside content object (new)
    let content: any = {};
    if (stage.content) {
      // New structure: content is wrapped
      content = stage.content;
    } else {
      // Old structure: content fields are directly on stage (backward compatibility)
      content = {
        introduction: stage.introduction || '',
        sections: stage.sections || [],
        summary: stage.summary || '',
      };
    }
    const sections = content.sections || [];
    const interactiveElements = stage.interactiveElements || [];

    return `
          <section class="course-page ${stage.id === 1 ? 'active' : ''}" data-stage="${stage.id}" id="page-${stage.id}">
            <div class="page-card">
              <div class="content-area">
                <h3>${stage.id} — ${escapeHtml(stage.title)}</h3>
                ${content.introduction ? `<p>${escapeHtml(content.introduction)}</p>` : ''}

                ${stage.objective
                  ? `<div class="progress-checkpoint">
                      <span class="checkpoint-icon">✓</span>
                      <strong>Learning Objective:</strong> ${escapeHtml(stage.objective)}
                    </div>`
                  : ''}

                ${sections
                  .map((section: any) => {
                    if (section.type === 'list' && section.items) {
                      return `
                    <h4>${escapeHtml(section.heading || '')}</h4>
                    <ul>
                      ${section.items.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>`;
                    }
                    return `
                    <h4>${escapeHtml(section.heading || '')}</h4>
                    <p>${escapeHtml(section.content || '')}</p>`;
                  })
                  .join('\n                ')}

                ${interactiveElements.map((el: any) => generateInteractiveElement(el, stage.id)).join('\n                ')}

                ${content.summary ? `<p><strong>Summary:</strong> ${escapeHtml(content.summary)}</p>` : ''}

                <div style="margin-top:20px;">
                  <button type="button" class="btn" data-action="next" data-stage="${stage.id + 1}" ${stage.id >= totalStages ? 'style="display:none;"' : ''}>Continue to Next Stage</button>
                  <button type="button" class="btn secondary" data-action="bookmark" data-stage="${stage.id}">Bookmark This Page</button>
                </div>
              </div>

              ${stage.sideCard
                ? `<aside class="side-card">
                    <h4>${escapeHtml(stage.sideCard.title || 'Key Points')}</h4>
                    <p>${escapeHtml(stage.sideCard.content || '')}</p>
                    ${stage.sideCard.tips && stage.sideCard.tips.length > 0
                      ? `<div style="margin-top:15px;padding:10px;background:var(--bg3);border-radius:6px;">
                          <strong style="font-size:11px;">💡 Tips:</strong>
                          <ul style="font-size:11px;margin:5px 0 0 0;padding-left:20px;">
                            ${stage.sideCard.tips.map((tip: string) => `<li>${escapeHtml(tip)}</li>`).join('')}
                          </ul>
                        </div>`
                      : ''}
                  </aside>`
                : ''}
            </div>
          </section>`;
  };

  // Generate quiz stage if there are quiz questions
  const generateQuizStage = () => {
    const allQuizQuestions: any[] = [];
    course.stages.forEach((stage) => {
      if (stage.quizQuestions && stage.quizQuestions.length > 0) {
        stage.quizQuestions.forEach((q: any) => {
          allQuizQuestions.push({ ...q, stageId: stage.id });
        });
      }
    });

    if (allQuizQuestions.length === 0) return '';

    return `
          <section class="course-page" data-stage="${totalStages + 1}" id="page-quiz">
            <div class="page-card">
              <div class="content-area">
                <h3>Quiz: Test Your Knowledge</h3>
                <p>Answer these questions to check your understanding:</p>

                ${allQuizQuestions
                  .map(
                    (q, idx) => `
                <div class="quiz-question" data-qid="quiz-${idx}">
                  <strong>${idx + 1})</strong> ${escapeHtml(q.question)}<br>
                  ${(q.options || [])
                    .map(
                      (opt: string, optIdx: number) =>
                        `<span class="choice" data-value="${String.fromCharCode(65 + optIdx)}">${escapeHtml(opt)}</span>`
                    )
                    .join('\n                  ')}
                </div>`
                  )
                  .join('\n                ')}

                <div style="margin-top:20px;">
                  <button type="button" class="btn" id="submit-quiz">Submit Quiz</button>
                  <div id="quiz-result" style="margin-top:15px;"></div>
                </div>
              </div>

              <aside class="side-card">
                <h4>Certificate</h4>
                <div id="cert-placeholder">
                  <p>Complete the quiz to earn your certificate!</p>
                </div>
                <div id="certificate" style="display:none;">
                  <h4 style="color:var(--accent1);">🎉 Course Complete!</h4>
                  <p>Congratulations! You've completed <b>${escapeHtml(course.title)}</b>.</p>
                  <p id="cert-name">Learner</p>
                  <button type="button" class="btn" id="download-cert" style="margin-top:15px;">Download Certificate</button>
                </div>
              </aside>
            </div>
          </section>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>ByteAI — ${escapeHtml(course.title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />

<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Passions+Conflict&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<link href="https://iconsax.gitlab.io/i/icons.css" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css"/>
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css"/>

<style>
@font-face {
font-family: 'Calora';
src: url('https://files.jcink.net/uploads2/strangefrontier/fonts/Calora.woff'); }
@font-face {
font-family: 'Calora Italic';
src: url('https://files.jcink.net/uploads2/strangefrontier/fonts/Calora_Italic.woff'); }

html, body { margin:0px;padding:0px;height:100%;overflow:hidden; }
body { background-color:var(--bg1);

  --bg1: #e0e0e0;
  --bg2: #dddddd;
  --bg3: #d5d5d5;
  --bg4: #bdbdbd;
  --bgInverse: #191919;
  --bgInverse2: #151515;
  --border: #191919;
  --text: #333;
  
  --textOutline: var(--border) 1px 0px 0px, var(--border) 0.540302px 0.841471px 0px, var(--border) -0.416147px 0.909297px 0px, var(--border) -0.989993px 0.14112px 0px, var(--border) -0.653644px -0.756803px 0px, var(--border) 0.283662px -0.958924px 0px, var(--border) 0.96017px -0.279416px 0px;
    
  --accent1: ${accent1};
  --accent2: ${accent2};
  
  --inter: 'Inter', sans-serif;
  --calora: 'Calora', serif;
  --calora2: 'Calora Italic', serif;
  
  --font: 13px / 20px var(--inter);
  --transition:.3s;
  
  --bannerImg: url(https://via.placeholder.com/800x400/4a90e2/50c9c3?text=${encodeURIComponent(course.title)});
  --defaultIcon: url(https://via.placeholder.com/100/4a90e2/50c9c3?text=B);

}

.birb { font:var(--font);color:var(--bgInverse);scrollbar-width:thin;scrollbar-color:var(--bgInverse) var(--bg1);height:100vh;overflow-y:auto;overflow-x:hidden;scroll-behavior: smooth; }
.birb-menu { display:flex;gap:15px; border-right:solid 1px var(--border);border-bottom:solid 1px var(--border);padding:20px;position:sticky;z-index:1000;top:0px;text-transform:uppercase;letter-spacing:2px;
  background:linear-gradient(to right,var(--bg1) 15%,transparent 45% 55%,var(--bg1) 85%),
    linear-gradient(to right,var(--accent1) 15%,var(--accent2) 85%); }
.birb-menu a { font:500 11px / 10px var(--inter);color:var(--bgInverse); }
.birb-nav, .birb-log { position:relative;z-index:1;display:flex;gap:15px; }
.birb-nav { flex-grow:1; }
.birb-nav a:first-of-type { font-weight:800!important; }
.birb-darkmode { padding:2px;border:solid 1px var(--border);display:block;border-radius:10px;width:20px;margin:-1px 0px;cursor:pointer;position:relative;z-index:1; }
.birb-darkmode div { width:6px;position:relative;height:100%;transition:var(--transition); }
.birb-darkmode.toggled div { width:20px; }
.birb-darkmode div::before { display:block;content:'';position:absolute;top:0px;bottom:0px;right:0px;border:solid 1px var(--border);background:linear-gradient(to right,var(--accent2),var(--accent1));width:4px;border-radius:100%; }

.birb-grid { min-height:auto;border-right:solid 1px var(--border);display:grid;grid-template-columns:101px auto auto auto auto auto 1fr;position:relative;z-index:1; }

.birb-sidebar { position:relative;z-index:10;border-right:solid 1px var(--border);display:flex;flex-direction:column;align-items:center;gap:15px;padding:30px;position:sticky;top:51px;height:calc(100vh - 111px);
  background:linear-gradient(to bottom,var(--bg1) 50%,transparent),
    linear-gradient(to bottom,var(--accent1) 65%,var(--accent2)); }
.birb-sidebar-icon { position:relative;z-index:1;padding:4px;border:solid 1px var(--border);border-radius:100%; }
.birb-sidebar-icon div { height:30px;width:30px;background-color:var(--bg1);background-image:var(--defaultIcon);background-blend-mode:multiply;background-size:cover;background-position:center;border-radius:100%;position:relative; }
.birb-sidebar-icon .progress-ring { position:absolute;top:0;left:0;width:100%;height:100%;transform:rotate(-90deg); }
.birb-sidebar-icon .progress-ring circle { fill:none;stroke-width:3;stroke-linecap:round; }
.birb-sidebar-icon .progress-ring .bg-circle { stroke:var(--bg3); }
.birb-sidebar-icon .progress-ring .progress-circle { stroke:url(#progressGradient);transition:stroke-dashoffset 0.3s; }
.birb-sidebar-icon .progress-text { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font:600 8px/1 var(--inter);color:var(--bgInverse);text-align:center; }
.birb-sidebar-tog { position:relative;z-index:1;display:block;border:solid 1px var(--border);border-radius:50px;text-transform:uppercase;padding:19px 14px;white-space:nowrap;writing-mode:vertical-rl;letter-spacing:1px;cursor:pointer; }
.birb-sidebar-tog:last-of-type { background-color:var(--bgInverse); }
.birb-sidebar-tog b { font:500 12px / 10px var(--inter);display:block;transform:rotate(-180deg); }
.birb-sidebar-tog:last-of-type b { color:var(--bg1)!important; }
.birb-sidebar a { transition:var(--transition);background-color:var(--bg1);color:var(--bgInverse)!important; }
.birb-sidebar a:hover { background-color:var(--bgInverse);color:var(--bg1)!important; }
.birb-sidebar-divider { width:1px;flex-grow:1;background-color:var(--border);position:relative;z-index:1;display:flex;flex-direction:column;justify-content:space-between;margin:35px 0px; }
.birb-sidebar-divider::before, .birb-sidebar-divider::after { content:'';position:absolute;left:50%;transform:translateX(-50%);width:7px;height:7px;border-radius:100%;background-color:var(--border); }
.birb-sidebar-divider::before { top:0; }
.birb-sidebar-divider::after { bottom:0; }

.birb-popout { border-right:solid 1px var(--border);margin-left:-1px;width:0px;transition:var(--transition);position:sticky;top:51px;height:calc(100vh - 51px);overflow:hidden; }
.birb-popout2 { height:calc(100vh - 151px);width:250px;padding:50px;height:calc(100vh - 151px);position:relative;display:flex;flex-direction:column;
  background:linear-gradient(to top,var(--bg1) 50%,transparent),
    linear-gradient(to bottom,var(--accent1),var(--accent2) 35%); }

.birb-user { border-right:solid 1px var(--border);margin-left:-1px;width:0px;transition:var(--transition);position:sticky;top:51px;height:calc(100vh - 51px);overflow:hidden; }
.birb-user2 { width:250px;padding:50px;height:calc(100vh - 151px);position:relative;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--bgInverse) var(--bg1);
  background:linear-gradient(to top,var(--bg1) 50%,transparent),
    linear-gradient(to bottom,var(--accent1),var(--accent2) 35%); }
.birb-user2::-webkit-scrollbar { width:6px; }
.birb-user2::-webkit-scrollbar-track { background:var(--bg1); }
.birb-user2::-webkit-scrollbar-thumb { background:var(--bgInverse);border-radius:3px; }
.birb-video { border-right:solid 1px var(--border);margin-left:-1px;width:0px;transition:var(--transition);position:sticky;top:51px;height:calc(100vh - 51px);overflow:hidden; }
.birb-video2 { width:250px;padding:50px;height:calc(100vh - 151px);position:relative;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--bgInverse) var(--bg1);
  background:linear-gradient(to top,var(--bg1) 50%,transparent),
    linear-gradient(to bottom,var(--accent1),var(--accent2) 35%); }
.birb-video2::-webkit-scrollbar { width:6px; }
.birb-video2::-webkit-scrollbar-track { background:var(--bg1); }
.birb-video2::-webkit-scrollbar-thumb { background:var(--bgInverse);border-radius:3px; }
.birb-video2::before, .birb-podcast2::before { display:block;content:'*';position:absolute;z-index:10;top:210px;right:35px;text-shadow:var(--textOutline);font:412px / 0px var(--calora);color:var(--bg1); }
.birb-podcast { border-right:solid 1px var(--border);margin-left:-1px;width:0px;transition:var(--transition);position:sticky;top:51px;height:calc(100vh - 51px);overflow:hidden; }
.birb-podcast2 { width:250px;padding:50px;height:calc(100vh - 151px);position:relative;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:var(--bgInverse) var(--bg1);
  background:linear-gradient(to top,var(--bg1) 50%,transparent),
    linear-gradient(to bottom,var(--accent1),var(--accent2) 35%); }
.birb-podcast2::-webkit-scrollbar { width:6px; }
.birb-podcast2::-webkit-scrollbar-track { background:var(--bg1); }
.birb-podcast2::-webkit-scrollbar-thumb { background:var(--bgInverse);border-radius:3px; }
.birb-user-av { position:relative;display:flex;align-items:center;justify-content:center; }
.birb-user2::before, .birb-popout2::before, .birb-video2::before, .birb-podcast2::before { display:block;content:'*';position:absolute;z-index:10;top:210px;right:35px;text-shadow:var(--textOutline);font:412px / 0px var(--calora);color:var(--bg1); }
.birb-user-av2 { background-color:var(--bgInverse);border:solid 1px var(--border);width:calc(100% - 2px);padding-top:100%;position:relative;border-radius:100%; }
.birb-user-av2::before { position:absolute;z-index:1;content:'';display:block;top:0px;bottom:0px;left:0px;right:0px;border:solid 10px var(--bg1);border-radius:100%; }
.birb-user-av2 div { position:absolute;top:10px;bottom:10px;left:10px;right:10px;background-color:var(--bg1);background-image:var(--defaultIcon);background-blend-mode:multiply;mix-blend-mode:lighten;background-size:cover;background-position:center;border-radius:100%; }
.birb-user-name { position:relative;z-index:1;margin:-25px 0px 15px 0px; }
.birb-user-name h1, .birb-user-name h2 { margin:0px;font:35px / 80% var(--calora);text-transform:uppercase; }
.birb-user-name h1 div, .birb-user-name h2 div { text-transform:lowercase;text-shadow:var(--textOutline);position:relative;color:var(--bg1); }
.birb-user-name h2 { position:absolute;left:0px;top:0px;color:transparent; }
.birb-user-name h2 div { text-shadow:none;background:linear-gradient(to right,var(--accent2),var(--accent1), transparent 50%);padding:30px 0px;margin:-30px 0px;background-clip:text;-webkit-background-clip:text;color:transparent;max-width:fit-content; }
.birb-user-name2 { text-transform:uppercase;font:400 12px / 15px var(--inter);letter-spacing:.5px; }
.birb-user-name2 b { font-weight:800!important; }
.birb-user-links { display:flex;flex-wrap:wrap;gap:15px;flex-grow:1;align-content:center;margin-bottom:25px; }
.birb-user-links a { display:block;font:800 11px / 10px var(--inter);text-transform:uppercase;color:var(--bgInverse);letter-spacing:.5px;position:relative;padding-left:23px; }
.birb-user-links a::before { display:block;position:absolute;content:'*';font:33px / 28px var(--calora);left:0px;background:linear-gradient(to right,var(--accent2),var(--accent1));background-clip:text;-webkit-background-clip:text;color:transparent;max-width:fit-content; }
.birb-user-divider { flex-grow:1;display:flex;align-items:center; }
.birb-user-divider div { height:1px;background-color:var(--border);position:relative;z-index:1;display:flex;justify-content:space-between;margin:35px 30px 25px 30px;flex-grow:1; }
.birb-user-divider div::before, .birb-user-divider div::after { content:'';display:block;width:7px;height:7px;border-radius:100%;background-color:var(--border);margin-top:-3px; }

.birb-links { border-right:solid 1px var(--border);margin-left:-1px;width:0px;transition:var(--transition);position:sticky;top:51px;height:calc(100vh - 51px);overflow:hidden; }
.birb-links2 { padding:50px;width:250px;height:calc(100vh - 151px);overflow-y:auto;overflow-x:hidden;scrollbar-width:thin; }
.birb-links3 { display:flex;flex-direction:column;gap:30px;min-height:100%;justify-content:space-between; }
.birb-links3 h1 { margin:0px 0px 20px 0px;font:400 35px / 30px var(--calora);text-transform:lowercase; }
.birb-links3 h1::after { content:'';display:block;border:solid 1px var(--border);border-radius:5px;height:3px;background:linear-gradient(to right,var(--accent1),var(--accent2),var(--bg1) 75%);margin-top:15px; }
.birb-links3 div { counter-reset: birbNav; }
.birb-links3 div a { display:block;color:var(--bgInverse);text-transform:uppercase;font:800 12px / 18px var(--inter);letter-spacing:1px;counter-increment: birbNav; }
.birb-links3 div a::before { content:'0' counter(birbNav) '.';background:linear-gradient(135deg,var(--accent2),var(--accent1));background-clip:text;-webkit-background-clip:text;color:transparent!important;margin-right:10px; }

.birb-grid.usermenu .birb-user, .birb-grid.navmenu .birb-links, .birb-grid.videomenu .birb-video, .birb-grid.podcastmenu .birb-podcast { width:350px;z-index:1; }
.birb-user2, .birb-popout2, .birb-links2, .birb-video2, .birb-podcast2 { opacity:0;transform:scale(0.96);transition:opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s; }
.birb-grid.usermenu .birb-user2, .birb-grid.navmenu .birb-links2, .birb-grid.popout2 .birb-popout2, .birb-grid.videomenu .birb-video2, .birb-grid.podcastmenu .birb-podcast2 { opacity:1;transform:scale(1); }

.birb-wrapper { padding:85px; }
.birb-banner-img { background-color:var(--bgInverse);border:solid 1px var(--border);border-radius:150px; }
.birb-banner-img2 { position:relative;height:250px;background-color:var(--bg1);background:linear-gradient(to right,var(--accent1),var(--accent2));mix-blend-mode:lighten;border-radius:149px; }
.birb-banner-img2::before { display:block;content:'';position:absolute;z-index:2;top:0px;bottom:0px;left:0px;right:0px;border:solid 10px var(--bg1);border-radius:149px; }
.birb-banner-img2 div { background-image:var(--bannerImg);height:100%;width:100%;background-size:cover;background-position:center;mix-blend-mode:multiply;filter:grayscale(100%);border-radius:149px; }
.birb-banner-stuff { display:flex;flex-wrap:wrap;gap:50px;margin:50px 0px 0px 0px;border-bottom:solid 0px var(--border);padding-bottom:70px;position:relative; }
.birb-banner-name { position:relative;z-index:1;text-transform:uppercase;font:400 120px / 1.2 var(--calora);padding:0;margin:0;text-align:center;width:100%;background:linear-gradient(to right, var(--accent2), var(--accent1));background-clip:text;-webkit-background-clip:text;color:transparent; }

.birb-banner-divide { margin:60px auto 135px auto;width:65%;display:flex;align-items:center;justify-content:center;position:relative; }
.birb-banner-divide::before { display:block;content:'*';position:absolute;z-index:2;color:var(--bg1);text-shadow:var(--textOutline);font:300px / 0px var(--calora);background-color:var(--bg1);padding:100px 50px 0px 50px;height:0px;top:-12px; }
.birb-banner-divide div { height:1px;background-color:var(--border);position:relative;z-index:1;display:flex;justify-content:space-between;flex-grow:1; }
.birb-banner-divide div::before, .birb-banner-divide div::after { content:'';display:block;width:7px;height:7px;border-radius:100%;background-color:var(--border);margin-top:-3px; }

.course { background-color:var(--bg1);border:solid 1px var(--border);border-radius:20px;padding:40px;margin-bottom:30px; }
.course .title { font:400 45px / 50px var(--calora);text-transform:uppercase;margin:0 0 10px 0;color:var(--bgInverse); }
.course .sub { font:400 18px / 24px var(--inter);color:var(--bgInverse);margin-bottom:30px;opacity:0.8; }
.course-nav { display:flex;gap:15px;align-items:center;margin-bottom:30px;padding-bottom:20px;border-bottom:1px solid var(--border); }
.course-nav button { border:solid 1px var(--border);border-radius:50px;padding:12px 24px;font:800 12px / 10px var(--inter);text-transform:uppercase;letter-spacing:1px;cursor:pointer;transition:var(--transition);background-color:var(--bg1);color:var(--bgInverse); }
.course-nav button:hover:not(:disabled) { background-color:var(--bgInverse);color:var(--bg1); }
.course-nav button:disabled { opacity:0.5;cursor:not-allowed; }
.course-progress { flex-grow:1;height:8px;background-color:var(--bg3);border-radius:4px;overflow:hidden;position:relative; }
.course-progress-fill { height:100%;background:linear-gradient(to right,var(--accent1),var(--accent2));transition:width 0.3s;width:0%; }
.course-stage { font:800 14px / 10px var(--inter);text-transform:uppercase;letter-spacing:1px;color:var(--bgInverse);white-space:nowrap; }

.course-page { display:none; }
.course-page.active { display:block; }
.page-card { display:grid;grid-template-columns:1fr 300px;gap:30px; }
.content-area h3 { font:400 35px / 40px var(--calora);text-transform:uppercase;margin:0 0 20px 0;color:var(--bgInverse); }
.content-area h4 { font:800 16px / 20px var(--inter);text-transform:uppercase;margin:20px 0 10px 0;color:var(--bgInverse); }
.content-area p { font:var(--font);color:var(--bgInverse);margin:0 0 15px 0;line-height:1.6; }
.content-area ul { margin:15px 0;padding-left:20px; }
.content-area li { font:var(--font);color:var(--bgInverse);margin:8px 0;line-height:1.6; }
.side-card { background-color:var(--bg2);border:solid 1px var(--border);border-radius:15px;padding:25px; }
.side-card h4 { font:800 18px / 22px var(--inter);text-transform:uppercase;margin:0 0 15px 0;color:var(--bgInverse); }
.side-card p { font:var(--font);color:var(--bgInverse);margin:0;line-height:1.6; }

.btn { border:solid 1px var(--border);border-radius:50px;padding:14px 28px;font:800 12px / 10px var(--inter);text-transform:uppercase;letter-spacing:1px;cursor:pointer;transition:var(--transition);background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border:none; }
.btn:hover { opacity:0.9;transform:translateY(-2px); }
.btn.secondary { background:var(--bg1);color:var(--bgInverse);border:solid 1px var(--border); }
.btn.secondary:hover { background-color:var(--bgInverse);color:var(--bg1); }

.quiz-question { margin:25px 0;padding:20px;background-color:var(--bg2);border-radius:10px;border:1px solid var(--border); }
.quiz-question strong { font:800 16px / 20px var(--inter);color:var(--bgInverse); }
.choice { display:inline-block;padding:12px 20px;margin:8px 8px 8px 0;background-color:var(--bg1);border:2px solid var(--border);border-radius:8px;cursor:pointer;transition:var(--transition);font:var(--font);color:var(--bgInverse); }
.choice:hover { background-color:var(--bg3); }
.choice.selected { background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border-color:transparent; }

.expandable-section { margin:20px 0; }
.expandable-header { background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px 15px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background 0.3s; }
.expandable-header:hover { background:var(--bg3); }
.expandable-header h5 { margin:0;font:800 13px/16px var(--inter);text-transform:uppercase;color:var(--bgInverse); }
.expandable-content { display:none;padding:15px;border:1px solid var(--border);border-top:none;border-radius:0 0 8px 8px;background:var(--bg1); }
.expandable-content.show { display:block; }
.expand-icon { transition:transform 0.3s;font-size:18px; }
.expand-icon.expanded { transform:rotate(180deg); }

.matching-exercise { display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:20px 0; }
.match-item { background:var(--bg2);border:2px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;transition:all 0.3s;text-align:center;font:800 11px/14px var(--inter);text-transform:uppercase; }
.match-item:hover { background:var(--bg3);transform:translateY(-2px); }
.match-item.selected { background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border-color:transparent; }

.progress-checkpoint { background:var(--bg2);border-left:4px solid var(--accent1);border-radius:4px;padding:15px;margin:20px 0; }
.checkpoint-icon { display:inline-block;width:24px;height:24px;background:var(--accent1);color:var(--bg1);border-radius:50%;text-align:center;line-height:24px;font-weight:800;margin-right:10px; }

.glass-popup { position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);z-index:10000;display:none; }
.glass-popup.show { display:block;animation:fadeInScale 0.3s ease-out; }
.glass-popup-overlay { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);z-index:9999;display:none; }
.glass-popup-overlay.show { display:block;animation:fadeIn 0.3s ease-out; }
.glass-popup-content { background:rgba(224,224,224,0.9);backdrop-filter:blur(20px);border:2px solid rgba(25,25,25,0.3);border-radius:20px;padding:30px 40px;min-width:300px;max-width:500px;box-shadow:0 8px 32px rgba(0,0,0,0.3);text-align:center; }
.glass-popup-content h4 { margin:0 0 15px 0;font:800 18px/22px var(--inter);text-transform:uppercase;color:var(--bgInverse); }
.glass-popup-content p { margin:0 0 20px 0;font:var(--font);color:var(--bgInverse);line-height:1.6; }
.glass-popup-content .popup-icon { font-size:48px;margin-bottom:15px;display:block; }
.glass-popup-content .popup-button { background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border:none;padding:12px 28px;border-radius:50px;font:800 12px/14px var(--inter);text-transform:uppercase;cursor:pointer;transition:opacity 0.3s; }
.glass-popup-content .popup-button:hover { opacity:0.9; }

/* Video Modal Styles */
.video-modal { position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);z-index:10001;display:none;width:95vw;max-width:1400px;max-height:95vh;overflow:hidden; }
.video-modal.show { display:block;animation:fadeInScale 0.3s ease-out; }
.video-modal-content { background:rgba(224,224,224,0.98);backdrop-filter:blur(20px);border:2px solid rgba(25,25,25,0.3);border-radius:20px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.3);position:relative;display:flex;flex-direction:column;max-height:95vh;overflow:hidden; }
.video-modal-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:2px solid rgba(25,25,25,0.2);flex-shrink:0; }
.video-modal-header h3 { margin:0;font:800 18px/22px var(--inter);text-transform:uppercase;color:var(--bgInverse); }
.video-modal-close { background:none;border:none;font-size:24px;cursor:pointer;color:var(--bgInverse);padding:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.3s; }
.video-modal-close:hover { background:rgba(25,25,25,0.1); }
.video-preview { background:var(--bg1);border:3px solid var(--bgInverse);border-radius:15px;padding:0;width:100%;margin:0 auto;position:relative;overflow:hidden;flex:1;min-height:0;max-height:calc(95vh - 180px);display:flex;justify-content:center;align-items:center; }
.video-preview iframe { background:var(--bg1);border:none;width:100%;height:100%;min-height:600px;display:block; }
.video-modal-actions { display:flex;gap:15px;justify-content:center;margin-top:15px;padding-top:15px;border-top:2px solid rgba(25,25,25,0.2);flex-shrink:0; }
.video-modal-actions button { background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border:none;padding:12px 28px;border-radius:50px;font:800 12px/14px var(--inter);text-transform:uppercase;cursor:pointer;transition:opacity 0.3s; }
.video-modal-actions button:hover { opacity:0.9; }
.video-modal-actions button.secondary { background:var(--bgInverse);color:var(--bg1); }

/* Podcast Modal Styles */
.podcast-modal { position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);z-index:10001;display:none;width:95vw;max-width:900px;max-height:95vh;overflow:hidden; }
.podcast-modal.show { display:block;animation:fadeInScale 0.3s ease-out; }
.podcast-modal-content { background:rgba(224,224,224,0.98);backdrop-filter:blur(20px);border:2px solid rgba(25,25,25,0.3);border-radius:20px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.3);position:relative;display:flex;flex-direction:column;max-height:95vh;overflow:hidden; }
.podcast-modal-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:2px solid rgba(25,25,25,0.2);flex-shrink:0; }
.podcast-modal-header h3 { margin:0;font:800 18px/22px var(--inter);text-transform:uppercase;color:var(--bgInverse); }
.podcast-modal-close { background:none;border:none;font-size:24px;cursor:pointer;color:var(--bgInverse);padding:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:background 0.3s; }
.podcast-modal-close:hover { background:rgba(25,25,25,0.1); }
.podcast-preview { background:var(--bg1);border:3px solid var(--bgInverse);border-radius:15px;padding:0;width:100%;margin:0 auto;position:relative;overflow:hidden;flex:1;min-height:0;max-height:calc(95vh - 180px);display:flex;justify-content:center;align-items:center; }
.podcast-preview iframe { background:var(--bg1);border:none;width:100%;height:100%;min-height:400px;display:block; }
.podcast-modal-actions { display:flex;gap:15px;justify-content:center;margin-top:15px;padding-top:15px;border-top:2px solid rgba(25,25,25,0.2);flex-shrink:0; }
.podcast-modal-actions button { background:linear-gradient(to right,var(--accent1),var(--accent2));color:var(--bg1);border:none;padding:12px 28px;border-radius:50px;font:800 12px/14px var(--inter);text-transform:uppercase;cursor:pointer;transition:opacity 0.3s; }
.podcast-modal-actions button:hover { opacity:0.9; }
.podcast-modal-actions button.secondary { background:var(--bgInverse);color:var(--bg1); }

@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes fadeInScale { from { opacity:0;transform:translate(-50%, -50%) scale(0.9); } to { opacity:1;transform:translate(-50%, -50%) scale(1); } }

@media screen and (max-width: 1024px) {
  .birb-grid { grid-template-columns:70px 1fr; }
  .birb-sidebar { padding:20px 15px;width:70px; }
  .page-card { grid-template-columns:1fr;gap:20px; }
  .birb-grid.usermenu .birb-user, .birb-grid.navmenu .birb-links { width:100%;max-width:400px; }
}

@media screen and (max-width: 768px) {
  .birb-grid { grid-template-columns:60px 1fr;min-height:auto; }
  .birb-sidebar { padding:15px 10px;width:60px;gap:10px;position:fixed;left:0;top:51px;height:calc(100vh - 51px);z-index:999; }
  .birb-wrapper { padding:25px 20px; }
  .birb-banner-name { font-size:40px;line-height:1.2;padding:0 10px; }
  .course { padding:25px 20px;margin-bottom:20px; }
  .course .title { font-size:28px;line-height:1.2; }
  .page-card { grid-template-columns:1fr;gap:15px; }
}
</style>
</head>
<body>

<div class="birb">
    <div id="top"></div>
    <div class="birb-menu">
      <i class="ph-fill ph-house"></i>
      <div class="birb-nav">
        <a href="#">${escapeHtml(course.title)}</a>
        <a href="#">${escapeHtml(course.title)}</a>
        <a href="#">ByteAI</a>
      </div>
      <div class="birb-log">
        <a href="#" id="bookmarks-toggle">bookmarks</a>
      </div>
      <a id="darkmode" class="birb-darkmode"><div></div></a>
    </div>
    <div class="birb-grid">
      <div class="birb-sidebar">
        <a href="#" class="birb-sidebar-icon popout">
          <div>
            <svg class="progress-ring" viewBox="0 0 38 38">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:var(--accent1);stop-opacity:1" />
                  <stop offset="100%" style="stop-color:var(--accent2);stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle class="bg-circle" cx="19" cy="19" r="16"></circle>
              <circle class="progress-circle" cx="19" cy="19" r="16" id="circular-progress" stroke-dasharray="100.5" stroke-dashoffset="100.5"></circle>
            </svg>
            <span class="progress-text" id="circular-progress-text">0%</span>
          </div>
        </a>
        <div class="birb-sidebar-divider"></div>
        <a id="usermenu" class="birb-sidebar-tog"><b>course overview</b></a>
        <a id="navmenu" class="birb-sidebar-tog"><b>navigation</b></a>
        ${config?.includeVideo ? '<a id="videomenu" class="birb-sidebar-tog"><b>video lesson</b></a>' : ''}
        ${config?.includePodcast ? '<a id="podcastmenu" class="birb-sidebar-tog"><b>podcast</b></a>' : ''}
      </div>
      <div class="birb-popout"><div class="birb-popout2">
          <div style="font:var(--font);color:var(--bgInverse);padding:0 20px;line-height:1.6;">
            <p style="margin:0 0 20px 0;text-align:center;">
              <span style="font-size:32px;font-weight:800;display:block;margin-bottom:5px;" id="popout-progress-percent">0%</span>
              <span style="font-size:12px;opacity:0.8;">Complete</span>
            </p>
            <div style="margin:0 0 20px 0;">
              <p style="margin:0 0 10px 0;"><b>Current Stage:</b> <span id="popout-current-stage">1</span> of <span id="popout-total-stages">${totalStages}</span></p>
              <p style="margin:0 0 10px 0;"><b>Stages Completed:</b> <span id="popout-completed">0</span> / <span id="popout-total">${totalStages}</span></p>
            </div>
            <div class="course-progress" style="margin:0 0 20px 0;">
              <div class="course-progress-fill" id="popout-progress-fill" style="width:0%;"></div>
            </div>
          </div>
        </div></div>
      <div class="birb-user"><div class="birb-user2">
          <div class="birb-user-av">
            <div class="birb-user-av2"><div></div></div>
          </div>
          <div class="birb-user-name">
            <h1>course overview</h1>
            <h2>course overview</h2>
          </div>
          <div class="birb-user-name2">welcome to <b>${escapeHtml(course.title)}</b>! complete all <a href="#">${totalStages} stages</a> to finish the course.</div>
          <div class="birb-user-divider"><div></div></div>
          <div class="birb-user-links">
            ${generateStageLinks()}
          </div>
          <div class="birb-user-divider"><div></div></div>
          <div style="font:var(--font);color:var(--bgInverse);padding:0 20px;line-height:1.6;">
            <p style="margin:0 0 15px 0;"><b>Course Duration:</b> ${escapeHtml(course.duration || '20-25 minutes')}</p>
            <p style="margin:0 0 15px 0;"><b>Learning Objectives:</b></p>
            <ul style="margin:0 0 15px 0;padding-left:20px;">
              ${course.stages.map((s) => `<li>${escapeHtml(s.objective || s.title)}</li>`).join('')}
            </ul>
          </div>
      </div></div>
      <div class="birb-links"><div class="birb-links2"><div class="birb-links3">
        ${generateNavMenu()}
      </div></div></div>
      ${config?.includeVideo ? `
      <div class="birb-video"><div class="birb-video2">
          <div class="birb-user-av">
            <div class="birb-user-av2"><div></div></div>
          </div>
          <div class="birb-user-name">
            <h1>video overview</h1>
            <h2>video overview</h2>
          </div>
          <div class="birb-user-name2">watch the complete <b>${escapeHtml(course.title)}</b> video lesson with animated typography and narration.</div>
          <div class="birb-user-divider"><div></div></div>
          <div class="birb-user-links">
            <a href="#" id="open-video-modal">watch video lesson</a>
            ${course.stages.map((s, idx) => `<a href="#" data-stage="${s.id}">stage ${s.id}: ${escapeHtml(s.title.toLowerCase())}</a>`).join('')}
          </div>
          <div class="birb-user-divider"><div></div></div>
          <div style="font:var(--font);color:var(--bgInverse);padding:0 20px;line-height:1.6;">
            <p style="margin:0 0 15px 0;"><b>Video Duration:</b> ~7-8 minutes</p>
            <p style="margin:0 0 15px 0;"><b>Format:</b> Animated typography with narration</p>
            <p style="margin:0 0 15px 0;"><b>Features:</b></p>
            <ul style="margin:0 0 15px 0;padding-left:20px;">
              <li>Interactive quizzes</li>
              <li>Animated diagrams</li>
              <li>Visual learning aids</li>
              <li>Playback controls</li>
            </ul>
          </div>
      </div></div>` : ''}
      ${config?.includePodcast ? `
      <div class="birb-podcast"><div class="birb-podcast2">
          <div class="birb-user-av">
            <div class="birb-user-av2"><div></div></div>
          </div>
          <div class="birb-user-name">
            <h1>podcast overview</h1>
            <h2>podcast overview</h2>
          </div>
          <div class="birb-user-name2">listen to <b>${escapeHtml(course.title)}</b> as a conversational podcast with two speakers.</div>
          <div class="birb-user-divider"><div></div></div>
          <div class="birb-user-links">
            <a href="#" id="open-podcast-modal">play podcast</a>
            ${course.stages.map((s, idx) => `<a href="#" data-stage="${s.id}">stage ${s.id}: ${escapeHtml(s.title.toLowerCase())}</a>`).join('')}
          </div>
          <div class="birb-user-divider"><div></div></div>
          <div style="font:var(--font);color:var(--bgInverse);padding:0 20px;line-height:1.6;">
            <p style="margin:0 0 15px 0;"><b>Podcast Duration:</b> ~15-20 minutes</p>
            <p style="margin:0 0 15px 0;"><b>Format:</b> Conversational two-speaker dialogue</p>
            <p style="margin:0 0 15px 0;"><b>Features:</b></p>
            <ul style="margin:0 0 15px 0;padding-left:20px;">
              <li>Natural conversation flow</li>
              <li>Multiple voices</li>
              <li>Episode transcript</li>
              <li>Playback controls</li>
            </ul>
          </div>
      </div></div>` : ''}
      <div class="birb-wrapper">
        
        <div class="birb-banner">
          <div class="birb-banner-img"><div class="birb-banner-img2">
            <div></div></div></div>
          <div class="birb-banner-stuff">
            <div class="birb-banner-name">${escapeHtml(course.title.toUpperCase())}</div>
          </div>
        </div>
        <div class="birb-banner-divide"><div></div></div>
        
        <div class="course" id="course-root">
          <h1 class="title">${escapeHtml(course.title)}</h1>
          <p class="sub">${escapeHtml(course.description)}</p>
          
          <div class="course-nav">
            <button type="button" id="prev-step" disabled>Previous</button>
            <div class="course-progress">
              <div class="course-progress-fill" id="progress-fill"></div>
            </div>
            <span class="course-stage" id="stage-indicator">1/${totalStages}</span>
            <button type="button" id="next-step">Next</button>
          </div>

          ${course.stages.map((stage) => generateStageContent(stage)).join('\n          ')}
          ${generateQuizStage()}

        </div>
      </div>
    </div>
    
    <div id="bot"></div>
  </div>
  
  <script src="https://code.jquery.com/jquery-1.7.2.js"></script>
  <script>
    (function() {
      'use strict';
      
      if (typeof jQuery === 'undefined') {
        console.error('jQuery is not loaded!');
        return;
      }

      var currentStage = 1;
      var totalStages = ${totalStages};
      var quizAnswers = {};
      var userAnswers = {};

      function goToStage(stage, isNavigation) {
        if (stage < 1 || stage > totalStages) {
          return;
        }
        try {
          var shouldScroll = isNavigation !== false;
          currentStage = stage;
          showStage(stage);
          updateProgress();
          localStorage.setItem('course_stage', stage);
          
          if (shouldScroll) {
            var courseRootEl = document.getElementById('course-root');
            var birbEl = document.querySelector('.birb');
            if (courseRootEl && birbEl) {
              var courseTop = courseRootEl.offsetTop;
              var containerTop = birbEl.offsetTop;
              var scrollPosition = courseTop - containerTop - 20;
              birbEl.scrollTo({
                top: Math.max(0, scrollPosition),
                behavior: 'smooth'
              });
            }
          }
        } catch (error) {
          console.error('Error in goToStage:', error);
        }
      }

      function showStage(stage) {
        try {
          $('.course-page').removeClass('active');
          var page = $('#page-' + stage);
          if (page.length) {
            page.addClass('active');
          }
          $('#prev-step').prop('disabled', stage <= 1);
          $('#next-step').prop('disabled', stage >= totalStages);
        } catch (error) {
          console.error('Error in showStage:', error);
        }
      }

      function updateProgress() {
        var percentage = Math.round(((currentStage - 1) / (totalStages - 1)) * 100);
        $('#progress-fill').css('width', percentage + '%');
        $('#stage-indicator').text(currentStage + '/' + totalStages);
        
        var circularProgress = document.getElementById('circular-progress');
        var circularText = document.getElementById('circular-progress-text');
        if (circularProgress && circularText) {
          var circumference = 2 * Math.PI * 16;
          var offset = circumference - (percentage / 100) * circumference;
          circularProgress.style.strokeDashoffset = offset;
          circularText.textContent = percentage + '%';
        }
        
        $('#popout-progress-percent').text(percentage + '%');
        $('#popout-current-stage').text(currentStage);
        $('#popout-total-stages').text(totalStages);
        $('#popout-completed').text(Math.max(0, currentStage - 1));
        $('#popout-progress-fill').css('width', percentage + '%');
      }

      function toggleExpand(header, event) {
        event.stopPropagation();
        var content = header.nextElementSibling;
        var icon = header.querySelector('.expand-icon');
        if (content.classList.contains('show')) {
          content.classList.remove('show');
          icon.classList.remove('expanded');
        } else {
          content.classList.add('show');
          icon.classList.add('expanded');
        }
      }

      window.toggleExpand = toggleExpand;

      $(document).ready(function() {
        var saved = localStorage.getItem('course_stage');
        if (saved) {
          currentStage = parseInt(saved) || 1;
          if (currentStage < 1 || currentStage > totalStages) {
            currentStage = 1;
          }
        }
        
        showStage(currentStage);
        updateProgress();

        $('#prev-step').on('click', function(e) {
          e.preventDefault();
          if (currentStage > 1) {
            goToStage(currentStage - 1, true);
          }
        });
        
        $('#next-step').on('click', function(e) {
          e.preventDefault();
          if (currentStage < totalStages) {
            goToStage(currentStage + 1, true);
          }
        });

        for (var i = 1; i <= totalStages; i++) {
          (function(stage) {
            $('#stage-link-' + stage).on('click', function(e) {
              e.preventDefault();
              goToStage(stage, true);
            });
          })(i);
        }

        $('[data-stage]').on('click', function(e) {
          e.preventDefault();
          var stage = parseInt($(this).data('stage'));
          if (stage >= 1 && stage <= totalStages) {
            goToStage(stage, true);
          }
        });

        $('.choice').on('click', function() {
          var question = $(this).closest('.quiz-question');
          question.find('.choice').removeClass('selected');
          $(this).addClass('selected');
          userAnswers[question.data('qid')] = $(this).data('value');
        });

        $('#submit-quiz').on('click', function() {
          var correct = 0;
          var total = Object.keys(userAnswers).length;
          // Simple quiz - mark all as correct for now
          $('#quiz-result').html('<div style="padding:20px;background:var(--bg2);border-radius:10px;"><strong>Quiz submitted!</strong> Check your answers.</div>');
        });

        $('[data-action="next"]').on('click', function(e) {
          e.preventDefault();
          var stage = parseInt($(this).data('stage'));
          if (stage) {
            goToStage(stage, true);
          }
        });

        $('[data-action="bookmark"]').on('click', function(e) {
          e.preventDefault();
          var stage = parseInt($(this).data('stage'));
          alert('Stage ' + stage + ' bookmarked!');
        });

        $('#usermenu').on('click', function() {
          $('.birb-grid').toggleClass('usermenu');
        });

        $('#navmenu').on('click', function() {
          $('.birb-grid').toggleClass('navmenu');
        });

        $('.popout').on('click', function() {
          $('.birb-grid').toggleClass('popout2');
        });

        ${config?.includeVideo ? `
        $('#videomenu').on('click', function() {
          $('.birb-grid').toggleClass('videomenu');
        });
        $('#open-video-modal').on('click', function(e) {
          e.preventDefault();
          openVideoModal();
        });
        function openVideoModal() {
          $('#video-modal-overlay').addClass('show');
          $('#video-modal').addClass('show');
        }
        function closeVideoModal() {
          var videoIframe = document.getElementById('video-iframe');
          if (videoIframe && videoIframe.contentWindow) {
            try {
              videoIframe.contentWindow.postMessage({ action: 'pause' }, '*');
              if (videoIframe.contentWindow.typographyVideo) {
                videoIframe.contentWindow.typographyVideo.pause();
              }
            } catch (e) {
              console.log('Could not pause video:', e);
            }
          }
          $('#video-modal-overlay').removeClass('show');
          $('#video-modal').removeClass('show');
        }
        $('#video-modal-close').on('click', closeVideoModal);
        $('#video-modal-overlay').on('click', closeVideoModal);
        window.closeVideoModal = closeVideoModal;
        ` : ''}

        ${config?.includePodcast ? `
        $('#podcastmenu').on('click', function() {
          $('.birb-grid').toggleClass('podcastmenu');
        });
        $('#open-podcast-modal').on('click', function(e) {
          e.preventDefault();
          openPodcastModal();
        });
        function openPodcastModal() {
          $('#podcast-modal-overlay').addClass('show');
          $('#podcast-modal').addClass('show');
        }
        function closePodcastModal() {
          var podcastIframe = document.getElementById('podcast-iframe');
          if (podcastIframe && podcastIframe.contentWindow) {
            try {
              podcastIframe.contentWindow.postMessage({ action: 'pause' }, '*');
              if (podcastIframe.contentWindow.podcastPlayer) {
                podcastIframe.contentWindow.podcastPlayer.pause();
              }
            } catch (e) {
              console.log('Could not pause podcast:', e);
            }
          }
          $('#podcast-modal-overlay').removeClass('show');
          $('#podcast-modal').removeClass('show');
        }
        $('#podcast-modal-close').on('click', closePodcastModal);
        $('#podcast-modal-overlay').on('click', closePodcastModal);
        window.closePodcastModal = closePodcastModal;
        ` : ''}

        $('#darkmode').on('click', function() {
          $(this).toggleClass('toggled');
          $('body').toggleClass('darkmode');
        });
      });
    })();
  </script>
  
  <div class="glass-popup-overlay" id="popup-overlay"></div>
  <div class="glass-popup" id="glass-popup">
    <div class="glass-popup-content">
      <span class="popup-icon" id="popup-icon"></span>
      <h4 id="popup-title"></h4>
      <p id="popup-message"></p>
      <button class="popup-button" onclick="document.getElementById('popup-overlay').classList.remove('show'); document.getElementById('glass-popup').classList.remove('show');">OK</button>
    </div>
  </div>

  ${config?.includeVideo ? `
  <!-- Video Modal -->
  <div class="glass-popup-overlay" id="video-modal-overlay"></div>
  <div class="video-modal" id="video-modal">
    <div class="video-modal-content">
      <div class="video-modal-header">
        <h3>Video Lesson: ${escapeHtml(course.title)}</h3>
        <button class="video-modal-close" id="video-modal-close" type="button">×</button>
      </div>
      <div class="video-preview">
        <iframe id="video-iframe" src="${courseData.course.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-video.html" style="width:100%;height:calc(100vh - 180px);min-height:600px;border:none;border-radius:10px;display:block;"></iframe>
      </div>
      <div class="video-modal-actions">
        <button type="button" class="secondary" onclick="closeVideoModal()">Close</button>
      </div>
    </div>
  </div>
  ` : ''}

  ${config?.includePodcast ? `
  <!-- Podcast Modal -->
  <div class="glass-popup-overlay" id="podcast-modal-overlay"></div>
  <div class="podcast-modal" id="podcast-modal">
    <div class="podcast-modal-content">
      <div class="podcast-modal-header">
        <h3>Podcast: ${escapeHtml(course.title)}</h3>
        <button class="podcast-modal-close" id="podcast-modal-close" type="button">×</button>
      </div>
      <div class="podcast-preview">
        <iframe id="podcast-iframe" src="${courseData.course.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-podcast.html" style="width:100%;height:calc(100vh - 180px);min-height:400px;border:none;border-radius:10px;display:block;" allow="autoplay"></iframe>
      </div>
      <div class="podcast-modal-actions">
        <button type="button" class="secondary" onclick="closePodcastModal()">Close</button>
      </div>
    </div>
  </div>
  ` : ''}
</body>
</html>`;
}

