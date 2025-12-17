import { CourseData, CourseConfig } from '@/types/course';

export function generatePodcastHTML(
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(courseData.course.title)} — Podcast</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

<style>
:root {
  --bg1: #e0e0e0;
  --bg2: #dddddd;
  --bg3: #d5d5d5;
  --bg4: #bdbdbd;
  --bgInverse: #191919;
  --accent1: ${accent1};
  --accent2: ${accent2};
  --inter: 'Inter', sans-serif;
  --poppins: 'Poppins', sans-serif;
  --border: #191919;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: var(--inter);
  background: var(--bg1);
  color: var(--bgInverse);
}

body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px;
  min-height: 100%;
  overflow: auto;
}

.podcast-container {
  max-width: 800px;
  width: 100%;
  background: var(--bg2);
  border: 2px solid var(--border);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.podcast-header {
  text-align: center;
  margin-bottom: 30px;
}

.podcast-header h1 {
  font-family: var(--poppins);
  font-size: 2.5rem;
  font-weight: 800;
  text-transform: uppercase;
  background: linear-gradient(to right, var(--accent2), var(--accent1));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 10px;
}

.podcast-header h2 {
  font-family: var(--inter);
  font-size: 1.2rem;
  font-weight: 400;
  color: var(--bgInverse);
  opacity: 0.8;
}

.podcast-info {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.podcast-info p {
  font-size: 0.9rem;
  color: var(--bgInverse);
  opacity: 0.8;
  margin: 5px 0;
}

.audio-player {
  background: var(--bg1);
  border: 2px solid var(--border);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
}

.audio-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.play-pause-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  border: 2px solid var(--border);
  color: var(--bg1);
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.play-pause-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(204, 137, 145, 0.4);
}

.play-pause-btn:active {
  transform: scale(0.95);
}

.progress-container {
  position: relative;
  width: 100%;
  height: 8px;
  background: var(--bg3);
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 15px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent1), var(--accent2));
  border-radius: 4px;
  width: 0%;
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-family: var(--inter);
  font-size: 0.9rem;
  color: var(--bgInverse);
  opacity: 0.8;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.volume-control label {
  font-size: 0.9rem;
  color: var(--bgInverse);
}

.volume-slider {
  flex: 1;
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  border: 2px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  border: 2px solid var(--border);
  border-radius: 50%;
  cursor: pointer;
}

.podcast-description {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.podcast-description h3 {
  font-family: var(--poppins);
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: var(--bgInverse);
}

.podcast-description p {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--bgInverse);
  opacity: 0.9;
  margin-bottom: 10px;
}

.dialogue-container {
  background: var(--bg1);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.dialogue-item {
  margin: 15px 0;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--accent1);
}

.dialogue-item.host {
  background: rgba(74, 144, 226, 0.1);
  border-left-color: var(--accent1);
}

.dialogue-item.expert {
  background: rgba(80, 201, 195, 0.1);
  border-left-color: var(--accent2);
}

