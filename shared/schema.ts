import { Schema, model } from "mongoose";
import { z } from "zod";

// ==================== FOOD ITEMS ====================

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
}

const foodItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: null },
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const FoodItemModel = model("FoodItem", foodItemSchema);

export const insertFoodItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
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

const eventBookingSchema = new Schema({
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
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const EventBookingModel = model("EventBooking", eventBookingSchema);

export const insertEventBookingSchema = z.object({
  clientName: z.string().min(1),
  eventDate: z.string().min(1),
  eventType: z.string().min(1),
  guestCount: z.number().int().positive(),
  pricePerPlate: z.number().int().positive(),
  servingBoysNeeded: z.number().int().positive().default(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  specialRequests: z.string().nullable().optional(),
});

export const updateEventBookingSchema = insertEventBookingSchema.partial().extend({
  status: z.string().optional(),
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

const bookingItemSchema = new Schema({
  bookingId: { type: String, required: true, ref: "EventBooking" },
  foodItemId: { type: String, required: true, ref: "FoodItem" },
  quantity: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const BookingItemModel = model("BookingItem", bookingItemSchema);

export const insertBookingItemSchema = z.object({
  bookingId: z.string().min(1),
  foodItemId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
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
}

const companyInfoSchema = new Schema({
  companyName: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  eventsPerYear: { type: Number, required: true, default: 500 },
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const CompanyInfoModel = model("CompanyInfo", companyInfoSchema);

export const insertCompanyInfoSchema = z.object({
  companyName: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  eventsPerYear: z.number().int().positive().default(500),
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

const staffSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String, required: true },
  imageUrl: { type: String, default: null },
  salary: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      ret.createdAt = ret.createdAt.toISOString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const StaffModel = model("Staff", staffSchema);

export const insertStaffSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().min(1),
  experience: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  salary: z.number().int().positive(),
});

export const updateStaffSchema = insertStaffSchema.partial();

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
