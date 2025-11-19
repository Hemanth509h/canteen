# Complete Project Explanation

## 📁 Folder Structure Overview

### **Root Level Folders**

#### 1. **`public/` and `dist/` folders**
- **`public/`**: This folder is NO LONGER USED in this project. Originally it was for static assets.
- **`dist/`**: This is automatically created when you build the project for production. It contains:
  - Compiled JavaScript files from TypeScript
  - Bundled frontend code from Vite
  - Static assets ready for deployment
  - **DO NOT edit files in `dist/` - they are auto-generated!**

#### 2. **`server/` folder** - Backend (Server-side code)
This is where all your backend/server code lives. It handles:
- Database connections
- API routes
- Business logic
- Data validation

#### 3. **`client/` folder** - Frontend (User interface)
This is where the visual part of your website lives. Everything users see in their browser.

#### 4. **`shared/` folder** - Common code
This folder contains code that both frontend and backend need to use, especially database schemas and types.

---

## 🔧 **SERVER FOLDER** (Backend Files) Explanation

### **`server/index.ts`** - Main Server Entry Point
**What it does:** This is the starting point of your entire backend application.

**How it works:**
1. Creates an Express.js server
2. Sets up middleware to handle:
   - JSON data from requests
   - Request logging (shows API calls in console)
3. Registers all API routes from `routes.ts`
4. In development: Sets up Vite for hot reloading
5. In production: Serves the built static files
6. Starts the server on port 5000

**Think of it as:** The main power switch that turns on your entire backend.

---

### **`server/routes.ts`** - API Endpoints
**What it does:** Defines all the URLs your frontend can call to get/send data.

**Available API Routes:**

#### Admin Routes:
- `POST /api/admin/login` - Admin login with password
- `POST /api/admin/change-password` - Change admin password

#### Food Items Routes:
- `GET /api/food-items` - Get all menu items
- `GET /api/food-items/:id` - Get one specific menu item
- `POST /api/food-items` - Create a new menu item
- `PATCH /api/food-items/:id` - Update a menu item
- `DELETE /api/food-items/:id` - Delete a menu item

#### Event Bookings Routes:
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get one specific booking
- `POST /api/bookings` - Create a new booking
- `PATCH /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Delete a booking

#### Company Info Routes:
- `GET /api/company-info` - Get company information
- `POST /api/company-info` - Create company info
- `PATCH /api/company-info/:id` - Update company info

#### Staff Routes:
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get one staff member
- `POST /api/staff` - Add new staff member
- `PATCH /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

**Each route:**
1. Receives data from frontend
2. Validates it using Zod schemas
3. Calls database functions
4. Returns response (success or error)

---

### **`server/db.ts`** - Database Connection
**What it does:** Creates and manages the connection to PostgreSQL database.

**How it works:**
- Uses Drizzle ORM (a tool to talk to database using TypeScript)
- Connects to Neon (serverless PostgreSQL)
- Exports the `db` object that other files use to query database

---

### **`server/db-storage.ts`** - Database Operations
**What it does:** Contains all the functions to interact with the database.

**Available Functions:**

#### Food Items:
- `getFoodItems()` - Get all food items
- `getFoodItem(id)` - Get one food item
- `createFoodItem(data)` - Add new food item
- `updateFoodItem(id, data)` - Update food item
- `deleteFoodItem(id)` - Delete food item

#### Event Bookings:
- `getBookings()` - Get all bookings (sorted by newest first)
- `getBooking(id)` - Get one booking
- `createBooking(data)` - Create new booking
- `updateBooking(id, data)` - Update booking
- `deleteBooking(id)` - Delete booking

#### Company Info:
- `getCompanyInfo()` - Get company info
- `createCompanyInfo(data)` - Create company info
- `updateCompanyInfo(id, data)` - Update company info

#### Staff:
- `getStaff()` - Get all staff
- `getStaffMember(id)` - Get one staff member
- `createStaffMember(data)` - Add staff member
- `updateStaffMember(id, data)` - Update staff member
- `deleteStaffMember(id)` - Delete staff member

