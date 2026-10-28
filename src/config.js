// ─── Datos de contacto y configuración general ───
// Todo lo que cambia seguido (teléfonos, links, dominio) vive acá.

export const SITE_URL = 'https://ediciondevideo.vercel.app';

// Dónde están los videos y portadas (public/media, se publica junto con la web).
// Si algún día se mudan a otro hosting, alcanza con definir VITE_MEDIA_BASE_URL.
export const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL || '/media').replace(/\/$/, '');

export const PEOPLE = {
  alejo: {
    name: 'Alejo Cabaña',
    email: 'alejocabana29@gmail.com',
    instagram: 'https://www.instagram.com/alejo.caba/',
    // Formato internacional sin "+" ni espacios: 549 + característica + número
    // (si lo cambiás acá, cambialo también en los botones de src/partials/page.html)
    whatsapp: '5493425095464',
  },
  francisco: {
    name: 'Francisco Arellano',
    email: 'frannare17@gmail.com',
    instagram: 'https://www.instagram.com/frann_are/',
    whatsapp: '5493424793033',
  },
};

export const mediaUrl = (path) => `${MEDIA_BASE}/${path}`;
export const videoUrl = (id) => mediaUrl(`videos/${id}.mp4`);
export const posterUrl = (id) => mediaUrl(`posters/${id}.webp`);
