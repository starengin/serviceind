const KEY = "serviceind_customer_auth";

// sessionStorage => browser tab/window close pe auto clear
const storage = sessionStorage;

export function saveAuth(payload) {
  storage.setItem(KEY, JSON.stringify(payload));
}

export function getAuth() {
  try {
    const raw = storage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return getAuth()?.token || null;
}

export function getUser() {
  return getAuth()?.user || null;
}

export function isAuthed() {
  return !!getToken();
}

export function logout() {
  storage.removeItem(KEY);
}