import { z } from "zod";

// ==================== VALIDATION HELPERS ====================

const sanitizeString = (val) => val.trim().slice(0, 500);
const sanitizeName = (val) => val.trim().slice(0, 100);
const sanitizePhone = (val) => val.replace(/\D/g, "").slice(0, 15);

// ==================== FOOD ITEMS ====================

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
  type: z.enum(["Veg", "Non-Veg"], { required_error: "Type (Veg/Non-Veg) is required" }),
  imageUrl: z.string().url("Invalid image URL").or(z.string().length(0)).optional().nullable(),
  dietaryTags: z.array(z.string()).optional(),
  price: z.number().int().min(1, "Price must be at least 1").optional(),
});

// ==================== EVENT BOOKINGS ====================

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
  totalAmount: z.number().int().optional(),
  advanceAmount: z.number().int().optional(),
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

// ==================== BOOKING ITEMS ====================

export const insertBookingItemSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  foodItemId: z.string().min(1, "Food item ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
});

// ==================== COMPANY INFO ====================

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
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  logoUrl: z.string().min(1, "Logo URL is required").or(z.string().length(0)).optional().nullable(),
});

// ==================== STAFF ====================

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

// ==================== CUSTOMER REVIEWS ====================

export const insertCustomerReviewSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  eventType: z.string().min(1, "Event type is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export const updateCustomerReviewSchema = insertCustomerReviewSchema.partial();

// ==================== ADMIN NOTIFICATIONS ====================

export const insertAdminNotificationSchema = z.object({
  type: z.enum(["booking", "payment"]),
  title: z.string().min(1),
  message: z.string().min(1),
  bookingId: z.string().optional(),
  read: z.boolean().default(false),
});

// ==================== STAFF BOOKING REQUESTS ====================

export const insertStaffBookingRequestSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
  token: z.string().min(1, "Token is required"),
});

export const updateStaffBookingRequestSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
});

// ==================== AUDIT HISTORY ====================

export const insertAuditHistorySchema = z.object({
  action: z.string().min(1, "Action is required"),
  entityType: z.enum(["booking", "staff", "payment", "assignment"]),
  entityId: z.string().min(1, "Entity ID is required"),
  details: z.record(z.unknown()).default({}),
});

// ==================== USER CODES ====================

export const insertUserCodeSchema = z.object({
  code: z.string().min(4, "Code must be at least 4 characters").max(20),
  isUsed: z.boolean().default(false),
  expiresAt: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    "Invalid expiration date"
  ),
  notes: z.string().max(200).optional(),
});

export const insertCodeRequestSchema = z.object({
  customerName: z.string().min(1, "Name is required").max(100).transform(sanitizeName),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Phone number required").transform(sanitizePhone),
  eventDetails: z.string().max(1000).optional(),
  status: z.enum(["pending", "granted", "rejected"]).default("pending"),
});
