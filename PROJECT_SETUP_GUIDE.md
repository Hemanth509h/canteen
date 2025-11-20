# 🍽️ Ravi Canteen - Complete Project Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [PHASE 1: Frontend Development](#phase-1-frontend-development)
5. [PHASE 2: Backend Development](#phase-2-backend-development)
6. [PHASE 3: Database Setup](#phase-3-database-setup)
7. [Testing & Running](#testing--running)
8. [Deployment](#deployment)

---

## Project Overview

### What We're Building
A full-stack catering management application with three main parts:

1. **Customer Website** - Public-facing site where customers can:
   - Browse the food menu with images
   - Filter by categories (appetizers, mains, desserts, beverages)
   - View company information and contact details

2. **Admin Panel** - Protected dashboard for staff to:
   - Manage food items (add, edit, delete menu items)
   - Handle event bookings and reservations
   - Manage staff members
   - Update company settings
   - Generate chef printouts for kitchen prep

3. **Chef Printout** - Special view for kitchen staff showing:
   - Daily food preparation requirements
   - Quantities needed based on bookings

### Technology Stack

**Frontend:**
- React 18 - UI library for building components
- TypeScript - Type-safe JavaScript
- Vite - Fast build tool and dev server
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - Pre-built accessible components
- TanStack Query - Server state management
- Wouter - Lightweight routing

**Backend:**
- Express.js - Web server framework
- TypeScript - Type safety on the server
- Drizzle ORM - Type-safe database queries

**Database:**
- SQLite - Lightweight file-based database
- Drizzle Kit - Database migrations

---

## Prerequisites

### Required Software
- **Node.js** version 20 or higher
- **npm** (comes with Node.js)
- **Code editor** (VS Code recommended)

### Required Knowledge
- Basic JavaScript/TypeScript
- Basic React (components, hooks)
- Basic HTML/CSS
- Command line basics

---

## Initial Setup

### Step 1: Create Project Directory

```bash
mkdir ravi-canteen
cd ravi-canteen
```

**What this does:** Creates a new folder for your project and navigates into it.

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

**What this does:** Creates a `package.json` file that tracks your project dependencies and scripts.

### Step 3: Set Module Type

Open `package.json` and add this line:

```json
{
  "name": "ravi-canteen",
  "version": "1.0.0",
  "type": "module",
  "scripts": {},
  "dependencies": {}
}
```

**Explanation:** The `"type": "module"` tells Node.js to use modern ES6 import/export syntax instead of old require() syntax.

### Step 4: Install All Dependencies

```bash
# Frontend dependencies
npm install react react-dom wouter @tanstack/react-query
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react react-icons react-hook-form @hookform/resolvers
npm install date-fns framer-motion next-themes cmdk vaul
npm install embla-carousel-react react-day-picker input-otp
npm install react-resizable-panels recharts

# Radix UI components (headless accessible components)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog
npm install @radix-ui/react-aspect-ratio @radix-ui/react-avatar
npm install @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-hover-card
npm install @radix-ui/react-label @radix-ui/react-menubar
npm install @radix-ui/react-navigation-menu @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-radio-group
npm install @radix-ui/react-scroll-area @radix-ui/react-select
npm install @radix-ui/react-separator @radix-ui/react-slider
npm install @radix-ui/react-slot @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-toast
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group
npm install @radix-ui/react-tooltip

# Backend dependencies
npm install express drizzle-orm better-sqlite3 bcryptjs zod drizzle-zod
npm install express-session memorystore passport passport-local ws

# Development tools
npm install -D typescript @types/node @types/react @types/react-dom
npm install -D @types/express @types/express-session @types/bcryptjs
npm install -D @types/passport @types/passport-local @types/ws
npm install -D @types/better-sqlite3 vite @vitejs/plugin-react esbuild tsx
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
npm install -D @tailwindcss/vite drizzle-kit cross-env
npm install -D tw-animate-css tailwindcss-animate
```

**What this does:** Installs all the packages your project needs.

### Step 5: Create Project Structure

```bash
mkdir -p client/src/components/ui
mkdir -p client/src/pages
mkdir -p client/src/lib
mkdir -p client/src/hooks
mkdir -p server
mkdir -p shared
mkdir -p attached_assets
```

**Final structure:**
```
ravi-canteen/
├── client/
│   ├── src/
│   │   ├── components/ui/    # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utility functions
│   │   └── hooks/            # Custom React hooks
│   └── index.html            # HTML entry point
├── server/                   # Backend code
├── shared/                   # Code shared between frontend/backend
├── attached_assets/          # Images and static files
└── package.json
```

---

## PHASE 1: Frontend Development

We'll build the frontend first so you can see the UI immediately.

### Step 1: Configure Tailwind CSS

#### Create `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/index.html",
    "./client/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

**Explanation:**
- `darkMode: ["class"]` - Dark mode toggles by adding a "dark" class to HTML
- `content` - Tells Tailwind which files to scan for CSS classes
- `theme.extend.colors` - Defines color variables that can be customized
- Uses CSS variables like `var(--background)` so colors can change with themes

#### Create `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Explanation:** Configures PostCSS to process Tailwind CSS and add browser prefixes automatically.

#### Create `client/src/index.css`

```css
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 20 14.3% 4.1%;
  --card: 0 0% 100%;
  --card-foreground: 20 14.3% 4.1%;
  --popover: 0 0% 100%;
  --popover-foreground: 20 14.3% 4.1%;
  --primary: 24 9.8% 10%;
  --primary-foreground: 60 9.1% 97.8%;
  --secondary: 60 4.8% 95.9%;
  --secondary-foreground: 24 9.8% 10%;
  --muted: 60 4.8% 95.9%;
  --muted-foreground: 25 5.3% 44.7%;
  --accent: 60 4.8% 95.9%;
  --accent-foreground: 24 9.8% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 60 9.1% 97.8%;
  --border: 20 5.9% 90%;
  --input: 20 5.9% 90%;
  --ring: 20 14.3% 4.1%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --radius: 0.5rem;
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

.dark {
  --background: 20 14.3% 4.1%;
  --foreground: 60 9.1% 97.8%;
  --card: 20 14.3% 4.1%;
  --card-foreground: 60 9.1% 97.8%;
  --popover: 20 14.3% 4.1%;
  --popover-foreground: 60 9.1% 97.8%;
  --primary: 60 9.1% 97.8%;
  --primary-foreground: 24 9.8% 10%;
  --secondary: 12 6.5% 15.1%;
  --secondary-foreground: 60 9.1% 97.8%;
  --muted: 12 6.5% 15.1%;
  --muted-foreground: 24 5.4% 63.9%;
  --accent: 12 6.5% 15.1%;
  --accent-foreground: 60 9.1% 97.8%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 60 9.1% 97.8%;
  --border: 12 6.5% 15.1%;
  --input: 12 6.5% 15.1%;
  --ring: 24 5.7% 82.9%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --sidebar-background: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 224.3 76.3% 48%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

.hover-elevate {
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.hover-elevate:hover {
  filter: brightness(0.95);
}
.dark .hover-elevate:hover {
  filter: brightness(1.1);
}

.active-elevate-2:active {
  filter: brightness(0.9);
}
.dark .active-elevate-2:active {
  filter: brightness(1.2);
}
```

**Explanation:**
- `:root` - Light mode colors defined as HSL values (Hue, Saturation, Lightness)
- `.dark` - Dark mode colors that override light mode when dark class is active
- Custom utility classes like `.hover-elevate` for interactive hover effects
- Values are in HSL format without the `hsl()` wrapper because Tailwind adds that

### Step 2: Create Utility Functions

#### Create `client/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Explanation:**
- `cn()` - Utility function to merge CSS class names
- `clsx` - Conditionally joins class names together
- `twMerge` - Merges Tailwind classes intelligently (removes conflicts)
- Example: `cn("px-2 py-1", condition && "bg-blue-500")` safely combines classes

### Step 3: Create shadcn/ui Components

You'll need to create many UI components. Here are the most important ones:

#### Create `client/src/components/ui/button.tsx`

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

**Explanation:**
- `cva` - Creates variant classes for different button styles
- `variants.variant` - Different color schemes (default, destructive, outline, etc.)
- `variants.size` - Different sizes (default, sm, lg, icon)
- `asChild` - If true, renders child element instead of button (useful for links)
- `hover-elevate` and `active-elevate-2` - Custom hover/active effects from our CSS

#### Create `client/src/components/ui/card.tsx`

```typescript
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

**Explanation:**
- `Card` - Main container with rounded corners, border, and shadow
- `CardHeader` - Top section with padding
- `CardTitle` - Large bold text for card title
- `CardDescription` - Smaller muted text for descriptions
- `CardContent` - Main content area
- `CardFooter` - Bottom section for actions
- All use `forwardRef` to allow parent components to access the DOM elements

**Note:** You'll need to create many more components (Input, Form, Dialog, Toast, etc.). For brevity, I'm showing the key ones. You can find all shadcn/ui components at https://ui.shadcn.com/ or copy them from the existing project.

### Step 4: Setup React Query

#### Create `client/src/lib/queryClient.ts`

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      },
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed: ${response.statusText}`);
  }

  return response;
}
```

**Explanation:**
- `QueryClient` - Manages all data fetching and caching
- `queryFn` - Default function that fetches data from API endpoints
- `queryKey[0]` - Uses first element of query key as URL (e.g., "/api/food-items")
- `staleTime` - Data stays fresh for 5 minutes before refetching
- `retry: 1` - Only retry failed requests once
- `apiRequest()` - Helper function for POST/PUT/DELETE requests
- `credentials: "include"` - Sends cookies with requests (for authentication)

### Step 5: Create Customer Homepage

#### Create `client/src/pages/customer-home.tsx`

```typescript
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FoodItem, CompanyInfo } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomerHome() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: foodItems, isLoading: itemsLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo, isLoading: companyLoading } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const filteredItems = selectedCategory === "All"
    ? foodItems
    : foodItems?.filter(item => item.category === selectedCategory);

  const categories = [
    { value: "All", label: "All" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main", label: "Main Courses" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
  ];

  if (itemsLoading || companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1555244162-803834f70033?w=1600")',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4" data-testid="text-company-name">
            {companyInfo?.companyName || "Ravi canteen"}
          </h1>
          <p className="text-xl mb-8" data-testid="text-tagline">
            {companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" data-testid="button-view-menu">
              View Our Menu
            </Button>
            <Button variant="outline" size="lg" data-testid="button-events">
              Catering {companyInfo?.eventsPerYear || 500}+ Events Annually
            </Button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 justify-center flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.value)}
                data-testid={`button-category-${cat.value.toLowerCase()}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems?.map((item) => (
              <Card key={item.id} className="overflow-hidden" data-testid={`card-food-${item.id}`}>
                <div className="aspect-video relative bg-muted">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`text-food-name-${item.id}`}>
                    {item.name}
                  </CardTitle>
                  <CardDescription data-testid={`text-food-description-${item.id}`}>
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          {(!filteredItems || filteredItems.length === 0) && (
            <p className="text-center text-muted-foreground">
              No items found in this category.
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About Us</h3>
              <p className="text-muted-foreground">
                {companyInfo?.description || "Professional catering services for all events"}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-muted-foreground">
                Email: {companyInfo?.email || "info@ravikanteen.com"}
              </p>
              <p className="text-muted-foreground">
                Phone: {companyInfo?.phone || "+1 234 567 890"}
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Location</h3>
              <p className="text-muted-foreground">
                {companyInfo?.address || "123 Main St, City, State"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

**Explanation:**
- `useState` - Tracks which category filter is selected
- `useQuery` - Fetches food items and company info from API
- `filteredItems` - Filters menu items based on selected category
- Hero section uses background image with dark overlay for text readability
- Category buttons change appearance when selected
- Grid layout displays food items as cards
- `data-testid` attributes make it easy to test later
- Footer shows company contact information

### Step 6: Create Main App Component

#### Create `client/src/App.tsx`

```typescript
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CustomerHome from "@/pages/customer-home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

**Explanation:**
- `QueryClientProvider` - Provides React Query to all child components
- `TooltipProvider` - Enables tooltips throughout the app
- `Router` - Defines URL routes and which component to show
- `Switch` - Renders only the first matching route
- `Toaster` - Shows toast notifications (success/error messages)
- `NotFound` - Catch-all route for unknown URLs

#### Create `client/src/pages/not-found.tsx`

```typescript
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

### Step 7: Create HTML Entry Point

#### Create `client/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ravi Canteen - Premium Catering Services</title>
    <meta name="description" content="Professional catering services for all your events. Browse our menu and book your event today.">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Explanation:**
- `viewport` meta tag makes site responsive on mobile
- `description` meta helps with SEO (search engines)
- `<div id="root">` is where React will render
- Script tag loads our TypeScript/React code

#### Create `client/src/main.tsx`

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Explanation:**
- `createRoot` - Creates React root from DOM element
- `StrictMode` - Enables extra development checks and warnings
- `!` - TypeScript assertion that element exists (won't be null)
- Imports our CSS styles which include Tailwind

---

## PHASE 2: Backend Development

Now we'll build the server to provide data to the frontend.

### Step 1: Configure Vite for Development

#### Create `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
```

**Explanation:**
- `plugins: [react()]` - Enables React JSX transformation
- `alias` - Allows importing with `@/` instead of `../../`
  - `@/components/ui/button` instead of `../../../components/ui/button`
- `root` - Sets client folder as root for Vite
- `build.outDir` - Where production files go
- `server.host: "0.0.0.0"` - Makes dev server accessible from any IP (required for Replit)
- `server.port: 5173` - Vite dev server port (internal)

#### Create `server/vite.ts`

```typescript
import type { Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
}

export async function setupVite(app: Express) {
  const vite = await import("vite");
  const viteDevServer = await vite.createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(viteDevServer.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientPath = path.resolve(__dirname, "..", "client");
      const template = fs.readFileSync(
        path.resolve(clientPath, "index.html"),
        "utf-8"
      );
      const html = await viteDevServer.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      viteDevServer.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(distPath));
  app.use("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

**Explanation:**
- `setupVite()` - Development mode: runs Vite dev server with hot reload
- `viteDevServer.middlewares` - Handles React app requests
- `transformIndexHtml()` - Injects Vite scripts into HTML
- `serveStatic()` - Production mode: serves pre-built files
- `app.use("*")` - Catch-all route sends index.html (for client-side routing)

### Step 2: Create Storage Interface

#### Create `server/storage.ts`

```typescript
import type {
  FoodItem, InsertFoodItem,
  EventBooking, InsertEventBooking, UpdateEventBooking,
  BookingItem, InsertBookingItem,
  CompanyInfo, InsertCompanyInfo,
  Staff, InsertStaff, UpdateStaff
} from "@shared/schema";

export interface IStorage {
  // Food Items CRUD
  getAllFoodItems(): Promise<FoodItem[]>;
  createFoodItem(data: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, data: Partial<InsertFoodItem>): Promise<FoodItem | null>;
  deleteFoodItem(id: string): Promise<boolean>;

  // Event Bookings CRUD
  getAllBookings(): Promise<EventBooking[]>;
  getBookingById(id: string): Promise<EventBooking | null>;
  createBooking(data: InsertEventBooking): Promise<EventBooking>;
  updateBooking(id: string, data: UpdateEventBooking): Promise<EventBooking | null>;
  deleteBooking(id: string): Promise<boolean>;

  // Booking Items (menu items for each booking)
  getBookingItems(bookingId: string): Promise<BookingItem[]>;
  addBookingItems(items: InsertBookingItem[]): Promise<void>;
  deleteBookingItems(bookingId: string): Promise<void>;

  // Company Info
  getCompanyInfo(): Promise<CompanyInfo | null>;
  updateCompanyInfo(data: InsertCompanyInfo): Promise<CompanyInfo>;

  // Staff Management
  getAllStaff(): Promise<Staff[]>;
  createStaff(data: InsertStaff): Promise<Staff>;
  updateStaff(id: string, data: UpdateStaff): Promise<Staff | null>;
  deleteStaff(id: string): Promise<boolean>;
}
```

**Explanation:**
- `IStorage` - Interface (contract) that defines all database operations
- This allows swapping between different storage implementations (SQLite, PostgreSQL, MongoDB)
- All methods are async (return Promises) because database operations take time
- CRUD = Create, Read, Update, Delete
- Type imports from `@shared/schema` ensure frontend and backend use same types

### Step 3: Create API Routes

#### Create `server/routes.ts`

```typescript
import express from "express";
import type { IStorage } from "./storage";
import {
  insertFoodItemSchema,
  insertEventBookingSchema,
  updateEventBookingSchema,
  insertBookingItemSchema,
  insertCompanyInfoSchema,
  insertStaffSchema,
  updateStaffSchema,
} from "@shared/schema";

export function createRouter(storage: IStorage) {
  const router = express.Router();

  // ============================================
  // FOOD ITEMS ROUTES
  // ============================================

  // GET /api/food-items - Get all menu items
  router.get("/food-items", async (req, res) => {
    try {
      const items = await storage.getAllFoodItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching food items:", error);
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  });

  // POST /api/food-items - Create new menu item
  router.post("/food-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating food item:", error);
      res.status(400).json({ error: "Invalid food item data" });
    }
  });

  // PUT /api/food-items/:id - Update menu item
  router.put("/food-items/:id", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.partial().parse(req.body);
      const item = await storage.updateFoodItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating food item:", error);
      res.status(400).json({ error: "Invalid food item data" });
    }
  });

  // DELETE /api/food-items/:id - Delete menu item
  router.delete("/food-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteFoodItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting food item:", error);
      res.status(500).json({ error: "Failed to delete food item" });
    }
  });

  // ============================================
  // EVENT BOOKINGS ROUTES
  // ============================================

  // GET /api/bookings - Get all bookings
  router.get("/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // GET /api/bookings/:id - Get single booking
  router.get("/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // POST /api/bookings - Create new booking
  router.post("/bookings", async (req, res) => {
    try {
      const validatedData = insertEventBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // PUT /api/bookings/:id - Update booking
  router.put("/bookings/:id", async (req, res) => {
    try {
      const validatedData = updateEventBookingSchema.parse(req.body);
      const booking = await storage.updateBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(400).json({ error: "Invalid booking data" });
    }
  });

  // DELETE /api/bookings/:id - Delete booking
  router.delete("/bookings/:id", async (req, res) => {
    try {
      const success = await storage.deleteBooking(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // ============================================
  // BOOKING ITEMS ROUTES
  // ============================================

  // GET /api/bookings/:id/items - Get menu items for a booking
  router.get("/bookings/:id/items", async (req, res) => {
    try {
      const items = await storage.getBookingItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching booking items:", error);
      res.status(500).json({ error: "Failed to fetch booking items" });
    }
  });

  // POST /api/bookings/:id/items - Add menu items to booking
  router.post("/bookings/:id/items", async (req, res) => {
    try {
      const items = req.body.items.map((item: any) =>
        insertBookingItemSchema.parse({ ...item, bookingId: req.params.id })
      );
      await storage.addBookingItems(items);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error adding booking items:", error);
      res.status(400).json({ error: "Invalid booking items data" });
    }
  });

  // ============================================
  // COMPANY INFO ROUTES
  // ============================================

  // GET /api/company-info - Get company information
  router.get("/company-info", async (req, res) => {
    try {
      const info = await storage.getCompanyInfo();
      res.json(info);
    } catch (error) {
      console.error("Error fetching company info:", error);
      res.status(500).json({ error: "Failed to fetch company info" });
    }
  });

  // PUT /api/company-info - Update company information
  router.put("/company-info", async (req, res) => {
    try {
      const validatedData = insertCompanyInfoSchema.parse(req.body);
      const info = await storage.updateCompanyInfo(validatedData);
      res.json(info);
    } catch (error) {
      console.error("Error updating company info:", error);
      res.status(400).json({ error: "Invalid company info data" });
    }
  });

  // ============================================
  // STAFF ROUTES
  // ============================================

  // GET /api/staff - Get all staff members
  router.get("/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  // POST /api/staff - Create new staff member
  router.post("/staff", async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(validatedData);
      res.status(201).json(staff);
    } catch (error) {
      console.error("Error creating staff:", error);
      res.status(400).json({ error: "Invalid staff data" });
    }
  });

  // PUT /api/staff/:id - Update staff member
  router.put("/staff/:id", async (req, res) => {
    try {
      const validatedData = updateStaffSchema.parse(req.body);
      const staff = await storage.updateStaff(req.params.id, validatedData);
      if (!staff) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      console.error("Error updating staff:", error);
      res.status(400).json({ error: "Invalid staff data" });
    }
  });

  // DELETE /api/staff/:id - Delete staff member
  router.delete("/staff/:id", async (req, res) => {
    try {
      const success = await storage.deleteStaff(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff:", error);
      res.status(500).json({ error: "Failed to delete staff" });
    }
  });

  return router;
}
```

**Explanation:**
- `express.Router()` - Creates modular route handlers
- Each route uses `try/catch` for error handling
- `.parse()` - Validates request data using Zod schemas
- HTTP status codes:
  - `200` - Success (default)
  - `201` - Created (for POST requests)
  - `204` - No content (for DELETE requests)
  - `400` - Bad request (invalid data)
  - `404` - Not found
  - `500` - Server error
- `req.params.id` - Gets ID from URL (e.g., /api/food-items/123)
- `req.body` - Gets data sent in request
- `res.json()` - Sends JSON response
- Routes follow REST conventions (GET for read, POST for create, PUT for update, DELETE for delete)

### Step 4: Create Main Server File

#### Create `server/index.ts`

```typescript
import express from "express";
import { createRouter } from "./routes";
import { DatabaseStorage } from "./storage-db";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
const storage = new DatabaseStorage();
app.use("/api", createRouter(storage));

// Setup frontend serving (Vite dev or static files)
if (process.env.NODE_ENV === "development") {
  await setupVite(app);
} else {
  serveStatic(app);
}

app.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
```

**Explanation:**
- `express()` - Creates Express application
- `express.json()` - Parses JSON request bodies
- `express.urlencoded()` - Parses form data
- `app.use("/api", ...)` - Mounts API routes under /api prefix
- `DatabaseStorage` - Will implement database operations (created in Phase 3)
- Development mode: Uses Vite dev server with hot reload
- Production mode: Serves pre-built static files
- `"0.0.0.0"` - Listens on all network interfaces (required for Replit)
- Port 5000 is the only port exposed to the internet

---

## PHASE 3: Database Setup

Now we'll create the database schema and implement storage.

### Step 1: Create Shared Schema

#### Create `shared/schema.ts`

```typescript
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function to generate random IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// ============================================
// FOOD ITEMS TABLE
// ============================================
export const foodItems = sqliteTable("food_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

// ============================================
// EVENT BOOKINGS TABLE
// ============================================
export const eventBookings = sqliteTable("event_bookings", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  clientName: text("client_name").notNull(),
  eventDate: text("event_date").notNull(),
  eventType: text("event_type").notNull(),
  guestCount: integer("guest_count").notNull(),
  pricePerPlate: integer("price_per_plate").notNull(),
  servingBoysNeeded: integer("serving_boys_needed").notNull().default(2),
  status: text("status").notNull().default("pending"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  specialRequests: text("special_requests"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// BOOKING ITEMS TABLE (many-to-many)
// ============================================
export const bookingItems = sqliteTable("booking_items", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  bookingId: text("booking_id").notNull()
    .references(() => eventBookings.id, { onDelete: 'cascade' }),
  foodItemId: text("food_item_id").notNull()
    .references(() => foodItems.id, { onDelete: 'cascade' }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// COMPANY INFO TABLE
// ============================================
export const companyInfo = sqliteTable("company_info", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  companyName: text("company_name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  eventsPerYear: integer("events_per_year").notNull().default(500),
});

// ============================================
// STAFF TABLE
// ============================================
export const staff = sqliteTable("staff", {
  id: text("id").primaryKey().$defaultFn(() => generateId()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  phone: text("phone").notNull(),
  experience: text("experience").notNull(),
  imageUrl: text("image_url"),
  salary: integer("salary").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

// Food Items
export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true });
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

// Event Bookings
export const insertEventBookingSchema = createInsertSchema(eventBookings).omit({
  id: true,
  createdAt: true,
  status: true,
});
export const updateEventBookingSchema = createInsertSchema(eventBookings)
  .omit({ id: true, createdAt: true }).partial();
export type InsertEventBooking = z.infer<typeof insertEventBookingSchema>;
export type UpdateEventBooking = z.infer<typeof updateEventBookingSchema>;
export type EventBooking = typeof eventBookings.$inferSelect;

// Booking Items
export const insertBookingItemSchema = createInsertSchema(bookingItems).omit({
  id: true,
  createdAt: true,
});
export type InsertBookingItem = z.infer<typeof insertBookingItemSchema>;
export type BookingItem = typeof bookingItems.$inferSelect;

// Company Info
export const insertCompanyInfoSchema = createInsertSchema(companyInfo).omit({ id: true });
export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;
export type CompanyInfo = typeof companyInfo.$inferSelect;

// Staff
export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});
export const updateStaffSchema = createInsertSchema(staff)
  .omit({ id: true, createdAt: true }).partial();
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type UpdateStaff = z.infer<typeof updateStaffSchema>;
export type Staff = typeof staff.$inferSelect;
```

**Explanation:**

**Tables:**
- `sqliteTable()` - Defines a database table
- `text()` - Text column
- `integer()` - Number column
- `.primaryKey()` - Makes column unique identifier
- `.notNull()` - Field is required
- `.default()` - Default value if not provided
- `.$defaultFn()` - Function to generate default value
- `.references()` - Foreign key to another table
- `onDelete: 'cascade'` - Deleting parent deletes children

**Relationships:**
- `foodItems` → Menu items (appetizers, mains, etc.)
- `eventBookings` → Customer event reservations
- `bookingItems` → Links bookings to menu items (many-to-many)
  - One booking can have many food items
  - One food item can be in many bookings
- `companyInfo` → Business information (single row)
- `staff` → Employees (chefs, workers, serving staff)

**Validation:**
- `createInsertSchema()` - Converts Drizzle table to Zod schema
- `.omit()` - Removes fields (like auto-generated id)
- `.partial()` - Makes all fields optional (for updates)
- `z.infer<>` - Gets TypeScript type from Zod schema
- `$inferSelect` - Gets TypeScript type from Drizzle table

### Step 2: Configure Drizzle

#### Create `drizzle.config.ts`

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;
```

**Explanation:**
- `schema` - Where your table definitions are
- `out` - Where migration files go
- `dialect` - Database type (SQLite, PostgreSQL, MySQL, etc.)
- `dbCredentials.url` - Path to database file
- `satisfies Config` - TypeScript checks configuration is valid

### Step 3: Create Database Connection

#### Create `server/db.ts`

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });
```

**Explanation:**
- `new Database()` - Opens/creates SQLite database file
- `drizzle()` - Wraps database with Drizzle ORM
- `{ schema }` - Provides table definitions to Drizzle
- Exports `db` for use in storage implementation

### Step 4: Implement Database Storage

#### Create `server/storage-db.ts`

```typescript
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  foodItems, eventBookings, bookingItems, companyInfo, staff,
  type FoodItem, type InsertFoodItem,
  type EventBooking, type InsertEventBooking, type UpdateEventBooking,
  type BookingItem, type InsertBookingItem,
  type CompanyInfo, type InsertCompanyInfo,
  type Staff, type InsertStaff, type UpdateStaff,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // ============================================
  // FOOD ITEMS
  // ============================================

  async getAllFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(foodItems);
  }

  async createFoodItem(data: InsertFoodItem): Promise<FoodItem> {
    const [item] = await db.insert(foodItems).values(data).returning();
    return item;
  }

  async updateFoodItem(id: string, data: Partial<InsertFoodItem>): Promise<FoodItem | null> {
    const [item] = await db
      .update(foodItems)
      .set(data)
      .where(eq(foodItems.id, id))
      .returning();
    return item || null;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const result = await db.delete(foodItems).where(eq(foodItems.id, id));
    return result.changes > 0;
  }

  // ============================================
  // EVENT BOOKINGS
  // ============================================

  async getAllBookings(): Promise<EventBooking[]> {
    return await db.select().from(eventBookings);
  }

  async getBookingById(id: string): Promise<EventBooking | null> {
    const [booking] = await db
      .select()
      .from(eventBookings)
      .where(eq(eventBookings.id, id));
    return booking || null;
  }

  async createBooking(data: InsertEventBooking): Promise<EventBooking> {
    const [booking] = await db.insert(eventBookings).values(data).returning();
    return booking;
  }

  async updateBooking(id: string, data: UpdateEventBooking): Promise<EventBooking | null> {
    const [booking] = await db
      .update(eventBookings)
      .set(data)
      .where(eq(eventBookings.id, id))
      .returning();
    return booking || null;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(eventBookings).where(eq(eventBookings.id, id));
    return result.changes > 0;
  }

  // ============================================
  // BOOKING ITEMS
  // ============================================

  async getBookingItems(bookingId: string): Promise<BookingItem[]> {
    return await db
      .select()
      .from(bookingItems)
      .where(eq(bookingItems.bookingId, bookingId));
  }

  async addBookingItems(items: InsertBookingItem[]): Promise<void> {
    if (items.length > 0) {
      await db.insert(bookingItems).values(items);
    }
  }

  async deleteBookingItems(bookingId: string): Promise<void> {
    await db.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
  }

  // ============================================
  // COMPANY INFO
  // ============================================

  async getCompanyInfo(): Promise<CompanyInfo | null> {
    const [info] = await db.select().from(companyInfo).limit(1);
    return info || null;
  }

  async updateCompanyInfo(data: InsertCompanyInfo): Promise<CompanyInfo> {
    const existing = await this.getCompanyInfo();
    
    if (existing) {
      const [updated] = await db
        .update(companyInfo)
        .set(data)
        .where(eq(companyInfo.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(companyInfo).values(data).returning();
      return created;
    }
  }

  // ============================================
  // STAFF
  // ============================================

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async createStaff(data: InsertStaff): Promise<Staff> {
    const [member] = await db.insert(staff).values(data).returning();
    return member;
  }

  async updateStaff(id: string, data: UpdateStaff): Promise<Staff | null> {
    const [member] = await db
      .update(staff)
      .set(data)
      .where(eq(staff.id, id))
      .returning();
    return member || null;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return result.changes > 0;
  }
}
```

**Explanation:**

**Drizzle Query Builders:**
- `db.select()` - Fetch records
- `db.insert()` - Create new records
- `db.update()` - Modify existing records
- `db.delete()` - Remove records
- `.from(table)` - Which table to query
- `.where(condition)` - Filter results
- `.returning()` - Return the affected rows
- `.limit(1)` - Only return first result

**Drizzle Operators:**
- `eq(column, value)` - Equals comparison
- `and(condition1, condition2)` - Combine conditions

**Patterns:**
- All methods return Promises (async operations)
- `.returning()` returns array, we use `[item]` to destructure first element
- `|| null` converts undefined to null
- `result.changes > 0` checks if delete was successful
- Company info uses upsert pattern (update if exists, insert if not)

### Step 5: Add Database Scripts

Edit `package.json` and add scripts:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

**Explanation:**
- `dev` - Starts development server with hot reload
- `build` - Builds production-ready files
  - `vite build` - Compiles React app
  - `esbuild` - Bundles Node.js server
- `start` - Runs production server
- `check` - Type-checks TypeScript without building
- `db:push` - Creates/updates database from schema

### Step 6: Initialize Database

```bash
npm run db:push
```

**What this does:**
- Reads `shared/schema.ts`
- Creates/updates tables in `sqlite.db`
- No migration files needed for SQLite

### Step 7: Add TypeScript Configuration

#### Create `tsconfig.json` (root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["server/**/*", "shared/**/*"]
}
```

**Explanation:**
- `target: "ES2022"` - Output modern JavaScript
- `module: "ESNext"` - Use latest module system
- `moduleResolution: "Bundler"` - How to find imports
- `allowImportingTsExtensions` - Import .ts files
- `strict: true` - Strict type checking
- `noEmit: true` - Don't output JS (we use tsx/esbuild)
- `paths` - Allows `@shared/schema` imports
- `include` - Which files to type-check

#### Create `client/tsconfig.json`

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"],
      "@assets/*": ["../attached_assets/*"]
    }
  },
  "include": ["src/**/*"]
}
```

**Explanation:**
- `extends` - Inherits from root config
- `lib` - Adds DOM types for browser
- `jsx: "react-jsx"` - Enables JSX transformation
- Additional paths for frontend imports

---

## Testing & Running

### Development Mode

```bash
npm run dev
```

**What happens:**
1. Starts Express server on port 5000
2. Starts Vite dev server internally
3. Frontend auto-reloads on code changes
4. Backend restarts on code changes
5. Open browser to your Replit URL or localhost:5000

### Production Build

```bash
npm run build
npm start
```

**What happens:**
1. `build` creates optimized files in `dist/`
2. `start` runs production server
3. Serves static files (no hot reload)

### Type Checking

```bash
npm run check
```

Checks TypeScript types without running the app.

---

## Deployment

### Deploy on Replit

1. Your app is already set up
2. Click "Run" button (runs `npm run dev`)
3. Click "Deploy" button to publish
4. Replit handles everything automatically

### Deploy on Vercel/Netlify

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist/public`
4. Deploy!

Note: You'll need to configure serverless functions for the API routes or use a different hosting solution that supports full-stack apps.

---

## Summary

**You now have:**

✅ **Frontend** - React app with Tailwind CSS and shadcn/ui components  
✅ **Backend** - Express.js REST API with TypeScript  
✅ **Database** - SQLite with Drizzle ORM  
✅ **Type Safety** - Shared types between frontend and backend  
✅ **Development Setup** - Hot reload with Vite  
✅ **Production Ready** - Build scripts and deployment config  

**Next steps:**
- Add more pages (admin dashboard, booking forms)
- Add authentication
- Add image uploads
- Add more features!

---

## Project File Structure Summary

```
ravi-canteen/
├── client/
│   ├── src/
│   │   ├── components/ui/        # shadcn components
│   │   ├── pages/                # Page components
│   │   ├── lib/
│   │   │   ├── utils.ts          # Helper functions
│   │   │   └── queryClient.ts    # React Query setup
│   │   ├── hooks/                # Custom hooks
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html                # HTML template
│   └── tsconfig.json             # TypeScript config
├── server/
│   ├── index.ts                  # Server entry point
│   ├── routes.ts                 # API endpoints
│   ├── storage.ts                # Storage interface
│   ├── storage-db.ts             # Database implementation
│   ├── db.ts                     # Database connection
│   └── vite.ts                   # Vite integration
├── shared/
│   └── schema.ts                 # Database schema & types
├── attached_assets/              # Static files
├── drizzle.config.ts             # Database config
├── vite.config.ts                # Vite config
├── tailwind.config.ts            # Tailwind config
├── postcss.config.js             # PostCSS config
├── tsconfig.json                 # Root TypeScript config
└── package.json                  # Dependencies & scripts
```

---

## Common Issues & Solutions

**Issue**: `Cannot find module '@/components/ui/button'`  
**Solution**: Check `vite.config.ts` has correct alias paths

**Issue**: Database errors  
**Solution**: Run `npm run db:push` to create/update tables

**Issue**: Port 5000 already in use  
**Solution**: Change `PORT` in `server/index.ts`

**Issue**: Types not working  
**Solution**: Run `npm run check` to see TypeScript errors

**Issue**: Styles not loading  
**Solution**: Make sure `index.css` is imported in `main.tsx`

---

## Congratulations!

You've built a full-stack TypeScript application from scratch. This guide covered:
- Modern React development with hooks and TypeScript
- REST API design with Express.js
- Database modeling with Drizzle ORM
- Type-safe full-stack development
- Production deployment

Happy coding! 🚀
