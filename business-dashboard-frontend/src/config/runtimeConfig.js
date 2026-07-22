const DEFAULT_LOGIN_PATH = "/auth/login";
const DEFAULT_REFRESH_PATH = "/auth/refresh-token";
const DEFAULT_LOGOUT_PATH = "/auth/logout";

const normalizeUrl = (value, fallback = "") => {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  return value.trim().replace(/\/+$/, "");
};

const stripApiSuffix = (value = "") => value.replace(/\/api\/v1\/?$/, "");

// =========================
// API BASE URL
// =========================
export const getApiBaseUrl = () => {
  return normalizeUrl(import.meta.env.VITE_API_BASE_URL);
};

// =========================
// MEDIA BASE URL
// =========================
export const getMediaBaseUrl = () => {
  const apiBase = getApiBaseUrl();

  return normalizeUrl(import.meta.env.VITE_MEDIA_BASE_URL || stripApiSuffix(apiBase));
};

// =========================
// AUTH PATHS
// =========================
export const getLoginPath = () => {
  return import.meta.env.VITE_AUTH_LOGIN_PATH || DEFAULT_LOGIN_PATH;
};

export const getRefreshPath = () => {
  return import.meta.env.VITE_AUTH_REFRESH_PATH || DEFAULT_REFRESH_PATH;
};

export const getLogoutPath = () => {
  return import.meta.env.VITE_AUTH_LOGOUT_PATH || DEFAULT_LOGOUT_PATH;
};
