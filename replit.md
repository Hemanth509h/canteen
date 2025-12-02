# Premium Catering Services - Application Documentation

## Overview

This is a full-stack catering management application built with React, Express, and MongoDB. The platform serves customers for browsing menus and booking catering services, and administrators for managing food items, event bookings, staff, and company settings. It features a customer-facing website and a comprehensive admin panel. The project aims to provide an all-in-one solution for catering businesses, streamlining operations from customer interaction to internal management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Dec 2, 2025)

### AuditHistory & Tracking System + Staff Assignment Button Fixed ✅
- **Staff Assignment Button Fix:**
  - **Root Cause:** `findByIdAndUpdate` was receiving a string ID but needed proper MongoDB ObjectId conversion
  - **Solution:** Updated `updateStaffBookingRequest` method to convert string ID to `new mongoose.Types.ObjectId(id)` with proper error handling
  - **Result:** Accept and Reject buttons now work properly on staff assignment page

- **New AuditHistory Tracking System (Complete & Integrated):**
  - **Schema:** Created AuditHistory model with action, entityType, entityId, details, and createdAt
  - **Entity Types:** booking, staff, payment, assignment
  - **Storage Methods:** `createAuditHistory()` and `getAuditHistory(entityType?, entityId?)`
  - **API Endpoints:**
    - `GET /api/audit-history` - Fetch audit logs with optional filtering by entityType/entityId
    - `POST /api/audit-history` - Log new actions (bookings, staff assignments, payments)
  - **Automatic Logging Integrated:**
    - `booking_created` - When a new event booking is created
    - `booking_updated` - When booking status, payments, or details change
    - `staff_created` - When a new staff member is added
    - `staff_updated` - When staff details are modified
    - `assignment_created` - When a serving boy is assigned to an event
    - `assignment_updated` - When staff accepts/rejects an assignment (tracks status change)
  - **Stored Details:** Each audit entry includes contextual information (names, IDs, status changes, etc.)
  - **Query Support:** View all actions, filter by entity type, or filter by specific entity ID

## Previous Changes (Dec 1, 2025)

### Simplified Staff Management (Complete):
- Removed experience, salary, and image fields from staff records
- Staff now only store: name, role (Chef/Worker/Serving Boy), phone number
- Cleaner staff form with just 3 essential fields
- Simplified staff table display

### Staff Booking Assignment System (Complete):
1. **StaffBookingRequest Schema** - Tracks staff responses with unique tokens:
   - Fields: bookingId, staffId, status (pending/accepted/rejected), **token** (unique identifier), createdAt
   - Zod schemas for insert and update operations
   - MongoDB model for data persistence with token indexing
   
2. **API Routes** - Full REST API for staff assignment:
   - `GET /api/bookings/:bookingId/staff-requests` - Fetch all requests for a booking
   - `POST /api/bookings/:bookingId/staff-requests` - Send request to staff (auto-generates token)
   - `PATCH /api/staff-requests/:requestId` - Update request status
   - `GET /api/bookings/:bookingId/assigned-staff` - Get all accepted staff for a booking
   - **NEW:** `GET /api/staff-requests/:token` - Public endpoint for staff to fetch assignment details
   - **NEW:** `PATCH /api/staff-requests/:token` - Public endpoint for staff to accept/reject via token
   
3. **Public Staff Assignment Page** - `/staff-assignment/:token`:
   - Beautiful, responsive UI showing event details (client name, date, guests, event type, special requests)
   - Accept/Reject buttons for staff response
   - No login required - fully public access
   - Real-time status updates when staff responds
   
4. **Admin Serving Boys Assignment UI**:
   - New "Assign Serving Boys" button (👥 Users icon) on each booking in bookings table
   - Modal showing available serving boys filtered by role
   - Shows already-assigned staff in green highlight
   - One-click "Assign" button generates token + sends WhatsApp message with link
   - Staff receives message with unique assignment link
   - Button shows "Assigned" state after successful assignment
   
5. **WhatsApp Integration**:
   - Auto-generates unique URL for each staff: `/staff-assignment/{token}`
   - Message includes: event type, date, guest count, client name
   - Deep link direct to staff response page
   - No API needed - pure WhatsApp Web links (wa.me)

**Workflow:**
1. Admin clicks "👥 Assign Serving Boys" button on booking
2. Modal opens showing available serving boys
3. Admin clicks "Assign" → Creates token + Sends WhatsApp with link
4. Staff receives WhatsApp with assignment link
5. Staff opens link → Beautiful page shows event details
6. Staff clicks "Accept" or "Reject"
7. Response recorded → Admin sees updated assigned staff list

## Recent Changes (Dec 1, 2025)

### Invoice/Receipt Feature (Complete):
- Created reusable `Invoice` component showing full payment breakdown
- Displays both advance (50%) and final (50%) payment status
- "Print" button - opens browser print dialog for PDF generation
- "Download" button - saves invoice as HTML file
- Shows on customer payment page after both payments received
- Shows on admin payment page after both payments received
- Includes booking details: client name, event type, date, guests
- Shows special requests if applicable
- Thank you message when payment complete
- Professional styling with dark mode support

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
