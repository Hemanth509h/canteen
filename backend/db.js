import mongoose, { Schema, model } from "mongoose";

// Helper to ensure MongoDB connection
export async function connectToDatabase() {
  // Hardcoded URI for immediate resolution - ensures Vercel and local environments connect successfully
  const uri = process.env.MONGODB_URI || "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";
  
  try {
    // Connect without forced dbName to allow URI-specified database
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4 for broader compatibility
    });
    const dbName = mongoose.connection.db?.databaseName || "unknown";
    console.log(`✅ Connected to MongoDB (Database: ${dbName})`);
    
    const collections = mongoose.connection.db 
      ? await mongoose.connection.db.listCollections().toArray()
      : [];
    console.log("📂 Available collections:", collections.map(c => c.name).join(", "));
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Provide a more descriptive error for Vercel logs
    if (error.name === 'MongooseServerSelectionError') {
      console.error("CRITICAL: IP Whitelisting required. Add 0.0.0.0/0 to MongoDB Atlas Access List.");
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
    console.log(`[STORAGE] Fetched ${docs.length} food items`);
    if (docs.length > 0) console.log("[STORAGE] First food item keys:", Object.keys(docs[0].toObject()));
    return docs.map(toJSON);
  }
  async getFoodItem(id) { return toJSON(await FoodItemModel.findById(id)); }
  async createFoodItem(item) { return toJSON(await FoodItemModel.create(item)); }
  async updateFoodItem(id, item) { return toJSON(await FoodItemModel.findByIdAndUpdate(id, item, { new: true })); }
  async deleteFoodItem(id) { return (await FoodItemModel.findByIdAndDelete(id)) !== null; }

  async getBookings() { return (await EventBookingModel.find()).map(toJSON); }
  async getBooking(id) { return toJSON(await EventBookingModel.findById(id)); }
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
}

let storageInstance = null;
export const getStorage = () => {
  if (!storageInstance) storageInstance = new MongoStorage();
  return storageInstance;
};
export const storage = getStorage();
