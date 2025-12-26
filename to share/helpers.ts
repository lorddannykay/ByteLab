/**
 * Helper functions for course template generation
 */

import { InteractiveElement } from '@/types/course';

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generates HTML for interactive elements
 * Handles the existing format: { type, data } where data contains the content
 */
export function generateInteractiveElement(
  element: InteractiveElement,
  stageId: number
): string {
  if (!element || !element.type || !element.data) return '';
  
  const elementId = `interactive-${stageId}-${element.data.id || '1'}`;
  
  switch (element.type) {
    case 'quiz':
      return generateQuizElement(element, elementId);
    case 'matching':
      return generateMatchingElement(element, elementId);
    case 'expandable':
      return generateExpandableElement(element, elementId);
    case 'code-demo':
      return generateCodeDemoElement(element, elementId);
    default:
      return '';
  }
}

function generateQuizElement(
  element: InteractiveElement,
  elementId: string
): string {
  if (!element.data || !element.data.question) {
    return '';
  }
  
  const options = element.data.options || [];
  const questionId = `q-${elementId}`;
  
  const optionsHtml = options
    .map((opt: string, idx: number) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C, etc.
      return `<span class="choice" data-value="${letter}">${escapeHtml(opt)}</span>`;
    })
    .join('\n                  ');
  
  return `
    <div class="quiz-question" data-qid="${questionId}">
      <strong>${escapeHtml(element.data.question)}</strong><br>
      <div class="quiz-options">
        ${optionsHtml}
      </div>
      ${element.data.explanation ? `<div class="quiz-explanation" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 5px;">${escapeHtml(element.data.explanation)}</div>` : ''}
    </div>`;
}

function generateMatchingElement(
  element: InteractiveElement,
  elementId: string
): string {
  if (!element.data || !element.data.items) {
    return '';
  }
  
  const items = element.data.items;
  const leftItems = items
    .slice(0, Math.ceil(items.length / 2))
    .map((item: any, idx: number) => {
      const label = item.label || item;
      return `<div class="match-item" data-match="${idx}" data-side="left" onclick="selectMatch(this, '${idx}', event)">${escapeHtml(label)}</div>`;
    })
    .join('\n                    ');
  
  const rightItems = items
    .slice(Math.ceil(items.length / 2))
    .map((item: any, idx: number) => {
      const match = item.match || item;
      return `<div class="match-item" data-match="${idx}" data-side="right" onclick="matchWith(this, '${idx}', event)">${escapeHtml(match)}</div>`;
    })
    .join('\n                    ');
  
  return `
    <div class="matching-exercise" id="${elementId}">
      <h4>Match the items:</h4>
      <div style="margin-bottom:10px;">
        ${leftItems}
      </div>
      <div>
        ${rightItems}
      </div>
    </div>`;
}

function generateExpandableElement(
  element: InteractiveElement,
  elementId: string
): string {
  if (!element.data || !element.data.title) {
    return '';
  }
  
  const content = typeof element.data.content === 'string'
    ? `<p>${escapeHtml(element.data.content)}</p>`
    : Array.isArray(element.data.content)
      ? `<ul>${element.data.content.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
  
  return `
    <div class="expandable-section" id="${elementId}">
      <div class="expandable-header" onclick="toggleExpand(this, event)">
        <h5>${escapeHtml(element.data.title)}</h5>
        <span class="expand-icon">▼</span>
      </div>
      <div class="expandable-content">
        ${content}
      </div>
    </div>`;
}

function generateCodeDemoElement(
  element: InteractiveElement,
  elementId: string
): string {
  if (!element.data || !element.data.code) {
    return '';
  }
  
  return `
    <div class="interactive-demo" id="${elementId}">
      <h5>${escapeHtml(element.data.title || 'Code Example')}</h5>
      <div class="code-editor">
        <pre>${escapeHtml(element.data.code)}</pre>
      </div>
      ${element.data.explanation ? `<div class="output-box" id="output-${elementId}"></div>` : ''}
    </div>`;
}
