import { gsap } from 'gsap';

export function initNosotrosSlider() {
  const photos = document.querySelectorAll('.nosotros-photo');
  const prevBtn = document.querySelector('.nosotros-prev');
  const nextBtn = document.querySelector('.nosotros-next');
  const labels = document.querySelectorAll('.floating-label');

  if (!photos.length) return;

  let current = 0;
  const total = photos.length;

  const switchTo = (index) => {
    if (index === current) return;

    const currentPhoto = photos[current];
    const newPhoto = photos[index];

    gsap.set(newPhoto, { opacity: 0, scale: 1, zIndex: 2 });
    gsap.set(currentPhoto, { zIndex: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.to(labels, {
      opacity: 0,
      duration: 0.2,
      stagger: 0.02
    }, 0);

    tl.to(currentPhoto, {
      opacity: 0,
      duration: 0.3
    }, 0.05);

    tl.add(() => {
      currentPhoto.classList.remove('active');
      newPhoto.classList.add('active');
      current = index;
    });

    tl.to(newPhoto, {
      opacity: 1,
      duration: 0.4
    }, '>-0.05');

    tl.to(labels, {
      opacity: 1,
      duration: 0.4,
      stagger: { each: 0.04, from: 'random' }
    }, '>-0.05');
  };

  labels.forEach((label) => {
    label.addEventListener('mouseenter', () => {
      gsap.to(label, { scale: 1.08, y: -6, duration: 0.25, ease: 'power2.out' });
    });
    label.addEventListener('mouseleave', () => {
      gsap.to(label, { scale: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    });
  });

  nextBtn?.addEventListener('click', () => {
    switchTo((current + 1) % total);
  });

  prevBtn?.addEventListener('click', () => {
    switchTo((current - 1 + total) % total);
  });

  // Initial GSAP animation for labels (staggered appear)
  gsap.fromTo(labels,
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: { each: 0.06, from: 'random' },
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.nosotros-stage',
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
}
