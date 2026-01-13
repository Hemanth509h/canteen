from db import storage as mongo_storage

class MongoStorageWrapper:
    def __init__(self, storage):
        self.storage = storage

    async def get_food_items(self):
        return await self.storage.get_food_items()

    async def create_food_item(self, item):
        return await self.storage.create_food_item(item)

    async def update_food_item(self, id, item):
        return await self.storage.update_food_item(id, item)

    async def delete_food_item(self, id):
        return await self.storage.delete_food_item(id)

    async def get_bookings(self):
        return await self.storage.get_bookings()

    async def create_booking(self, booking):
        return await self.storage.create_booking(booking)

    async def update_booking(self, id, booking):
        return await self.storage.update_booking(id, booking)

    async def delete_booking(self, id):
        return await self.storage.delete_booking(id)

    async def get_reviews(self):
        return await self.storage.get_reviews()

    async def create_review(self, review):
        return await self.storage.create_review(review)

    async def update_review(self, id, review):
        return await self.storage.update_review(id, review)

    async def delete_review(self, id):
        return await self.storage.delete_review(id)

    async def get_company_info(self):
        return await self.storage.get_company_info()

    async def update_company_info(self, id, info):
        return await self.storage.update_company_info(id, info)

    async def get_staff(self):
        return await self.storage.get_staff()

    async def create_staff_member(self, staff_data):
        return await self.storage.create_staff_member(staff_data)

    async def update_staff_member(self, id, staff_data):
        return await self.storage.update_staff_member(id, staff_data)

    async def delete_staff_member(self, id):
        return await self.storage.delete_staff_member(id)

    async def get_user_codes(self):
        return await self.storage.get_user_codes()

    async def create_user_code(self, code_data):
        return await self.storage.create_user_code(code_data)

    async def delete_user_code(self, id):
        return await self.storage.delete_user_code(id)

    async def get_code_requests(self):
        return await self.storage.get_code_requests()

    async def create_code_request(self, request_data):
        return await self.storage.create_code_request(request_data)

    async def update_code_request(self, id, request_data):
        return await self.storage.update_code_request(id, request_data)

    async def create_notification(self, notification):
        return await self.storage.create_notification(notification)

    async def get_user_code_by_value(self, code_value):
        return await self.storage.get_user_code_by_value(code_value)

    async def mark_code_as_used(self, code_value):
        return await self.storage.mark_code_as_used(code_value)

    async def get_booking_items(self, booking_id):
        return await self.storage.get_booking_items(booking_id)

    async def create_booking_item(self, item):
        return await self.storage.create_booking_item(item)

    async def update_booking_item(self, id, item):
        return await self.storage.update_booking_item(id, item)

    async def delete_booking_item(self, id):
        return await self.storage.delete_booking_item(id)

    async def get_audit_history(self):
        return await self.storage.get_audit_history()

    async def clear_audit_history(self):
        return await self.storage.clear_audit_history()

    async def get_staff_requests(self):
        return await self.storage.get_staff_requests()

    async def create_staff_request(self, request):
        return await self.storage.create_staff_request(request)

    async def get_staff_request_by_token(self, token):
        return await self.storage.get_staff_request_by_token(token)

    async def update_staff_request(self, id, request):
        return await self.storage.update_staff_request(id, request)

storage = MongoStorageWrapper(mongo_storage)
