# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and SQLite. The platform serves two primary user groups: customers who can browse the menu and book catering services, and administrators who manage food items, event bookings, staff, and company settings. The application features a customer-facing website for browsing services and an admin panel for managing all aspects of the catering business.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### UPI Payment Integration with Advance & Final Payment Tracking (December 01, 2025)
- **Added:** Complete UPI payment system with two-stage payment collection
  - **Admin can set UPI ID** in Company Settings
  - **Dynamic QR code generation** for each booking with payment stage info
  - **Two Payment Stages:**
    - Advance Payment: 50% of total (before event)
    - Final Payment: 50% of total (after event)
  - **Payment Status Tracking:**
    - Admin can mark each stage as "Pending" or "Paid"
    - Bookings table shows payment status for both stages
    - Payment stage buttons disable when marked as paid
  - **Dynamic amount calculation** - QR code shows correct amount for each stage
  - **Copy UPI ID button** with visual feedback
  
- **Schema Changes:**
  - Added `advancePaymentStatus` field (pending/paid)
  - Added `finalPaymentStatus` field (pending/paid)
  - Both tracked per booking
  
- **UI Components:**
  - Payment stage selection buttons in UPI payment card
  - Payment status dropdowns in booking edit form
  - Payment badges in bookings list table
  - Shows "Adv: pending/paid" and "Final: pending/paid"
  
- **Technology:** 
  - Uses `qrcode` library for QR code generation
  - Dynamic QR code updates based on payment stage
  - Real-time payment status updates in admin UI
  
- **Locations:** 
  - Company Settings: `upiId` field
  - Booking Details: Advance & Final Payment dropdowns + UPI payment card
  - Bookings List: Payment status column with badges
  - Component: `client/src/components/upi-payment.tsx`

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **UI Components:** Radix UI primitives with shadcn/ui styling system
- **Styling:** Tailwind CSS with custom design tokens
- **State Management:** TanStack Query (React Query) for server state
- **Form Handling:** React Hook Form with Zod validation

**Design Decisions:**
- **Component Library Choice:** Uses shadcn/ui for a consistent, accessible component system that's customizable and doesn't add runtime overhead
- **Routing Strategy:** Wouter chosen over React Router for smaller bundle size and simpler API
- **State Management:** TanStack Query handles all server state, eliminating need for Redux/Context for data fetching
- **Form Validation:** Zod schemas shared between client and server ensure type safety and consistent validation

**Directory Structure:**
- `client/src/pages/` - Route components for both customer and admin views
- `client/src/components/ui/` - Reusable UI components from shadcn/ui
- `client/src/hooks/` - Custom React hooks
- `client/src/lib/` - Utility functions and query client configuration

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Drizzle ORM
- **Database:** SQLite (better-sqlite3)
- **Authentication:** Simple password-based admin authentication with bcrypt
- **Build Tool:** esbuild for production bundling

**Design Decisions:**
- **Database Choice:** SQLite selected for simplicity and zero configuration - suitable for small to medium catering businesses without need for separate database server
- **ORM Selection:** Drizzle ORM chosen for type safety, zero-cost abstractions, and excellent TypeScript support
- **Authentication Strategy:** Simple file-based password authentication for admin panel - password hash stored in `.admin-password.json` file
  - Default password is "admin123" (hashed with bcrypt)
  - Admin can change password through account settings
  - No session management - relies on localStorage flag (suitable for single admin use case)

**API Structure:**
- RESTful endpoints under `/api/` prefix
- Separate routes for:
  - Food items management (`/api/food-items`)
  - Event bookings (`/api/bookings`)
  - Company information (`/api/company-info`)
  - Staff management (`/api/staff`)
  - Admin authentication (`/api/admin/login`, `/api/admin/change-password`)
  - Chef printout generation (`/api/chef-printout`)

**Storage Layer:**
- Interface-based storage abstraction (`IStorage`) allows for potential future migration
- `DatabaseStorage` class implements SQLite-based persistence
- `MemStorage` class provides in-memory fallback (development/testing)

### Data Architecture

**Database Schema (SQLite):**

1. **food_items** - Menu items catalog
   - Stores name, description, category, and optional image URL
   - Categories: appetizer, main, dessert, beverage

2. **event_bookings** - Customer event bookings
   - Client details (name, email, phone)
   - Event information (date, type, guest count)
   - Pricing (price per plate)
   - Service requirements (serving boys needed)
   - Status tracking (pending, confirmed, completed, cancelled)
   - Special requests field

3. **booking_items** - Many-to-many relationship between bookings and food items
   - Links bookings to selected food items
   - Includes quantity for each item
   - Cascade deletes when booking or food item removed

4. **company_info** - Business information (singleton)
   - Company name, tagline, description
   - Contact details (email, phone, address)
   - Statistics (events per year)

5. **staff** - Staff member records
   - Name, role (chef, worker, serving_boy)
   - Contact phone, experience, salary

**Schema Design Decisions:**
- Text-based IDs using custom generator for simplicity
- SQLite's text date storage with ISO format
- Cascade deletes ensure referential integrity
- Default values prevent null-related issues

### Shared Code

**Location:** `shared/schema.ts`

**Purpose:** Type definitions and validation schemas shared between client and server

**Contents:**
- Drizzle table definitions
- Zod validation schemas (generated from Drizzle schemas)
- TypeScript type exports for type safety across stack

**Benefits:**
- Single source of truth for data structures
- Compile-time type checking prevents client-server mismatches
- Validation rules consistent between frontend and backend

### Development Workflow

**Build System:**
- **Development:** Vite dev server with HMR for frontend, tsx for backend hot reload
- **Production:** Vite builds client to `dist/public/`, esbuild bundles server to `dist/`
- Vite configured to serve from `client/` directory with custom alias paths

**Type Checking:**
- Shared TypeScript configuration across client, server, and shared code
- Path aliases (`@/`, `@shared/`) for clean imports
- Strict mode enabled for maximum type safety

## External Dependencies

### Core Framework Dependencies
- **Express.js** - Web server framework
- **React** - UI library
- **TypeScript** - Type safety across entire stack

### Database & ORM
- **better-sqlite3** - Synchronous SQLite3 bindings (chosen for simplicity and performance)
- **drizzle-orm** - Type-safe ORM with minimal overhead
- **drizzle-kit** - Schema migration tooling

### Authentication & Security
- **bcryptjs** - Password hashing (bcrypt implementation in pure JavaScript)
- Password stored in `.admin-password.json` file

### UI Framework
- **Radix UI** - Headless UI components (20+ primitives)
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built component patterns using Radix + Tailwind
- **lucide-react** - Icon library

### Form & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Zod integration with React Hook Form

### Data Fetching
- **TanStack Query (React Query)** - Server state management with caching

### Build Tools
- **Vite** - Frontend build tool and dev server
- **esbuild** - Fast JavaScript bundler for production backend
- **tsx** - TypeScript execution for development

### Routing
- **Wouter** - Lightweight client-side routing

### Development Tools (Replit-specific)
- **@replit/vite-plugin-runtime-error-modal** - Enhanced error display
- **@replit/vite-plugin-cartographer** - Code navigation
- **@replit/vite-plugin-dev-banner** - Development environment indicator

### Design Considerations
- No external API dependencies - fully self-contained application
- No cloud services required - runs entirely on local filesystem
- Minimal production dependencies for smaller bundle size
- SQLite eliminates need for separate database server