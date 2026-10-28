// Asistente para cargar videos nuevos (lo usa "Subir videos.cmd").
//
//   1. Trae los últimos cambios del repo
//   2. Comprime lo que haya en media-src/ (npm run media)
//   3. Pregunta título, cliente y rubro de cada video nuevo
//   4. Sube los archivos a Cloudflare R2
//   5. Guarda y publica (commit + push → Vercel actualiza la web)

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const PROJECTS = 'src/data/projects.json';
const es = JSON.parse(readFileSync('src/i18n/es.json', 'utf8'));
const RUBROS = Object.keys(es)
  .filter((k) => k.startsWith('rubro.') && !['rubro.all', 'rubro.otros'].includes(k))
  .map((k) => k.slice('rubro.'.length));

const run = (cmd) => execSync(cmd, { stdio: 'inherit' });
const quiet = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
const rl = createInterface({ input, output });
const ask = async (q, fallback = '') => (await rl.question(q)).trim() || fallback;
const yes = async (q) => /^s/i.test(await ask(`${q} (s/n) `, 'n'));

try {
  console.log('\n── 1/5 Trayendo los últimos cambios ──');
  run('git pull --rebase --autostash');

  const before = new Set(JSON.parse(readFileSync(PROJECTS, 'utf8')).map((p) => p.id));

  console.log('\n── 2/5 Comprimiendo videos e imágenes de media-src/ ──');
  run('node scripts/optimize-media.mjs');

  const projects = JSON.parse(readFileSync(PROJECTS, 'utf8'));
  const pending = projects.filter((p) => !before.has(p.id) || !p.rubro);

  if (pending.length) {
    console.log('\n── 3/5 Datos de cada video nuevo ──');
    console.log('Rubros:');
    RUBROS.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${es[`rubro.${r}`]}`));

    for (const p of pending) {
      console.log(`\n▶ ${p.id}.mp4`);
      p.title = await ask(`  Título (Enter = "${p.title}"): `, p.title);
      p.client = await ask('  Cliente (opcional): ', p.client || '');
      let n = 0;
      while (!(n >= 1 && n <= RUBROS.length)) n = Number(await ask('  Número de rubro: '));
      p.rubro = RUBROS[n - 1];
      if (await yes('  ¿Destacado en la Mesa de trabajo?')) p.featured = true;
    }

    // Los nuevos van primero en la web
    const fresh = projects.filter((p) => pending.includes(p));
    const rest = projects.filter((p) => !pending.includes(p));
    writeFileSync(PROJECTS, JSON.stringify([...fresh, ...rest], null, 2) + '\n');
  } else {
    console.log('\n── 3/5 No hay videos nuevos para completar ──');
  }

  console.log('\n── 4/5 Subiendo archivos a Cloudflare R2 ──');
  run('node --env-file-if-exists=.env scripts/upload-r2.mjs');

  console.log('\n── 5/5 Publicar ──');
  const changes = quiet('git status --porcelain src/data');
  if (!changes) {
    console.log('No hay cambios para publicar.');
  } else if (await yes('¿Publicar en la web ahora?')) {
    const names = pending.map((p) => p.title).join(', ') || 'actualizar contenido';
    run('git add src/data');
    run(`git commit -m ${JSON.stringify(`Agregar videos: ${names}`)}`);
    run('git push');
    console.log('\n✔ Listo. Vercel actualiza la web en 1-2 minutos.');
  } else {
    console.log('Quedó guardado en tu compu sin publicar. Corré esto de nuevo cuando quieras publicar.');
  }
} catch (err) {
  console.error('\n✖ Algo falló:', err.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
