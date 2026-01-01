# Catering Services Platform

## Overview

A full-stack catering services web application with a React frontend and Express.js backend. The platform allows customers to browse food menus, book events, and submit reviews, while providing an admin dashboard for managing food items, event bookings, staff, and company information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite as the build tool
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **UI Components**: Radix UI primitives with shadcn/ui component patterns
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM for client-side navigation
- **Animations**: Framer Motion for UI animations

### Backend Architecture
- **Framework**: Express.js running on Node.js with ES modules
- **API Design**: RESTful API with `/api` prefix for all routes
- **Validation**: Zod schemas for request validation with zod-validation-error for formatting
- **Authentication**: Simple password-based admin authentication using bcryptjs
- **Session Management**: Client-side session storage with localStorage (24-hour expiry)

### Data Storage
- **Primary Database**: MongoDB Atlas with Mongoose ODM
- **Fallback Storage**: In-memory storage class (MemoryStorage) for development/testing
- **Connection**: Uses MongoDB SRV connection strings with serverless-optimized settings

### API Structure
All API endpoints are prefixed with `/api`:
- `/api/admin/login` - Admin authentication
- `/api/food-items` - CRUD operations for menu items
- `/api/event-bookings` - Event booking management
- `/api/staff` - Staff management
- `/api/company-info` - Company information
- `/api/reviews` - Customer reviews

### Development Workflow
- **Monorepo Structure**: Root package.json with scripts to run both frontend and backend
- **Frontend Port**: 5000 with proxy to backend
- **Backend Port**: 3000
- **Concurrent Dev**: Uses `concurrently` package to run both servers

## External Dependencies

### Database
- **MongoDB Atlas**: Cloud-hosted MongoDB database for persistent storage
- **Connection String**: Configured via `MONGODB_URI` environment variable

### Authentication
- **bcryptjs**: Password hashing for admin authentication
- **Environment Variables**: `ADMIN_PASSWORD_HASH` and `ADMIN_PASSWORD` for credential management

### Frontend Services
- **Google Fonts**: Poppins, Inter, DM Sans, and other fonts loaded via CDN
- **Vite Dev Server**: Proxies `/api` requests to backend during development

### Key NPM Packages
- **Backend**: express, mongoose, passport, zod, express-session, redis (optional), ws (WebSocket support)
- **Frontend**: @tanstack/react-query, @radix-ui components, react-router-dom, react-hook-form, framer-motion, date-fns