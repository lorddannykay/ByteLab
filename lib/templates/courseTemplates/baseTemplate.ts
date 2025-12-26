/**
 * Shared base template utilities for all course template generators
 * Ensures consistency across all templates
 */

import { CourseData, CourseStage, ContentSection, ImageMetadata, SideCardContent } from '@/types/course';
import { escapeHtml, generateInteractiveElement } from '../helpers';

/**
 * Generates standardized course overview section (birb pattern)
 */
export function generateCourseOverview(courseData: CourseData, totalStages: number): string {
  const stageLinks = courseData.course.stages
    .map((stage) => 
      `<a href="#" id="stage-link-${stage.id}" data-stage="${stage.id}">stage ${stage.id}: ${escapeHtml(stage.title.toLowerCase())}</a>`
    )
    .join('\n            ');

  return `
        <div class="course-overview-card">
            <div class="course-overview-header">
                <h1>course overview</h1>
                <h2>course overview</h2>
            </div>
            <div class="course-overview-content">
                <p>welcome to <b>${escapeHtml(courseData.course.title)}</b>! complete all <a href="#" id="total-stages">${totalStages} stages</a> to finish the course.</p>
                <div class="course-overview-divider"></div>
                <div class="course-overview-links">
                    ${stageLinks}
                </div>
                <div class="course-overview-divider"></div>
                <div class="course-overview-info">
                    <p><b>Course Description:</b></p>
                    <p>${escapeHtml(courseData.course.description)}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates standardized video overview section
 */
export function generateVideoSection(courseData: CourseData, totalStages: number): string {
  const stageLinks = courseData.course.stages
    .map((stage) => 
      `<a href="#" data-stage="${stage.id}">stage ${stage.id}: ${escapeHtml(stage.title.toLowerCase())}</a>`
    )
    .join('\n            ');

  return `
    <section class="video-overview-section" id="video-overview">
        <div class="course-overview-card">
            <div class="course-overview-header">
                <h1>video overview</h1>
                <h2>video overview</h2>
            </div>
            <div class="course-overview-content">
                <p>watch the complete <b>${escapeHtml(courseData.course.title)}</b> video lesson with animated typography and narration.</p>
                <div class="course-overview-divider"></div>
                <div class="course-overview-links">
                    <a href="#" id="open-video-modal">watch video lesson</a>
                    ${stageLinks}
                </div>
            </div>
        </div>
    </section>
    `;
}

/**
 * Generates standardized podcast overview section
 */
export function generatePodcastSection(courseData: CourseData, totalStages: number): string {
  const stageLinks = courseData.course.stages
    .map((stage) => 
      `<a href="#" data-stage="${stage.id}">stage ${stage.id}: ${escapeHtml(stage.title.toLowerCase())}</a>`
    )
    .join('\n            ');

  return `
    <section class="podcast-overview-section" id="podcast-overview">
        <div class="course-overview-card">
            <div class="course-overview-header">
                <h1>podcast overview</h1>
                <h2>podcast overview</h2>
            </div>
            <div class="course-overview-content">
                <p>listen to <b>${escapeHtml(courseData.course.title)}</b> as a conversational podcast with two speakers.</p>
                <div class="course-overview-divider"></div>
                <div class="course-overview-links">
                    <a href="#" id="open-podcast-modal">play podcast</a>
                    ${stageLinks}
                </div>
            </div>
        </div>
    </section>
    `;
}

/**
 * Generates standardized course navigation HTML
 */
export function generateCourseNavigation(totalStages: number): string {
  return `
    <div class="course-navigation">
        <div class="course-nav-container">
            <button type="button" id="prev-step" class="course-nav-btn" disabled>Previous</button>
            <div class="course-nav-center">
                <div class="course-progress-wrapper">
                    <div class="course-progress-bar">
                        <div class="course-progress-fill" id="progress-fill"></div>
                    </div>
                </div>
                <span class="course-stage-indicator" id="stage-indicator">1/${totalStages}</span>
            </div>
            <button type="button" id="next-step" class="course-nav-btn">Next</button>
        </div>
    </div>
  `;
}

/**
 * Generates standardized course stages HTML
 * Handles adaptive layout (full-width when no sideCard)
 */
export function generateCourseStages(stages: CourseStage[]): string {
  return stages
    .map((stage, index) => {
      const isActive = index === 0 ? 'active' : '';
      const stageNumber = stage.id;
      
      // Handle content structure (may be wrapped or direct)
      const content = stage.content || { introduction: '', sections: [], summary: '' };
      
      // Generate introduction
      const introduction = content.introduction
        ? `<p>${escapeHtml(content.introduction)}</p>`
        : '';
      
      // Generate objective
      const objective = stage.objective
        ? `<div class="progress-checkpoint">
            <span class="checkpoint-icon">✓</span>
            <strong>Learning Objective:</strong> ${escapeHtml(stage.objective)}
          </div>`
        : '';
      
      // Generate sections
      const sections = content.sections
        ? content.sections.map(section => generateSection(section)).join('\n')
        : '';
      
      // Generate interactive elements
      const interactiveElements = stage.interactiveElements
        ? stage.interactiveElements.map(element => generateInteractiveElement(element, stage.id)).join('\n')
        : '';
      
      // Generate summary
      const summary = content.summary
        ? `<div class="stage-summary">
            <h4>Summary</h4>
            <p>${escapeHtml(content.summary)}</p>
          </div>`
        : '';
      
      // Generate side card
      const sideCard = stage.sideCard
        ? generateSideCard(stage.sideCard)
        : '';
      
      // Adaptive layout: full-width if no sideCard
      const gridColumns = sideCard ? '1fr 300px' : '1fr';
      
      return `
          <section class="course-page ${isActive}" data-stage="${stage.id}" id="page-${stage.id}">
            <div class="page-card" style="grid-template-columns: ${gridColumns};">
              <div class="content-area">
                <h3>${stageNumber} — ${escapeHtml(stage.title)}</h3>
                ${introduction}
                ${objective}
                ${sections}
                ${interactiveElements}
                ${summary}
              </div>
              ${sideCard}
            </div>
          </section>`;
    })
    .join('\n');
}

/**
 * Generates a section with conditional rendering
 * Uses full ImageMetadata structure with attribution, photographer, etc.
 */
function generateSection(section: ContentSection): string {
  let html = '';
  
  if (section.heading) {
    html += `<h4>${escapeHtml(section.heading)}</h4>`;
  }
  
  if (section.content) {
    html += `<p>${escapeHtml(section.content)}</p>`;
  }
  
  if (section.image) {
    const image = section.image as ImageMetadata;
    const mediaType = image.mediaType || 'image';
    const isVideoLoop = mediaType === 'video-loop' || (image.loop && image.autoplay);
    
    if (isVideoLoop) {
      html += `<div style="margin:20px 0;text-align:center;">
        <video src="${escapeHtml(image.url)}" 
               alt="${escapeHtml(section.heading || '')}" 
               style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
               loop autoplay muted playsinline />
        <p style="font-size:12px;color:#666;margin-top:8px;font-style:italic;">
          ${escapeHtml(image.attribution || '')}
          ${image.photographerUrl ? ` — <a href="${escapeHtml(image.photographerUrl)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">View profile</a>` : ''}
        </p>
      </div>`;
    } else {
      html += `<div style="margin:20px 0;text-align:center;">
        <img src="${escapeHtml(image.url)}" 
             alt="${escapeHtml(section.heading || image.attribution || '')}" 
             style="max-width:100%;height:auto;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
             loading="lazy" />
        <p style="font-size:12px;color:#666;margin-top:8px;font-style:italic;">
          ${escapeHtml(image.attribution || '')}
          ${image.photographerUrl ? ` — <a href="${escapeHtml(image.photographerUrl)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">View profile</a>` : ''}
        </p>
      </div>`;
    }
  }
  
  if (section.type === 'list' && section.items && section.items.length > 0) {
    html += '<ul>';
    section.items.forEach(item => {
      html += `<li>${escapeHtml(item)}</li>`;
    });
    html += '</ul>';
  }
  
  return html ? `<div class="section-content">${html}</div>` : '';
}

/**
 * Generates side card HTML
 * Uses SideCardContent structure with title, content, and tips array
 */
function generateSideCard(sideCard: SideCardContent): string {
  if (!sideCard) return '';
  
  let content = '';
  
  if (sideCard.title) {
    content += `<h4>${escapeHtml(sideCard.title)}</h4>`;
  }
  
  if (sideCard.content) {
    content += `<p>${escapeHtml(sideCard.content)}</p>`;
  }
  
  if (sideCard.tips && sideCard.tips.length > 0) {
    content += '<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.05);border-radius:6px;">';
    content += '<strong style="font-size:11px;">💡 Tips:</strong>';
    content += '<ul style="font-size:11px;margin:5px 0 0 0;padding-left:20px;">';
    sideCard.tips.forEach(tip => {
      content += `<li>${escapeHtml(tip)}</li>`;
    });
    content += '</ul>';
    content += '</div>';
  }
  
  return content ? `<aside class="side-card">${content}</aside>` : '';
}

