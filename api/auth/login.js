// Inicio del login del admin: manda a GitHub a pedir permiso.
// Requiere GITHUB_CLIENT_ID en Vercel → Settings → Environment Variables.

import { randomBytes } from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Falta GITHUB_CLIENT_ID en las variables de entorno de Vercel.');
    return;
  }

  // "state" evita que otro sitio inicie un login en tu nombre
  const state = randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `oauth_state=${state}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `https://${req.headers.host}/api/auth/callback`,
    scope: 'public_repo', // el repo es público: alcanza con este permiso
    state,
    allow_signup: 'true',
  });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
