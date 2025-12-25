# Premium Catering Services - Project Guide

## Project Overview
This is a full-stack catering management application built with **React**, **Express**, and **MongoDB**. It streamlines operations for catering businesses by providing:
- **Customer Portal:** Browse menus, book events, and track payment status.
- **Admin Dashboard:** Manage food items, staff assignments, event bookings, and company settings.
- **Staff Management:** Assign staff to events with unique WhatsApp assignment links.
- **Financial Tracking:** UPI payment integration with advance/final payment splits and invoice generation.

---

## Step-by-Step Setup Guide

### 1. Project Initialization
- Initialize a new Node.js project.
- Set up a **Vite** frontend with **React** and **TypeScript**.
- Set up an **Express** backend with **TypeScript**.

### 2. Environment Configuration
Create a `.env` file or use Replit Secrets to set up:
- `DATABASE_URL`: MongoDB connection string.
- `SESSION_SECRET`: Random string for session management.
- `ADMIN_PASSWORD`: For admin panel authentication.

### 3. Database Schema Design (`shared/schema.ts`)
Define MongoDB schemas using **Drizzle ORM** for:
- `foodItems`: Menu catalog.
- `eventBookings`: Customer bookings and payment status.
- `staff`: Staff records and roles.
- `auditHistory`: System activity logs.
- `companyInfo`: Business configuration (UPI ID, advance booking days, etc.).

### 4. Backend Implementation (`server/`)
- **Storage Layer (`storage.ts`):** Implement CRUD operations using MongoDB/Drizzle.
- **API Routes (`routes.ts`):** Create RESTful endpoints for bookings, menu management, and admin actions.
- **Authentication:** Set up `passport-local` for simple admin authentication.

### 5. Frontend Implementation (`client/src/`)
- **Routing:** Use `wouter` for application-wide routing.
- **UI Components:** Implement **shadcn/ui** components for a consistent, accessible design.
- **State Management:** Use **TanStack Query** for efficient data fetching and caching.
- **Forms:** Use `react-hook-form` with `zod` validation.

### 6. Key Features Setup
- **Payment Integration:** Implement QR code generation for UPI payments using the `qrcode` library.
- **Staff Assignments:** Build the logic to generate staff assignment tokens and WhatsApp links.
- **Audit System:** Ensure all admin actions (create, update, delete) are logged to the audit history table.

### 7. Deployment
- Build the frontend using `vite build`.
- Bundle the backend using `esbuild`.
- Run the production server from the `dist/` directory.

---

## Technical Architecture
- **Frontend:** React, Tailwind CSS, shadcn/ui, Radix UI.
- **Backend:** Node.js, Express, MongoDB (via Mongoose driver).
- **Tooling:** Vite, esbuild, TypeScript, Zod.

---

## Development Workflow
- **Development:** `npm run dev` starts both the backend and the Vite dev server.
- **Build:** `npm run build` compiles both the frontend and backend for production.
- **Production:** `npm run start` runs the compiled application.
