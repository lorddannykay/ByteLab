/**
 * Directive Template Generator
 * Converts html5up-directive template into dynamic course template
 * Uses single-page layout with alternating left/right feature sections
 */

import { CourseData, CourseConfig, CourseStage, ContentSection, ImageMetadata } from '@/types/course';
import { escapeHtml, generateInteractiveElement } from '../helpers';

export function generateDirectiveTemplate(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const { course } = courseData;
  const totalStages = course.stages.length;
  const accent1 = config?.accentColor1 || '#4a90e2';
  const accent2 = config?.accentColor2 || '#50c9c3';

  // Generate feature sections for each stage (alternating left/right)
  const featureSections = course.stages
    .map((stage, index) => generateFeatureSection(stage, index))
    .join('\n\n\t\t\t\t\t\t');

  // Get CSS and JS
  const css = generateDirectiveCSS(accent1, accent2);
  const js = generateDirectiveJS();

  return `<!DOCTYPE HTML>
<html>
	<head>
		<title>${escapeHtml(course.title)}</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
		<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300italic,400,400italic,600,600italic,700,700italic" rel="stylesheet">
		<style>
${css}
		</style>
	</head>
	<body class="is-preload">

		<!-- Header -->
			<div id="header">
				<span class="logo icon fa-graduation-cap"></span>
				<h1>${escapeHtml(course.title)}</h1>
				<p>${escapeHtml(course.description || 'An interactive learning experience')}</p>
			</div>

		<!-- Main -->
			<div id="main">

				<header class="major container medium">
					<h2>${escapeHtml(course.subtitle || 'Course Overview')}</h2>
					${course.description ? `<p>${escapeHtml(course.description)}</p>` : ''}
				</header>

				<div class="box alt container">
${featureSections}
				</div>

				<footer class="major container medium">
					<h3>Course Complete</h3>
					<p>You've completed all ${totalStages} stages of this course. Great work!</p>
				</footer>

			</div>

		<!-- Footer -->
			<div id="footer">
				<div class="container medium">
					<header class="major last">
						<h2>Course Information</h2>
					</header>
					<p>${escapeHtml(course.title)} - ${totalStages} ${totalStages === 1 ? 'stage' : 'stages'}</p>
					<ul class="copyright">
						<li>&copy; ${new Date().getFullYear()} ${escapeHtml(course.title)}. All rights reserved.</li>
					</ul>
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

function generateFeatureSection(stage: CourseStage, index: number): string {
  const content = stage.content || { introduction: '', sections: [], summary: '' };
  const alignment = index % 2 === 0 ? 'left' : 'right';
  const iconClass = getStageIcon(index);
  
  // Get first image from stage if available
  const firstImage = content.sections?.find(s => s.image)?.image;
  const imageHtml = firstImage 
    ? `<a href="#stage-${stage.id}" class="image icon solid ${iconClass}"><img src="${escapeHtml(firstImage.url || firstImage.src || '')}" alt="${escapeHtml(firstImage.alt || stage.title)}" /></a>`
    : `<a href="#stage-${stage.id}" class="image icon solid ${iconClass}"><span class="icon ${iconClass}"></span></a>`;

  // Generate content sections
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
    return sectionHtml;
  }).join('') || '';

  // Generate interactive elements
  const interactiveElements = stage.interactiveElements?.map(element => 
    generateInteractiveElement(element, stage.id)
  ).join('') || '';

  // Generate quiz questions
  const quizQuestions = stage.quizQuestions?.map((quiz, qIndex) => {
    const options = quiz.options || [];
    const optionsHtml = options
      .map((opt: string, idx: number) => {
        const letter = String.fromCharCode(65 + idx);
        return `<span class="choice" data-value="${letter}">${escapeHtml(opt)}</span>`;
      })
      .join('\n                  ');
    
    const correctAnswer = quiz.correctAnswer || quiz.correct || 'A';
    const correctLetter = typeof correctAnswer === 'string' && correctAnswer.length === 1 ? correctAnswer : String.fromCharCode(65 + (typeof correctAnswer === 'number' ? correctAnswer : 0));

    return `
      <div class="quiz-question" data-qid="q-${stage.id}-${qIndex}" data-correct="${correctLetter}">
        <strong>${escapeHtml(quiz.question)}</strong><br>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
        ${quiz.explanation ? `<div class="quiz-explanation" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.1); border-radius: 5px;">${escapeHtml(quiz.explanation)}</div>` : ''}
      </div>`;
  }).join('') || '';

  return `					<section class="feature ${alignment}" id="stage-${stage.id}">
						${alignment === 'left' ? imageHtml : ''}
						<div class="content">
							<h3>${escapeHtml(stage.title)}</h3>
							${stage.objective ? `<p class="objective"><strong>Objective:</strong> ${escapeHtml(stage.objective)}</p>` : ''}
							${content.introduction ? `<p>${escapeHtml(content.introduction)}</p>` : ''}
							${contentSections}
							${interactiveElements}
							${quizQuestions}
							${content.summary ? `<div class="summary"><strong>Summary:</strong> ${escapeHtml(content.summary)}</div>` : ''}
						</div>
						${alignment === 'right' ? imageHtml : ''}
					</section>`;
}

function getStageIcon(index: number): string {
  const icons = [
    'fa-book',
    'fa-lightbulb',
    'fa-chart-line',
    'fa-code',
    'fa-flask',
    'fa-puzzle-piece',
    'fa-rocket',
    'fa-star',
    'fa-trophy',
    'fa-gem'
  ];
  return icons[index % icons.length];
}

function generateDirectiveCSS(accent1: string, accent2: string): string {
  // Note: The full CSS is embedded inline below
  // This is a large file (~3300 lines), so we embed it as a template literal
  // The CSS file has been cleaned to remove @import statements (handled in HTML head)
  
  // For now, we'll use a simplified version with key styles
  // The full CSS can be embedded later if needed
  return `
/* Directive Template CSS */
/* Accent colors: ${accent1}, ${accent2} */

/* Basic Reset and Typography - embedded from main.css */
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

blockquote, q {
	quotes: none;
}

blockquote:before, blockquote:after, q:before, q:after {
	content: '';
	content: none;
}

table {
	border-collapse: collapse;
	border-spacing: 0;
}

body {
	-webkit-text-size-adjust: none;
}

mark {
	background-color: transparent;
	color: inherit;
}

input::-moz-focus-inner {
	border: 0;
	padding: 0;
}

input, select, textarea {
	-moz-appearance: none;
	-webkit-appearance: none;
	-ms-appearance: none;
	appearance: none;
}

/* Basic */
html {
	box-sizing: border-box;
}

*, *:before, *:after {
	box-sizing: inherit;
}

html, body {
	height: 100%;
}

body {
	background: #ffffff;
}

body.is-preload *, body.is-preload *:before, body.is-preload *:after {
	-moz-animation: none !important;
	-webkit-animation: none !important;
	-ms-animation: none !important;
	animation: none !important;
	-moz-transition: none !important;
	-webkit-transition: none !important;
	-ms-transition: none !important;
	transition: none !important;
}

body, input, select, textarea {
	color: #6e6e6e;
	font-family: 'Source Sans Pro', sans-serif;
	font-size: 16pt;
	font-weight: 400;
	line-height: 1.75em;
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
	border-bottom-color: transparent;
}

strong, b {
	font-weight: 600;
	color: #5b5b5b;
}

em, i {
	font-style: italic;
}

p, ul, ol, dl, table, blockquote, form {
	margin: 0 0 2em 0;
}

h1, h2, h3, h4, h5, h6 {
	color: #5b5b5b;
	font-weight: 700;
	letter-spacing: 0.125em;
	line-height: 1.75em;
	margin-bottom: 1em;
	text-transform: uppercase;
	text-align: center;
}

h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {
	color: inherit;
	text-decoration: none;
}

h2 {
	font-size: 1.75em;
}

h3 {
	font-size: 1.5em;
}

/* Container */
.container {
	margin: 0 auto;
	max-width: 100%;
	width: 51em;
}

.container.medium {
	width: 38.25em;
}

/* Header */
#header {
	background-color: ${accent1};
	background-image: linear-gradient(135deg, ${accent1} 0%, ${accent2} 100%);
	color: #ffffff;
	padding: 6em 0 4em 0;
	text-align: center;
}

