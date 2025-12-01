# OM Caterers - Project Development Guide

A comprehensive guide to building this catering management application from scratch.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Step-by-Step Development Guide](#step-by-step-development-guide)
5. [Frontend Development](#frontend-development)
6. [Backend Development](#backend-development)
7. [Database Setup](#database-setup)
8. [Styling & Theming](#styling--theming)
9. [Deployment](#deployment)

---

## Project Overview

OM Caterers is a full-stack web application for a catering business that includes:
- **Customer-facing website**: Beautiful landing page with menu showcase, testimonials, and contact form
- **Admin dashboard**: Complete management system for food items, event bookings, staff, and company settings

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **TanStack Query (React Query)** - Data fetching and caching
- **Wouter** - Lightweight routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - Database (via Mongoose)
- **TypeScript** - Type safety

---

## Project Structure

```
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── App.tsx           # Main app with routing
│   │   └── index.css         # Global styles & theme
│   └── index.html
├── server/                    # Backend application
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   └── vite.ts               # Vite integration
├── shared/                    # Shared types and schemas
│   └── schema.ts             # Data models with Zod
└── package.json
```

---

## Step-by-Step Development Guide

### Phase 1: Project Setup

#### 1.1 Initialize the Project
```bash
# Create new Vite project with React + TypeScript
npm create vite@latest om-caterers -- --template react-ts
cd om-caterers
npm install
```

#### 1.2 Install Dependencies

**Frontend dependencies:**
```bash
npm install @tanstack/react-query wouter react-hook-form @hookform/resolvers zod framer-motion lucide-react
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
```

**Backend dependencies:**
```bash
npm install express mongoose bcryptjs
npm install -D @types/express @types/node tsx
```

#### 1.3 Configure Tailwind CSS
```bash
npx tailwindcss init -p
```

Update `tailwind.config.ts` with custom theme colors and shadcn/ui configuration.

---

### Phase 2: Frontend Development (Start Here)

#### 2.1 Set Up the Theme (index.css)

Define CSS variables for colors, following a warm amber/orange theme:

```css
:root {
  --background: 30 20% 98%;
  --foreground: 30 10% 10%;
  --primary: 30 80% 45%;
  --primary-foreground: 30 10% 98%;
  /* ... more variables */
}

.dark {
  --background: 30 10% 10%;
  --foreground: 30 10% 98%;
  /* ... dark mode variables */
}
```

#### 2.2 Create Shared Schema (shared/schema.ts)

Define your data models first - this ensures consistency:

```typescript
import { z } from "zod";

// Food Item Schema
export const insertFoodItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  dietaryTags: z.array(z.string()).optional(),
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = InsertFoodItem & { id: string };

// Event Booking Schema
export const insertEventBookingSchema = z.object({
  clientName: z.string().min(1),
  eventDate: z.string(),
  eventType: z.string(),
  guestCount: z.number().min(1),
  pricePerPlate: z.number().min(0),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  specialRequests: z.string().optional(),
});

// ... more schemas
```

#### 2.3 Build the Customer Home Page

Create `client/src/pages/customer-home.tsx`:

1. **Hero Section** - Eye-catching header with company name, tagline, and CTA buttons
2. **Features Section** - Highlight key services (Expert Chefs, Premium Quality, etc.)
3. **Menu Section** - Display food items in a responsive grid with category filtering
4. **Testimonials** - Customer reviews carousel
5. **Contact Section** - Contact form and company information
6. **Footer** - Links and copyright

Key features to implement:
- Smooth scroll animations using Framer Motion
- Responsive design (mobile-first approach)
- Category dropdown for mobile, button row for desktop
- Search functionality for menu items

#### 2.4 Build the Admin Pages

**Admin Login (`admin-login.tsx`):**
- Password-based authentication
- Gradient background with animations
- Secure session storage

**Admin Dashboard (`admin-dashboard.tsx`):**
- Sidebar navigation using shadcn/ui Sidebar
- Theme toggle
- Route management for sub-pages

**Admin Food Items (`admin-food-items.tsx`):**
- CRUD operations for menu items
- Image URL support
- Category management
- Search and filter functionality
- Mobile-responsive table/card view

**Admin Event Bookings (`admin-event-bookings.tsx`):**
- Create and manage event bookings
- Add menu items to bookings
- Status management (pending, confirmed, completed, cancelled)
- Guest count and pricing calculations

**Admin Account (`admin-account.tsx`):**
- Change admin password
- Security settings

---

### Phase 3: Backend Development

#### 3.1 Set Up Express Server (server/index.ts)

```typescript
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

const app = express();
app.use(express.json());

// Register API routes
registerRoutes(app);

// Set up Vite for development
setupVite(app);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
```

#### 3.2 Create API Routes (server/routes.ts)

```typescript
import { Router } from "express";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  // Food Items
  app.get("/api/food-items", async (req, res) => {
    const items = await storage.getFoodItems();
    res.json(items);
  });

  app.post("/api/food-items", async (req, res) => {
    const item = await storage.createFoodItem(req.body);
    res.json(item);
  });

  // ... more routes for bookings, reviews, etc.
}
```

#### 3.3 Database Storage (server/storage.ts)

Implement the storage interface with MongoDB:

```typescript
import mongoose from "mongoose";

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define models
const FoodItemModel = mongoose.model("FoodItem", foodItemSchema);

// Storage operations
export const storage = {
  async getFoodItems() {
    return FoodItemModel.find().exec();
  },
  
  async createFoodItem(data: InsertFoodItem) {
    const item = new FoodItemModel(data);
    return item.save();
  },
  
  // ... more operations
};
```

---

### Phase 4: Styling & Theming

#### 4.1 Color Scheme

The app uses a warm amber/orange theme:
- **Primary**: Amber tones (hsl 30-35)
- **Background**: Warm off-white/cream
- **Accents**: Orange highlights

#### 4.2 Component Styling

Use shadcn/ui components with custom variants:
- `Button` - Primary, secondary, ghost, outline variants
- `Card` - For content containers
- `Badge` - For tags and status indicators
- `Dialog` - For modals and forms

#### 4.3 Animations

Framer Motion for:
- Page transitions
- Hover effects
- Loading states
- Scroll-triggered animations

---

### Phase 5: Mobile Responsiveness

Key responsive patterns used:

1. **Navigation**: Dropdown select on mobile, buttons on desktop
2. **Grid layouts**: 2 columns mobile, 3-4 columns desktop
3. **Tables**: Card view on mobile, table on desktop
4. **Typography**: Scaled font sizes
5. **Spacing**: Reduced padding on mobile

---

### Phase 6: Deployment

#### 6.1 Build the Application
```bash
npm run build
```

#### 6.2 Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=your_secure_password
```

#### 6.3 Deploy
- Use Replit's built-in deployment
- Configure autoscale deployment target
- Set production environment variables

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Main routing and providers |
| `client/src/index.css` | Theme variables and global styles |
| `client/src/pages/customer-home.tsx` | Main customer-facing page |
| `client/src/pages/admin-dashboard.tsx` | Admin layout with sidebar |
| `shared/schema.ts` | Data models and validation |
| `server/routes.ts` | API endpoints |
| `server/storage.ts` | Database operations |

---

## Development Tips

1. **Start with the schema** - Define your data models before building UI
2. **Mobile-first** - Design for mobile, then enhance for desktop
3. **Component reuse** - Use shadcn/ui components consistently
4. **Type safety** - Leverage TypeScript throughout
5. **API consistency** - Use TanStack Query for all data fetching
6. **Form validation** - Use Zod schemas with React Hook Form

---

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm run start

# Type checking
npx tsc --noEmit
```
