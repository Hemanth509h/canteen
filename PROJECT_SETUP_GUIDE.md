# 🍽️ Ravi Canteen - Complete Project Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [File-by-File Explanation](#file-by-file-explanation)
5. [How the Application Works](#how-the-application-works)
6. [Setup Instructions](#setup-instructions)
7. [Development Workflow](#development-workflow)
8. [Deployment](#deployment)
9. [Customization Guide](#customization-guide)

---

## Project Overview

### What We're Building
A full-stack catering management application with:
- **Customer-facing website**: Browse menu, view company info
- **Admin panel**: Manage food items, bookings, staff, company settings
- **Chef printout**: Daily preparation sheets for kitchen staff

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: SQLite with Drizzle ORM
- **UI Framework**: Radix UI + Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: Wouter (lightweight client-side routing)
- **Authentication**: Simple bcrypt-based password hashing

---

## Prerequisites

### Required Knowledge
- JavaScript/TypeScript fundamentals
- React basics (components, hooks, state)
- Basic Node.js and Express.js
- SQL basics
- Command line/terminal usage

### Software Requirements
- **Node.js**: Version 20+ (check with `node --version`)
- **npm**: Version 10+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code (recommended) or any text editor

---

## Initial Setup

### Step 1: Create Project Directory

```bash
mkdir premium-catering
cd premium-catering
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

This creates `package.json` with default settings.

### Step 3: Set Module Type

Edit `package.json` and add:

```json
{
  "type": "module"
}
```

This allows you to use ES6 import/export syntax.

### Step 4: Install Core Dependencies

```bash
# Backend dependencies
npm install express drizzle-orm better-sqlite3 bcryptjs zod drizzle-zod
npm install express-session memorystore passport passport-local ws

# Frontend dependencies  
npm install react react-dom wouter @tanstack/react-query
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react react-icons react-hook-form @hookform/resolvers
npm install date-fns framer-motion

# Radix UI components (for accessible UI primitives)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-aspect-ratio @radix-ui/react-avatar
npm install @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-hover-card
npm install @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider
npm install @radix-ui/react-slot @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group
npm install @radix-ui/react-tooltip

# Shadcn specific
npm install next-themes cmdk vaul embla-carousel-react
npm install react-day-picker input-otp react-resizable-panels
npm install recharts tw-animate-css tailwindcss-animate
```

### Step 5: Install Development Dependencies

```bash
# TypeScript and type definitions
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D @types/express @types/express-session @types/bcryptjs
npm install -D @types/passport @types/passport-local @types/ws
npm install -D @types/better-sqlite3

# Build tools
npm install -D vite @vitejs/plugin-react esbuild tsx

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/typography @tailwindcss/vite

# Database tools
npm install -D drizzle-kit

# Replit plugins (optional - for Replit environment)
npm install -D @replit/vite-plugin-cartographer
npm install -D @replit/vite-plugin-dev-banner
npm install -D @replit/vite-plugin-runtime-error-modal

# Cross-platform compatibility
npm install -D cross-env
```

### Step 6: Create Project Structure

```bash
# Create directories
mkdir -p client/src/{components/ui,pages,lib,hooks}
mkdir -p server
mkdir -p shared
mkdir -p attached_assets
```

Your structure should look like:
```
premium-catering/
├── client/
│   └── src/
│       ├── components/
│       │   └── ui/          # Shadcn UI components
│       ├── pages/           # Page components
│       ├── lib/             # Utilities
│       └── hooks/           # Custom hooks
├── server/                  # Backend code
├── shared/                  # Shared types/schemas
├── attached_assets/         # Static assets
└── package.json
```

---

## Database Schema Design

### Step 1: Create Schema File

Create `shared/schema.ts`:

```typescript
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Food Items Table
export const foodItems = sqliteTable("food_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // appetizer, main, dessert, beverage
  imageUrl: text("image_url"),
});

// Event Bookings Table
export const eventBookings = sqliteTable("event_bookings", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  clientName: text("client_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventType: text("event_type").notNull(),
  guestCount: integer("guest_count").notNull(),
  pricePerPlate: integer("price_per_plate").notNull(),
  servingBoysNeeded: integer("serving_boys_needed").notNull().default(2),
  status: text("status").notNull().default("pending"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  specialRequests: text("special_requests"),
  createdAt: text("created_at").notNull().default(sql\`CURRENT_TIMESTAMP\`),
});

// Booking Items (many-to-many relationship)
export const bookingItems = sqliteTable("booking_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  bookingId: text("booking_id").notNull()
    .references(() => eventBookings.id, { onDelete: 'cascade' }),
  foodItemId: text("food_item_id").notNull()
    .references(() => foodItems.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql\`CURRENT_TIMESTAMP\`),
});

// Company Info Table
export const companyInfo = sqliteTable("company_info", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  companyName: text("company_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  eventsPerYear: integer("events_per_year").notNull().default(500),
});

// Staff Table
export const staff = sqliteTable("staff", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  role: text("role").notNull(), // chef, worker, serving_boy
  phone: text("phone").notNull(),
  experience: text("experience").notNull(),
  imageUrl: text("image_url"),
  salary: integer("salary").notNull(),
  createdAt: text("created_at").notNull().default(sql\`CURRENT_TIMESTAMP\`),
});

// Zod schemas for validation
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true });
export const insertEventBookingSchema = createInsertSchema(eventBookings).omit({
  id: true,
  createdAt: true,
  status: true,
});
export const updateEventBookingSchema = createInsertSchema(eventBookings)
  .omit({ id: true, createdAt: true }).partial();
export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({
  id: true,
  createdAt: true,
});
export const insertCompanyInfoSchema = createInsertSchema(companyInfo).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});
export const updateStaffSchema = createInsertSchema(staff)
  .omit({ id: true, createdAt: true }).partial();

// Type exports
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type EventBooking = typeof eventBookings.$inferSelect;
export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;
export type BookingItem = typeof bookingItems.$inferSelect;
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;
export type CompanyInfo = typeof companyInfo.$inferSelect;
export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
```

### Step 2: Configure Drizzle

Create `drizzle.config.ts`:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite3",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;
```

### Step 3: Add Database Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:push": "drizzle-kit push"
  }
}
```

### Step 4: Push Schema to Database

```bash
npm run db:push
```

This creates `sqlite.db` with all your tables.

---

## Backend Development

### Step 1: Create Storage Interface

Create `server/storage.ts`:

```typescript
import type {
  FoodItem, InsertFoodItem,
  EventBooking, InsertEventBooking, UpdateEventBooking,
  BookingItem, InsertBookingItem,
  CompanyInfo, InsertCompanyInfo,
  Staff, InsertStaff, UpdateStaff
} from "@shared/schema";

export interface IStorage {
  // Food Items
  getAllFoodItems(): Promise<FoodItem[]>;
  createFoodItem(data: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, data: Partial<InsertFoodItem>): Promise<FoodItem | null>;
  deleteFoodItem(id: string): Promise<boolean>;

  // Event Bookings
  getAllBookings(): Promise<EventBooking[]>;
  getBookingById(id: string): Promise<EventBooking | null>;
  createBooking(data: InsertEventBooking): Promise<EventBooking>;
  updateBooking(id: string, data: UpdateEventBooking): Promise<EventBooking | null>;
  deleteBooking(id: string): Promise<boolean>;

  // Booking Items
  getBookingItems(bookingId: string): Promise<BookingItem[]>;
  addBookingItems(items: InsertBookingItem[]): Promise<void>;
  deleteBookingItems(bookingId: string): Promise<void>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | null>;
  updateCompanyInfo(data: InsertCompanyInfo): Promise<CompanyInfo>;

  // Staff
  getAllStaff(): Promise<Staff[]>;
  createStaff(data: InsertStaff): Promise<Staff>;
  updateStaff(id: string, data: UpdateStaff): Promise<Staff | null>;
  deleteStaff(id: string): Promise<boolean>;
}
```

### Step 2: Implement Database Storage

Create `server/db.ts`:

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });
```

Create `server/storage-db.ts` (implementation of IStorage using Drizzle - refer to the actual file in your project for full implementation).

### Step 3: Create Express Routes

Create `server/routes.ts`:

```typescript
import express from "express";
import type { IStorage } from "./storage";

export function createRouter(storage: IStorage) {
  const router = express.Router();

  // Food Items Routes
  router.get("/food-items", async (req, res) => {
    const items = await storage.getAllFoodItems();
    res.json(items);
  });

  router.post("/food-items", async (req, res) => {
    const item = await storage.createFoodItem(req.body);
    res.json(item);
  });

  // ... more routes (see actual routes.ts for complete implementation)

  return router;
}
```

### Step 4: Create Main Server File

Create `server/index.ts`:

```typescript
import express from "express";
import { createRouter } from "./routes";
import { DatabaseStorage } from "./storage-db";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
const storage = new DatabaseStorage();
app.use("/api", createRouter(storage));

// Setup Vite or static serving based on environment
if (process.env.NODE_ENV === "development") {
  await setupVite(app);
} else {
  serveStatic(app);
}

app.listen(PORT, "0.0.0.0", () => {
  log(\`Server running on port \${PORT}\`);
});
```

---

## Frontend Development

### Step 1: Configure Tailwind CSS

Create `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... more color tokens
      }
    },
  },
  plugins: [],
} satisfies Config;
```

Create `client/src/index.css`:

```css
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  /* ... more CSS variables */
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 0 0% 95%;
  /* ... dark mode variables */
}
```

### Step 2: Setup Vite Configuration

Create `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
  },
});
```

### Step 3: Create shadcn/ui Components

Install shadcn components using their CLI or manually create components in `client/src/components/ui/`.

Key components to create:
- `button.tsx`
- `card.tsx`
- `input.tsx`
- `form.tsx`
- `select.tsx`
- `dialog.tsx`
- `toast.tsx`
- ... (see the actual project for all components)

### Step 4: Setup TanStack Query

Create `client/src/lib/queryClient.ts`:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(\`API request failed: \${response.statusText}\`);
  }

  return response;
}
```

### Step 5: Create Pages

#### Customer Home Page (`client/src/pages/customer-home.tsx`)

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FoodItem, CompanyInfo } from "@shared/schema";

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  // Render hero section, menu grid, etc.
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {/* Menu Grid */}
      {/* Footer */}
    </div>
  );
}
```

#### Admin Pages

Create pages for:
- `admin-login.tsx` - Admin authentication
- `admin-dashboard.tsx` - Main admin layout with sidebar
- `admin-food-items.tsx` - Manage menu items
- `admin-event-bookings.tsx` - Manage bookings
- `admin-chef-printout.tsx` - Chef preparation sheets
- `admin-staff.tsx` - Manage staff
- `admin-company-settings.tsx` - Company information

### Step 6: Create Main App Component

Create `client/src/App.tsx`:

```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import CustomerHome from "@/pages/customer-home";
import AdminLogin from "@/pages/admin-login";
// ... import other pages

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={CustomerHome} />
        <Route path="/admin/login" component={AdminLogin} />
        {/* More routes */}
      </Switch>
    </QueryClientProvider>
  );
}
```

### Step 7: Create Entry Point

Create `client/src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `client/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Premium Catering Services</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Scripts Configuration

Update `package.json`:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

---

## TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["server/**/*", "shared/**/*"]
}
```

Create `client/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"],
      "@assets/*": ["../attached_assets/*"]
    }
  },
  "include": ["src/**/*"]
}
```

---

## Deployment

### Deploying to Replit

1. Create a new Replit from template or import from Git
2. Replit automatically detects Node.js and installs dependencies
3. Configure the "Run" button to execute `npm run dev`
4. Click "Publish" in Replit to make it publicly accessible

### Deploying to Vercel

#### Step 1: Create `vercel.json`

See the `vercel.json` file created in this project for the complete configuration.

#### Step 2: Build Configuration

Vercel will:
1. Run `npm install`
2. Run `npm run build`
3. Serve the built application

#### Step 3: Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

---

## Testing

### Manual Testing Checklist

1. **Customer Website**:
   - [ ] Hero section loads with company info
   - [ ] Menu items display correctly
   - [ ] Category filter works
   - [ ] Scroll behavior is smooth

2. **Admin Login**:
   - [ ] Can login with credentials
   - [ ] Invalid credentials show error
   - [ ] Redirects to dashboard after login

3. **Admin Dashboard**:
   - [ ] All sidebar links work
   - [ ] Stats display correctly
   - [ ] Theme toggle works

4. **Food Items Management**:
   - [ ] Can create new items
   - [ ] Can edit existing items
   - [ ] Can delete items
   - [ ] Images upload correctly

5. **Event Bookings**:
   - [ ] Can create bookings
   - [ ] Can add menu items to bookings
   - [ ] Quantity calculations are correct
   - [ ] Can update booking status

6. **Chef Printout**:
   - [ ] Date selector works
   - [ ] Quantities calculated correctly
   - [ ] Print functionality works
   - [ ] All content prints on paper

7. **Staff Management**:
   - [ ] Can add staff members
   - [ ] Can edit staff info
   - [ ] Can delete staff

8. **Company Settings**:
   - [ ] Can update company info
   - [ ] Changes reflect on customer website

---

## Common Issues & Solutions

### Issue: "tsx: command not found"
**Solution**: Install cross-env and use it in scripts:
```bash
npm install -D cross-env
```

### Issue: Database migration errors
**Solution**: Delete `sqlite.db` and run `npm run db:push` again.

### Issue: Vite not finding modules
**Solution**: Check `vite.config.ts` alias configuration matches your imports.

### Issue: Print doesn't work correctly
**Solution**: Check print CSS in `admin-chef-printout.tsx` and ensure `@media print` styles are applied.

---

## Next Steps

After building the basic application:

1. **Add Authentication Improvements**
   - Implement JWT tokens
   - Add password reset functionality
   - Support multiple admin users

2. **Add Features**
   - Email notifications for bookings
   - SMS integration for reminders
   - Payment gateway integration
   - Invoice generation

3. **Improve UI/UX**
   - Add animations
   - Improve mobile responsiveness
   - Add loading states
   - Implement error boundaries

4. **Optimize Performance**
   - Implement image optimization
   - Add caching strategies
   - Lazy load components
   - Use React.memo where appropriate

5. **Add Testing**
   - Unit tests with Jest
   - Integration tests with Testing Library
   - E2E tests with Playwright

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)

---

**Congratulations!** You now have a complete understanding of how to build this catering management system from scratch. Follow each step carefully, and don't hesitate to refer back to this guide as you build.
