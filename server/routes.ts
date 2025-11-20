import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db";
import { insertFoodItemSchema, insertEventBookingSchema, updateEventBookingSchema, insertCompanyInfoSchema, insertStaffSchema, updateStaffSchema, insertBookingItemSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { verifyPassword, updatePassword } from "./password-manager";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin Login Route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      const isValid = await verifyPassword(password);
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin Password Change Route
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      const isCurrentPasswordValid = await verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      await updatePassword(newPassword);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Food Items Routes
  app.get("/api/food-items", async (_req, res) => {
    try {
      const items = await storage.getFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const item = await storage.getFoodItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch food item" });
    }
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const result = insertFoodItemSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const item = await storage.createFoodItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create food item" });
    }
  });

  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const result = insertFoodItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const item = await storage.updateFoodItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update food item" });
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFoodItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete food item" });
    }
  });

  // Event Bookings Routes
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const result = insertEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const booking = await storage.createBooking(result.data);
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const result = updateEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const booking = await storage.updateBooking(req.params.id, result.data);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Booking Items Routes
  app.get("/api/bookings/:id/items", async (req, res) => {
    try {
      const items = await storage.getBookingItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking items" });
    }
  });

  app.post("/api/bookings/:id/items", async (req, res) => {
    try {
      const itemsSchema = z.array(insertBookingItemSchema);
      const result = itemsSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      await storage.deleteBookingItems(req.params.id);
      
      const items = [];
      for (const item of result.data) {
        const newItem = await storage.createBookingItem(item);
        items.push(newItem);
      }
      
      res.status(201).json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to create booking items" });
    }
  });

  // Chef Printout Route - Get bookings grouped by date
  app.get("/api/chef-printout", async (req, res) => {
    try {
      const { date } = req.query;
      const allBookings = await storage.getBookings();
      
      let filteredBookings = allBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending');
      
      if (date) {
        filteredBookings = filteredBookings.filter((b: any) => b.eventDate === date);
      }
      
      const bookingsWithItems = [];
      for (const booking of filteredBookings) {
        const items = await storage.getBookingItems(booking.id);
        bookingsWithItems.push({ ...booking, items });
      }
      
      const groupedByDate: Record<string, typeof bookingsWithItems> = {};
      for (const booking of bookingsWithItems) {
        if (!groupedByDate[booking.eventDate]) {
          groupedByDate[booking.eventDate] = [];
        }
        groupedByDate[booking.eventDate].push(booking);
      }
      
      res.json(groupedByDate);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chef printout data" });
    }
  });

  // Company Info Routes
  app.get("/api/company-info", async (_req, res) => {
    try {
      const info = await storage.getCompanyInfo();
      if (!info) {
        return res.status(404).json({ error: "Company info not found" });
      }
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company info" });
    }
  });

  app.post("/api/company-info", async (req, res) => {
    try {
      const result = insertCompanyInfoSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const info = await storage.createCompanyInfo(result.data);
      res.status(201).json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to create company info" });
    }
  });

  app.patch("/api/company-info/:id", async (req, res) => {
    try {
      const result = insertCompanyInfoSchema.partial().safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const info = await storage.updateCompanyInfo(req.params.id, result.data);
      if (!info) {
        return res.status(404).json({ error: "Company info not found" });
      }
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to update company info" });
    }
  });

  // Staff Routes
  app.get("/api/staff", async (_req, res) => {
    try {
      const staffList = await storage.getStaff();
      res.json(staffList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(req.params.id);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff member" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const result = insertStaffSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const staffMember = await storage.createStaffMember(result.data);
      res.status(201).json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to create staff member" });
    }
  });

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const result = updateStaffSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const staffMember = await storage.updateStaffMember(req.params.id, result.data);
      if (!staffMember) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStaffMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
