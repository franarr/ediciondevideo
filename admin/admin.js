// Admin del portfolio: subir videos y editar sus datos.
// Habla directo con la API de GitHub usando el login de la persona:
//   · los videos nuevos van a la rama "admin-inbox" y GitHub Actions los procesa
//     (.github/workflows/procesar-videos.yml)
//   · los cambios de datos se guardan en src/data/projects.json (rama main)

import es from '../src/i18n/es.json';
import demoProjects from '../src/data/projects.json';

const OWNER = 'franarr';
const REPO = 'ediciondevideo';
const MAIN = 'main';
const INBOX_BRANCH = 'admin-inbox';
const PROJECTS_PATH = 'src/data/projects.json';
const MAX_BYTES = 90 * 1024 * 1024; // límite práctico de la API de GitHub
const API = 'https://api.github.com';

const RUBROS = Object.keys(es)
  .filter((k) => k.startsWith('rubro.') && !['rubro.all', 'rubro.otros'].includes(k))
  .map((k) => [k.slice(6), es[k]]);

// Igual que en scripts/optimize-media.mjs: el id define el nombre del archivo
const slugify = (name) =>
  name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');

const $ = (id) => document.getElementById(id);
const demo = new URLSearchParams(location.search).has('demo');

// ─── Sesión ───
const hash = new URLSearchParams(location.hash.slice(1));
if (hash.get('token')) sessionStorage.setItem('gh_token', hash.get('token'));
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
const token = sessionStorage.getItem('gh_token');

const LOGIN_ERRORS = {
  login: 'El login se cortó. Probá de nuevo.',
  token: 'GitHub no aceptó el login. Probá de nuevo.',
  github: 'No se pudo hablar con GitHub. Probá en un rato.',
};

