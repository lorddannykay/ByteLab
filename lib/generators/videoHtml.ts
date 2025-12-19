import { CourseData, CourseConfig } from '@/types/course';

export function generateVideoHTML(
  courseData: CourseData,
  config?: Partial<CourseConfig>
): string {
  const accent1 = config?.accentColor1 || '#4a90e2';
  const accent2 = config?.accentColor2 || '#50c9c3';

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Generate scene HTML with animations
  const generateScenes = () => {
    // If videoScenes are empty, generate from course stages
    if (!courseData.videoScenes || courseData.videoScenes.length === 0) {
      const scenes: string[] = [];
      
      // Add title scene
      scenes.push(`
      <div class="scene active" data-scene="0" data-duration="4000">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(courseData.course.title)}</h1>
        </div>
      </div>`);
      
      // Add scenes from stages
      courseData.course.stages?.forEach((stage, stageIdx) => {
        // Stage title scene
        scenes.push(`
      <div class="scene" data-scene="${scenes.length}" data-duration="4000">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(stage.title)}</h1>
        </div>
      </div>`);
        
        // Stage objective scene
        if (stage.objective) {
          scenes.push(`
      <div class="scene" data-scene="${scenes.length}" data-duration="5000">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(stage.objective)}</h1>
        </div>
      </div>`);
        }
        
        // Key points scenes
        stage.keyPoints?.forEach((point, pointIdx) => {
          scenes.push(`
      <div class="scene" data-scene="${scenes.length}" data-duration="4000">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(point)}</h1>
        </div>
      </div>`);
        });
        
        // Content summary scene
        if (stage.content?.summary) {
          scenes.push(`
      <div class="scene" data-scene="${scenes.length}" data-duration="5000">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(stage.content.summary)}</h1>
        </div>
      </div>`);
        }
      });
      
      return scenes.join('');
    }
    
    // Use existing videoScenes
    return courseData.videoScenes
      .map(
        (scene, idx) => `
      <div class="scene ${idx === 0 ? 'active' : ''}" data-scene="${idx}" data-duration="${scene.duration || 4000}">
        <div class="scene-content">
          <h1 class="scene-text">${escapeHtml(scene.text || scene.content || '')}</h1>
        </div>
      </div>`
      )
      .join('');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(courseData.course.title)} — Typography Video</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

<style>
:root {
  --bg1: #e0e0e0;
  --bg2: #dddddd;
  --bg3: #d5d5d5;
  --bg4: #bdbdbd;
  --bgInverse: #191919;
  --bgInverse2: #151515;
  --border: #191919;
  --accent1: ${accent1};
  --accent2: ${accent2};
  --inter: 'Inter', sans-serif;
  --poppins: 'Poppins', sans-serif;
  
  --scene-duration: 4000ms;
  --fade-duration: 800ms;
  --word-reveal-delay: 120ms;
  --kinetic-duration: 1500ms;
  
  /* Gradient colors - extract RGB from accent colors */
  --color1: ${accent1.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '204, 137, 145'};
  --color2: ${accent2.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ') || '169, 119, 184'};
  --color-bg1: rgb(224, 224, 224);
  --color-bg2: rgb(221, 221, 221);
  --circle-size: 80%;
  --blending: multiply;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
  font-family: var(--inter);
}

body {
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 100%);
  color: var(--bgInverse);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(var(--color1), 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(var(--color2), 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Animated Gradient Background */
.gradient-bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  background: linear-gradient(40deg, var(--color-bg1), var(--color-bg2));
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
}

.gradient-bg svg {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}

.gradient-bg .gradients-container {
  filter: url(#goo) blur(40px);
  width: 100%;
  height: 100%;
  position: relative;
}

@keyframes moveInCircle {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}

@keyframes moveVertical {
  0% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
  100% { transform: translateY(-50%); }
}

@keyframes moveHorizontal {
  0% { transform: translateX(-50%) translateY(-10%); }
  50% { transform: translateX(50%) translateY(10%); }
  100% { transform: translateX(-50%) translateY(-10%); }
}

.gradient-bg .g1 {
  position: absolute;
  background: radial-gradient(circle at center, rgba(var(--color1), 0.8) 0, rgba(var(--color1), 0) 50%) no-repeat;
  mix-blend-mode: var(--blending);
  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);
  transform-origin: center center;
  animation: moveVertical 30s ease infinite;
  opacity: 1;
}

.gradient-bg .g2 {
  position: absolute;
  background: radial-gradient(circle at center, rgba(var(--color2), 0.8) 0, rgba(var(--color2), 0) 50%) no-repeat;
  mix-blend-mode: var(--blending);
  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);
  transform-origin: calc(50% - 400px);
  animation: moveInCircle 20s reverse infinite;
  opacity: 1;
}

.gradient-bg .g3 {
  position: absolute;
  background: radial-gradient(circle at center, rgba(var(--color1), 0.8) 0, rgba(var(--color1), 0) 50%) no-repeat;
  mix-blend-mode: var(--blending);
  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2 + 200px);
  left: calc(50% - var(--circle-size) / 2 - 500px);
  transform-origin: calc(50% + 400px);
  animation: moveInCircle 40s linear infinite;
  opacity: 1;
}

.gradient-bg .g4 {
  position: absolute;
  background: radial-gradient(circle at center, rgba(var(--color2), 0.8) 0, rgba(var(--color2), 0) 50%) no-repeat;
  mix-blend-mode: var(--blending);
  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);
  transform-origin: calc(50% - 200px);
  animation: moveHorizontal 40s ease infinite;
  opacity: 0.7;
}

