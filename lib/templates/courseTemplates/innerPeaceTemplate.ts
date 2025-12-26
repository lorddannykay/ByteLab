/**
 * TypeScript generator function for Inner Peace course template
 * Mindfulness-themed template with geometric patterns
 */

import { CourseData, CourseConfig } from '@/types/course';
import { escapeHtml } from '../helpers';
import { 
  generateCourseOverview, 
  generateVideoSection, 
  generatePodcastSection, 
  generateCourseNavigation, 
  generateCourseStages 
} from './baseTemplate';

export function generateInnerPeaceTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const totalStages = courseData.course.stages.length;
  // Map existing config colors (accentColor1, accentColor2) to template colors
  const colors = {
    primary: config?.accentColor1 || config?.colors?.primary || '#2D5A87',
    secondary: config?.accentColor2 || config?.colors?.secondary || '#4A7C8A',
    accent: config?.colors?.accent || '#6B9B7A',
    background: config?.colors?.background || '#F7F7F7',
    text: config?.colors?.text || '#2A2A3E',
    ...config?.colors,
  };

  const css = generateInnerPeaceCSS(colors);
  const js = generateInnerPeaceJS(totalStages);
  const courseOverview = generateCourseOverview(courseData, totalStages);
  const videoSection = config?.includeVideo ? generateVideoSection(courseData, totalStages) : '';
  const podcastSection = config?.includePodcast ? generatePodcastSection(courseData, totalStages) : '';
  const courseNavigation = generateCourseNavigation(totalStages);
  const courseStages = generateCourseStages(courseData.course.stages);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ByteAI — Microlearning: ${escapeHtml(courseData.course.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Segoe+UI:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-1.7.2.js"></script>
    <style>
${css}
    </style>
</head>
<body>
    <div class="geometric-bg"></div>

    <header id="navbar">
        <nav>
            <a href="#course-overview" class="logo">
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGradient)" stroke-width="2"/>
                    <circle cx="20" cy="20" r="14" fill="none" stroke="url(#logoGradient)" stroke-width="1.5" opacity="0.7"/>
                    <circle cx="20" cy="20" r="10" fill="none" stroke="url(#logoGradient)" stroke-width="1" opacity="0.5"/>
                    <circle cx="20" cy="20" r="3" fill="url(#logoGradient)"/>
                </svg>
                <span class="logo-text">BYTEAI</span>
                <span class="course-title">${escapeHtml(courseData.course.title)}</span>
            </a>
            <div class="menu-toggle" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul class="nav-links">
                <li><a href="#course-overview" class="nav-link active">COURSE</a></li>
                ${config?.includeVideo ? '<li><a href="#video-overview" class="nav-link">VIDEO</a></li>' : ''}
                ${config?.includePodcast ? '<li><a href="#podcast-overview" class="nav-link">PODCAST</a></li>' : ''}
            </ul>
        </nav>
    </header>

    <section class="course-overview-section" id="course-overview">
        ${courseOverview}
    </section>

    ${videoSection}
    ${podcastSection}

    ${courseNavigation}

    <div class="course" id="course-root">
        <h1 class="title">${escapeHtml(courseData.course.title)}</h1>
        <p class="sub">${escapeHtml(courseData.course.description)}</p>
        
        ${courseStages}
    </div>

    <script>
${js}
    </script>
</body>
</html>`;
}

function generateInnerPeaceCSS(colors: Record<string, string>): string {
  const primary = colors.primary || '#2D5A87';
  const secondary = colors.secondary || '#4A7C8A';
  const accent = colors.accent || '#6B9B7A';
  const background = colors.background || '#F7F7F7';
  const text = colors.text || '#2A2A3E';
  
  const primaryRgb = hexToRgb(primary);
  
  return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: ${primary};
  --secondary: ${secondary};
  --accent: ${accent};
  --light: ${background};
  --dark: ${text};
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: ${text};
  background: ${background};
  overflow-x: hidden;
}

.geometric-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.03;
  background-image:
    repeating-linear-gradient(45deg, transparent, transparent 35px, ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'} 35px, ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'} 70px),
    repeating-linear-gradient(-45deg, transparent, transparent 35px, ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'} 35px, ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'} 70px);
}

header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 5%;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo svg {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: bold;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.course-title {
  font-size: 14px;
  color: rgba(42, 42, 62, 0.8);
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(45, 90, 135, 0.3)'};
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2.5rem;
}

.nav-links a {
  text-decoration: none;
  color: ${text};
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.nav-links a:hover {
  color: ${primary};
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)` : 'rgba(45, 90, 135, 0.05)'};
  border-color: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
}

.nav-links a.active {
  color: white;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  border-color: ${primary};
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: ${primary};
  transition: all 0.3s ease;
}

/* Course Overview Section */
.course-overview-section {
  padding: 120px 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.course-overview-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.course-overview-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.course-overview-header h2 {
  font-size: 1.2rem;
  color: rgba(42, 42, 62, 0.6);
  margin-bottom: 24px;
}

.course-overview-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(42, 42, 62, 0.8);
  margin-bottom: 20px;
}

.course-overview-divider {
  height: 1px;
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  margin: 24px 0;
}

