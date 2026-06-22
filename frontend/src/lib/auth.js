const AUTH_KEY = "adminAuthenticated";
const AUTH_EXPIRY_KEY = "adminAuthExpiry";
const AUTH_ROLE_KEY = "adminRole";
const AUTH_USER_KEY = "adminUser";
const AUTH_TOKEN_KEY = "adminToken";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function getStorage() {
  return typeof window !== "undefined" ? window.sessionStorage : null;
}

function clearLegacyAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setAdminSession(sessionData = { role: "superadmin", user: null }) {
  const storage = getStorage();
  if (!storage) return;
  const expiryTime = Date.now() + SESSION_DURATION;
  clearLegacyAdminSession();
  storage.removeItem(AUTH_USER_KEY);
  storage.removeItem(AUTH_TOKEN_KEY);
  storage.setItem(AUTH_KEY, "true");
  storage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
  if (sessionData.role) storage.setItem(AUTH_ROLE_KEY, sessionData.role);
  if (sessionData.user) storage.setItem(AUTH_USER_KEY, JSON.stringify(sessionData.user));
  if (sessionData.token) storage.setItem(AUTH_TOKEN_KEY, sessionData.token);
}

export async function isAdminAuthenticated() {
  const storage = getStorage();
  const isAuthenticated = storage?.getItem(AUTH_KEY) === "true";
  const expiryTime = storage?.getItem(AUTH_EXPIRY_KEY);

  if (!isAuthenticated || !expiryTime) {
    await clearAdminSession();
    return false;
  }

  const expiry = parseInt(expiryTime, 10);
  if (Date.now() > expiry) {
    await clearAdminSession();
    return false;
  }

  return true;
}

export function getAdminSession() {
  const storage = getStorage();
  const role = storage?.getItem(AUTH_ROLE_KEY) || "superadmin";
  const userStr = storage?.getItem(AUTH_USER_KEY);
  let user = null;
  if (userStr) {
    try { user = JSON.parse(userStr); } catch (e) {}
  }
  const token = storage?.getItem(AUTH_TOKEN_KEY);
  return { role, user, token };
}

export async function clearAdminSession() {
  const storage = getStorage();
  storage?.removeItem(AUTH_KEY);
  storage?.removeItem(AUTH_EXPIRY_KEY);
  storage?.removeItem(AUTH_ROLE_KEY);
  storage?.removeItem(AUTH_USER_KEY);
  storage?.removeItem(AUTH_TOKEN_KEY);
  clearLegacyAdminSession();
}

export function refreshSession() {
  const storage = getStorage();
  if (storage?.getItem(AUTH_KEY) === "true") {
    const expiryTime = Date.now() + SESSION_DURATION;
    storage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
  }
}

export function onAdminAuthStateChange(callback) {
  const handleStorage = (event) => {
    if (event.key === AUTH_KEY || event.key === AUTH_EXPIRY_KEY) {
      isAdminAuthenticated().then(callback);
    }
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
