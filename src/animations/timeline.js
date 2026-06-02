import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  
  // 1. Hero Entrance Animation
  const tlHero = gsap.timeline({ delay: 0.2 });
  
  gsap.set('.navbar-container', { y: -20, opacity: 0 });
  gsap.set('.hero-subtitle', { y: 20, opacity: 0 });
  gsap.set('.hero-desc', { y: 20, opacity: 0 });
  gsap.set('.hero-buttons', { y: 20, opacity: 0 });
  gsap.set('.hero-video', { scale: 0.95, opacity: 0, y: 30 });
  gsap.set('.location-tag', { opacity: 0, x: -10 });

  tlHero
    .to('.location-tag', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out'
    })
    .to('.title-word', {
      y: '0%',
      duration: 1,
      stagger: 0.1,
      ease: 'power4.out'
    }, '-=0.3')
    .to('.hero-subtitle', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.5')
    .to('.hero-desc', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.hero-buttons', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.4')
    .to('.hero-video', {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.7')
    .to('.navbar-container', {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.6');


  // 2. Navbar background on scroll
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "bottom 80%",
    onLeave: () => {
      document.getElementById('site-header')?.classList.add('nav-scrolled');
    },
    onEnterBack: () => {
      document.getElementById('site-header')?.classList.remove('nav-scrolled');
    }
  });


  // 3. Text Highlight Drawing Animations on Scroll
  const highlights = document.querySelectorAll('.highlight-yellow, .highlight-red');
  highlights.forEach(hl => {
    gsap.to(hl, {
      '--highlight-width': '100%',
      duration: 0.9,
      delay: 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: hl,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  });


  // 4. Parallax Effects
  gsap.utils.toArray('.film-card').forEach(frame => {
    gsap.to(frame, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: frame,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });


  // 5. Section Reveal Animations (non-hero sections)
  document.querySelectorAll('section').forEach(section => {
    if (section.id === 'hero') return;

    const title = section.querySelector('.section-title');
    const tag = section.querySelector('.section-tag');
    const desc = section.querySelector('.section-desc, .contact-desc');
    
    if (tag) {
      gsap.from(tag, {
        scrollTrigger: {
          trigger: tag,
          start: "top 90%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        x: -15,
        duration: 0.6,
        ease: "power2.out"
      });
    }

    if (title) {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });
    }

    if (desc) {
      gsap.from(desc, {
        scrollTrigger: {
          trigger: desc,
          start: "top 88%",
          toggleActions: "play none none none"
        },
        y: 15,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out"
      });
    }
  });


  // 6. Service Cards Staggered Reveal with lift
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length > 0) {
    gsap.from(serviceCards, {
      scrollTrigger: {
        trigger: '#servicios',
        start: "top 75%",
        toggleActions: "play none none none"
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out"
    });
  }

  // Service cards parallax
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.to(card, {
      yPercent: -4 * (i % 2 === 0 ? 0.8 : 1.3),
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });


  // 7. Editor Desktop Reveal
  const editorDesktop = document.querySelector('.editor-desktop');
  if (editorDesktop) {
    gsap.from(editorDesktop, {
      scrollTrigger: {
        trigger: editorDesktop,
        start: "top 82%",
        toggleActions: "play none none none"
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  }


  // 8. Contact Section Elements Reveal
  const contactBtns = document.querySelector('.contact-buttons');
  const contactEmails = document.querySelector('.contact-emails');
  
  if (contactBtns) {
    gsap.from(contactBtns, {
      scrollTrigger: {
        trigger: '#contacto',
        start: "top 75%",
        toggleActions: "play none none none"
      },
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  }

  if (contactEmails) {
    gsap.from(contactEmails, {
      scrollTrigger: {
        trigger: '#contacto',
        start: "top 70%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    });
  }


  // 9. Pricing Panel Reveal
  const pricingPanel = document.querySelector('.pricing-panel');
  if (pricingPanel) {
    gsap.from(pricingPanel, {
      scrollTrigger: {
        trigger: pricingPanel,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  }
}
