import { randomUUID } from "crypto";

export class MemoryStorage {
  constructor() {
    this.foodItems = new Map();
    this.eventBookings = new Map();
    this.bookingItems = new Map();
    this.companyInfo = new Map();
    this.staff = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.staffRequests = new Map();
    this.auditHistory = new Map();
  }

  generateId() {
    return randomUUID();
  }

  async getFoodItems() {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id) {
    return this.foodItems.get(id) || null;
  }

  async createFoodItem(item) {
    const id = this.generateId();
    const newItem = { 
      id, 
      ...item,
      imageUrl: item.imageUrl ?? null
    };
    this.foodItems.set(id, newItem);
    return newItem;
  }

  async updateFoodItem(id, item) {
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

  async deleteFoodItem(id) {
    return this.foodItems.delete(id);
  }

  async getBookings() {
    return Array.from(this.eventBookings.values());
  }

  async getBooking(id) {
    const booking = this.eventBookings.get(id);
    if (!booking) return null;
    
    // Ensure all numeric fields are properly parsed and calculated
    const guestCount = parseInt(booking.guestCount) || 0;
    const pricePerPlate = parseInt(booking.pricePerPlate) || 0;
    const totalAmount = parseInt(booking.totalAmount) || (guestCount * pricePerPlate);
    const advanceAmount = parseInt(booking.advanceAmount) || Math.round(totalAmount * 0.5);

    return {
      ...booking,
      guestCount,
      pricePerPlate,
      totalAmount,
      advanceAmount
    };
  }

  async createBooking(booking) {
    const id = this.generateId();
    const guestCount = parseInt(booking.guestCount) || 0;
    const pricePerPlate = parseInt(booking.pricePerPlate) || 0;
    const totalAmount = parseInt(booking.totalAmount) || (guestCount * pricePerPlate);
    const advanceAmount = parseInt(booking.advanceAmount) || Math.round(totalAmount * 0.5);

    const newBooking = {
      id,
      ...booking,
      guestCount,
      pricePerPlate,
      totalAmount,
      advanceAmount,
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

  async updateBooking(id, booking) {
    const existing = this.eventBookings.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...booking };
    this.eventBookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id) {
    return this.eventBookings.delete(id);
  }

  async getBookingItems(bookingId) {
    return Array.from(this.bookingItems.values()).filter(item => item.bookingId === bookingId);
  }

  async createBookingItem(item) {
    const id = this.generateId();
    const newItem = {
      id,
      ...item,
      createdAt: new Date().toISOString(),
    };
    this.bookingItems.set(id, newItem);
    return newItem;
  }

  async deleteBookingItems(bookingId) {
    const items = Array.from(this.bookingItems.values()).filter(item => item.bookingId === bookingId);
    for (const item of items) {
      this.bookingItems.delete(item.id);
    }
  }

  async getCompanyInfo() {
    const values = Array.from(this.companyInfo.values());
    return values.length > 0 ? values[0] : null;
  }

  async createCompanyInfo(info) {
    const id = "company-default";
    const newInfo = {
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

  async updateCompanyInfo(id, info) {
    const existing = await this.getCompanyInfo();
    const updatedInfo = { ...(existing || {}), ...info };
    return this.createCompanyInfo(updatedInfo);
  }

  async getStaff() {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id) {
    return this.staff.get(id) || null;
  }

  async createStaffMember(staff) {
    const id = this.generateId();
    const newStaff = {
      id,
      ...staff,
      createdAt: new Date().toISOString(),
    };
    this.staff.set(id, newStaff);
    return newStaff;
  }

  async updateStaffMember(id, staff) {
    const existing = this.staff.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...staff };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaffMember(id) {
    return this.staff.delete(id);
  }

  async getReviews() {
    return Array.from(this.reviews.values());
  }

  async createReview(review) {
    const id = this.generateId();
    const newReview = {
      id,
      ...review,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async updateReview(id, review) {
    const existing = this.reviews.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...review };
    this.reviews.set(id, updated);
    return updated;
  }

  async deleteReview(id) {
    return this.reviews.delete(id);
  }

  async getNotifications() {
    return Array.from(this.notifications.values());
  }

  async createNotification(notification) {
    const id = this.generateId();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id) {
    const existing = this.notifications.get(id);
    if (!existing) return false;
    this.notifications.set(id, { ...existing, read: true });
    return true;
  }

  async deleteNotification(id) {
    return this.notifications.delete(id);
  }

  async getStaffBookingRequests(bookingId) {
    return Array.from(this.staffRequests.values()).filter(r => r.bookingId === bookingId);
  }

  async createStaffBookingRequest(request) {
    const id = this.generateId();
    const newRequest = {
      id,
      ...request,
      createdAt: new Date().toISOString(),
    };
    this.staffRequests.set(id, newRequest);
    return newRequest;
  }

  async updateStaffBookingRequest(id, request) {
    const existing = this.staffRequests.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...request };
    this.staffRequests.set(id, updated);
    return updated;
  }

  async deleteStaffBookingRequest(bookingId, staffId) {
    const request = Array.from(this.staffRequests.values()).find(r => r.bookingId === bookingId && r.staffId === staffId);
    if (request) {
      return this.staffRequests.delete(request.id);
    }
    return false;
  }

  async getStaffBookingRequestByToken(token) {
    return Array.from(this.staffRequests.values()).find(r => r.token === token) || null;
  }

  async getAcceptedStaffForBooking(bookingId) {
    const requests = Array.from(this.staffRequests.values()).filter(r => r.bookingId === bookingId && r.status === "accepted");
    const staffIds = requests.map(r => r.staffId);
    return Array.from(this.staff.values()).filter(s => staffIds.includes(s.id));
  }

  async getAuditHistory(entityType, entityId) {
    let logs = Array.from(this.auditHistory.values());
    if (entityType) logs = logs.filter(l => l.entityType === entityType);
    if (entityId) logs = logs.filter(l => l.entityId === entityId);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAuditHistory(log) {
    const id = this.generateId();
    const newLog = {
      id,
      ...log,
      createdAt: new Date().toISOString(),
    };
    this.auditHistory.set(id, newLog);
    return newLog;
  }

  async deleteAuditHistory(id) {
    return this.auditHistory.delete(id);
  }
}

export const storage = new MemoryStorage();
