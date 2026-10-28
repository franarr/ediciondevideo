// Comprime los videos originales de media-src/videos y genera portadas.
//
//   npm run media            → procesa solo los videos nuevos o modificados
//   npm run media -- --force → re-procesa todo
//
// Salida:
//   public/media/videos/<id>.mp4    H.264 + AAC, máx. 720p, 30 fps, faststart
//   public/media/posters/<id>.webp  frame del segundo 1, para mostrar mientras carga
//   src/data/media-manifest.json    ancho, alto, duración y orientación de cada video
//
// Requiere ffmpeg/ffprobe en el PATH (winget install Gyan.FFmpeg).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC = 'media-src/videos';
const OUT_VIDEOS = 'public/media/videos';
const OUT_POSTERS = 'public/media/posters';
const MANIFEST = 'src/data/media-manifest.json';
const MAX_SIDE = 720; // lado corto máximo (720p)
const force = process.argv.includes('--force');

export const slugify = (name) =>
  name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

const probe = (file) => {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'stream=codec_type,codec_name,width,height,pix_fmt,bit_rate:stream_side_data=rotation:format=duration,bit_rate',
    '-of', 'json', file,
  ]).toString();
  const data = JSON.parse(out);
  const stream = data.streams.find((s) => s.codec_type === 'video');
  const audio = data.streams.find((s) => s.codec_type === 'audio');
  const rotation = Math.abs(stream.side_data_list?.[0]?.rotation ?? 0);
  const [width, height] = rotation === 90 ? [stream.height, stream.width] : [stream.width, stream.height];
  return {
    width,
    height,
    duration: Math.round(parseFloat(data.format.duration)),
    kbps: Math.round(Number(data.format.bit_rate) / 1000),
    // Ya es liviano y compatible: alcanza con re-empaquetar (sin pérdida) para agregar faststart
    webReady:
      stream.codec_name === 'h264' &&
      stream.pix_fmt === 'yuv420p' &&
      (!audio || audio.codec_name === 'aac') &&
      Math.min(width, height) <= MAX_SIDE &&
      Number(data.format.bit_rate) <= 2_800_000,
  };
};

mkdirSync(OUT_VIDEOS, { recursive: true });
mkdirSync(OUT_POSTERS, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};

const files = readdirSync(SRC).filter((f) => /\.(mp4|mov|m4v|mkv|webm)$/i.test(f));
let done = 0;

for (const file of files) {
  const id = slugify(parse(file).name);
  const input = join(SRC, file);
  const outVideo = join(OUT_VIDEOS, `${id}.mp4`);
  const outPoster = join(OUT_POSTERS, `${id}.webp`);

  const upToDate = existsSync(outVideo) && statSync(outVideo).mtimeMs > statSync(input).mtimeMs;
  if (upToDate && !force && manifest[id]) continue;

  const { width, height, kbps, webReady } = probe(input);
  // Nunca superar el bitrate del original (evita que los videos livianos engorden)
  const maxrate = Math.min(2500, Math.max(400, Math.round(kbps * 0.9)));
  const horizontal = width > height;
  // Escala por el lado corto sin agrandar nunca el original
  const scale = horizontal ? `-2:${Math.min(MAX_SIDE, height)}` : `${Math.min(MAX_SIDE, width)}:-2`;

  process.stdout.write(`[${++done}] ${file} → ${id}.mp4 (${webReady ? 'remux' : 'encode'}) ... `);
  execFileSync('ffmpeg', [
    '-y', '-v', 'error', '-i', input,
    ...(webReady
      ? ['-c', 'copy']
      : [
          '-vf', `scale=${scale}:flags=lanczos,fps=30`,
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
          '-maxrate', `${maxrate}k`, '-bufsize', `${maxrate * 2}k`,
          '-profile:v', 'high', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', '128k', '-ac', '2',
        ]),
    '-map_metadata', '-1',
    '-movflags', '+faststart',
    outVideo,
  ]);

  execFileSync('ffmpeg', [
    '-y', '-v', 'error', '-ss', '1', '-i', outVideo,
    '-frames:v', '1', '-vf', horizontal ? 'scale=640:-2' : 'scale=480:-2',
    '-c:v', 'libwebp', '-quality', '75', outPoster,
  ]);

  const info = probe(outVideo);
  manifest[id] = {
    source: file,
    width: info.width,
    height: info.height,
    duration: info.duration,
    orientation: info.width > info.height ? 'horizontal' : 'vertical',
    size: statSync(outVideo).size,
  };
  console.log(`${(statSync(input).size / 1e6).toFixed(1)} MB → ${(manifest[id].size / 1e6).toFixed(1)} MB`);
  saveManifest(); // guardar en cada paso para no perder progreso si se corta
}

function saveManifest() {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
}

// ─── Imágenes: portadas y capturas de testimonios ───
// media-src/covers/*.jpg|png  → public/media/covers/<id>.webp
// media-src/testimonials/*    → public/media/testimonials/<id>.webp
for (const folder of ['covers', 'testimonials']) {
  const srcDir = join('media-src', folder);
  if (!existsSync(srcDir)) continue;
  const outDir = join('public/media', folder);
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(srcDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const input = join(srcDir, file);
    const output = join(outDir, `${slugify(parse(file).name)}.webp`);
    if (!force && existsSync(output) && statSync(output).mtimeMs > statSync(input).mtimeMs) continue;
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', input, '-vf', "scale='min(1080,iw)':-2", '-c:v', 'libwebp', '-quality', '80', output]);
    console.log(`${folder}/${file} → ${output}`);
  }
}

// Los videos nuevos se agregan al final de projects.json para completar título y rubro
const PROJECTS = 'src/data/projects.json';
const projects = existsSync(PROJECTS) ? JSON.parse(readFileSync(PROJECTS, 'utf8')) : [];
const known = new Set(projects.map((p) => p.id));
const added = Object.keys(manifest).filter((id) => !known.has(id));
for (const id of added) projects.push({ id, title: id.replace(/-/g, ' '), client: '', rubro: '' });
if (added.length) writeFileSync(PROJECTS, JSON.stringify(projects, null, 2) + '\n');

saveManifest();
console.log(done ? `\nListo: ${done} video(s) procesado(s).` : 'No hay videos nuevos.');
if (added.length) console.log(`Agregados a projects.json (completá título y rubro): ${added.join(', ')}`);
