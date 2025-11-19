import { type FoodItem, type InsertFoodItem, type EventBooking, type InsertEventBooking, type CompanyInfo, type InsertCompanyInfo, type Staff, type InsertStaff } from "@shared/schema";
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

  // Staff
  getStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaffMember(staff: InsertStaff): Promise<Staff>;
  updateStaffMember(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaffMember(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private foodItems: Map<string, FoodItem>;
  private bookings: Map<string, EventBooking>;
  private companyInfo: CompanyInfo | undefined;
  private staff: Map<string, Staff>;

  constructor() {
    this.foodItems = new Map();
    this.bookings = new Map();
    this.companyInfo = undefined;
    this.staff = new Map();
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
      phone: "+91 98765 43210",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      eventsPerYear: 500,
    };
    this.companyInfo = defaultCompany;

    // Add Telangana food items
    const telanganaFoodItems: InsertFoodItem[] = [
      // Main Rice Dishes
      { name: "Hyderabadi Biryani", description: "Signature aromatic rice with mutton/chicken, slow-cooked using dum pukht method", category: "main", imageUrl: null },
      { name: "Kodi Pulao", description: "Chicken pulao with fresh spices - lighter alternative to biryani", category: "main", imageUrl: null },
      { name: "Pulihora", description: "Tangy tamarind rice tempered with mustard seeds, curry leaves, and peanuts", category: "main", imageUrl: null },
      { name: "Kobbari Saddi", description: "Spiced coconut rice, must-have during Bathukamma festival", category: "main", imageUrl: null },
      
      // Vegetarian Curries & Sides
      { name: "Gutti Vankaya", description: "Stuffed brinjal with peanut-spice masala in tangy tomato gravy", category: "main", imageUrl: null },
      { name: "Mirch Ka Salan", description: "Rich peanut & chilli gravy, traditionally paired with biryani", category: "main", imageUrl: null },
      { name: "Bagar Baigan", description: "Spiced eggplant preparation with aromatic spices", category: "main", imageUrl: null },
      { name: "Dalcha", description: "Lentils cooked with vegetables and aromatic spices", category: "main", imageUrl: null },
      
      // Dal & Soups
      { name: "Khatti Dal", description: "Tangy toor dal with tamarind & mild spices, everyday staple", category: "main", imageUrl: null },
      { name: "Sambar", description: "Drumstick sambar with mixed vegetables", category: "main", imageUrl: null },
      { name: "Tomato Pappu", description: "Tomato-based lentil soup with traditional tempering", category: "main", imageUrl: null },
      
      // Non-Vegetarian
      { name: "Gongura Mamsam", description: "Mutton cooked with tangy sorrel leaves - Telangana signature dish", category: "main", imageUrl: null },
      { name: "Talakaya Kura", description: "Traditional fish curry with aromatic spices", category: "main", imageUrl: null },
      { name: "Royyala Kura", description: "Prawn curry with coconut and spices", category: "main", imageUrl: null },
      
      // Breads
      { name: "Jonna Rotte", description: "Jowar (sorghum) flatbread - traditional Telangana staple", category: "appetizer", imageUrl: null },
      { name: "Rumali Roti", description: "Thin handkerchief bread, perfect with curries", category: "appetizer", imageUrl: null },
      { name: "Puri", description: "Fried fluffy bread, wedding essential", category: "appetizer", imageUrl: null },
      
      // Chutneys & Pickles
      { name: "Gongura Pachadi", description: "Tangy sorrel leaf chutney - signature Telangana item", category: "appetizer", imageUrl: null },
      { name: "Coconut Chutney", description: "Fresh coconut chutney with traditional tempering", category: "appetizer", imageUrl: null },
      { name: "Avakaya", description: "Spicy mango pickle - Andhra/Telangana special", category: "appetizer", imageUrl: null },
      
      // Sweets & Desserts
      { name: "Bobbatlu (Puran Poli)", description: "Sweet flatbread stuffed with chana dal & jaggery - wedding essential", category: "dessert", imageUrl: null },
      { name: "Ariselu", description: "Sweet made with rice flour & jaggery, prepared during festivals", category: "dessert", imageUrl: null },
      { name: "Qubani Ka Meetha", description: "Apricot dessert - Hyderabadi specialty", category: "dessert", imageUrl: null },
      { name: "Pootharekulu", description: "Paper-thin sweet from Atreyapuram, wedding favorite", category: "dessert", imageUrl: null },
      { name: "Gulab Jamun", description: "Fried milk balls in sugar syrup", category: "dessert", imageUrl: null },
      { name: "Semiya Payasam", description: "Vermicelli pudding with nuts and cardamom", category: "dessert", imageUrl: null },
      
      // Tiffin/Breakfast
      { name: "Pesarattu", description: "Green gram dosa with ginger chutney - Telangana breakfast special", category: "appetizer", imageUrl: null },
      { name: "Idli-Vada-Sambar", description: "Steamed rice cakes and lentil fritters with sambar", category: "appetizer", imageUrl: null },
      { name: "Upma", description: "Semolina or broken wheat preparation with vegetables", category: "appetizer", imageUrl: null },
      
      // Beverages
      { name: "Chaas (Buttermilk)", description: "Spiced yogurt drink, cooling and refreshing", category: "beverage", imageUrl: null },
      { name: "Filter Coffee", description: "South Indian style filter coffee", category: "beverage", imageUrl: null },
      { name: "Masala Tea", description: "Spiced tea with cardamom and ginger", category: "beverage", imageUrl: null },
      
      // Snacks
      { name: "Sakinalu", description: "Crispy rice flour & sesame snack for Sankranti", category: "appetizer", imageUrl: null },
      { name: "Mirchi Bajji", description: "Chilli fritters with gram flour batter", category: "appetizer", imageUrl: null },
      { name: "Cut Mirchi", description: "Stuffed chilli fritters", category: "appetizer", imageUrl: null },
    ];

    telanganaFoodItems.forEach(item => {
      const id = randomUUID();
      const foodItem: FoodItem = { ...item, id, imageUrl: item.imageUrl || null };
      this.foodItems.set(id, foodItem);
    });
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
    const item: FoodItem = { ...insertItem, id, imageUrl: insertItem.imageUrl || null };
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
      servingBoysNeeded: insertBooking.servingBoysNeeded || 2,
      specialRequests: insertBooking.specialRequests || null,
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
    const companyInfo: CompanyInfo = { ...info, id, eventsPerYear: info.eventsPerYear || 500 };
    this.companyInfo = companyInfo;
    return companyInfo;
  }

  async updateCompanyInfo(id: string, updates: Partial<InsertCompanyInfo>): Promise<CompanyInfo | undefined> {
    if (!this.companyInfo || this.companyInfo.id !== id) return undefined;

    this.companyInfo = { ...this.companyInfo, ...updates };
    return this.companyInfo;
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaffMember(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staffMember: Staff = {
      ...insertStaff,
      id,
      imageUrl: insertStaff.imageUrl || null,
      createdAt: new Date().toISOString(),
    };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  async updateStaffMember(id: string, updates: Partial<InsertStaff>): Promise<Staff | undefined> {
    const staffMember = this.staff.get(id);
    if (!staffMember) return undefined;

    const updated: Staff = { ...staffMember, ...updates };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    return this.staff.delete(id);
  }
}

export const storage = new MemStorage();
