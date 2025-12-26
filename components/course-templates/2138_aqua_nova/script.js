/*

Tooplate 2138 Aqua Nova

https://www.tooplate.com/view/2138-aqua-nova

*/

// JavaScript Document

// Underwater Background Animation
        const underwaterBg = document.getElementById('underwater-bg');
        
        // Simple bubble creation - Reduced number
        function createBubbles() {
            for (let i = 0; i < 6; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.width = Math.random() * 10 + 5 + 'px';
                bubble.style.height = bubble.style.width;
                bubble.style.left = Math.random() * 100 + '%';
                bubble.style.animationDelay = Math.random() * 10 + 's';
                bubble.style.animationDuration = Math.random() * 5 + 8 + 's';
                underwaterBg.appendChild(bubble);
            }
        }

        // Simple ocean particles
        function createOceanParticles() {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'ocean-particle';
                particle.style.width = Math.random() * 4 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = Math.random() * 5 + 12 + 's';
                underwaterBg.appendChild(particle);
            }
        }

        // Research Tabs Functionality - Fixed
        const researchTabs = document.querySelectorAll('.research-tab');
        const researchContents = document.querySelectorAll('.research-content');

        if (researchTabs.length > 0 && researchContents.length > 0) {
            researchTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and contents
                    researchTabs.forEach(t => t.classList.remove('active'));
                    researchContents.forEach(c => c.classList.remove('active'));

                    // Add active class to clicked tab
                    tab.classList.add('active');

                    // Show corresponding content
                    const tabId = tab.getAttribute('data-tab');
                    const targetContent = document.getElementById(tabId);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        }

        // Simple initialization
        createBubbles();
        createOceanParticles();

        // Simple regeneration
        setInterval(createBubbles, 20000); // Every 20 seconds
        setInterval(createOceanParticles, 30000); // Every 30 seconds

        // Mobile menu toggle - Fixed
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on links
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Smooth scroll - Fixed
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Navbar scroll effect - Fixed
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Fade in sections
            const sections = document.querySelectorAll('.fade-in');
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) {
                    section.classList.add('visible');
                }
            });
        });

        // Form submissions - Fixed with error handling
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Message sent successfully! 🌊 (This is a demo)');
            });
        }

        // Newsletter form submission - Fixed with error handling
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.querySelector('.newsletter-input');
                if (emailInput && emailInput.value) {
                    alert(`Thank you for subscribing! 🐠 We will keep you updated on our ocean discoveries. (This is a demo)`);
                    emailInput.value = '';
                }
            });
        }

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
                var quizAnswers = { q1: 'C', q2: 'B', q3: 'B' };
                var userAnswers = {};
                
                // Navigation function
                function goToStage(stage) {
                    if (stage < 1 || stage > totalStages) return;
                    
                    currentStage = stage;
                    showStage(stage);
                    updateProgress();
                    localStorage.setItem('ocean_exploration_stage', stage);
                    
                    // Scroll to top of page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                
                // Show/hide stages
                function showStage(stage) {
                    $('.course-stage').removeClass('active');
                    $('.course-stage[data-stage="' + stage + '"]').addClass('active');
                    
                    // Trigger fade-in for visible sections
                    setTimeout(function() {
                        $('.course-stage.active .fade-in').each(function() {
                            var rect = this.getBoundingClientRect();
                            if (rect.top < window.innerHeight * 0.8) {
                                $(this).addClass('visible');
                            }
                        });
                    }, 100);
                    
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
                    var resultHtml = '<h3 style="color: var(--ocean-surface); margin-bottom: 15px;">Quiz Results</h3>';
                    resultHtml += '<p style="color: var(--pearl-white); margin-bottom: 10px;"><strong>Score: ' + score + '%</strong> (' + correct + ' out of ' + total + ' correct)</p>';
                    
                    if (score >= 66) {
                        resultHtml += '<p style="color: var(--sea-foam); font-weight: 600; margin-top: 10px;">Congratulations! You passed! Your certificate is now available.</p>';
                        $('#certificate-section').show();
                        var name = localStorage.getItem('ocean_exploration_name') || 'Learner';
                        $('#cert-name').text(name);
                    } else {
                        resultHtml += '<p style="color: var(--pearl-white); margin-top: 10px;">Please review the course and try again. You need at least 66% to pass.</p>';
                    }
                    
                    $('#quiz-result').html(resultHtml).show();
                });
                
                // Certificate download
                $('#download-cert').on('click', function() {
                    var name = localStorage.getItem('ocean_exploration_name') || 'Learner';
                    var date = new Date().toLocaleDateString();
                    var certUrl = '../../certificate.html?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date) + '&course=Ocean Exploration Fundamentals';
                    window.open(certUrl, '_blank');
                });
                
                // Load saved progress
                var saved = localStorage.getItem('ocean_exploration_stage');
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