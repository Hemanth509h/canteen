const AUTH_KEY = "adminAuthenticated";
const AUTH_EXPIRY_KEY = "adminAuthExpiry";
const AUTH_ROLE_KEY = "adminRole";
const AUTH_USER_KEY = "adminUser";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function setAdminSession(sessionData = { role: "superadmin", user: null }) {
  const expiryTime = Date.now() + SESSION_DURATION;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
  if (sessionData.role) localStorage.setItem(AUTH_ROLE_KEY, sessionData.role);
  if (sessionData.user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionData.user));
}

export async function isAdminAuthenticated() {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === "true";
  const expiryTime = localStorage.getItem(AUTH_EXPIRY_KEY);

  if (!isAuthenticated || !expiryTime) {
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
  const role = localStorage.getItem(AUTH_ROLE_KEY) || "superadmin";
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  let user = null;
  if (userStr) {
    try { user = JSON.parse(userStr); } catch (e) {}
  }
  return { role, user };
}

export async function clearAdminSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function refreshSession() {
  if (localStorage.getItem(AUTH_KEY) === "true") {
    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
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
