import { gsap } from 'gsap';
import { isFinePointer, prefersReducedMotion } from '../utils/dom';

const INTERACTIVE = 'a, button, .magnetic, .timeline-clip, .work-card';
const VIDEO_TARGETS = '.video-viewport-container, .work-card, .case-media';

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  // Solo en mouse: en pantallas táctiles el cursor no existe
  if (!cursor || !isFinePointer()) {
    cursor?.remove();
    return;
  }
  document.body.classList.add('has-custom-cursor');

  const dot = cursor.querySelector('.cursor-dot');
  const circle = cursor.querySelector('.cursor-circle');
  gsap.set([dot, circle], { xPercent: -50, yPercent: -50, opacity: 0 });

  // GSAP quickTo is optimized for high-performance mouse following
  const xDotTo = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3.out' });
  const yDotTo = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3.out' });
  const xCircleTo = gsap.quickTo(circle, 'x', { duration: 0.35, ease: 'power2.out' });
  const yCircleTo = gsap.quickTo(circle, 'y', { duration: 0.35, ease: 'power2.out' });

  let visible = false;
  let magnet = null;
  const magnetic = !prefersReducedMotion();

  window.addEventListener('mousemove', (e) => {
    if (!visible) {
      gsap.set([dot, circle], { opacity: 1 });
      visible = true;
    }
    xDotTo(e.clientX);
    yDotTo(e.clientY);

    if (magnet) {
      const bound = magnet.getBoundingClientRect();
      const relX = e.clientX - bound.left - bound.width / 2;
      const relY = e.clientY - bound.top - bound.height / 2;
      gsap.to(magnet, { x: relX * 0.35, y: relY * 0.35, duration: 0.2, ease: 'power2.out' });
      xCircleTo(bound.left + bound.width / 2 + relX * 0.15);
      yCircleTo(bound.top + bound.height / 2 + relY * 0.15);
    } else {
      xCircleTo(e.clientX);
      yCircleTo(e.clientY);
    }
  });

  // Delegación: funciona también con los elementos que se dibujan desde JSON
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(INTERACTIVE);
    document.body.classList.toggle('cursor-hover-link', !!target);
    document.body.classList.toggle('cursor-hover-video', !!e.target.closest(VIDEO_TARGETS));
    const nextMagnet = magnetic ? e.target.closest('.magnetic') : null;
    if (magnet && magnet !== nextMagnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
    magnet = nextMagnet;
  });

  document.addEventListener('mouseleave', () => gsap.to([dot, circle], { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, circle], { opacity: 1, duration: 0.3 }));
}
