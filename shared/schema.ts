import { z } from "zod";

// ==================== FOOD ITEMS ====================

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  dietaryTags?: string[];
  price?: number;
  rating?: number;
}

export const insertFoodItemSchema = z.object({
  name: z.string().min(1, "Food item name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().nullable().optional(),
  dietaryTags: z.array(z.string()).optional(),
  price: z.number().int().positive("Price must be positive").optional(),
  rating: z.number().min(0).max(5, "Rating must be between 0-5").optional(),
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
  advancePaymentStatus: string;
  finalPaymentStatus: string;
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
  advancePaymentStatus: z.enum(["pending", "paid"]).optional(),
  finalPaymentStatus: z.enum(["pending", "paid"]).optional(),
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
  upiId?: string;
  minAdvanceBookingDays?: number;
}

export const insertCompanyInfoSchema = z.object({
  companyName: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Valid email is required").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  eventsPerYear: z.number().int().positive().default(500).optional(),
  websiteUrl: z.string().url("Valid URL is required").optional(),
  upiId: z.string().optional(),
  minAdvanceBookingDays: z.number().int().min(0).max(30).default(2).optional(),
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

// ==================== CATERING PACKAGES ====================

export interface CateringPackage {
  id: string;
  name: string;
  tier: "budget" | "standard" | "premium";
  description: string;
  pricePerPlate: number;
  items: string[];
  minServings: number;
  createdAt: string;
}

export const insertCateringPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  tier: z.enum(["budget", "standard", "premium"]),
  description: z.string().min(1, "Description is required"),
  pricePerPlate: z.number().int().positive("Price per plate must be positive"),
  items: z.array(z.string()).min(1, "Package must include at least one item"),
  minServings: z.number().int().positive("Minimum servings must be positive").default(20),
});

export const updateCateringPackageSchema = insertCateringPackageSchema.partial();

export type InsertCateringPackage = z.infer<typeof insertCateringPackageSchema>;
export type UpdateCateringPackage = z.infer<typeof updateCateringPackageSchema>;

// ==================== ADMIN NOTIFICATIONS ====================

export interface AdminNotification {
  id: string;
  type: "booking" | "payment";
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export const insertAdminNotificationSchema = z.object({
  type: z.enum(["booking", "payment"]),
  title: z.string().min(1),
  message: z.string().min(1),
  bookingId: z.string().optional(),
  read: z.boolean().default(false),
});

export type InsertAdminNotification = z.infer<typeof insertAdminNotificationSchema>;
