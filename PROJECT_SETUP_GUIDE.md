# Ravi Canteen - Project Setup Guide

## Overview

Ravi Canteen is a full-stack catering management system built with modern web technologies. The application features a customer-facing website, an admin management panel, and chef printout functionality - all powered by an in-memory storage system for lightweight deployment and easy testing.

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** - Fast build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### Backend
- **Node.js** with Express
- **TypeScript** - Type-safe server code
- **Zod** - Schema validation
- **In-Memory Storage** - Fast, lightweight data persistence

### Key Features
- ✅ Dark/Light mode theme toggle
- ✅ Debounced search across all pages
- ✅ Mobile-responsive design
- ✅ Real-time data updates
- ✅ Type-safe API communication
- ✅ Form validation with React Hook Form + Zod

## Architecture

### Data Storage

The application uses **in-memory storage** (MemStorage) instead of traditional databases. This provides:
- ✅ Zero configuration - No database setup required
- ✅ Fast performance - All data in memory
- ✅ Easy testing - Data resets on server restart
- ✅ Simple deployment - No database dependencies

**Note:** Data is stored in server memory and will reset when the server restarts. This is perfect for development, testing, and demonstrations.

### Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # Shadcn components
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── hooks/        # Custom React hooks
│   │   │   ├── use-toast.ts
│   │   │   └── use-debounced-value.ts
│   │   ├── lib/          # Utilities and configurations
│   │   │   └── queryClient.ts
│   │   ├── pages/        # Application pages
│   │   │   ├── customer-home.tsx
│   │   │   ├── admin-login.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── admin-food-items.tsx
│   │   │   ├── admin-event-bookings.tsx
│   │   │   ├── admin-staff.tsx
│   │   │   ├── admin-company-settings.tsx
│   │   │   └── admin-chef-printout.tsx
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   └── index.html
│
├── server/                # Backend Express application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # IStorage interface & MemStorage implementation
│   ├── db-storage.ts     # Storage export
│   ├── index.ts          # Server entry point
│   └── vite.ts           # Vite integration
│
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # TypeScript types and Zod schemas
│
└── attached_assets/      # Static assets (images, etc.)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd ravi-canteen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   This starts both the frontend (Vite) and backend (Express) on the same port.

4. **Access the application**
   - Customer website: `http://localhost:5000`
   - Admin login: `http://localhost:5000/admin/login`
   - Admin credentials: `admin` / `admin123`

## Application Features

### Customer Website
- **Hero Section** - Beautiful landing page with company branding
- **Menu Browser** - Category filtering and debounced search
- **Responsive Design** - Mobile-friendly layouts
- **Dark Mode** - Theme toggle in navigation

### Admin Panel

#### Dashboard Overview
- Quick stats and insights
- Recent bookings summary
- Revenue overview

#### Food Items Management
- Add, edit, and delete menu items
- Category organization (Appetizers, Main Courses, Desserts, Beverages)
- Image URLs for visual appeal
- Debounced search for quick filtering

#### Event Bookings
- Create and manage catering bookings
- Client information tracking
- Guest count and pricing
- Food item selection with quantities
- Status management (Pending, Confirmed, Completed, Cancelled)
- Chef printout generation for each booking
- Debounced search by client name, email, event type

#### Staff Management
- Add team members (Chefs, Workers, Serving Boys)
- Track experience and salary information
- Profile images
- Role-based organization
- Debounced search by name, role, phone

#### Company Settings
- Update company name and tagline
- Set events-per-year capacity
- Customize branding

#### Chef Printout
- Print-optimized booking details
- Complete food item list with quantities
- Event information for kitchen staff

## Data Models

### FoodItem
```typescript
{
  id: string
  name: string
  description: string
  category: "appetizer" | "main" | "dessert" | "beverage"
  imageUrl: string | null
  createdAt: string
}
```

### EventBooking
```typescript
{
  id: string
  clientName: string
  eventDate: string
  eventType: string
  guestCount: number
  pricePerPlate: number
  servingBoysNeeded: number
  contactEmail: string
  contactPhone: string
  specialRequests: string | null
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
}
```

### BookingItem
```typescript
{
  id: string
  bookingId: string
  foodItemId: string
  quantity: number
  createdAt: string
}
```

### Staff
```typescript
{
  id: string
  name: string
  role: "chef" | "worker" | "serving_boy"
  phone: string
  experience: string
  salary: number
  imageUrl: string | null
  createdAt: string
}
```

### CompanyInfo
```typescript
{
  id: string
  companyName: string
  tagline: string
  eventsPerYear: number
}
```

## API Endpoints

### Food Items
- `GET /api/food-items` - List all food items
- `POST /api/food-items` - Create new food item
- `PATCH /api/food-items/:id` - Update food item
- `DELETE /api/food-items/:id` - Delete food item

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/:id/items` - Get booking items with food details

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create new staff member
- `PATCH /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Company Info
- `GET /api/company-info` - Get company information
- `POST /api/company-info` - Create company info (first time only)
- `PATCH /api/company-info/:id` - Update company info

## Development Tips

### Adding New Features

1. **Define types in `shared/schema.ts`**
   - Create TypeScript interfaces
   - Create Zod validation schemas
   - Export insert and select types

2. **Update storage interface in `server/storage.ts`**
   - Add CRUD methods to `IStorage` interface
   - Implement methods in `MemStorage` class

3. **Create API routes in `server/routes.ts`**
   - Add Express route handlers
   - Use Zod schemas for validation
   - Call storage methods

4. **Build frontend pages in `client/src/pages/`**
   - Use TanStack Query for data fetching
   - Use React Hook Form for forms
   - Add debounced search where appropriate

### Using Debounced Search

The `useDebouncedValue` hook prevents excessive filtering during user typing:

```typescript
import { useDebouncedValue } from "@/hooks/use-debounced-value";

function MyComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
}
```

### Theme Management

Dark mode is handled by the ThemeProvider:

```typescript
import { ThemeToggle } from "@/components/theme-toggle";

// Add toggle button anywhere
<ThemeToggle />
```

## Deployment

### Production Build

```bash
npm run build
```

This creates optimized production builds for both frontend and backend.

### Environment Variables

No environment variables are required for the basic setup since the application uses in-memory storage.

## Troubleshooting

### Data not persisting
- **Expected behavior** - In-memory storage resets on server restart
- For persistent data, consider migrating to PostgreSQL or MongoDB

### Port already in use
- Change port in `vite.config.ts` (default: 5000)
- Or kill the process using the port

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear cache: `npm run build --force`

## Future Enhancements

- Persistent database integration (PostgreSQL/MongoDB)
- Email notifications for booking confirmations
- Customer booking portal
- Invoice generation and PDF exports
- Multi-user admin roles and permissions
- Analytics and reporting dashboard
- Image upload functionality
- Payment gateway integration

## Support

For questions or issues:
- Check the code comments in key files
- Review the Shadcn/ui documentation for component usage
- Consult the TanStack Query docs for data fetching patterns

## License

[Specify your license here]

---

**Happy Coding!** 🎉
