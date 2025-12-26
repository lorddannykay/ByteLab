// JavaScript Document

/*

Tooplate 2144 Parallax Depth

https://www.tooplate.com/view/2144-parallax-depth

*/

// Generate stars
const starsContainer = document.getElementById('stars');
const numStars = 100;

for (let i = 0; i < numStars; i++) {
   const star = document.createElement('div');
   star.className = 'star';
   star.style.left = Math.random() * 100 + '%';
   star.style.top = Math.random() * 100 + '%';
   star.style.animationDelay = Math.random() * 3 + 's';
   star.style.animationDuration = (Math.random() * 3 + 2) + 's';
   starsContainer.appendChild(star);
}

// Parallax scrolling effect
const layers = document.querySelectorAll('.parallax-layer');
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
   const scrolled = window.pageYOffset;

   // Move hero content
   if (heroContent && scrolled < window.innerHeight) {
      heroContent.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.3}px))`;
      heroContent.style.opacity = 1 - (scrolled / 800);
   }

   // Apply different speeds to each layer in hero section only
   if (scrolled < window.innerHeight) {
      layers.forEach((layer, index) => {
         const speed = (index + 1) * 0.2;
         layer.style.transform = `translateY(${scrolled * speed}px)`;
      });
   }
});

// Mouse follower
const mouseFollower = document.getElementById('mouseFollower');
let mouseX = 0,
   mouseY = 0;
let followerX = 0,
   followerY = 0;

document.addEventListener('mousemove', (e) => {
   mouseX = e.clientX;
   mouseY = e.clientY;
});

// Smooth animation for mouse follower
function animateFollower() {
   followerX += (mouseX - followerX) * 0.1;
   followerY += (mouseY - followerY) * 0.1;

   mouseFollower.style.left = followerX + 'px';
   mouseFollower.style.top = followerY + 'px';

   requestAnimationFrame(animateFollower);
}
animateFollower();

// Interactive hover effects for rectangles
const rectangles = document.querySelectorAll('.rect');

rectangles.forEach(rect => {
   rect.addEventListener('mousemove', (e) => {
      const boundingRect = rect.getBoundingClientRect();
      const x = e.clientX - boundingRect.left;
      const y = e.clientY - boundingRect.top;

      const centerX = boundingRect.width / 2;
      const centerY = boundingRect.height / 2;

      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      rect.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
   });

   rect.addEventListener('mouseleave', () => {
      rect.style.transform = '';
   });
});

// 3D Carousel Controls
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');
const featureCards = document.querySelectorAll('.feature-card-3d');

let currentRotation = 0;
let currentIndex = 0;

// Create indicators
featureCards.forEach((_, index) => {
   const indicator = document.createElement('div');
   indicator.className = 'indicator';
   if (index === 0) indicator.classList.add('active');
   indicator.addEventListener('click', () => goToSlide(index));
   indicatorsContainer.appendChild(indicator);
});

const indicators = document.querySelectorAll('.indicator');

// Update view - always use 3D rotation
function updateView() {
   carousel.style.transform = `rotateY(${currentRotation}deg)`;
   updateIndicators();
}

// Update indicators
function updateIndicators() {
   indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentIndex);
   });
}

// Go to specific slide
function goToSlide(index) {
   currentIndex = index;
   currentRotation = -index * 60;
   updateView();
}

// Previous button
prevBtn.addEventListener('click', () => {
   currentIndex = (currentIndex - 1 + featureCards.length) % featureCards.length;
   currentRotation += 60;
   updateView();
});

// Next button
nextBtn.addEventListener('click', () => {
   currentIndex = (currentIndex + 1) % featureCards.length;
   currentRotation -= 60;
   updateView();
});

// Touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

carousel.addEventListener('touchstart', (e) => {
   touchStartX = e.changedTouches[0].screenX;
});

carousel.addEventListener('touchend', (e) => {
   touchEndX = e.changedTouches[0].screenX;
   handleSwipe();
});

function handleSwipe() {
   if (touchEndX < touchStartX - 50) {
      // Swipe left - next
      nextBtn.click();
   }
   if (touchEndX > touchStartX + 50) {
      // Swipe right - previous
      prevBtn.click();
   }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
   anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
         target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
         });
      }
   });
});

// Intersection Observer for fade-in animations
const observerOptions = {
   threshold: 0.1,
   rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
      if (entry.isIntersecting) {
         entry.target.style.opacity = '1';
         entry.target.style.transform = 'translateY(0)';
      }
   });
}, observerOptions);

// Observe feature cards and gallery items
document.querySelectorAll('.gallery-item').forEach(item => {
   item.style.opacity = '0';
   item.style.transform = 'translateY(30px)';
   item.style.transition = 'all 0.6s ease';
   observer.observe(item);
});

// Form submission effect
const submitBtn = document.querySelector('.submit-btn');
if (submitBtn) {
   submitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Create ripple effect
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.width = '10px';
      ripple.style.height = '10px';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.borderRadius = '50%';
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.pointerEvents = 'none';
      ripple.style.animation = 'ripple 0.6s ease-out';

      const rect = submitBtn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';

      submitBtn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
   });
}

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
            @keyframes ripple {
                to {
                    width: 300px;
                    height: 300px;
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);

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
        var quizAnswers = { q1: 'A', q2: 'C', q3: 'B' };
        var userAnswers = {};
        
        // Navigation function
        function goToStage(stage) {
            if (stage < 1 || stage > totalStages) return;
            
            currentStage = stage;
            showStage(stage);
            updateProgress();
            localStorage.setItem('parallax_design_stage', stage);
            
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
                resultHtml += '<p style="color: #00ffcc; font-weight: 600; margin-top: 10px;">Congratulations! You passed! Your certificate is now available.</p>';
                $('#certificate-section').show();
                var name = localStorage.getItem('parallax_design_name') || 'Learner';
                $('#cert-name').text(name);
            } else {
                resultHtml += '<p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Please review the course and try again. You need at least 66% to pass.</p>';
            }
            
            $('#quiz-result').html(resultHtml).show();
        });
        
        // Certificate download
        $('#download-cert').on('click', function() {
            var name = localStorage.getItem('parallax_design_name') || 'Learner';
            var date = new Date().toLocaleDateString();
            var certUrl = 'certificate.html?name=' + encodeURIComponent(name) + '&date=' + encodeURIComponent(date) + '&course=Parallax Design Fundamentals';
            window.open(certUrl, '_blank');
        });
        
        // Load saved progress
        var saved = localStorage.getItem('parallax_design_stage');
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