export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/**
 * Plays muted autoplay videos only while they're on screen
 * (saves battery and bandwidth on phones).
 */
const visibilityObserver =
  'IntersectionObserver' in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              if (target.preload === 'none') target.preload = 'auto';
              target.play().catch(() => {});
            } else {
              target.pause();
            }
          });
        },
        { threshold: 0.25 }
      )
    : null;

export function autoplayWhenVisible(video) {
  video.muted = true;
  video.playsInline = true;
  if (visibilityObserver) visibilityObserver.observe(video);
  else video.play().catch(() => {});
}
