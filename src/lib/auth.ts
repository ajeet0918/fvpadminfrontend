const TOKEN_KEY = "admin_access_token";
const AUTH_CHANGED_EVENT = "admin_auth_changed";

type JwtPayload = {
  sub?: string;
  role?: string;
  exp?: number;
};

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearAccessToken() {
  const hadToken = Boolean(getAccessToken());
  localStorage.removeItem(TOKEN_KEY);
  if (hadToken) {
    notifyAuthChanged();
  }
}

export function isAuthenticated() {
  return hasUsableAccessToken();
}

export function hasUsableAccessToken() {
  const payload = parseJwtPayload(getAccessToken());
  if (!payload?.sub || !payload.role) {
    return false;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return false;
  }

  return true;
}

export function getCurrentUsername() {
  return parseJwtPayload(getAccessToken())?.sub ?? "";
}

export function getCurrentRole() {
  return parseJwtPayload(getAccessToken())?.role ?? "";
}

function parseJwtPayload(token: string | null): JwtPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function subscribeToAuthChanges(listener: () => void) {
  window.addEventListener(AUTH_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
