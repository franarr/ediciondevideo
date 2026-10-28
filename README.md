# CABAÑA & ARELLANO — Portfolio

Portfolio de **Alejo Cabaña** y **Francisco Arellano**, editores de video y creadores de contenido de Santa Fe, Argentina.

- Online: https://ediciondevideo.vercel.app (se publica solo al hacer push a `main`)
- Stack: Vite + JavaScript, GSAP/ScrollTrigger, Lenis
- Videos e imágenes: Cloudflare R2 (no van en git)

---

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. En local los videos se leen de `public/media/` (que se genera con `npm run media`).

---

## Cómo se organiza el contenido

Todo lo que se muestra sale de archivos JSON en `src/data/`. **No hace falta tocar HTML para agregar trabajos.**

| Archivo | Qué es |
|---|---|
| `projects.json` | Todos los videos: título, cliente, rubro, si va destacado |
| `cases.json` | Casos de éxito con métricas |
| `testimonials.json` | Comentarios de clientes (texto o captura) |
| `covers.json` | Portadas diseñadas |
| `media-manifest.json` | Lo genera `npm run media` (duración, orientación). No editar a mano |

Teléfonos de WhatsApp, mails e Instagram: `src/config.js`.

Las secciones de casos, testimonios y portadas **se ocultan solas** mientras su JSON esté vacío (`[]`).

### Campos de `projects.json`

```jsonc
{
  "id": "voltra",              // = nombre del archivo procesado (lo pone el script)
  "title": "Voltra · AirPods", // lo que se ve en la web
  "client": "Voltra",          // opcional
  "rubro": "productos",        // ver lista abajo
  "featured": true,            // aparece en la "Mesa de trabajo" (timeline)
  "hero": true,                // aparece arriba de todo (máximo 3, verticales)
  "tags": ["Subtítulos dinámicos", "SFX"], // opcional: se muestran en el inspector
  "hidden": true               // opcional: lo oculta sin borrarlo
}
```

El orden del archivo es el orden en la web.

**Rubros disponibles:** `salud`, `finanzas`, `inmobiliaria`, `gastronomia`, `belleza`, `indumentaria`, `mascotas`, `vehicular`, `productos`, `educacion`, `marca-personal`, `motion`, `podcast`.
Para agregar uno nuevo, sumá `"rubro.<clave>"` en `src/i18n/es.json`, `en.json` y `pt.json`.

### Casos de éxito (`cases.json`)

```json
[
  {
    "client": "Buddy Pets",
    "rubro": "mascotas",
    "video": "video3",
    "title": "De 0 a 10K seguidores en 3 meses",
    "results": [
      { "value": "+120K", "label": "vistas en el primer reel" },
      { "value": "x3", "label": "consultas por WhatsApp" }
    ],
    "challenge": "La tienda tenía buen producto pero no publicaba de forma constante.",
    "solution": "Armamos una grilla de 12 reels por mes con ganchos y subtítulos."
  }
]
```

### Testimonios (`testimonials.json`)

Pueden ser texto, una captura (de un DM o comentario), o las dos cosas:

```json
[
  { "name": "Ivana Berón", "role": "Consultora", "quote": "¡Los videos quedaron increíbles!", "source": "WhatsApp" },
  { "name": "Cliente", "image": "testimonials/comentario-1.webp", "source": "Instagram" }
]
```

### Portadas (`covers.json`)

```json
[{ "image": "covers/portada-voltra.webp", "title": "Lanzamiento", "client": "Voltra" }]
```

Cualquier texto puede estar en varios idiomas: `"title": { "es": "Hola", "en": "Hi", "pt": "Olá" }`.

---

## Agregar videos e imágenes nuevos (paso a paso)

1. **Copiá los originales** a `media-src/`:
   - videos → `media-src/videos/` (mp4, mov, mkv, webm; también podcasts horizontales)
   - portadas → `media-src/covers/`
   - capturas de testimonios → `media-src/testimonials/`
2. **Procesá:** `npm run media`
   - Comprime a H.264 720p (se ve en cualquier navegador y celular) con *faststart* para que arranque al instante.
   - Genera la portada de cada video y pasa las imágenes a WebP.
   - Los videos nuevos se agregan solos al final de `projects.json` → completá `title` y `rubro`.
3. **Mirá cómo queda:** `npm run dev`
4. **Subí los archivos a R2:** `npm run upload` (solo sube lo nuevo)
5. **Publicá:** commit + push de los JSON. Vercel actualiza la web.

> Requiere ffmpeg: `winget install Gyan.FFmpeg`

---

## Hosting de videos: Cloudflare R2 (configuración inicial, una sola vez)

R2 es gratis hasta 10 GB y **no cobra por tráfico**, así que no importa cuánta gente vea los videos.

1. Crear cuenta en https://dash.cloudflare.com → **R2** → activar el plan gratuito.
2. **Create bucket** → nombre `portfolio-media`.
3. En el bucket → **Settings → Public access → R2.dev subdomain → Allow**. Copiá la URL (`https://pub-xxxx.r2.dev`).
   *(Más adelante conviene conectar un dominio propio, ej. `media.cabanaarellano.com`.)*
4. **R2 → Manage R2 API Tokens → Create API token** con permiso *Object Read & Write* sobre ese bucket. Guardá Account ID, Access Key ID y Secret.
5. Copiá `.env.example` como `.env` y completalo.
6. `npm run upload` para subir todo lo de `public/media`.
7. En **Vercel → Settings → Environment Variables** agregá `VITE_MEDIA_BASE_URL` con la URL del paso 3, y volvé a desplegar.

> Si falta `VITE_MEDIA_BASE_URL` en Vercel, el build falla a propósito: así queda online la versión anterior en vez de una sin videos.

---

## Estructura

```
index.html, alejocabana/, franciscoarellano/   → solo incluyen la plantilla
src/partials/page.html   → el HTML de las 3 páginas (lo que cambia está en vite.config.js)
src/data/                → contenido editable (JSON)
src/components/          → timeline, grilla de trabajos, lightbox, casos, contacto, menú
src/i18n/                → textos en español, inglés y portugués
src/styles/              → main.css + sections.css
scripts/optimize-media.mjs → compresión de videos e imágenes
scripts/upload-r2.mjs      → subida a Cloudflare R2
media-src/               → originales (no van a git)
public/media/            → procesados (no van a git, se suben a R2)
```
