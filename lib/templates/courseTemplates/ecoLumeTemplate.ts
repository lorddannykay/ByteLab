/**
 * TypeScript generator function for EcoLume course template
 * Transforms website template into dynamic microlearning course
 * Uses original CSS and JavaScript from static files with dynamic color/stage substitution
 */

import { CourseData, CourseConfig } from '@/types/course';
import { escapeHtml, generateInteractiveElement } from '../helpers';
import { 
  generateCourseOverview, 
  generateVideoSection, 
  generatePodcastSection, 
  generateCourseNavigation, 
  generateCourseStages 
} from './baseTemplate';

export function generateEcoLumeTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const totalStages = courseData.course.stages.length;
  // Map existing config colors (accentColor1, accentColor2) to template colors
  const colors = {
    primary: config?.accentColor1 || config?.colors?.primary || '#00ff88',
    secondary: config?.accentColor2 || config?.colors?.secondary || '#2d5a27',
    accent: config?.colors?.accent || '#00d4ff',
    background: config?.colors?.background || '#0a1a0a',
    text: config?.colors?.text || '#ffffff',
    ...config?.colors,
  };

  // Generate CSS with custom properties
  const css = generateEcoLumeCSS(colors);
  
  // Generate JavaScript
  const js = generateEcoLumeJS(totalStages);
  
  // Generate course overview section (birb pattern)
  const courseOverview = generateCourseOverview(courseData, totalStages);
  
  // Generate video section (if enabled)
  const videoSection = config?.includeVideo
    ? generateVideoSection(courseData, totalStages)
    : '';
  
  // Generate podcast section (if enabled)
  const podcastSection = config?.includePodcast
    ? generatePodcastSection(courseData, totalStages)
    : '';
  
  // Generate course navigation
  const courseNavigation = generateCourseNavigation(totalStages);
  
  // Generate course stages in original EcoLume format
  const courseStages = generateEcoLumeStages(courseData.course.stages);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ByteAI — Microlearning: ${escapeHtml(courseData.course.title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-1.7.2.js"></script>
    <style>
${css}
    </style>
</head>
<body>
    <!-- Background Elements -->
    <div class="bio-bg"></div>
    <div class="organic-shapes">
        <div class="leaf leaf-1"></div>
        <div class="leaf leaf-2"></div>
        <div class="leaf leaf-3"></div>
    </div>
    <div class="particle-system" id="particleSystem"></div>

    <!-- Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <a href="#home" class="logo">
                <div class="logo-icon"></div>
                <span class="logo-text">BYTEAI</span>
                <span class="course-title">${escapeHtml(courseData.course.title)}</span>
            </a>
            <ul class="nav-menu" id="navMenu">
                <li><a href="#course-overview" class="nav-link active">COURSE</a></li>
                ${config?.includeVideo ? '<li><a href="#video-overview" class="nav-link">VIDEO</a></li>' : ''}
                ${config?.includePodcast ? '<li><a href="#podcast-overview" class="nav-link">PODCAST</a></li>' : ''}
            </ul>
            <div class="menu-toggle" id="menuToggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Course Overview Section (Birb Pattern) -->
    <section class="course-overview-section" id="course-overview">
        ${courseOverview}
    </section>

    ${videoSection}
    ${podcastSection}

    ${courseNavigation}

    <!-- Course Stages -->
    ${courseStages}

    <script>
${js}
    </script>
</body>
</html>`;
}


function generateEcoLumeCSS(colors: Record<string, string>): string {
  const primary = colors.primary || '#00ff88';
  const secondary = colors.secondary || '#2d5a27';
  const accent = colors.accent || '#00d4ff';
  const background = colors.background || '#0a1a0a';
  const text = colors.text || '#ffffff';
  
  // Extract RGB values for rgba colors
  const primaryRgb = hexToRgb(primary);
  const accentRgb = hexToRgb(accent);
  
  // Generate CSS based on original EcoLume template structure
  return `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-green: ${primary};
  --secondary-green: ${secondary};
  --accent-blue: ${accent};
  --warm-yellow: #ffeb3b;
  --deep-forest: ${background};
  --light-mint: #e8fff0;
  --glow-green: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 255, 136, 0.3)'};
  --glow-blue: ${accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)` : 'rgba(0, 212, 255, 0.3)'};
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, ${background} 0%, #1a2f1a 50%, #0f1f0f 100%);
  color: ${text};
  overflow-x: hidden;
  position: relative;
}

/* Course Overview Section (Birb Pattern) */
.course-overview-section {
  padding: 120px 40px 60px;
  max-width: 1400px;
  margin: 0 auto;
}

.course-overview-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
}

.course-overview-header h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.course-overview-header h2 {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.course-overview-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.course-overview-divider {
  height: 1px;
  background: rgba(0, 255, 136, 0.2);
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
  background: rgba(0, 255, 136, 0.1);
  border-color: ${primary};
  transform: translateX(5px);
}

.course-overview-info {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

/* Course Navigation */
.course-navigation {
  position: sticky;
  top: 80px;
  z-index: 100;
  background: rgba(10, 26, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
  padding: 20px 40px;
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
  background: linear-gradient(135deg, ${primary}, ${accent});
  color: ${background};
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.course-nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.course-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${primary}, ${accent});
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
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-align: center;
}

.course .sub {
  font-size: 1.3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
  display: grid;
  gap: 40px;
}

.content-area h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
}

.content-area h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${primary};
  margin: 32px 0 16px;
}

.content-area p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.content-area ul {
  margin: 20px 0;
  padding-left: 30px;
}

.content-area li {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.progress-checkpoint {
  background: rgba(0, 255, 136, 0.1);
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 120px;
}

.side-card h4 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${primary};
  margin-bottom: 16px;
}

.side-card p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;
}

/* Interactive Elements */
.interactive-quiz,
.matching-exercise,
.expandable-section,
.interactive-demo {
  margin: 32px 0;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 16px;
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
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-option:hover {
  background: rgba(0, 255, 136, 0.1);
  border-color: ${primary};
}

.submit-quiz {
  padding: 12px 24px;
  background: linear-gradient(135deg, ${primary}, ${accent});
  color: ${background};
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
  background: rgba(0, 255, 136, 0.05);
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

/* Background Elements - Original EcoLume Styles */
.bio-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 30%, ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(0, 255, 136, 0.1)'} 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, ${accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.08)` : 'rgba(0, 212, 255, 0.08)'} 0%, transparent 40%);
  animation: bio-pulse 8s ease-in-out infinite;
  z-index: -3;
}