#header .logo {
	font-size: 4em;
	margin-bottom: 0.5em;
}

#header h1 {
	color: #ffffff;
	font-size: 2.5em;
	margin-bottom: 0.5em;
}

#header p {
	color: rgba(255, 255, 255, 0.9);
	font-size: 1.25em;
	margin: 0;
}

/* Main */
#main {
	padding: 4em 0;
}

header.major {
	margin-bottom: 4em;
	text-align: center;
}

header.major h2 {
	font-size: 2em;
	margin-bottom: 0.5em;
}

/* Feature Sections */
.box.alt.container {
	margin-top: 4em;
}

section.feature {
	display: -moz-flex;
	display: -webkit-flex;
	display: -ms-flex;
	display: flex;
	-moz-align-items: center;
	-webkit-align-items: center;
	-ms-align-items: center;
	align-items: center;
	margin-bottom: 4em;
}

section.feature.left {
	-moz-flex-direction: row;
	-webkit-flex-direction: row;
	-ms-flex-direction: row;
	flex-direction: row;
}

section.feature.right {
	-moz-flex-direction: row-reverse;
	-webkit-flex-direction: row-reverse;
	-ms-flex-direction: row-reverse;
	flex-direction: row-reverse;
}

section.feature .image {
	-moz-flex-shrink: 0;
	-webkit-flex-shrink: 0;
	-ms-flex-shrink: 0;
	flex-shrink: 0;
	width: 48%;
	margin-right: 4%;
}

section.feature.right .image {
	margin-right: 0;
	margin-left: 4%;
}

section.feature .image img {
	width: 100%;
	height: auto;
	border-radius: 4px;
}

section.feature .content {
	-moz-flex-grow: 1;
	-webkit-flex-grow: 1;
	-ms-flex-grow: 1;
	flex-grow: 1;
	width: 48%;
}

