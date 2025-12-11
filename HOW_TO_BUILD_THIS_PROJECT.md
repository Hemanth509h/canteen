# How to Build This Catering Management System from Scratch

This guide explains how to create this full-stack catering management application step by step with complete code for every file.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Step 1: Initialize Project](#step-1-initialize-project)
5. [Step 2: Configuration Files](#step-2-configuration-files)
6. [Step 3: Shared Schema](#step-3-shared-schema)
7. [Step 4: Server Files](#step-4-server-files)
8. [Step 5: Client Setup](#step-5-client-setup)
9. [Step 6: UI Components](#step-6-ui-components)
10. [Step 7: Pages](#step-7-pages)
11. [Step 8: Styling](#step-8-styling)
12. [Running the Project](#running-the-project)

---

## Prerequisites

Before starting, you need:

1. **Node.js** (version 20 or higher)
2. **MongoDB Atlas Account** (free tier works) - for database
3. **Basic knowledge** of JavaScript/TypeScript, React, Express.js

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript |
| UI Components | Shadcn/UI + Tailwind CSS |
| Backend | Express.js + TypeScript |
| Database | MongoDB (with Mongoose) |
| State Management | TanStack React Query |
| Routing | Wouter |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

---

## Project Structure

```
project/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── db.ts
├── shared/
│   └── schema.ts
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Step 1: Initialize Project

### Create package.json

```json
{
  "name": "catering-management",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "cross-env NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@tanstack/react-query": "^5.62.7",
    "@vitejs/plugin-react": "^4.3.4",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cross-env": "^7.0.3",
    "date-fns": "^4.1.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.468.0",
    "mongoose": "^8.9.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss": "^4.0.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "wouter": "^3.5.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/express": "^5.0.0",
    "@types/express-session": "^1.18.1",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.14",
    "@types/react-dom": "^18.3.5"
  }
}
```

Run:
```bash
npm install
```

---

## Step 2: Configuration Files

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["client/src/*"],
      "@shared/*": ["shared/*"],
      "@assets/*": ["attached_assets/*"]
    }
  },
  "include": ["client/src", "server", "shared"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}", "./client/index.html"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

## Step 3: Shared Schema

### shared/schema.ts

```typescript
import { z } from "zod";

// ==================== VALIDATION HELPERS ====================

const sanitizeString = (val: string) => val.trim().slice(0, 500);
const sanitizeName = (val: string) => val.trim().slice(0, 100);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 15);

// ==================== FOOD ITEMS ====================

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  dietaryTags?: string[];
  price?: number;
  rating?: number;
}

export const insertFoodItemSchema = z.object({
  name: z.string()
    .min(1, "Food item name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeName),
  description: z.string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .transform(sanitizeString),
  category: z.string().min(1, "Category is required").max(50),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  dietaryTags: z.array(z.string()).optional(),
  price: z.number().int().min(1, "Price must be at least 1").optional(),
  rating: z.number().min(0).max(5, "Rating must be between 0 and 5").optional(),
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

// ==================== EVENT BOOKINGS ====================

export interface EventBooking {
  id: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  pricePerPlate: number;
  servingBoysNeeded: number;
  status: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string | null;
  advancePaymentStatus: string;
  finalPaymentStatus: string;
  advancePaymentScreenshot?: string | null;
  finalPaymentScreenshot?: string | null;
  totalAmount?: number;
  advanceAmount?: number;
  createdAt: string;
}

export const insertEventBookingSchema = z.object({
  clientName: z.string()
    .min(1, "Client name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .transform(sanitizeName),
  eventDate: z.string().min(1, "Event date is required").refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  eventType: z.string().min(1, "Event type is required").max(50),
  guestCount: z.number().int().min(1, "At least 1 guest is required").max(10000),
  pricePerPlate: z.number().int().min(1, "Price must be at least 1").max(100000),
  servingBoysNeeded: z.number().int().min(1).max(100).default(2),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits").transform(sanitizePhone),
  specialRequests: z.string().max(1000).nullable().optional(),
});

export const updateEventBookingSchema = insertEventBookingSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  advancePaymentStatus: z.enum(["pending", "paid"]).optional(),
  finalPaymentStatus: z.enum(["pending", "paid"]).optional(),
  advancePaymentScreenshot: z.string().nullable().optional(),
  finalPaymentScreenshot: z.string().nullable().optional(),
  totalAmount: z.number().int().positive().optional(),
  advanceAmount: z.number().int().positive().optional(),
});

export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;

// ==================== COMPANY INFO ====================

export interface CompanyInfo {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  eventsPerYear: number;
  websiteUrl?: string;
  upiId?: string;
  minAdvanceBookingDays?: number;
}

export const insertCompanyInfoSchema = z.object({
  companyName: z.string().max(100).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).transform(sanitizePhone).optional(),
  address: z.string().max(500).optional(),
  eventsPerYear: z.number().int().min(0).max(100000).default(500).optional(),
  websiteUrl: z.string().url().optional(),
  upiId: z.string().regex(/^[\w\-@.]+$/, "Invalid UPI ID format").optional(),
  minAdvanceBookingDays: z.number().int().min(0).max(30).default(2).optional(),
});

export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;

// ==================== STAFF ====================

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  createdAt: string;
}

export const insertStaffSchema = z.object({
  name: z.string().min(1).min(2).max(100).transform(sanitizeName),
  role: z.string().min(1).max(50),
  phone: z.string().min(10).transform(sanitizePhone),
});

export const updateStaffSchema = insertStaffSchema.partial();

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;

// ==================== CUSTOMER REVIEWS ====================

export interface CustomerReview {
  id: string;
  customerName: string;
  eventType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const insertCustomerReviewSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  eventType: z.string().min(1, "Event type is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type InsertCustomerReview = z.infer<typeof insertCustomerReviewSchema>;
```

---

## Step 4: Server Files

### server/db.ts

```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function connectDB() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export default mongoose;
```

### server/storage.ts

```typescript
import mongoose from "mongoose";
import type {
  FoodItem,
  InsertFoodItem,
  EventBooking,
  InsertEventBooking,
  UpdateEventBooking,
  CompanyInfo,
  InsertCompanyInfo,
  Staff,
  InsertStaff,
  CustomerReview,
  InsertCustomerReview,
} from "@shared/schema";

// ==================== MONGOOSE SCHEMAS ====================

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: null },
  dietaryTags: { type: [String], default: [] },
  price: { type: Number },
  rating: { type: Number },
});

const eventBookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  eventDate: { type: String, required: true },
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true },
  pricePerPlate: { type: Number, required: true },
  servingBoysNeeded: { type: Number, default: 2 },
  status: { type: String, default: "pending" },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  specialRequests: { type: String, default: null },
  advancePaymentStatus: { type: String, default: "pending" },
  finalPaymentStatus: { type: String, default: "pending" },
  advancePaymentScreenshot: { type: String, default: null },
  finalPaymentScreenshot: { type: String, default: null },
  totalAmount: { type: Number },
  advanceAmount: { type: Number },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const companyInfoSchema = new mongoose.Schema({
  companyName: { type: String, default: "Catering Company" },
  tagline: { type: String, default: "Delicious Food for Every Occasion" },
  description: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  eventsPerYear: { type: Number, default: 500 },
  websiteUrl: { type: String },
  upiId: { type: String },
  minAdvanceBookingDays: { type: Number, default: 2 },
});

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const customerReviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  eventType: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

// ==================== MODELS ====================

const FoodItemModel = mongoose.model("FoodItem", foodItemSchema);
const EventBookingModel = mongoose.model("EventBooking", eventBookingSchema);
const CompanyInfoModel = mongoose.model("CompanyInfo", companyInfoSchema);
const StaffModel = mongoose.model("Staff", staffSchema);
const CustomerReviewModel = mongoose.model("CustomerReview", customerReviewSchema);

// ==================== HELPER FUNCTIONS ====================

function toPlainObject<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

// ==================== STORAGE INTERFACE ====================

export interface IStorage {
  // Food Items
  getAllFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | null>;
  createFoodItem(data: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, data: Partial<InsertFoodItem>): Promise<FoodItem | null>;
  deleteFoodItem(id: string): Promise<boolean>;

  // Event Bookings
  getAllBookings(): Promise<EventBooking[]>;
  getBooking(id: string): Promise<EventBooking | null>;
  createBooking(data: InsertEventBooking): Promise<EventBooking>;
  updateBooking(id: string, data: UpdateEventBooking): Promise<EventBooking | null>;
  deleteBooking(id: string): Promise<boolean>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | null>;
  updateCompanyInfo(data: InsertCompanyInfo): Promise<CompanyInfo>;

  // Staff
  getAllStaff(): Promise<Staff[]>;
  getStaff(id: string): Promise<Staff | null>;
  createStaff(data: InsertStaff): Promise<Staff>;
  updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff | null>;
  deleteStaff(id: string): Promise<boolean>;

  // Reviews
  getAllReviews(): Promise<CustomerReview[]>;
  createReview(data: InsertCustomerReview): Promise<CustomerReview>;
  deleteReview(id: string): Promise<boolean>;
}

// ==================== MONGODB STORAGE ====================

export const storage: IStorage = {
  // Food Items
  async getAllFoodItems() {
    const items = await FoodItemModel.find();
    return items.map((item) => toPlainObject<FoodItem>(item));
  },

  async getFoodItem(id) {
    const item = await FoodItemModel.findById(id);
    return item ? toPlainObject<FoodItem>(item) : null;
  },

  async createFoodItem(data) {
    const item = await FoodItemModel.create(data);
    return toPlainObject<FoodItem>(item);
  },

  async updateFoodItem(id, data) {
    const item = await FoodItemModel.findByIdAndUpdate(id, data, { new: true });
    return item ? toPlainObject<FoodItem>(item) : null;
  },

  async deleteFoodItem(id) {
    const result = await FoodItemModel.findByIdAndDelete(id);
    return !!result;
  },

  // Event Bookings
  async getAllBookings() {
    const bookings = await EventBookingModel.find().sort({ createdAt: -1 });
    return bookings.map((b) => toPlainObject<EventBooking>(b));
  },

  async getBooking(id) {
    const booking = await EventBookingModel.findById(id);
    return booking ? toPlainObject<EventBooking>(booking) : null;
  },

  async createBooking(data) {
    const booking = await EventBookingModel.create(data);
    return toPlainObject<EventBooking>(booking);
  },

  async updateBooking(id, data) {
    const booking = await EventBookingModel.findByIdAndUpdate(id, data, { new: true });
    return booking ? toPlainObject<EventBooking>(booking) : null;
  },

  async deleteBooking(id) {
    const result = await EventBookingModel.findByIdAndDelete(id);
    return !!result;
  },

  // Company Info
  async getCompanyInfo() {
    let info = await CompanyInfoModel.findOne();
    if (!info) {
      info = await CompanyInfoModel.create({});
    }
    return toPlainObject<CompanyInfo>(info);
  },

  async updateCompanyInfo(data) {
    let info = await CompanyInfoModel.findOne();
    if (info) {
      Object.assign(info, data);
      await info.save();
    } else {
      info = await CompanyInfoModel.create(data);
    }
    return toPlainObject<CompanyInfo>(info);
  },

  // Staff
  async getAllStaff() {
    const staff = await StaffModel.find();
    return staff.map((s) => toPlainObject<Staff>(s));
  },

  async getStaff(id) {
    const staff = await StaffModel.findById(id);
    return staff ? toPlainObject<Staff>(staff) : null;
  },

  async createStaff(data) {
    const staff = await StaffModel.create(data);
    return toPlainObject<Staff>(staff);
  },

  async updateStaff(id, data) {
    const staff = await StaffModel.findByIdAndUpdate(id, data, { new: true });
    return staff ? toPlainObject<Staff>(staff) : null;
  },

  async deleteStaff(id) {
    const result = await StaffModel.findByIdAndDelete(id);
    return !!result;
  },

  // Reviews
  async getAllReviews() {
    const reviews = await CustomerReviewModel.find().sort({ createdAt: -1 });
    return reviews.map((r) => toPlainObject<CustomerReview>(r));
  },

  async createReview(data) {
    const review = await CustomerReviewModel.create(data);
    return toPlainObject<CustomerReview>(review);
  },

  async deleteReview(id) {
    const result = await CustomerReviewModel.findByIdAndDelete(id);
    return !!result;
  },
};
```

### server/routes.ts

```typescript
import { Router, Request, Response } from "express";
import { storage } from "./storage";
import {
  insertFoodItemSchema,
  insertEventBookingSchema,
  updateEventBookingSchema,
  insertCompanyInfoSchema,
  insertStaffSchema,
  updateStaffSchema,
  insertCustomerReviewSchema,
} from "@shared/schema";

const router = Router();

// ==================== FOOD ITEMS ====================

router.get("/api/food-items", async (req: Request, res: Response) => {
  try {
    const items = await storage.getAllFoodItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

router.get("/api/food-items/:id", async (req: Request, res: Response) => {
  try {
    const item = await storage.getFoodItem(req.params.id);
    if (!item) return res.status(404).json({ error: "Food item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch food item" });
  }
});

router.post("/api/food-items", async (req: Request, res: Response) => {
  try {
    const data = insertFoodItemSchema.parse(req.body);
    const item = await storage.createFoodItem(data);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/food-items/:id", async (req: Request, res: Response) => {
  try {
    const data = insertFoodItemSchema.partial().parse(req.body);
    const item = await storage.updateFoodItem(req.params.id, data);
    if (!item) return res.status(404).json({ error: "Food item not found" });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/food-items/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteFoodItem(req.params.id);
    if (!success) return res.status(404).json({ error: "Food item not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete food item" });
  }
});

// ==================== EVENT BOOKINGS ====================

router.get("/api/bookings", async (req: Request, res: Response) => {
  try {
    const bookings = await storage.getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.get("/api/bookings/:id", async (req: Request, res: Response) => {
  try {
    const booking = await storage.getBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

router.post("/api/bookings", async (req: Request, res: Response) => {
  try {
    const data = insertEventBookingSchema.parse(req.body);
    const booking = await storage.createBooking(data);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/bookings/:id", async (req: Request, res: Response) => {
  try {
    const data = updateEventBookingSchema.parse(req.body);
    const booking = await storage.updateBooking(req.params.id, data);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/bookings/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteBooking(req.params.id);
    if (!success) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// ==================== COMPANY INFO ====================

router.get("/api/company-info", async (req: Request, res: Response) => {
  try {
    const info = await storage.getCompanyInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch company info" });
  }
});

router.patch("/api/company-info", async (req: Request, res: Response) => {
  try {
    const data = insertCompanyInfoSchema.parse(req.body);
    const info = await storage.updateCompanyInfo(data);
    res.json(info);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== STAFF ====================

router.get("/api/staff", async (req: Request, res: Response) => {
  try {
    const staff = await storage.getAllStaff();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

router.post("/api/staff", async (req: Request, res: Response) => {
  try {
    const data = insertStaffSchema.parse(req.body);
    const staff = await storage.createStaff(data);
    res.status(201).json(staff);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/api/staff/:id", async (req: Request, res: Response) => {
  try {
    const data = updateStaffSchema.parse(req.body);
    const staff = await storage.updateStaff(req.params.id, data);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.json(staff);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/staff/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteStaff(req.params.id);
    if (!success) return res.status(404).json({ error: "Staff not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete staff" });
  }
});

// ==================== REVIEWS ====================

router.get("/api/reviews", async (req: Request, res: Response) => {
  try {
    const reviews = await storage.getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/api/reviews", async (req: Request, res: Response) => {
  try {
    const data = insertCustomerReviewSchema.parse(req.body);
    const review = await storage.createReview(data);
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/reviews/:id", async (req: Request, res: Response) => {
  try {
    const success = await storage.deleteReview(req.params.id);
    if (!success) return res.status(404).json({ error: "Review not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
```

### server/index.ts

```typescript
import express from "express";
import { connectDB } from "./db";
import routes from "./routes";

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(
        `${new Date().toLocaleTimeString()} [express] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`
      );
    }
  });
  next();
});

// API Routes
app.use(routes);

// Start server
async function start() {
  await connectDB();

  // In development, Vite handles the frontend
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app);
  } else {
    // In production, serve static files
    app.use(express.static("dist/public"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
```

### server/vite.ts

```typescript
import type { Express } from "express";
import { createServer as createViteServer } from "vite";

export async function setupVite(app: Express) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
}
```

---

## Step 5: Client Setup

### client/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Catering Management System</title>
    <link rel="icon" type="image/png" href="/favicon.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### client/src/main.tsx

```typescript
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### client/src/App.tsx

```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import CustomerHome from "@/pages/customer-home";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminFoodItems from "@/pages/admin-food-items";
import AdminEventBookings from "@/pages/admin-event-bookings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/food-items" component={AdminFoodItems} />
      <Route path="/admin/bookings" component={AdminEventBookings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

### client/src/lib/queryClient.ts

```typescript
import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        await throwIfResNotOk(res);
        return res.json();
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### client/src/lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 6: UI Components

Install Shadcn UI components. Create these files in `client/src/components/ui/`:

### button.tsx

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### card.tsx

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardContent };
```

### input.tsx

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

### label.tsx

```typescript
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

---

## Step 7: Pages

### client/src/pages/customer-home.tsx

```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { FoodItem, CompanyInfo } from "@shared/schema";

export default function CustomerHome() {
  const { data: foodItems, isLoading: foodLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const categories = [...new Set(foodItems?.map((item) => item.category) || [])];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="text-center space-y-4 p-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            {companyInfo?.companyName || "Catering Services"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {companyInfo?.tagline || "Delicious food for every occasion"}
          </p>
          <Link href="/booking">
            <Button size="lg" data-testid="button-book-now">
              Book Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Our Menu</h2>

        {foodLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-2xl font-semibold mb-6 capitalize">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {foodItems
                    ?.filter((item) => item.category === category)
                    .map((item) => (
                      <Card key={item.id} data-testid={`card-food-item-${item.id}`}>
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                        )}
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{item.description}</p>
                          {item.price && (
                            <p className="mt-2 font-semibold">
                              Rs. {item.price.toLocaleString("en-IN")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-muted-foreground">{companyInfo?.email || "info@example.com"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Phone</h4>
              <p className="text-muted-foreground">{companyInfo?.phone || "+91 XXXXX XXXXX"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Address</h4>
              <p className="text-muted-foreground">{companyInfo?.address || "Your City"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### client/src/pages/admin-dashboard.tsx

```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Utensils, Calendar, Users, IndianRupee } from "lucide-react";
import type { EventBooking, FoodItem, Staff } from "@shared/schema";

export default function AdminDashboard() {
  const { data: bookings } = useQuery<EventBooking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const totalRevenue = bookings?.reduce((sum, b) => {
    if (b.advancePaymentStatus === "paid" || b.finalPaymentStatus === "paid") {
      return sum + (b.totalAmount || b.guestCount * b.pricePerPlate);
    }
    return sum;
  }, 0) || 0;

  const pendingBookings = bookings?.filter((b) => b.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link href="/">
            <Button variant="outline">View Website</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-bookings">
                {bookings?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingBookings} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-menu-items">
                {foodItems?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-staff">
                {staff?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                Rs. {totalRevenue.toLocaleString("en-IN")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/food-items">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold">Manage Menu</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove food items</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold">Manage Bookings</h3>
                <p className="text-sm text-muted-foreground">View and manage event bookings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/staff">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold">Manage Staff</h3>
                <p className="text-sm text-muted-foreground">Add or remove staff members</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/not-found.tsx

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 8: Styling

### client/src/index.css

```css
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}

* {
  @apply border-border;
}

body {
  @apply bg-background text-foreground;
  font-family: system-ui, -apple-system, sans-serif;
}
```

---

## Running the Project

1. **Set environment variables:**
   ```bash
   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/catering"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5000
   ```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `SESSION_SECRET` | Secret for session encryption |
| `NODE_ENV` | development or production |

---

## Summary

This project consists of:

1. **Backend (Express + MongoDB)**
   - `server/db.ts` - Database connection
   - `server/storage.ts` - CRUD operations
   - `server/routes.ts` - API endpoints
   - `server/index.ts` - Server entry point

2. **Frontend (React + Vite)**
   - `client/src/App.tsx` - Main app with routing
   - `client/src/pages/` - Page components
   - `client/src/components/ui/` - Reusable UI components
   - `client/src/lib/` - Utilities and API client

3. **Shared**
   - `shared/schema.ts` - Type definitions and validation

4. **Configuration**
   - `package.json` - Dependencies and scripts
   - `tsconfig.json` - TypeScript config
   - `vite.config.ts` - Vite build config
   - `tailwind.config.ts` - Styling config

Estimated build time: **30-40 hours** for a complete implementation.
