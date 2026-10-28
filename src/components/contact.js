import { PEOPLE } from '../config';
import { t } from '../i18n/i18n';
import { escapeHtml } from '../utils/dom';

const waLink = (number) => `https://wa.me/${number}`;

export function initContact() {
  const pagePerson = document.body.dataset.person;

  // En las páginas individuales, primero el WhatsApp de esa persona
  if (pagePerson) {
    const own = document.querySelector(`[data-person-link="${pagePerson}"]`);
    own?.parentElement.prepend(own);
  }

  // ─── Botón flotante de WhatsApp ───
  const float = document.getElementById('wa-float');
  const button = document.getElementById('wa-button');
  const menu = document.getElementById('wa-menu');
  const targets = Object.entries(PEOPLE).filter(([key, p]) => p.whatsapp && (!pagePerson || key === pagePerson));
  if (!float || !targets.length) return;
  float.hidden = false;

  const renderMenu = () => {
    menu.innerHTML = targets
      .map(([, p]) => `<a href="${waLink(p.whatsapp)}" target="_blank" rel="noopener">${escapeHtml(t('wa.write'))} ${escapeHtml(p.name.split(' ')[0])}</a>`)
      .join('');
  };
  renderMenu();
  document.addEventListener('languagechange', renderMenu);

  button.addEventListener('click', () => {
    if (targets.length === 1) {
      window.open(waLink(targets[0][1].whatsapp), '_blank', 'noopener');
      return;
    }
    const open = menu.hidden;
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!float.contains(e.target)) {
      menu.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }
  });
}