**Think of it as:** The translator between your API routes and the actual database.

---

### **`server/storage.ts`** - Storage Interface
**What it does:** Defines the contract/blueprint that all storage systems must follow.

**Why it exists:** Makes it easy to switch from in-memory storage to database storage without changing other code.

---

### **`server/password-manager.ts`** - Admin Password Management
**What it does:** Handles admin password hashing and verification securely.

**Functions:**
- `verifyPassword(password)` - Check if password is correct
- `updatePassword(newPassword)` - Change admin password

**Security:** Uses bcrypt to hash passwords (never stores plain passwords).

---

### **`server/vite.ts`** - Development Server Setup
**What it does:** Connects Vite (frontend build tool) to Express in development mode.

**Why it exists:** Enables hot module replacement (HMR) - your frontend updates instantly when you save files.

---

### **`server/seed.ts`** - Database Seeding
**What it does:** Populates database with initial default data when first setup.

**Contains:** Default company information template.

---

## 📱 **CLIENT FOLDER** (Frontend Files) Explanation

### **`client/src/main.tsx`** - Frontend Entry Point
**What it does:** The starting point of your React application.

**How it works:**
1. Finds the HTML element with id="root"
2. Renders the App component into it
3. Enables React Strict Mode for better debugging

---

### **`client/src/App.tsx`** - Main App Component
**What it does:** Sets up the overall structure of your frontend application.

**Responsibilities:**
1. Sets up React Query for data fetching
2. Configures routing (which page shows for which URL)
3. Wraps app with providers (toast notifications, tooltips, etc.)

**Routes:**
- `/` - Customer home page (shows menu)
- `/admin` - Admin dashboard
- `/admin/food-items` - Manage food items
- `/admin/bookings` - Manage event bookings
- `/admin/company-settings` - Manage company info
- `/admin/staff` - Manage staff
- `/admin/account` - Admin account settings

---

### **`client/src/pages/`** - Page Components

#### **`customer-home.tsx`** - Customer-Facing Homepage
**What it shows:**
- Hero section with beautiful catering image
- Company information
- Food menu filtered by category (All, Appetizers, Main Courses, Desserts, Beverages)
- "View Our Menu" and event stats buttons

**Data it fetches:**
- Food items from `/api/food-items`
- Company info from `/api/company-info`

---

#### **`admin-dashboard.tsx`** - Admin Layout
**What it does:** Creates the sidebar navigation for admin area.

**Contains:**
- Sidebar with navigation links
- Main content area
- Header with logout button

---

#### **`admin-dashboard-overview.tsx`** - Admin Overview
**What it shows:**
- Total revenue from all bookings
- Number of pending bookings
- Number of confirmed bookings
- Recent bookings table

**Calculations:**
- Revenue = Sum of (guestCount × pricePerPlate) for all bookings
- Counts bookings by status

---

#### **`admin-food-items.tsx`** - Manage Menu Items
**What it allows:**
- View all food items in a table
- Add new food items
- Edit existing food items
- Delete food items
- Upload images for food items

**Form fields:**
- Name
- Description
- Price (in rupees)
- Category (Appetizers, Main Courses, Desserts, Beverages)
- Image

---

#### **`admin-event-bookings.tsx`** - Manage Bookings
**What it allows:**
- View all event bookings
- Add new bookings
- Edit bookings
- Delete bookings
- Update booking status (pending/confirmed/completed/cancelled)

**Form fields:**
- Client Name
- Event Date
- Event Type (Wedding, Corporate, etc.)
- Guest Count
- Price Per Plate
- Contact Email
- Contact Phone
- Special Requests
- Status (for editing only)

**Calculations:**
- Total = guestCount × pricePerPlate

---

#### **`admin-company-settings.tsx`** - Company Settings
**What it allows:**
- Edit company name
- Edit tagline
- Edit description
- Edit contact details (email, phone, address)
- Set events per year statistic

---

