# Detailed Full-Stack Project Blueprint

This blueprint provides the exact file structure and code patterns required to build a project identical to this one.

## 1. Shared Schema (`shared/schema.ts`)
This is the single source of truth for your data.
```typescript
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  category: text("category").notNull(),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({ id: true });
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
```

## 2. Storage Layer (`server/storage.ts`)
Abstracts database operations.
```typescript
import { FoodItem, InsertFoodItem } from "@shared/schema";

export interface IStorage {
  getFoodItems(): Promise<FoodItem[]>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
}

export class MemStorage implements IStorage {
  private foodItems: Map<number, FoodItem>;
  private currentId: number;

  constructor() {
    this.foodItems = new Map();
    this.currentId = 1;
  }

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values());
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.currentId++;
    const item = { ...insertItem, id };
    this.foodItems.set(id, item);
    return item;
  }
}

export const storage = new MemStorage();
```

## 3. API Routes (`server/routes.ts`)
Defines the REST endpoints.
```typescript
import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertFoodItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/food-items", async (_req, res) => {
    const items = await storage.getFoodItems();
    res.json(items);
  });

  app.post("/api/food-items", async (req, res) => {
    const result = insertFoodItemSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const item = await storage.createFoodItem(result.data);
    res.json(item);
  });

  return createServer(app);
}
```

## 4. Frontend API Client (`client/src/lib/queryClient.ts`)
Standardizes how you talk to the backend.
```typescript
import { QueryClient, QueryFunctionContext } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }: QueryFunctionContext) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) throw new Error("Network error");
        return res.json();
      },
    },
  },
});
```

## 5. Main Application Entry (`client/src/App.tsx`)
Sets up routing and providers.
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
```

## 6. Page Implementation (`client/src/pages/home.tsx`)
A complete example of a data-driven page.
```typescript
import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: items, isLoading } = useQuery<FoodItem[]>({ 
    queryKey: ["/api/food-items"] 
  });

  if (isLoading) return <Skeleton className="h-20 w-full" />;

  return (
    <div className="p-8 grid gap-4 md:grid-cols-3">
      {items?.map(item => (
        <Card key={item.id}>
          <CardHeader><CardTitle>{item.name}</CardTitle></CardHeader>
          <CardContent><p>{item.category} - ${item.price}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
```
