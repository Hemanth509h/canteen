
import fs from 'fs';
import path from 'path';
import { getStorage, connectToDatabase } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importMenu() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    const storage = getStorage();
    
    // Path adjusted to root's attached_assets
    const filePath = path.join(__dirname, '..', 'attached_assets', 'Pasted-veg-food-menu-Sweets-Annamya-Laddu-Chakkera-Pongali-Ann_1767364403311.txt');
    console.log(`Reading file from: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let currentCategory = "";
    let itemsAdded = 0;
    
    const categoryHeaders = [
      "Sweets", "Juice's", "Veg Snacks", "Hots", "Roli's", 
      "Kurma Curries", "Special Greavy Curry's", "Special Rice Items", 
      "Veg Dum Biryanis", "Dal Items", "Veg Fry Items", "Liquid Items", 
      "Roti Chutney", "Avahayalu", "Powder's", "Curds", "Papads", 
      "Salads", "Chat Items", "Chinese", "Italian Snack's", 
      "South foodikan Tiffin lems", "Fruit's", "Ice Cream's", 
      "NON neg menu", "Chichen Snach's", "Prawns Snack's"
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.toLowerCase() === "veg food menu") continue;
      
      if (categoryHeaders.includes(trimmed)) {
        currentCategory = trimmed;
        console.log(`Switching to category: ${currentCategory}`);
        continue;
      }
      
      if (currentCategory && trimmed) {
        await storage.createFoodItem({
          name: trimmed,
          description: `${trimmed} from our ${currentCategory} selection`,
          type: currentCategory.toLowerCase().includes("non") ? "Non-Veg" : "Veg",
          category: currentCategory,
          imageUrl: ""
        });
        itemsAdded++;
      }
    }
    
    console.log(`Successfully added ${itemsAdded} items to the database.`);
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importMenu();
