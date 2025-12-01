# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and MongoDB. The platform serves customers for browsing menus and booking catering services, and administrators for managing food items, event bookings, staff, and company settings. It features a customer-facing website and a comprehensive admin panel. The project aims to provide an all-in-one solution for catering businesses, streamlining operations from customer interaction to internal management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Dec 1, 2025)

### Simplified Staff Management (Complete):
- Removed experience, salary, and image fields from staff records
- Staff now only store: name, role (Chef/Worker/Serving Boy), phone number
- Cleaner staff form with just 3 essential fields
- Simplified staff table display

### Staff Booking Assignment System (In Progress):
1. **StaffBookingRequest Schema** - Tracks staff responses to booking requests:
   - Fields: bookingId, staffId, status (pending/accepted/rejected), createdAt
   - Zod schemas for insert and update operations
   - MongoDB model for data persistence
   
2. **API Routes** - Backend infrastructure for staff assignment:
   - `GET /api/bookings/:bookingId/staff-requests` - Fetch all requests for a booking
   - `POST /api/bookings/:bookingId/staff-requests` - Send request to a booking boy
   - `PATCH /api/staff-requests/:requestId` - Update request status (accept/reject)
   - `GET /api/bookings/:bookingId/assigned-staff` - Get all accepted staff for a booking
   
3. **Storage Methods** - MongoDB operations:
   - getStaffBookingRequests() - Fetch requests for a booking
   - createStaffBookingRequest() - Send new request to staff
   - updateStaffBookingRequest() - Update response status
   - getAcceptedStaffForBooking() - Get assigned staff list
   
**Next Steps (UI):**
- Add "Assign Booking Boys" button on admin booking page
- Modal showing all staff with send request buttons
- Track pending/accepted/rejected responses
- Auto-assign staff when they accept requests
- Display assigned boys list on booking details

## Recent Changes (Dec 1, 2025)

### Latest Updates:
1. **Manual WhatsApp Staff Reminders** - One-click button to send booking reminders to staff:
   - Click the WhatsApp icon button (MessageCircle icon) on any booking in the bookings list
   - Modal opens showing all staff members
   - Click "Send" button next to staff name to open WhatsApp with pre-filled booking details
   - Message includes: client name, event type, date, guest count
   - Opens WhatsApp Web directly - no external API required
   - Staff can receive reminders instantly for event preparation

2. **Dynamic Total Amount Adjustment Fixed** - Admin can modify booking total with proper payment handling:
   - Click "Edit" button on admin payment page to enter edit mode
   - Modify the total amount in the input field
   - When advance payment is PAID: advance stays fixed, only final payment adjusts
   - When advance payment is PENDING: both advance and final recalculate as 50/50 split
   - Changes are saved to the database and reflected on customer payment page
   - Useful when: final guest count changes or additional services are added/removed

2. **Simplified Menu Filters** - Removed search and price/rating sorting features. Menu now displays only:
   - Category selection (buttons/dropdown)
   - Dietary filter buttons (Vegan, Gluten-Free, Non-Veg, Spicy, Nut-Free, Dairy-Free)
   - Items show if they match ANY selected dietary filter (using "some" logic)

3. **Separate Payment Pages for Admin & Customer** - Complete role-based separation:
   - **Customer Payment Page** (`/payment/:bookingId`):
     - Full UPI QR code visible for payment scanning
     - Screenshot upload section for proof submission
     - Shows "Complete your booking payment" heading
     - Back button goes to home page
     - Button text: "Share via WhatsApp"
     - All customer-focused features and upload functionality
   - **Admin Payment Page** (`/admin/payment/:bookingId`):
     - View-only page - no QR code or upload sections
     - Shows "Booking Payment Details" heading
     - Back button goes to /admin/bookings
     - Button text: "Send via WhatsApp"
     - Displays payment status and awaiting messages
     - Can send payment links to customers
   - **Common Features**:
     - Step-based layout (Step 1: Advance 50%, Step 2: Final 50%)
     - CheckCircle and Clock icons for status indicators
     - Color-coded badges for payment states
     - Improved payment summary with status tracking
     - Animated success states
     - Professional typography and visual hierarchy
     - 25+ test IDs for comprehensive testing

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
- **eventBookings:** Customer booking details including client info, event specifics, pricing, service requirements, status, advance/final payment status, payment screenshots, and optional custom totalAmount.
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
- **Manual WhatsApp Staff Reminders:** One-click button to send booking reminders to all staff members with event details.
- **Dynamic Total Amount Adjustment:** Admin can modify booking total amount after payment, with smart recalculation - paid advance stays fixed, only final payment adjusts.

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
