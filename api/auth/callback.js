// GitHub vuelve acá después de que la persona acepta.
// Cambia el código por un token y se lo pasa al admin en el "#" de la URL
// (el fragmento no viaja al servidor ni queda en los logs).

const cookie = (req, name) =>
  (req.headers.cookie || '')
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([k]) => k === name)?.[1];

export default async function handler(req, res) {
  const { code, state } = req.query;
  const back = (hash) => res.redirect(302, `/admin/#${hash}`);

  if (!code || !state || state !== cookie(req, 'oauth_state')) {
    back('error=login');
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await response.json();
    res.setHeader('Set-Cookie', 'oauth_state=; Path=/api/auth; Max-Age=0');
    if (!data.access_token) {
      back('error=token');
      return;
    }
    back(`token=${encodeURIComponent(data.access_token)}`);
  } catch {
    back('error=github');
  }
}
