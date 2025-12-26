/**
 * Editorial Template Generator
 * Converts html5up-editorial template into dynamic course template
 * Uses sidebar navigation with main content area (magazine/blog style)
 */

import { CourseData, CourseConfig, CourseStage, ContentSection, ImageMetadata } from '@/types/course';
import { escapeHtml, generateInteractiveElement } from '../helpers';

export function generateEditorialTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const totalStages = course.stages.length;
  const accent1 = config?.accentColor1 || '#f56a6a';
  const accent2 = config?.accentColor2 || '#4a90e2';

  // Generate sidebar menu navigation
  const menuItems = course.stages
    .map((stage, index) => `<li><a href="#stage-${stage.id}">${index + 1}. ${escapeHtml(stage.title)}</a></li>`)
    .join('\n\t\t\t\t\t\t\t\t');

  // Generate banner content
  const bannerImage = course.stages[0]?.content?.sections?.find(s => s.image)?.image || null;
  const bannerImageHtml = bannerImage 
    ? `<span class="image object">
        <img src="${escapeHtml(bannerImage.url || bannerImage.src || '')}" alt="${escapeHtml(bannerImage.alt || course.title)}" />
      </span>`
    : '';

  // Generate features section (course highlights)
  const features = course.stages.slice(0, 4).map((stage, index) => {
    const icon = getStageIcon(index);
    return `\t\t\t\t\t\t\t<article>
              <span class="icon ${icon}"></span>
              <div class="content">
                <h3>${escapeHtml(stage.title)}</h3>
                <p>${escapeHtml(stage.objective || stage.content?.introduction || '')}</p>
              </div>
            </article>`;
  }).join('\n');

  // Generate posts (course stages)
  const posts = course.stages
    .map((stage) => generateStagePost(stage))
    .join('\n\n\t\t\t\t\t\t\t');

  // Get CSS and JS
  const css = generateEditorialCSS(accent1, accent2);
  const js = generateEditorialJS();

  return `<!DOCTYPE HTML>
<html>
	<head>
		<title>${escapeHtml(course.title)}</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
		<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,400italic,600italic|Roboto+Slab:400,700" rel="stylesheet">
		<style>
${css}
		</style>
	</head>
	<body class="is-preload">

		<!-- Wrapper -->
			<div id="wrapper">

				<!-- Main -->
					<div id="main">
						<div class="inner">

							<!-- Header -->
								<header id="header">
									<a href="#" class="logo"><strong>${escapeHtml(course.title)}</strong></a>
								</header>

							<!-- Banner -->
								<section id="banner">
									<div class="content">
										<header>
											<h1>${escapeHtml(course.title)}</h1>
											${course.subtitle ? `<p>${escapeHtml(course.subtitle)}</p>` : ''}
										</header>
										${course.description && course.description !== course.subtitle ? `<p>${escapeHtml(course.description)}</p>` : '<p>Welcome to this comprehensive course. Explore each stage to learn and grow.</p>'}
									</div>
									${bannerImageHtml}
								</section>

							<!-- Section - Features -->
								<section>
									<header class="major">
										<h2>Course Overview</h2>
									</header>
									<div class="features">
${features}
									</div>
								</section>

							<!-- Section - Posts (Course Stages) -->
								<section>
									<header class="major">
										<h2>Course Stages</h2>
									</header>
									<div class="posts">
${posts}
									</div>
								</section>

						</div>
					</div>

				<!-- Sidebar -->
					<div id="sidebar">
						<div class="inner">

							<!-- Menu -->
								<nav id="menu">
									<header class="major">
										<h2>Course Navigation</h2>
									</header>
									<ul>
										<li><a href="#banner">Course Overview</a></li>
${menuItems}
									</ul>
								</nav>

							<!-- Section -->
								<section>
									<header class="major">
										<h2>Course Info</h2>
									</header>
									<p>${escapeHtml(course.title)}</p>
									<p><strong>Total Stages:</strong> ${totalStages}</p>
									${course.description ? `<p>${escapeHtml(course.description)}</p>` : ''}
								</section>

							<!-- Footer -->
								<footer id="footer">
									<p class="copyright">&copy; ${new Date().getFullYear()} ${escapeHtml(course.title)}. All rights reserved.</p>
								</footer>

						</div>
					</div>

			</div>

		<!-- Scripts -->
			<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
			<script>
${js}
			</script>

	</body>
</html>`;
}

