import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { foodItems, eventBookings, companyInfo, staff, bookingItems } from "@shared/schema";

const sqlite = new Database("catering.db");
export const db = drizzle(sqlite);

export { foodItems, eventBookings, companyInfo, staff, bookingItems };
