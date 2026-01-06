import mongoose, { Schema, model } from "mongoose";

// Helper to ensure MongoDB connection
export async function connectToDatabase() {
  // Direct Atlas URI with specific configuration for Vercel
  // Using the standard SRV connection string which is required for modern Atlas clusters
  const uri = process.env.MONGODB_URI || "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority&appName=data";
  
  console.log("Connecting to MongoDB Atlas...");
  
  try {
    // In serverless environments, we should check if we're already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Using existing MongoDB connection");
      return true;
    }

    const options = {
      serverSelectionTimeoutMS: 20000, // Increased to 20s for slow cold starts
      connectTimeoutMS: 20000,
      family: 4, // Force IPv4 to avoid DNS resolution issues in serverless
      maxPoolSize: 1, 
      minPoolSize: 0,
      socketTimeoutMS: 60000,
      // Removed direct retryWrites/w parameters to let URI handle them
    };

    await mongoose.connect(uri, options);
    const dbName = mongoose.connection.db?.databaseName || "canteen";
    console.log(`✅ Connected to MongoDB Atlas (Database: ${dbName})`);
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error details:", error);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.error("CRITICAL: Connection refused. Verify: 1. Network Access (0.0.0.0/0), 2. DB User Credentials, 3. Connection String Format.");
    }
    throw error;
  }
}

const schemaOptions = { 
  timestamps: true, 
  toObject: { virtuals: true, getters: true }, 
  toJSON: { virtuals: true, getters: true },
  strict: false 
};

const genericSchema = new Schema({}, schemaOptions);

const FoodItemModel = model("fooditems", genericSchema);
const EventBookingModel = model("eventbookings", genericSchema);
const BookingItemModel = model("bookingitems", genericSchema);
const CompanyInfoModel = model("companyinfos", genericSchema);
const StaffModel = model("staffs", genericSchema);
const CustomerReviewModel = model("customerreviews", genericSchema);
const AdminNotificationModel = model("adminnotifications", genericSchema);
const StaffBookingRequestModel = model("staffbookingrequests", genericSchema);
const AuditHistoryModel = model("audithistories", genericSchema);
const BookingCodeModel = model("bookingcodes", genericSchema);
const CodeRequestModel = model("coderequests", genericSchema);

function toJSON(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: true, getters: true }) : doc;
  
  obj.id = (obj._id || obj.id)?.toString();
  
  // Robust field mapping for common variations
  const mapping = {
    clientName: ['client_name', 'client', 'name'],
    eventDate: ['event_date', 'date'],
    eventType: ['event_type', 'type'],
    guestCount: ['guest_count', 'guests', 'total_guests'],
    pricePerPlate: ['price_per_plate', 'price_per_head', 'ppp'],
    contactEmail: ['contact_email', 'email'],
    contactPhone: ['contact_phone', 'phone', 'mobile_number', 'mobile'],
    companyName: ['company_name', 'name', 'title'],
    itemName: ['item_name', 'name'],
    itemDescription: ['item_description', 'description'],
  };

  for (const [target, alts] of Object.entries(mapping)) {
    if (obj[target] === undefined) {
      for (const alt of alts) {
        if (obj[alt] !== undefined) {
          obj[target] = obj[alt];
          break;
        }
      }
    }
  }

  for (const key in obj) {
    const camel = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (obj[camel] === undefined) obj[camel] = obj[key];
  }
  
  delete obj._id;
  delete obj.__v;
  return obj;
}

class MongoStorage {
  async getFoodItems() { 
    const docs = await FoodItemModel.find();
    return docs.map(toJSON);
  }
  async getFoodItem(id) { return toJSON(await FoodItemModel.findById(id)); }
  async createFoodItem(item) { return toJSON(await FoodItemModel.create(item)); }
  async updateFoodItem(id, item) { return toJSON(await FoodItemModel.findByIdAndUpdate(id, item, { new: true })); }
  async deleteFoodItem(id) { return (await FoodItemModel.findByIdAndDelete(id)) !== null; }

