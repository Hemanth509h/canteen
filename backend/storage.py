import uuid
from datetime import datetime

class MemoryStorage:
    def __init__(self):
        self.food_items = {}
        self.event_bookings = {}
        self.booking_items = {}
        self.company_info = {}
        self.staff = {}
        self.reviews = {}
        self.notifications = {}
        self.staff_requests = {}
        self.audit_history = {}
        self.user_codes = {}
        self.code_requests = {}

    def generate_id(self):
        return str(uuid.uuid4())

    async def get_food_items(self):
        return list(self.food_items.values())

    async def get_food_item(self, id):
        return self.food_items.get(id)

    async def create_food_item(self, item):
        id = self.generate_id()
        new_item = {
            "id": id,
            **item,
            "imageUrl": item.get("imageUrl")
        }
        self.food_items[id] = new_item
        return new_item

    async def update_food_item(self, id, item):
        existing = self.food_items.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(item)
        if "imageUrl" in item:
            updated["imageUrl"] = item["imageUrl"]
        self.food_items[id] = updated
        return updated

    async def delete_food_item(self, id):
        if id in self.food_items:
            del self.food_items[id]
            return True
        return False

    async def get_bookings(self):
        return list(self.event_bookings.values())

    async def get_booking(self, id):
        booking = self.event_bookings.get(id)
        if not booking:
            return None
        
        guest_count = int(booking.get("guestCount", 0))
        price_per_plate = int(booking.get("pricePerPlate", 0))
        total_amount = int(booking.get("totalAmount", guest_count * price_per_plate))
        advance_amount = int(booking.get("advanceAmount", round(total_amount * 0.5)))

        return {
            **booking,
            "guestCount": guest_count,
            "pricePerPlate": price_per_plate,
            "totalAmount": total_amount,
            "advanceAmount": advance_amount
        }

    async def create_booking(self, booking):
        id = self.generate_id()
        guest_count = int(booking.get("guestCount", 0))
        price_per_plate = int(booking.get("pricePerPlate", 0))
        total_amount = int(booking.get("totalAmount", guest_count * price_per_plate))
        advance_amount = int(booking.get("advanceAmount", round(total_amount * 0.5)))

        new_booking = {
            "id": id,
            **booking,
            "guestCount": guest_count,
            "pricePerPlate": price_per_plate,
            "totalAmount": total_amount,
            "advanceAmount": advance_amount,
            "status": "pending",
            "advancePaymentStatus": "pending",
            "finalPaymentStatus": "pending",
            "advancePaymentApprovalStatus": "pending",
            "finalPaymentApprovalStatus": "pending",
            "createdAt": datetime.utcnow().isoformat()
        }
        self.event_bookings[id] = new_booking
        return new_booking

    async def update_booking(self, id, booking):
        existing = self.event_bookings.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(booking)
        self.event_bookings[id] = updated
        return updated

    async def delete_booking(self, id):
        if id in self.event_bookings:
            del self.event_bookings[id]
            return True
        return False

    async def get_booking_items(self, booking_id):
        return [item for item in self.booking_items.values() if item.get("bookingId") == booking_id]

    async def create_booking_item(self, item):
        id = self.generate_id()
        new_item = {
            "id": id,
            **item,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.booking_items[id] = new_item
        return new_item

    async def delete_booking_items(self, booking_id):
        to_delete = [id for id, item in self.booking_items.items() if item.get("bookingId") == booking_id]
        for id in to_delete:
            del self.booking_items[id]

    async def get_company_info(self):
        values = list(self.company_info.values())
        return values[0] if values else None

    async def create_company_info(self, info):
        id = "company-default"
        new_info = {
            "id": id,
            "companyName": info.get("companyName", ""),
            "tagline": info.get("tagline", ""),
            "description": info.get("description", ""),
            "email": info.get("email", ""),
            "phone": info.get("phone", ""),
            "address": info.get("address", ""),
            "eventsPerYear": info.get("eventsPerYear", 0),
            **info
        }
        self.company_info[id] = new_info
        return new_info

    async def update_company_info(self, id, info):
        existing = await self.get_company_info()
        updated_info = (existing or {}).copy()
        updated_info.update(info)
        return await self.create_company_info(updated_info)

    async def get_staff(self):
        return list(self.staff.values())

    async def get_staff_member(self, id):
        return self.staff.get(id)

    async def create_staff_member(self, staff_data):
        id = self.generate_id()
        new_staff = {
            "id": id,
            **staff_data,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.staff[id] = new_staff
        return new_staff

    async def update_staff_member(self, id, staff_data):
        existing = self.staff.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(staff_data)
        self.staff[id] = updated
        return updated

    async def delete_staff_member(self, id):
        if id in self.staff:
            del self.staff[id]
            return True
        return False

    async def get_reviews(self):
        return list(self.reviews.values())

    async def create_review(self, review):
        id = self.generate_id()
        new_review = {
            "id": id,
            **review,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.reviews[id] = new_review
        return new_review

    async def update_review(self, id, review):
        existing = self.reviews.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(review)
        self.reviews[id] = updated
        return updated

    async def delete_review(self, id):
        if id in self.reviews:
            del self.reviews[id]
            return True
        return False

    async def get_notifications(self):
        return list(self.notifications.values())

    async def create_notification(self, notification):
        id = self.generate_id()
        new_notification = {
            "id": id,
            **notification,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.notifications[id] = new_notification
        return new_notification

    async def mark_notification_as_read(self, id):
        existing = self.notifications.get(id)
        if not existing:
            return False
        existing["read"] = True
        return True

    async def delete_notification(self, id):
        if id in self.notifications:
            del self.notifications[id]
            return True
        return False

    async def get_staff_booking_requests(self, booking_id):
        return [r for r in self.staff_requests.values() if r.get("bookingId") == booking_id]

    async def create_staff_booking_request(self, request):
        id = self.generate_id()
        new_request = {
            "id": id,
            **request,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.staff_requests[id] = new_request
        return new_request

    async def update_staff_booking_request(self, id, request):
        existing = self.staff_requests.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(request)
        self.staff_requests[id] = updated
        return updated

    async def delete_staff_booking_request(self, booking_id, staff_id):
        target_id = next((id for id, r in self.staff_requests.items() if r.get("bookingId") == booking_id and r.get("staffId") == staff_id), None)
        if target_id:
            del self.staff_requests[target_id]
            return True
        return False

    async def get_staff_booking_request_by_token(self, token):
        return next((r for r in self.staff_requests.values() if r.get("token") == token), None)

    async def get_accepted_staff_for_booking(self, booking_id):
        staff_ids = [r.get("staffId") for r in self.staff_requests.values() if r.get("bookingId") == booking_id and r.get("status") == "accepted"]
        return [s for s in self.staff.values() if s.get("id") in staff_ids]

    async def get_audit_history(self, entity_type=None, entity_id=None):
        logs = list(self.audit_history.values())
        if entity_type:
            logs = [l for l in logs if l.get("entityType") == entity_type]
        if entity_id:
            logs = [l for l in logs if l.get("entityId") == entity_id]
        return sorted(logs, key=lambda x: x.get("createdAt", ""), reverse=True)

    async def create_audit_history(self, log):
        id = self.generate_id()
        new_log = {
            "id": id,
            **log,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.audit_history[id] = new_log
        return new_log

    async def delete_audit_history(self, id):
        if id in self.audit_history:
            del self.audit_history[id]
            return True
        return False

    async def get_user_codes(self):
        return list(self.user_codes.values())

    async def create_user_code(self, code_data):
        id = self.generate_id()
        new_code = {
            "id": id,
            **code_data,
            "isUsed": False,
            "createdAt": datetime.utcnow().isoformat()
        }
        self.user_codes[id] = new_code
        return new_code

    async def get_user_code_by_value(self, code_value):
        return next((c for c in self.user_codes.values() if c.get("code") == code_value and not c.get("isUsed")), None)

    async def update_user_code(self, id, code_data):
        existing = self.user_codes.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(code_data)
        self.user_codes[id] = updated
        return updated

    async def mark_code_as_used(self, code_value):
        code = next((c for c in self.user_codes.values() if c.get("code") == code_value), None)
        if code:
            code["isUsed"] = True
            return True
        return False

    async def delete_user_code(self, id):
        if id in self.user_codes:
            del self.user_codes[id]
            return True
        return False

    async def get_code_requests(self):
        requests = list(self.code_requests.values())
        return sorted(requests, key=lambda x: x.get("createdAt", ""), reverse=True)

    async def create_code_request(self, request_data):
        id = self.generate_id()
        new_request = {
            "id": id,
            **request_data,
            "status": "pending",
            "createdAt": datetime.utcnow().isoformat()
        }
        self.code_requests[id] = new_request
        return new_request

    async def update_code_request(self, id, request_data):
        existing = self.code_requests.get(id)
        if not existing:
            return None
        updated = existing.copy()
        updated.update(request_data)
        self.code_requests[id] = updated
        return updated

storage = MemoryStorage()
