import mongoose, { Schema, model } from "mongoose";
import { 
  FoodItem, EventBooking, BookingItem, CompanyInfo, Staff, 
  CustomerReview, AdminNotification, StaffBookingRequest, AuditHistory 
} from "./schema";

// Helper to ensure MongoDB connection
export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority";
  if (!uri) {
    throw new Error("MONGODB_URI not found in environment variables");
  }

  try {
    // Connect without forced dbName to allow URI-specified database
    await mongoose.connect(uri);
    const dbName = mongoose.connection.db?.databaseName || "unknown";
    console.log(`✅ Connected to MongoDB (Database: ${dbName})`);
    
    const collections = mongoose.connection.db 
      ? await mongoose.connection.db.listCollections().toArray()
      : [];
    console.log("📂 Available collections:", collections.map(c => c.name).join(", "));
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
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

const FoodItemModel = model<FoodItem>("fooditems", genericSchema);
const EventBookingModel = model<EventBooking>("eventbookings", genericSchema);
const BookingItemModel = model<BookingItem>("bookingitems", genericSchema);
const CompanyInfoModel = model<CompanyInfo>("companyinfos", genericSchema);
const StaffModel = model<Staff>("staffs", genericSchema);
const CustomerReviewModel = model<CustomerReview>("customerreviews", genericSchema);
const AdminNotificationModel = model<AdminNotification>("adminnotifications", genericSchema);
const StaffBookingRequestModel = model<StaffBookingRequest>("staffbookingrequests", genericSchema);
const AuditHistoryModel = model<AuditHistory>("audithistories", genericSchema);

function toJSON(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ virtuals: true, getters: true }) : doc;
  
  obj.id = (obj._id || obj.id)?.toString();
  
  // Robust field mapping for common variations
  const mapping: Record<string, string[]> = {
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
  async getFoodItem(id: string) { return toJSON(await FoodItemModel.findById(id)); }
  async createFoodItem(item: any) { return toJSON(await FoodItemModel.create(item)); }
  async updateFoodItem(id: string, item: any) { return toJSON(await FoodItemModel.findByIdAndUpdate(id, item, { new: true })); }
  async deleteFoodItem(id: string) { return (await FoodItemModel.findByIdAndDelete(id)) !== null; }

  async getBookings() { return (await EventBookingModel.find()).map(toJSON); }
  async getBooking(id: string) { return toJSON(await EventBookingModel.findById(id)); }
  async createBooking(booking: any) { return toJSON(await EventBookingModel.create(booking)); }
  async updateBooking(id: string, booking: any) { return toJSON(await EventBookingModel.findByIdAndUpdate(id, booking, { new: true })); }
  async deleteBooking(id: string) { return (await EventBookingModel.findByIdAndDelete(id)) !== null; }

  async getBookingItems(bookingId: string) { return (await BookingItemModel.find({ bookingId })).map(toJSON); }
  async createBookingItem(item: any) { return toJSON(await BookingItemModel.create(item)); }
  async deleteBookingItems(bookingId: string) { await BookingItemModel.deleteMany({ bookingId }); }

  async getCompanyInfo() { 
    const doc = await CompanyInfoModel.findOne();
    console.log(`[STORAGE] Company info: ${doc ? 'Found' : 'Not Found'}`);
    return toJSON(doc);
  }
  async createCompanyInfo(info: any) { return toJSON(await CompanyInfoModel.create(info)); }
  async updateCompanyInfo(id: string, info: any) { return toJSON(await CompanyInfoModel.findOneAndUpdate({}, info, { new: true, upsert: true })); }

  async getStaff() { return (await StaffModel.find()).map(toJSON); }
  async getStaffMember(id: string) { return toJSON(await StaffModel.findById(id)); }
  async createStaffMember(staff: any) { return toJSON(await StaffModel.create(staff)); }
  async updateStaffMember(id: string, staff: any) { return toJSON(await StaffModel.findByIdAndUpdate(id, staff, { new: true })); }
  async deleteStaffMember(id: string) { return (await StaffModel.findByIdAndDelete(id)) !== null; }

  async getReviews() { return (await CustomerReviewModel.find()).map(toJSON); }
  async createReview(review: any) { return toJSON(await CustomerReviewModel.create(review)); }
  async updateReview(id: string, review: any) { return toJSON(await CustomerReviewModel.findByIdAndUpdate(id, review, { new: true })); }
  async deleteReview(id: string) { return (await CustomerReviewModel.findByIdAndDelete(id)) !== null; }

  async getNotifications() { return (await AdminNotificationModel.find()).map(toJSON); }
  async createNotification(notification: any) { return toJSON(await AdminNotificationModel.create(notification)); }
  async markNotificationAsRead(id: string) { return (await AdminNotificationModel.findByIdAndUpdate(id, { read: true }, { new: true })) !== null; }
  async deleteNotification(id: string) { return (await AdminNotificationModel.findByIdAndDelete(id)) !== null; }

  async getStaffBookingRequests(bookingId: string) { return (await StaffBookingRequestModel.find({ bookingId })).map(toJSON); }
  async createStaffBookingRequest(request: any) { return toJSON(await StaffBookingRequestModel.create(request)); }
  async updateStaffBookingRequest(id: string, request: any) { return toJSON(await StaffBookingRequestModel.findByIdAndUpdate(id, request, { new: true })); }
  async deleteStaffBookingRequest(bookingId: string, staffId: string) { return (await StaffBookingRequestModel.findOneAndDelete({ bookingId, staffId })) !== null; }
  async getStaffBookingRequestByToken(token: string) { return toJSON(await StaffBookingRequestModel.findOne({ token })); }
  async getAcceptedStaffForBooking(bookingId: string) {
    const accepted = await StaffBookingRequestModel.find({ bookingId, status: "accepted" });
    const staffIds = accepted.map(r => r.staffId);
    return (await StaffModel.find({ _id: { $in: staffIds } })).map(toJSON);
  }

  async getAuditHistory(entityType?: string, entityId?: string) {
    const query: any = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    return (await AuditHistoryModel.find(query).sort({ createdAt: -1 })).map(toJSON);
  }
  async createAuditHistory(log: any) { return toJSON(await AuditHistoryModel.create(log)); }
  async deleteAuditHistory(id: string) { return (await AuditHistoryModel.findByIdAndDelete(id)) !== null; }
}

let storageInstance: MongoStorage | null = null;
export const getStorage = () => {
  if (!storageInstance) storageInstance = new MongoStorage();
  return storageInstance;
};
export const storage = getStorage();
