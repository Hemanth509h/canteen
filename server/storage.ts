import { type FoodItem, type InsertFoodItem, type EventBooking, type InsertEventBooking, type CompanyInfo, type InsertCompanyInfo } from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | undefined>;
  createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo>;
  updateCompanyInfo(id: string, info: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined>;
}

export class MemStorage implements IStorage {
  private foodItems: Map<string, FoodItem>;
  private bookings: Map<string, EventBooking>;
  private companyInfo: CompanyInfo | undefined;

  constructor() {
    this.foodItems = new Map();
    this.bookings = new Map();
    this.companyInfo = undefined;
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Initialize default company info
    const defaultCompany: CompanyInfo = {
      id: randomUUID(),
      companyName: "Premium Catering Services",
      tagline: "Exceptional Food for Unforgettable Events",
      description: "We specialize in creating memorable culinary experiences for weddings, corporate events, and special occasions. Our team of expert chefs uses only the finest ingredients to craft dishes that delight your guests.",
      email: "info@premiumcatering.com",
      phone: "+1 (555) 123-4567",
      address: "123 Culinary Avenue, Food City, FC 12345",
      eventsPerYear: 500,
    };
    this.companyInfo = defaultCompany;
  }

  // Food Items
  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const id = randomUUID();
    const item: FoodItem = { ...insertItem, id };
    this.foodItems.set(id, item);
    return item;
  }

  async updateFoodItem(id: string, updates: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const item = this.foodItems.get(id);
    if (!item) return undefined;

    const updated: FoodItem = { ...item, ...updates };
    this.foodItems.set(id, updated);
    return updated;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  // Event Bookings
  async getBookings(): Promise<EventBooking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getBooking(id: string): Promise<EventBooking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertEventBooking): Promise<EventBooking> {
    const id = randomUUID();
    const booking: EventBooking = {
      ...insertBooking,
      id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updated: EventBooking = { ...booking, ...updates };
    this.bookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    return this.companyInfo;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const id = randomUUID();
    const companyInfo: CompanyInfo = { ...info, id };
    this.companyInfo = companyInfo;
    return companyInfo;
  }

  async updateCompanyInfo(id: string, updates: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    if (!this.companyInfo || this.companyInfo.id !== id) return undefined;

    this.companyInfo = { ...this.companyInfo, ...updates };
    return this.companyInfo;
  }
}

export const storage = new MemStorage();
