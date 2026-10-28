import { t } from '../i18n/i18n';
import { escapeHtml } from '../utils/dom';

let dialog, video, caption;
let playlist = [];
let index = 0;

const render = () => {
  const item = playlist[index];
  if (!item) return;
  video.poster = item.poster;
  video.src = item.src;
  video.classList.toggle('is-horizontal', item.orientation === 'horizontal');
  caption.innerHTML = `
    <strong>${escapeHtml(item.title)}</strong>
    <span>${escapeHtml([item.client, t(`rubro.${item.rubro}`)].filter(Boolean).join(' · '))}</span>`;
  video.play().catch(() => {});
  dialog.querySelectorAll('.lightbox-nav').forEach((b) => (b.hidden = playlist.length < 2));
};

const step = (dir) => {
  index = (index + dir + playlist.length) % playlist.length;
  render();
};

export function openLightbox(items, startIndex = 0) {
  if (!dialog) return;
  playlist = items;
  index = startIndex;
  // Que no suenen dos videos a la vez
  document.querySelectorAll('video').forEach((v) => v !== video && v.pause());
  if (!dialog.open) dialog.showModal();
  document.documentElement.classList.add('is-locked');
  render();
}

export function initLightbox() {
  dialog = document.getElementById('lightbox');
  video = document.getElementById('lightbox-video');
  caption = document.getElementById('lightbox-caption');
  if (!dialog) return;

  const close = () => dialog.close();
  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load(); // corta la descarga
    document.documentElement.classList.remove('is-locked');
  });

  document.getElementById('lightbox-close')?.addEventListener('click', close);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => step(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => step(1));

  // Click en el fondo oscuro cierra
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.classList.contains('lightbox-inner')) close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  // Pasar al siguiente automáticamente al terminar
  video.addEventListener('ended', () => {
    if (playlist.length > 1) step(1);
  });
}
