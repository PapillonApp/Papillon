// ==========================================
// 🛠️ UTILITAIRES
// ==========================================

const cookies: Record<string, string> = {};

function getCookieHeader(): string {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * Met à jour le store de cookies à partir d'un header 'Set-Cookie'.
 */
function updateCookies(headerValue: string | null) {
  if (!headerValue) {return;}
  const splitCookies = headerValue.split(/,(?=\s*[a-zA-Z0-9_-]+=)/);

  splitCookies.forEach(c => {
    const parts = c.split(';');
    const [keyVal] = parts;
    const eqIndex = keyVal.indexOf('=');

    if (eqIndex > -1) {
      const key = keyVal.substring(0, eqIndex).trim();
      let val = keyVal.substring(eqIndex + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) {val = val.slice(1, -1);}
      if (val && val !== 'deleted' && val !== '""') {
        cookies[key] = val;
      }
    }
  });
}