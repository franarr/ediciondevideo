import { featuredProjects, formatDuration } from '../data';
import { t, pick } from '../i18n/i18n';
import { escapeHtml } from '../utils/dom';

// Ancho de la columna de nombres de pista (V1, T, A1): se lee del CSS (más angosta en celular)
let TRACK_LABEL_WIDTH = 100;
const MIN_CLIP_WIDTH = 96;
const PX_PER_SECOND = 7;
const FPS = 30;

const timecode = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const f = Math.floor((secs % 1) * FPS);
  return [h, m, s, f].map((n) => String(n).padStart(2, '0')).join(':');
};

// Onda de audio decorativa pero estable (siempre igual para el mismo video)
const waveform = (seed, bars) => {
  let x = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: bars }, () => {
    x = (x * 9301 + 49297) % 233280;
    return 4 + Math.round((x / 233280) * 22);
  });
};

export function initVideoTimeline() {
  const video = document.getElementById('editor-video');
  const section = document.getElementById('estudio');
  if (!video || !section) return;

  TRACK_LABEL_WIDTH = document.querySelector('.track-label')?.offsetWidth || 100;

  const clips = featuredProjects();
  if (!clips.length) {
    section.hidden = true;
    return;
  }

  const $ = (id) => document.getElementById(id);
  const viewport = document.querySelector('.video-viewport-container');
  const playBtn = $('video-play-btn');
  const playIcon = playBtn.querySelector('.overlay-play-icon');
  const pauseIcon = playBtn.querySelector('.overlay-pause-icon');
  const loading = $('video-loading');
  const soundBtn = $('sound-indicator');
  const scroller = $('editor-timeline');
  const tracks = $('timeline-tracks');
  const playhead = $('timeline-playhead');
  const trackVideo = $('track-video');

  // ─── Layout de la secuencia ───
  let cursor = 0;
  let seqTime = 0;
  const layout = clips.map((clip) => {
    const width = Math.max(MIN_CLIP_WIDTH, Math.round(clip.duration * PX_PER_SECOND));
    const item = { clip, left: cursor, width, start: seqTime };
    cursor += width + 3;
    seqTime += clip.duration;
    return item;
  });
  tracks.style.width = `${TRACK_LABEL_WIDTH + cursor}px`;

  trackVideo.innerHTML = layout
    .map(
      ({ clip, width }, i) => `
      <button class="timeline-clip" style="width:${width}px" data-index="${i}" title="${escapeHtml(clip.title)}">
        <span class="clip-title">${escapeHtml(clip.title)}</span>
      </button>`
    )
    .join('');

  $('track-text').innerHTML = layout
    .map(({ width }, i) => `<span class="timeline-clip-static" style="width:${width}px">[ ${['SUBS', 'TITULOS', 'POP-UPS'][i % 3]} ]</span>`)
    .join('');

  $('track-audio').innerHTML = layout
    .map(
      ({ clip, width }) => `
      <span class="audio-waveform" style="width:${width}px">
        ${waveform(clip.id, Math.max(8, Math.round(width / 9))).map((h) => `<span class="wave-bar" style="height:${h}px"></span>`).join('')}
      </span>`
    )
    .join('');

  $('timeline-ruler').innerHTML = layout
    .map(({ left, start }) => `<span style="left:${TRACK_LABEL_WIDTH + left}px">${timecode(start).slice(3, 8)}</span>`)
    .join('');

  const clipButtons = [...trackVideo.querySelectorAll('.timeline-clip')];

  // ─── Estado de reproducción ───
  let active = -1;
  let wantsPlay = false;
  let sectionVisible = false;

  const setPlayingUI = (playing) => {
    viewport.classList.toggle('is-paused', !playing);
    playIcon.classList.toggle('hidden', playing);
    pauseIcon.classList.toggle('hidden', !playing);
  };

  const renderInspector = () => {
    const { clip } = layout[active];
    $('inspect-title').textContent = clip.title;
    $('inspect-client').textContent = clip.client || '—';
    $('inspect-rubro').textContent = t(`rubro.${clip.rubro}`);
    $('inspect-format').textContent = t(`format.${clip.orientation}`);
    $('inspect-duration').textContent = formatDuration(clip.duration);
    $('active-track-name').textContent = `${clip.id}.mp4`;

    const tags = pick(clip.tags) || [];
    $('inspect-tags-section').hidden = !tags.length;
    $('inspect-tags').innerHTML = tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join('');
  };

  const play = () => {
    wantsPlay = true;
    video.play().catch(() => setPlayingUI(false));
  };

  const load = (index, { autoplay = true, seek = 0 } = {}) => {
    const changed = index !== active;
    active = index;
    clipButtons.forEach((b, i) => {
      b.classList.toggle('active', i === index);
      b.setAttribute('aria-pressed', String(i === index));
    });
    const { clip } = layout[index];
    viewport.classList.toggle('is-horizontal', clip.orientation === 'horizontal');
    renderInspector();

    if (changed) {
      video.poster = clip.poster;
      video.preload = 'auto';
      video.src = clip.src;
    }
    if (seek) video.currentTime = seek;
    if (autoplay) play();
  };

  // ─── Eventos del video ───
  video.addEventListener('waiting', () => loading.classList.remove('hidden'));
  video.addEventListener('canplay', () => loading.classList.add('hidden'));
  video.addEventListener('playing', () => {
    loading.classList.add('hidden');
    setPlayingUI(true);
  });
  video.addEventListener('pause', () => setPlayingUI(false));
  video.addEventListener('ended', () => load((active + 1) % layout.length));

  video.addEventListener('timeupdate', () => {
    if (!video.duration || active < 0) return;
    const { left, width, start } = layout[active];
    const x = TRACK_LABEL_WIDTH + left + (video.currentTime / video.duration) * width;
    playhead.style.transform = `translateX(${x}px)`;
    $('editor-timer').textContent = timecode(start + video.currentTime);

    // Mantener el cabezal a la vista mientras corre la secuencia
    const viewLeft = scroller.scrollLeft + TRACK_LABEL_WIDTH;
    const viewRight = scroller.scrollLeft + scroller.clientWidth - 40;
    if (x < viewLeft || x > viewRight) {
      scroller.scrollTo({ left: Math.max(0, x - TRACK_LABEL_WIDTH - 40), behavior: 'smooth' });
    }
  });

  // ─── Controles ───
  const togglePlay = () => (video.paused ? play() : ((wantsPlay = false), video.pause()));
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });
  viewport.addEventListener('click', togglePlay);

  $('video-fullscreen-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    (video.requestFullscreen || video.webkitEnterFullscreen || video.webkitRequestFullscreen)?.call(video);
  });

  const renderSound = () => {
    const label = soundBtn.querySelector('span');
    label.dataset.i18n = video.muted ? 'sound.mute' : 'sound.on';
    label.textContent = t(label.dataset.i18n);
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
    soundBtn.classList.toggle('is-on', !video.muted);
  };
  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    renderSound();
  });

  $('clip-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    load((active - 1 + layout.length) % layout.length);
  });
  $('clip-next').addEventListener('click', (e) => {
    e.stopPropagation();
    load((active + 1) % layout.length);
  });

  // Click en un clip: lo abre; click en otra parte de la pista: salta a ese punto
  trackVideo.addEventListener('click', (e) => {
    const btn = e.target.closest('.timeline-clip');
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const ratio = (e.clientX - btn.getBoundingClientRect().left) / btn.offsetWidth;
    const seek = index === active && video.duration ? ratio * video.duration : 0;
    load(index, { seek });
  });

  // ─── Cargar y reproducir solo cuando la sección está en pantalla ───
  new IntersectionObserver(
    ([entry]) => {
      sectionVisible = entry.isIntersecting;
      if (sectionVisible) {
        if (active < 0) load(0, { autoplay: false });
        if (wantsPlay || video.currentTime === 0) play();
      } else if (!video.paused) {
        video.pause();
        wantsPlay = true; // retomar al volver
      }
    },
    { threshold: 0.3 }
  ).observe(section.querySelector('.editor-desktop'));

  document.addEventListener('languagechange', () => {
    if (active >= 0) renderInspector();
    renderSound();
  });

  playhead.style.transform = `translateX(${TRACK_LABEL_WIDTH}px)`;
}
