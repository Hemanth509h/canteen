import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const foodItems = sqliteTable("food_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

export const eventBookings = sqliteTable("event_bookings", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  clientName: text("client_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventType: text("event_type").notNull(),
  guestCount: integer("guest_count").notNull(),
  pricePerPlate: integer("price_per_plate").notNull(),
  servingBoysNeeded: integer("serving_boys_needed").notNull().default(2),
  status: text("status").notNull().default("pending"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  specialRequests: text("special_requests"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bookingItems = sqliteTable("booking_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  bookingId: text("booking_id").notNull().references(() => eventBookings.id, { onDelete: 'cascade' }),
  foodItemId: text("food_item_id").notNull().references(() => foodItems.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull().default(1),
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

export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({
  id: true,
  createdAt: true,
});

export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;
export type EventBooking = typeof eventBookings.$inferSelect;
export type BookingItem = typeof bookingItems.$inferSelect;
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;

export const companyInfo = sqliteTable("company_info", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
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

export const staff = sqliteTable("staff", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  phone: text("phone").notNull(),
  experience: text("experience").notNull(),
  imageUrl: text("image_url"),
  salary: integer("salary").notNull(),
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
