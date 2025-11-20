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
  type InsertBookingItem
} from "@shared/schema";
import type { IStorage } from "./storage";

let nextId = 1;
function generateId(): string {
  return (nextId++).toString();
}

export class MemStorage implements IStorage {
  private foodItems = new Map<string, FoodItem>();
  private eventBookings = new Map<string, EventBooking>();
  private bookingItems = new Map<string, BookingItem>();
  private companyInfo: CompanyInfo | undefined;
  private staff = new Map<string, Staff>();

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const id = generateId();
    const foodItem: FoodItem = {
      id,
      name: item.name,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl || null,
      dietaryTags: item.dietaryTags || [],
    };
    this.foodItems.set(id, foodItem);
    return foodItem;
  }

  async updateFoodItem(id: string, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const existing = this.foodItems.get(id);
    if (!existing) return undefined;

    const updated: FoodItem = {
      ...existing,
      ...item,
      id,
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

  async getBooking(id: string): Promise<EventBooking | undefined> {
    return this.eventBookings.get(id);
  }

  async createBooking(booking: InsertEventBooking): Promise<EventBooking> {
    const id = generateId();
    const eventBooking: EventBooking = {
      id,
      clientName: booking.clientName,
      eventDate: booking.eventDate,
      eventType: booking.eventType,
      guestCount: booking.guestCount,
      pricePerPlate: booking.pricePerPlate,
      servingBoysNeeded: booking.servingBoysNeeded,
      status: "pending",
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      specialRequests: booking.specialRequests || null,
      createdAt: new Date().toISOString(),
    };
    this.eventBookings.set(id, eventBooking);
    return eventBooking;
  }

  async updateBooking(id: string, booking: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const existing = this.eventBookings.get(id);
    if (!existing) return undefined;

    const updated: EventBooking = {
      ...existing,
      ...booking,
      id,
    };
    this.eventBookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const deleted = this.eventBookings.delete(id);
    if (deleted) {
      await this.deleteBookingItems(id);
    }
    return deleted;
  }

  async getBookingItems(bookingId: string): Promise<(BookingItem & { foodItem: FoodItem })[]> {
    const items = Array.from(this.bookingItems.values()).filter(
      (item) => item.bookingId === bookingId
    );

    const result: (BookingItem & { foodItem: FoodItem })[] = [];
    for (const item of items) {
      const foodItem = this.foodItems.get(item.foodItemId);
      if (foodItem) {
        result.push({
          ...item,
          foodItem,
        });
      }
    }
    return result;
  }

  async createBookingItem(item: InsertBookingItem): Promise<BookingItem> {
    const id = generateId();
    const bookingItem: BookingItem = {
      id,
      bookingId: item.bookingId,
      foodItemId: item.foodItemId,
      quantity: item.quantity,
      createdAt: new Date().toISOString(),
    };
    this.bookingItems.set(id, bookingItem);
    return bookingItem;
  }

  async deleteBookingItems(bookingId: string): Promise<boolean> {
    const itemsToDelete = Array.from(this.bookingItems.entries())
      .filter(([, item]) => item.bookingId === bookingId)
      .map(([id]) => id);

    itemsToDelete.forEach((id) => this.bookingItems.delete(id));
    return itemsToDelete.length > 0;
  }

  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    return this.companyInfo;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const id = generateId();
    const companyInfo: CompanyInfo = {
      id,
      companyName: info.companyName,
      tagline: info.tagline,
      description: info.description,
      email: info.email,
      phone: info.phone,
      address: info.address,
      eventsPerYear: info.eventsPerYear,
    };
    this.companyInfo = companyInfo;
    return companyInfo;
  }

  async updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    if (!this.companyInfo || this.companyInfo.id !== id) return undefined;

    const updated: CompanyInfo = {
      ...this.companyInfo,
      ...info,
      id,
    };
    this.companyInfo = updated;
    return updated;
  }

  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaffMember(staffMember: InsertStaff): Promise<Staff> {
    const id = generateId();
    const staff: Staff = {
      id,
      name: staffMember.name,
      role: staffMember.role,
      phone: staffMember.phone,
      experience: staffMember.experience,
      imageUrl: staffMember.imageUrl || null,
      salary: staffMember.salary,
      createdAt: new Date().toISOString(),
    };
    this.staff.set(id, staff);
    return staff;
  }

  async updateStaffMember(id: string, staffMember: Partial<InsertStaff>): Promise<Staff | undefined> {
    const existing = this.staff.get(id);
    if (!existing) return undefined;

    const updated: Staff = {
      ...existing,
      ...staffMember,
      id,
    };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }
}
