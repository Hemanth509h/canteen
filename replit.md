# Food Catering Company Website

## Overview

A full-stack catering company web application with separate customer-facing and admin interfaces. The customer interface showcases food items with visual-first presentation and booking capabilities, while the admin dashboard provides comprehensive management of food items, event bookings, and company information. Built with React, Express, and PostgreSQL, emphasizing premium design aesthetics inspired by food delivery platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (customer home `/`, admin dashboard `/admin/*`)

**UI Component System**
- shadcn/ui component library (New York style preset) providing 40+ pre-built components
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theming (light/dark mode support via `--background`, `--foreground`, etc.)

**Design System**
- Typography: Poppins for headings, Inter for body text (via Google Fonts)
- Spacing system based on Tailwind units (2, 4, 6, 8, 12, 16, 20)
- Color system using HSL values with alpha channel support
- Border radius standardization (lg: 9px, md: 6px, sm: 3px)

**State Management**
- TanStack Query (React Query) v5 for server state management
- Query client configured with custom fetch functions and error handling
- React Hook Form with Zod resolvers for form validation

**Page Structure**
1. Customer Home (`/`) - Food catalog, hero section, company info display
2. Admin Dashboard (`/admin/*`) - Sidebar navigation with four main sections:
   - Dashboard Overview (metrics, revenue tracking)
   - Food Items Manager (CRUD operations)
   - Event Bookings Manager (booking status management)
   - Company Settings (editable company information)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- ESM module system throughout
- Middleware: JSON body parsing with raw body capture for webhook compatibility
- Request logging with duration tracking for API endpoints

**API Routes**
- RESTful API design under `/api` prefix
- Food Items: GET/POST/PATCH/DELETE `/api/food-items`
- Event Bookings: GET/POST/PATCH/DELETE `/api/bookings`
- Company Info: GET/POST/PATCH `/api/company-info`
- Zod schema validation on all POST/PATCH endpoints using `drizzle-zod`

**Development Environment**
- Vite middleware mode for HMR in development
- Custom error logging that exits process on critical errors
- Replit-specific plugins: runtime error overlay, cartographer, dev banner

**Storage Layer**
- In-memory storage implementation (`MemStorage`) for development
- Interface-based design (`IStorage`) for easy database migration
- Default seed data includes company info template

### Data Storage Solutions

**ORM & Schema**
- Drizzle ORM v0.39 for type-safe database operations
- PostgreSQL as the target database (configured via Neon serverless driver)
- Schema-first approach with TypeScript types inferred from Drizzle schemas

**Database Schema**
1. `food_items` table:
   - UUID primary key (auto-generated)
   - Fields: name, description, price (integer cents), category, imageUrl
   
2. `event_bookings` table:
   - UUID primary key (auto-generated)
   - Client info: clientName, contactEmail, contactPhone
   - Event details: eventDate, eventType, guestCount, pricePerPlate
   - Status tracking: status (pending/confirmed/completed/cancelled)
   - Timestamps: createdAt (auto-generated)

3. `company_info` table:
   - Single-row configuration table
   - Fields: companyName, tagline, description, contact details, eventsPerYear

**Migration System**
- Drizzle Kit for schema migrations
- Migrations output to `/migrations` directory
- `db:push` script for applying schema changes

### External Dependencies

**UI & Styling Libraries**
- @radix-ui/* - 20+ component primitives for accessible UI
- tailwindcss - Utility-first CSS framework
- class-variance-authority - Type-safe variant API for components
- embla-carousel-react - Touch-friendly carousel component
- lucide-react - Icon library

**Data & Validation**
- @tanstack/react-query - Async state management
- react-hook-form - Performant form handling
- zod - Schema validation
- drizzle-zod - Bridge between Drizzle and Zod schemas

**Database**
- @neondatabase/serverless - PostgreSQL serverless driver
- drizzle-orm - TypeScript ORM
- connect-pg-simple - PostgreSQL session store (prepared for future session management)

**Development Tools**
- @replit/vite-plugin-* - Replit development integrations
- tsx - TypeScript execution for development server
- esbuild - Production build bundler for server code

**Date Handling**
- date-fns v3.6 - Modern date utility library

**Routing**
- wouter - Minimalist routing library (2KB alternative to React Router)