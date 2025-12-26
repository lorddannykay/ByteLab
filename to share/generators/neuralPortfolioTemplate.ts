/**
 * TypeScript generator function for Neural Portfolio course template
 * Cyberpunk/neural network themed template with animated canvas background
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

export function generateNeuralPortfolioTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const totalStages = courseData.course.stages.length;
  // Map existing config colors (accentColor1, accentColor2) to template colors
  const colors = {
    primary: config?.accentColor1 || config?.colors?.primary || '#00ffff',
    secondary: config?.accentColor2 || config?.colors?.secondary || '#ff00ff',
    accent: config?.colors?.accent || '#ffff00',
    background: config?.colors?.background || '#0a0a0a',
    text: config?.colors?.text || '#ffffff',
    ...config?.colors,
  };

  const css = generateNeuralPortfolioCSS(colors);
  const js = generateNeuralPortfolioJS(totalStages);
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
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Exo+2:wght@300;400;500;600;700&family=Audiowide&display=swap" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-1.7.2.js"></script>
    <style>
${css}
    </style>
</head>
<body>
    <canvas id="neural-bg"></canvas>

    <nav id="navbar">
        <div class="nav-container">
            <a href="#course-overview" class="logo-container">
                <svg class="logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="20" r="8" fill="none" stroke="${colors.primary}" stroke-width="2"/>
                    <circle cx="25" cy="50" r="8" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
                    <circle cx="75" cy="50" r="8" fill="none" stroke="${colors.secondary}" stroke-width="2"/>
                    <circle cx="50" cy="80" r="8" fill="none" stroke="${colors.accent}" stroke-width="2"/>
                    <line x1="50" y1="28" x2="25" y2="42" stroke="${colors.primary}" stroke-width="1" opacity="0.6"/>
                    <line x1="50" y1="28" x2="75" y2="42" stroke="${colors.primary}" stroke-width="1" opacity="0.6"/>
                    <line x1="25" y1="58" x2="50" y2="72" stroke="${colors.secondary}" stroke-width="1" opacity="0.6"/>
                    <line x1="75" y1="58" x2="50" y2="72" stroke="${colors.secondary}" stroke-width="1" opacity="0.6"/>
                    <circle cx="50" cy="50" r="5" fill="${colors.primary}"/>
                </svg>
                <span class="logo-text">BYTEAI</span>
                <span class="course-title">${escapeHtml(courseData.course.title)}</span>
            </a>
            
            <div class="mobile-menu-toggle" id="mobile-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            
            <div class="nav-menu" id="nav-menu">
                <ul>
                    <li><a href="#course-overview" class="nav-link active">COURSE</a></li>
                    ${config?.includeVideo ? '<li><a href="#video-overview" class="nav-link">VIDEO</a></li>' : ''}
                    ${config?.includePodcast ? '<li><a href="#podcast-overview" class="nav-link">PODCAST</a></li>' : ''}
                </ul>
            </div>
        </div>
    </nav>

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

function generateNeuralPortfolioCSS(colors: Record<string, string>): string {
  const primary = colors.primary || '#00ffff';
  const secondary = colors.secondary || '#ff00ff';
  const accent = colors.accent || '#ffff00';
  const background = colors.background || '#0a0a0a';
  const text = colors.text || '#ffffff';
  
  const primaryRgb = hexToRgb(primary);
  const secondaryRgb = hexToRgb(secondary);
  
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
  --bg-dark: ${background};
  --bg-glass: rgba(255, 255, 255, 0.05);
  --text-primary: ${text};
  --text-secondary: #b0b0b0;
}

body {
  font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: ${background};
  color: ${text};
  overflow-x: hidden;
  position: relative;
  line-height: 1.6;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.03)` : 'rgba(0, 255, 255, 0.03)'} 2px,
    ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.03)` : 'rgba(0, 255, 255, 0.03)'} 4px
  );
  pointer-events: none;
  z-index: 1;
}

#neural-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.3;
}

/* Navigation */
nav {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 15px 50px;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  transition: all 0.3s ease;
  border-bottom: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
}

