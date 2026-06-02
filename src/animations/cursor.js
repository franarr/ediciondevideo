import { gsap } from 'gsap';

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const dot = cursor.querySelector('.cursor-dot');
  const circle = cursor.querySelector('.cursor-circle');

  if (!cursor || !dot || !circle) return;

  // Set initial hidden position
  gsap.set([dot, circle], { xPercent: -50, yPercent: -50, opacity: 0 });

  // GSAP quickTo is optimized for high-performance mouse following
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  
  const xDotTo = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
  const yDotTo = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
  
  const xCircleTo = gsap.quickTo(circle, "x", { duration: 0.35, ease: "power2.out" });
  const yCircleTo = gsap.quickTo(circle, "y", { duration: 0.35, ease: "power2.out" });

  let isInitialized = false;

  window.addEventListener('mousemove', (e) => {
    if (!isInitialized) {
      gsap.set([dot, circle], { opacity: 1 });
      isInitialized = true;
    }

    pos.x = e.clientX;
    pos.y = e.clientY;

    // Follow regular cursor
    xDotTo(pos.x);
    yDotTo(pos.y);

    xCircleTo(pos.x);
    yCircleTo(pos.y);
  });

  // Handle magnetic links and regular buttons
  const interactiveElements = document.querySelectorAll('a, button, .magnetic, .timeline-clip');
  
  interactiveElements.forEach(el => {
    // Regular hovers
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover-link');
    });
    
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover-link');
      // Reset magnetic transform on element exit
      if (el.classList.contains('magnetic')) {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "power2.out" });
      }
    });

    // Magnetic effect
    if (el.classList.contains('magnetic')) {
      el.addEventListener('mousemove', (e) => {
        const bound = el.getBoundingClientRect();
        // Calculate relative coordinates (-0.5 to 0.5)
        const relX = e.clientX - bound.left - (bound.width / 2);
        const relY = e.clientY - bound.top - (bound.height / 2);
        
        // Move element slightly towards cursor (magnetic draw)
        gsap.to(el, {
          x: relX * 0.35,
          y: relY * 0.35,
          duration: 0.2,
          ease: "power2.out"
        });

        // Pull cursor circle strongly towards the item's center
        const targetX = bound.left + bound.width / 2;
        const targetY = bound.top + bound.height / 2;
        
        xCircleTo(targetX + (relX * 0.15));
        yCircleTo(targetY + (relY * 0.15));
      });
    }
  });

  // Handle Video view hover states
  const videoViewport = document.querySelector('.video-viewport-container');
  if (videoViewport) {
    videoViewport.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover-video');
    });
    videoViewport.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover-video');
    });
  }

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    gsap.to([dot, circle], { opacity: 0, duration: 0.3 });
  });

  document.addEventListener('mouseenter', () => {
    gsap.to([dot, circle], { opacity: 1, duration: 0.3 });
  });
}
