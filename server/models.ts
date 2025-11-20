import mongoose, { Schema, Document } from "mongoose";

// Food Item Model
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

export const FoodItemModel = mongoose.models?.FoodItem || mongoose.model<FoodItemDocument>("FoodItem", foodItemSchema);

// Event Booking Model
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

export const EventBookingModel = mongoose.models?.EventBooking || mongoose.model<EventBookingDocument>("EventBooking", eventBookingSchema);

// Booking Item Model
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

export const BookingItemModel = mongoose.models?.BookingItem || mongoose.model<BookingItemDocument>("BookingItem", bookingItemSchema);

// Company Info Model
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

export const CompanyInfoModel = mongoose.models?.CompanyInfo || mongoose.model<CompanyInfoDocument>("CompanyInfo", companyInfoSchema);

// Staff Model
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

export const StaffModel = mongoose.models?.Staff || mongoose.model<StaffDocument>("Staff", staffSchema);
