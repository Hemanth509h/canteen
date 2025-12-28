import { randomUUID } from "crypto";
import type {
  FoodItem,
  InsertFoodItem,
  EventBooking,
  InsertEventBooking,
  UpdateEventBooking,
  CompanyInfo,
  InsertCompanyInfo,
  Staff,
  InsertStaff,
  UpdateStaff,
  BookingItem,
  InsertBookingItem,
  CustomerReview,
  InsertCustomerReview,
  UpdateCustomerReview,
  AdminNotification,
  InsertAdminNotification,
  StaffBookingRequest,
  InsertStaffBookingRequest,
  UpdateStaffBookingRequest,
  AuditHistory,
  InsertAuditHistory,
} from "./schema";

export interface IStorage {
  // Food Items
  getFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | null>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | null>;
  deleteFoodItem(id: string): Promise<boolean>;

  // Event Bookings
  getBookings(): Promise<EventBooking[]>;
  getBooking(id: string): Promise<EventBooking | null>;
  createBooking(booking: InsertEventBooking): Promise<EventBooking>;
  updateBooking(id: string, booking: UpdateEventBooking): Promise<EventBooking | null>;
  deleteBooking(id: string): Promise<boolean>;

  // Booking Items
  getBookingItems(bookingId: string): Promise<BookingItem[]>;
  createBookingItem(item: InsertBookingItem): Promise<BookingItem>;
  deleteBookingItems(bookingId: string): Promise<void>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | null>;
  createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo>;
  updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | null>;

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | null>;
  createStaffMember(staff: InsertStaff): Promise<Staff>;
  updateStaffMember(id: string, staff: UpdateStaff): Promise<Staff | null>;
  deleteStaffMember(id: string): Promise<boolean>;

  // Reviews
  getReviews(): Promise<CustomerReview[]>;
  createReview(review: InsertCustomerReview): Promise<CustomerReview>;
  updateReview(id: string, review: UpdateCustomerReview): Promise<CustomerReview | null>;
  deleteReview(id: string): Promise<boolean>;

  // Notifications
  getNotifications(): Promise<AdminNotification[]>;
  createNotification(notification: InsertAdminNotification): Promise<AdminNotification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;

  // Staff Requests
  getStaffBookingRequests(bookingId: string): Promise<StaffBookingRequest[]>;
  createStaffBookingRequest(request: InsertStaffBookingRequest): Promise<StaffBookingRequest>;
  updateStaffBookingRequest(id: string, request: UpdateStaffBookingRequest): Promise<StaffBookingRequest | null>;
  deleteStaffBookingRequest(bookingId: string, staffId: string): Promise<boolean>;
  getStaffBookingRequestByToken(token: string): Promise<StaffBookingRequest | null>;
  getAcceptedStaffForBooking(bookingId: string): Promise<Staff[]>;

  // Audit History
  getAuditHistory(entityType?: string, entityId?: string): Promise<AuditHistory[]>;
  createAuditHistory(log: InsertAuditHistory): Promise<AuditHistory>;
  deleteAuditHistory(id: string): Promise<boolean>;
}

export class MemoryStorage implements IStorage {
  private foodItems: Map<string, FoodItem> = new Map();
  private eventBookings: Map<string, EventBooking> = new Map();
  private bookingItems: Map<string, BookingItem> = new Map();
  private companyInfo: Map<string, CompanyInfo> = new Map();
  private staff: Map<string, Staff> = new Map();
  private reviews: Map<string, CustomerReview> = new Map();
  private notifications: Map<string, AdminNotification> = new Map();
  private staffRequests: Map<string, StaffBookingRequest> = new Map();
  private auditHistory: Map<string, AuditHistory> = new Map();

