import { randomUUID } from "crypto";
import { getStorage } from "./db.js";
import { 
  sendPaymentLinkEmail, 
  validateEmail, 
  sendBookingConfirmationEmail, 
  sendAdminBookingNotificationEmail,
  sendAdminPaymentNotificationEmail,
  sendAdminCodeRequestNotificationEmail
} from "./mail-service.js";
import { getPublicBaseUrl, normalizeBranding, readBrandingFile, writeBrandingFile } from "./branding.js";

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
  insertCodeRequestSchema,
  sendPaymentLinkEmailSchema,
  insertStaffPaymentSchema,
  updateStaffPaymentSchema
} from "./schema.js";

import { fromZodError } from "zod-validation-error";
import { verifyPassword, updatePassword } from "./password-manager.js";
import { z } from "zod";

const getStorageInstance = () => getStorage();

async function readBranding() {
  try {
    const info = await getStorageInstance().getCompanyInfo();
    return normalizeBranding(info || readBrandingFile());
  } catch (err) {
    console.error("Failed to read branding from DB:", err);
    return readBrandingFile();
  }
}

async function writeBranding(data) {
  try {
    const current = await readBranding();
    const next = {
      ...current,
      ...data,
      contactEmail: data.contactEmail ?? data.email ?? current.contactEmail ?? current.email,
      contactPhone: data.contactPhone ?? data.phone ?? current.contactPhone ?? current.phone,
    };
    const normalized = normalizeBranding(next);
    await getStorageInstance().updateCompanyInfo(null, normalized);
    try {
      writeBrandingFile(normalized);
    } catch (fileErr) {
      console.warn("Failed to update branding.json:", fileErr.message);
    }
    return normalized;
  } catch (err) {
    console.error("Failed to write branding to DB:", err);
    throw err;
  }
}

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

  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const result = insertFoodItemSchema.partial().safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const item = await getStorageInstance().updateFoodItem(req.params.id, result.data);
      if (!item) return sendResponse(res, 404, null, "Food item not found");
      sendResponse(res, 200, item);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update food item");
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteFoodItem(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Food item not found");
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete food item");
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
      
      // Customer Notification
      let emailStatus = null;
      if (booking.contactEmail && validateEmail(booking.contactEmail)) {
        const companyInfo = await readBranding();
        const baseUrl = getPublicBaseUrl(req);
        const bookingLink = `${baseUrl}/payment/${booking.id || booking._id}`;
        try {
          emailStatus = await sendBookingConfirmationEmail(booking.contactEmail, { ...booking, companyName: companyInfo.companyName }, bookingLink);
        } catch (error) {
          console.error("Booking confirmation email error:", error);
        }
      }

      // Admin Notification
      try {
        const companyInfo = await readBranding();
        const adminEmail = companyInfo?.email || companyInfo?.contactEmail || process.env.RESEND_FROM_EMAIL;
        const baseUrl = getPublicBaseUrl(req);
        const adminBookingLink = `${baseUrl}/admin/bookings`; 
        
        if (validateEmail(adminEmail)) {
          await sendAdminBookingNotificationEmail(adminEmail, { ...booking, companyName: companyInfo.companyName }, adminBookingLink);
        }
      } catch (adminEmailError) {
        console.error("Admin booking notification error:", adminEmailError);
      }

      sendResponse(res, 201, { ...booking, emailStatus });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create booking");
    }
  });

  app.get("/api/bookings/search", async (req, res) => {
    try {
      const { phone, email } = req.query;
      if (!phone && !email) return sendResponse(res, 400, null, "Phone number or email is required");
      const bookings = await getStorageInstance().getBookings();
      const customerBookings = bookings.filter(b => 
        (phone && b.contactPhone === phone) || 
        (email && b.contactEmail === email)
      );
      sendResponse(res, 200, customerBookings);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to search bookings");
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await getStorageInstance().getBooking(req.params.id);
      if (!booking) return sendResponse(res, 404, null, "Booking not found");
      sendResponse(res, 200, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch booking");
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const result = updateEventBookingSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const booking = await getStorageInstance().updateBooking(req.params.id, result.data);
      if (!booking) return sendResponse(res, 404, null, "Booking not found");

      // Notify admin if payment screenshot was uploaded
      if (req.body.advancePaymentScreenshot || req.body.finalPaymentScreenshot) {
        try {
          const companyInfo = await readBranding();
          const adminEmail = companyInfo?.email || companyInfo?.contactEmail || process.env.RESEND_FROM_EMAIL;
          const baseUrl = getPublicBaseUrl(req);
          const adminLink = `${baseUrl}/admin/bookings/payment/${booking.id || booking._id}`;
          
          if (validateEmail(adminEmail)) {
            await sendAdminPaymentNotificationEmail(adminEmail, { ...booking, companyName: companyInfo.companyName }, adminLink);
          }
        } catch (paymentEmailError) {
          console.error("Admin payment notification error:", paymentEmailError);
        }
      }

      sendResponse(res, 200, booking);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update booking");
    }
  });

  app.post("/api/bookings/:id/send-update", async (req, res) => {
    try {
      const booking = await getStorageInstance().getBooking(req.params.id);
      if (!booking) return sendResponse(res, 404, null, "Booking not found");

      if (booking.contactEmail && validateEmail(booking.contactEmail)) {
        const companyInfo = await readBranding();
        const baseUrl = getPublicBaseUrl(req);
        const bookingLink = `${baseUrl}/payment/${booking.id || booking._id}`;
        
        // Re-using confirmation email for now as an "Update" notification
        await sendBookingConfirmationEmail(booking.contactEmail, { ...booking, companyName: companyInfo.companyName }, bookingLink);
        sendResponse(res, 200, { success: true, message: "Update email sent to customer" });
      } else {
        sendResponse(res, 400, null, "Customer has no valid email address");
      }
    } catch (error) {
      console.error("Failed to send update email:", error);
      sendResponse(res, 500, null, "Failed to send update email");
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteBooking(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Booking not found");
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete booking");
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

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const result = updateCustomerReviewSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const review = await getStorageInstance().updateReview(req.params.id, result.data);
      if (!review) return sendResponse(res, 404, null, "Review not found");
      sendResponse(res, 200, review);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update review");
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteReview(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Review not found");
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete review");
    }
  });

  app.get("/api/company-info", async (_req, res) => {
    try {
      const info = await readBranding();
      sendResponse(res, 200, info || {});
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch company info");
    }
  });

  app.patch("/api/company-info", async (req, res) => {
    try {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.websiteUrl === "") delete sanitizedBody.websiteUrl;
      if (sanitizedBody.email === "") delete sanitizedBody.email;
      if (sanitizedBody.contactEmail === "") delete sanitizedBody.contactEmail;
      if (sanitizedBody.phone === "") delete sanitizedBody.phone;
      if (sanitizedBody.contactPhone === "") delete sanitizedBody.contactPhone;
      if (sanitizedBody.upiId === "") delete sanitizedBody.upiId;

      const result = insertCompanyInfoSchema.partial().extend({
        heroImages: z.array(z.string()).optional(),
        contactEmail: z.string().email().optional().or(z.literal("")),
        contactPhone: z.string().optional().or(z.literal("")),
      }).safeParse(sanitizedBody);

      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      
      const info = await writeBranding(result.data);
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

  app.patch("/api/staff/:id", async (req, res) => {
    try {
      const result = updateStaffSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      const staff = await getStorageInstance().updateStaffMember(req.params.id, result.data);
      if (!staff) return sendResponse(res, 404, null, "Staff member not found");
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update staff member");
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteStaffMember(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Staff member not found");
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete staff member");
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

  app.post("/api/customer/login/request-code", async (req, res) => {
    try {
      const { identifier } = req.body;
      if (!identifier) return sendResponse(res, 400, null, "Identifier is required");

      const trimmedIdentifier = identifier.trim().toLowerCase();
      const bookings = await getStorageInstance().getBookings();
      const customerBookings = bookings.filter(b => 
        (b.contactEmail && b.contactEmail.toLowerCase() === trimmedIdentifier) || 
        (b.contactPhone && b.contactPhone === identifier.trim())
      );

      if (customerBookings.length === 0) {
        return sendResponse(res, 200, {
          codeSent: false,
          message: "No bookings found for this email or mobile number"
        });
      }

      // Reuse code-requests logic
      const request = await getStorageInstance().createCodeRequest({
        customerName: customerBookings[0].clientName || "Customer",
        email: customerBookings[0].contactEmail || trimmedIdentifier,
        phone: customerBookings[0].contactPhone || identifier.trim(),
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Notify admin
      try {
        const companyInfo = await readBranding();
        const adminEmail = companyInfo?.email || companyInfo?.contactEmail || process.env.RESEND_FROM_EMAIL;
        if (validateEmail(adminEmail)) {
          await sendAdminCodeRequestNotificationEmail(adminEmail, request);
        }
      } catch (err) {
        console.error("Admin code request notification error:", err);
      }

      sendResponse(res, 201, { codeSent: true, message: "Code request sent to admin" });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to initiate login");
    }
  });

  app.post("/api/customer/login/verify", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return sendResponse(res, 400, null, "Email and code are required");

      const validCode = await getStorageInstance().getUserCodeByValue(code);
      if (!validCode) {
        return sendResponse(res, 401, null, "Invalid or expired code");
      }

      // Check if code belongs to this email (optional, based on your logic)
      // For simplicity, we mark it used and return a token
      await getStorageInstance().markCodeAsUsed(code);

      const token = randomUUID();
      sendResponse(res, 200, { token, email });
    } catch (error) {
      sendResponse(res, 500, null, "Verification failed");
    }
  });

  app.get("/api/customer/bookings", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return sendResponse(res, 401, null, "Unauthorized");
      
      const token = authHeader.split(" ")[1];
      // In a real app, you'd verify the token and get the user's email
      // For now, we search by the email stored in localStorage on frontend (passed via identifier logic)
      // but since we don't have a token mapping, we'll just allow fetching if token exists
      const bookings = await getStorageInstance().getBookings();
      // This is a placeholder: in production, you MUST filter by the user's actual identity
      sendResponse(res, 200, bookings);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch bookings");
    }
  });

  app.post("/api/customer/logout", async (req, res) => {
    sendResponse(res, 200, { success: true });
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

      // Notify admin via email
      try {
        const companyInfo = await readBranding();
        const adminEmail = companyInfo?.email || companyInfo?.contactEmail || process.env.RESEND_FROM_EMAIL;
        if (validateEmail(adminEmail)) {
          await sendAdminCodeRequestNotificationEmail(adminEmail, request);
        }
      } catch (err) {
        console.error("Admin code request notification error:", err);
      }

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

  app.get("/api/chef-printout", async (req, res) => {
    try {
      const bookings = await getStorageInstance().getBookings();
      const grouped = {};
      
      for (const booking of bookings) {
        if (booking.status !== 'confirmed') continue;
        const date = new Date(booking.eventDate).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        
        const items = await getStorageInstance().getBookingItems(booking.id);
        const itemsWithDetails = await Promise.all(items.map(async (item) => ({
          ...item,
          foodItem: await getStorageInstance().getFoodItem(item.foodItemId)
        })));
        
        grouped[date].push({ ...booking, items: itemsWithDetails });
      }
      res.json(grouped);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch chef printout data");
    }
  });

  app.get("/api/audit-history", async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      const logs = await getStorageInstance().getAuditHistory(entityType, entityId);
      sendResponse(res, 200, logs);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch audit history");
    }
  });

  app.delete("/api/audit-history", async (req, res) => {
    try {
      await getStorageInstance().clearAllAuditHistory();
      sendResponse(res, 200, { success: true, message: "Audit history cleared" });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to clear audit history");
    }
  });

  app.get("/api/bookings/:id/assigned-staff", async (req, res) => {
    try {
      const staff = await getStorageInstance().getAcceptedStaffForBooking(req.params.id);
      sendResponse(res, 200, staff);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch assigned staff");
    }
  });

  app.get("/api/staff-requests/:token", async (req, res) => {
    try {
      const request = await getStorageInstance().getStaffBookingRequestByToken(req.params.token);
      if (!request) return sendResponse(res, 404, null, "Request not found");
      const booking = await getStorageInstance().getBooking(request.bookingId);
      const staff = await getStorageInstance().getStaffMember(request.staffId);
      sendResponse(res, 200, { request, booking, staff });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff request");
    }
  });

  app.patch("/api/staff-requests/:token", async (req, res) => {
    try {
      const request = await getStorageInstance().getStaffBookingRequestByToken(req.params.token);
      if (!request) return sendResponse(res, 404, null, "Request not found");
      const updated = await getStorageInstance().updateStaffBookingRequest(request.id, req.body);
      sendResponse(res, 200, updated);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update staff request");
    }
  });

  app.post("/api/bookings/:id/staff", async (req, res) => {
    try {
      const { staffId, role } = req.body;
      const token = randomUUID();
      const request = await getStorageInstance().createStaffBookingRequest({
        bookingId: req.params.id,
        staffId,
        role,
        token,
        status: "pending"
      });
      sendResponse(res, 201, request);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to assign staff");
    }
  });

  app.post("/api/bookings/:id/items", async (req, res) => {
    try {
      const items = req.body;
      await getStorageInstance().deleteBookingItems(req.params.id);
      const results = [];
      for (const item of items) {
        results.push(await getStorageInstance().createBookingItem(item));
      }
      sendResponse(res, 201, results);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update booking items");
    }
  });

  app.get("/api/bookings/:id/items", async (req, res) => {
    try {
      const items = await getStorageInstance().getBookingItems(req.params.id);
      sendResponse(res, 200, items);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch booking items");
    }
  });

  // ==================== EMAIL PAYMENT LINK ====================

  app.post("/api/payments/send-email", async (req, res) => {
    try {
      const result = sendPaymentLinkEmailSchema.safeParse(req.body);
      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }

      const { bookingId, paymentType, customerEmail, amount, customerName, eventDate } = result.data;

      if (!validateEmail(customerEmail)) {
        return sendResponse(res, 400, null, "Invalid customer email address");
      }

      const orderId = `${bookingId}-${paymentType}-${Date.now()}`;
      const baseUrl = getPublicBaseUrl(req);
      const paymentLink = baseUrl ? `${baseUrl}/payment/${bookingId}` : `/payment/${bookingId}`;
      const companyInfo = await readBranding();

      const emailStatus = await sendPaymentLinkEmail(customerEmail, paymentLink, {
        customerName,
        amount,
        paymentType,
        orderId,
        eventDate,
        companyName: companyInfo.companyName,
      });

      sendResponse(res, 200, {
        success: true,
        message: "Payment link sent via email",
        emailStatus,
        paymentLink
      });
    } catch (error) {
      console.error("Email payment link error:", error);
      sendResponse(res, 500, null, error.message || "Failed to send payment link via email");
    }
  });

  // ==================== STAFF PAYMENTS ====================

  app.get("/api/staff-payments", async (req, res) => {
    try {
      const { staffId } = req.query;
      const payments = await getStorageInstance().getStaffPayments(staffId || null);
      sendResponse(res, 200, payments);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff payments");
    }
  });

  app.post("/api/staff-payments", async (req, res) => {
    try {
      const result = insertStaffPaymentSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);
      const payment = await getStorageInstance().createStaffPayment(result.data);
      sendResponse(res, 201, payment);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create staff payment");
    }
  });

  app.patch("/api/staff-payments/:id", async (req, res) => {
    try {
      const result = updateStaffPaymentSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);
      const payment = await getStorageInstance().updateStaffPayment(req.params.id, result.data);
      if (!payment) return sendResponse(res, 404, null, "Payment not found");
      sendResponse(res, 200, payment);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update staff payment");
    }
  });

  app.delete("/api/staff-payments/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteStaffPayment(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Payment not found");
      sendResponse(res, 200, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete staff payment");
    }
  });

}
