const KEY = "star_customer_auth";

export function saveAuth(payload) {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function getAuth() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return getAuth()?.token || null;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getUser() {
  return getAuth()?.user || null;
}

export function isAuthed() {
  return !!getToken();
}