import { connectDB } from "./db";
import { 
  FoodItemModel, EventBookingModel, BookingItemModel, CompanyInfoModel, StaffModel,
  type FoodItem, type InsertFoodItem, 
  type EventBooking, type InsertEventBooking,
  type CompanyInfo, type InsertCompanyInfo,
  type Staff, type InsertStaff,
  type BookingItem, type InsertBookingItem
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    connectDB().catch(err => {
      console.error("Failed to connect to MongoDB:", err);
    });
  }

  // Food Items
  async getFoodItems(): Promise<FoodItem[]> {
    const items = await FoodItemModel.find();
    return items.map(item => item.toObject());
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const item = await FoodItemModel.findById(id);
    return item ? item.toObject() : undefined;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const newItem = await FoodItemModel.create(item);
    return newItem.toObject();
  }

  async updateFoodItem(id: string, updates: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const updated = await FoodItemModel.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toObject() : undefined;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const result = await FoodItemModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Event Bookings
  async getBookings(): Promise<EventBooking[]> {
    const bookings = await EventBookingModel.find().sort({ createdAt: -1 });
    return bookings.map(booking => booking.toObject());
  }

  async getBooking(id: string): Promise<EventBooking | undefined> {
    const booking = await EventBookingModel.findById(id);
    return booking ? booking.toObject() : undefined;
  }

  async createBooking(booking: InsertEventBooking): Promise<EventBooking> {
    const newBooking = await EventBookingModel.create(booking);
    return newBooking.toObject();
  }

  async updateBooking(id: string, updates: Partial<EventBooking>): Promise<EventBooking | undefined> {
    const updated = await EventBookingModel.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toObject() : undefined;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await EventBookingModel.findByIdAndDelete(id);
    return result !== null;
  }

  // Booking Items
  async getBookingItems(bookingId: string): Promise<(BookingItem & { foodItem: FoodItem })[]> {
    const items = await BookingItemModel.find({ bookingId });
    
    const itemsWithFood = await Promise.all(
      items.map(async (item) => {
        const foodItem = await FoodItemModel.findById(item.foodItemId);
        const itemObj = item.toObject();
        return {
          ...itemObj,
          foodItem: foodItem ? foodItem.toObject() : null,
        };
      })
    );
    
    return itemsWithFood.filter(item => item.foodItem !== null) as (BookingItem & { foodItem: FoodItem })[];
  }

  async createBookingItem(item: InsertBookingItem): Promise<BookingItem> {
    const newItem = await BookingItemModel.create(item);
    return newItem.toObject();
  }

  async deleteBookingItems(bookingId: string): Promise<boolean> {
    await BookingItemModel.deleteMany({ bookingId });
    return true;
  }

  // Company Info
  async getCompanyInfo(): Promise<CompanyInfo | undefined> {
    const info = await CompanyInfoModel.findOne();
    return info ? info.toObject() : undefined;
  }

  async createCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    const newInfo = await CompanyInfoModel.create(info);
    return newInfo.toObject();
  }

  async updateCompanyInfo(id: string, updates: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    const updated = await CompanyInfoModel.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toObject() : undefined;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const staff = await StaffModel.find().sort({ createdAt: -1 });
    return staff.map(member => member.toObject());
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const member = await StaffModel.findById(id);
    return member ? member.toObject() : undefined;
  }

  async createStaffMember(staffMember: InsertStaff): Promise<Staff> {
    const newMember = await StaffModel.create(staffMember);
    return newMember.toObject();
  }

  async updateStaffMember(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const updated = await StaffModel.findByIdAndUpdate(id, updates, { new: true });
    return updated ? updated.toObject() : undefined;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    const result = await StaffModel.findByIdAndDelete(id);
    return result !== null;
  }
}

export const storage = new DatabaseStorage();