  private generateId(): string {
    return randomUUID();
  }

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: string): Promise<FoodItem | null> {
    return this.foodItems.get(id) || null;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const id = this.generateId();
    const newItem: FoodItem = { 
      id, 
      ...item,
      imageUrl: item.imageUrl ?? null
    };
    this.foodItems.set(id, newItem);
    return newItem;
  }

  async updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | null> {
    const existing = this.foodItems.get(id);
    if (!existing) return null;
    const updated = { 
      ...existing, 
      ...item,
      imageUrl: item.imageUrl !== undefined ? (item.imageUrl ?? null) : existing.imageUrl
    };
    this.foodItems.set(id, updated);
    return updated;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  async getBookings(): Promise<EventBooking[]> {
    return Array.from(this.eventBookings.values());
  }

  async getBooking(id: string): Promise<EventBooking | null> {
    return this.eventBookings.get(id) || null;
  }

  async createBooking(booking: InsertEventBooking): Promise<EventBooking> {
    const id = this.generateId();
    const newBooking: EventBooking = {
      id,
      ...booking,
      status: "pending",
      advancePaymentStatus: "pending",
      finalPaymentStatus: "pending",
      advancePaymentApprovalStatus: "pending",
      finalPaymentApprovalStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    this.eventBookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: string, booking: UpdateEventBooking): Promise<EventBooking | null> {
    const existing = this.eventBookings.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...booking };
    this.eventBookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.eventBookings.delete(id);
  }

  async getBookingItems(bookingId: string): Promise<BookingItem[]> {
    return Array.from(this.bookingItems.values()).filter(item => item.bookingId === bookingId);
  }

  async createBookingItem(item: InsertBookingItem): Promise<BookingItem> {
    const id = this.generateId();
    const newItem: BookingItem = {
      id,
      ...item,
      createdAt: new Date().toISOString(),
    };
    this.bookingItems.set(id, newItem);
    return newItem;
  }

  async deleteBookingItems(bookingId: string): Promise<void> {
    const items = Array.from(this.bookingItems.values()).filter(item => item.bookingId === bookingId);
    for (const item of items) {
      this.bookingItems.delete(item.id);
    }
  }

  async getCompanyInfo(): Promise<CompanyInfo | null> {
    const values = Array.from(this.companyInfo.values());
    return values.length > 0 ? values[0] : null;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const id = "company-default";
    const newInfo: CompanyInfo = {
      id,
      companyName: info.companyName || "",
      tagline: info.tagline || "",
      description: info.description || "",
      email: info.email || "",
      phone: info.phone || "",
      address: info.address || "",
      eventsPerYear: info.eventsPerYear || 0,
      ...info,
    };
    this.companyInfo.set(id, newInfo);
    return newInfo;
  }

  async updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | null> {
    const existing = await this.getCompanyInfo();
    const updatedInfo = { ...(existing || {}), ...info } as InsertCompanyInfo;
    return this.createCompanyInfo(updatedInfo);
  }

  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id: string): Promise<Staff | null> {
    return this.staff.get(id) || null;
  }

  async createStaffMember(staff: InsertStaff): Promise<Staff> {
    const id = this.generateId();
    const newStaff: Staff = {
      id,
      ...staff,
      createdAt: new Date().toISOString(),
    };
    this.staff.set(id, newStaff);
    return newStaff;
  }

  async updateStaffMember(id: string, staff: UpdateStaff): Promise<Staff | null> {
    const existing = this.staff.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...staff };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }

  async getReviews(): Promise<CustomerReview[]> {
    return Array.from(this.reviews.values());
  }

  async createReview(review: InsertCustomerReview): Promise<CustomerReview> {
    const id = this.generateId();
    const newReview: CustomerReview = {
      id,
      ...review,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id: string, review: UpdateCustomerReview): Promise<CustomerReview | null> {
    const existing = this.reviews.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...review };
    this.reviews.set(id, updated);
    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getNotifications(): Promise<AdminNotification[]> {
    return Array.from(this.notifications.values());
  }

  async createNotification(notification: InsertAdminNotification): Promise<AdminNotification> {
    const id = this.generateId();
    const newNotification: AdminNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const existing = this.notifications.get(id);
    if (!existing) return false;
    this.notifications.set(id, { ...existing, read: true });
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getStaffBookingRequests(bookingId: string): Promise<StaffBookingRequest[]> {
    return Array.from(this.staffRequests.values()).filter(r => r.bookingId === bookingId);
  }

  async createStaffBookingRequest(request: InsertStaffBookingRequest): Promise<StaffBookingRequest> {
    const id = this.generateId();
    const newRequest: StaffBookingRequest = {
      id,
      ...request,
      createdAt: new Date().toISOString(),
    };
    this.staffRequests.set(id, newRequest);
    return newRequest;
  }

  async updateStaffBookingRequest(id: string, request: UpdateStaffBookingRequest): Promise<StaffBookingRequest | null> {
    const existing = this.staffRequests.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...request };
    this.staffRequests.set(id, updated);
    return updated;
  }

  async deleteStaffBookingRequest(bookingId: string, staffId: string): Promise<boolean> {
    const request = Array.from(this.staffRequests.values()).find(r => r.bookingId === bookingId && r.staffId === staffId);
    if (request) {
      return this.staffRequests.delete(request.id);
    }
    return false;
  }

  async getStaffBookingRequestByToken(token: string): Promise<StaffBookingRequest | null> {
    return Array.from(this.staffRequests.values()).find(r => r.token === token) || null;
  }

  async getAcceptedStaffForBooking(bookingId: string): Promise<Staff[]> {
    const requests = Array.from(this.staffRequests.values()).filter(r => r.bookingId === bookingId && r.status === "accepted");
    const staffIds = requests.map(r => r.staffId);
    return Array.from(this.staff.values()).filter(s => staffIds.includes(s.id));
  }

  async getAuditHistory(entityType?: string, entityId?: string): Promise<AuditHistory[]> {
    let logs = Array.from(this.auditHistory.values());
    if (entityType) logs = logs.filter(l => l.entityType === entityType);
    if (entityId) logs = logs.filter(l => l.entityId === entityId);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAuditHistory(log: InsertAuditHistory): Promise<AuditHistory> {
    const id = this.generateId();
    const newLog: AuditHistory = {
      id,
      ...log,
      createdAt: new Date().toISOString(),
    };
    this.auditHistory.set(id, newLog);
    return newLog;
  }

  async deleteAuditHistory(id: string): Promise<boolean> {
    return this.auditHistory.delete(id);
  }
}

export const storage = new MemoryStorage();