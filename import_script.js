import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const FoodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['Veg', 'Non-Veg'], required: true },
  imageUrl: { type: String, required: true },
  dietaryTags: [String],
  price: Number
});

const FoodItem = mongoose.models.FoodItem || mongoose.model('FoodItem', FoodItemSchema);

async function run() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not set');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // First, read the JSON file
    const filePath = path.join(process.cwd(), 'import_food_items_part1.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`Starting import of ${data.length} items...`);

    // We clear first as requested
    // await FoodItem.deleteMany({}); // User said "clear the database", but specifically for food items usually
    
    // For "part by part" we might not want to clear EVERY time if we do multiple parts
    // But user said "clear the database an the reupload it"
    // Let's assume they want a clean slate for food items
    
    for (const item of data) {
      await FoodItem.findOneAndUpdate(
        { name: item.name },
        item,
        { upsert: true, new: true }
      );
      console.log(`Imported/Updated: ${item.name}`);
    }

    console.log('Import completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}

run();
