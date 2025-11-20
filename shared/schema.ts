import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// ==================== FOOD ITEMS ====================

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  dietaryTags?: string[];
}

export const insertFoodItemSchema = z.object({
  name: z.string().min(1, "Food item name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().nullable().optional(),
  dietaryTags: z.array(z.string()).optional(),
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export interface FoodItemDocument extends Document {
  name: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  dietaryTags?: string[];
}

const foodItemSchema = new Schema<FoodItemDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: null },
  dietaryTags: [{ type: String }],
});

export const FoodItemModel = mongoose.models.FoodItem || mongoose.model<FoodItemDocument>("FoodItem", foodItemSchema);

// ==================== EVENT BOOKINGS ====================

export interface EventBooking {
  id: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  pricePerPlate: number;
  servingBoysNeeded: number;
  status: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string | null;
  createdAt: string;
}

export const insertEventBookingSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventType: z.string().min(1, "Event type is required"),
  guestCount: z.number().int().positive("Guest count must be positive"),
  pricePerPlate: z.number().int().positive("Price per plate must be positive"),
  servingBoysNeeded: z.number().int().positive().default(2),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  specialRequests: z.string().nullable().optional(),
});

export const updateEventBookingSchema = insertEventBookingSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
});

export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;

export interface EventBookingDocument extends Document {
  clientName: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  pricePerPlate: number;
  servingBoysNeeded: number;
  status: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string | null;
  createdAt: Date;
}

const eventBookingSchema = new Schema<EventBookingDocument>({
  clientName: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true },
  pricePerPlate: { type: Number, required: true },
  servingBoysNeeded: { type: Number, required: true, default: 2 },
  status: { type: String, required: true, default: "pending" },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  specialRequests: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const EventBookingModel = mongoose.models.EventBooking || mongoose.model<EventBookingDocument>("EventBooking", eventBookingSchema);

// ==================== BOOKING ITEMS ====================

export interface BookingItem {
  id: string;
  bookingId: string;
  foodItemId: string;
  quantity: number;
  createdAt: string;
}

export const insertBookingItemSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  foodItemId: z.string().min(1, "Food item ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;

export interface BookingItemDocument extends Document {
  bookingId: string;
  foodItemId: string;
  quantity: number;
  createdAt: Date;
}

const bookingItemSchema = new Schema<BookingItemDocument>({
  bookingId: { type: String, required: true },
  foodItemId: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

export const BookingItemModel = mongoose.models.BookingItem || mongoose.model<BookingItemDocument>("BookingItem", bookingItemSchema);

// ==================== COMPANY INFO ====================

export interface CompanyInfo {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  eventsPerYear: number;
}

export const insertCompanyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  eventsPerYear: z.number().int().positive().default(500),
});

export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;

export interface CompanyInfoDocument extends Document {
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  eventsPerYear: number;
}

const companyInfoSchema = new Schema<CompanyInfoDocument>({
  companyName: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  eventsPerYear: { type: Number, required: true, default: 500 },
});

export const CompanyInfoModel = mongoose.models.CompanyInfo || mongoose.model<CompanyInfoDocument>("CompanyInfo", companyInfoSchema);

// ==================== STAFF ====================

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  experience: string;
  imageUrl: string | null;
  salary: number;
  createdAt: string;
}

export const insertStaffSchema = z.object({
  name: z.string().min(1, "Staff name is required"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().min(1, "Phone is required"),
  experience: z.string().min(1, "Experience is required"),
  imageUrl: z.string().nullable().optional(),
  salary: z.number().int().positive("Salary must be positive"),
});

export const updateStaffSchema = insertStaffSchema.partial();

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;

export interface StaffDocument extends Document {
  name: string;
  role: string;
  phone: string;
  experience: string;
  imageUrl?: string | null;
  salary: number;
  createdAt: Date;
}

const staffSchema = new Schema<StaffDocument>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  imageUrl: { type: String, default: null },
  salary: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const StaffModel = mongoose.models.Staff || mongoose.model<StaffDocument>("Staff", staffSchema);