function generateStagePost(stage: CourseStage): string {
  const content = stage.content || { introduction: '', sections: [], summary: '' };
  
  // Get first image from stage
  const firstImage = content.sections?.find(s => s.image)?.image;
  const imageHtml = firstImage 
    ? `<a href="#stage-${stage.id}" class="image"><img src="${escapeHtml(firstImage.url || firstImage.src || '')}" alt="${escapeHtml(firstImage.alt || stage.title)}" /></a>`
    : '';

  // Generate content preview (first section or introduction)
  const preview = content.introduction || content.sections?.[0]?.content || stage.objective || '';

  // Generate interactive elements (excluding quiz type - those are handled separately)
  const interactiveElements = stage.interactiveElements
    ?.filter(element => element.type !== 'quiz') // Exclude quiz elements to avoid duplication
    .map(element => generateInteractiveElement(element, stage.id))
    .join('') || '';

  // Generate quiz questions from both quizQuestions array AND quiz-type interactiveElements
  // This ensures we capture all quizzes without duplication
  const allQuizzes: Array<{ question: string; options: string[]; correctAnswer?: string | number; explanation?: string; id?: string }> = [];
  const seenQuestions = new Set<string>(); // Track questions to avoid duplicates
  
  // Add quizzes from quizQuestions array (preferred source)
  if (stage.quizQuestions && stage.quizQuestions.length > 0) {
    stage.quizQuestions.forEach(q => {
      const questionKey = q.question?.toLowerCase().trim() || '';
      if (questionKey && !seenQuestions.has(questionKey)) {
        seenQuestions.add(questionKey);
        allQuizzes.push({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || q.correct,
          explanation: q.explanation
        });
      }
    });
  }
  
  // Add quizzes from interactiveElements (if not already added from quizQuestions)
  if (stage.interactiveElements) {
    stage.interactiveElements
      .filter(element => element.type === 'quiz' && element.data)
      .forEach(element => {
        if (element.data.question) {
          const questionKey = element.data.question.toLowerCase().trim();
          if (!seenQuestions.has(questionKey)) {
            seenQuestions.add(questionKey);
            allQuizzes.push({
              question: element.data.question,
              options: element.data.options || [],
              correctAnswer: element.data.correctAnswer || element.data.correct,
              explanation: element.data.explanation
            });
          }
        }
      });
  }
  
  // Generate quiz HTML from all collected quizzes
  const quizQuestions = allQuizzes.length > 0
    ? allQuizzes.map((quiz, qIndex) => {
        const options = quiz.options || [];
        const optionsHtml = options
          .map((opt: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            return `<span class="choice" data-value="${letter}">${escapeHtml(opt)}</span>`;
          })
          .join('\n                  ');
        
        // Better correct answer handling
        let correctLetter = 'A';
        if (quiz.correctAnswer !== undefined && quiz.correctAnswer !== null) {
          if (typeof quiz.correctAnswer === 'number') {
            // If it's a number, use it as index (0-based)
            correctLetter = String.fromCharCode(65 + (quiz.correctAnswer >= 0 && quiz.correctAnswer < options.length ? quiz.correctAnswer : 0));
          } else if (typeof quiz.correctAnswer === 'string') {
            // If it's a string, check if it's a letter (A, B, C, etc.)
            const upper = quiz.correctAnswer.toUpperCase().trim();
            if (upper.length === 1 && upper >= 'A' && upper <= 'Z') {
              correctLetter = upper;
            } else {
              // Try to parse as number string
              const num = parseInt(upper);
              if (!isNaN(num) && num >= 0 && num < options.length) {
                correctLetter = String.fromCharCode(65 + num);
              }
            }
          }
        }

        return `
      <div class="quiz-question" data-qid="quiz-${stage.id}-${qIndex}" data-correct="${correctLetter}">
        <strong>${escapeHtml(quiz.question)}</strong><br>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
        ${quiz.explanation ? `<div class="quiz-explanation" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 5px;">${escapeHtml(quiz.explanation)}</div>` : ''}
      </div>`;
      }).join('')
    : '';

  // Generate full content sections
  const contentSections = content.sections?.map(section => {
    let sectionHtml = '';
    if (section.heading) {
      sectionHtml += `<h4>${escapeHtml(section.heading)}</h4>`;
    }
    if (section.content) {
      sectionHtml += `<p>${escapeHtml(section.content)}</p>`;
    }
    if (section.items && section.items.length > 0) {
      sectionHtml += `<ul>${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }
    if (section.image) {
      sectionHtml += `<span class="image fit"><img src="${escapeHtml(section.image.url || section.image.src || '')}" alt="${escapeHtml(section.image.alt || '')}" /></span>`;
    }
    return sectionHtml;
  }).join('') || '';

  return `\t\t\t\t\t\t\t<article id="stage-${stage.id}">
								${imageHtml}
								<h3>${escapeHtml(stage.title)}</h3>
								${stage.objective ? `<p class="objective"><strong>Objective:</strong> ${escapeHtml(stage.objective)}</p>` : ''}
								<p>${escapeHtml(preview.substring(0, 200))}${preview.length > 200 ? '...' : ''}</p>
								<div class="stage-content" style="display: none;">
									${content.introduction ? `<p>${escapeHtml(content.introduction)}</p>` : ''}
									${contentSections}
									${interactiveElements}
									${quizQuestions}
									${content.summary ? `<div class="summary"><strong>Summary:</strong> ${escapeHtml(content.summary)}</div>` : ''}
								</div>
								<ul class="actions">
									<li><a href="#stage-${stage.id}" class="button toggle-stage">Read More</a></li>
								</ul>
							</article>`;
}

