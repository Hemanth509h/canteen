import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

export const eventBookings = pgTable("event_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventType: text("event_type").notNull(),
  guestCount: integer("guest_count").notNull(),
  pricePerPlate: integer("price_per_plate").notNull(),
  status: text("status").notNull().default("pending"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  specialRequests: text("special_requests"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertEventBookingSchema = createInsertSchema(eventBookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const updateEventBookingSchema = createInsertSchema(eventBookings).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;
export type EventBooking = typeof eventBookings.$inferSelect;

export const companyInfo = pgTable("company_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  eventsPerYear: integer("events_per_year").notNull().default(500),
});

export const insertCompanyInfoSchema = createInsertSchema(companyInfo).omit({
  id: true,
});

export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;
export type CompanyInfo = typeof companyInfo.$inferSelect;

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(), // chef, worker, serving_boy
  phone: text("phone").notNull(),
  experience: text("experience").notNull(), // e.g., "5 years"
  imageUrl: text("image_url"),
  salary: integer("salary").notNull(), // monthly salary in rupees
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const updateStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
export type Staff = typeof staff.$inferSelect;
