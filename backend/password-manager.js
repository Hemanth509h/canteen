import bcrypt from "bcryptjs";

// Default password is "admin123" if not set in environment
let currentPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

export async function verifyPassword(password) {
  if (!currentPasswordHash) {
    // If no hash is set, we compare against a default (you should set ADMIN_PASSWORD in secrets)
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    return password === adminPassword;
  }
  return await bcrypt.compare(password, currentPasswordHash);
}

export async function updatePassword(newPassword) {
  const salt = await bcrypt.genSalt(10);
  currentPasswordHash = await bcrypt.hash(newPassword, salt);
}
