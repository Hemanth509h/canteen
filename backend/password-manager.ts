import bcrypt from "bcryptjs";

// Default password is "admin123" if not set in environment
const DEFAULT_PASSWORD_HASH = "$2b$10$XmB0vG.eN5HhVn9O.nL.G.R6O0q.uWv0K.x/y/1i.x.x.x.x.x.x.x"; // This is just a placeholder, we'll use a real one or handle it dynamically

let currentPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

export async function verifyPassword(password: string): Promise<boolean> {
  if (!currentPasswordHash) {
    // If no hash is set, we compare against a default (you should set ADMIN_PASSWORD in secrets)
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    return password === adminPassword;
  }
  return await bcrypt.compare(password, currentPasswordHash);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  currentPasswordHash = await bcrypt.hash(newPassword, salt);
  // Note: In a real app, you would save this to the database or a secret manager
}
