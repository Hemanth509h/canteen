import mongoose from "mongoose";
import { MongoDBStorage } from "./storage.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await Promise.race([
      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MongoDB connection timeout after 5 seconds")), 5000)
      ),
    ]);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error);
});

export const storage = new MongoDBStorage();
