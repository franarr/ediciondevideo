# CABAÑA & ARELLANO — Cinematic Portfolio

Un portfolio minimalista, cinemático y dinámico diseñado para **Alejo Cabaña** & **Francisco Arellano** (Editores de Video y Creadores de Contenido de Santa Fe, Argentina).

Este sitio web está construido con un enfoque de alto rendimiento utilizando **Vite + Vanilla Javascript** y animaciones premium con **GSAP (GreenSock Animation Platform)** y **ScrollTrigger**.

---

## 🛠️ Tecnologías y Estructura

*   **Vite**: Entorno de desarrollo ultrarrápido y empaquetador de producción.
*   **GSAP + ScrollTrigger**: Control milimétrico de las animaciones al hacer scroll y kinetic typography.
*   **Lenis Smooth Scroll**: Desplazamiento suave de lujo integrado con GSAP.
*   **Vanilla CSS3 (main.css)**: Diseño minimalista en tonos obsidian y champagne gold con glassmorphic layouts.

---

## 🎥 Cómo cargar tus propios Videos (¡Muy Importante!)

Para garantizar un rendimiento espectacular sin depender de iframes lentos o bloqueos de cookies de Instagram/TikTok, el portfolio utiliza reproducción nativa de video HTML5.

### Paso 1: Colocar los archivos
Crea una carpeta llamada `videos` dentro de la carpeta `public/assets/` (si no existe, puedes crearla) y coloca tus archivos de video en formato `.mp4` con los siguientes nombres:
1.  `showreel.mp4` (Tu Reel principal o video de presentación)
2.  `reels_ugc.mp4` (Videos verticales UGC, Reels, o TikToks)
3.  `vox_style.mp4` (Ediciones con motion graphics estilo explicativo Vox)
4.  `sound_design.mp4` (B-rolls estéticos, color grading o clips con alto enfoque en SFX)

### Paso 2: Activar la carga local
Abre el archivo [videoTimeline.js](file:///c:/Users/fr/Desktop/Portfolio/src/components/videoTimeline.js) y cambia la siguiente constante de `false` a `true`:

```javascript
// Cambiar a true para usar tus propios archivos locales
const USE_LOCAL_VIDEOS = true;
```

*Nota: Actualmente el sitio carga placeholders de video cinematográficos de alta velocidad desde un CDN de Vimeo para que el sitio funcione perfectamente en tu primer inicio de prueba.*

---

## 🚀 Cómo Ejecutar en Local

1.  Asegúrate de tener instalado [Node.js](https://nodejs.org/).
2.  Abre la terminal en la carpeta del proyecto (`c:\Users\fr\Desktop\Portfolio`).
3.  Instala las dependencias (ya lo hemos hecho por ti en el sistema, pero puedes correrlo si es necesario):
    ```bash
    npm install
    ```
4.  Inicia el servidor de desarrollo local:
    ```bash
    npm run dev
    ```
5.  Vite abrirá automáticamente una ventana en tu navegador por defecto en la dirección `http://localhost:3000`.

---

## 📦 Construir para Producción (Deploy)

Cuando estés listo para subir tu portfolio a un hosting (Netlify, Vercel, Hostinger, GitHub Pages, etc.), corre el siguiente comando en la terminal:

```bash
npm run build
```

Esto generará una carpeta `dist` super optimizada con todo el código compilado, listo para subir a cualquier servidor web.
