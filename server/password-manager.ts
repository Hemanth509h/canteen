import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";

const PASSWORD_FILE = join(process.cwd(), ".admin-password.json");

interface AdminPassword {
  passwordHash: string;
}

async function getPasswordData(): Promise<AdminPassword> {
  if (!existsSync(PASSWORD_FILE)) {
    // Default password "admin123" hashed
    const defaultPasswordHash = await bcrypt.hash("admin123", 10);
    const defaultData = { passwordHash: defaultPasswordHash };
    writeFileSync(PASSWORD_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  
  const data = readFileSync(PASSWORD_FILE, "utf-8");
  return JSON.parse(data);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const data = await getPasswordData();
  return bcrypt.compare(password, data.passwordHash);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const data = { passwordHash };
  writeFileSync(PASSWORD_FILE, JSON.stringify(data, null, 2));
}
