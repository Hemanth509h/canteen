import { connectDB } from "./db";
import { FoodItemModel, CompanyInfoModel } from "@shared/schema";
import type { InsertFoodItem } from "@shared/schema";

async function seed() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  
  console.log("Seeding database...");
  
  // Check if food items already exist
  const existingFoodItems = await FoodItemModel.find();
  
  if (existingFoodItems.length > 0) {
    console.log(`Database already has ${existingFoodItems.length} food items. Skipping seed to preserve data.`);
    console.log("To reseed, delete food items manually first.");
    process.exit(0);
  }
  
  console.log("No food items found. Adding Telangana menu...");
  
  // Check if company info already exists
  const existing = await CompanyInfoModel.findOne();
  
  if (!existing) {
    // Insert default company info
    await CompanyInfoModel.create({
      companyName: "Ravi canteen",
      tagline: "Exceptional Food for Unforgettable Events",
      description: "We specialize in creating memorable culinary experiences for weddings, corporate events, and special occasions. Our team of expert chefs uses only the finest ingredients to craft dishes that delight your guests.",
      email: "info@premiumcatering.com",
      phone: "+91 98765 43210",
      address: "123 MG Road, Mumbai, Maharashtra 400001",
      eventsPerYear: 500,
    });
    console.log("Default company info created");
  } else {
    console.log("Company info already exists");
  }
  
  // Add Telangana food items
  console.log("Adding Telangana food items...");
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

  await FoodItemModel.insertMany(telanganaFoodItems);

  const count = await FoodItemModel.countDocuments();
  console.log(`✓ Added ${count} Telangana food items to database`);
  
  console.log("Database seeded successfully");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
