import os
import motor.motor_asyncio
from bson import ObjectId
from typing import Any, Dict, List, Optional
import logging

logger = logging.getLogger("db")

class MongoStorage:
    def __init__(self):
        self.client = None
        self.db = None
        self.uri = os.environ.get("MONGODB_URI", "mongodb+srv://phemanthkumar746:htnameh509h@data.psr09.mongodb.net/canteen?retryWrites=true&w=majority&appName=data")

    async def connect(self):
        if self.client:
            return
        
        logger.info("Connecting to MongoDB Atlas...")
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                self.uri,
                serverSelectionTimeoutMS=20000,
                connectTimeoutMS=20000,
            )
            self.db = self.client.get_default_database() or self.client.canteen
            logger.info(f"✅ Connected to MongoDB Atlas (Database: {self.db.name})")
        except Exception as e:
            logger.error(f"❌ MongoDB connection error: {e}")
            raise e

    def to_json(self, doc: Any) -> Optional[Dict[str, Any]]:
        if doc is None:
            return None
        
        doc["id"] = str(doc.pop("_id"))
        
        # Mapping for common variations (mimicking JS logic)
        mapping = {
            "clientName": ["client_name", "client", "name"],
            "eventDate": ["event_date", "date"],
            "eventType": ["event_type", "type"],
            "guestCount": ["guest_count", "guests", "total_guests"],
            "pricePerPlate": ["price_per_plate", "price_per_head", "ppp"],
            "contactEmail": ["contact_email", "email"],
            "contactPhone": ["contact_phone", "phone", "mobile_number", "mobile"],
            "companyName": ["company_name", "name", "title"],
            "itemName": ["item_name", "name"],
            "itemDescription": ["item_description", "description"],
        }

        for target, alts in mapping.items():
            if target not in doc:
                for alt in alts:
                    if alt in doc:
                        doc[target] = doc[alt]
                        break
        
        return doc

    async def get_food_items(self) -> List[Dict[str, Any]]:
        cursor = self.db.fooditems.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def get_food_item(self, id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.fooditems.find_one({"_id": ObjectId(id)})
        return self.to_json(doc)

    async def create_food_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.fooditems.insert_one(item)
        item["_id"] = result.inserted_id
        return self.to_json(item)

    async def update_food_item(self, id: str, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.db.fooditems.find_one_and_update(
            {"_id": ObjectId(id)}, {"$set": item}, return_document=True
        )
        return self.to_json(doc)

    async def delete_food_item(self, id: str) -> bool:
        result = await self.db.fooditems.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def get_bookings(self) -> List[Dict[str, Any]]:
        cursor = self.db.eventbookings.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def get_booking(self, id: str) -> Optional[Dict[str, Any]]:
        if not id: return None
        try:
            if ObjectId.is_valid(id):
                doc = await self.db.eventbookings.find_one({"_id": ObjectId(id)})
                if doc: return self.to_json(doc)
            
            doc = await self.db.eventbookings.find_one({"id": id})
            return self.to_json(doc)
        except Exception:
            return None

    async def create_booking(self, booking: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.eventbookings.insert_one(booking)
        booking["_id"] = result.inserted_id
        return self.to_json(booking)

    async def update_booking(self, id: str, booking: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.db.eventbookings.find_one_and_update(
            {"_id": ObjectId(id)}, {"$set": booking}, return_document=True
        )
        return self.to_json(doc)

    async def delete_booking(self, id: str) -> bool:
        result = await self.db.eventbookings.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def get_booking_items(self, booking_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.bookingitems.find({"bookingId": booking_id})
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def create_booking_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.bookingitems.insert_one(item)
        item["_id"] = result.inserted_id
        return self.to_json(item)

    async def delete_booking_items(self, booking_id: str):
        await self.db.bookingitems.delete_many({"bookingId": booking_id})

    async def get_company_info(self) -> Optional[Dict[str, Any]]:
        doc = await self.db.companyinfos.find_one()
        return self.to_json(doc)

    async def update_company_info(self, id: str, info: Dict[str, Any]) -> Dict[str, Any]:
        doc = await self.db.companyinfos.find_one_and_update(
            {}, {"$set": info}, upsert=True, return_document=True
        )
        return self.to_json(doc)

    async def get_staff(self) -> List[Dict[str, Any]]:
        cursor = self.db.staffs.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def get_staff_member(self, id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.staffs.find_one({"_id": ObjectId(id)})
        return self.to_json(doc)

    async def create_staff_member(self, staff: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.staffs.insert_one(staff)
        staff["_id"] = result.inserted_id
        return self.to_json(staff)

    async def update_staff_member(self, id: str, staff: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.db.staffs.find_one_and_update(
            {"_id": ObjectId(id)}, {"$set": staff}, return_document=True
        )
        return self.to_json(doc)

    async def delete_staff_member(self, id: str) -> bool:
        result = await self.db.staffs.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def get_reviews(self) -> List[Dict[str, Any]]:
        cursor = self.db.customerreviews.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def create_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.customerreviews.insert_one(review)
        review["_id"] = result.inserted_id
        return self.to_json(review)

    async def get_notifications(self) -> List[Dict[str, Any]]:
        cursor = self.db.adminnotifications.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def create_notification(self, notification: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.adminnotifications.insert_one(notification)
        notification["_id"] = result.inserted_id
        return self.to_json(notification)

    async def mark_notification_as_read(self, id: str) -> bool:
        result = await self.db.adminnotifications.update_one(
            {"_id": ObjectId(id)}, {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def get_staff_booking_requests(self, booking_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.staffbookingrequests.find({"bookingId": booking_id})
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def get_staff_booking_request_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.staffbookingrequests.find_one({"token": token})
        return self.to_json(doc)

    async def get_accepted_staff_for_booking(self, booking_id: str) -> List[Dict[str, Any]]:
        cursor = self.db.staffbookingrequests.find({"bookingId": booking_id, "status": "accepted"})
        accepted = await cursor.to_list(length=1000)
        staff_ids = [doc["staffId"] for doc in accepted]
        staff_cursor = self.db.staffs.find({"_id": {"$in": [ObjectId(sid) for sid in staff_ids]}})
        return [self.to_json(doc) for doc in await staff_cursor.to_list(length=1000)]

    async def get_audit_history(self, entity_type: str = None, entity_id: str = None) -> List[Dict[str, Any]]:
        query = {}
        if entity_type: query["entityType"] = entity_type
        if entity_id: query["entityId"] = entity_id
        cursor = self.db.audithistories.find(query).sort("createdAt", -1)
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def create_audit_history(self, log: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.audithistories.insert_one(log)
        log["_id"] = result.inserted_id
        return self.to_json(log)

    async def get_user_codes(self) -> List[Dict[str, Any]]:
        cursor = self.db.usercodes.find()
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def get_user_code_by_value(self, code: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.usercodes.find_one({"code": code})
        return self.to_json(doc)

    async def create_user_code(self, code_data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.usercodes.insert_one(code_data)
        code_data["_id"] = result.inserted_id
        return self.to_json(code_data)

    async def delete_user_code(self, id: str) -> bool:
        result = await self.db.usercodes.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    async def get_code_requests(self) -> List[Dict[str, Any]]:
        cursor = self.db.coderequests.find().sort("createdAt", -1)
        return [self.to_json(doc) for doc in await cursor.to_list(length=1000)]

    async def create_code_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        result = await self.db.coderequests.insert_one(request_data)
        request_data["_id"] = result.inserted_id
        return self.to_json(request_data)

    async def update_code_request(self, id: str, request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc = await self.db.coderequests.find_one_and_update(
            {"_id": ObjectId(id)}, {"$set": request_data}, return_document=True
        )
        return self.to_json(doc)

storage = MongoStorage()

async def connect_to_database():
    await storage.connect()
