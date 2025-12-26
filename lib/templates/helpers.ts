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

  const elementId = `interactive-${stageId}-${element.data.id || Math.random().toString(36).substr(2, 9)}`;

  switch (element.type) {
    case 'quiz':
      return generateQuizElement(element, elementId);
    case 'matching':
    case 'dragdrop':
      return generateMatchingElement(element, elementId);
    case 'expandable':
      return generateExpandableElement(element, elementId);
    case 'code-demo':
    case 'code':
      return generateCodeDemoElement(element, elementId);
    case 'video':
      return generateVideoElement(element, elementId);
    case 'audio':
      return generateAudioElement(element, elementId);
    case 'flashcard':
      return generateFlashcardElement(element, elementId);
    case 'canvas':
      return generateCanvasElement(element, elementId);
    default:
      return '';
  }
}

function generateCanvasElement(element: InteractiveElement, elementId: string): string {
  const canvasData = element.data?.canvasData;
  if (!canvasData) return '';

  const canvasId = `canvas-${Math.random().toString(36).substr(2, 9)}`;
  const jsonData = JSON.stringify(canvasData).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); // Escape for JS string

  return `<div class="canvas-container" style="margin: 20px 0; border: 1px solid #eee; background: white; border-radius: 8px; overflow: hidden; display: flex; justify-content: center;">
        <canvas id="${canvasId}" width="800" height="400" style="max-width: 100%; height: auto;"></canvas>
        <script>
            (function() {
                function initCanvas() {
                    try {
                        if (typeof fabric === 'undefined') return;
                        var canvas = new fabric.StaticCanvas('${canvasId}');
                        canvas.loadFromJSON('${jsonData}', function() {
                            canvas.renderAll();
                             // Simple responsive scaling
                            var el = document.getElementById('${canvasId}');
                            var wrapper = el.parentElement;
                            var ratio = canvas.getWidth() / canvas.getHeight();
                            var containerWidth = wrapper.clientWidth;
                            if (containerWidth < canvas.getWidth()) {
                                var scale = containerWidth / canvas.getWidth();
                                canvas.setZoom(scale);
                                canvas.setWidth(containerWidth);
                                canvas.setHeight(containerWidth / ratio);
                            }
                        });
                    } catch(e) { console.error('Canvas render error:', e); }
                }

                if (typeof fabric === 'undefined') {
                    // Check if script is already loading
                    if (!window.fabricScriptLoading) {
                        window.fabricScriptLoading = true;
                        var s = document.createElement('script');
                        s.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
                        s.onload = function() {
                            window.fabricLoaded = true;
                            // Trigger event for other canvases
                            window.dispatchEvent(new Event('fabricLoaded'));
                            initCanvas();
                        };
                        document.head.appendChild(s);
                    } else {
                        window.addEventListener('fabricLoaded', initCanvas);
                    }
                } else {
                    initCanvas();
                }
            })();
        </script>
    </div>`;
}

function generateVideoElement(element: InteractiveElement, elementId: string): string {
  const { url, title, type } = element.data;
  if (!url) return '';

  // Check if it's an iframe (YouTube/Vimeo) or direct file
  const isIframe = url.includes('youtube.com') || url.includes('vimeo.com') || type === 'embed';

  if (isIframe) {
    return `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 10px; margin: 20px 0;">
            <iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
        </div>`;
  }

  return `<div class="video-container" style="margin: 20px 0;">
        ${title ? `<h4>${escapeHtml(title)}</h4>` : ''}
        <video controls style="width: 100%; border-radius: 10px;">
            <source src="${url}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
    </div>`;
}

function generateAudioElement(element: InteractiveElement, elementId: string): string {
  const { url, title } = element.data;
  if (!url) return '';
  return `<div class="audio-container" style="background: #f5f5f5; padding: 15px; border-radius: 10px; margin: 20px 0; display: flex; align-items: center; gap: 15px;">
        <div class="audio-icon">🎧</div>
        <div style="flex: 1;">
            ${title ? `<div style="font-weight: 500; margin-bottom: 5px;">${escapeHtml(title)}</div>` : ''}
            <audio controls style="width: 100%;">
                <source src="${url}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        </div>
    </div>`;
}

function generateFlashcardElement(element: InteractiveElement, elementId: string): string {
  const { front, back } = element.data;
  if (!front || !back) return '';

  return `<div class="flashcard" onclick="this.classList.toggle('flipped')" style="perspective: 1000px; cursor: pointer; height: 200px; margin: 20px 0;">
        <div class="flashcard-inner" style="position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d;">
            <div class="flashcard-front" style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; border: 2px solid #e0e0e0;">
                <div style="font-size: 1.2em; font-weight: 500;">${escapeHtml(front)}</div>
                <div style="position: absolute; bottom: 10px; right: 10px; font-size: 0.8em; color: #999;">Click to flip</div>
            </div>
            <div class="flashcard-back" style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; background: #4a90e2; color: white; transform: rotateY(180deg); padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
                <div style="font-size: 1.2em;">${escapeHtml(back)}</div>
            </div>
        </div>
        <style>
            .flashcard.flipped .flashcard-inner {
                transform: rotateY(180deg);
            }
        </style>
    </div>`;
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

  // Get correct answer - could be in correctAnswer, correct, or default to first option (A)
  const correctAnswer = element.data.correctAnswer || element.data.correct || 'A';
  const correctIndex = typeof correctAnswer === 'number' ? correctAnswer : (correctAnswer.charCodeAt(0) - 65);
  const correctLetter = typeof correctAnswer === 'string' && correctAnswer.length === 1 ? correctAnswer : String.fromCharCode(65 + (correctIndex >= 0 && correctIndex < options.length ? correctIndex : 0));

  return `
    <div class="quiz-question" data-qid="${questionId}" data-correct="${correctLetter}">
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

