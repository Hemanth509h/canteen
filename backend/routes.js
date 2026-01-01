import bcrypt from "bcryptjs";
import { createServer } from "http";
import { randomUUID } from "crypto";
import { getStorage } from "./db.js";
import { 
  insertFoodItemSchema, 
  insertEventBookingSchema, 
  updateEventBookingSchema, 
  insertCompanyInfoSchema, 
  insertStaffSchema, 
  updateStaffSchema, 
  insertBookingItemSchema, 
  insertCustomerReviewSchema, 
  updateCustomerReviewSchema, 
  insertStaffBookingRequestSchema, 
  updateStaffBookingRequestSchema 
} from "./schema.js";
import { fromZodError } from "zod-validation-error";
import { verifyPassword, updatePassword } from "./password-manager.js";
import { z } from "zod";

// Get storage instance (initialized after connectToDatabase is called)
const getStorageInstance = () => getStorage();

export async function registerRoutes(app) {
  // All routes are defined relative to the root now, but they still have /api prefix
  // If Vercel rewrites /api/* to this handler, it needs to match the full path
  
  // Standardized Response Utility
  const sendResponse = (res, status, data, error = null) => {
    return res.status(status).json({
      success: status >= 200 && status < 300,
      data,
      error,
      timestamp: new Date().toISOString()
    });
  };

  // Admin Login Route
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      console.log("Login request received");
      const isValid = await verifyPassword(password);
      if (isValid) {
        console.log("Login success");
        sendResponse(res, 200, { success: true });
      } else {
        console.log("Login failed: invalid password");
        sendResponse(res, 401, null, "Invalid password");
      }
    } catch (error) {
      console.error("Login route error:", error);
      sendResponse(res, 500, null, "Login failed");
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
      const items = await getStorageInstance().getFoodItems();
      sendResponse(res, 200, items);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch food items");
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const item = await getStorageInstance().getFoodItem(req.params.id);
      if (!item) {
        return sendResponse(res, 404, null, "Food item not found");
      }
      sendResponse(res, 200, item);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch food item");
    }
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const result = insertFoodItemSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }

      const item = await getStorageInstance().createFoodItem(result.data);
      sendResponse(res, 201, item);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create food item");
    }
  });

  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const result = insertFoodItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }

      const item = await getStorageInstance().updateFoodItem(req.params.id, result.data);
      if (!item) {
        return sendResponse(res, 404, null, "Food item not found");
      }
      sendResponse(res, 200, item);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update food item");
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteFoodItem(req.params.id);
      if (!deleted) {
        return sendResponse(res, 404, null, "Food item not found");
      }
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete food item");
    }
  });

  // Event Bookings Routes
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await getStorageInstance().getBookings();
      sendResponse(res, 200, bookings);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch bookings");
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await getStorageInstance().getBooking(req.params.id);
      if (!booking) {
        return sendResponse(res, 404, null, "Booking not found");
      }
      sendResponse(res, 200, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch booking");
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const result = updateEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }

      const booking = await getStorageInstance().updateBooking(req.params.id, result.data);
      if (!booking) {
        return sendResponse(res, 404, null, "Booking not found");
      }
      sendResponse(res, 200, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update booking");
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteBooking(req.params.id);
      if (!deleted) {
        return sendResponse(res, 404, null, "Booking not found");
      }
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete booking");
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const result = insertEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }

      // Ensure calculated amounts are included if provided in the body (from frontend)
      const bookingData = {
        ...result.data,
        totalAmount: req.body.totalAmount || (result.data.guestCount * result.data.pricePerPlate),
        advanceAmount: req.body.advanceAmount || Math.round((req.body.totalAmount || (result.data.guestCount * result.data.pricePerPlate)) * 0.5)
      };

      const booking = await getStorageInstance().createBooking(bookingData);
      sendResponse(res, 201, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create booking");
    }
  });

  // Booking Items Routes
  app.get("/api/bookings/:id/items", async (req, res) => {
    try {
      const items = await getStorageInstance().getBookingItems(req.params.id);
      sendResponse(res, 200, items);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch booking items");
    }
  });

  app.post("/api/bookings/:id/items", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const items = Array.isArray(req.body) ? req.body : [req.body];
      
      // Clean existing items first if updating
      await getStorageInstance().deleteBookingItems(bookingId);
      
      const createdItems = await Promise.all(
        items.map(item => getStorageInstance().createBookingItem({ ...item, bookingId }))
      );
      
      sendResponse(res, 201, createdItems);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create booking items");
    }
  });

  // Reviews
  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await getStorageInstance().getReviews();
      sendResponse(res, 200, reviews);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch reviews");
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const result = updateCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }
      const review = await getStorageInstance().updateReview(req.params.id, result.data);
      if (!review) {
        return sendResponse(res, 404, null, "Review not found");
      }
      sendResponse(res, 200, review);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update review");
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteReview(req.params.id);
      if (!deleted) {
        return sendResponse(res, 404, null, "Review not found");
      }
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete review");
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const result = insertCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }
      const review = await getStorageInstance().createReview(result.data);
      sendResponse(res, 201, review);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create review");
    }
  });

  // Company Info Routes
  app.get("/api/company-info", async (_req, res) => {
    try {
      const info = await getStorageInstance().getCompanyInfo();
      if (!info) {
        return sendResponse(res, 200, {}); // Return empty object instead of 404
      }
      sendResponse(res, 200, info);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch company info");
    }
  });

  app.patch("/api/company-info", async (req, res) => {
    try {
      const result = insertCompanyInfoSchema.partial().safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }
      const info = await getStorageInstance().updateCompanyInfo(null, result.data);
      sendResponse(res, 200, info);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update company info");
    }
  });

  // Staff Booking Requests Routes
  app.get("/api/bookings/:id/assigned-staff", async (req, res) => {
    try {
      const requests = await getStorageInstance().getStaffBookingRequests(req.params.id);
      const staffIds = requests.map(r => r.staffId);
      const staff = await Promise.all(staffIds.map(id => getStorageInstance().getStaffMember(id)));
      res.json(staff.filter(Boolean));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff booking requests" });
    }
  });

  app.post("/api/bookings/:id/assign-staff", async (req, res) => {
    try {
      const { staffId } = req.body;
      const bookingId = req.params.id;

      console.log(`[API] POST /api/bookings/${bookingId}/assign-staff`, { staffId });

      if (!staffId) {
        return res.status(400).json({ error: "Staff ID is required" });
      }

      // Check if already assigned
      const existing = await getStorageInstance().getStaffBookingRequests(bookingId);
      const alreadyAssigned = existing.find(r => r.staffId === staffId);
      if (alreadyAssigned) {
        console.log(`[API] Staff ${staffId} already assigned to booking ${bookingId}`);
        return res.json(alreadyAssigned);
      }

      const request = await getStorageInstance().createStaffBookingRequest({
        bookingId,
        staffId,
        status: "accepted", // Auto-accept when assigned by admin
        token: randomUUID()
      });
      console.log(`[API] Created staff assignment:`, request);
      res.status(201).json(request);
    } catch (error) {
      console.error("Assign staff error:", error);
      res.status(500).json({ error: "Failed to assign staff" });
    }
  });

  app.get("/api/staff-requests/token/:token", async (req, res) => {
    try {
      const request = await getStorageInstance().getStaffBookingRequestByToken(req.params.token);
      if (!request) {
        return res.status(404).json({ error: "Staff request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff request" });
    }
  });

  app.post("/api/staff-requests", async (req, res) => {
    try {
      const result = insertStaffBookingRequestSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      // Check if already assigned
      const existing = await getStorageInstance().getStaffBookingRequests(result.data.bookingId);
      const alreadyAssigned = existing.find(r => r.staffId === result.data.staffId);
      if (alreadyAssigned) {
        return res.json(alreadyAssigned);
      }

      const request = await getStorageInstance().createStaffBookingRequest({
        ...result.data,
        status: "pending",
        token: randomUUID()
      });
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create staff booking request" });
    }
  });

  app.patch("/api/staff-requests/:id", async (req, res) => {
    try {
      const result = updateStaffBookingRequestSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const request = await getStorageInstance().updateStaffBookingRequest(req.params.id, result.data);
      if (!request) {
        return res.status(404).json({ error: "Staff request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff request" });
    }
  });

  app.delete("/api/staff-requests/booking/:bookingId/staff/:staffId", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteStaffBookingRequest(req.params.bookingId, req.params.staffId);
      if (!deleted) {
        return res.status(404).json({ error: "Staff assignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff assignment" });
    }
  });

  app.get("/api/bookings/:id/accepted-staff", async (req, res) => {
    try {
      const staff = await getStorageInstance().getAcceptedStaffForBooking(req.params.id);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accepted staff" });
    }
  });

  // Admin Notifications Routes
  app.get("/api/notifications", async (_req, res) => {
    try {
      const notifications = await getStorageInstance().getNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const { type, title, message, bookingId } = req.body;
      const notification = await getStorageInstance().createNotification({ 
        type, 
        title, 
        message, 
        bookingId,
        read: false 
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const success = await getStorageInstance().markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteNotification(req.params.id);
      if (!deleted) {
        return sendResponse(res, 404, null, "Notification not found");
      }
      res.status(204).send();
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete notification");
    }
  });

  // Staff Routes
  app.get("/api/staff", async (_req, res) => {
    try {
      const staff = await getStorageInstance().getStaff();
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff");
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staff = await getStorageInstance().getStaffMember(req.params.id);
      if (!staff) {
        return sendResponse(res, 404, null, "Staff member not found");
      }
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff member");
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const result = insertStaffSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }
      const staff = await getStorageInstance().createStaffMember(result.data);
      sendResponse(res, 201, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create staff member");
    }
  });

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const result = updateStaffSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return sendResponse(res, 400, null, error.message);
      }
      const staff = await getStorageInstance().updateStaffMember(req.params.id, result.data);
      if (!staff) {
        return sendResponse(res, 404, null, "Staff member not found");
      }
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update staff member");
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteStaffMember(req.params.id);
      if (!deleted) {
        return sendResponse(res, 404, null, "Staff member not found");
      }
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete staff member");
    }
  });

  // Staff Booking Requests Routes
  app.get("/api/staff-requests/:bookingId", async (req, res) => {
    try {
      const requests = await getStorageInstance().getStaffBookingRequests(req.params.bookingId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff requests" });
    }
  });

  app.post("/api/staff-requests", async (req, res) => {
    try {
      const result = insertStaffBookingRequestSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const request = await getStorageInstance().createStaffBookingRequest(result.data);
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create staff request" });
    }
  });

  app.patch("/api/staff-requests/:id", async (req, res) => {
    try {
      const result = updateStaffBookingRequestSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const request = await getStorageInstance().updateStaffBookingRequest(req.params.id, result.data);
      if (!request) {
        return res.status(404).json({ error: "Staff request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update staff request" });
    }
  });

  app.get("/api/staff-requests/token/:token", async (req, res) => {
    try {
      const request = await getStorageInstance().getStaffBookingRequestByToken(req.params.token);
      if (!request) {
        return res.status(404).json({ error: "Invalid token" });
      }
      
      const booking = await getStorageInstance().getBooking(request.bookingId);
      const staff = await getStorageInstance().getStaffMember(request.staffId);
      
      res.json({ request, booking, staff });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request by token" });
    }
  });

  app.get("/api/bookings/:id/accepted-staff", async (req, res) => {
    try {
      const staff = await getStorageInstance().getAcceptedStaffForBooking(req.params.id);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accepted staff" });
    }
  });

  // Audit History Routes
  app.get("/api/audit-history", async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const history = await getStorageInstance().getAuditHistory(
        entityType,
        entityId
      );
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit history" });
    }
  });

  app.delete("/api/audit-history/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteAuditHistory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Audit entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete audit history" });
    }
  });

  app.post("/api/audit-history", async (req, res) => {
    try {
      const { action, entityType, entityId, details } = req.body;
      const log = await getStorageInstance().createAuditHistory({
        action,
        entityType,
        entityId,
        details: details || {}
      });
      res.status(201).json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create audit history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
