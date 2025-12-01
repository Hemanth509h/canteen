# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and SQLite. The platform serves customers for browsing menus and booking catering services, and administrators for managing food items, event bookings, staff, and company settings. It features a customer-facing website and a comprehensive admin panel. The project aims to provide an all-in-one solution for catering businesses, streamlining operations from customer interaction to internal management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter
- **UI Components:** Radix UI primitives with shadcn/ui styling
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query for server state
- **Form Handling:** React Hook Form with Zod validation

**Design Decisions:**
- Employs `shadcn/ui` for consistent, accessible, and customizable components.
- Wouter is chosen for its lightweight nature and simpler API.
- TanStack Query manages server state efficiently, reducing the need for additional state management libraries.
- Shared Zod schemas ensure type safety and consistent validation across client and server.

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **ORM:** Drizzle ORM
- **Database:** SQLite (better-sqlite3)
- **Authentication:** Simple password-based admin authentication with bcrypt
- **Build Tool:** esbuild

**Design Decisions:**
- SQLite is selected for its simplicity and zero-configuration, suitable for small to medium businesses.
- Drizzle ORM provides type safety and excellent TypeScript support.
- Authentication relies on a file-based password hash for the admin panel, suitable for single-admin use cases.
- API follows a RESTful design under `/api/` prefix.
- An `IStorage` interface allows for flexible storage implementation.

### Data Architecture

**Database Schema (SQLite):**
- **food_items:** Menu catalog with name, description, category, image, price, rating, and dietary tags.
- **event_bookings:** Customer booking details including client info, event specifics, pricing, service requirements, status, and special requests. Now includes `advancePaymentStatus` and `finalPaymentStatus`.
- **booking_items:** Links bookings to selected food items with quantities.
- **company_info:** Stores business details and configurable settings like `minAdvanceBookingDays` and `upiId`.
- **staff:** Records for staff members including name, role, contact, experience, and salary.
- **catering_packages:** Defines pre-built packages with name, description, tier, price per plate, minimum servings, and included items.
- **admin_notifications:** Stores notifications for admin alerts related to bookings and payments.

**Schema Design Decisions:**
- Uses text-based IDs and ISO format for dates.
- Employs cascade deletes for referential integrity.
- Default values are used to prevent null-related issues.
- Shared Drizzle table definitions and Zod validation schemas ensure consistent data structures and validation across the stack.

### Key Features

- **Admin Notifications:** Real-time notifications for new bookings and payment status updates.
- **Package Showcase:** Displays catering packages on the customer home page with comparison features.
- **Advanced Menu Filtering & Sorting:** Customers can filter by dietary tags, search, sort by price/rating, and browse by category.
- **Pre-built Catering Packages System:** Admin can manage Budget, Standard, and Premium packages with full CRUD operations.
- **Configurable Minimum Advance Booking Days:** Admin can set the minimum advance notice required for bookings.
- **UPI Payment Integration:** Supports two-stage payments (advance and final) with dynamic QR code generation based on admin-set UPI ID.

## External Dependencies

### Core Framework Dependencies
- **Express.js**
- **React**
- **TypeScript**

### Database & ORM
- **better-sqlite3**
- **drizzle-orm**
- **drizzle-kit**

### Authentication & Security
- **bcryptjs**

### UI Framework
- **Radix UI**
- **Tailwind CSS**
- **shadcn/ui**
- **lucide-react**

### Form & Validation
- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

### Data Fetching
- **TanStack Query (React Query)**

### Build Tools
- **Vite**
- **esbuild**
- **tsx**

### Routing
- **Wouter**

### Other Libraries
- **qrcode** (for UPI QR code generation)