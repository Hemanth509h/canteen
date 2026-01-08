from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional, Any
from pydantic import ValidationError

from storage import storage
from schema import (
    InsertFoodItem, InsertEventBooking, UpdateEventBooking,
    InsertCustomerReview, InsertCompanyInfo, InsertStaff,
    InsertUserCode, InsertCodeRequest, InsertAdminNotification
)
from password_manager import verify_password, update_password

router = APIRouter(prefix="/api")

def send_response(data: Any = None, status_code: int = 200, error: str = ""):
    return {
        "success": 200 <= status_code < 300,
        "data": data,
        "error": error,
        "timestamp": datetime.now().isoformat()
    }

@router.post("/admin/login")
async def admin_login(payload: dict = Body(...)):
    password = payload.get("password", "")
    if await verify_password(password):
        return send_response({"success": True})
    raise HTTPException(status_code=401, detail="Invalid password")

@router.post("/admin/change-password")
async def change_password(payload: dict = Body(...)):
    current_password = payload.get("currentPassword")
    new_password = payload.get("newPassword")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current password and new password are required")
        
    if not await verify_password(current_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
        
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
    await update_password(new_password)
    return send_response({"success": True, "message": "Password changed successfully"})

@router.get("/food-items")
async def get_food_items():
    items = await storage.get_food_items()
    return send_response(items)

@router.post("/food-items")
async def create_food_item(item: InsertFoodItem):
    new_item = await storage.create_food_item(item.dict())
    return send_response(new_item, status_code=201)

@router.patch("/food-items/{item_id}")
async def update_food_item(item_id: str, payload: dict = Body(...)):
    item = await storage.update_food_item(item_id, payload)
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found")
    return send_response(item)

@router.delete("/food-items/{item_id}")
async def delete_food_item(item_id: str):
    success = await storage.delete_food_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Food item not found")
    return send_response({"success": True}, status_code=204)

@router.get("/bookings")
async def get_bookings():
    bookings = await storage.get_bookings()
    return send_response(bookings)

@router.post("/bookings")
async def create_booking(booking: InsertEventBooking):
    new_booking = await storage.create_booking(booking.dict())
    return send_response(new_booking, status_code=201)

@router.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, payload: dict = Body(...)):
    booking = await storage.update_booking(booking_id, payload)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return send_response(booking)

@router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str):
    success = await storage.delete_booking(booking_id)
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found")
    return send_response({"success": True}, status_code=204)

@router.get("/reviews")
async def get_reviews():
    reviews = await storage.get_reviews()
    return send_response(reviews)

@router.post("/reviews")
async def create_review(review: InsertCustomerReview):
    new_review = await storage.create_review(review.dict())
    return send_response(new_review, status_code=201)

@router.patch("/reviews/{review_id}")
async def update_review(review_id: str, payload: dict = Body(...)):
    review = await storage.update_review(review_id, payload)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return send_response(review)

@router.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    success = await storage.delete_review(review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found")
    return send_response({"success": True}, status_code=204)

@router.get("/company-info")
async def get_company_info():
    info = await storage.get_company_info()
    return send_response(info or {})

@router.patch("/company-info")
async def update_company_info(info: dict = Body(...)):
    # Partial update logic
    updated_info = await storage.update_company_info(None, info)
    return send_response(updated_info)

@router.get("/staff")
async def get_staff():
    staff = await storage.get_staff()
    return send_response(staff)

@router.post("/staff")
async def create_staff(staff_data: InsertStaff):
    new_staff = await storage.create_staff_member(staff_data.dict())
    return send_response(new_staff, status_code=201)

@router.patch("/staff/{staff_id}")
async def update_staff(staff_id: str, payload: dict = Body(...)):
    staff = await storage.update_staff_member(staff_id, payload)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return send_response(staff)

@router.delete("/staff/{staff_id}")
async def delete_staff(staff_id: str):
    success = await storage.delete_staff_member(staff_id)
    if not success:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return send_response({"success": True}, status_code=204)

@router.get("/user-codes")
async def get_user_codes():
    codes = await storage.get_user_codes()
    return send_response(codes)

@router.post("/user-codes")
async def create_user_code(code_data: InsertUserCode):
    new_code = await storage.create_user_code(code_data.dict())
    return send_response(new_code, status_code=201)

@router.delete("/user-codes/{code_id}")
async def delete_user_code(code_id: str):
    await storage.delete_user_code(code_id)
    return send_response({"success": True}, status_code=204)

@router.get("/code-requests")
async def get_code_requests():
    requests = await storage.get_code_requests()
    return send_response(requests)

@router.post("/code-requests")
async def create_code_request(request_data: InsertCodeRequest):
    new_request = await storage.create_code_request(request_data.dict())
    await storage.create_notification({
        "type": "booking",
        "title": "New Booking Code Request",
        "message": f"Customer {new_request['customerName']} has requested a booking code.",
        "read": False
    })
    return send_response(new_request, status_code=201)

@router.patch("/code-requests/{request_id}")
async def update_code_request(request_id: str, payload: dict = Body(...)):
    request = await storage.update_code_request(request_id, payload)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return send_response(request)

@router.get("/codes/verify")
async def verify_code(code: str):
    valid_code = await storage.get_user_code_by_value(code)
    if not valid_code:
        raise HTTPException(status_code=404, detail="Invalid or used code")
    return send_response(valid_code)

@router.post("/codes/use")
async def use_code(payload: dict = Body(...)):
    code = payload.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    success = await storage.mark_code_as_used(code)
    if not success:
        raise HTTPException(status_code=404, detail="Code not found or already used")
    return send_response({"success": True})
