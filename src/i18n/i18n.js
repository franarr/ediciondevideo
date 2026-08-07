/**
 * Dynamically loads the translation JSON file for the specified language code.
 * @param {string} lang - Language code ('es', 'en', 'pt')
 * @returns {Promise<Object>} Object containing translation key-value pairs
 */
export async function loadLanguage(lang) {
  try {
    let module;
    switch (lang) {
      case 'en':
        module = await import('./en.json');
        break;
      case 'pt':
        module = await import('./pt.json');
        break;
      case 'es':
      default:
        module = await import('./es.json');
        break;
    }
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load translation file for language '${lang}':`, error);
    const fallback = await import('./es.json');
    return fallback.default || fallback;
  }
}

/**
 * Applies translation strings to elements containing the data-i18n attribute.
 * @param {Object} translations - Object containing key-value translation pairs
 */
export function applyTranslations(translations) {
  if (!translations) return;
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key && translations[key] !== undefined) {
      element.innerHTML = translations[key];
    }
  });
}

/**
 * Updates the active visual state on elements with data-lang attribute.
 * @param {string} currentLang - Active language code
 */
function updateActiveLanguage(currentLang) {
  const langElements = document.querySelectorAll('[data-lang]');
  langElements.forEach((el) => {
    if (el.getAttribute('data-lang') === currentLang) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

/**
 * Initializes the i18n system, loads initial language, attaches click handlers,
 * and highlights active language controls.
 */
export async function initI18n() {
  const savedLang = localStorage.getItem('language') || 'es';

  const setLanguage = async (lang) => {
    const translations = await loadLanguage(lang);
    applyTranslations(translations);
    updateActiveLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const langButtons = document.querySelectorAll('[data-lang]');
  langButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        setLanguage(targetLang);
      }
    });
  });

  await setLanguage(savedLang);
}