#### **`admin-staff.tsx`** - Manage Staff
**What it allows:**
- Add staff members (chefs, workers, serving boys)
- View staff list
- Edit staff details
- Delete staff
- Upload staff photos

**Form fields:**
- Name
- Role (Chef, Worker, Serving Boy)
- Phone
- Experience
- Salary
- Image

---

#### **`admin-account.tsx`** - Admin Account
**What it allows:**
- Change admin password

---

#### **`admin-login.tsx`** - Admin Login
**What it does:** Password-protected login to access admin area.

**Default password:** "admin123" (can be changed in admin account page)

---

### **`client/src/components/ui/`** - Reusable UI Components
This folder contains 40+ pre-built components from shadcn/ui library:
- Button, Card, Dialog, Table, Form, Input, Select, etc.
- These are styled consistently and accessible
- Used throughout the application

**Important:** These components use Tailwind CSS classes for styling.

---

### **`client/src/lib/`** - Frontend Utilities

#### **`queryClient.ts`** - React Query Configuration
**What it does:**
- Sets up React Query for data fetching
- Defines `apiRequest` function for making API calls
- Handles authentication errors

**How apiRequest works:**
```typescript
apiRequest("GET", "/api/bookings") // Fetch bookings
apiRequest("POST", "/api/bookings", data) // Create booking
apiRequest("PATCH", "/api/bookings/123", updates) // Update booking
apiRequest("DELETE", "/api/bookings/123") // Delete booking
```

---

#### **`utils.ts`** - Utility Functions
**Contains:** `cn()` function for merging CSS class names.

---

### **`client/src/hooks/`** - Custom React Hooks
- `use-toast.ts` - Hook for showing toast notifications
- `use-mobile.tsx` - Hook to detect mobile devices

---

### **`client/index.html`** - HTML Template
**What it does:** The main HTML file that loads your React app.

**Contains:**
- Root div element where React mounts
- Script tag to load main.tsx
- Meta tags for SEO

---

## 🔄 **SHARED FOLDER** (Common Code)

### **`shared/schema.ts`** - Database Schema & Types
**What it does:** Defines the structure of all database tables and validation rules.

#### Database Tables:

**1. `food_items` table:**
```typescript
{
  id: string (UUID, auto-generated)
  name: string
  description: string
  price: number (in rupees)
  category: string
  imageUrl: string (optional)
}
```

**2. `event_bookings` table:**
```typescript
{
  id: string (UUID, auto-generated)
  clientName: string
  eventDate: string
  eventType: string
  guestCount: number
  pricePerPlate: number (in rupees)
  status: string (pending/confirmed/completed/cancelled)
  contactEmail: string
  contactPhone: string
  specialRequests: string (optional)
  createdAt: string (auto-generated timestamp)
}
```

**3. `company_info` table:**
```typescript
{
  id: string (UUID, auto-generated)
  companyName: string
  tagline: string
  description: string
  email: string
  phone: string
  address: string
  eventsPerYear: number (default: 500)
}
```

**4. `staff` table:**
```typescript
{
  id: string (UUID, auto-generated)
  name: string
  role: string (chef/worker/serving_boy)
  phone: string
  experience: string
  imageUrl: string (optional)
  salary: number (monthly in rupees)
  createdAt: string (auto-generated)
}
```

**Validation Schemas:**
- `insertEventBookingSchema` - Validates new booking data
- `updateEventBookingSchema` - Validates booking updates
- Similar schemas for other tables

**Types:**
- `EventBooking` - Type for booking objects
- `FoodItem` - Type for food item objects
- `CompanyInfo` - Type for company info objects
- `Staff` - Type for staff objects

---

## 🔄 How Data Flows Through the Application

### Example: Creating a New Booking

