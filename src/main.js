import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initI18n } from './i18n/i18n';
import { initCustomCursor } from './animations/cursor';
import { initScrollAnimations } from './animations/timeline';
import { initShowcase } from './components/showcase';
import { initVideoTimeline } from './components/videoTimeline';
import { initWorkGrid } from './components/workGrid';
import { initLightbox } from './components/lightbox';
import { initNosotrosSlider } from './components/nosotrosSlider';
import { initNavMenu } from './components/navMenu';
import { initContact } from './components/contact';
import { prefersReducedMotion } from './utils/dom';

gsap.registerPlugin(ScrollTrigger);

async function init() {
  // 1. Idioma primero: así las animaciones se enganchan a los textos finales
  await initI18n();

  // 2. Smooth scroll (desactivado si el sistema pide menos movimiento)
  let lenis = null;
  if (!prefersReducedMotion()) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium decelerate
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // 3. Contenido que se dibuja desde src/data
  initLightbox();
  initShowcase();
  initWorkGrid();
  initVideoTimeline();
  initNosotrosSlider();
  initContact();

  // 4. Interacción y animaciones (después de dibujar, para medir bien)
  initNavMenu(lenis);
  initCustomCursor();
  initScrollAnimations();

  // Recalcular posiciones cuando terminan de cargar fuentes e imágenes
  // (si no, el link activo del menú queda desfasado)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
  let refreshTimer;
  new ResizeObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  }).observe(document.getElementById('main'));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
