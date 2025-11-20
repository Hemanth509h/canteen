import { MemStorage } from "./storage";

// Use in-memory storage - all data is stored in memory during runtime
// This follows the development guidelines to use MemStorage unless explicitly asked to use a database
export const storage = new MemStorage();
