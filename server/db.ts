import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { foodItems, eventBookings, companyInfo, staff } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export { foodItems, eventBookings, companyInfo, staff };
