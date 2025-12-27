import mongoose from "mongoose";
import { FoodItemModel } from "./server/db.js";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";

async function seedVegetarianMenu() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const filePath = path.join(process.cwd(), "attached_assets", "Pasted-organise-the-text-an-create-pdf-VEGETARIAN-MENU-Welcome_1766848197308.txt");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    const categories = [
      "Welcome Drink's", "Veg Soup", "HOTS", "Veg Starters", "ROTIS", 
      "Indian Curries", "Special Rice Items", "Special Gravy Curries", 
      "Roti Chutney's", "Avakayalu", "Podilu", "Chinese", "Curds", 
      "Papad's", "Salad's", "Chat Items", "Mocktails", "American Chopes", 
      "Italian Snacks", "South Indian Tiffin's"
    ];

    let currentCategory = "";
    const itemsToSeed = [];
    const placeholderImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";

    for (const line of lines) {
      if (categories.includes(line)) {
        currentCategory = line;
        continue;
      }

      if (currentCategory && line.length > 2) {
        // Basic check to skip non-item lines if any
        if (line.toLowerCase().includes("organise the text") || line.toLowerCase().includes("vegetarian menu")) continue;
        
        itemsToSeed.push({
          name: line,
          category: currentCategory,
          description: `${line} - Freshly prepared vegetarian specialty from our ${currentCategory} selection.`,
          imageUrl: placeholderImage,
          dietaryTags: ["Vegetarian"],
          price: 150, // Default placeholder price
          rating: 5
        });
      }
    }

    console.log(`Parsed ${itemsToSeed.length} items. Clearing existing food items...`);
    await FoodItemModel.deleteMany({});
    
    console.log("Inserting new items...");
    await FoodItemModel.insertMany(itemsToSeed);
    console.log("Seeding completed successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedVegetarianMenu();
