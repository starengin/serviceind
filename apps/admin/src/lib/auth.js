const TOKEN_KEY = "serviceind_admin_token";
const LOGIN_AT_KEY = "serviceind_admin_login_at";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LOGIN_AT_KEY);
}

export function markLoginNow() {
  sessionStorage.setItem(LOGIN_AT_KEY, String(Date.now()));
}

export function getLoginAt() {
  return Number(sessionStorage.getItem(LOGIN_AT_KEY) || 0);
}

export function isAuthed() {
  return !!getToken();
}

export function logout() {
  clearToken();
}