async function gh(path, { method = 'GET', body, raw } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404 && raw === 'allow404') return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub respondió ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// Subida con barra de progreso (fetch no informa el progreso del envío)
function uploadBlob(base64, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API}/repos/${OWNER}/${REPO}/git/blobs`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Accept', 'application/vnd.github+json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error(`GitHub respondió ${xhr.status}`));
    xhr.onerror = () => reject(new Error('Se cortó la conexión'));
    xhr.send(JSON.stringify({ content: base64, encoding: 'base64' }));
  });
}

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const utf8ToBase64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const base64ToUtf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

const showMsg = (el, text, type = '') => {
  el.textContent = text;
  el.className = `msg ${type}`;
  el.hidden = !text;
};

// ─── Datos ───
let projects = [];
let projectsSha = null;

async function loadProjects() {
  if (demo) {
    projects = structuredClone(demoProjects);
    return;
  }
  const file = await gh(`/repos/${OWNER}/${REPO}/contents/${PROJECTS_PATH}?ref=${MAIN}`);
  projects = JSON.parse(base64ToUtf8(file.content));
  projectsSha = file.sha;
}

// ─── Formularios (subir y editar usan la misma tarjeta) ───
function buildItem({ title = '', client = '', rubro = '', featured = false, hero = false, hidden = false }, mode) {
  const node = $('tpl-item').content.firstElementChild.cloneNode(true);
  node.classList.add(`is-${mode}`);
  const select = node.querySelector('[name=rubro]');
  select.innerHTML =
    `<option value="">Elegí un rubro…</option>` +
    RUBROS.map(([key, label]) => `<option value="${key}">${label}</option>`).join('');
  node.querySelector('[name=title]').value = title;
  node.querySelector('[name=client]').value = client;
  select.value = rubro;
  node.querySelector('[name=featured]').checked = !!featured;
  node.querySelector('[name=hero]').checked = !!hero;
  node.querySelector('[name=hidden]').checked = !!hidden;
  return node;
}

const readItem = (node) => ({
  title: node.querySelector('[name=title]').value.trim(),
  client: node.querySelector('[name=client]').value.trim(),
  rubro: node.querySelector('[name=rubro]').value,
  featured: node.querySelector('[name=featured]').checked,
  hero: node.querySelector('[name=hero]').checked,
  hidden: node.querySelector('[name=hidden]').checked,
});

// ─── Subir videos ───
const queue = []; // { file, node, previewUrl }

function addFiles(files) {
  const msg = $('upload-msg');
  showMsg(msg, '');
  for (const file of files) {
    if (!file.type.startsWith('video/')) continue;
    if (file.size > MAX_BYTES) {
      showMsg(msg, `“${file.name}” pesa ${(file.size / 1e6).toFixed(0)} MB. El máximo es 90 MB: exportalo más liviano o pasáselo a Fran.`, 'error');
      continue;
    }
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    const node = buildItem({ title: name }, 'upload');
    const previewUrl = URL.createObjectURL(file);
    const video = node.querySelector('video');
    video.src = previewUrl;
    video.hidden = false;
    node.querySelector('img').remove();
    node.querySelector('.meta').textContent = `${file.name} · ${(file.size / 1e6).toFixed(1)} MB`;
    const entry = { file, node, previewUrl };
    node.querySelector('.remove').addEventListener('click', () => {
      queue.splice(queue.indexOf(entry), 1);
      URL.revokeObjectURL(previewUrl);
      node.remove();
      $('upload-actions').hidden = !queue.length;
    });
    queue.push(entry);
    $('queue').append(node);
  }
  $('upload-actions').hidden = !queue.length;
}

function uniqueId(base, taken) {
  let id = base || 'video';
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

async function publish() {
  const msg = $('upload-msg');
  const items = queue.map((q) => ({ ...q, data: readItem(q.node) }));
  const missing = items.find((i) => !i.data.title || !i.data.rubro);
  if (missing) {
    missing.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showMsg(msg, 'A cada video le falta título o rubro.', 'error');
    return;
  }

  const button = $('publish');
  button.disabled = true;
  try {
    if (demo) {
      await new Promise((r) => setTimeout(r, 800));
      showMsg(msg, `Demo: se habrían publicado ${items.length} video(s).`, 'ok');
      return;
    }

    const taken = new Set(projects.map((p) => p.id));
    const treeEntries = [];
    for (const [index, item] of items.entries()) {
      const ext = (item.file.name.match(/\.[^.]+$/)?.[0] || '.mp4').toLowerCase();
      const id = uniqueId(slugify(item.data.title), taken);
      const file = `${id}${ext}`;
      const label = `Subiendo ${index + 1} de ${items.length}: ${item.data.title}`;
      showMsg(msg, `${label}…`);
      const base64 = await fileToBase64(item.file);
      const blob = await uploadBlob(base64, (p) => showMsg(msg, `${label} — ${Math.round(p * 100)}%`));
      treeEntries.push(
        { path: `inbox/${file}`, mode: '100644', type: 'blob', sha: blob.sha },
        {
          path: `inbox/${id}.json`,
          mode: '100644',
          type: 'blob',
          content: JSON.stringify({ id, file, title: item.data.title, client: item.data.client, rubro: item.data.rubro, featured: item.data.featured }, null, 2),
        }
      );
    }

    showMsg(msg, 'Guardando…');
    const existing = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${INBOX_BRANCH}`, { raw: 'allow404' });
    const parentSha = existing?.object.sha ?? (await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${MAIN}`)).object.sha;
    const parent = await gh(`/repos/${OWNER}/${REPO}/git/commits/${parentSha}`);
    const tree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, { method: 'POST', body: { base_tree: parent.tree.sha, tree: treeEntries } });
    const commit = await gh(`/repos/${OWNER}/${REPO}/git/commits`, {
      method: 'POST',
      body: { message: `Admin: subir ${items.map((i) => i.data.title).join(', ')}`, tree: tree.sha, parents: [parentSha] },
    });
    if (existing) {
      await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${INBOX_BRANCH}`, { method: 'PATCH', body: { sha: commit.sha } });
    } else {
      await gh(`/repos/${OWNER}/${REPO}/git/refs`, { method: 'POST', body: { ref: `refs/heads/${INBOX_BRANCH}`, sha: commit.sha } });
    }

    queue.splice(0).forEach((q) => {
      URL.revokeObjectURL(q.previewUrl);
      q.node.remove();
    });
    $('upload-actions').hidden = true;
    showMsg(msg, '✔ Listo. Se están comprimiendo; en unos 5 minutos aparecen en la web.', 'ok');
    watchProcessing();
  } catch (err) {
    showMsg(msg, `No se pudo publicar: ${err.message}`, 'error');
  } finally {
    button.disabled = false;
  }
}

// Avisa cuando GitHub termina de procesar
async function watchProcessing() {
  const banner = $('upload-msg');
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const runs = await gh(`/repos/${OWNER}/${REPO}/actions/workflows/procesar-videos.yml/runs?per_page=1`).catch(() => null);
    const run = runs?.workflow_runs?.[0];
    if (!run) continue;
    if (run.status === 'completed') {
      showMsg(
        banner,
        run.conclusion === 'success'
          ? '✔ Videos procesados. La web se actualiza en 1-2 minutos.'
          : 'Hubo un problema al procesar los videos. Avisale a Fran.',
        run.conclusion === 'success' ? 'ok' : 'error'
      );
      if (run.conclusion === 'success') loadProjects().then(renderList);
      return;
    }
  }
}

