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

    // Comprehensive food items collection (150+ items)
    const comprehensiveFoodItems: InsertFoodItem[] = [
      // === MAIN COURSES - Indian ===
      { name: "Hyderabadi Biryani", description: "Signature aromatic basmati rice with mutton/chicken, slow-cooked using dum pukht method", category: "main", imageUrl: null },
      { name: "Kodi Pulao", description: "Chicken pulao with fresh spices - lighter alternative to biryani", category: "main", imageUrl: null },
      { name: "Vegetable Biryani", description: "Fragrant basmati rice with mixed vegetables and aromatic spices", category: "main", imageUrl: null },
      { name: "Gutti Vankaya", description: "Stuffed brinjal with peanut-spice masala in tangy tomato gravy", category: "main", imageUrl: null },
      { name: "Mirch Ka Salan", description: "Rich peanut & chilli gravy, traditionally paired with biryani", category: "main", imageUrl: null },
      { name: "Bagar Baigan", description: "Spiced eggplant preparation with aromatic spices", category: "main", imageUrl: null },
      { name: "Paneer Butter Masala", description: "Cottage cheese in rich tomato-cashew gravy with butter", category: "main", imageUrl: null },
      { name: "Palak Paneer", description: "Cottage cheese cubes in creamy spinach gravy", category: "main", imageUrl: null },
      { name: "Dal Makhani", description: "Black lentils slow-cooked with butter and cream", category: "main", imageUrl: null },
      { name: "Chana Masala", description: "Chickpeas in spicy tomato-based curry", category: "main", imageUrl: null },
      { name: "Aloo Gobi", description: "Potato and cauliflower dry curry with turmeric", category: "main", imageUrl: null },
      { name: "Malai Kofta", description: "Vegetable dumplings in creamy cashew-tomato sauce", category: "main", imageUrl: null },
      { name: "Kadai Paneer", description: "Cottage cheese with bell peppers in spicy kadai masala", category: "main", imageUrl: null },
      { name: "Gongura Mamsam", description: "Mutton cooked with tangy sorrel leaves - Telangana signature dish", category: "main", imageUrl: null },
      { name: "Rogan Josh", description: "Kashmiri lamb curry in aromatic yogurt-based sauce", category: "main", imageUrl: null },
      { name: "Chicken Tikka Masala", description: "Tandoori chicken in creamy tomato-based sauce", category: "main", imageUrl: null },
      { name: "Butter Chicken", description: "Tandoori chicken in rich butter-tomato gravy", category: "main", imageUrl: null },
      { name: "Chicken Korma", description: "Chicken in mild creamy cashew-yogurt gravy", category: "main", imageUrl: null },
      { name: "Fish Curry", description: "Fresh fish cooked in coconut-tamarind gravy", category: "main", imageUrl: null },
      { name: "Prawn Masala", description: "Prawns in spicy tomato-onion gravy", category: "main", imageUrl: null },
      { name: "Lamb Vindaloo", description: "Spicy Goan curry with lamb and vinegar", category: "main", imageUrl: null },
      { name: "Chettinad Chicken", description: "Spicy South Indian chicken curry with roasted spices", category: "main", imageUrl: null },
      { name: "Keema Matar", description: "Minced mutton with green peas in spicy gravy", category: "main", imageUrl: null },
      { name: "Rajma Curry", description: "Kidney beans in thick tomato gravy - North Indian specialty", category: "main", imageUrl: null },
      { name: "Bhindi Masala", description: "Okra stir-fried with onions and spices", category: "main", imageUrl: null },
      { name: "Baingan Bharta", description: "Smoked eggplant mash with tomatoes and spices", category: "main", imageUrl: null },
      { name: "Mixed Vegetable Curry", description: "Seasonal vegetables in coconut-tomato gravy", category: "main", imageUrl: null },
      { name: "Egg Curry", description: "Boiled eggs in spicy onion-tomato masala", category: "main", imageUrl: null },
      { name: "Mushroom Masala", description: "Button mushrooms in creamy onion-cashew gravy", category: "main", imageUrl: null },
      { name: "Methi Malai Matar", description: "Fenugreek leaves with peas in creamy gravy", category: "main", imageUrl: null },

      // === RICE & PULAO ===
      { name: "Pulihora", description: "Tangy tamarind rice tempered with mustard seeds, curry leaves, and peanuts", category: "main", imageUrl: null },
      { name: "Lemon Rice", description: "Tangy rice with lemon juice, turmeric, and peanuts", category: "main", imageUrl: null },
      { name: "Coconut Rice", description: "Fragrant rice with fresh coconut and curry leaves", category: "main", imageUrl: null },
      { name: "Curd Rice", description: "Cooling rice mixed with yogurt and tempered spices", category: "main", imageUrl: null },
      { name: "Jeera Rice", description: "Basmati rice tempered with cumin seeds", category: "main", imageUrl: null },
      { name: "Vegetable Pulao", description: "Fragrant rice with mixed vegetables and whole spices", category: "main", imageUrl: null },
      { name: "Kashmiri Pulao", description: "Sweet and savory rice with dry fruits and saffron", category: "main", imageUrl: null },
      
      // === DAL & LENTILS ===
      { name: "Khatti Dal", description: "Tangy toor dal with tamarind & mild spices, everyday staple", category: "main", imageUrl: null },
      { name: "Sambar", description: "Drumstick sambar with mixed vegetables and lentils", category: "main", imageUrl: null },
      { name: "Tomato Pappu", description: "Tomato-based lentil soup with traditional tempering", category: "main", imageUrl: null },
      { name: "Dal Tadka", description: "Yellow lentils tempered with ghee and spices", category: "main", imageUrl: null },
      { name: "Moong Dal Fry", description: "Split green gram with tomatoes and spices", category: "main", imageUrl: null },

      // === APPETIZERS - Indian Starters ===
      { name: "Vegetable Samosa", description: "Crispy pastry filled with spiced potato-peas mixture", category: "appetizer", imageUrl: null },
      { name: "Onion Pakora", description: "Crispy onion fritters in gram flour batter", category: "appetizer", imageUrl: null },
      { name: "Paneer Tikka", description: "Marinated cottage cheese grilled in tandoor", category: "appetizer", imageUrl: null },
      { name: "Chicken Tikka", description: "Spiced chicken pieces grilled in tandoor", category: "appetizer", imageUrl: null },
      { name: "Tandoori Chicken", description: "Whole chicken marinated in yogurt and spices, tandoor-cooked", category: "appetizer", imageUrl: null },
      { name: "Seekh Kabab", description: "Minced meat skewers grilled with spices", category: "appetizer", imageUrl: null },
      { name: "Hariyali Chicken", description: "Chicken marinated in mint-coriander paste, grilled", category: "appetizer", imageUrl: null },
      { name: "Fish Tikka", description: "Marinated fish pieces grilled to perfection", category: "appetizer", imageUrl: null },
      { name: "Prawn Tandoori", description: "Marinated prawns grilled in tandoor", category: "appetizer", imageUrl: null },
      { name: "Hara Bhara Kabab", description: "Spinach and peas patties with Indian spices", category: "appetizer", imageUrl: null },
      { name: "Aloo Tikki", description: "Crispy potato patties with spices", category: "appetizer", imageUrl: null },
      { name: "Papdi Chaat", description: "Crispy wafers with yogurt, chutneys, and chickpeas", category: "appetizer", imageUrl: null },
      { name: "Dahi Vada", description: "Lentil fritters soaked in spiced yogurt", category: "appetizer", imageUrl: null },
      { name: "Pani Puri", description: "Crispy hollow puris with spicy tamarind water", category: "appetizer", imageUrl: null },
      { name: "Bhel Puri", description: "Puffed rice with vegetables and tangy chutneys", category: "appetizer", imageUrl: null },
      { name: "Mirchi Bajji", description: "Large chilli fritters in gram flour batter", category: "appetizer", imageUrl: null },
      { name: "Cut Mirchi", description: "Stuffed and sliced chilli fritters", category: "appetizer", imageUrl: null },
      { name: "Masala Vada", description: "Spiced lentil fritters - South Indian specialty", category: "appetizer", imageUrl: null },
      { name: "Medu Vada", description: "Crispy lentil donuts with curry leaves", category: "appetizer", imageUrl: null },
      { name: "Vegetable Cutlet", description: "Mixed vegetable patties coated and fried", category: "appetizer", imageUrl: null },

      // === BREADS ===
      { name: "Butter Naan", description: "Soft leavened flatbread brushed with butter", category: "appetizer", imageUrl: null },
      { name: "Garlic Naan", description: "Naan topped with fresh garlic and coriander", category: "appetizer", imageUrl: null },
      { name: "Tandoori Roti", description: "Whole wheat flatbread from tandoor", category: "appetizer", imageUrl: null },
      { name: "Butter Roti", description: "Whole wheat flatbread with butter", category: "appetizer", imageUrl: null },
      { name: "Laccha Paratha", description: "Multi-layered crispy flatbread", category: "appetizer", imageUrl: null },
      { name: "Aloo Paratha", description: "Flatbread stuffed with spiced potatoes", category: "appetizer", imageUrl: null },
      { name: "Paneer Paratha", description: "Flatbread stuffed with spiced cottage cheese", category: "appetizer", imageUrl: null },
      { name: "Rumali Roti", description: "Thin handkerchief bread, perfect with curries", category: "appetizer", imageUrl: null },
      { name: "Puri", description: "Deep-fried puffed bread - wedding essential", category: "appetizer", imageUrl: null },
      { name: "Bhatura", description: "Fluffy deep-fried leavened bread", category: "appetizer", imageUrl: null },
      { name: "Kulcha", description: "Leavened bread with various stuffings", category: "appetizer", imageUrl: null },

      // === SOUTH INDIAN BREAKFAST ===
      { name: "Masala Dosa", description: "Crispy rice crepe filled with spiced potato", category: "appetizer", imageUrl: null },
      { name: "Plain Dosa", description: "Crispy thin rice and lentil crepe", category: "appetizer", imageUrl: null },
      { name: "Onion Dosa", description: "Dosa topped with caramelized onions", category: "appetizer", imageUrl: null },
      { name: "Pesarattu", description: "Green gram dosa with ginger - Telangana breakfast special", category: "appetizer", imageUrl: null },
      { name: "Idli", description: "Steamed rice cakes - South Indian staple", category: "appetizer", imageUrl: null },
      { name: "Idli-Vada Combo", description: "Steamed rice cakes with lentil fritters and sambar", category: "appetizer", imageUrl: null },
      { name: "Rava Dosa", description: "Crispy semolina crepe with onions and chillies", category: "appetizer", imageUrl: null },
      { name: "Uttapam", description: "Thick rice pancake with toppings", category: "appetizer", imageUrl: null },
      { name: "Rava Idli", description: "Steamed semolina cakes with vegetables", category: "appetizer", imageUrl: null },
      { name: "Upma", description: "Savory semolina porridge with vegetables", category: "appetizer", imageUrl: null },
      { name: "Pongal", description: "Rice and lentil dish tempered with pepper and ghee", category: "appetizer", imageUrl: null },

      // === CHUTNEYS & CONDIMENTS ===
      { name: "Coconut Chutney", description: "Fresh coconut chutney with traditional tempering", category: "appetizer", imageUrl: null },
      { name: "Tomato Chutney", description: "Tangy tomato-based chutney with garlic", category: "appetizer", imageUrl: null },
      { name: "Gongura Pachadi", description: "Tangy sorrel leaf chutney - Telangana signature", category: "appetizer", imageUrl: null },
      { name: "Peanut Chutney", description: "Roasted peanut chutney with spices", category: "appetizer", imageUrl: null },
      { name: "Mint Chutney", description: "Fresh mint and coriander chutney", category: "appetizer", imageUrl: null },
      { name: "Tamarind Chutney", description: "Sweet and tangy tamarind sauce", category: "appetizer", imageUrl: null },
      { name: "Mango Pickle", description: "Spicy and tangy mango pickle - Andhra style", category: "appetizer", imageUrl: null },
      { name: "Lime Pickle", description: "Tangy preserved lime pickle", category: "appetizer", imageUrl: null },

      // === DESSERTS ===
      { name: "Gulab Jamun", description: "Fried milk dumplings in rose-flavored sugar syrup", category: "dessert", imageUrl: null },
      { name: "Rasgulla", description: "Soft cheese balls in light sugar syrup", category: "dessert", imageUrl: null },
      { name: "Rasmalai", description: "Cheese patties in saffron-cardamom milk", category: "dessert", imageUrl: null },
      { name: "Kheer", description: "Rice pudding with milk, cardamom, and nuts", category: "dessert", imageUrl: null },
      { name: "Gajar Halwa", description: "Carrot pudding with ghee, milk, and nuts", category: "dessert", imageUrl: null },
      { name: "Moong Dal Halwa", description: "Yellow lentil dessert with ghee and nuts", category: "dessert", imageUrl: null },
      { name: "Jalebi", description: "Deep-fried pretzel-shaped sweets in sugar syrup", category: "dessert", imageUrl: null },
      { name: "Kulfi", description: "Traditional Indian ice cream with cardamom", category: "dessert", imageUrl: null },
      { name: "Phirni", description: "Ground rice pudding with saffron and nuts", category: "dessert", imageUrl: null },
      { name: "Mysore Pak", description: "Rich ghee-based sweet from Karnataka", category: "dessert", imageUrl: null },
      { name: "Bobbatlu", description: "Sweet flatbread with chana dal and jaggery filling - wedding essential", category: "dessert", imageUrl: null },
      { name: "Ariselu", description: "Rice flour and jaggery sweet for festivals", category: "dessert", imageUrl: null },
      { name: "Qubani Ka Meetha", description: "Apricot dessert with cream - Hyderabadi specialty", category: "dessert", imageUrl: null },
      { name: "Pootharekulu", description: "Paper-thin sweet from Atreyapuram - wedding favorite", category: "dessert", imageUrl: null },
      { name: "Semiya Payasam", description: "Vermicelli pudding with milk, nuts, and cardamom", category: "dessert", imageUrl: null },
      { name: "Double Ka Meetha", description: "Bread pudding with milk, sugar, and saffron", category: "dessert", imageUrl: null },
      { name: "Shahi Tukda", description: "Fried bread soaked in sweetened milk", category: "dessert", imageUrl: null },
      { name: "Barfi", description: "Milk fudge in various flavors", category: "dessert", imageUrl: null },
      { name: "Kaju Katli", description: "Cashew fudge - premium sweet", category: "dessert", imageUrl: null },
      { name: "Ladoo", description: "Sweet balls made with gram flour, coconut, or semolina", category: "dessert", imageUrl: null },
      { name: "Peda", description: "Milk-based sweet with cardamom", category: "dessert", imageUrl: null },
      { name: "Sandesh", description: "Bengali cottage cheese sweet", category: "dessert", imageUrl: null },
      { name: "Malai Peda", description: "Creamy milk sweet with saffron", category: "dessert", imageUrl: null },
      { name: "Motichoor Ladoo", description: "Sweet made with tiny fried gram flour balls", category: "dessert", imageUrl: null },
      { name: "Rava Kesari", description: "Semolina sweet with saffron and ghee", category: "dessert", imageUrl: null },
      { name: "Coconut Barfi", description: "Coconut fudge with cardamom", category: "dessert", imageUrl: null },
      { name: "Til Ladoo", description: "Sesame seed sweet balls with jaggery", category: "dessert", imageUrl: null },
      { name: "Peanut Chikki", description: "Peanut brittle with jaggery", category: "dessert", imageUrl: null },
      { name: "Ice Cream", description: "Assorted flavors of premium ice cream", category: "dessert", imageUrl: null },
      { name: "Fruit Custard", description: "Creamy custard with fresh seasonal fruits", category: "dessert", imageUrl: null },

      // === BEVERAGES ===
      { name: "Filter Coffee", description: "South Indian style strong filter coffee", category: "beverage", imageUrl: null },
      { name: "Masala Chai", description: "Spiced tea with cardamom, ginger, and milk", category: "beverage", imageUrl: null },
      { name: "Chaas", description: "Spiced buttermilk - cooling and refreshing", category: "beverage", imageUrl: null },
      { name: "Lassi", description: "Sweet or salty yogurt drink", category: "beverage", imageUrl: null },
      { name: "Mango Lassi", description: "Yogurt drink blended with fresh mangoes", category: "beverage", imageUrl: null },
      { name: "Fresh Lime Soda", description: "Sparkling lime drink - sweet or salted", category: "beverage", imageUrl: null },
      { name: "Jaljeera", description: "Spiced cumin drink with tamarind", category: "beverage", imageUrl: null },
      { name: "Badam Milk", description: "Almond milk with saffron", category: "beverage", imageUrl: null },
      { name: "Rose Milk", description: "Chilled milk with rose syrup", category: "beverage", imageUrl: null },
      { name: "Green Tea", description: "Fresh brewed green tea", category: "beverage", imageUrl: null },
      { name: "Lemon Tea", description: "Black tea with fresh lemon", category: "beverage", imageUrl: null },
      { name: "Sugarcane Juice", description: "Fresh pressed sugarcane juice with ginger", category: "beverage", imageUrl: null },
      { name: "Coconut Water", description: "Fresh tender coconut water", category: "beverage", imageUrl: null },
      { name: "Fresh Fruit Juice", description: "Seasonal fruit juices - orange, apple, pomegranate", category: "beverage", imageUrl: null },
      { name: "Watermelon Juice", description: "Fresh chilled watermelon juice", category: "beverage", imageUrl: null },
      { name: "Soft Drinks", description: "Assorted carbonated beverages", category: "beverage", imageUrl: null },
      { name: "Mineral Water", description: "Premium packaged drinking water", category: "beverage", imageUrl: null },
      { name: "Iced Tea", description: "Chilled tea with lemon and mint", category: "beverage", imageUrl: null },
      { name: "Milkshake", description: "Thick shakes in chocolate, vanilla, strawberry flavors", category: "beverage", imageUrl: null },
      { name: "Coffee", description: "Hot brewed coffee - espresso or americano", category: "beverage", imageUrl: null },

      // === SNACKS & STREET FOOD ===
      { name: "Sakinalu", description: "Crispy rice flour & sesame snack for Sankranti", category: "appetizer", imageUrl: null },
      { name: "Chakli", description: "Spiral-shaped savory snack with spices", category: "appetizer", imageUrl: null },
      { name: "Murukku", description: "Crispy rice flour spirals - South Indian snack", category: "appetizer", imageUrl: null },
      { name: "Boondi", description: "Fried gram flour pearls - sweet or savory", category: "appetizer", imageUrl: null },
      { name: "Mixture", description: "Spiced mix of fried lentils, nuts, and sev", category: "appetizer", imageUrl: null },
      { name: "Banana Chips", description: "Crispy fried banana slices", category: "appetizer", imageUrl: null },
      { name: "Potato Chips", description: "Thin sliced fried potatoes", category: "appetizer", imageUrl: null },
      { name: "Ribbon Pakoda", description: "Crispy ribbon-shaped snack", category: "appetizer", imageUrl: null },
      { name: "Corn Bhel", description: "Sweet corn with spices and lemon", category: "appetizer", imageUrl: null },
      { name: "Spring Rolls", description: "Crispy vegetable rolls with sweet chili sauce", category: "appetizer", imageUrl: null },
    ];

    comprehensiveFoodItems.forEach(item => {
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