.gradient-bg .interactive {
  position: absolute;
  background: radial-gradient(circle at center, rgba(var(--color2), 0.8) 0, rgba(var(--color2), 0) 50%) no-repeat;
  mix-blend-mode: var(--blending);
  width: 100%;
  height: 100%;
  top: -50%;
  left: -50%;
  opacity: 0.7;
}

.video-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.scene {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  padding: 60px;
  text-align: center;
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.scene.active {
  opacity: 1;
  pointer-events: auto;
}

.scene-content {
  max-width: 1200px;
  width: 100%;
}

.scene-text {
  font-family: var(--poppins);
  font-size: clamp(2rem, 8vw, 6rem);
  font-weight: 800;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: fadeInScale 0.8s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(224, 224, 224, 0.98), rgba(224, 224, 224, 0.85));
  padding: 20px 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 2px solid var(--border);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
}

.control-btn {
  background: var(--bg1);
  border: 1px solid var(--border);
  color: var(--bgInverse);
  padding: 12px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-family: var(--inter);
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.control-btn:hover {
  background: var(--bgInverse);
  color: var(--bg1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.control-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.control-btn.active {
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  border-color: transparent;
  color: var(--bg1);
  box-shadow: 0 4px 15px rgba(var(--color1), 0.4);
}

.play-pause-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.progress-container {
  flex: 1;
  position: relative;
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;
  transition: height 0.2s ease;
}

.progress-container:hover {
  height: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent1), var(--accent2), var(--accent1));
  background-size: 200% 100%;
  width: 0%;
  transition: width 0.1s linear;
  border-radius: 3px;
  animation: progressShimmer 3s linear infinite;
}

@keyframes progressShimmer {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

.progress-scrubber {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--bgInverse);
  border: 2px solid var(--border);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.progress-container:hover .progress-scrubber {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.progress-scrubber:active {
  cursor: grabbing;
  transform: translate(-50%, -50%) scale(1.1);
}

.time-display {
  font-family: var(--inter);
  font-size: 13px;
  color: var(--bgInverse);
  opacity: 0.8;
  min-width: 100px;
  text-align: center;
}

.scene-indicator {
  font-family: var(--inter);
  font-size: 12px;
  color: var(--bgInverse);
  opacity: 0.8;
  padding: 8px 12px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.audio-toggle {
  position: relative;
}

.audio-toggle.muted::after {
  content: '🔇';
}

.audio-toggle:not(.muted)::after {
  content: '🔊';
}

.scene-indicator {
  position: fixed;
  top: 30px;
  right: 30px;
  background: rgba(224, 224, 224, 0.9);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 50px;
  font: 800 12px/1 var(--inter);
  color: var(--bgInverse);
  border: 1px solid var(--bgInverse);
}
</style>
</head>
<body>
<!-- Animated Gradient Background -->
<div class="gradient-bg">
  <svg xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
        <feBlend in="SourceGraphic" in2="goo" />
      </filter>
    </defs>
  </svg>
  <div class="gradients-container">
    <div class="g1"></div>
    <div class="g2"></div>
    <div class="g3"></div>
    <div class="g4"></div>
    <div class="interactive"></div>
  </div>
</div>

<!-- Video Container -->
<div class="video-container" id="videoContainer">
  ${generateScenes()}
</div>

<!-- Control Panel -->
<div class="controls">
  <button class="control-btn play-pause-btn" id="playPauseBtn" aria-label="Play/Pause">
    <span id="playIcon">▶</span>
  </button>
  
  <div class="progress-container" id="progressContainer" role="slider" aria-label="Video progress" tabindex="0">
    <div class="progress-bar" id="progressBar"></div>
    <div class="progress-scrubber" id="progressScrubber"></div>
  </div>
  
  <div class="time-display" id="timeDisplay">0:00 / 0:00</div>
  
  <div class="scene-indicator" id="sceneIndicator">Scene 1 / 0</div>
  
  <button class="control-btn" id="prevBtn" aria-label="Previous Scene">◀ Prev</button>
  <button class="control-btn" id="nextBtn" aria-label="Next Scene">Next ▶</button>
  
  <button class="control-btn" id="autoPlayBtn" aria-label="Toggle Auto-play">Auto</button>
  
  <button class="control-btn audio-toggle" id="audioToggle" aria-label="Toggle Audio">Audio</button>
</div>

  <script>
    const VIDEO_SCENES = ${JSON.stringify((() => {
      // If videoScenes are empty, generate from course stages
      if (!courseData.videoScenes || courseData.videoScenes.length === 0) {
        const scenes: any[] = [];
        
        // Title scene
        scenes.push({
          id: 0,
          text: courseData.course.title,
          duration: 4000,
        });
        
        // Generate scenes from stages
        courseData.course.stages?.forEach((stage, stageIdx) => {
          // Stage title scene
          scenes.push({
            id: scenes.length,
            text: stage.title,
            duration: 4000,
          });
          
          // Stage objective scene
          if (stage.objective) {
            scenes.push({
              id: scenes.length,
              text: stage.objective,
              duration: 5000,
            });
          }
          
          // Key points scenes
          stage.keyPoints?.forEach((point) => {
            scenes.push({
              id: scenes.length,
              text: point,
              duration: 4000,
            });
          });
          
          // Content summary scene
          if (stage.content?.summary) {
            scenes.push({
              id: scenes.length,
              text: stage.content.summary,
              duration: 5000,
            });
          }
        });
        
        return scenes;
      }
      return courseData.videoScenes;
    })())};

    // AudioManager class
    class AudioManager {
      constructor() {
        this.audioElements = {};
        this.currentSceneAudio = null;
        this.audioDurations = {};
        this.onAudioEnded = null;
        this.init();
      }

      init() {
        // Create audio elements for each scene - try audio file first, then audioDataURL
        VIDEO_SCENES.forEach((scene, index) => {
          const audio = document.createElement('audio');
          audio.preload = 'auto';
          // Try audio file path first (from export), then fall back to audioDataURL
          const audioPath = \`audio/scene-\${scene.id.toString().padStart(4, '0')}.mp3\`;
          audio.src = scene.audioDataURL || audioPath;
          audio.id = \`scene-audio-\${scene.id}\`;
          
          // Store duration when loaded
          audio.addEventListener('loadedmetadata', () => {
            this.audioDurations[scene.id] = audio.duration * 1000; // Convert to milliseconds
            if (window.typographyVideo) {
              window.typographyVideo.recalculateTotalDuration();
            }
          });
          
          // Handle audio errors gracefully
          audio.addEventListener('error', (e) => {
            console.warn(\`Failed to load audio for scene \${scene.id}:\`, e);
          });
          
          this.audioElements[scene.id] = audio;
        });
      }

      playSceneAudio(sceneIndex) {
        // Stop current audio
        if (this.currentSceneAudio) {
          this.currentSceneAudio.pause();
          this.currentSceneAudio.currentTime = 0;
          if (this.onAudioEnded) {
            this.currentSceneAudio.removeEventListener('ended', this.onAudioEnded);
          }
        }

        // Get scene data
        const scene = VIDEO_SCENES[sceneIndex];
        if (!scene) {
          return; // No scene data
        }

        // Play new scene audio if it exists
        if (sceneIndex >= 0 && this.audioElements[scene.id]) {
          this.currentSceneAudio = this.audioElements[scene.id];
          this.currentSceneAudio.currentTime = 0;
          
          // Ensure audio is not muted if audio is enabled
          const video = window.typographyVideo;
          if (video && video.audioEnabled) {
            this.currentSceneAudio.muted = false;
          }
          
          // Listen for audio end
          this.onAudioEnded = () => {
            if (video && video.isPlaying && video.autoPlay) {
              setTimeout(() => {
                if (video.currentSceneIndex === sceneIndex && video.isPlaying) {
                  // Allow natural progression
                }
              }, 200);
            }
          };
          
          this.currentSceneAudio.addEventListener('ended', this.onAudioEnded);
          
          this.currentSceneAudio.play().catch(e => {
            console.log(\`Audio play failed for scene \${scene.id}:\`, e);
          });
        }
      }

      getAudioDuration(sceneIndex) {
        const scene = VIDEO_SCENES[sceneIndex];
        return scene ? this.audioDurations[scene.id] || null : null;
      }

      pauseAudio() {
        if (this.currentSceneAudio) {
          this.currentSceneAudio.pause();
        }
      }

      setMuted(muted) {
        Object.values(this.audioElements).forEach(audio => {
          if (audio) {
            audio.muted = muted;
          }
        });
        if (this.currentSceneAudio) {
          this.currentSceneAudio.muted = muted;
        }
      }

      getAudioDuration(sceneIndex) {
        const scene = VIDEO_SCENES[sceneIndex];
        return scene ? this.audioDurations[scene.id] || null : null;
      }
    }

    // Initialize AudioManager
    const audioManager = new AudioManager();

    // Enhanced TypographyVideo class
    class TypographyVideo {
      constructor() {
        this.scenes = Array.from(document.querySelectorAll('.scene'));
        this.currentSceneIndex = 0;
        this.isPlaying = false;
        this.autoPlay = window.self === window.top; // Only autoplay if not in iframe
        this.audioEnabled = true;
        this.totalDuration = 0;
        this.currentTime = 0;
        this.animationFrame = null;
        this.init();
      }

      init() {
        // Calculate total duration
        this.scenes.forEach(scene => {
          const duration = parseInt(scene.dataset.duration) || 4000;
          this.totalDuration += duration;
        });

        this.showScene(0);
        this.setupControls();
        this.setupKeyboard();
        
        // Recalculate after audio loads
        setTimeout(() => {
          this.recalculateTotalDuration();
        }, 2000);
      }

      recalculateTotalDuration() {
        let newTotalDuration = 0;
        for (let i = 0; i < this.scenes.length; i++) {
          const sceneDuration = parseInt(this.scenes[i].dataset.duration) || 4000;
          let effectiveDuration = sceneDuration;
          if (audioManager && i >= 0) {
            const audioDuration = audioManager.getAudioDuration(i);
            if (audioDuration) {
              effectiveDuration = Math.max(sceneDuration, audioDuration + 800);
            }
          }
          newTotalDuration += effectiveDuration;
        }
        this.totalDuration = newTotalDuration;
      }

      setupControls() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        const audioToggle = document.getElementById('audioToggle');
        const progressContainer = document.getElementById('progressContainer');

        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        prevBtn.addEventListener('click', () => this.previousScene());
        nextBtn.addEventListener('click', () => this.nextScene());
        autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        audioToggle.addEventListener('click', () => this.toggleAudio());

        progressContainer.addEventListener('click', (e) => {
          const rect = progressContainer.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          this.seekTo(percent);
        });
      }

      setupKeyboard() {
        document.addEventListener('keydown', (e) => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
          switch(e.code) {
            case 'Space':
              e.preventDefault();
              this.togglePlayPause();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              this.previousScene();
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.nextScene();
              break;
            case 'KeyM':
              this.toggleAudio();
              break;
          }
        });
      }

      showScene(index) {
        if (index < 0 || index >= this.scenes.length) return;
        this.scenes.forEach((scene, i) => {
          scene.classList.remove('active');
        });
        const scene = this.scenes[index];
        scene.classList.add('active');
        this.currentSceneIndex = index;
        audioManager.playSceneAudio(index);
        this.updateSceneIndicator();
        this.updateProgress();
      }

      play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        document.getElementById('playIcon').textContent = '⏸';
        this.startTimeline();
      }

      pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        document.getElementById('playIcon').textContent = '▶';
        audioManager.pauseAudio();
        this.stopTimeline();
      }

      togglePlayPause() {
        if (this.isPlaying) {
          this.pause();
        } else {
          this.play();
        }
      }

      startTimeline() {
        const startTime = Date.now() - this.currentTime;
        const update = () => {
          if (!this.isPlaying) return;
          this.currentTime = Date.now() - startTime;
          this.updateProgress();

          let accumulatedTime = 0;
          for (let i = 0; i < this.scenes.length; i++) {
            const sceneDuration = parseInt(this.scenes[i].dataset.duration) || 4000;
            let effectiveDuration = sceneDuration;
            if (audioManager) {
              const audioDuration = audioManager.getAudioDuration(i);
              if (audioDuration) {
                effectiveDuration = Math.max(sceneDuration, audioDuration + 800);
              }
            }
            if (this.currentTime < accumulatedTime + effectiveDuration) {
              if (i !== this.currentSceneIndex) {
                this.showScene(i);
              }
              break;
            }
            accumulatedTime += effectiveDuration;
          }

          if (this.currentTime >= this.totalDuration) {
            this.pause();
            this.currentTime = this.totalDuration;
          } else {
            this.animationFrame = requestAnimationFrame(update);
          }
        };
        this.animationFrame = requestAnimationFrame(update);
      }

      stopTimeline() {
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = null;
        }
      }

      nextScene() {
        if (this.currentSceneIndex < this.scenes.length - 1) {
          this.pause();
          this.updateCurrentTimeForScene(this.currentSceneIndex + 1);
          this.showScene(this.currentSceneIndex + 1);
          if (this.autoPlay) {
            setTimeout(() => this.play(), 300);
          }
        }
      }

      previousScene() {
        if (this.currentSceneIndex > 0) {
          this.pause();
          this.updateCurrentTimeForScene(this.currentSceneIndex - 1);
          this.showScene(this.currentSceneIndex - 1);
          if (this.autoPlay) {
            setTimeout(() => this.play(), 300);
          }
        }
      }

      updateCurrentTimeForScene(sceneIndex) {
        let time = 0;
        for (let i = 0; i < sceneIndex; i++) {
          const sceneDuration = parseInt(this.scenes[i].dataset.duration) || 4000;
          let effectiveDuration = sceneDuration;
          if (audioManager) {
            const audioDuration = audioManager.getAudioDuration(i);
            if (audioDuration) {
              effectiveDuration = Math.max(sceneDuration, audioDuration + 800);
            }
          }
          time += effectiveDuration;
        }
        this.currentTime = time;
      }

      seekTo(percent) {
        this.pause();
        this.currentTime = this.totalDuration * percent;
        this.updateCurrentTimeForScene(Math.floor(percent * this.scenes.length));
        this.showScene(Math.floor(percent * this.scenes.length));
        if (this.autoPlay) {
          setTimeout(() => this.play(), 300);
        }
      }

      toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        const btn = document.getElementById('autoPlayBtn');
        if (this.autoPlay) {
          btn.classList.add('active');
          btn.textContent = 'Auto ✓';
        } else {
          btn.classList.remove('active');
          btn.textContent = 'Auto';
        }
      }

      toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById('audioToggle');
        audioManager.setMuted(!this.audioEnabled);
        if (this.audioEnabled) {
          btn.classList.remove('muted');
        } else {
          btn.classList.add('muted');
        }
      }

      updateProgress() {
        const percent = (this.currentTime / this.totalDuration) * 100;
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressScrubber').style.left = percent + '%';

        const currentMinutes = Math.floor(this.currentTime / 60000);
        const currentSeconds = Math.floor((this.currentTime % 60000) / 1000);
        const totalMinutes = Math.floor(this.totalDuration / 60000);
        const totalSeconds = Math.floor((this.totalDuration % 60000) / 1000);

        document.getElementById('timeDisplay').textContent = 
          \`\${currentMinutes}:\${currentSeconds.toString().padStart(2, '0')} / \${totalMinutes}:\${totalSeconds.toString().padStart(2, '0')}\`;
      }

      updateSceneIndicator() {
        const displayText = \`Scene \${this.currentSceneIndex + 1} / \${this.scenes.length}\`;
        document.getElementById('sceneIndicator').textContent = displayText;
      }
    }

    // Initialize
    const video = new TypographyVideo();
    window.typographyVideo = video;
    window.audioManager = audioManager;

    // Initialize interactive gradient background
    const interBubble = document.querySelector('.interactive');
    if (interBubble) {
      let curX = 0, curY = 0, tgX = 0, tgY = 0;
      function move() {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = \`translate(\${Math.round(curX)}px, \${Math.round(curY)}px)\`;
        requestAnimationFrame(move);
      }
      window.addEventListener('mousemove', (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
      });
      move();
    }

    // Listen for pause messages from parent window
    window.addEventListener('message', function(event) {
      if (event.data && event.data.action === 'pause') {
        if (window.typographyVideo) {
          window.typographyVideo.pause();
        }
      }
    });
  </script>
</body>
</html>`;
}

