import { gsap } from 'gsap';
import { prefersReducedMotion } from '../utils/dom';

export function initNosotrosSlider() {
  const team = document.querySelector('.team');
  if (!team) return;

  // En las páginas individuales (/alejocabana, /franciscoarellano) solo se muestra esa persona
  const pagePerson = document.body.dataset.person;
  if (pagePerson) team.querySelectorAll(`.member:not([data-person="${pagePerson}"])`).forEach((el) => el.remove());

  if (prefersReducedMotion()) return;

  const members = team.querySelectorAll('.member');

  // Entrada: aparece la mancha, sube la foto y las etiquetas aparecen de a una
  members.forEach((member, i) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: member, start: 'top 80%' },
      delay: i * 0.15,
      defaults: { ease: 'power3.out' },
    });
    tl.from(member.querySelector('.member-blob'), { opacity: 0, duration: 0.9 })
      .from(member.querySelector('.member-photo'), { y: 60, opacity: 0, duration: 0.9 }, '-=0.6')
      .from(member.querySelector('.member-name'), { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
      .from(member.querySelectorAll('.member-roles li'), { opacity: 0, duration: 0.4, stagger: 0.05 }, '-=0.3')
      .from(member.querySelector('.member-ig'), { opacity: 0, duration: 0.4 }, '-=0.2');

    // El nombre gigante se desliza en sentido contrario al scroll
    gsap.fromTo(
      member.querySelector('.member-bigname'),
      { xPercent: i % 2 ? 8 : -8 },
      {
        xPercent: i % 2 ? -8 : 8,
        ease: 'none',
        scrollTrigger: { trigger: member, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  gsap.from(team.querySelector('.team-amp'), {
    scale: 0.6,
    opacity: 0,
    rotate: -20,
    duration: 0.8,
    ease: 'back.out(1.7)',
    scrollTrigger: { trigger: team, start: 'top 70%' },
  });
}