.course-overview-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.course-overview-links a {
  color: ${primary};
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.course-overview-links a:hover {
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'};
  border-color: ${primary};
  transform: translateX(5px);
}

.course-overview-info {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(42, 42, 62, 0.7);
}

/* Course Navigation */
.course-navigation {
  position: sticky;
  top: 80px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  padding: 20px 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.course-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.course-nav-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(45, 90, 135, 0.3)'};
}

.course-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-nav-center {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: center;
}

.course-progress-wrapper {
  flex: 1;
  max-width: 400px;
}

.course-progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.course-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  width: 0%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.course-stage-indicator {
  font-weight: 600;
  color: ${primary};
  min-width: 60px;
  text-align: center;
}

/* Course Content */
.course {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.course .title {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-align: center;
}

.course .sub {
  font-size: 1.3rem;
  text-align: center;
  color: rgba(42, 42, 62, 0.8);
  margin-bottom: 60px;
}

.course-page {
  display: none;
  animation: fadeIn 0.5s ease;
}

.course-page.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
  display: grid;
  gap: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.content-area h3 {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
}

.content-area h4 {
  font-size: 1.8rem;
  font-weight: 600;
  color: ${primary};
  margin: 32px 0 16px;
}

.content-area p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(42, 42, 62, 0.8);
  margin-bottom: 20px;
}

.content-area ul {
  margin: 20px 0;
  padding-left: 30px;
}

.content-area li {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(42, 42, 62, 0.8);
  margin-bottom: 12px;
}

.progress-checkpoint {
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'};
  border: 1px solid ${primary};
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  display: flex;
  align-items: start;
  gap: 12px;
}

.checkpoint-icon {
  color: ${primary};
  font-size: 1.5rem;
  flex-shrink: 0;
}

.side-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 120px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.side-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: ${primary};
  margin-bottom: 16px;
}

.side-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(42, 42, 62, 0.7);
  margin-bottom: 12px;
}

/* Interactive Elements */
.interactive-quiz,
.matching-exercise,
.expandable-section,
.interactive-demo {
  margin: 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.quiz-question {
  margin-bottom: 24px;
}

.quiz-question h5 {
  color: ${primary};
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(45, 90, 135, 0.2)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-option:hover {
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(45, 90, 135, 0.1)'};
  border-color: ${primary};
}

.submit-quiz {
  padding: 12px 24px;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.expandable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 16px;
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)` : 'rgba(45, 90, 135, 0.05)'};
  border-radius: 8px;
}

.expandable-content {
  display: none;
  padding: 16px;
  margin-top: 12px;
}

.expandable-section.expanded .expandable-content {
  display: block;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.expandable-section.expanded .expand-icon {
  transform: rotate(180deg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 70px;
    left: -100%;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);
    flex-direction: column;
    padding: 20px;
    transition: left 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .nav-links.active {
    left: 0;
  }

  .menu-toggle {
    display: flex;
  }

  .page-card {
    grid-template-columns: 1fr;
  }

  .side-card {
    position: static;
  }

  .course {
    padding: 20px;
  }
}
`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function generateInnerPeaceJS(totalStages: number): string {
  return `
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

  function toggleMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    }
  }

  window.toggleMenu = toggleMenu;

  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinksContainer = document.querySelector('.nav-links');
        if (menuToggle && navLinksContainer) {
          menuToggle.classList.remove('active');
          navLinksContainer.classList.remove('active');
        }
      });
    });

    const header = document.querySelector('header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.98)';
          header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
          header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
      });
    }
  });

  // Course navigation
  function goToStage(stage, isNavigation) {
    if (stage < 1 || stage > totalStages) return;
    
    currentStage = stage;
    
    document.querySelectorAll('.course-page').forEach(page => {
      page.classList.remove('active');
    });
    
    const currentPage = document.getElementById('page-' + stage);
    if (currentPage) {
      currentPage.classList.add('active');
    }
    
    updateProgress();
    
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    if (prevBtn) prevBtn.disabled = stage === 1;
    if (nextBtn) nextBtn.disabled = stage === totalStages;
    
    const indicator = document.getElementById('stage-indicator');
    if (indicator) indicator.textContent = stage + '/' + totalStages;
    
    if (isNavigation) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateProgress() {
    const progress = (currentStage / totalStages) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
  }

  jQuery(document).ready(function($) {
    $('#next-step').on('click', function() {
      if (currentStage < totalStages) {
        goToStage(currentStage + 1, true);
      }
    });

    $('#prev-step').on('click', function() {
      if (currentStage > 1) {
        goToStage(currentStage - 1, true);
      }
    });

    $('[data-stage]').on('click', function(e) {
      e.preventDefault();
      const stage = parseInt($(this).attr('data-stage'));
      if (stage) {
        goToStage(stage, true);
      }
    });

    $('.submit-quiz').on('click', function() {
      const quizId = $(this).data('quiz-id');
      const form = $(this).closest('.quiz-form');
      const results = $('#' + quizId + '-results');
      
      const answers = {};
      form.find('input[type="radio"]:checked').each(function() {
        const questionId = $(this).data('question');
        const value = $(this).val();
        answers[questionId] = value;
      });
      
      const totalQuestions = form.find('.quiz-question').length;
      const correctAnswers = Object.keys(answers).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      results.html('<p>Score: ' + score + '%</p>').show();
    });

    window.toggleExpand = function(header, event) {
      if (event) event.preventDefault();
      const section = $(header).closest('.expandable-section');
      section.toggleClass('expanded');
    };

    updateProgress();
    goToStage(1, false);
  });
})();
`;
}

