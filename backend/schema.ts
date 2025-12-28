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
  advancePaymentApprovalStatus?: "pending" | "approved" | "rejected";
  finalPaymentApprovalStatus?: "pending" | "approved" | "rejected";
  advancePaymentScreenshot?: string | null;
  finalPaymentScreenshot?: string | null;
  totalAmount?: number;
  advanceAmount?: number;
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
  pricePerPlate: z.number().int().min(0, "Price must be non-negative").max(100000),
  servingBoysNeeded: z.number().int().min(0, "Serving staff cannot be negative").max(100).default(2),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits").transform(sanitizePhone),
  specialRequests: z.string().max(1000, "Special requests must be less than 1000 characters").nullable().optional(),
});

export const updateEventBookingSchema = insertEventBookingSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  advancePaymentStatus: z.enum(["pending", "paid"]).optional(),
  finalPaymentStatus: z.enum(["pending", "paid"]).optional(),
  advancePaymentApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  finalPaymentApprovalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  advancePaymentScreenshot: z.string().nullable().optional(),
  finalPaymentScreenshot: z.string().nullable().optional(),
  totalAmount: z.number().int().positive().optional(),
  advanceAmount: z.number().int().positive().optional(),
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
  yearsExperience?: number;
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
  yearsExperience: z.number().int().min(0).max(100).default(15).optional(),
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

export const updateCustomerReviewSchema = insertCustomerReviewSchema.partial();

export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;
export type UpdateCustomerReview = z.infer<typeof updateCustomerReviewSchema>;

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
  token: string;
  createdAt: string;
}

export const insertStaffBookingRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  token: z.string().min(1, "Token is required"),
});

export const updateStaffBookingRequestSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});

export type InsertStaffBookingRequest = z.infer<typeof insertStaffBookingRequestSchema>;
export type UpdateStaffBookingRequest = z.infer<typeof updateStaffBookingRequestSchema>;

// ==================== AUDIT HISTORY ====================

export interface AuditHistory {
  id: string;
  action: string;
  entityType: "booking" | "staff" | "payment" | "assignment";
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export const insertAuditHistorySchema = z.object({
  action: z.string().min(1, "Action is required"),
  entityType: z.enum(["booking", "staff", "payment", "assignment"]),
  entityId: z.string().min(1, "Entity ID is required"),
  details: z.record(z.unknown()).default({}),
});

export type InsertAuditHistory = z.infer<typeof insertAuditHistorySchema>;
