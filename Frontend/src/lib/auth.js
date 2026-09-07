const TOKEN_KEY = "ruda_token";
const USER_KEY = "ruda_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function decodeToken(token = getToken()) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isTokenExpired(token = getToken()) {
  const payload = decodeToken(token);
  return !payload?.exp || payload.exp * 1000 <= Date.now();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logoutAndRedirect() {
  clearSession();
  window.location.replace("/login?expired=1");
}