.dialogue-speaker {
  font: 800 12px/1 var(--inter);
  text-transform: uppercase;
  color: var(--bgInverse);
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.dialogue-text {
  font: 14px/1.6 var(--inter);
  color: var(--bgInverse);
}

@media (max-width: 768px) {
  .podcast-container {
    padding: 25px;
  }
  
  .podcast-header h1 {
    font-size: 2rem;
  }
  
  .play-pause-btn {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
}
</style>
</head>
<body>

<div class="podcast-container">
  <div class="podcast-header">
    <h1>${escapeHtml(courseData.course.title)}</h1>
    <h2>Podcast Episode</h2>
  </div>

  <div class="podcast-info">
    <p><strong>Duration:</strong> ~${courseData.course.duration || '15-20 minutes'}</p>
    <p><strong>Format:</strong> Conversational two-speaker dialogue</p>
    <p><strong>Host & Expert:</strong> Learn through engaging conversation</p>
  </div>

  <div class="audio-player">
    <div class="audio-controls">
      <button class="play-pause-btn" id="playPauseBtn" aria-label="Play/Pause">
        <span id="playIcon">▶</span>
      </button>
    </div>

    <div class="progress-container" id="progressContainer">
      <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="time-display">
      <span id="currentTime">0:00</span>
      <span id="totalTime">0:00</span>
    </div>

    <div class="volume-control">
      <label for="volumeSlider">Volume:</label>
      <input type="range" id="volumeSlider" class="volume-slider" min="0" max="100" value="100">
    </div>
  </div>

  <div class="podcast-description">
    <h3>About This Podcast</h3>
    <p>Join our host and expert as they explore the course content through an engaging conversation. This podcast covers key concepts and insights from the course material.</p>
    <p>Perfect for learning on the go! Listen while commuting, exercising, or whenever you prefer audio learning.</p>
  </div>

  <div class="dialogue-container">
    <h3 style="margin-bottom: 15px; font: 800 16px/1 var(--inter); text-transform: uppercase;">Episode Transcript</h3>
    ${(() => {
      // If podcastDialogue is empty, generate from course stages
      if (!courseData.podcastDialogue || courseData.podcastDialogue.length === 0) {
        const dialogue: string[] = [];
        
        // Introduction from host
        dialogue.push(`
    <div class="dialogue-item host">
      <div class="dialogue-speaker">Host</div>
      <div class="dialogue-text">${escapeHtml(`Welcome to ${courseData.course.title}. ${courseData.course.description || 'Let\'s dive in!'}`)}</div>
    </div>
    `);
        
        // Dialogue from stages
        courseData.course.stages?.forEach((stage, stageIdx) => {
          // Host introduces the stage
          dialogue.push(`
    <div class="dialogue-item host">
      <div class="dialogue-speaker">Host</div>
      <div class="dialogue-text">${escapeHtml(`In this stage, we'll explore: ${stage.title}. ${stage.objective || ''}`)}</div>
    </div>
    `);
          
          // Expert explains key points
          stage.keyPoints?.forEach((point) => {
            dialogue.push(`
    <div class="dialogue-item expert">
      <div class="dialogue-speaker">Expert</div>
      <div class="dialogue-text">${escapeHtml(point)}</div>
    </div>
    `);
          });
          
          // Host summarizes
          if (stage.content?.summary) {
            dialogue.push(`
    <div class="dialogue-item host">
      <div class="dialogue-speaker">Host</div>
      <div class="dialogue-text">${escapeHtml(`To summarize: ${stage.content.summary}`)}</div>
    </div>
    `);
          }
        });
        
        // Closing from host
        dialogue.push(`
    <div class="dialogue-item host">
      <div class="dialogue-speaker">Host</div>
      <div class="dialogue-text">${escapeHtml('That concludes our course. Thank you for listening!')}</div>
    </div>
    `);
        
        return dialogue.join('');
      }
      
      // Use existing podcastDialogue
      return courseData.podcastDialogue
        .map(
          (segment) => `
    <div class="dialogue-item ${segment.speaker || 'host'}">
      <div class="dialogue-speaker">${segment.speaker === 'host' ? 'Host' : 'Expert'}</div>
      <div class="dialogue-text">${escapeHtml(segment.text || segment.content || '')}</div>
    </div>
    `
        )
        .join('');
    })()}
  </div>
</div>

<script>
const PODCAST_DIALOGUE = ${JSON.stringify((() => {
  // If podcastDialogue is empty, generate from course stages
  if (!courseData.podcastDialogue || courseData.podcastDialogue.length === 0) {
    const dialogue: any[] = [];
    
    // Introduction from host
    dialogue.push({
      speaker: 'host',
      text: `Welcome to ${courseData.course.title}. ${courseData.course.description || "Let's dive in!"}`,
      timestamp: 0,
    });
    
    // Dialogue from stages
    courseData.course.stages?.forEach((stage, stageIdx) => {
      // Host introduces the stage
      dialogue.push({
        speaker: 'host',
        text: `In this stage, we'll explore: ${stage.title}. ${stage.objective || ''}`,
        timestamp: dialogue.length * 10,
      });
      
      // Expert explains key points
      stage.keyPoints?.forEach((point) => {
        dialogue.push({
          speaker: 'expert',
          text: point,
          timestamp: dialogue.length * 10,
        });
      });
      
      // Host summarizes
      if (stage.content?.summary) {
        dialogue.push({
          speaker: 'host',
          text: `To summarize: ${stage.content.summary}`,
          timestamp: dialogue.length * 10,
        });
      }
    });
    
    // Closing from host
    dialogue.push({
      speaker: 'host',
      text: 'That concludes our course. Thank you for listening!',
      timestamp: dialogue.length * 10,
    });
    
    return dialogue;
  }
  
  return courseData.podcastDialogue;
})())};