@keyframes bio-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.organic-shapes {
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -2;
}

.leaf {
  position: absolute;
  opacity: 0.1;
  animation: float-organic 20s ease-in-out infinite;
}

.leaf-1 {
  width: 80px;
  height: 120px;
  background: linear-gradient(45deg, ${primary}, ${accent});
  clip-path: ellipse(40% 60% at 50% 40%);
  top: 20%;
  left: 10%;
}

.leaf-2 {
  width: 60px;
  height: 90px;
  background: linear-gradient(45deg, ${accent}, #ffeb3b);
  clip-path: ellipse(35% 65% at 50% 35%);
  top: 60%;
  right: 15%;
  animation-delay: -5s;
}

.leaf-3 {
  width: 100px;
  height: 150px;
  background: linear-gradient(45deg, #ffeb3b, ${primary});
  clip-path: ellipse(45% 70% at 50% 30%);
  bottom: 20%;
  left: 20%;
  animation-delay: -10s;
}

@keyframes float-organic {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.1; }
  25% { transform: translateY(-20px) rotate(90deg) scale(1.1); opacity: 0.2; }
  50% { transform: translateY(10px) rotate(180deg) scale(0.9); opacity: 0.15; }
  75% { transform: translateY(-10px) rotate(270deg) scale(1.05); opacity: 0.18; }
}

.particle-system {
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.bio-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: ${primary};
  border-radius: 50%;
  box-shadow: 0 0 10px ${primary};
  animation: bio-float 15s linear infinite;
}

@keyframes bio-float {
  0% { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
  10% { opacity: 1; transform: translateY(90vh) translateX(10px) scale(1); }
  90% { opacity: 1; transform: translateY(10vh) translateX(-10px) scale(1); }
  100% { transform: translateY(-10vh) translateX(0) scale(0); opacity: 0; }
}

/* Navigation - Original EcoLume Styles */
nav {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px 40px;
  background: rgba(10, 26, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
  z-index: 1000;
  transition: all 0.4s ease;
}

nav.scrolled {
  padding: 15px 40px;
  background: rgba(10, 26, 10, 0.95);
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, ${primary}, ${accent});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: logo-glow 3s ease-in-out infinite;
}

.logo-icon::before {
  content: '🌿';
  font-size: 24px;
  animation: logo-rotate 6s linear infinite;
}

@keyframes logo-glow {
  0%, 100% { box-shadow: 0 0 20px ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 255, 136, 0.3)'}; }
  50% { box-shadow: 0 0 30px ${accentRgb ? `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)` : 'rgba(0, 212, 255, 0.3)'}; }
}

@keyframes logo-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, ${primary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.course-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid rgba(0, 255, 136, 0.3);
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 50px;
  border: 1px solid rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(20px);
}

.nav-menu a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  position: relative;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.95rem;
  white-space: nowrap;
}

.nav-menu a:hover {
  color: ${background};
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
  background: linear-gradient(135deg, ${primary}, ${accent});
}

.nav-menu a.active {
  color: ${background};
  background: linear-gradient(135deg, ${primary}, ${accent});
  box-shadow: 0 4px 20px rgba(0, 255, 136, 0.4);
}

.menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 4px;
}

