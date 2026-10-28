// Sube public/media (videos, portadas, imágenes) a Cloudflare R2.
// Solo sube lo nuevo o lo que cambió de tamaño, así que se puede correr siempre.
//
//   npm run upload            → sube lo que falta
//   npm run upload -- --dry   → muestra qué subiría, sin subir nada
//
// Credenciales en .env (ver .env.example).

import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Faltan datos de R2 en .env. Copiá .env.example a .env y completalo.');
  process.exit(1);
}

const ROOT = 'public/media';
const dry = process.argv.includes('--dry');
const TYPES = { '.mp4': 'video/mp4', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(join(dir, d.name)) : [join(dir, d.name)]
  );

const remoteSize = async (Key) => {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key }));
    return head.ContentLength;
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
};

let uploaded = 0;
let bytes = 0;
for (const file of walk(ROOT)) {
  const Key = relative(ROOT, file).split('\\').join('/');
  const size = statSync(file).size;
  if ((await remoteSize(Key)) === size) continue;

  console.log(`${dry ? '[dry] ' : ''}↑ ${Key} (${(size / 1e6).toFixed(1)} MB)`);
  if (!dry) {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key,
        Body: createReadStream(file),
        ContentLength: size,
        ContentType: TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
        CacheControl: 'public, max-age=604800',
      })
    );
  }
  uploaded++;
  bytes += size;
}

console.log(uploaded ? `\n${dry ? 'Se subirían' : 'Subidos'}: ${uploaded} archivo(s), ${(bytes / 1e6).toFixed(1)} MB.` : 'Todo al día, no hay nada para subir.');
