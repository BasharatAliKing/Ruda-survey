import { getToken, isTokenExpired, logoutAndRedirect } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.ruda-surv.nespakprogresscenter.com/api";

async function request(path, options = {}) {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    logoutAndRedirect();
    throw new Error("Your session has expired. Please sign in again.");
  }

  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    logoutAndRedirect();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "The request could not be completed.");
  }

  return payload;
}

export const api = {
  login: (credentials) => request("/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) }),
  getUsers: () => request("/users"),
  createUser: (user) => request("/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) }),
  updateUser: (id, user) => request(`/user/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(user) }),
  deleteUser: (id) => request(`/user/${id}`, { method: "DELETE" }),
  getSurveys: () => request("/surveys"),
  createSurvey: (formData) => request("/survey", { method: "POST", body: formData }),
  updateSurvey: (id, formData) => request(`/survey/${id}`, { method: "PUT", body: formData }),
  deleteSurvey: (id) => request(`/survey/${id}`, { method: "DELETE" }),
  importSurveys: (formData) => request("/survey/import", { method: "POST", body: formData }),
};

export const assetUrl = (path) => path?.startsWith("http") ? path : `${API_BASE_URL.replace("/api", "")}${path}`;