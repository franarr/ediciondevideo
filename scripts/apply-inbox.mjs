// Lo corre GitHub Actions cuando alguien sube videos desde /admin.
//
// inbox/<id>.<ext>   video original
// inbox/<id>.json    { id, file, title, client, rubro, featured }
//
// Mueve los videos a media-src/, los comprime con optimize-media.mjs
// y completa sus datos en projects.json (los nuevos quedan primeros).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INBOX = 'inbox';
const PROJECTS = 'src/data/projects.json';

const sidecars = existsSync(INBOX)
  ? readdirSync(INBOX)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(INBOX, f), 'utf8')))
  : [];

if (!sidecars.length) {
  console.log('La bandeja está vacía.');
  writeFileSync('.inbox-summary', '');
  process.exit(0);
}

mkdirSync('media-src/videos', { recursive: true });
for (const s of sidecars) {
  const from = join(INBOX, s.file);
  if (existsSync(from)) renameSync(from, join('media-src/videos', s.file));
  else console.warn(`No encontré ${s.file}, lo salteo.`);
}

execFileSync('node', ['scripts/optimize-media.mjs'], { stdio: 'inherit' });

const projects = JSON.parse(readFileSync(PROJECTS, 'utf8'));
const fresh = [];
for (const s of sidecars) {
  const project = projects.find((p) => p.id === s.id);
  if (!project) continue; // el video no se pudo procesar
  Object.assign(project, {
    title: s.title || project.title,
    client: s.client || '',
    rubro: s.rubro || '',
  });
  if (s.featured) project.featured = true;
  fresh.push(project);
}

const rest = projects.filter((p) => !fresh.includes(p));
writeFileSync(PROJECTS, JSON.stringify([...fresh, ...rest], null, 2) + '\n');
writeFileSync('.inbox-summary', fresh.map((p) => p.title).join(', '));
console.log(`Procesados: ${fresh.map((p) => p.id).join(', ')}`);
