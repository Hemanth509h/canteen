# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and MongoDB. The platform serves customers for browsing menus and booking catering services, and administrators for managing food items, event bookings, staff, and company settings. It features a customer-facing website and a comprehensive admin panel. The project aims to provide an all-in-one solution for catering businesses, streamlining operations from customer interaction to internal management. Key capabilities include comprehensive admin data management with search, sorting, and filtering, robust error handling, an audit history tracking system, and a streamlined staff assignment and communication workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Enhancements (December 27, 2025)

### Database Integration & Menu Expansion
- **MongoDB Collection Alignment:** Reconfigured Mongoose schemas to match existing lowercase plural collection names (`fooditems`, `eventbookings`, `companyinfos`, etc.).
- **Field Name Mapping:** Implemented dual-case mapping (camelCase and snake_case) to ensure compatibility with existing database fields.
- **Vegetarian Menu Seeding:** Successfully parsed and imported 235 items from the provided vegetarian menu into the `fooditems` collection.
- **Admin Data Management:** Verified data flow for bookings, staff, and menu items.

## Recent Enhancements (December 24, 2025)

### Mobile Responsiveness Improvements
- **Responsive Modals:** All dialog boxes now adapt to mobile screens with `w-[95vw]` on phones and appropriate max-width on desktop
- **Mobile Card Views:** Audit history and other tables now display as cards on mobile and tables on desktop using `block md:hidden` / `hidden md:block` pattern
- **Form Grids:** All form grids updated to be `grid-cols-1` on mobile, `grid-cols-2` on tablets, and `grid-cols-4` on desktop where appropriate
- **Sidebar Optimization:** Admin sidebar width optimized for mobile screens (reduced from 16rem to 14rem)
- **Header Responsiveness:** Admin header redesigned with better mobile spacing and hidden search on mobile
- **Button Stacking:** Confirmation dialog buttons now stack vertically on mobile using `flex-col-reverse sm:flex-row`
- **Text Sizing:** Dialog titles and descriptions now have responsive font sizes

### Empty States & Loading States
- **EmptyState Component:** Created reusable `client/src/components/empty-state.tsx` for consistent empty state messaging
- **Consistent Loading Spinners:** All data fetching uses `TableSkeleton`, `PageLoader`, and `CardSkeleton` for visual feedback
- **Better Visual Feedback:** Loading states implemented on all mutations (create, update, delete operations)
- **Empty State Messages:** All admin pages show helpful messages when lists are empty with optional action buttons
- **Mutation Loading States:** Form submissions and delete operations show loading text ("Saving...", "Deleting...") to prevent duplicate submissions

### Admin Dashboard Enhancements
- **Quick Stats:** Dashboard displays total revenue, upcoming bookings, pending payments, and menu items
- **Activity Timeline:** Visual timeline showing recent bookings with status indicators (completed, pending payments, upcoming)
- **Revenue Charts:** Monthly revenue charts and booking status visualizations using recharts
- **Interactive Booking Calendar:** Calendar view for quick booking visualization

### Code Quality Improvements
- **Clean Imports:** Removed unused imports (`Label`, `Textarea`) from admin pages
- **Better TypeScript Types:** Improved type safety with specific interface types for component props
- **Component Organization:** Admin pages use consistent patterns and naming conventions
- **Reusable Components:** EmptyState and LoadingSpinner components reduce code duplication

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
- Optimized for mobile responsiveness across all admin pages and modals, including table layouts and sidebar navigation.

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** Simple password-based admin authentication with bcrypt
- **Build Tool:** esbuild

**Design Decisions:**
- MongoDB is used for flexible document storage and scalability.
- Drizzle ORM provides type safety and excellent TypeScript support.
- Authentication relies on a file-based password hash for the admin panel, suitable for single-admin use cases.
- API follows a RESTful design under `/api/` prefix.
- Implements comprehensive error handling and user notifications, including confirmation dialogs for destructive actions, user-friendly error messages, success notifications, and real-time form validation feedback.

### Data Architecture

**Database Collections (MongoDB):**
- **foodItems:** Menu catalog.
- **eventBookings:** Customer booking details, payment status, and custom totalAmount.
- **bookingItems:** Links bookings to selected food items.
- **companyInfo:** Business details and configurable settings (e.g., minAdvanceBookingDays, upiId).
- **staff:** Staff member records (name, role, phone number).
- **cateringPackages:** Pre-built packages with details.
- **adminNotifications:** Notifications for admin alerts.
- **auditHistory:** Tracks system changes (action, entityType, entityId, details, createdAt).
- **staffBookingRequest:** Tracks staff responses to assignment requests with unique tokens.

**Schema Design Decisions:**
- Uses text-based IDs and ISO format for dates.
- Employs cascade deletes for referential integrity.
- Default values are used to prevent null-related issues.
- Shared Drizzle table definitions and Zod validation schemas ensure consistent data structures and validation across the stack.

### Key Features

- **Admin Data Management:** Comprehensive search, sorting, and filtering on admin event bookings, staff management, and food items pages.
- **Audit History Tracking:** A complete system to log and view all system changes and actions, accessible via an admin page.
- **Staff Assignment System:** Admin UI to assign serving boys to bookings, generating unique links for staff to accept/reject assignments via WhatsApp.
- **Two-Stage UPI Payment Integration:** Supports advance (50%) and final (50%) payments with dynamic QR code generation, screenshot proof upload (customer), and payment status tracking.
- **Invoice/Receipt Feature:** Generates printable/downloadable invoices with payment breakdown.
- **Admin Notifications:** Real-time notifications for new bookings and payment updates.
- **Catering Packages:** Management and display of pre-built catering packages.
- **Configurable Minimum Advance Booking Days:** Admin can set booking notice requirements.
- **WhatsApp Integration:** Facilitates sending payment links to customers and assignment links/reminders to staff.
- **Dynamic Total Amount Adjustment:** Admin can modify booking totals with intelligent recalculation of advance and final payments.
- **Simplified Menu Filtering:** Customers can filter menu items by dietary requirements and category.

## External Dependencies

### Core Framework Dependencies
- **Express.js**
- **React**
- **TypeScript**

### Database
- **MongoDB** (via mongoose driver)

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
- **framer-motion** (for animations)