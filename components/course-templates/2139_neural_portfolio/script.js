// JavaScript Document

// Neural Network Background Animation
        const canvas = document.getElementById('neural-bg');
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
                        ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / 150})`;
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

        // Initialize and start animation
        init();
        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });

        // Mouse move effect
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');

        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
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

        // Form submission - only if contact form exists (not quiz)
        const contactForm = document.querySelector('.contact-form');
        if (contactForm && !contactForm.querySelector('.quiz-container')) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Message sent! (This is a demo)');
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
                var quizAnswers = { q1: 'B', q2: 'B', q3: 'C' };
                var userAnswers = {};
                
                // Navigation function
                function goToStage(stage) {
                    if (stage < 1 || stage > totalStages) return;
                    
                    currentStage = stage;
                    showStage(stage);
                    updateProgress();
                    localStorage.setItem('neural_networks_stage', stage);
                    
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
                    var resultHtml = '<h3 style="color: var(--primary); margin-bottom: 15px;">Quiz Results</h3>';
                    resultHtml += '<p style="color: var(--text-primary); margin-bottom: 10px;"><strong>Score: ' + score + '%</strong> (' + correct + ' out of ' + total + ' correct)</p>';
                    
                    if (score >= 66) {
                        resultHtml += '<p style="color: var(--secondary); font-weight: 600; margin-top: 10px;">Congratulations! You passed! Your certificate is now available.</p>';
                        $('#certificate-section').show();
                        var name = localStorage.getItem('neural_networks_name') || 'Learner';
                        $('#cert-name').text(name);
                    } else {
                        resultHtml += '<p style="color: var(--text-secondary); margin-top: 10px;">Please review the course and try again. You need at least 66% to pass.</p>';
                    }
                    
                    $('#quiz-result').html(resultHtml).show();
                });
                
                // Certificate download
                $('#download-cert').on('click', function() {
                    var name = localStorage.getItem('neural_networks_name') || 'Learner';
                    var date = new Date().toLocaleDateString();
                    var certUrl = '../../certificate.html?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date) + '&course=Neural Networks Fundamentals';
                    window.open(certUrl, '_blank');
                });
                
                // Load saved progress
                var saved = localStorage.getItem('neural_networks_stage');
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