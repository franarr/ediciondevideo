import es from './es.json';

const SUPPORTED = ['es', 'en', 'pt'];
let currentLang = 'es';
let translations = es;

/**
 * Dynamically loads the translation JSON file for the specified language code.
 * Spanish is bundled (it's the default and the fallback for missing keys).
 * @param {string} lang - Language code ('es', 'en', 'pt')
 * @returns {Promise<Object>} Object containing translation key-value pairs
 */
export async function loadLanguage(lang) {
  try {
    switch (lang) {
      case 'en': return (await import('./en.json')).default;
      case 'pt': return (await import('./pt.json')).default;
      default: return es;
    }
  } catch (error) {
    console.error(`Failed to load translation file for language '${lang}':`, error);
    return es;
  }
}

/** Translation for a key in the active language, falling back to Spanish. */
export const t = (key) => translations[key] ?? es[key] ?? key;

export const getLang = () => currentLang;

/**
 * Picks the right language from a data field that can be a plain string
 * or an object like { es: '...', en: '...', pt: '...' }.
 */
export const pick = (value) =>
  value && typeof value === 'object' ? value[currentLang] ?? value.es ?? '' : value ?? '';

/**
 * Applies translation strings to elements containing the data-i18n attribute.
 * Highlights that were already drawn stay drawn after the markup is replaced.
 * @param {Object} dict - Object containing key-value translation pairs
 */
export function applyTranslations(dict, root = document) {
  if (!dict) return;
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = dict[key] ?? es[key];
    if (value === undefined || element.innerHTML === value) return;

    const wasDrawn = element.querySelector('[data-hl-drawn]') !== null;
    element.innerHTML = value;
    if (wasDrawn) {
      element.querySelectorAll('.highlight-yellow, .highlight-red').forEach((hl) => {
        hl.style.setProperty('--highlight-width', '100%');
        hl.dataset.hlDrawn = '';
      });
    }
  });
}

/**
 * Updates the active visual state on elements with data-lang attribute.
 * @param {string} lang - Active language code
 */
function updateActiveLanguage(lang) {
  document.querySelectorAll('[data-lang]').forEach((el) => {
    const active = el.getAttribute('data-lang') === lang;
    el.classList.toggle('active', active);
    el.setAttribute('aria-pressed', String(active));
  });
}

async function setLanguage(lang) {
  translations = await loadLanguage(lang);
  currentLang = lang;
  applyTranslations(translations);
  updateActiveLanguage(lang);
  document.documentElement.lang = lang;
  try { localStorage.setItem('language', lang); } catch { /* modo privado */ }
  // Los componentes que dibujan contenido desde JSON se re-renderizan con esto
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

/**
 * Loads the saved language BEFORE the rest of the page initializes,
 * so the scroll animations attach to the final (translated) elements.
 */
export async function initI18n() {
  let saved = 'es';
  try { saved = localStorage.getItem('language') || 'es'; } catch { /* modo privado */ }
  if (!SUPPORTED.includes(saved)) saved = 'es';

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-lang');
      if (target && target !== currentLang) setLanguage(target);
    });
  });

  if (saved !== 'es') {
    translations = await loadLanguage(saved);
    currentLang = saved;
    applyTranslations(translations);
    document.documentElement.lang = saved;
  }
  updateActiveLanguage(currentLang);
}
