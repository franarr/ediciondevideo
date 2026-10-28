// Secciones que se dibujan desde src/data/*.json:
// videos del hero, cinta de rubros, casos de éxito, testimonios y portadas.
// Si un JSON está vacío, su sección (y su link del menú) quedan ocultos.

import { heroProjects, projectById, rubros, cases, testimonials, reviewHighlights, covers } from '../data';
import { mediaUrl } from '../config';
import { t, pick } from '../i18n/i18n';
import { autoplayWhenVisible, escapeHtml } from '../utils/dom';
import { openLightbox } from './lightbox';

const imageUrl = (path) => (/^https?:\/\//.test(path) ? path : mediaUrl(path));

function renderHero() {
  const container = document.getElementById('hero-videos');
  if (!container) return;
  container.innerHTML = heroProjects()
    .map(
      (p) => `
      <div class="hero-video-item">
        <div class="film-card">
          <video src="${p.src}" poster="${p.poster}" muted loop playsinline preload="none" aria-label="${escapeHtml(p.title)}"></video>
        </div>
      </div>`
    )
    .join('');
  container.querySelectorAll('video').forEach(autoplayWhenVisible);
}

function renderMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const items = rubros
    .filter((r) => r !== 'otros')
    .map((r) => `<span>${escapeHtml(t(`rubro.${r}`))}</span><span class="sep">///</span>`)
    .join('');
  track.innerHTML = `<div class="marquee-content">${items}</div><div class="marquee-content">${items}</div>`;
}

function renderCases() {
  const section = document.getElementById('casos');
  const list = document.getElementById('cases-list');
  if (!section || !list) return;
  section.hidden = !cases.length;
  document.querySelectorAll('[data-nav-optional="casos"]').forEach((li) => (li.hidden = !cases.length));
  if (!cases.length) return;

  list.innerHTML = cases
    .map((c, i) => {
      const project = c.video ? projectById(c.video) : null;
      const results = (c.results || [])
        .map((r) => `<li><strong>${escapeHtml(pick(r.value))}</strong><span>${escapeHtml(pick(r.label))}</span></li>`)
        .join('');
      return `
      <article class="case-card">
        ${
          project
            ? `<button class="case-media" data-case="${i}" aria-label="${escapeHtml(t('casos.watch'))}">
                 <img src="${project.poster}" alt="" loading="lazy" decoding="async">
                 <span class="work-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg></span>
               </button>`
            : ''
        }
        <div class="case-body">
          <span class="case-client">${escapeHtml([c.client, c.rubro && t(`rubro.${c.rubro}`)].filter(Boolean).join(' · '))}</span>
          <h3 class="case-title">${escapeHtml(pick(c.title))}</h3>
          ${results ? `<ul class="case-results">${results}</ul>` : ''}
          ${c.challenge ? `<h4>${t('casos.challenge')}</h4><p>${escapeHtml(pick(c.challenge))}</p>` : ''}
          ${c.solution ? `<h4>${t('casos.solution')}</h4><p>${escapeHtml(pick(c.solution))}</p>` : ''}
        </div>
      </article>`;
    })
    .join('');

  list.querySelectorAll('[data-case]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const project = projectById(cases[Number(btn.dataset.case)].video);
      if (project) openLightbox([project]);
    })
  );
}

function renderTestimonials() {
  const section = document.getElementById('testimonios');
  const grid = document.getElementById('testimonials-grid');
  const highlights = document.getElementById('review-highlights');
  if (!section || !grid) return;
  section.hidden = !testimonials.length && !reviewHighlights.length;
  if (section.hidden) return;

  // Frases cortas que más se repiten en las reseñas
  highlights.innerHTML = reviewHighlights.map((phrase) => `<li>“${escapeHtml(pick(phrase))}”</li>`).join('');

  const card = (item, i, copy) => {
    const identity = item.logo
      ? `<img class="testimonial-logo" src="${imageUrl(item.logo)}" alt="${escapeHtml(item.name)}" loading="lazy">`
      : item.avatar
        ? `<img class="testimonial-avatar" src="${imageUrl(item.avatar)}" alt="" loading="lazy">`
        : `<span class="testimonial-avatar is-initial" aria-hidden="true">${escapeHtml((item.name || '?').charAt(0))}</span>`;
    return `
      <figure class="testimonial"${copy ? ' aria-hidden="true"' : ''}>
        ${item.quote ? `<blockquote>“${escapeHtml(pick(item.quote))}”</blockquote>` : ''}
        ${item.image ? `<img class="testimonial-shot" src="${imageUrl(item.image)}" alt="" loading="lazy" decoding="async">` : ''}
        <figcaption>
          ${identity}
          <span><strong>${escapeHtml(item.name || '')}</strong>${item.role ? `<small>${escapeHtml(pick(item.role))}</small>` : ''}</span>
          ${item.source ? `<em class="testimonial-source">${escapeHtml(item.source)}</em>` : ''}
        </figcaption>
        ${item.video && projectById(item.video) ? `<button class="testimonial-video" data-testimonial="${i}"${copy ? ' tabindex="-1"' : ''}>▶ ${escapeHtml(t('testimonios.watch'))}</button>` : ''}
      </figure>`;
  };

  // Cintas que se mueven solas: con muchos testimonios, dos filas en sentidos opuestos.
  // Cada fila se repite dos veces para que el loop no tenga saltos.
  const indexed = testimonials.map((item, i) => [item, i]);
  const rows = indexed.length >= 6
    ? [indexed.filter((_, k) => k % 2 === 0), indexed.filter((_, k) => k % 2 === 1)]
    : [indexed];
  grid.innerHTML = rows
    .map((row, r) => {
      const cards = (copy) => row.map(([item, i]) => card(item, i, copy)).join('');
      return `
      <div class="testimonials-row${r % 2 ? ' is-reverse' : ''}" style="--duration:${row.length * 7}s">
        <div class="testimonials-track">${cards(false)}${cards(true)}</div>
      </div>`;
    })
    .join('');
}

function renderCovers() {
  const section = document.getElementById('portadas');
  const grid = document.getElementById('covers-grid');
  if (!section || !grid) return;
  section.hidden = !covers.length;
  if (!covers.length) return;

  grid.innerHTML = covers
    .map(
      (c) => `
      <figure class="cover-item">
        <img src="${imageUrl(c.image)}" alt="${escapeHtml(pick(c.title) || c.client || '')}" loading="lazy" decoding="async">
        ${c.title || c.client ? `<figcaption>${escapeHtml([pick(c.title), c.client].filter(Boolean).join(' · '))}</figcaption>` : ''}
      </figure>`
    )
    .join('');
}

export function initShowcase() {
  // Un solo listener: los testimonios se re-dibujan al cambiar de idioma
  document.getElementById('testimonials-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-testimonial]');
    if (btn) openLightbox([projectById(testimonials[Number(btn.dataset.testimonial)].video)]);
  });

  renderHero();
  renderMarquee();
  renderCases();
  renderTestimonials();
  renderCovers();

  document.addEventListener('languagechange', () => {
    renderMarquee();
    renderCases();
    renderTestimonials();
    renderCovers();
  });
}