1. **Frontend:** User fills booking form in `admin-event-bookings.tsx`
2. **Frontend:** Form validates data using `insertEventBookingSchema` from `shared/schema.ts`
3. **Frontend:** Calls `apiRequest("POST", "/api/bookings", data)` from `queryClient.ts`
4. **Backend:** Request hits `POST /api/bookings` route in `server/routes.ts`
5. **Backend:** Route validates data again using `insertEventBookingSchema`
6. **Backend:** Calls `storage.createBooking(data)` from `server/db-storage.ts`
7. **Database:** `db-storage.ts` inserts data into `event_bookings` table using Drizzle ORM
8. **Database:** Returns the created booking with generated ID
9. **Backend:** Route sends booking back as JSON response
10. **Frontend:** React Query caches the response and updates UI
11. **Frontend:** Shows success toast notification
12. **Frontend:** Booking appears in the table

---

## 🎨 Styling (CSS) in the Project

### Current Styling Approach: **Tailwind CSS**

**What is Tailwind CSS?**
- Utility-first CSS framework
- Instead of writing custom CSS, you use pre-defined class names
- Example: `className="text-red-500 font-bold p-4"` instead of custom CSS

**Where Tailwind is configured:**
- `tailwind.config.ts` - Tailwind configuration
- `client/src/index.css` - Global CSS with Tailwind directives
- `postcss.config.js` - PostCSS processes Tailwind

**Tailwind Classes Used:**
- Layout: `flex`, `grid`, `p-4`, `mt-2`, `gap-4`
- Colors: `bg-primary`, `text-muted-foreground`
- Typography: `font-bold`, `text-3xl`
- Responsive: `sm:p-8`, `md:grid-cols-2`

### If You Want to Use Regular CSS Instead:

You can add a `<style>` tag or separate `.css` file:

```tsx
// Option 1: Inline styles
<div style={{ padding: '20px', backgroundColor: '#fff' }}>

// Option 2: CSS file
import './custom.css';
<div className="my-custom-class">
```

---

## 🛠️ Configuration Files

### **`package.json`** - Project Dependencies
Lists all libraries used:
- **Runtime:** react, express, drizzle-orm
- **Dev tools:** typescript, vite, tsx
- **UI:** shadcn components, tailwind

**Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run db:push` - Sync database schema

---

### **`tsconfig.json`** - TypeScript Configuration
Configures how TypeScript compiles your code.

**Path aliases:**
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

---

### **`vite.config.ts`** - Vite Build Configuration
Configures Vite (frontend build tool):
- React plugin
- Path aliases
- Port configuration
- Build optimizations

---

### **`drizzle.config.ts`** - Database Migration Config
Tells Drizzle where to find:
- Schema files
- Migration files
- Database connection

---

## 🔐 Security

### Admin Password:
- Stored hashed in Replit secrets
- Default: "admin123"
- Can be changed in admin account page
- Uses bcrypt for hashing (industry standard)

### API Protection:
- All data validated using Zod schemas
- SQL injection protected by Drizzle ORM
- Errors caught and logged safely

---

## 📊 Database

### Technology: **PostgreSQL** (via Neon serverless)

**ORM: Drizzle**
- Type-safe database queries
- Auto-generates TypeScript types
- Migration system

**How to modify database:**
1. Edit schema in `shared/schema.ts`
2. Run `npm run db:push` to update database
3. Drizzle automatically handles migrations

---

## 🚀 Deployment

### Development:
```bash
npm run dev
```
- Runs on port 5000
- Hot reloading enabled
- Source maps for debugging

### Production:
```bash
npm run build   # Build frontend and backend
npm run start   # Run production server
```
- Optimized bundles
- No hot reloading
- Serves from `dist/` folder

---

## 📝 Summary

**Backend (Server folder):**
- `index.ts` → Starts server
- `routes.ts` → API endpoints
- `db-storage.ts` → Database operations
- `db.ts` → Database connection

**Frontend (Client folder):**
- `main.tsx` → Entry point
- `App.tsx` → Router setup
- `pages/` → All page components
- `components/ui/` → Reusable UI components

**Shared:**
- `schema.ts` → Database structure & types

**Data flow:** Frontend → API Route → DB Storage → Database → Response → Frontend

**Styling:** Tailwind CSS (can be replaced with regular CSS if needed)
