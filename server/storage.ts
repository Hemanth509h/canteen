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
import {
  FoodItemModel,
  EventBookingModel,
  BookingItemModel,
  CompanyInfoModel,
  StaffModel
} from "./models";

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
}

export class MongoDBStorage implements IStorage {
  private toFoodItem(doc: any): FoodItem {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      category: doc.category,
      imageUrl: doc.imageUrl || null,
      dietaryTags: doc.dietaryTags || [],
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
}
