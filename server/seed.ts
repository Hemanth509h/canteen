import { connectToDatabase } from "./db";

export async function seedDatabase() {
  await connectToDatabase();
  console.log("⚠️  Automatic seeding disabled - database is intentionally empty");
}
