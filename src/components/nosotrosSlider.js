import { gsap } from 'gsap';

export function initNosotrosSlider() {
  const photos = document.querySelectorAll('.nosotros-photo');
  const prevBtn = document.querySelector('.nosotros-prev');
  const nextBtn = document.querySelector('.nosotros-next');
  const labelGroups = document.querySelectorAll('.labels-group');

  if (!photos.length || !labelGroups.length) return;

  let current = 0;
  const total = photos.length;

  const switchTo = (index) => {
    if (index === current) return;

    const currentPhoto = photos[current];
    const newPhoto = photos[index];
    const currentGroup = labelGroups[current];
    const newGroup = labelGroups[index];

    gsap.set(newPhoto, { opacity: 0, scale: 1, zIndex: 2 });
    gsap.set(currentPhoto, { zIndex: 1 });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Fade out old labels
    if (currentGroup) {
      const oldLabels = currentGroup.querySelectorAll('.floating-label');
      tl.to(oldLabels, {
        opacity: 0,
        duration: 0.2,
        stagger: 0.02
      }, 0);
    }

    tl.to(currentPhoto, {
      opacity: 0,
      duration: 0.3
    }, 0.05);

    tl.add(() => {
      currentPhoto.classList.remove('active');
      newPhoto.classList.add('active');
      
      if (currentGroup) currentGroup.classList.remove('active');
      if (newGroup) newGroup.classList.add('active');
      
      current = index;
    });

    tl.to(newPhoto, {
      opacity: 1,
      duration: 0.4
    }, '>-0.05');

    // Fade in new labels
    if (newGroup) {
      const newLabels = newGroup.querySelectorAll('.floating-label');
      gsap.set(newLabels, { opacity: 0 }); // ensure they start hidden
      tl.to(newLabels, {
        opacity: 1,
        duration: 0.4,
        stagger: { each: 0.04, from: 'random' }
      }, '>-0.05');
    }
  };

  nextBtn?.addEventListener('click', () => {
    switchTo((current + 1) % total);
  });

  prevBtn?.addEventListener('click', () => {
    switchTo((current - 1 + total) % total);
  });

  // Initial animation
  const firstLabels = labelGroups[0].querySelectorAll('.floating-label');
  gsap.fromTo(firstLabels,
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

// Fullscreen button logic for the timeline editor video
document.addEventListener('DOMContentLoaded', () => {
  const fullscreenBtn = document.getElementById('video-fullscreen-btn');
  const video = document.getElementById('editor-video');

  fullscreenBtn?.addEventListener('click', () => {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) { /* Safari */
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { /* IE11 */
      video.msRequestFullscreen();
    }
  });
});