nav.scrolled {
  padding: 10px 50px;
  background: rgba(10, 10, 10, 0.98);
  box-shadow: 0 5px 20px ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(0, 255, 255, 0.1)'};
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-svg {
  width: 50px;
  height: 50px;
}

.logo-text {
  font-family: 'Audiowide', sans-serif;
  font-size: 1.5rem;
  font-weight: 400;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.course-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 255, 255, 0.3)'};
}

.nav-menu {
  position: relative;
}

.nav-menu::before,
.nav-menu::after {
  content: '';
  position: absolute;
  height: 1px;
  width: 50px;
  background: linear-gradient(90deg, transparent, ${primary});
  top: 50%;
  transform: translateY(-50%);
}

.nav-menu::before {
  left: -60px;
}

.nav-menu::after {
  right: -60px;
  background: linear-gradient(90deg, ${primary}, transparent);
}

.nav-menu ul {
  list-style: none;
  display: flex;
  gap: 40px;
}

.nav-menu a {
  font-family: 'Audiowide', sans-serif;
  color: ${text};
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 400;
  letter-spacing: 1px;
  padding: 5px 0;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.nav-menu a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  transition: width 0.3s ease;
}

.nav-menu a:hover::after,
.nav-menu a.active::after {
  width: 100%;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  z-index: 1001;
  gap: 5px;
}

.mobile-menu-toggle span {
  width: 30px;
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
}

.course-overview-header h1 {
  font-family: 'Audiowide', sans-serif;
  font-size: 2.5rem;
  font-weight: 400;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 3px;
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
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
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
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(0, 255, 255, 0.1)'};
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
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
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
  background: linear-gradient(90deg, ${primary}, ${secondary});
  color: ${background};
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Audiowide', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.course-nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)` : 'rgba(0, 255, 255, 0.3)'};
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
  font-family: 'Audiowide', sans-serif;
}

/* Course Content */
.course {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}

.course .title {
  font-family: 'Audiowide', sans-serif;
  font-size: 3.5rem;
  font-weight: 400;
  background: linear-gradient(90deg, ${primary}, ${secondary}, ${accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
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
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
  border-radius: 24px;
  padding: 48px;
  backdrop-filter: blur(20px);
  display: grid;
  gap: 40px;
}

.content-area h3 {
  font-family: 'Audiowide', sans-serif;
  font-size: 2.5rem;
  font-weight: 400;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.content-area h4 {
  font-family: 'Exo 2', sans-serif;
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
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(0, 255, 255, 0.1)'};
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
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 120px;
}

.side-card h4 {
  font-family: 'Exo 2', sans-serif;
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
  border: 1px solid ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)` : 'rgba(0, 255, 255, 0.2)'};
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
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)` : 'rgba(0, 255, 255, 0.1)'};
  border-color: ${primary};
}

.submit-quiz {
  padding: 12px 24px;
  background: linear-gradient(90deg, ${primary}, ${secondary});
  color: ${background};
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  font-family: 'Audiowide', sans-serif;
  text-transform: uppercase;
}

.expandable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 16px;
  background: ${primaryRgb ? `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)` : 'rgba(0, 255, 255, 0.05)'};
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
  .nav-menu {
    position: fixed;
    top: 85px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 85px);
    background: rgba(10, 10, 10, 0.98);
    flex-direction: column;
    align-items: center;
    justify-content: start;
    padding-top: 60px;
    transition: left 0.3s ease;
  }

  .nav-menu.active {
    left: 0;
  }

  .mobile-menu-toggle {
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

function generateNeuralPortfolioJS(totalStages: number): string {
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

  // Neural Network Background Animation
  const canvas = document.getElementById('neural-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let mouse = { x: 0, y: 0 };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Node {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
      }
    }

    function init() {
      nodes = [];
      for (let i = 0; i < 100; i++) {
        nodes.push(new Node(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }
    }

    function connectNodes() {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = \`rgba(0, 255, 255, \${1 - distance / 150})\`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(node => {
        node.update();
        node.draw();
      });

      connectNodes();
      requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
  }

  // Mobile menu
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
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

