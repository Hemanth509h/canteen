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
  updateStaffBookingRequestSchema,
  insertUserCodeSchema,
  insertCodeRequestSchema
} from "./schema.js";

import { fromZodError } from "zod-validation-error";
import { verifyPassword, updatePassword } from "./password-manager.js";
import { z } from "zod";

const getStorageInstance = () => getStorage();

export async function registerRoutes(app) {
  const sendResponse = (res, status, data, error = null) => {
    return res.status(status).json({
      success: status >= 200 && status < 300,
      data,
      error,
      timestamp: new Date().toISOString()
    });
  };

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const isValid = await verifyPassword(password);
      if (isValid) {
        sendResponse(res, 200, { success: true });
      } else {
        sendResponse(res, 401, null, "Invalid password");
      }
    } catch (error) {
      sendResponse(res, 500, null, "Login failed");
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendResponse(res, 400, null, "Current password and new password are required");
      }
      const isCurrentPasswordValid = await verifyPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return sendResponse(res, 401, null, "Current password is incorrect");
      }
      if (newPassword.length < 6) {
        return sendResponse(res, 400, null, "New password must be at least 6 characters");
      }
      await updatePassword(newPassword);
      sendResponse(res, 200, { success: true, message: "Password changed successfully" });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to change password");
    }
  });

  app.get("/api/food-items", async (_req, res) => {
    try {
      const items = await getStorageInstance().getFoodItems();
      sendResponse(res, 200, items);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch food items");
    }
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const result = insertFoodItemSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const item = await getStorageInstance().createFoodItem(result.data);
      sendResponse(res, 201, item);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create food item");
    }
  });

  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await getStorageInstance().getBookings();
      sendResponse(res, 200, bookings);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch bookings");
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const result = insertEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const booking = await getStorageInstance().createBooking(result.data);
      sendResponse(res, 201, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create booking");
    }
  });

  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await getStorageInstance().getReviews();
      sendResponse(res, 200, reviews);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch reviews");
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const result = insertCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const review = await getStorageInstance().createReview(result.data);
      sendResponse(res, 201, review);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create review");
    }
  });

  app.get("/api/company-info", async (_req, res) => {
    try {
      const info = await getStorageInstance().getCompanyInfo();
      sendResponse(res, 200, info || {});
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch company info");
    }
  });

  app.patch("/api/company-info", async (req, res) => {
    try {
      const result = insertCompanyInfoSchema.partial().safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const info = await getStorageInstance().updateCompanyInfo(null, result.data);
      sendResponse(res, 200, info);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update company info");
    }
  });

  app.get("/api/staff", async (_req, res) => {
    try {
      const staff = await getStorageInstance().getStaff();
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff");
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const result = insertStaffSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const staff = await getStorageInstance().createStaffMember(result.data);
      sendResponse(res, 201, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create staff member");
    }
  });

  app.get("/api/user-codes", async (_req, res) => {
    try {
      const codes = await getStorageInstance().getUserCodes();
      sendResponse(res, 200, { data: codes });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch user codes");
    }
  });

  app.post("/api/user-codes", async (req, res) => {
    try {
      const result = insertUserCodeSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const code = await getStorageInstance().createUserCode(result.data);
      sendResponse(res, 201, code);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create user code");
    }
  });

  app.delete("/api/user-codes/:id", async (req, res) => {
    try {
      await getStorageInstance().deleteUserCode(req.params.id);
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete user code");
    }
  });

  app.get("/api/code-requests", async (_req, res) => {
    try {
      const requests = await getStorageInstance().getCodeRequests();
      sendResponse(res, 200, { data: requests });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch code requests");
    }
  });

  app.post("/api/code-requests", async (req, res) => {
    try {
      const result = insertCodeRequestSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const request = await getStorageInstance().createCodeRequest(result.data);
      await getStorageInstance().createNotification({
        type: "booking",
        title: "New Booking Code Request",
        message: `Customer ${request.customerName} has requested a booking code.`,
        read: false
      });
      sendResponse(res, 201, request);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create code request");
    }
  });

  app.patch("/api/code-requests/:id", async (req, res) => {
    try {
      const request = await getStorageInstance().updateCodeRequest(req.params.id, req.body);
      if (!request) return sendResponse(res, 404, null, "Request not found");
      sendResponse(res, 200, request);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update code request");
    }
  });

  app.get("/api/codes/verify", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) return sendResponse(res, 400, null, "Code is required");
      const validCode = await getStorageInstance().getUserCodeByValue(code);
      if (!validCode) return sendResponse(res, 404, null, "Invalid or used code");
      sendResponse(res, 200, validCode);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to verify code");
    }
  });

  app.post("/api/codes/use", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) return sendResponse(res, 400, null, "Code is required");
      const success = await getStorageInstance().markCodeAsUsed(code);
      if (!success) return sendResponse(res, 404, null, "Code not found or already used");
      sendResponse(res, 200, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to use code");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
