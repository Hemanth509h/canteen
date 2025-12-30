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
      console.log("[GET] /api/food-items - Fetching items...");
      const items = await getStorageInstance().getFoodItems();
      console.log(`[GET] /api/food-items - Found ${items.length} items`);
      res.json(items);
    } catch (error) {
      console.error("[GET] /api/food-items error:", error);
      res.status(500).json({ error: "Failed to fetch food items" });
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const item = await getStorageInstance().getFoodItem(req.params.id);
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
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      const item = await getStorageInstance().createFoodItem(result.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Create food item error:", error);
      res.status(500).json({ error: "Failed to create food item. Please try again." });
    }
  });

  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const result = insertFoodItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      const item = await getStorageInstance().updateFoodItem(req.params.id, result.data);
      if (!item) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Update food item error:", error);
      res.status(500).json({ error: "Failed to update food item. Please try again." });
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteFoodItem(req.params.id);
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
      const bookings = await getStorageInstance().getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/lookup", async (req, res) => {
    try {
      const { email, phone } = req.query;
      
      if (!email && !phone) {
        return res.status(400).json({ error: "Email or phone is required" });
      }

      const bookings = await getStorageInstance().getBookings();
      
      let booking = null;
      if (email) {
        booking = bookings.find(b => 
          b.contactEmail.toLowerCase() === String(email).toLowerCase()
        );
      } else if (phone) {
        const cleanPhone = String(phone).replace(/\D/g, "");
        booking = bookings.find(b => 
          b.contactPhone.replace(/\D/g, "").includes(cleanPhone) ||
          cleanPhone.includes(b.contactPhone.replace(/\D/g, ""))
        );
      }

      if (!booking) {
        return res.status(404).json({ error: "No booking found" });
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup booking" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await getStorageInstance().getBooking(req.params.id);
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
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      // Get company settings for minimum advance booking days
      const companyInfo = await getStorageInstance().getCompanyInfo();
      const minDays = companyInfo?.minAdvanceBookingDays || 2;

      // Validate minimum advance booking notice
      const bookingDate = new Date(result.data.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = new Date(today);
      minDate.setDate(minDate.getDate() + minDays);
      
      if (bookingDate < minDate) {
        return res.status(400).json({ error: `Bookings must be made at least ${minDays} day${minDays !== 1 ? 's' : ''} in advance` });
      }

      // Check for double-booking
      const allBookings = await getStorageInstance().getBookings();
      const existingBooking = allBookings.find(b => 
        b.eventDate === result.data.eventDate && 
        (b.status === 'confirmed' || b.status === 'pending')
      );
      
      if (existingBooking) {
        return res.status(409).json({ error: "This date is already booked. Please select another date" });
      }

      // Recalculate amounts based on guest count and price per plate if totalAmount isn't provided
      const bookingData = {
        ...result.data,
        status: "pending",
        advancePaymentStatus: "pending",
        finalPaymentStatus: "pending",
        advancePaymentApprovalStatus: "pending",
        finalPaymentApprovalStatus: "pending",
        totalAmount: result.data.guestCount * result.data.pricePerPlate,
        advanceAmount: Math.floor((result.data.guestCount * result.data.pricePerPlate) * 0.2), // Default 20% advance
      };

      const booking = await getStorageInstance().createBooking(bookingData);
      
      // Create notification for new booking
      await getStorageInstance().createNotification({
        type: "booking",
        title: "New Booking",
        message: `New booking from ${result.data.clientName} for ${result.data.eventType} on ${result.data.eventDate}`,
        bookingId: booking.id,
        read: false
      });
      
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
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      const oldBooking = await getStorageInstance().getBooking(req.params.id);
      if (!oldBooking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const updateData = { ...result.data };

      // Business logic: recalculate payment status if totalAmount or advanceAmount changed
      if (updateData.totalAmount !== undefined || updateData.advanceAmount !== undefined) {
        const newTotal = updateData.totalAmount ?? (oldBooking.totalAmount || 0);
        const newAdvance = updateData.advanceAmount ?? (oldBooking.advanceAmount || 0);

        // If total amount increased and it was already completed/paid
        if (newTotal > (oldBooking.totalAmount || 0)) {
          // If it was previously approved/paid, treat the old total as the "paid" part of the new total
          // Effectively, the advance payment now contains everything paid so far, 
          // and the final payment status is reset to 'pending' for the remaining balance.
          if (oldBooking.finalPaymentStatus === 'paid' || (oldBooking.finalPaymentApprovalStatus) === 'approved') {
            updateData.advanceAmount = oldBooking.totalAmount; // Old total becomes new advance (already paid)
            updateData.advancePaymentStatus = 'paid';
            updateData.advancePaymentApprovalStatus = 'approved';
            
            updateData.finalPaymentStatus = 'pending';
            updateData.finalPaymentApprovalStatus = 'pending';
            updateData.status = 'confirmed'; // Revert to confirmed if it was completed
          } else {
            // Normal behavior for pending bookings
            if (oldBooking.finalPaymentApprovalStatus === 'approved') {
              updateData.finalPaymentApprovalStatus = 'pending';
              updateData.finalPaymentStatus = 'pending';
            }
            if (newAdvance > (oldBooking.advanceAmount || 0) && oldBooking.advancePaymentApprovalStatus === 'approved') {
              updateData.advancePaymentApprovalStatus = 'pending';
              updateData.advancePaymentStatus = 'pending';
            }
          }
        }
      }

      const booking = await getStorageInstance().updateBooking(req.params.id, updateData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Create notification if payment status changed
      if (oldBooking && (updateData.advancePaymentStatus !== undefined || updateData.finalPaymentStatus !== undefined)) {
        const paymentMsg = [];
        if (updateData.advancePaymentStatus && updateData.advancePaymentStatus !== oldBooking.advancePaymentStatus) {
          paymentMsg.push(`Advance: ${updateData.advancePaymentStatus}`);
        }
        if (updateData.finalPaymentStatus && updateData.finalPaymentStatus !== oldBooking.finalPaymentStatus) {
          paymentMsg.push(`Final: ${updateData.finalPaymentStatus}`);
        }
        if (paymentMsg.length > 0) {
          await getStorageInstance().createNotification({
            type: "payment",
            title: "Payment Status Updated",
            message: `Payment updated for ${booking.clientName}: ${paymentMsg.join(", ")}`,
            bookingId: booking.id,
            read: false
          });
        }
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteBooking(req.params.id);
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
      const items = await getStorageInstance().getBookingItems(req.params.id);
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

      await getStorageInstance().deleteBookingItems(req.params.id);
      
      const items = [];
      for (const item of result.data) {
        const newItem = await getStorageInstance().createBookingItem(item);
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
      const allBookings = await getStorageInstance().getBookings();
      
      let filteredBookings = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
      
      if (date) {
        filteredBookings = filteredBookings.filter((b) => b.eventDate === date);
      }
      
      const bookingsWithItems = [];
      for (const booking of filteredBookings) {
        const items = await getStorageInstance().getBookingItems(booking.id);
        
        // Populate foodItem details for each item
        const itemsWithFoodDetails = [];
        for (const item of items) {
          const foodItem = await getStorageInstance().getFoodItem(item.foodItemId);
          itemsWithFoodDetails.push({
            ...item,
            foodItem: foodItem || { id: item.foodItemId, name: "Unknown Item", category: "Other" }
          });
        }
        
        bookingsWithItems.push({ ...booking, items: itemsWithFoodDetails });
      }
      
      const groupedByDate = {};
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
      console.log("[GET] /api/company-info - Fetching info...");
      const info = await getStorageInstance().getCompanyInfo();
      console.log("[GET] /api/company-info - Result:", info ? "Found" : "Not Found");
      
      if (!info) {
        return res.status(404).json({ error: "Company info not found" });
      }
      
      // Calculate total events served dynamically from confirmed bookings
      const allBookings = await getStorageInstance().getBookings();
      const confirmedBookingsCount = allBookings.filter((b) => b.status === 'confirmed').length;
      
      // Return company info with dynamic events served count
      res.json({
        ...info,
        eventsPerYear: confirmedBookingsCount > 0 ? confirmedBookingsCount : info.eventsPerYear || 500
      });
    } catch (error) {
      console.error("[GET] /api/company-info error:", error);
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

      const info = await getStorageInstance().createCompanyInfo(result.data);
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

      // Use a generic update regardless of ID for settings
      const info = await getStorageInstance().updateCompanyInfo("settings", result.data);
      if (!info) {
        return res.status(404).json({ error: "Company info not found" });
      }
      res.json(info);
    } catch (error) {
      console.error("Update company info error:", error);
      res.status(500).json({ error: "Failed to update company info" });
    }
  });

  // Additional route specifically for hero images if needed, or just use the generic one above
  app.patch("/api/company-info", async (req, res) => {
    try {
      const info = await getStorageInstance().updateCompanyInfo("settings", req.body);
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to update company info" });
    }
  });

  // Staff Routes
  app.get("/api/staff", async (_req, res) => {
    try {
      const staffList = await getStorageInstance().getStaff();
      res.json(staffList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.get("/api/staff/:id", async (req, res) => {
    try {
      const staffMember = await getStorageInstance().getStaffMember(req.params.id);
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
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      const staffMember = await getStorageInstance().createStaffMember(result.data);
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
        return res.status(400).json({ error: error.message, details: result.error.errors });
      }

      const staffMember = await getStorageInstance().updateStaffMember(req.params.id, result.data);
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
      const deleted = await getStorageInstance().deleteStaffMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  });

  // Customer Reviews Routes
  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await getStorageInstance().getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const result = insertCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const review = await getStorageInstance().createReview(result.data);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const result = updateCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        const error = fromZodError(result.error);
        return res.status(400).json({ error: error.message });
      }

      const review = await getStorageInstance().updateReview(req.params.id, result.data);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const deleted = await getStorageInstance().deleteReview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete review" });
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
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
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
