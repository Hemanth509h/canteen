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
  type AdminNotification,
  type InsertAdminNotification,
  type StaffBookingRequest,
  type InsertStaffBookingRequest,
  type UpdateStaffBookingRequest,
  type AuditHistory,
  type InsertAuditHistory
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
  advancePaymentApprovalStatus?: "pending" | "approved" | "rejected";
  finalPaymentApprovalStatus?: "pending" | "approved" | "rejected";
  advancePaymentScreenshot?: string | null;
  finalPaymentScreenshot?: string | null;
  totalAmount?: number | null;
  advanceAmount?: number | null;
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
  advancePaymentApprovalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: undefined },
  finalPaymentApprovalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: undefined },
  advancePaymentScreenshot: { type: String, default: null },
  finalPaymentScreenshot: { type: String, default: null },
  totalAmount: { type: Number, default: null },
  advanceAmount: { type: Number, default: null },
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
  createdAt: Date;
}

const staffSchema = new Schema<StaffDocument>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
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

// Admin Notification Model
export interface AdminNotificationDocument extends Document {
  type: "booking" | "payment";
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: Date;
}

const adminNotificationSchema = new Schema<AdminNotificationDocument>({
  type: { type: String, enum: ["booking", "payment"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingId: { type: String, required: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const AdminNotificationModel = mongoose.models?.AdminNotification || mongoose.model<AdminNotificationDocument>("AdminNotification", adminNotificationSchema);

// Staff Booking Request Model
export interface StaffBookingRequestDocument extends Document {
  bookingId: string;
  staffId: string;
  status: "pending" | "accepted" | "rejected";
  token: string;
  createdAt: Date;
}

const staffBookingRequestSchema = new Schema<StaffBookingRequestDocument>({
  bookingId: { type: String, required: true },
  staffId: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const StaffBookingRequestModel = mongoose.models?.StaffBookingRequest || mongoose.model<StaffBookingRequestDocument>("StaffBookingRequest", staffBookingRequestSchema);

// Audit History Model
export interface AuditHistoryDocument extends Document {
  action: string;
  entityType: "booking" | "staff" | "payment" | "assignment";
  entityId: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

const auditHistorySchema = new Schema<AuditHistoryDocument>({
  action: { type: String, required: true },
  entityType: { type: String, enum: ["booking", "staff", "payment", "assignment"], required: true },
  entityId: { type: String, required: true },
  details: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export const AuditHistoryModel = mongoose.models?.AuditHistory || mongoose.model<AuditHistoryDocument>("AuditHistory", auditHistorySchema);

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
  getPackages(): Promise<any[]>;
  getPackage(id: string): Promise<any | undefined>;
  createPackage(pkg: any): Promise<any>;
  updatePackage(id: string, pkg: any): Promise<any | undefined>;
  deletePackage(id: string): Promise<boolean>;

  // Admin Notifications
  getNotifications(): Promise<AdminNotification[]>;
  createNotification(notification: InsertAdminNotification): Promise<AdminNotification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;

  // Audit History
  getAuditHistory(entityType?: string, entityId?: string): Promise<AuditHistory[]>;
  createAuditHistory(history: InsertAuditHistory): Promise<AuditHistory>;
  deleteAuditHistory(id: string): Promise<boolean>;

  // Staff Booking Requests
  getStaffBookingRequests(bookingId: string): Promise<StaffBookingRequest[]>;
  getStaffBookingRequestByToken(token: string): Promise<StaffBookingRequest | undefined>;
  createStaffBookingRequest(request: InsertStaffBookingRequest): Promise<StaffBookingRequest>;
  updateStaffBookingRequest(id: string, request: UpdateStaffBookingRequest): Promise<StaffBookingRequest | undefined>;
  getAcceptedStaffForBooking(bookingId: string): Promise<Staff[]>;
  deleteStaffBookingRequest(bookingId: string, staffId: string): Promise<boolean>;
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
      advancePaymentApprovalStatus: doc.advancePaymentApprovalStatus || undefined,
      finalPaymentApprovalStatus: doc.finalPaymentApprovalStatus || undefined,
      advancePaymentScreenshot: doc.advancePaymentScreenshot || null,
      finalPaymentScreenshot: doc.finalPaymentScreenshot || null,
      totalAmount: doc.totalAmount || undefined,
      advanceAmount: doc.advanceAmount || undefined,
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
    const result = this.toEventBooking(doc);
    await this.createAuditHistory({
      action: "booking_created",
      entityType: "booking",
      entityId: result.id,
      details: { clientName: booking.clientName, eventType: booking.eventType, guestCount: booking.guestCount, eventDate: booking.eventDate },
    });
    return result;
  }

  async updateBooking(id: string, booking: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const doc = await EventBookingModel.findByIdAndUpdate(id, booking, { new: true }).lean();
    if (doc) {
      const result = this.toEventBooking(doc);
      await this.createAuditHistory({
        action: "booking_updated",
        entityType: "booking",
        entityId: id,
        details: { changes: booking, status: booking.status, advancePaymentStatus: booking.advancePaymentStatus, finalPaymentStatus: booking.finalPaymentStatus },
      });
      return result;
    }
    return undefined;
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
    try {
      const doc = await StaffModel.findById(id).lean();
      return doc ? this.toStaff(doc) : undefined;
    } catch (error) {
      console.error(`Error fetching staff member ${id}:`, error);
      return undefined;
    }
  }

  async createStaffMember(staff: InsertStaff): Promise<Staff> {
    const doc = await StaffModel.create(staff);
    const result = this.toStaff(doc);
    await this.createAuditHistory({
      action: "staff_created",
      entityType: "staff",
      entityId: result.id,
      details: { name: staff.name, role: staff.role, phone: staff.phone },
    });
    return result;
  }

  async updateStaffMember(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined> {
    const doc = await StaffModel.findByIdAndUpdate(id, staff, { new: true }).lean() as any;
    if (doc) {
      const result = this.toStaff(doc);
      await this.createAuditHistory({
        action: "staff_updated",
        entityType: "staff",
        entityId: id,
        details: { changes: staff, name: doc.name, role: doc.role },
      });
      return result;
    }
    return undefined;
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

  // Catering Packages - Stubs
  async getPackages(): Promise<any[]> { return []; }
  async getPackage(id: string): Promise<any | undefined> { return undefined; }
  async createPackage(pkg: any): Promise<any> { return pkg; }
  async updatePackage(id: string, pkg: any): Promise<any | undefined> { return undefined; }
  async deletePackage(id: string): Promise<boolean> { return false; }

  // Admin Notifications
  private toAdminNotification(doc: any): AdminNotification {
    return {
      id: doc._id.toString(),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      bookingId: doc.bookingId,
      read: doc.read,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getNotifications(): Promise<AdminNotification[]> {
    const docs = await AdminNotificationModel.find().sort({ createdAt: -1 }).limit(50).lean();
    return docs.map(doc => this.toAdminNotification(doc));
  }

  async createNotification(notification: InsertAdminNotification): Promise<AdminNotification> {
    const doc = await AdminNotificationModel.create(notification);
    return this.toAdminNotification(doc);
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const result = await AdminNotificationModel.findByIdAndUpdate(id, { read: true });
    return result !== null;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await AdminNotificationModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Staff Booking Requests
  private toStaffBookingRequest(doc: any): StaffBookingRequest {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId,
      staffId: doc.staffId,
      status: doc.status,
      token: doc.token,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getStaffBookingRequests(bookingId: string): Promise<StaffBookingRequest[]> {
    const docs = await StaffBookingRequestModel.find({ bookingId }).lean();
    return docs.map(doc => this.toStaffBookingRequest(doc));
  }

  async getStaffBookingRequestByToken(token: string): Promise<StaffBookingRequest | undefined> {
    const doc = await StaffBookingRequestModel.findOne({ token }).lean();
    return doc ? this.toStaffBookingRequest(doc) : undefined;
  }

  async createStaffBookingRequest(request: InsertStaffBookingRequest): Promise<StaffBookingRequest> {
    const doc = await StaffBookingRequestModel.create(request);
    const result = this.toStaffBookingRequest(doc);
    await this.createAuditHistory({
      action: "assignment_created",
      entityType: "assignment",
      entityId: result.id,
      details: { bookingId: request.bookingId, staffId: request.staffId, token: request.token },
    });
    return result;
  }

  async updateStaffBookingRequest(id: string, request: UpdateStaffBookingRequest): Promise<StaffBookingRequest | undefined> {
    try {
      const doc = await StaffBookingRequestModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id), 
        { $set: { status: request.status } }, 
        { new: true }
      ).lean() as any;
      if (doc) {
        const result = this.toStaffBookingRequest(doc);
        await this.createAuditHistory({
          action: "assignment_updated",
          entityType: "assignment",
          entityId: id,
          details: { oldStatus: doc.status, newStatus: request.status, bookingId: doc.bookingId, staffId: doc.staffId },
        });
        return result;
      }
      return undefined;
    } catch (err) {
      console.error("updateStaffBookingRequest error:", err, "ID:", id);
      return undefined;
    }
  }

  async getAcceptedStaffForBooking(bookingId: string): Promise<Staff[]> {
    const requests = await StaffBookingRequestModel.find({ bookingId, status: "accepted" }).lean();
    const staffIds = requests.map(r => r.staffId);
    const staffDocs = await StaffModel.find({ _id: { $in: staffIds } }).lean();
    return staffDocs.map(doc => this.toStaff(doc));
  }

  async deleteStaffBookingRequest(bookingId: string, staffId: string): Promise<boolean> {
    const result = await StaffBookingRequestModel.findOneAndDelete({ bookingId, staffId }) as any;
    if (result) {
      const booking = await EventBookingModel.findById(bookingId).lean() as any;
      const staff = await StaffModel.findById(staffId).lean() as any;
      await this.createAuditHistory({
        action: "assignment_deleted",
        entityType: "assignment",
        entityId: result._id.toString(),
        details: { 
          bookingId, 
          staffId,
          clientName: booking?.clientName || "Unknown",
          eventType: booking?.eventType || "Unknown",
          eventDate: booking?.eventDate || "Unknown",
          name: staff?.name || "Unknown",
          role: staff?.role || "Unknown",
        },
      });
    }
    return result !== null;
  }

  // Audit History
  async createAuditHistory(history: InsertAuditHistory): Promise<AuditHistory> {
    const doc = await AuditHistoryModel.create({
      ...history,
      createdAt: new Date(),
    });
    return {
      id: doc._id.toString(),
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      details: doc.details || {},
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getAuditHistory(entityType?: string, entityId?: string): Promise<AuditHistory[]> {
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    const docs = await AuditHistoryModel.find(query).sort({ createdAt: -1 }).limit(100).lean() as any[];
    return docs.map(doc => ({
      id: doc._id.toString(),
      action: doc.action,
      entityType: doc.entityType,
      entityId: doc.entityId,
      details: doc.details || {},
      createdAt: doc.createdAt.toISOString(),
    }));
  }

  async deleteAuditHistory(id: string): Promise<boolean> {
    const result = await AuditHistoryModel.findByIdAndDelete(id);
    return result !== null;
  }
}
