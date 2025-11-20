import mongoose from "mongoose";
import { FoodItemModel, EventBookingModel, BookingItemModel, CompanyInfoModel, StaffModel } from "./models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/canteen";

async function clearDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    await FoodItemModel.deleteMany({});
    console.log("🗑️  Deleted all food items");
    
    await EventBookingModel.deleteMany({});
    console.log("🗑️  Deleted all event bookings");
    
    await BookingItemModel.deleteMany({});
    console.log("🗑️  Deleted all booking items");
    
    await CompanyInfoModel.deleteMany({});
    console.log("🗑️  Deleted all company info");
    
    await StaffModel.deleteMany({});
    console.log("🗑️  Deleted all staff");
    
    console.log("✅ All data deleted successfully!");
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

clearDatabase();
