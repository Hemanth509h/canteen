import { createHmac, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { getStorage } from "./db.js";
import { 
  sendPaymentLinkEmail, 
  validateEmail, 
  sendBookingConfirmationEmail, 
  sendBookingUpdateEmail,
  sendCustomerLoginCodeEmail,
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
  updateStaffPaymentSchema,
  insertExpenseSchema,
  updateExpenseSchema,
  insertAdminUserSchema,
  updateAdminUserSchema
} from "./schema.js";

import { fromZodError } from "zod-validation-error";
import { hashPassword, comparePassword } from "./password-manager.js";
import { z } from "zod";

const getStorageInstance = () => getStorage();

const rateLimitBuckets = new Map();

const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || randomUUID();

function createAdminSessionToken({ role, userId = null, username = "system" }) {
  const payload = Buffer.from(JSON.stringify({ role, userId, username, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", adminSessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAdminSessionToken(token) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", adminSessionSecret).update(payload).digest("base64url");
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function requireSuperAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = verifyAdminSessionToken(token);
  if (!session) return res.status(401).json({ success: false, data: null, error: "Admin session required" });
  if (session.role !== "superadmin") return res.status(403).json({ success: false, data: null, error: "Super admin access required" });
  req.adminSession = session;
  next();
}

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = verifyAdminSessionToken(token);
  if (!session) return res.status(401).json({ success: false, data: null, error: "Admin session required" });
  req.adminSession = session;
  next();
}

function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, keyPrefix = "global" } = {}) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = rateLimitBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    rateLimitBuckets.set(key, bucket);

    if (bucket.count > max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        data: null,
        error: "Too many attempts. Please try again later.",
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
}

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: "auth" });
const otpRateLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, keyPrefix: "otp" });

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

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

  app.post("/api/admin/login", authRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return sendResponse(res, 400, null, "Username and password are required");

      const normalizedUsername = String(username).trim().toLowerCase();
      const adminUser = await getStorageInstance().getAdminUserByUsername(normalizedUsername);
      if (!adminUser) return sendResponse(res, 401, null, "Invalid username or password");

      const isValid = await comparePassword(password, adminUser.password);
      if (isValid) {
        const { password: _, ...userWithoutPassword } = adminUser;
        sendResponse(res, 200, { success: true, role: adminUser.role, user: userWithoutPassword, token: createAdminSessionToken({ role: adminUser.role, userId: adminUser.id, username: adminUser.username }) });
      } else {
        sendResponse(res, 401, null, "Invalid username or password");
      }
    } catch (error) {
      sendResponse(res, 500, null, "Login failed");
    }
  });

  app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return sendResponse(res, 400, null, "Current password and new password are required");
      }
      const currentUser = await getStorageInstance().getAdminUser(req.adminSession.userId);
      if (!currentUser) return sendResponse(res, 404, null, "Admin user not found");

      const isCurrentPasswordValid = await comparePassword(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return sendResponse(res, 401, null, "Current password is incorrect");
      }
      if (newPassword.length < 6) {
        return sendResponse(res, 400, null, "New password must be at least 6 characters");
      }
      await getStorageInstance().updateAdminUser(currentUser.id, { password: await hashPassword(newPassword) });
      sendResponse(res, 200, { success: true, message: "Password changed successfully" });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to change password");
    }
  });

  // Admin Users CRUD
  app.get("/api/admin/users", requireSuperAdmin, async (_req, res) => {
    try {
      const users = await getStorageInstance().getAdminUsers();
      const safeUsers = users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });
      sendResponse(res, 200, safeUsers);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch admin users");
    }
  });

  app.post("/api/admin/users", requireSuperAdmin, async (req, res) => {
    try {
      const result = insertAdminUserSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);
      
      const existing = await getStorageInstance().getAdminUserByUsername(result.data.username);
      if (existing) return sendResponse(res, 400, null, "Username already exists");

      const userData = { ...result.data };
      userData.password = await hashPassword(userData.password);
      const user = await getStorageInstance().createAdminUser(userData);
      const { password, ...safeUser } = user;
      sendResponse(res, 201, safeUser);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create admin user");
    }
  });

  app.patch("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const result = updateAdminUserSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);

      const currentUser = await getStorageInstance().getAdminUser(req.params.id);
      if (!currentUser) return sendResponse(res, 404, null, "User not found");

      if (result.data.username) {
        const existing = await getStorageInstance().getAdminUserByUsername(result.data.username);
        if (existing && existing.id !== req.params.id) {
          return sendResponse(res, 400, null, "Username already exists");
        }
      }

      if (currentUser.role === "superadmin" && result.data.role && result.data.role !== "superadmin") {
        const users = await getStorageInstance().getAdminUsers();
        if (users.filter((user) => user.role === "superadmin").length <= 1) {
          return sendResponse(res, 400, null, "At least one super admin is required");
        }
      }

      const userData = { ...result.data };
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      const user = await getStorageInstance().updateAdminUser(req.params.id, userData);
      if (!user) return sendResponse(res, 404, null, "User not found");
      const { password, ...safeUser } = user;
      sendResponse(res, 200, safeUser);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update admin user");
    }
  });

  app.delete("/api/admin/users/:id", requireSuperAdmin, async (req, res) => {
    try {
      const user = await getStorageInstance().getAdminUser(req.params.id);
      if (!user) return sendResponse(res, 404, null, "User not found");
      if (user.role === "superadmin") {
        const users = await getStorageInstance().getAdminUsers();
        if (users.filter((item) => item.role === "superadmin").length <= 1) {
          return sendResponse(res, 400, null, "At least one super admin is required");
        }
      }
      const success = await getStorageInstance().deleteAdminUser(req.params.id);
      if (!success) return sendResponse(res, 404, null, "User not found");
      sendResponse(res, 204, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete admin user");
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
      
      // Process items if provided in the body
      let enrichedItems = [];
      if (req.body.items && Array.isArray(req.body.items)) {
        try {
          const foodItems = await getStorageInstance().getFoodItems();
          for (const item of req.body.items) {
            await getStorageInstance().createBookingItem({
              bookingId: booking.id || booking._id,
              foodItemId: item.foodItemId,
              quantity: item.quantity
            });
            const foodDetail = foodItems.find(f => String(f.id || f._id) === String(item.foodItemId));
            enrichedItems.push({
              foodItemId: item.foodItemId,
              quantity: item.quantity,
              name: foodDetail ? foodDetail.name : "Custom Request Item",
              category: foodDetail ? foodDetail.category : "Custom Request"
            });
          }
        } catch (itemErr) {
          console.error("Error creating booking items during booking request:", itemErr);
        }
      }

      // Customer Notification
      let emailStatus = null;
      if (booking.contactEmail && validateEmail(booking.contactEmail)) {
        const companyInfo = await readBranding();
        const baseUrl = getPublicBaseUrl(req);
        const bookingLink = `${baseUrl}/payment/${booking.id || booking._id}`;
        const bookingData = typeof booking.toObject === 'function' ? booking.toObject() : booking;
        const emailPayload = {
          ...bookingData,
          companyName: companyInfo.companyName,
          items: enrichedItems
        };
        try {
          emailStatus = await sendBookingConfirmationEmail(booking.contactEmail, emailPayload, bookingLink);
        } catch (error) {
          console.error("Booking confirmation email error:", error);
        }
      }

      // Admin Notification
      try {
        const companyInfo = await readBranding();
        const baseUrl = getPublicBaseUrl(req);
        const adminBookingLink = `${baseUrl}/admin/bookings`; 
        
        // Resolve admin notification recipient
        // Priority: 1. Branding Email, 2. Branding Contact Email, 3. Hardcoded Fallback
        let adminEmail = (companyInfo?.email || companyInfo?.contactEmail || "").trim();
        
        if (!validateEmail(adminEmail)) {
          // If branding email is invalid/missing, fallback to RESEND_FROM_EMAIL but extract raw address
          const fromEnv = process.env.RESEND_FROM_EMAIL || "";
          const match = fromEnv.match(/<([^>]+)>/) || [null, fromEnv];
          adminEmail = match[1].trim();
          
          if (adminEmail === "onboarding@resend.dev") {
             console.warn("[MAIL-WARN] Admin email is resolving to onboarding@resend.dev. You will not receive notifications here. Please set a valid email in the Admin Panel > Settings.");
          }
        }

        const adminBookingData = typeof booking.toObject === 'function' ? booking.toObject() : booking;
        const adminPayload = {
          ...adminBookingData,
          companyName: companyInfo.companyName,
          items: enrichedItems
        };

        if (validateEmail(adminEmail)) {
          console.log(`[MAIL-DEBUG] Sending admin notification to: ${adminEmail}`);
          await sendAdminBookingNotificationEmail(adminEmail, adminPayload, adminBookingLink);
        } else {
          console.error("[MAIL-ERROR] Failed to resolve any valid admin email for notification.");
          throw new Error("No valid admin email configured for notifications.");
        }
      } catch (adminEmailError) {
        console.error("Admin booking notification error:", adminEmailError);
        // Throw here so the booking process fails if admin can't be notified
        throw new Error(`Admin notification failed: ${adminEmailError.message}`);
      }

      req.io.emit("booking:new", booking);
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
            await sendAdminPaymentNotificationEmail(
              adminEmail,
              { ...booking, companyName: companyInfo.companyName },
              booking.advancePaymentStatus === "paid" ? "final" : "advance",
              adminLink
            );
          }
        } catch (paymentEmailError) {
          console.error("Admin payment notification error:", paymentEmailError);
        }
      }

      req.io.emit("booking:updated", booking);
      if (req.body.advancePaymentScreenshot || req.body.finalPaymentScreenshot) {
        req.io.emit("payment:uploaded", { bookingId: booking.id, type: req.body.advancePaymentScreenshot ? "advance" : "final" });
      }
      sendResponse(res, 200, booking);

    } catch (error) {
      sendResponse(res, 500, null, "Failed to update booking");
    }
  });

  app.post("/api/bookings/:id/send-update", async (req, res) => {
    try {
      const { message } = req.body;
      const booking = await getStorageInstance().getBooking(req.params.id);
      if (!booking) return sendResponse(res, 404, null, "Booking not found");
 
      if (booking.contactEmail && validateEmail(booking.contactEmail)) {
        const companyInfo = await readBranding();
        const baseUrl = getPublicBaseUrl(req);
        const bookingLink = `${baseUrl}/payment/${booking.id || booking._id}`;
        const bookingData = typeof booking.toObject === 'function' ? booking.toObject() : booking;
        
        // Using the dedicated update template for manual resends
        await sendBookingUpdateEmail(booking.contactEmail, { ...bookingData, companyName: companyInfo.companyName }, bookingLink, message);
        sendResponse(res, 200, { success: true, message: "Update email sent to customer" });
      } else {
        sendResponse(res, 400, null, "Customer has no valid email address");
      }
    } catch (error) {
      console.error("Failed to send update email:", error);
      sendResponse(res, 500, null, error?.message || "Failed to send update email");
    }
  });

  app.delete("/api/bookings", async (req, res) => {
    try {
      await getStorageInstance().deleteAllBookings();
      req.io.emit("bookings:cleared", {});
      sendResponse(res, 200, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete all bookings");
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
      req.io.emit("review:new", review);
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
        workVideos: z.array(z.string().url()).max(12).optional(),
        contactEmail: z.string().email().optional().or(z.literal("")),
        contactPhone: z.string().optional().or(z.literal("")),
      }).safeParse(sanitizedBody);

      if (!result.success) {
        return sendResponse(res, 400, null, fromZodError(result.error).message);
      }
      
      const info = await writeBranding(result.data);
      req.io.emit("company:updated", info);
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
      const staffData = { ...result.data };
      if (!staffData.password) {
        // Default password is phone number
        staffData.password = staffData.phone;
      }
      staffData.password = await hashPassword(staffData.password);
      
      const staff = await getStorageInstance().createStaffMember(staffData);
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
      const staffData = { ...result.data };
      if (staffData.password) {
        staffData.password = await hashPassword(staffData.password);
      }
      const staff = await getStorageInstance().updateStaffMember(req.params.id, staffData);
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

  app.post("/api/customer/login/request-code", otpRateLimit, async (req, res) => {
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

      const customerBooking = customerBookings[0];
      const customerEmail = customerBooking.contactEmail || (validateEmail(trimmedIdentifier) ? trimmedIdentifier : "");
      const customerPhone = customerBooking.contactPhone || identifier.trim();
      const code = String(randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const companyInfo = await readBranding();

      const request = await getStorageInstance().createCodeRequest({
        customerName: customerBooking.clientName || customerEmail || customerPhone,
        customerEmail,
        customerPhone,
        customerIdentifier: customerEmail || customerPhone,
        eventDetails: customerBooking.eventType || "",
        status: "pending",
      });

      await getStorageInstance().createUserCode({
        code,
        isUsed: false,
        expiresAt,
        notes: `Customer login code for ${customerEmail || customerPhone}`,
      });

      if (customerEmail && validateEmail(customerEmail)) {
        await sendCustomerLoginCodeEmail(customerEmail, code);
      } else {
        return sendResponse(res, 400, null, "Valid customer email address not found for this booking");
      }

      // Notify admin
      try {
        const adminEmail = companyInfo?.email || companyInfo?.contactEmail || process.env.RESEND_FROM_EMAIL;
        if (validateEmail(adminEmail)) {
          await sendAdminCodeRequestNotificationEmail(adminEmail, request);
        }
      } catch (err) {
        console.error("Admin code request notification error:", err);
      }

      sendResponse(res, 201, { codeSent: true, message: "OTP sent to customer email" });
    } catch (error) {
      console.error("Failed to initiate login:", error);
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
      if (validCode.expiresAt && new Date(validCode.expiresAt).getTime() < Date.now()) {
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
      if (validCode.expiresAt && new Date(validCode.expiresAt).getTime() < Date.now()) {
        return sendResponse(res, 404, null, "Invalid or used code");
      }
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

  app.get("/api/bookings/:id/staff", async (req, res) => {
    try {
      const requests = await getStorageInstance().getStaffBookingRequests(req.params.id);
      const staff = await getStorageInstance().getStaff();
      const staffById = new Map(staff.map((member) => [String(member.id), member]));
      const assignments = requests.map((request) => ({
        ...request,
        staff: staffById.get(String(request.staffId)) || null,
      }));
      sendResponse(res, 200, assignments);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch assigned staff");
    }
  });

  app.get("/api/staff-work", async (_req, res) => {
    try {
      const [bookings, staff] = await Promise.all([
        getStorageInstance().getBookings(),
        getStorageInstance().getStaff(),
      ]);
      const staffById = new Map(staff.map((member) => [String(member.id), member]));
      const work = [];

      for (const booking of bookings) {
        if (String(booking.status || "").toLowerCase() !== "completed") continue;

        const bookingId = booking.id || booking._id;
        const requests = await getStorageInstance().getStaffBookingRequests(bookingId);
        requests
          .filter((request) => request.status === "accepted")
          .forEach((request) => {
            work.push({
              ...request,
              booking,
              staff: staffById.get(String(request.staffId)) || null,
            });
          });
      }

      sendResponse(res, 200, work);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch staff work");
    }
  });

  app.post("/api/bookings/:id/staff", async (req, res) => {
    try {
      const booking = await getStorageInstance().getBooking(req.params.id);
      if (!booking) return sendResponse(res, 404, null, "Booking not found");
      if (String(booking.status || "").toLowerCase() !== "confirmed") {
        return sendResponse(res, 400, null, "Staff can be assigned only after booking is confirmed");
      }

      const { staffId, role, status = "accepted" } = req.body;
      if (!staffId) return sendResponse(res, 400, null, "Staff ID is required");
      const assignmentStatus = ["pending", "accepted", "rejected"].includes(status) ? status : "accepted";

      const staff = await getStorageInstance().getStaffMember(staffId);
      if (!staff) return sendResponse(res, 404, null, "Staff member not found");

      const existingRequests = await getStorageInstance().getStaffBookingRequests(req.params.id);
      const existing = existingRequests.find((request) => String(request.staffId) === String(staffId));
      if (existing) return sendResponse(res, 200, existing);

      const token = randomUUID();
      const request = await getStorageInstance().createStaffBookingRequest({
        bookingId: req.params.id,
        staffId,
        role: role || staff.role,
        token,
        status: assignmentStatus
      });
      sendResponse(res, 201, request);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to assign staff");
    }
  });

  app.delete("/api/bookings/:id/staff/:staffId", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteStaffBookingRequest(req.params.id, req.params.staffId);
      if (!success) return sendResponse(res, 404, null, "Staff assignment not found");
      sendResponse(res, 200, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to remove staff assignment");
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

      const { bookingId, paymentType } = result.data;
      const booking = await getStorageInstance().getBooking(bookingId);
      
      if (!booking) {
        return sendResponse(res, 404, null, "Booking not found");
      }

      const customerEmail = booking.contactEmail;
      const customerName = booking.clientName;
      const eventDate = booking.eventDate;
      
      // Calculate amount based on payment type
      const guestCount = parseInt(booking.guestCount) || 0;
      const pricePerPlate = parseInt(booking.pricePerPlate) || 0;
      const totalAmount = booking.totalAmount || (guestCount * pricePerPlate);
      const advanceAmount = booking.advanceAmount || Math.ceil(totalAmount * 0.5);
      const amount = (paymentType === "final") ? (totalAmount - advanceAmount) : advanceAmount;

      if (!customerEmail || !validateEmail(customerEmail)) {
        return sendResponse(res, 400, null, "Valid customer email address not found for this booking");
      }

      const orderId = `${bookingId}-${paymentType || "payment"}-${Date.now()}`;
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

  // ==================== EXPENSES ====================

  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await getStorageInstance().getExpenses();
      sendResponse(res, 200, expenses);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to fetch expenses");
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const result = insertExpenseSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);
      const expense = await getStorageInstance().createExpense(result.data);
      req.io.emit("expense:new", expense);
      sendResponse(res, 201, expense);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to create expense");
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const result = updateExpenseSchema.safeParse(req.body);
      if (!result.success) return sendResponse(res, 400, null, fromZodError(result.error).message);
      const expense = await getStorageInstance().updateExpense(req.params.id, result.data);
      if (!expense) return sendResponse(res, 404, null, "Expense not found");
      req.io.emit("expense:updated", expense);
      sendResponse(res, 200, expense);
    } catch (error) {
      sendResponse(res, 500, null, "Failed to update expense");
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await getStorageInstance().deleteExpense(req.params.id);
      if (!success) return sendResponse(res, 404, null, "Expense not found");
      req.io.emit("expense:deleted", { id: req.params.id });
      sendResponse(res, 200, { success: true });
    } catch (error) {
      sendResponse(res, 500, null, "Failed to delete expense");
    }
  });

}