function getStageIcon(index: number): string {
  const icons = [
    'fa-gem',
    'fa-paper-plane',
    'fa-rocket',
    'fa-signal',
    'fa-book',
    'fa-lightbulb',
    'fa-chart-line',
    'fa-code'
  ];
  return icons[index % icons.length];
}

function generateEditorialCSS(accent1: string, accent2: string): string {
  // Simplified CSS with key styles - full CSS can be embedded later if needed
  return `
/* Editorial Template CSS */
/* Accent colors: ${accent1}, ${accent2} */

/* Basic Reset */
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}

article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {
	display: block;
}

body {
	line-height: 1;
}

ol, ul {
	list-style: none;
}

html {
	box-sizing: border-box;
}

*, *:before, *:after {
	box-sizing: inherit;
}

body {
	background: #ffffff;
}

body.is-preload *, body.is-preload *:before, body.is-preload *:after, body.is-resizing *, body.is-resizing *:before, body.is-resizing *:after {
	-moz-animation: none !important;
	-webkit-animation: none !important;
	-ms-animation: none !important;
	animation: none !important;
	-moz-transition: none !important;
	-webkit-transition: none !important;
	-ms-transition: none !important;
	transition: none !important;
}

/* Type */
body, input, select, textarea {
	color: #7f888f;
	font-family: "Open Sans", sans-serif;
	font-size: 13pt;
	font-weight: 400;
	line-height: 1.65;
}

a {
	-moz-transition: color 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out;
	-webkit-transition: color 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out;
	-ms-transition: color 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out;
	transition: color 0.2s ease-in-out, border-bottom-color 0.2s ease-in-out;
	border-bottom: dotted 1px;
	color: ${accent1};
	text-decoration: none;
}

a:hover {
	border-bottom-color: ${accent1};
	color: ${accent1} !important;
}

strong, b {
	color: #3d4449;
	font-weight: 600;
}

h1, h2, h3, h4, h5, h6 {
	color: #3d4449;
	font-family: "Roboto Slab", serif;
	font-weight: 700;
	line-height: 1.5;
	margin: 0 0 1em 0;
}

h1 {
	font-size: 4em;
	margin: 0 0 0.5em 0;
	line-height: 1.3;
}

h2 {
	font-size: 1.75em;
}

h3 {
	font-size: 1.5em;
}

p {
	margin: 0 0 2em 0;
}

/* Wrapper */
#wrapper {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-flex-direction: row-reverse;
	-webkit-flex-direction: row-reverse;
	-ms-flex-direction: row-reverse;
	flex-direction: row-reverse;
	-moz-transition: opacity 0.5s ease;
	-webkit-transition: opacity 0.5s ease;
	-ms-transition: opacity 0.5s ease;
	transition: opacity 0.5s ease;
	margin: 0;
	padding: 0;
}

/* Main */
#main {
	-moz-flex-grow: 1;
	-webkit-flex-grow: 1;
	-ms-flex-grow: 1;
	flex-grow: 1;
	-moz-flex-shrink: 1;
	-webkit-flex-shrink: 1;
	-ms-flex-shrink: 1;
	flex-shrink: 1;
	width: 100%;
}

#main > .inner {
	padding: 4.5em 4em 2.5em 4em;
	max-width: 100%;
	width: 64em;
	margin: 0 auto;
}

/* Header */
#header {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-flex-direction: row;
	-webkit-flex-direction: row;
	-ms-flex-direction: row;
	flex-direction: row;
	-moz-align-items: center;
	-webkit-align-items: center;
	-ms-align-items: center;
	align-items: center;
	-moz-justify-content: space-between;
	-webkit-justify-content: space-between;
	-ms-justify-content: space-between;
	justify-content: space-between;
	background: #ffffff;
	border-bottom: solid 1px rgba(160, 160, 160, 0.3);
	height: 3.5em;
	left: 0;
	line-height: 3.5em;
	margin: 0;
	position: -moz-sticky;
	position: -webkit-sticky;
	position: -ms-sticky;
	position: sticky;
	top: 0;
	width: 100%;
	z-index: 10000;
}

#header .logo {
	display: block;
	font-weight: 600;
	height: inherit;
	line-height: inherit;
	padding: 0 1.5em;
	text-decoration: none;
}

/* Banner */
#banner {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-flex-direction: row;
	-webkit-flex-direction: row;
	-ms-flex-direction: row;
	flex-direction: row;
	-moz-align-items: center;
	-webkit-align-items: center;
	-ms-align-items: center;
	align-items: center;
	padding: 6em 0;
	border-bottom: solid 1px rgba(160, 160, 160, 0.3);
}

#banner .content {
	-moz-flex-grow: 1;
	-webkit-flex-grow: 1;
	-ms-flex-grow: 1;
	flex-grow: 1;
	-moz-flex-shrink: 1;
	-webkit-flex-shrink: 1;
	-ms-flex-shrink: 1;
	flex-shrink: 1;
	width: 50%;
	padding-right: 3em;
}

#banner .image {
	-moz-flex-grow: 0;
	-webkit-flex-grow: 0;
	-ms-flex-grow: 0;
	flex-grow: 0;
	-moz-flex-shrink: 0;
	-webkit-flex-shrink: 0;
	-ms-flex-shrink: 0;
	flex-shrink: 0;
	width: 50%;
}

#banner .image img {
	border-radius: 0;
	width: 100%;
}

/* Features */
.features {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-flex-wrap: wrap;
	-webkit-flex-wrap: wrap;
	-ms-flex-wrap: wrap;
	flex-wrap: wrap;
	margin: -2em 0 2em -2em;
	width: calc(100% + 2em);
}

.features article {
	-moz-flex-grow: 0;
	-webkit-flex-grow: 0;
	-ms-flex-grow: 0;
	flex-grow: 0;
	-moz-flex-shrink: 1;
	-webkit-flex-shrink: 1;
	-ms-flex-shrink: 1;
	flex-shrink: 1;
	margin: 2em 0 0 2em;
	width: calc(50% - 2em);
}

.features article .icon {
	-moz-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	-webkit-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	-ms-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	border-radius: 100%;
	color: ${accent1};
	display: inline-block;
	font-size: 2.25em;
	height: 2.25em;
	line-height: 2.25em;
	margin-right: 0.35em;
	text-align: center;
	width: 2.25em;
}

/* Posts */
.posts {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-flex-wrap: wrap;
	-webkit-flex-wrap: wrap;
	-ms-flex-wrap: wrap;
	flex-wrap: wrap;
	margin: -1.5em 0 2em -1.5em;
	width: calc(100% + 1.5em);
}

.posts article {
	-moz-flex-grow: 0;
	-webkit-flex-grow: 0;
	-ms-flex-grow: 0;
	flex-grow: 0;
	-moz-flex-shrink: 1;
	-webkit-flex-shrink: 1;
	-ms-flex-shrink: 1;
	flex-shrink: 1;
	margin: 1.5em 0 0 1.5em;
	width: calc(50% - 1.5em);
}

.posts article .image {
	display: block;
	margin: 0 0 1.5em 0;
}

.posts article .image img {
	width: 100%;
}

.posts article h3 {
	font-size: 1.5em;
	margin-bottom: 0.5em;
}

.posts article p.objective {
	font-style: italic;
	color: ${accent1};
	margin-bottom: 1em;
}

.posts article .stage-content {
	margin-top: 1em;
}

.posts article .summary {
	background: rgba(0, 0, 0, 0.05);
	border-left: 3px solid ${accent1};
	padding: 1em;
	margin-top: 1.5em;
}

/* Sidebar */
#sidebar {
	-moz-flex-grow: 0;
	-webkit-flex-grow: 0;
	-ms-flex-grow: 0;
	flex-grow: 0;
	-moz-flex-shrink: 0;
	-webkit-flex-shrink: 0;
	-ms-flex-shrink: 0;
	flex-shrink: 0;
	-moz-transition: margin-left 0.5s ease, box-shadow 0.5s ease;
	-webkit-transition: margin-left 0.5s ease, box-shadow 0.5s ease;
	-ms-transition: margin-left 0.5s ease, box-shadow 0.5s ease;
	transition: margin-left 0.5s ease, box-shadow 0.5s ease;
	background: #f5f5f5;
	font-size: 0.875em;
	position: relative;
	width: 22em;
}

#sidebar .inner {
	padding: 3em 2em;
	position: -moz-sticky;
	position: -webkit-sticky;
	position: -ms-sticky;
	position: sticky;
	top: 0;
}

#sidebar #menu ul {
	list-style: none;
	padding: 0;
}

#sidebar #menu ul li {
	border-top: solid 1px rgba(160, 160, 160, 0.3);
	margin: 0.5em 0 0 0;
	padding: 0.5em 0 0 0;
}

#sidebar #menu ul li:first-child {
	border-top: 0;
	margin-top: 0;
	padding-top: 0;
}

#sidebar #menu ul li a {
	border-bottom: 0;
	color: inherit;
	display: block;
	padding: 0.5em 0;
	text-decoration: none;
}

#sidebar #menu ul li a:hover {
	color: ${accent1};
}

/* Buttons */
.button {
	-moz-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	-webkit-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	-ms-transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
	background-color: transparent;
	border-radius: 4px;
	border: solid 1px ${accent1};
	color: ${accent1} !important;
	cursor: pointer;
	display: inline-block;
	font-weight: 600;
	height: 2.75em;
	line-height: 2.75em;
	min-width: 10em;
	padding: 0 1.5em;
	text-align: center;
	text-decoration: none;
}

.button:hover {
	background-color: ${accent1};
	color: #ffffff !important;
}

/* Interactive Elements */
.quiz-question {
	margin: 1.5em 0;
	padding: 1em;
	background: rgba(0, 0, 0, 0.02);
	border-radius: 4px;
}

.quiz-options {
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	margin-top: 1em;
}

.quiz-options .choice {
	padding: 0.75em 1em;
	background: #ffffff;
	border: 2px solid #e0e0e0;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.quiz-options .choice:hover {
	border-color: ${accent1};
	background: rgba(245, 106, 106, 0.05);
}

.quiz-options .choice.correct {
	background: #d4edda;
	border-color: #28a745;
	color: #155724;
}

.quiz-options .choice.incorrect {
	background: #f8d7da;
	border-color: #dc3545;
	color: #721c24;
}

.quiz-explanation {
	margin-top: 1em;
	padding: 1em;
	background: rgba(0, 0, 0, 0.05);
	border-radius: 4px;
}

/* Responsive */
@media screen and (max-width: 1280px) {
	#main > .inner {
		padding: 3em 3em 1.5em 3em;
	}
	
	#sidebar {
		width: 20em;
	}
}

@media screen and (max-width: 980px) {
	#wrapper {
		-moz-flex-direction: column;
		-webkit-flex-direction: column;
		-ms-flex-direction: column;
		flex-direction: column;
	}
	
	#sidebar {
		width: 100%;
	}
	
	.posts article {
		width: 100%;
	}
	
	.features article {
		width: 100%;
	}
}
`;
}

