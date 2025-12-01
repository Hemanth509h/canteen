# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and MongoDB. The platform serves customers for browsing menus and booking catering services, and administrators for managing food items, event bookings, staff, and company settings. It features a customer-facing website and a comprehensive admin panel. The project aims to provide an all-in-one solution for catering businesses, streamlining operations from customer interaction to internal management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Dec 1, 2025)

### Latest Updates:
1. **Simplified Menu Filters** - Removed search and price/rating sorting features. Menu now displays only:
   - Category selection (buttons/dropdown)
   - Dietary filter buttons (Vegan, Gluten-Free, Non-Veg, Spicy, Nut-Free, Dairy-Free)
   - Items show if they match ANY selected dietary filter (using "some" logic)

2. **Enhanced Payment Page UI** - Major design and UX improvements:
   - **Step-based Layout**: Clear "Step 1: Advance Payment" and "Step 2: Final Payment" sections
   - **Professional Status Indicators**: Replaced emoji checkmarks with CheckCircle and Clock icons
   - **Color-coded Status Badges**: Visual badges showing "Completed" or "Pending" states
   - **Improved Payment Summary**: Redesigned sidebar with payment status icons and clear amount breakdowns
   - **Enhanced Typography**: Larger, bolder amounts (₹20150) with better hierarchy
   - **Better Success States**: Animated success messages with icons and helpful text
   - **Full-width WhatsApp Button**: "Share via WhatsApp" button now full-width in Payment Summary
   - **Descriptive Help Text**: Clear instructions for uploading payment screenshots
   - **Loading Feedback**: "Uploading..." button state instead of disabled appearance
   - **Animated Completion**: Smooth animations for success states and completion screen
   - **All test IDs added**: Complete data-testid attributes for testing (22+ test IDs)

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
- **Database:** MongoDB
- **Authentication:** Simple password-based admin authentication with bcrypt
- **Build Tool:** esbuild

**Design Decisions:**
- MongoDB is used for flexible document storage and scalability.
- Drizzle ORM provides type safety and excellent TypeScript support.
- Authentication relies on a file-based password hash for the admin panel, suitable for single-admin use cases.
- API follows a RESTful design under `/api/` prefix.

### Data Architecture

**Database Collections (MongoDB):**
- **foodItems:** Menu catalog with name, description, category, image, price, rating, and dietary tags.
- **eventBookings:** Customer booking details including client info, event specifics, pricing, service requirements, status, advance/final payment status, and payment screenshots.
- **bookingItems:** Links bookings to selected food items with quantities.
- **companyInfo:** Stores business details and configurable settings like minAdvanceBookingDays and upiId.
- **staff:** Records for staff members including name, role, contact, experience, and salary.
- **cateringPackages:** Defines pre-built packages with name, description, tier, price per plate, minimum servings, and included items.
- **adminNotifications:** Stores notifications for admin alerts related to bookings and payments.

**Schema Design Decisions:**
- Uses text-based IDs and ISO format for dates.
- Employs cascade deletes for referential integrity.
- Default values are used to prevent null-related issues.
- Shared Drizzle table definitions and Zod validation schemas ensure consistent data structures and validation across the stack.

### Key Features

- **Admin Notifications:** Real-time notifications for new bookings and payment status updates.
- **Package Showcase:** Displays catering packages on the customer home page with comparison features.
- **Simplified Menu Filtering:** Customers filter items by dietary requirements (Vegan, Gluten-Free, Non-Veg, Spicy, Nut-Free, Dairy-Free) and category selection.
- **Pre-built Catering Packages System:** Admin can manage Budget, Standard, and Premium packages with full CRUD operations.
- **Configurable Minimum Advance Booking Days:** Admin can set the minimum advance notice required for bookings.
- **Two-Stage UPI Payment Integration:** Supports advance (50%) and final (50%) payments with dynamic QR code generation and screenshot proof upload.
- **WhatsApp Payment Sharing:** Customers can open WhatsApp from payment confirmation page to share the payment link.

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
