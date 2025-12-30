const AUTH_KEY = "adminAuthenticated";
const AUTH_EXPIRY_KEY = "adminAuthExpiry";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function setAdminSession() {
  const expiryTime = Date.now() + SESSION_DURATION;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
}

export function isAdminAuthenticated() {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === "true";
  const expiryTime = localStorage.getItem(AUTH_EXPIRY_KEY);
  
  if (!isAuthenticated || !expiryTime) {
    return false;
  }
  
  const expiry = parseInt(expiryTime, 10);
  if (Date.now() > expiry) {
    clearAdminSession();
    return false;
  }
  
  return true;
}

export function clearAdminSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

export function refreshSession() {
  if (isAdminAuthenticated()) {
    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem(AUTH_EXPIRY_KEY, expiryTime.toString());
  }
}

export function getSessionTimeRemaining() {
  const expiryTime = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (!expiryTime) return 0;
  
  const remaining = parseInt(expiryTime, 10) - Date.now();
  return Math.max(0, remaining);
}