// ─── Editar publicados ───
let dirty = false;

function renderList() {
  const list = $('list');
  const term = $('search').value.trim().toLowerCase();
  list.innerHTML = '';
  projects.forEach((project, index) => {
    const label = RUBROS.find(([k]) => k === project.rubro)?.[1] ?? '';
    if (term && ![project.title, project.client, label].join(' ').toLowerCase().includes(term)) return;
    const node = buildItem(project, 'edit');
    node.querySelector('img').src = `/media/posters/${project.id}.webp`;
    node.querySelector('.meta').textContent = `${project.id}.mp4`;
    node.addEventListener('input', () => {
      Object.assign(projects[index], readItem(node));
      for (const key of ['featured', 'hero', 'hidden']) if (!projects[index][key]) delete projects[index][key];
      dirty = true;
      $('save').disabled = false;
    });
    list.append(node);
  });
}

async function save() {
  const msg = $('save-msg');
  $('save').disabled = true;
  try {
    if (demo) {
      showMsg(msg, 'Demo: los cambios se habrían guardado.', 'ok');
    } else {
      const res = await gh(`/repos/${OWNER}/${REPO}/contents/${PROJECTS_PATH}`, {
        method: 'PUT',
        body: {
          message: 'Admin: editar datos de videos',
          content: utf8ToBase64(JSON.stringify(projects, null, 2) + '\n'),
          sha: projectsSha,
          branch: MAIN,
        },
      });
      projectsSha = res.content.sha;
      showMsg(msg, '✔ Guardado. La web se actualiza en 1-2 minutos.', 'ok');
    }
    dirty = false;
  } catch (err) {
    $('save').disabled = false;
    showMsg(
      msg,
      /does not match|sha/i.test(err.message)
        ? 'Alguien cambió los datos mientras tanto. Recargá la página y volvé a hacer el cambio.'
        : `No se pudo guardar: ${err.message}`,
      'error'
    );
  }
}

// ─── Arranque ───
async function start() {
  if (!token && !demo) {
    $('screen-login').hidden = false;
    const error = hash.get('error');
    if (error) showMsg($('login-error'), LOGIN_ERRORS[error] ?? 'No se pudo entrar.', 'error');
    return;
  }

  try {
    if (!demo) {
      const [user, repo] = await Promise.all([gh('/user'), gh(`/repos/${OWNER}/${REPO}`)]);
      if (!repo.permissions?.push) {
        sessionStorage.removeItem('gh_token');
        $('screen-login').hidden = false;
        showMsg($('login-error'), `La cuenta “${user.login}” todavía no tiene permiso. Pedile a Fran que te invite como colaborador y aceptá el mail de GitHub.`, 'error');
        return;
      }
      $('user-avatar').src = user.avatar_url;
      $('user-name').textContent = user.login;
      $('user').hidden = false;
    }
    await loadProjects();
  } catch (err) {
    sessionStorage.removeItem('gh_token');
    $('screen-login').hidden = false;
    showMsg($('login-error'), `Volvé a entrar (${err.message}).`, 'error');
    return;
  }

  $('screen-app').hidden = false;
  $('demo-banner').hidden = !demo;
  renderList();
}

// Pestañas
document.querySelectorAll('.tab').forEach((tab) =>
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    $('tab-upload').hidden = tab.dataset.tab !== 'upload';
    $('tab-edit').hidden = tab.dataset.tab !== 'edit';
  })
);

// Arrastrar y soltar
const drop = $('drop');
drop.addEventListener('dragover', (e) => {
  e.preventDefault();
  drop.classList.add('over');
});
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  addFiles(e.dataTransfer.files);
});
$('file-input').addEventListener('change', (e) => {
  addFiles(e.target.files);
  e.target.value = '';
});

$('publish').addEventListener('click', publish);
$('save').addEventListener('click', save);
$('search').addEventListener('input', renderList);
$('logout').addEventListener('click', () => {
  sessionStorage.removeItem('gh_token');
  location.reload();
});
window.addEventListener('beforeunload', (e) => {
  if (dirty || queue.length) e.preventDefault();
});

start();
