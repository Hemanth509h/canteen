import { db } from "./db";
import { companyInfo } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  // Check if company info already exists
  const existing = await db.select().from(companyInfo).limit(1);
  
  if (existing.length === 0) {
    // Insert default company info
    await db.insert(companyInfo).values({
      companyName: "Premium Catering Services",
      tagline: "Exceptional Food for Unforgettable Events",
      description: "We specialize in creating memorable culinary experiences for weddings, corporate events, and special occasions. Our team of expert chefs uses only the finest ingredients to craft dishes that delight your guests.",
      email: "info@premiumcatering.com",
      phone: "+91 98765 43210",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      eventsPerYear: 500,
    });
    console.log("Default company info created");
  } else {
    console.log("Company info already exists");
  }
  
  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