class PodcastPlayer {
  constructor() {
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.playIcon = document.getElementById('playIcon');
    this.progressBar = document.getElementById('progressBar');
    this.progressContainer = document.getElementById('progressContainer');
    this.currentTimeDisplay = document.getElementById('currentTime');
    this.totalTimeDisplay = document.getElementById('totalTime');
    this.volumeSlider = document.getElementById('volumeSlider');
    
    this.isPlaying = false;
    this.audioElements = [];
    this.currentAudioIndex = 0;
    this.currentAudio = null;
    this.startTime = 0;
    this.totalDuration = 0;
    this.progressInterval = null;
    this.audioDurations = [];
    
    this.init();
  }

  init() {
    // Check if audio elements exist
    if (!this.playPauseBtn || !this.progressBar) {
      console.error('Audio player elements not found');
      this.showError('Audio player not found');
      return;
    }

    // Create audio elements from audio files (scene-XXXX.mp3 or podcast-segment-XXXX.mp3)
    PODCAST_DIALOGUE.forEach((segment, index) => {
      // Try to load from audio file path
      const audioPath = \`audio/podcast-segment-\${index.toString().padStart(4, '0')}.mp3\`;
        const audio = document.createElement('audio');
        audio.preload = 'auto';
        audio.src = segment.audioDataURL;
        audio.id = \`podcast-audio-\${index}\`;
        
        // Store duration when loaded
        audio.addEventListener('loadedmetadata', () => {
          this.audioDurations[index] = audio.duration;
          this.calculateTotalDuration();
        });
        
        // Handle audio end - play next segment
        audio.addEventListener('ended', () => {
          if (this.currentAudioIndex < this.audioElements.length - 1) {
            this.currentAudioIndex++;
            this.playCurrentSegment();
          } else {
            this.pause();
          }
        });
        
        // Handle audio errors gracefully
        audio.addEventListener('error', (e) => {
          console.warn(\`Failed to load audio for segment \${index}:\`, e);
          console.warn('Attempted path:', audio.currentSrc || audio.src);
          // Skip to next segment if this one fails
          if (this.isPlaying && this.currentAudioIndex === index) {
            setTimeout(() => {
              if (this.currentAudioIndex < this.audioElements.length - 1) {
                this.currentAudioIndex++;
                this.playCurrentSegment();
              } else {
                this.pause();
              }
            }, 100);
          }
        });
        
        this.audioElements.push(audio);
    });

    // Calculate total duration
    this.calculateTotalDuration();

    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    
    this.progressContainer.addEventListener('click', (e) => {
      const rect = this.progressContainer.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.seekTo(percent);
    });

    // Volume control
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        this.setVolume(volume);
      });
    }
  }

  setVolume(volume) {
    this.audioElements.forEach(audio => {
      if (audio) {
        audio.volume = volume;
      }
    });
    if (this.currentAudio) {
      this.currentAudio.volume = volume;
    }
  }

  calculateTotalDuration() {
    this.totalDuration = this.audioDurations.reduce((sum, dur) => sum + (dur || 0), 0);
    if (this.totalDuration > 0) {
      this.updateTotalTime(this.totalDuration);
    }
  }

  playCurrentSegment() {
    // Stop current audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    // Play new segment
    if (this.currentAudioIndex < this.audioElements.length && this.audioElements[this.currentAudioIndex]) {
      this.currentAudio = this.audioElements[this.currentAudioIndex];
      this.currentAudio.currentTime = 0;
      this.currentAudio.play().catch(e => {
        console.log(\`Audio play failed for segment \${this.currentAudioIndex}:\`, e);
        // Try next segment
        if (this.currentAudioIndex < this.audioElements.length - 1) {
          this.currentAudioIndex++;
          this.playCurrentSegment();
        } else {
          this.pause();
        }
      });
    } else {
      // No audio for this segment, skip to next
      if (this.currentAudioIndex < this.audioElements.length - 1) {
        this.currentAudioIndex++;
        setTimeout(() => this.playCurrentSegment(), 100);
      } else {
        this.pause();
      }
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    // Check if audio elements exist
    if (!this.audioElements || this.audioElements.length === 0) {
      this.showError('No audio available. Please generate the podcast audio files first.');
      return;
    }

    if (this.currentAudioIndex >= this.audioElements.length) {
      this.currentAudioIndex = 0; // Restart if at end
    }
    
    this.startTime = Date.now();
    // Calculate elapsed time from previous segments
    for (let i = 0; i < this.currentAudioIndex; i++) {
      this.startTime -= (this.audioDurations[i] || 0) * 1000;
    }
    
    this.playCurrentSegment();
    this.isPlaying = true;
    this.updatePlayIcon();
    this.progressInterval = setInterval(() => this.updateProgress(), 100);
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.isPlaying = false;
    this.updatePlayIcon();
    clearInterval(this.progressInterval);
  }

  updatePlayIcon() {
    this.playIcon.textContent = this.isPlaying ? '⏸' : '▶';
  }

  seekTo(percent) {
    // Pause current playback
    this.pause();
    
    // Calculate which segment to start from
    const targetTime = this.totalDuration * percent;
    let accumulatedTime = 0;
    let targetIndex = 0;
    
    for (let i = 0; i < this.audioDurations.length; i++) {
      const segmentDuration = this.audioDurations[i] || 0;
      if (accumulatedTime + segmentDuration >= targetTime) {
        targetIndex = i;
        break;
      }
      accumulatedTime += segmentDuration;
      targetIndex = i + 1;
    }
    
    this.currentAudioIndex = Math.min(targetIndex, this.audioElements.length - 1);
    
    // Calculate start time within the target segment
    const segmentStartTime = accumulatedTime;
    const segmentOffset = targetTime - segmentStartTime;
    
    // Start playing from target segment
    this.startTime = Date.now() - (targetTime * 1000);
    this.play();
    
    // Seek within the current segment if needed
    if (this.currentAudio && segmentOffset > 0) {
      this.currentAudio.currentTime = segmentOffset;
    }
  }

  updateProgress() {
    if (this.isPlaying && this.totalDuration > 0) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const percent = Math.min(100, (elapsed / this.totalDuration) * 100);
      this.progressBar.style.width = percent + '%';
      this.updateCurrentTime(elapsed);
    }
  }

  updateCurrentTime(elapsed) {
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    this.currentTimeDisplay.textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  }

  updateTotalTime(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    this.totalTimeDisplay.textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
  }

  showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.podcast-error');
    if (existingError) {
      existingError.remove();
    }

    const errorMsg = document.createElement('div');
    errorMsg.className = 'podcast-error';
    errorMsg.style.cssText = 'background: var(--bg2); border: 2px solid var(--accent1); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;';
    errorMsg.innerHTML = '<p style="color: var(--bgInverse); margin: 0 0 10px 0; font-weight: 600;"><strong>⚠️ Podcast Audio Not Available</strong></p><p style="color: var(--bgInverse); opacity: 0.8; font-size: 0.9rem; margin: 0; line-height: 1.6;">' + message + '</p>';
    const player = document.querySelector('.audio-player');
    if (player && player.parentNode) {
      player.parentNode.insertBefore(errorMsg, player.nextSibling);
    } else {
      const container = document.querySelector('.podcast-container');
      if (container) {
        container.appendChild(errorMsg);
      }
    }
    
    // Disable play button
    if (this.playPauseBtn) {
      this.playPauseBtn.disabled = true;
      this.playPauseBtn.style.opacity = '0.5';
      this.playPauseBtn.style.cursor = 'not-allowed';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.podcastPlayer = new PodcastPlayer();
  
  // Listen for pause messages from parent window (when modal closes)
  window.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'pause') {
      if (window.podcastPlayer) {
        window.podcastPlayer.pause();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      window.podcastPlayer.togglePlayPause();
    }
  });
});
</script>

</body>
</html>`;
}

