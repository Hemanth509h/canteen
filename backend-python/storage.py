from db import storage as mongo_storage

class MongoStorageWrapper:
    def __init__(self, storage):
        self.storage = storage

    async def get_food_items(self):
        return await self.storage.get_food_items()

    async def create_food_item(self, item):
        return await self.storage.create_food_item(item)

    async def get_bookings(self):
        return await self.storage.get_bookings()

    async def create_booking(self, booking):
        return await self.storage.create_booking(booking)

    async def get_reviews(self):
        return await self.storage.get_reviews()

    async def create_review(self, review):
        return await self.storage.create_review(review)

    async def get_company_info(self):
        return await self.storage.get_company_info()

    async def update_company_info(self, id, info):
        return await self.storage.update_company_info(id, info)

    async def get_staff(self):
        return await self.storage.get_staff()

    async def create_staff_member(self, staff_data):
        return await self.storage.create_staff_member(staff_data)

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

storage = MongoStorageWrapper(mongo_storage)