  async getBookings() { return (await EventBookingModel.find()).map(toJSON); }
  async getBooking(id) { 
    if (!id) return null;
    try {
      console.log(`[STORAGE] Fetching booking with ID: ${id}`);
      // 1. Try finding by MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await EventBookingModel.findById(id);
        if (doc) {
          console.log(`[STORAGE] Found by _id: ${id}`);
          return toJSON(doc);
        }
      }
      
      // 2. Try finding by custom booking reference (e.g., BK-123)
      const docById = await EventBookingModel.findOne({ id: id });
      if (docById) {
        console.log(`[STORAGE] Found by custom id: ${id}`);
        return toJSON(docById);
      }

      console.log(`[STORAGE] Booking not found for ID: ${id}`);
      return null;
    } catch (e) {
      console.error("getBooking error:", e);
      return null;
    }
  }
  async createBooking(booking) { return toJSON(await EventBookingModel.create(booking)); }
  async updateBooking(id, booking) { return toJSON(await EventBookingModel.findByIdAndUpdate(id, booking, { new: true })); }
  async deleteBooking(id) { return (await EventBookingModel.findByIdAndDelete(id)) !== null; }

  async getBookingItems(bookingId) { return (await BookingItemModel.find({ bookingId })).map(toJSON); }
  async createBookingItem(item) { return toJSON(await BookingItemModel.create(item)); }
  async deleteBookingItems(bookingId) { await BookingItemModel.deleteMany({ bookingId }); }

  async getCompanyInfo() { 
    const doc = await CompanyInfoModel.findOne();
    console.log(`[STORAGE] Company info: ${doc ? 'Found' : 'Not Found'}`);
    return toJSON(doc);
  }
  async createCompanyInfo(info) { return toJSON(await CompanyInfoModel.create(info)); }
  async updateCompanyInfo(id, info) { return toJSON(await CompanyInfoModel.findOneAndUpdate({}, info, { new: true, upsert: true })); }

  async getStaff() { return (await StaffModel.find()).map(toJSON); }
  async getStaffMember(id) { return toJSON(await StaffModel.findById(id)); }
  async createStaffMember(staff) { return toJSON(await StaffModel.create(staff)); }
  async updateStaffMember(id, staff) { return toJSON(await StaffModel.findByIdAndUpdate(id, staff, { new: true })); }
  async deleteStaffMember(id) { return (await StaffModel.findByIdAndDelete(id)) !== null; }

  async getReviews() { return (await CustomerReviewModel.find()).map(toJSON); }
  async createReview(review) { return toJSON(await CustomerReviewModel.create(review)); }
  async updateReview(id, review) { return toJSON(await CustomerReviewModel.findByIdAndUpdate(id, review, { new: true })); }
  async deleteReview(id) { return (await CustomerReviewModel.findByIdAndDelete(id)) !== null; }

  async getNotifications() { return (await AdminNotificationModel.find()).map(toJSON); }
  async createNotification(notification) { return toJSON(await AdminNotificationModel.create(notification)); }
  async markNotificationAsRead(id) { return (await AdminNotificationModel.findByIdAndUpdate(id, { read: true }, { new: true })) !== null; }
  async deleteNotification(id) { return (await AdminNotificationModel.findByIdAndDelete(id)) !== null; }

  async getStaffBookingRequests(bookingId) { return (await StaffBookingRequestModel.find({ bookingId })).map(toJSON); }
  async createStaffBookingRequest(request) { return toJSON(await StaffBookingRequestModel.create(request)); }
  async updateStaffBookingRequest(id, request) { return toJSON(await StaffBookingRequestModel.findByIdAndUpdate(id, request, { new: true })); }
  async deleteStaffBookingRequest(bookingId, staffId) { return (await StaffBookingRequestModel.findOneAndDelete({ bookingId, staffId })) !== null; }
  async getStaffBookingRequestByToken(token) { return toJSON(await StaffBookingRequestModel.findOne({ token })); }
  async getAcceptedStaffForBooking(bookingId) {
    const accepted = await StaffBookingRequestModel.find({ bookingId, status: "accepted" });
    const staffIds = accepted.map(r => r.staffId);
    return (await StaffModel.find({ _id: { $in: staffIds } })).map(toJSON);
  }

  async getAuditHistory(entityType, entityId) {
    const query = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    return (await AuditHistoryModel.find(query).sort({ createdAt: -1 })).map(toJSON);
  }
  async createAuditHistory(log) { return toJSON(await AuditHistoryModel.create(log)); }
  async deleteAuditHistory(id) { return (await AuditHistoryModel.findByIdAndDelete(id)) !== null; }

  // Booking Code Methods
  async getBookingCodes() { return (await BookingCodeModel.find()).map(toJSON); }
  async getBookingCodeByValue(code) { return toJSON(await BookingCodeModel.findOne({ code, isUsed: false })); }
  async createBookingCode(codeData) { return toJSON(await BookingCodeModel.create(codeData)); }
  async updateBookingCode(id, codeData) { return toJSON(await BookingCodeModel.findByIdAndUpdate(id, codeData, { new: true })); }
  async deleteBookingCode(id) { return (await BookingCodeModel.findByIdAndDelete(id)) !== null; }

  // Code Request Methods
  async getCodeRequests() { return (await CodeRequestModel.find().sort({ createdAt: -1 })).map(toJSON); }
  async createCodeRequest(requestData) { return toJSON(await CodeRequestModel.create(requestData)); }
  async updateCodeRequest(id, requestData) { return toJSON(await CodeRequestModel.findByIdAndUpdate(id, requestData, { new: true })); }
}

let storageInstance = null;
export const getStorage = () => {
  if (!storageInstance) storageInstance = new MongoStorage();
  return storageInstance;
};
export const storage = getStorage();
