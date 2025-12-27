import mongoose from "mongoose";
import { connectToDatabase } from "./server/db";
import { FoodItemModel, CompanyInfoModel, CustomerReviewModel, EventBookingModel, BookingItemModel, AdminNotificationModel, StaffModel, AuditHistoryModel, StaffBookingRequestModel } from "./server/storage";

async function recreateDatabase() {
  console.log("Starting full database recreation...");
  await connectToDatabase();

  const collections = [
    FoodItemModel,
    CompanyInfoModel,
    CustomerReviewModel,
    EventBookingModel,
    BookingItemModel,
    AdminNotificationModel,
    StaffModel,
    AuditHistoryModel,
    StaffBookingRequestModel
  ];

  for (const model of collections) {
    console.log(`Clearing collection: ${model.collection.name}`);
    await model.deleteMany({});
  }

  console.log("Seeding default company info...");
  await CompanyInfoModel.create({
    companyName: "Elite Catering & Events",
    tagline: "Exceptional Food for Unforgettable Events",
    description: "Crafting unforgettable culinary memories with passion, precision, and the finest ingredients.",
    email: "events@elite-catering.com",
    phone: "+91 98765 43210",
    address: "123 Gourmet Avenue, Culinary City",
    eventsPerYear: 500,
    upiId: "elite@upi",
    minAdvanceBookingDays: 2
  });

  console.log("Seeding default food items...");
  const defaultItems = [
    {
      name: "Fruit Punch",
      description: "Refreshing mix of seasonal tropical fruits and juices.",
      category: "Welcome Drinks",
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
      dietaryTags: ["Veg"],
      price: 150,
      rating: 5
    },
    {
      name: "Paneer Tikka",
      description: "Marinated cottage cheese cubes grilled to perfection.",
      category: "Starters",
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
      dietaryTags: ["Veg"],
      price: 250,
      rating: 5
    },
    {
      name: "Hyderabadi Biryani",
      description: "Authentic aromatic basmati rice cooked with premium spices.",
      category: "Main Course",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8",
      dietaryTags: ["Veg"],
      price: 350,
      rating: 5
    }
  ];

  await FoodItemModel.insertMany(defaultItems);

  console.log("Database recreation and seeding completed successfully.");
  process.exit(0);
}

recreateDatabase().catch(err => {
  console.error("Failed to recreate database:", err);
  process.exit(1);
});
