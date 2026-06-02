import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initCustomCursor } from './animations/cursor';
import { initVideoTimeline } from './components/videoTimeline';
import { initScrollAnimations } from './animations/timeline';
import { initHeroSlider } from './components/heroSlider';
import { initNosotrosSlider } from './components/nosotrosSlider';

// Register ScrollTrigger to sync with Lenis
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // premium decelerate
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    infinite: false,
  });

  // Keep ScrollTrigger synchronized with Lenis scroll ticks
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // 2. Initialize Components & Animations
  initCustomCursor();
  initHeroSlider(); // Initialize the Hero Video Carousel
  initNosotrosSlider(); // Initialize the Nosotros Photo Switcher
  initVideoTimeline();
  initScrollAnimations();

  // 3. Dynamic Active Navbar Links based on current section
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link-item');

  sections.forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 40%",
      end: "bottom 40%",
      onToggle: (self) => {
        if (self.isActive) {
          const id = section.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      }
    });
  });

  // Make navigation clicks smooth via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        lenis.scrollTo(targetElement, {
          offset: -80, // Offset for fixed navbar height
          duration: 1.5,
          immediate: false
        });
      }
    });
  });
});
