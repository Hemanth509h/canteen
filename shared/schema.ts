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
  websiteUrl?: string;
}

export const insertCompanyInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  eventsPerYear: z.number().int().positive().default(500),
  websiteUrl: z.string().url("Valid URL is required").optional(),
});

export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;

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

// ==================== CUSTOMER REVIEWS ====================

export interface CustomerReview {
  id: string;
  customerName: string;
  eventType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const insertCustomerReviewSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  eventType: z.string().min(1, "Event type is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;
