import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/dom';

gsap.registerPlugin(ScrollTrigger);

const HIGHLIGHTS = '.highlight-yellow, .highlight-red';

/**
 * Draws the marker highlights. The trigger is the heading (which never changes),
 * not the highlight span, because changing language replaces the span.
 */
function initHighlights(reduced) {
  const hosts = new Set([...document.querySelectorAll(HIGHLIGHTS)].map((hl) => hl.closest('h1, h2, h3') ?? hl));
  hosts.forEach((host) => {
    const draw = () => {
      host.querySelectorAll(HIGHLIGHTS).forEach((hl) => {
        hl.dataset.hlDrawn = '';
        if (reduced) hl.style.setProperty('--highlight-width', '100%');
        else gsap.to(hl, { '--highlight-width': '100%', duration: 0.9, delay: 0.1, ease: 'power2.out' });
      });
    };
    ScrollTrigger.create({ trigger: host, start: 'top 85%', once: true, onEnter: draw });
  });
}

function reveal(targets, vars, trigger, start = 'top 85%') {
  if (!targets || (targets.length === 0)) return;
  gsap.from(targets, { ...vars, scrollTrigger: { trigger: trigger ?? targets, start } });
}

export function initScrollAnimations() {
  const reduced = prefersReducedMotion();
  initHighlights(reduced);

  if (reduced) {
    gsap.set('.title-word', { y: '0%' });
    return;
  }

  // 1. Hero entrance
  gsap.timeline({ delay: 0.15, defaults: { ease: 'power2.out', duration: 0.6 } })
    .from('.navbar-container', { y: -20, opacity: 0, duration: 0.5, clearProps: 'transform' })
    .from('.location-tag', { opacity: 0, x: -10, duration: 0.5 }, 0)
    .to('.title-word', { y: '0%', duration: 1, stagger: 0.1, ease: 'power4.out' }, 0.1)
    .from('.hero-subtitle', { y: 20, opacity: 0 }, '-=0.6')
    .from('.hero-desc', { y: 20, opacity: 0 }, '-=0.45')
    .from('.hero-buttons', { y: 20, opacity: 0 }, '-=0.45')
    .from('.hero-video-item', { y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.4);

  // 2. Section headers
  document.querySelectorAll('main section:not(#hero)').forEach((section) => {
    reveal(section.querySelector('.section-tag'), { opacity: 0, x: -15, duration: 0.6 }, null, 'top 90%');
    reveal(section.querySelector('.section-title'), { y: 25, opacity: 0, duration: 0.8, ease: 'power3.out' });
    reveal(section.querySelector('.section-desc, .contact-desc'), { y: 15, opacity: 0, duration: 0.7 }, null, 'top 88%');
  });

  // 3. Blocks
  reveal(document.querySelectorAll('.service-card'), { y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '#servicios', 'top 75%');
  reveal(document.querySelector('.editor-desktop'), { y: 40, opacity: 0, duration: 1, ease: 'power3.out' }, null, 'top 82%');
  reveal(document.querySelector('.pricing-panel'), { y: 20, opacity: 0, duration: 0.7 });
  reveal(document.querySelectorAll('.contact-buttons, .contact-emails'), { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, '#contacto', 'top 75%');
  reveal(document.querySelectorAll('.case-card'), { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 }, '#casos', 'top 75%');

  // 4. Subtle parallax on the hero cards
  gsap.utils.toArray('.film-card').forEach((frame) => {
    gsap.to(frame, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}
