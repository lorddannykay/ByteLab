/*

Tooplate 2143 Inner Peace

https://www.tooplate.com/view/2143-inner-peace

Free HTML CSS Template

*/

// JavaScript Document

// Mobile menu toggle
        function toggleMenu() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            if (menuToggle && navLinks) {
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
            }
        }

        // Close mobile menu when clicking a link
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

            // Active menu highlighting
            const sections = document.querySelectorAll('section');
            const menuLinks = document.querySelectorAll('.nav-link');

            if (sections.length && menuLinks.length) {
                window.addEventListener('scroll', () => {
                    let current = '';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        const sectionHeight = section.clientHeight;
                        if (window.scrollY >= (sectionTop - 200)) {
                            current = section.getAttribute('id');
                        }
                    });

                    menuLinks.forEach(link => {
                        link.classList.remove('active');
                        const href = link.getAttribute('href');
                        if (href && href.slice(1) === current) {
                            link.classList.add('active');
                        }
                    });
                });
            }

            // Smooth scrolling for anchor links
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            anchorLinks.forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                });
            });

            // Header scroll effect
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

            // Tab functionality
            window.showTab = function(tabName) {
                const tabs = document.querySelectorAll('.tab-content');
                const buttons = document.querySelectorAll('.tab-btn');
                
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                });
                
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                const targetTab = document.getElementById(tabName);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
                
                // Find and activate the clicked button
                buttons.forEach(btn => {
                    if (btn.textContent.toLowerCase().includes(tabName.toLowerCase())) {
                        btn.classList.add('active');
                    }
                });
            };

            // Form submission handler - only if not quiz
            const contactForm = document.querySelector('.contact-form form');
            if (contactForm && !contactForm.querySelector('.quiz-container')) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert('Thank you for reaching out! We will get back to you soon.');
                    e.target.reset();
                });
            }
        });

        // ============================================
        // Course Functionality
        // ============================================
        
        // Wait for jQuery to load
        if (typeof jQuery !== 'undefined') {
            (function($) {
                'use strict';
                
                // Course state
                var currentStage = 1;
                var totalStages = 5;
                var quizAnswers = { q1: 'B', q2: 'B', q3: 'B' };
                var userAnswers = {};
                
                // Navigation function
                function goToStage(stage) {
                    if (stage < 1 || stage > totalStages) return;
                    
                    currentStage = stage;
                    showStage(stage);
                    updateProgress();
                    localStorage.setItem('mindfulness_wellness_stage', stage);
                    
                    // Scroll to top of page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                
                // Show/hide stages
                function showStage(stage) {
                    $('.course-stage').removeClass('active');
                    $('.course-stage[data-stage="' + stage + '"]').addClass('active');
                    
                    $('#prev-step').prop('disabled', stage <= 1);
                    $('#next-step').prop('disabled', stage >= totalStages);
                }
                
                // Update progress
                function updateProgress() {
                    var percentage = Math.round(((currentStage - 1) / (totalStages - 1)) * 100);
                    $('#progress-fill').css('width', percentage + '%');
                    $('#stage-indicator').text(currentStage + '/' + totalStages);
                }
                
                // Navigation buttons
                $('#prev-step').on('click', function() {
                    goToStage(currentStage - 1);
                });
                
                $('#next-step').on('click', function() {
                    goToStage(currentStage + 1);
                });
                
                // Quiz functionality
                $('.choice').on('click', function() {
                    var question = $(this).closest('.quiz-question');
                    var qid = question.data('qid');
                    question.find('.choice').removeClass('selected');
                    $(this).addClass('selected');
                    userAnswers[qid] = $(this).data('value');
                });
                
                $('#submit-quiz').on('click', function() {
                    var correct = 0;
                    var total = Object.keys(quizAnswers).length;
                    
                    for (var qid in quizAnswers) {
                        if (userAnswers[qid] === quizAnswers[qid]) {
                            correct++;
                        }
                    }
                    
                    var score = Math.round((correct / total) * 100);
                    var resultHtml = '<h3 style="color: var(--primary); margin-bottom: 15px;">Quiz Results</h3>';
                    resultHtml += '<p style="color: var(--dark); margin-bottom: 10px;"><strong>Score: ' + score + '%</strong> (' + correct + ' out of ' + total + ' correct)</p>';
                    
                    if (score >= 66) {
                        resultHtml += '<p style="color: var(--secondary); font-weight: 600; margin-top: 10px;">Congratulations! You passed! Your certificate is now available.</p>';
                        $('#certificate-section').show();
                        var name = localStorage.getItem('mindfulness_wellness_name') || 'Learner';
                        $('#cert-name').text(name);
                    } else {
                        resultHtml += '<p style="color: var(--dark); margin-top: 10px;">Please review the course and try again. You need at least 66% to pass.</p>';
                    }
                    
                    $('#quiz-result').html(resultHtml).show();
                });
                
                // Certificate download
                $('#download-cert').on('click', function() {
                    var name = localStorage.getItem('mindfulness_wellness_name') || 'Learner';
                    var date = new Date().toLocaleDateString();
                    var certUrl = '../../certificate.html?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date) + '&course=Mindfulness & Mental Wellness';
                    window.open(certUrl, '_blank');
                });
                
                // Load saved progress
                var saved = localStorage.getItem('mindfulness_wellness_stage');
                if (saved) {
                    goToStage(parseInt(saved));
                } else {
                    showStage(1);
                    updateProgress();
                }
                
            })(jQuery);
        } else {
            console.error('jQuery is required for course functionality');
        }