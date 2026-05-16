const AUTH_KEY = "adminAuthenticated";
const AUTH_EXPIRY_KEY = "adminAuthExpiry";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function setAdminSession() {
  const expiryTime = Date.now() + SESSION_DURATION;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
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

export async function clearAdminSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
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
