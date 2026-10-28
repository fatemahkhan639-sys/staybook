// Every call to the Express API goes through here, so auth
// headers and error messages stay consistent across pages.
const TOKEN_KEY = 'staybook_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

export const api = {
  get: (path, auth = false) => request(path, { auth }),
  post: (path, body, auth = false) => request(path, { method: 'POST', body, auth }),
  patch: (path, body, auth = false) => request(path, { method: 'PATCH', body, auth }),
  del: (path, auth = false) => request(path, { method: 'DELETE', auth }),
};
