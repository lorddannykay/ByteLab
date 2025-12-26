/*

Tooplate 2141 Minimal White

https://www.tooplate.com/view/2141-minimal-white

*/

// JavaScript Document

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Navbar scroll effect (keep for styling)
        window.addEventListener('scroll', function() {
            const navbar = document.getElementById('navbar');
            
            // Navbar style on scroll
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Trigger scroll event on load to set initial active state
        window.dispatchEvent(new Event('scroll'));

        // Smooth scrolling for navigation links (disabled in course mode - handled by course navigation)
        // Keep for any non-course links if needed

        // Fade in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
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
                var totalStages = 6;
                var quizAnswers = { q1: 'A', q2: 'C', q3: 'B' };
                var userAnswers = {};
                
                // Navigation function
                function goToStage(stage) {
                    if (stage < 1 || stage > totalStages) return;
                    
                    currentStage = stage;
                    showStage(stage);
                    updateProgress();
                    localStorage.setItem('minimal_design_stage', stage);
                    
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
                    var resultHtml = '<h3>Quiz Results</h3>';
                    resultHtml += '<p><strong>Score: ' + score + '%</strong> (' + correct + ' out of ' + total + ' correct)</p>';
                    
                    if (score >= 66) {
                        resultHtml += '<p style="color: #000; font-weight: 600; margin-top: 10px;">Congratulations! You passed! Your certificate is now available.</p>';
                        $('#certificate-section').show();
                        var name = localStorage.getItem('minimal_design_name') || 'Learner';
                        $('#cert-name').text(name);
                    } else {
                        resultHtml += '<p style="color: #000; margin-top: 10px;">Please review the course and try again. You need at least 66% to pass.</p>';
                    }
                    
                    $('#quiz-result').html(resultHtml).show();
                });
                
                // Certificate download
                $('#download-cert').on('click', function() {
                    var name = localStorage.getItem('minimal_design_name') || 'Learner';
                    var date = new Date().toLocaleDateString();
                    var certUrl = 'certificate.html?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date) + '&course=Minimalist Design Principles';
                    window.open(certUrl, '_blank');
                });
                
                // Load saved progress
                var saved = localStorage.getItem('minimal_design_stage');
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