function generateEditorialJS(): string {
  return `
		(function($) {
			var $window = $(window),
				$head = $('head'),
				$body = $('body');

			// Breakpoints - embedded version
			var breakpoints = (function() {
				var list = {
					xlarge:   [ '1281px',  '1680px' ],
					large:    [ '981px',   '1280px' ],
					medium:   [ '737px',   '980px'  ],
					small:    [ '481px',   '736px'  ],
					xsmall:   [ '361px',   '480px'  ],
					xxsmall:  [ null,      '360px'  ]
				};
				var media = {};
				var events = [];
				
				function active(query) {
					if (!(query in media)) {
						var alias, name, mql;
						if (query.substr(0, 2) === '>=') {
							alias = 'gte';
							name = query.substr(2);
						} else if (query.substr(0, 2) === '<=') {
							alias = 'lte';
							name = query.substr(2);
						} else if (query.substr(0, 1) === '>') {
							alias = 'gt';
							name = query.substr(1);
						} else if (query.substr(0, 1) === '<') {
							alias = 'lt';
							name = query.substr(1);
						} else {
							alias = 'eq';
							name = query;
						}
						
						if (name && name in list) {
							var range = list[name];
							if (Array.isArray(range)) {
								var min = parseInt(range[0]);
								var max = parseInt(range[1]);
								var unit = range[0].substr(String(min).length);
								
								if (isNaN(min)) {
									if (isNaN(max)) return;
									switch(alias) {
										case 'gte': mql = 'screen'; break;
										case 'lte': mql = 'screen and (max-width: ' + max + unit + ')'; break;
										case 'gt': mql = 'screen and (min-width: ' + (max + 1) + unit + ')'; break;
										case 'lt': mql = 'screen and (max-width: -1px)'; break;
										default: mql = 'screen and (max-width: ' + max + unit + ')';
									}
								} else if (isNaN(max)) {
									switch(alias) {
										case 'gte': mql = 'screen and (min-width: ' + min + unit + ')'; break;
										case 'lte': mql = 'screen'; break;
										case 'gt': mql = 'screen and (max-width: -1px)'; break;
										case 'lt': mql = 'screen and (max-width: ' + (min - 1) + unit + ')'; break;
										default: mql = 'screen and (min-width: ' + min + unit + ')';
									}
								} else {
									switch(alias) {
										case 'gte': mql = 'screen and (min-width: ' + min + unit + ')'; break;
										case 'lte': mql = 'screen and (max-width: ' + max + unit + ')'; break;
										case 'gt': mql = 'screen and (min-width: ' + (max + 1) + unit + ')'; break;
										case 'lt': mql = 'screen and (max-width: ' + (min - 1) + unit + ')'; break;
										default: mql = 'screen and (min-width: ' + min + unit + ') and (max-width: ' + max + unit + ')';
									}
								}
							}
							media[query] = !!mql && window.matchMedia(mql).matches;
						}
					}
					return media[query] !== false && window.matchMedia(media[query] || '').matches;
				}
				
				function init(bp) {
					list = bp;
					window.addEventListener('resize', poll);
					window.addEventListener('orientationchange', poll);
					window.addEventListener('load', poll);
				}
				
				function poll() {
					for (var i = 0; i < events.length; i++) {
						var e = events[i];
						if (active(e.query)) {
							if (!e.state) {
								e.state = true;
								e.handler();
							}
						} else {
							if (e.state) {
								e.state = false;
							}
						}
					}
				}
				
				return {
					init: init,
					active: active,
					on: function(query, handler) {
						events.push({query: query, handler: handler, state: false});
						if (active(query)) handler();
					}
				};
			})();

			// Initialize breakpoints
			breakpoints.init({
				xlarge:   [ '1281px',  '1680px' ],
				large:    [ '981px',   '1280px' ],
				medium:   [ '737px',   '980px'  ],
				small:    [ '481px',   '736px'  ],
				xsmall:   [ '361px',   '480px'  ],
				xxsmall:  [ null,      '360px'  ]
			});

			// Remove preload class
			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-preload');
				}, 100);
			});

			// Sidebar toggle
			var $sidebar = $('#sidebar');
			
			breakpoints.on('<=large', function() {
				$sidebar.addClass('inactive');
			});

			breakpoints.on('>large', function() {
				$sidebar.removeClass('inactive');
			});

			// Toggle stage content
			$(document).on('click', '.toggle-stage', function(e) {
				e.preventDefault();
				var $button = $(this);
				var $article = $button.closest('article');
				var $content = $article.find('.stage-content');
				
				if ($content.is(':visible')) {
					$content.slideUp();
					$button.text('Read More');
				} else {
					$content.slideDown();
					$button.text('Read Less');
				}
			});

			// Smooth scroll to sections
			$('a[href^="#"]').on('click', function(e) {
				var target = $(this.getAttribute('href'));
				if (target.length) {
					e.preventDefault();
					$('html, body').stop().animate({
						scrollTop: target.offset().top - 100
					}, 1000);
					
					// Close sidebar on mobile
					if (breakpoints.active('<=large')) {
						$sidebar.addClass('inactive');
					}
				}
			});

			// Quiz functionality
			$(document).on('click', '.quiz-options .choice', function() {
				var $choice = $(this);
				var $question = $choice.closest('.quiz-question');
				var $options = $question.find('.quiz-options');
				var correct = $question.attr('data-correct');
				var selected = $choice.attr('data-value');
				
				if ($question.hasClass('answered')) return;
				
				$question.addClass('answered');
				$options.find('.choice').each(function() {
					var $opt = $(this);
					if ($opt.attr('data-value') === correct) {
						$opt.addClass('correct');
					} else if ($opt.attr('data-value') === selected && selected !== correct) {
						$opt.addClass('incorrect');
					}
				});
				
				if (selected === correct) {
					$question.addClass('correct-answer');
				} else {
					$question.addClass('incorrect-answer');
				}
				
				var $explanation = $question.find('.quiz-explanation');
				if ($explanation.length) {
					$explanation.slideDown();
				}
			});

			// Expandable sections
			$(document).on('click', '.expandable-header', function() {
				var $header = $(this);
				var $content = $header.next('.expandable-content');
				var $icon = $header.find('.expand-icon');
				
				$content.slideToggle();
				$icon.toggleClass('expanded');
			});

			// Fallback to remove is-preload
			setTimeout(function() {
				if ($body.hasClass('is-preload')) {
					$body.removeClass('is-preload');
				}
			}, 500);

		})(jQuery);`;
}

