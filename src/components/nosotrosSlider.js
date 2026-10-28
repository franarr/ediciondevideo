import { gsap } from 'gsap';

export function initNosotrosSlider() {
  const stage = document.querySelector('.nosotros-stage');
  if (!stage) return;

  // En las páginas individuales (/alejocabana, /franciscoarellano) solo se muestra esa persona
  const pagePerson = document.body.dataset.person;
  if (pagePerson) {
    stage.querySelectorAll(`[data-person]:not([data-person="${pagePerson}"])`).forEach((el) => el.remove());
    stage.querySelector('.nosotros-nav')?.remove();
  }

  const photos = [...stage.querySelectorAll('.nosotros-photo')];
  const labelGroups = [...stage.querySelectorAll('.labels-group')];
  if (!photos.length) return;

  let current = 0;
  photos[0].classList.add('active');
  labelGroups[0]?.classList.add('active');

  const switchTo = (index) => {
    if (index === current) return;
    const [oldPhoto, newPhoto] = [photos[current], photos[index]];
    const [oldGroup, newGroup] = [labelGroups[current], labelGroups[index]];

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(oldGroup.querySelectorAll('.floating-label'), { opacity: 0, duration: 0.2, stagger: 0.02 }, 0)
      .to(oldPhoto, { opacity: 0, duration: 0.3 }, 0.05)
      .add(() => {
        oldPhoto.classList.remove('active');
        oldGroup.classList.remove('active');
        newPhoto.classList.add('active');
        newGroup.classList.add('active');
        current = index;
      })
      .fromTo(newPhoto, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        newGroup.querySelectorAll('.floating-label'),
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: { each: 0.04, from: 'random' } },
        '<'
      );
  };

  stage.querySelector('.nosotros-next')?.addEventListener('click', () => switchTo((current + 1) % photos.length));
  stage.querySelector('.nosotros-prev')?.addEventListener('click', () =>
    switchTo((current - 1 + photos.length) % photos.length)
  );

  gsap.fromTo(
    labelGroups[0].querySelectorAll('.floating-label'),
    { opacity: 0, y: 10 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: { each: 0.06, from: 'random' },
      ease: 'power2.out',
      scrollTrigger: { trigger: stage, start: 'top 80%' },
    }
  );
}
