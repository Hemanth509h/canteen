# How to Build This Catering Management System from Scratch

This guide explains how to create this full-stack catering management application step by step.

---

## Prerequisites

Before starting, you need:

1. **Node.js** (version 20 or higher)
2. **MongoDB Atlas Account** (free tier works) - for database
3. **Basic knowledge** of:
   - JavaScript/TypeScript
   - React (frontend)
   - Express.js (backend)
   - HTML/CSS

---

## Tech Stack Used

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TypeScript |
| UI Components | Shadcn/UI + Tailwind CSS |
| Backend | Express.js + TypeScript |
| Database | MongoDB (with Mongoose) |
| State Management | TanStack React Query |
| Routing | Wouter (lightweight router) |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Animations | Framer Motion |

---

## Project Structure

```
project/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   └── index.html
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── db.ts               # MongoDB connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Zod schemas & TypeScript types
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Step-by-Step Guide

### Step 1: Set Up the Project

1. Create a new Replit project or local folder
2. Initialize Node.js project:
   ```bash
   npm init -y
   ```

3. Install dependencies:
   ```bash
   # Core dependencies
   npm install express mongoose react react-dom typescript vite
   
   # Frontend dependencies
   npm install @tanstack/react-query wouter react-hook-form @hookform/resolvers zod
   npm install framer-motion lucide-react date-fns
   
   # Styling
   npm install tailwindcss postcss autoprefixer
   npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs
   npm install class-variance-authority clsx tailwind-merge
   
   # Backend dependencies
   npm install express-session bcryptjs passport passport-local
   
   # Dev dependencies
   npm install -D @types/node @types/react @types/express tsx cross-env
   npm install -D @vitejs/plugin-react
   ```

### Step 2: Configure TypeScript

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Step 3: Set Up Tailwind CSS

Create `tailwind.config.ts`:
```typescript
export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Add more colors...
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Step 4: Create the Data Schema

In `shared/schema.ts`, define your data models:
```typescript
import { z } from "zod";

// Food Item
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  price?: number;
}

// Event Booking
export interface EventBooking {
  id: string;
  clientName: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  pricePerPlate: number;
  status: string;
  advancePaymentStatus: string;
  finalPaymentStatus: string;
  // ... more fields
}

// Validation schemas using Zod
export const insertFoodItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  category: z.string().min(1),
  // ... more validation
});
```

### Step 5: Set Up MongoDB Connection

In `server/db.ts`:
```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-uri";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
```

### Step 6: Create Storage Layer

In `server/storage.ts`, create CRUD operations:
```typescript
import mongoose from "mongoose";

// Define Mongoose schemas
const foodItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  imageUrl: String,
});

const FoodItemModel = mongoose.model("FoodItem", foodItemSchema);

// Storage interface
export const storage = {
  async getAllFoodItems() {
    return FoodItemModel.find();
  },
  
  async createFoodItem(data) {
    return FoodItemModel.create(data);
  },
  
  // ... more methods
};
```

### Step 7: Create API Routes

In `server/routes.ts`:
```typescript
import express from "express";
import { storage } from "./storage";

const router = express.Router();

// GET all food items
router.get("/api/food-items", async (req, res) => {
  const items = await storage.getAllFoodItems();
  res.json(items);
});

// POST new food item
router.post("/api/food-items", async (req, res) => {
  const item = await storage.createFoodItem(req.body);
  res.json(item);
});

export default router;
```

### Step 8: Create Express Server

In `server/index.ts`:
```typescript
import express from "express";
import { connectDB } from "./db";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(routes);

connectDB().then(() => {
  app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
  });
});
```

### Step 9: Create React Frontend

In `client/src/App.tsx`:
```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import HomePage from "./pages/customer-home";
import AdminDashboard from "./pages/admin-dashboard";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/admin" component={AdminDashboard} />
      </Switch>
    </QueryClientProvider>
  );
}
```

### Step 10: Create Page Components

Example page in `client/src/pages/customer-home.tsx`:
```typescript
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerHome() {
  const { data: foodItems, isLoading } = useQuery({
    queryKey: ["/api/food-items"],
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {foodItems?.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## Key Features to Implement

1. **Customer Side:**
   - View menu items by category
   - Create event bookings
   - Make payments (UPI integration)
   - Track booking status

2. **Admin Side:**
   - Dashboard with analytics
   - Manage food items (CRUD)
   - Manage bookings
   - Payment confirmation
   - Staff management
   - Company settings

3. **Staff Side:**
   - View assigned bookings
   - Accept/reject assignments

---

## Environment Variables Needed

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
SESSION_SECRET=your-secret-key
```

---

## Running the Project

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "node dist/server/index.js"
  }
}
```

Run in development:
```bash
npm run dev
```

---

## Tips for Success

1. **Start Simple** - Build one feature at a time
2. **Schema First** - Define your data models before coding
3. **Test APIs** - Use tools like Postman to test endpoints
4. **Component Library** - Use Shadcn/UI for consistent design
5. **Type Safety** - Use TypeScript and Zod for validation
6. **Error Handling** - Always handle errors gracefully
7. **Mobile First** - Design for mobile, then scale up

---

## Estimated Time

| Phase | Duration |
|-------|----------|
| Setup & Configuration | 2-3 hours |
| Database & API | 4-6 hours |
| Customer Pages | 6-8 hours |
| Admin Dashboard | 8-10 hours |
| Payment Integration | 4-6 hours |
| Testing & Polish | 4-6 hours |
| **Total** | **28-39 hours** |

---

## Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/UI](https://ui.shadcn.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Guide](https://expressjs.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)
