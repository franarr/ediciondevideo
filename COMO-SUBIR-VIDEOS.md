# Cómo subir videos al portfolio

## Día a día (2 minutos)

1. Doble click en **`Subir videos.cmd`** (en la carpeta del proyecto).
2. Se abre la carpeta `media-src\videos`: copiá ahí los videos nuevos (reels, podcasts, lo que sea).
   - Portadas diseñadas → `media-src\covers`
   - Capturas de comentarios de clientes → `media-src\testimonials`
3. Volvé a la ventana negra y apretá cualquier tecla.
4. Respondé lo que pregunta por cada video: **título**, **cliente** y **número de rubro**.
5. Cuando pregunte *¿Publicar en la web ahora?* poné `s`. En 1-2 minutos está online.

Listo. Comprime los videos, genera la portada y actualiza la web sola.

> Los testimonios, casos de éxito y portadas se cargan escribiendo en `src/data/testimonials.json`, `cases.json` y `covers.json` (hay ejemplos en el README). Si no querés tocar eso, pasale los textos a Fran.

---

## Configuración (una sola vez por compu)

1. **Instalar programas** — abrí PowerShell y pegá:
   ```
   winget install Git.Git OpenJS.NodeJS.LTS Gyan.FFmpeg GitHub.cli
   ```
   Cerrá y volvé a abrir PowerShell.

2. **Acceso a GitHub** — Fran te invita como colaborador del repo `franarr/ediciondevideo`
   (GitHub → repo → Settings → Collaborators → Add people). Aceptá la invitación que te llega al mail y después:
   ```
   gh auth login
   ```

3. **Bajar el proyecto:**
   ```
   cd $HOME\Desktop
   gh repo clone franarr/ediciondevideo Portfolio
   cd Portfolio
   npm install
   ```

Desde ahí ya podés usar **`Subir videos.cmd`**.

---

## Si algo falla

- **"ffmpeg no se reconoce"** → cerrá y abrí de nuevo la ventana después de instalar (paso 1).
- **Error en `git push`** → no aceptaste la invitación de GitHub o falta `gh auth login` (paso 2).
- **Conflicto en git** → avisale a Fran antes de tocar nada.