.menu-toggle span {
  width: 25px;
  height: 2px;
  background: ${primary};
  transition: all 0.3s ease;
  border-radius: 2px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    position: fixed;
    top: 85px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 85px);
    background: rgba(10, 26, 10, 0.98);
    flex-direction: column;
    align-items: center;
    justify-content: start;
    padding-top: 60px;
    transition: left 0.3s ease;
  }

  .nav-menu.active {
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

function generateEcoLumeJS(totalStages: number): string {
  // Generate JavaScript based on original EcoLume template structure
  return `
(function() {
  'use strict';
  
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded!');
    return;
  }

  // Course state
  var currentStage = 1;
  var totalStages = ${totalStages};
  var quizAnswers = {};
  var userAnswers = {};

  // Particle system
  function createBioParticles() {
    const particleSystem = document.getElementById('particleSystem');
    if (!particleSystem) return;
    
    const particleCount = 50;
    const colors = ['#00ff88', '#00d4ff', '#ffeb3b'];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'bio-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = randomColor;
      particle.style.boxShadow = \`0 0 10px \${randomColor}\`;
      particleSystem.appendChild(particle);
    }
  }

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50 && navbar) {
      navbar.classList.add('scrolled');
    } else if (navbar) {
      navbar.classList.remove('scrolled');
    }
  });

  // Course navigation
  function goToStage(stage, isNavigation) {
    if (stage < 1 || stage > totalStages) return;
    
    currentStage = stage;
    
    // Hide all stages
    document.querySelectorAll('.course-page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Show current stage
    const currentPage = document.getElementById('page-' + stage);
    if (currentPage) {
      currentPage.classList.add('active');
    }
    
    // Update progress
    updateProgress();
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    if (prevBtn) prevBtn.disabled = stage === 1;
    if (nextBtn) nextBtn.disabled = stage === totalStages;
    
    // Update stage indicator
    const indicator = document.getElementById('stage-indicator');
    if (indicator) indicator.textContent = stage + '/' + totalStages;
    
    // Scroll to top
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

  // Navigation button handlers
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

    // Stage link handlers
    $('[data-stage]').on('click', function(e) {
      e.preventDefault();
      const stage = parseInt($(this).attr('data-stage'));
      if (stage) {
        goToStage(stage, true);
      }
    });

    // Quiz submission
    $('.submit-quiz').on('click', function() {
      const quizId = $(this).data('quiz-id');
      const form = $(this).closest('.quiz-form');
      const results = $('#' + quizId + '-results');
      
      // Collect answers
      const answers = {};
      form.find('input[type="radio"]:checked').each(function() {
        const questionId = $(this).data('question');
        const value = $(this).val();
        answers[questionId] = value;
      });
      
      // Calculate score (simplified - you'll need to implement actual quiz logic)
      const totalQuestions = form.find('.quiz-question').length;
      const correctAnswers = Object.keys(answers).length; // Simplified
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      results.html('<p>Score: ' + score + '%</p>').show();
    });

    // Expandable sections
    window.toggleExpand = function(header, event) {
      if (event) event.preventDefault();
      const section = $(header).closest('.expandable-section');
      section.toggleClass('expanded');
    };

    // Initialize
    createBioParticles();
    updateProgress();
    goToStage(1, false);
  });
})();
`;
}

/**
 * Generates course stages in the original EcoLume format
 * Uses <section class="course-stage"> with data-stage attributes
 */
function generateEcoLumeStages(stages: CourseData['course']['stages']): string {
  return stages
    .map((stage, index) => {
      const isActive = index === 0 ? 'active' : '';
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
        ? content.sections.map(section => {
            let sectionHTML = '';
            if (section.heading) {
              sectionHTML += `<h4>${escapeHtml(section.heading)}</h4>`;
            }
            if (section.content) {
              sectionHTML += `<p>${escapeHtml(section.content)}</p>`;
            }
            if (section.image) {
              const image = section.image;
              const mediaType = image.mediaType || 'image';
              const isVideoLoop = mediaType === 'video-loop' || (image.loop && image.autoplay);
              
              if (isVideoLoop) {
                sectionHTML += `<div style="margin:20px 0;text-align:center;">
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
                sectionHTML += `<div style="margin:20px 0;text-align:center;">
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
              sectionHTML += '<ul>';
              section.items.forEach(item => {
                sectionHTML += `<li>${escapeHtml(item)}</li>`;
              });
              sectionHTML += '</ul>';
            }
            return sectionHTML ? `<div class="section-content">${sectionHTML}</div>` : '';
          }).join('\n')
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
        ? (() => {
            let cardHTML = '';
            if (stage.sideCard.title) {
              cardHTML += `<h4>${escapeHtml(stage.sideCard.title)}</h4>`;
            }
            if (stage.sideCard.content) {
              cardHTML += `<p>${escapeHtml(stage.sideCard.content)}</p>`;
            }
            if (stage.sideCard.tips && stage.sideCard.tips.length > 0) {
              cardHTML += '<div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.05);border-radius:6px;">';
              cardHTML += '<strong style="font-size:11px;">💡 Tips:</strong>';
              cardHTML += '<ul style="font-size:11px;margin:5px 0 0 0;padding-left:20px;">';
              stage.sideCard.tips.forEach(tip => {
                cardHTML += `<li>${escapeHtml(tip)}</li>`;
              });
              cardHTML += '</ul></div>';
            }
            return cardHTML ? `<aside class="side-card">${cardHTML}</aside>` : '';
          })()
        : '';
      
      // Determine section class based on stage index (matching original structure)
      let sectionClass = 'hero';
      if (index === 1) sectionClass = 'features';
      else if (index === 2) sectionClass = 'about';
      else if (index >= 3) sectionClass = 'contact';
      
      // Adaptive layout: full-width if no sideCard
      const gridColumns = sideCard ? '1fr 300px' : '1fr';
      
      return `
    <section class="${sectionClass} course-stage ${isActive}" id="stage-${stage.id}" data-stage="${stage.id}">
        <div class="hero-content" style="max-width: 1400px; width: 100%; margin: 0 auto; padding: 40px;">
            <div class="page-card" style="grid-template-columns: ${gridColumns}; display: grid; gap: 40px;">
                <div class="content-area">
                    <h3>${stage.id} — ${escapeHtml(stage.title)}</h3>
                    ${introduction}
                    ${objective}
                    ${sections}
                    ${interactiveElements}
                    ${summary}
                </div>
                ${sideCard}
            </div>
        </div>
    </section>`;
    })
    .join('\n');
}

