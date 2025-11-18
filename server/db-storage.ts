import { db } from "./db";
import { foodItems, eventBookings, companyInfo, staff } from "@shared/schema";
import type { FoodItem, InsertFoodItem, EventBooking, InsertEventBooking, CompanyInfo, InsertCompanyInfo, Staff, InsertStaff } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Food Items
  async getFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(foodItems);
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const [newItem] = await db.insert(foodItems).values(item).returning();
    return newItem!;
  }

  async updateFoodItem(id: string, updates: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const [updated] = await db.update(foodItems).set(updates).where(eq(foodItems.id, id)).returning();
    return updated;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const result = await db.delete(foodItems).where(eq(foodItems.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Event Bookings
  async getBookings(): Promise<EventBooking[]> {
    return await db.select().from(eventBookings).orderBy(desc(eventBookings.createdAt));
  }

  async getBooking(id: string): Promise<EventBooking | undefined> {
    const [booking] = await db.select().from(eventBookings).where(eq(eventBookings.id, id));
    return booking;
  }

  async createBooking(booking: InsertEventBooking): Promise<EventBooking> {
    const [newBooking] = await db.insert(eventBookings).values(booking).returning();
    return newBooking!;
  }

  async updateBooking(id: string, updates: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const [updated] = await db.update(eventBookings).set(updates).where(eq(eventBookings.id, id)).returning();
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(eventBookings).where(eq(eventBookings.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    const [info] = await db.select().from(companyInfo).limit(1);
    return info;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const [newInfo] = await db.insert(companyInfo).values(info).returning();
    return newInfo!;
  }

  async updateCompanyInfo(id: string, updates: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    const [updated] = await db.update(companyInfo).set(updates).where(eq(companyInfo.id, id)).returning();
    return updated;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(desc(staff.createdAt));
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member;
  }

  async createStaffMember(staffMember: InsertStaff): Promise<Staff> {
    const [newMember] = await db.insert(staff).values(staffMember).returning();
    return newMember!;
  }

  async updateStaffMember(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updated] = await db.update(staff).set(updates).where(eq(staff.id, id)).returning();
    return updated;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
