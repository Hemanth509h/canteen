import { z } from "zod";

// ==================== VALIDATION HELPERS ====================

const sanitizeString = (val: string) => val.trim().slice(0, 500);
const sanitizeName = (val: string) => val.trim().slice(0, 100);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 15);

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
  name: z.string()
    .min(1, "Food item name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeName),
  description: z.string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .transform(sanitizeString),
  category: z.string().min(1, "Category is required").max(50),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  dietaryTags: z.array(z.string()).optional(),
  price: z.number().int().min(1, "Price must be at least 1").optional(),
  rating: z.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
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
  advancePaymentScreenshot?: string | null;
  finalPaymentScreenshot?: string | null;
  totalAmount?: number;
  createdAt: string;
}

export const insertEventBookingSchema = z.object({
  clientName: z.string()
    .min(1, "Client name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeName),
  eventDate: z.string().min(1, "Event date is required").refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  eventType: z.string().min(1, "Event type is required").max(50),
  guestCount: z.number().int().min(1, "At least 1 guest is required").max(10000, "Guest count too large"),
  pricePerPlate: z.number().int().min(1, "Price must be at least 1").max(100000),
  servingBoysNeeded: z.number().int().min(1, "At least 1 serving staff needed").max(100).default(2),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits").transform(sanitizePhone),
  specialRequests: z.string().max(1000, "Special requests must be less than 1000 characters").nullable().optional(),
});

export const updateEventBookingSchema = insertEventBookingSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  advancePaymentStatus: z.enum(["pending", "paid"]).optional(),
  finalPaymentStatus: z.enum(["pending", "paid"]).optional(),
  advancePaymentScreenshot: z.string().nullable().optional(),
  finalPaymentScreenshot: z.string().nullable().optional(),
  totalAmount: z.number().int().positive().optional(),
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
  companyName: z.string().max(100, "Company name too long").optional(),
  tagline: z.string().max(200, "Tagline too long").optional(),
  description: z.string().max(2000, "Description too long").optional(),
  email: z.string().email("Please enter a valid company email").optional(),
  phone: z.string().refine((val) => val.replace(/\D/g, "").length >= 10, "Phone must have at least 10 digits").transform(sanitizePhone).optional(),
  address: z.string().max(500, "Address too long").optional(),
  eventsPerYear: z.number().int().min(0).max(100000).default(500).optional(),
  websiteUrl: z.string().url("Please enter a valid website URL").optional(),
  upiId: z.string().regex(/^[\w\-@.]+$/, "Invalid UPI ID format").optional(),
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
  name: z.string()
    .min(1, "Staff name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .transform(sanitizeName),
  role: z.string().min(1, "Role is required").max(50),
  phone: z.string().min(10, "Phone must be at least 10 digits").transform(sanitizePhone),
  experience: z.string().min(5, "Experience description must be at least 5 characters").max(500),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  salary: z.number().int().min(0, "Salary cannot be negative").max(10000000),
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

// ==================== STAFF BOOKING REQUESTS ====================

export interface StaffBookingRequest {
  id: string;
  bookingId: string;
  staffId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export const insertStaffBookingRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
});

export const updateStaffBookingRequestSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});

export type InsertStaffBookingRequest = z.infer<typeof insertStaffBookingRequestSchema>;
export type UpdateStaffBookingRequest = z.infer<typeof updateStaffBookingRequestSchema>;
