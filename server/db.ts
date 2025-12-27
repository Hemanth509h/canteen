import mongoose from "mongoose";
import { MongoDBStorage } from "./storage";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";

console.log("Using MONGODB_URI:", MONGODB_URI.replace(/:([^@]+)@/, ":****@"));

let isConnected: Promise<typeof mongoose> | null = null;

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (isConnected) {
    return isConnected;
  }

  try {
    isConnected = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      dbName: "canteen"
    });
    
    await isConnected;
    console.log("✅ Connected to MongoDB database: canteen");
    return isConnected;
  } catch (error) {
    isConnected = null;
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = null;
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error);
});

export const storage = new MongoDBStorage();
