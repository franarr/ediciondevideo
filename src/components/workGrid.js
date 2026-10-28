import { projects, rubros, formatDuration } from '../data';
import { t } from '../i18n/i18n';
import { escapeHtml, isFinePointer } from '../utils/dom';
import { openLightbox } from './lightbox';

const PAGE_SIZE = 12;

export function initWorkGrid() {
  const filtersEl = document.getElementById('work-filters');
  const grid = document.getElementById('work-grid');
  const moreBtn = document.getElementById('work-more');
  if (!grid || !filtersEl) return;

  let activeRubro = 'all';
  let visibleCount = PAGE_SIZE;

  const filtered = () =>
    activeRubro === 'all' ? projects : projects.filter((p) => p.rubro === activeRubro);

  const renderFilters = () => {
    const counts = Object.fromEntries(rubros.map((r) => [r, projects.filter((p) => p.rubro === r).length]));
    const chips = [['all', projects.length], ...rubros.map((r) => [r, counts[r]])];
    filtersEl.innerHTML = chips
      .map(
        ([key, n]) => `
        <button class="filter-chip${key === activeRubro ? ' active' : ''}" role="tab"
                aria-selected="${key === activeRubro}" data-rubro="${key}">
          ${escapeHtml(t(`rubro.${key}`))}<span class="chip-count">${n}</span>
        </button>`
      )
      .join('');
  };

  const card = (p, i) => `
    <button class="work-card ${p.orientation === 'horizontal' ? 'is-horizontal' : ''}" data-index="${i}"
            aria-label="${escapeHtml(`${t('trabajos.play')}: ${p.title}`)}">
      <span class="work-media">
        <img src="${p.poster}" alt="" loading="lazy" decoding="async">
        <span class="work-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
        </span>
        <span class="work-duration">${formatDuration(p.duration)}</span>
      </span>
      <span class="work-info">
        <span class="work-title">${escapeHtml(p.title)}</span>
        <span class="work-meta">${escapeHtml([p.client, t(`rubro.${p.rubro}`)].filter(Boolean).join(' · '))}</span>
      </span>
    </button>`;

  const renderGrid = () => {
    const list = filtered();
    grid.innerHTML = list.slice(0, visibleCount).map(card).join('');
    moreBtn.hidden = visibleCount >= list.length;
  };

  filtersEl.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-rubro]');
    if (!chip || chip.dataset.rubro === activeRubro) return;
    activeRubro = chip.dataset.rubro;
    visibleCount = PAGE_SIZE;
    renderFilters();
    renderGrid();
  });

  moreBtn?.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderGrid();
  });

  grid.addEventListener('click', (e) => {
    const cardEl = e.target.closest('.work-card');
    if (cardEl) openLightbox(filtered(), Number(cardEl.dataset.index));
  });

  // Vista previa muda al pasar el mouse (solo escritorio)
  if (isFinePointer()) {
    grid.addEventListener('mouseover', (e) => {
      const cardEl = e.target.closest('.work-card');
      if (!cardEl || cardEl.querySelector('video')) return;
      const p = filtered()[Number(cardEl.dataset.index)];
      const preview = document.createElement('video');
      Object.assign(preview, { src: p.src, muted: true, loop: true, playsInline: true, preload: 'auto' });
      preview.className = 'work-preview';
      preview.addEventListener('playing', () => preview.classList.add('is-ready'), { once: true });
      cardEl.querySelector('.work-media').append(preview);
      preview.play().catch(() => {});
    });
    grid.addEventListener('mouseout', (e) => {
      const cardEl = e.target.closest('.work-card');
      if (!cardEl || cardEl.contains(e.relatedTarget)) return;
      const preview = cardEl.querySelector('video');
      if (preview) {
        preview.pause();
        preview.removeAttribute('src');
        preview.load();
        preview.remove();
      }
    });
  }

  document.addEventListener('languagechange', () => {
    renderFilters();
    renderGrid();
  });

  renderFilters();
  renderGrid();
}