section.feature .content h3 {
	text-align: left;
	margin-bottom: 1em;
}

section.feature .content p.objective {
	font-style: italic;
	color: ${accent1};
	margin-bottom: 1em;
}

section.feature .content .summary {
	background: rgba(0, 0, 0, 0.05);
	border-left: 3px solid ${accent1};
	padding: 1em;
	margin-top: 1.5em;
}

/* Footer */
#footer {
	background-color: #f5f5f5;
	padding: 4em 0 2em 0;
	text-align: center;
}

#footer .container {
	padding: 0 2em;
}

#footer header.major.last h2 {
	margin-bottom: 1em;
}

#footer .copyright {
	margin-top: 2em;
	font-size: 0.9em;
	color: #999;
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
	background: rgba(74, 144, 226, 0.05);
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

.expandable-section {
	margin: 1.5em 0;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	overflow: hidden;
}

.expandable-header {
	padding: 1em;
	background: ${accent1};
	color: #ffffff;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.expandable-content {
	padding: 1em;
	display: none;
}

.expandable-content.expanded {
	display: block;
}

.expand-icon {
	transition: transform 0.3s ease;
}

.expand-icon.expanded {
	transform: rotate(180deg);
}

/* Responsive */
@media screen and (max-width: 980px) {
	section.feature {
		-moz-flex-direction: column;
		-webkit-flex-direction: column;
		-ms-flex-direction: column;
		flex-direction: column;
	}
	
	section.feature .image,
	section.feature .content {
		width: 100%;
		margin: 0 0 2em 0;
	}
	
	section.feature.right .image {
		margin-left: 0;
	}
}

@media screen and (max-width: 736px) {
	#header {
		padding: 4em 2em 3em 2em;
	}
	
	#header h1 {
		font-size: 2em;
	}
	
	#main {
		padding: 3em 0;
	}
	
	header.major h2 {
		font-size: 1.5em;
	}
}
`;
}

function generateDirectiveJS(): string {
  return `
		(function($) {
			var $window = $(window),
				$body = $('body');

			// Breakpoints - embedded version
			var breakpoints = (function() {
				var list = {
					wide:      [ '1281px',  '1680px' ],
					normal:    [ '981px',   '1280px' ],
					narrow:    [ '841px',   '980px'  ],
					narrower:  [ '737px',   '840px'  ],
					mobile:    [ '481px',   '736px'  ],
					mobilep:   [ null,      '480px'  ]
				};
				var media = {};
				var events = [];
				
				function active(query) {
					if (!(query in media)) {
						var alias, name, mql, result;
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
						} else if (query.substr(0, 1) === '!') {
							alias = 'not';
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
										case 'not': mql = 'screen and (min-width: ' + (max + 1) + unit + ')'; break;
										default: mql = 'screen and (max-width: ' + max + unit + ')';
									}
								} else if (isNaN(max)) {
									switch(alias) {
										case 'gte': mql = 'screen and (min-width: ' + min + unit + ')'; break;
										case 'lte': mql = 'screen'; break;
										case 'gt': mql = 'screen and (max-width: -1px)'; break;
										case 'lt': mql = 'screen and (max-width: ' + (min - 1) + unit + ')'; break;
										case 'not': mql = 'screen and (max-width: ' + (min - 1) + unit + ')'; break;
										default: mql = 'screen and (min-width: ' + min + unit + ')';
									}
								} else {
									switch(alias) {
										case 'gte': mql = 'screen and (min-width: ' + min + unit + ')'; break;
										case 'lte': mql = 'screen and (max-width: ' + max + unit + ')'; break;
										case 'gt': mql = 'screen and (min-width: ' + (max + 1) + unit + ')'; break;
										case 'lt': mql = 'screen and (max-width: ' + (min - 1) + unit + ')'; break;
										case 'not': mql = 'screen and (max-width: ' + (min - 1) + unit + '), screen and (min-width: ' + (max + 1) + unit + ')'; break;
										default: mql = 'screen and (min-width: ' + min + unit + ') and (max-width: ' + max + unit + ')';
									}
								}
							} else {
								mql = range.charAt(0) === '(' ? 'screen and ' + range : range;
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
					window.addEventListener('fullscreenchange', poll);
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
				wide:      [ '1281px',  '1680px' ],
				normal:    [ '981px',   '1280px' ],
				narrow:    [ '841px',   '980px'  ],
				narrower:  [ '737px',   '840px'  ],
				mobile:    [ '481px',   '736px'  ],
				mobilep:   [ null,      '480px'  ]
			});

			// Play initial animations on page load.
			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-preload');
				}, 100);
			});
			
			// Smooth scroll to sections
			$('a[href^="#"]').on('click', function(e) {
				var target = $(this.getAttribute('href'));
				if (target.length) {
					e.preventDefault();
					$('html, body').stop().animate({
						scrollTop: target.offset().top - 100
					}, 1000);
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
			
			// Fallback to remove is-preload if main JS fails
			setTimeout(function() {
				if ($body.hasClass('is-preload')) {
					$body.removeClass('is-preload');
				}
			}, 500);

		})(jQuery);`;
}

