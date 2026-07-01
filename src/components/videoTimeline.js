import { gsap } from 'gsap';

const LOCAL_SOURCES = [
  "./Videos/TERMINADO.mp4",
  "./Videos/voltra.mp4",
  "./Videos/video3.mp4",
  "./Videos/videeo4.mp4",
  "./Videos/Video5.mp4",
  "./Videos/video6.mp4",
  "./Videos/video7.mp4",
  "./Videos/video8.mp4",
  "./Videos/WhatsApp Video 2026-06-16 at 18.52.55.mp4"
];

export function initVideoTimeline() {
  const video = document.getElementById('editor-video');
  const playBtn = document.getElementById('video-play-btn');
  const playIcon = playBtn?.querySelector('.overlay-play-icon');
  const pauseIcon = playBtn?.querySelector('.overlay-pause-icon');
  const viewportContainer = document.querySelector('.video-viewport-container');
  const soundOverlay = document.getElementById('sound-indicator');
  
  const clips = document.querySelectorAll('.timeline-clip');
  const playhead = document.getElementById('timeline-playhead');
  const tracksWrapper = document.querySelector('.timeline-tracks-wrapper');
  const prevClipBtn = document.getElementById('clip-prev');
  const nextClipBtn = document.getElementById('clip-next');
  
  const inspectProj = document.getElementById('inspect-project');
  const inspectTools = document.getElementById('inspect-tools');
  const inspectRetention = document.getElementById('inspect-retention');
  const activeTrackTitle = document.getElementById('active-track-name');
  const editorTimer = document.getElementById('editor-timer');
  
  const fillColor = document.getElementById('fill-color');
  const fillFx = document.getElementById('fill-fx');
  const fillSfx = document.getElementById('fill-sfx');
  const valColor = document.getElementById('slider-val-color');
  const valFx = document.getElementById('slider-val-fx');
  const valSfx = document.getElementById('slider-val-sfx');

  if (!video) return;

  let activeVideoIndex = 0;

  // Set initial video source
  video.src = LOCAL_SOURCES[activeVideoIndex];
  video.load();

  // Play/Pause
  const togglePlay = () => {
    if (video.paused) {
      video.play().then(() => {
        viewportContainer?.classList.remove('is-paused');
        playIcon?.classList.add('hidden');
        pauseIcon?.classList.remove('hidden');
      }).catch(err => console.log("Playback interrupted: ", err));
    } else {
      video.pause();
      viewportContainer?.classList.add('is-paused');
      playIcon?.classList.remove('hidden');
      pauseIcon?.classList.add('hidden');
    }
  };

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  viewportContainer?.addEventListener('click', togglePlay);

  // Sound Toggle
  let isMuted = true;
  video.muted = isMuted;

  soundOverlay?.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    video.muted = isMuted;
    
    if (isMuted) {
      soundOverlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        </svg>
        AUDIO DESMUTEAR
      `;
    } else {
      soundOverlay.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        AUDIO ON
      `;
    }
  });

  const activateClip = (clip) => {
    clips.forEach(c => c.classList.remove('active'));
    clip.classList.add('active');

    const index = parseInt(clip.getAttribute('data-video-index'));
    const proj = clip.getAttribute('data-project');
    const tools = clip.getAttribute('data-tools');
    const retention = clip.getAttribute('data-retention');
    const title = clip.getAttribute('data-title');
    
    const valColorNum = clip.getAttribute('data-color');
    const valFxNum = clip.getAttribute('data-fx');
    const valSfxNum = clip.getAttribute('data-sfx');

    activeVideoIndex = index;
    video.src = LOCAL_SOURCES[activeVideoIndex];
    video.load();
    video.play().then(() => {
      viewportContainer?.classList.remove('is-paused');
      playIcon?.classList.add('hidden');
      pauseIcon?.classList.remove('hidden');
    }).catch(err => console.log(err));

    if (inspectProj) inspectProj.textContent = proj;
    if (inspectTools) inspectTools.textContent = tools;
    if (inspectRetention) inspectRetention.textContent = retention;
    if (activeTrackTitle) activeTrackTitle.textContent = title;

    gsap.to(fillColor, { width: `${valColorNum}%`, duration: 0.6, ease: "power2.out" });
    gsap.to(fillFx, { width: `${valFxNum}%`, duration: 0.6, ease: "power2.out" });
    gsap.to(fillSfx, { width: `${valSfxNum}%`, duration: 0.6, ease: "power2.out" });

    if (valColor) valColor.textContent = `${valColorNum}%`;
    if (valFx) valFx.textContent = `${valFxNum}%`;
    if (valSfx) valSfx.textContent = `${valSfxNum}%`;
  };

  // Switch Clips
  clips.forEach(clip => {
    clip.addEventListener('click', (e) => {
      e.stopPropagation();
      activateClip(clip);
    });
  });

  prevClipBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextIndex = (activeVideoIndex - 1 + clips.length) % clips.length;
    activateClip(clips[nextIndex]);
  });

  nextClipBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextIndex = (activeVideoIndex + 1) % clips.length;
    activateClip(clips[nextIndex]);
  });

  // Playhead movement
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    
    const currentSecs = Math.floor(video.currentTime);
    const ms = Math.floor((video.currentTime - currentSecs) * 30);
    const secsStr = String(currentSecs).padStart(2, '0');
    const framesStr = String(ms).padStart(2, '0');
    if (editorTimer) {
      editorTimer.textContent = `00:00:${secsStr}:${framesStr}`;
    }

    if (tracksWrapper && playhead) {
      const ratio = video.currentTime / video.duration;
      const containerWidth = tracksWrapper.clientWidth;
      const offset = 100;
      const scrollableWidth = containerWidth - offset - 10;
      const xPos = offset + (scrollableWidth * ratio);
      playhead.style.left = `${xPos}px`;
    }

  });

  // Timeline scrubbing
  const scrub = (e) => {
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    if (!tracksWrapper) return;
    const bound = tracksWrapper.getBoundingClientRect();
    const clickX = clientX - bound.left;
    const offset = 100;
    const scrollableWidth = bound.width - offset;

    if (clickX > offset) {
      const percentage = (clickX - offset) / scrollableWidth;
      if (video.duration) {
        video.currentTime = percentage * video.duration;
      }
    }
  };

  tracksWrapper?.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('timeline-tracks-wrapper') || 
        e.target.classList.contains('timeline-track') ||
        e.target.classList.contains('audio-waveform') ||
        e.target.classList.contains('wave-bar')) {
      scrub(e);
      const onMouseMove = (moveEvent) => scrub(moveEvent);
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  });

  tracksWrapper?.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('timeline-tracks-wrapper') || 
        e.target.classList.contains('timeline-track') ||
        e.target.classList.contains('audio-waveform') ||
        e.target.classList.contains('wave-bar')) {
      scrub(e);
      const onTouchMove = (moveEvent) => scrub(moveEvent);
      const onTouchEnd = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
  }, { passive: true });
}
