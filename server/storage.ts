import mongoose, { Schema, Document } from "mongoose";
import { 
  type FoodItem, 
  type InsertFoodItem, 
  type EventBooking, 
  type InsertEventBooking, 
  type CompanyInfo, 
  type InsertCompanyInfo, 
  type Staff, 
  type InsertStaff, 
  type BookingItem, 
  type InsertBookingItem,
  type CustomerReview,
  type InsertCustomerReview,
  type CateringPackage,
  type InsertCateringPackage,
  type UpdateCateringPackage
} from "@shared/schema";

// ==================== MONGOOSE MODELS ====================

// Food Item Model
export interface FoodItemDocument extends Document {
  name: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  dietaryTags?: string[];
  price?: number;
  rating?: number;
}

const foodItemSchema = new Schema<FoodItemDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: null },
  dietaryTags: [{ type: String }],
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
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
  advancePaymentStatus?: string;
  finalPaymentStatus?: string;
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
  advancePaymentStatus: { type: String, default: "pending" },
  finalPaymentStatus: { type: String, default: "pending" },
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
  companyName?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  eventsPerYear?: number;
  websiteUrl?: string;
  upiId?: string;
  minAdvanceBookingDays?: number;
}

const companyInfoSchema = new Schema<CompanyInfoDocument>({
  companyName: { type: String, default: null },
  tagline: { type: String, default: null },
  description: { type: String, default: null },
  email: { type: String, default: null },
  phone: { type: String, default: null },
  address: { type: String, default: null },
  eventsPerYear: { type: Number, default: 500 },
  websiteUrl: { type: String, default: null },
  upiId: { type: String, default: null },
  minAdvanceBookingDays: { type: Number, default: 2 },
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

// Customer Review Model
export interface CustomerReviewDocument extends Document {
  customerName: string;
  eventType: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const customerReviewSchema = new Schema<CustomerReviewDocument>({
  customerName: { type: String, required: true },
  eventType: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CustomerReviewModel = mongoose.models?.CustomerReview || mongoose.model<CustomerReviewDocument>("CustomerReview", customerReviewSchema);

// Catering Package Model
export interface CateringPackageDocument extends Document {
  name: string;
  tier: "budget" | "standard" | "premium";
  description: string;
  pricePerPlate: number;
  items: string[];
  minServings: number;
  createdAt: Date;
}

const cateringPackageSchema = new Schema<CateringPackageDocument>({
  name: { type: String, required: true },
  tier: { type: String, enum: ["budget", "standard", "premium"], required: true },
  description: { type: String, required: true },
  pricePerPlate: { type: Number, required: true },
  items: [{ type: String }],
  minServings: { type: Number, required: true, default: 20 },
  createdAt: { type: Date, default: Date.now },
});

export const CateringPackageModel = mongoose.models?.CateringPackage || mongoose.model<CateringPackageDocument>("CateringPackage", cateringPackageSchema);

// ==================== STORAGE INTERFACE ====================

export interface IStorage {
  // Food Items
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: string): Promise<boolean>;

  // Event Bookings
  getBookings(): Promise<EventBooking[]>;
  getBooking(id: string): Promise<EventBooking | undefined>;
  createBooking(booking: InsertEventBooking): Promise<EventBooking>;
  updateBooking(id: string, booking: Partial<EventBooking>): Promise<EventBooking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Booking Items
  getBookingItems(bookingId: string): Promise<(BookingItem & { foodItem: FoodItem })[]>;
  createBookingItem(item: InsertBookingItem): Promise<BookingItem>;
  deleteBookingItems(bookingId: string): Promise<boolean>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | undefined>;
  createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo>;
  updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined>;

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaffMember(staff: InsertStaff): Promise<Staff>;
  updateStaffMember(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaffMember(id: string): Promise<boolean>;

  // Customer Reviews
  getReviews(): Promise<CustomerReview[]>;
  createReview(review: InsertCustomerReview): Promise<CustomerReview>;
  deleteReview(id: string): Promise<boolean>;

  // Catering Packages
  getPackages(): Promise<CateringPackage[]>;
  getPackage(id: string): Promise<CateringPackage | undefined>;
  createPackage(pkg: InsertCateringPackage): Promise<CateringPackage>;
  updatePackage(id: string, pkg: UpdateCateringPackage): Promise<CateringPackage | undefined>;
  deletePackage(id: string): Promise<boolean>;
}

// ==================== MONGODB STORAGE IMPLEMENTATION ====================

export class MongoDBStorage implements IStorage {
  private toFoodItem(doc: any): FoodItem {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      category: doc.category,
      imageUrl: doc.imageUrl || null,
      dietaryTags: doc.dietaryTags || [],
      price: doc.price || 0,
      rating: doc.rating || 0,
    };
  }

  private toEventBooking(doc: any): EventBooking {
    return {
      id: doc._id.toString(),
      clientName: doc.clientName,
      eventDate: doc.eventDate,
      eventType: doc.eventType,
      guestCount: doc.guestCount,
      pricePerPlate: doc.pricePerPlate,
      servingBoysNeeded: doc.servingBoysNeeded,
      status: doc.status,
      contactEmail: doc.contactEmail,
      contactPhone: doc.contactPhone,
      specialRequests: doc.specialRequests || null,
      advancePaymentStatus: doc.advancePaymentStatus || "pending",
      finalPaymentStatus: doc.finalPaymentStatus || "pending",
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private toBookingItem(doc: any): BookingItem {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId,
      foodItemId: doc.foodItemId,
      quantity: doc.quantity,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  private toCompanyInfo(doc: any): CompanyInfo {
    return {
      id: doc._id.toString(),
      companyName: doc.companyName,
      tagline: doc.tagline,
      description: doc.description,
      email: doc.email,
      phone: doc.phone,
      address: doc.address,
      eventsPerYear: doc.eventsPerYear,
      websiteUrl: doc.websiteUrl || undefined,
      upiId: doc.upiId || undefined,
      minAdvanceBookingDays: doc.minAdvanceBookingDays || 2,
    };
  }

  private toStaff(doc: any): Staff {
    return {
      id: doc._id.toString(),
      name: doc.name,
      role: doc.role,
      phone: doc.phone,
      experience: doc.experience,
      imageUrl: doc.imageUrl || null,
      salary: doc.salary,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  // Food Items
  async getFoodItems(): Promise<FoodItem[]> {
    const docs = await FoodItemModel.find().lean();
    return docs.map(doc => this.toFoodItem(doc));
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const doc = await FoodItemModel.findById(id).lean();
    return doc ? this.toFoodItem(doc) : undefined;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const doc = await FoodItemModel.create(item);
    return this.toFoodItem(doc);
  }

  async updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const doc = await FoodItemModel.findByIdAndUpdate(id, item, { new: true }).lean();
    return doc ? this.toFoodItem(doc) : undefined;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const result = await FoodItemModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Event Bookings
  async getBookings(): Promise<EventBooking[]> {
    const docs = await EventBookingModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(doc => this.toEventBooking(doc));
  }

  async getBooking(id: string): Promise<EventBooking | undefined> {
    const doc = await EventBookingModel.findById(id).lean();
    return doc ? this.toEventBooking(doc) : undefined;
  }

  async createBooking(booking: InsertEventBooking): Promise<EventBooking> {
    const doc = await EventBookingModel.create(booking);
    return this.toEventBooking(doc);
  }

  async updateBooking(id: string, booking: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const doc = await EventBookingModel.findByIdAndUpdate(id, booking, { new: true }).lean();
    return doc ? this.toEventBooking(doc) : undefined;
  }

  async deleteBooking(id: string): Promise<boolean> {
    await BookingItemModel.deleteMany({ bookingId: id });
    const result = await EventBookingModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Booking Items
  async getBookingItems(bookingId: string): Promise<(BookingItem & { foodItem: FoodItem })[]> {
    const docs = await BookingItemModel.find({ bookingId }).lean();
    const results: (BookingItem & { foodItem: FoodItem })[] = [];

    for (const doc of docs) {
      const foodItemDoc = await FoodItemModel.findById(doc.foodItemId).lean();
      if (foodItemDoc) {
        results.push({
          ...this.toBookingItem(doc),
          foodItem: this.toFoodItem(foodItemDoc),
        });
      }
    }

    return results;
  }

  async createBookingItem(item: InsertBookingItem): Promise<BookingItem> {
    const doc = await BookingItemModel.create(item);
    return this.toBookingItem(doc);
  }

  async deleteBookingItems(bookingId: string): Promise<boolean> {
    await BookingItemModel.deleteMany({ bookingId });
    return true;
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    const doc = await CompanyInfoModel.findOne().lean();
    return doc ? this.toCompanyInfo(doc) : undefined;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const doc = await CompanyInfoModel.create(info);
    return this.toCompanyInfo(doc);
  }

  async updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    const doc = await CompanyInfoModel.findByIdAndUpdate(id, info, { new: true }).lean();
    return doc ? this.toCompanyInfo(doc) : undefined;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const docs = await StaffModel.find().lean();
    return docs.map(doc => this.toStaff(doc));
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const doc = await StaffModel.findById(id).lean();
    return doc ? this.toStaff(doc) : undefined;
  }

  async createStaffMember(staff: InsertStaff): Promise<Staff> {
    const doc = await StaffModel.create(staff);
    return this.toStaff(doc);
  }

  async updateStaffMember(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined> {
    const doc = await StaffModel.findByIdAndUpdate(id, staff, { new: true }).lean();
    return doc ? this.toStaff(doc) : undefined;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    const result = await StaffModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Customer Reviews
  private toCustomerReview(doc: any): CustomerReview {
    return {
      id: doc._id.toString(),
      customerName: doc.customerName,
      eventType: doc.eventType,
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getReviews(): Promise<CustomerReview[]> {
    const docs = await CustomerReviewModel.find().sort({ createdAt: -1 }).lean();
    return docs.map(doc => this.toCustomerReview(doc));
  }

  async createReview(review: InsertCustomerReview): Promise<CustomerReview> {
    const doc = await CustomerReviewModel.create(review);
    return this.toCustomerReview(doc);
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await CustomerReviewModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Catering Packages
  private toCateringPackage(doc: any): CateringPackage {
    return {
      id: doc._id.toString(),
      name: doc.name,
      tier: doc.tier,
      description: doc.description,
      pricePerPlate: doc.pricePerPlate,
      items: doc.items || [],
      minServings: doc.minServings,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getPackages(): Promise<CateringPackage[]> {
    const docs = await CateringPackageModel.find().lean();
    return docs.map(doc => this.toCateringPackage(doc));
  }

  async getPackage(id: string): Promise<CateringPackage | undefined> {
    const doc = await CateringPackageModel.findById(id).lean();
    return doc ? this.toCateringPackage(doc) : undefined;
  }

  async createPackage(pkg: InsertCateringPackage): Promise<CateringPackage> {
    const doc = await CateringPackageModel.create(pkg);
    return this.toCateringPackage(doc);
  }

  async updatePackage(id: string, pkg: UpdateCateringPackage): Promise<CateringPackage | undefined> {
    const doc = await CateringPackageModel.findByIdAndUpdate(id, pkg, { new: true }).lean();
    return doc ? this.toCateringPackage(doc) : undefined;
  }

  async deletePackage(id: string): Promise<boolean> {
    const result = await CateringPackageModel.findByIdAndDelete(id);
    return result !== null;
  }
}
