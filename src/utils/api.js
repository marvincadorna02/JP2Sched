// src/utils/api.js
//
// Small helper so every API call automatically carries the logged-in user's
// session token, without having to repeat header logic in every component.

const TOKEN_KEY = "jp2sched_token";
const USER_KEY = "jp2sched_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

/**
 * Drop-in replacement for fetch() that attaches the Authorization header
 * automatically and redirects to /login if the session has expired.
 *
 * Usage: apiFetch("/api/subjects.php") instead of fetch("/api/subjects.php")
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Don't set Content-Type for FormData (file uploads) — the browser needs
  // to set its own multipart boundary. Only default it for JSON string bodies.
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !headers["Content-Type"] && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return res;
}