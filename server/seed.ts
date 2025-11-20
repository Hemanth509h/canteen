import { connectToDatabase } from "./db";
import { FoodItemModel, CompanyInfoModel, type InsertFoodItem, type InsertCompanyInfo } from "@shared/schema";

export async function seedDatabase() {
  await connectToDatabase();

  const existingCompany = await CompanyInfoModel.findOne();
  const existingFoodItems = await FoodItemModel.countDocuments();

  if (existingCompany && existingFoodItems > 0) {
    console.log("✅ Database already seeded");
    return;
  }

  console.log("🌱 Seeding database...");

  if (!existingCompany) {
    const defaultCompany: InsertCompanyInfo = {
      companyName: "Premium Catering Services",
      tagline: "Exceptional Food for Unforgettable Events",
      description: "We specialize in creating memorable culinary experiences for weddings, corporate events, and special occasions. Our team of expert chefs uses only the finest ingredients to craft dishes that delight your guests.",
      email: "info@premiumcatering.com",
      phone: "+91 98765 43210",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      eventsPerYear: 500,
    };
    await CompanyInfoModel.create(defaultCompany);
    console.log("✅ Company info seeded");
  }

  if (existingFoodItems === 0) {
    const comprehensiveFoodItems: InsertFoodItem[] = [
      // === MAIN COURSES - Indian ===
      { name: "Hyderabadi Biryani", description: "Signature aromatic basmati rice with mutton/chicken, slow-cooked using dum pukht method", category: "main", imageUrl: null },
      { name: "Kodi Pulao", description: "Chicken pulao with fresh spices - lighter alternative to biryani", category: "main", imageUrl: null },
      { name: "Vegetable Biryani", description: "Fragrant basmati rice with mixed vegetables and aromatic spices", category: "main", imageUrl: null },
      { name: "Gutti Vankaya", description: "Stuffed brinjal with peanut-spice masala in tangy tomato gravy", category: "main", imageUrl: null },
      { name: "Mirch Ka Salan", description: "Rich peanut & chilli gravy, traditionally paired with biryani", category: "main", imageUrl: null },
      { name: "Paneer Butter Masala", description: "Cottage cheese in rich tomato-cashew gravy with butter", category: "main", imageUrl: null },
      { name: "Palak Paneer", description: "Cottage cheese cubes in creamy spinach gravy", category: "main", imageUrl: null },
      { name: "Dal Makhani", description: "Black lentils slow-cooked with butter and cream", category: "main", imageUrl: null },
      { name: "Chana Masala", description: "Chickpeas in spicy tomato-based curry", category: "main", imageUrl: null },
      { name: "Butter Chicken", description: "Tandoori chicken in rich butter-tomato gravy", category: "main", imageUrl: null },
      { name: "Chicken Tikka Masala", description: "Tandoori chicken in creamy tomato-based sauce", category: "main", imageUrl: null },

      // === RICE & PULAO ===
      { name: "Pulihora", description: "Tangy tamarind rice tempered with mustard seeds, curry leaves, and peanuts", category: "main", imageUrl: null },
      { name: "Lemon Rice", description: "Tangy rice with lemon juice, turmeric, and peanuts", category: "main", imageUrl: null },
      { name: "Jeera Rice", description: "Basmati rice tempered with cumin seeds", category: "main", imageUrl: null },

      // === APPETIZERS ===
      { name: "Vegetable Samosa", description: "Crispy pastry filled with spiced potato-peas mixture", category: "appetizer", imageUrl: null },
      { name: "Paneer Tikka", description: "Marinated cottage cheese grilled in tandoor", category: "appetizer", imageUrl: null },
      { name: "Chicken Tikka", description: "Spiced chicken pieces grilled in tandoor", category: "appetizer", imageUrl: null },
      { name: "Masala Dosa", description: "Crispy rice crepe filled with spiced potato", category: "appetizer", imageUrl: null },
      { name: "Idli", description: "Steamed rice cakes - South Indian staple", category: "appetizer", imageUrl: null },

      // === BREADS ===
      { name: "Butter Naan", description: "Soft leavened flatbread brushed with butter", category: "appetizer", imageUrl: null },
      { name: "Garlic Naan", description: "Naan topped with fresh garlic and coriander", category: "appetizer", imageUrl: null },
      { name: "Tandoori Roti", description: "Whole wheat flatbread from tandoor", category: "appetizer", imageUrl: null },

      // === DESSERTS ===
      { name: "Gulab Jamun", description: "Fried milk dumplings in rose-flavored sugar syrup", category: "dessert", imageUrl: null },
      { name: "Rasgulla", description: "Soft cheese balls in light sugar syrup", category: "dessert", imageUrl: null },
      { name: "Kheer", description: "Rice pudding with milk, cardamom, and nuts", category: "dessert", imageUrl: null },
      { name: "Gajar Halwa", description: "Carrot pudding with ghee, milk, and nuts", category: "dessert", imageUrl: null },
      { name: "Kulfi", description: "Traditional Indian ice cream with cardamom", category: "dessert", imageUrl: null },

      // === BEVERAGES ===
      { name: "Filter Coffee", description: "South Indian style strong filter coffee", category: "beverage", imageUrl: null },
      { name: "Masala Chai", description: "Spiced tea with cardamom, ginger, and milk", category: "beverage", imageUrl: null },
      { name: "Mango Lassi", description: "Yogurt drink blended with fresh mangoes", category: "beverage", imageUrl: null },
      { name: "Fresh Lime Soda", description: "Sparkling lime drink - sweet or salted", category: "beverage", imageUrl: null },
    ];

    await FoodItemModel.insertMany(comprehensiveFoodItems);
    console.log(`✅ ${comprehensiveFoodItems.length} food items seeded`);
  }

  console.log("🌱 Database seeding complete!");
}
