import { defineConfig, loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Las 3 páginas comparten la misma plantilla (src/partials/page.html).
// Acá solo se define lo que cambia entre una y otra.
const PAGES = {
  '/index.html': {
    path: '/',
    person: '',
    title: 'Cabaña & Arellano — Editores de Video & Manejo de Redes',
    description: 'Francisco Arellano y Alejo Cabaña. Editores de video y creadores de contenido de Santa Fe, Argentina. Reels, TikToks, podcasts, motion graphics estilo VOX y UGC.',
    heroTitleKey: 'hero.title1',
    heroTitle: 'EDITORES',
    heroSubtitle: 'Francisco Arellano & Alejo Cabaña',
    navNosotrosKey: 'nav.nosotros',
    navNosotros: 'Nosotros',
  },
  '/alejocabana/index.html': {
    path: '/alejocabana/',
    person: 'alejo',
    title: 'Alejo Cabaña — Editor de Video & Manejo de Redes',
    description: 'Alejo Cabaña, editor de video y creador de contenido de Santa Fe, Argentina. Reels, TikToks, UGC y motion graphics.',
    heroTitleKey: 'hero.title1.single',
    heroTitle: 'EDITOR',
    heroSubtitle: 'Alejo Cabaña',
    navNosotrosKey: 'nav.sobremi',
    navNosotros: 'Sobre mí',
  },
  '/franciscoarellano/index.html': {
    path: '/franciscoarellano/',
    person: 'francisco',
    title: 'Francisco Arellano — Editor de Video & Manejo de Redes',
    description: 'Francisco Arellano, editor de video y creador de contenido de Santa Fe, Argentina. Reels, motion graphics estilo VOX, mapas y datos.',
    heroTitleKey: 'hero.title1.single',
    heroTitle: 'EDITOR',
    heroSubtitle: 'Francisco Arellano',
    navNosotrosKey: 'nav.sobremi',
    navNosotros: 'Sobre mí',
  },
};

const htmlTemplate = () => ({
  name: 'html-template',
  transformIndexHtml: {
    order: 'pre',
    handler(html, ctx) {
      const vars = PAGES[ctx.path] ?? PAGES['/index.html'];
      const include = (src) =>
        src.replace(/<!--\s*@include\s+(\S+)\s*-->/g, (_, file) =>
          include(readFileSync(resolve(__dirname, file), 'utf8'))
        );
      return include(html).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '');
    },
  },
  // Recargar el navegador al editar la plantilla
  handleHotUpdate({ file, server }) {
    if (file.includes('/src/partials/')) server.ws.send({ type: 'full-reload' });
  },
});

export default defineConfig(({ command, mode }) => {
  // En Vercel los videos NO están en el repo: sin la URL de R2 la web saldría sin videos.
  // Fallar el build deja online la versión anterior en lugar de publicar una rota.
  if (command === 'build' && process.env.VERCEL && !loadEnv(mode, process.cwd()).VITE_MEDIA_BASE_URL) {
    throw new Error('Falta VITE_MEDIA_BASE_URL (URL pública de R2) en Vercel → Settings → Environment Variables.');
  }
  return config;
});

const config = {
  plugins: [htmlTemplate()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        alejo: 'alejocabana/index.html',
        francisco: 'franciscoarellano/index.html',
      },
    },
  },
};
