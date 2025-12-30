import bcrypt from "bcryptjs";

// Default password is "admin123" if not set in environment
// We'll also support a fallback if for some reason env vars aren't propagating correctly in serverless
let currentPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

export async function verifyPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  
  if (!currentPasswordHash) {
    // If no hash is set, we compare against the plain text env var or default
    console.log("No ADMIN_PASSWORD_HASH found, checking against plain text password");
    return password === adminPassword;
  }
  
  try {
    const isHashValid = await bcrypt.compare(password, currentPasswordHash);
    if (isHashValid) return true;
    
    // Fallback check against plain text in case the hash was misconfigured
    return password === adminPassword;
  } catch (error) {
    console.error("Password verification error:", error);
    return password === adminPassword;
  }
}

export async function updatePassword(newPassword) {
  const salt = await bcrypt.genSalt(10);
  currentPasswordHash = await bcrypt.hash(newPassword, salt);
  // Note: In serverless, this memory update won't persist across instances.
  // The user should set ADMIN_PASSWORD_HASH in their environment variables for persistence.
}
