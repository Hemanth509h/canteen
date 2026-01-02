
import { connectToDatabase, getStorage } from './db.js';

async function clearAllFoodItems() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    const storage = getStorage();
    
    console.log("Fetching all food items...");
    const items = await storage.getFoodItems();
    console.log(`Found ${items.length} items. Deleting...`);
    
    for (const item of items) {
      await storage.deleteFoodItem(item.id);
    }
    
    console.log("Successfully deleted all food items.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear food items:", error);
    process.exit(1);
  }
}

clearAllFoodItems();
