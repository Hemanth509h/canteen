import mongoose from "mongoose";
import { log } from "./vite";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

const mongoUri: string = MONGODB_URI;

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    log("✅ Connected to MongoDB successfully");
  } catch (error) {
    log("❌ MongoDB connection error: " + String(error));
    throw error;
  }
}

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  log("MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  log("MongoDB error: " + String(error));
});

export { mongoose };
