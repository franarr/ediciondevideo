import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { t } from '../i18n/i18n';

export function initNavMenu(lenis) {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelectorAll('.nav-link-item');

  // ─── Menú hamburguesa (celular / tablet) ───
  const setOpen = (open) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.open'));
    document.documentElement.classList.toggle('is-locked', open);
    open ? lenis?.stop() : lenis?.start();
  };
  toggle?.addEventListener('click', () => setOpen(!header.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('menu-open')) setOpen(false);
  });

  // ─── Scroll suave a las secciones ───
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (header.classList.contains('menu-open')) setOpen(false);
    const offset = -header.offsetHeight + 1;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
  });

  // ─── Fondo del navbar al salir del hero ───
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom top+=80',
    onEnter: () => header.classList.add('nav-scrolled'),
    onLeaveBack: () => header.classList.remove('nav-scrolled'),
  });

  // ─── Link activo según la sección visible ───
  const byId = Object.fromEntries([...links].map((l) => [l.getAttribute('href').slice(1), l]));
  const setActive = (id) => links.forEach((l) => l.classList.toggle('active', l === byId[id]));

  document.querySelectorAll('main section[id]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => self.isActive && setActive(section.id),
    });
  });
}
