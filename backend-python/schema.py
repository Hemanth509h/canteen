from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re

def sanitize_name(val: str) -> str:
    return val.strip()[:100]

def sanitize_string(val: str, length: int = 500) -> str:
    return val.strip()[:length]

def sanitize_phone(val: str) -> str:
    return re.sub(r"\D", "", val)[:15]

class FoodItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    category: str = Field(..., min_length=1, max_length=50)
    type: str = Field(..., pattern="^(Veg|Non-Veg)$")
    imageUrl: Optional[str] = None
    dietaryTags: Optional[List[str]] = []
    price: Optional[int] = Field(None, ge=1)

    @validator("name", pre=True)
    def validate_name(cls, v):
        return sanitize_name(v)

    @validator("description", pre=True)
    def validate_description(cls, v):
        return sanitize_string(v)

class InsertFoodItem(FoodItemBase):
    pass

class EventBookingBase(BaseModel):
    clientName: str = Field(..., min_length=2, max_length=100)
    eventDate: str
    eventType: str = Field(..., min_length=1, max_length=50)
    guestCount: int = Field(..., ge=1, le=10000)
    pricePerPlate: int = Field(..., ge=0, le=100000)
    servingBoysNeeded: int = Field(2, ge=0, le=100)
    contactEmail: EmailStr
    contactPhone: str = Field(..., min_length=10)
    specialRequests: Optional[str] = Field(None, max_length=1000)
    totalAmount: Optional[int] = None
    advanceAmount: Optional[int] = None

    @validator("clientName", pre=True)
    def validate_client_name(cls, v):
        return sanitize_name(v)

    @validator("contactPhone", pre=True)
    def validate_contact_phone(cls, v):
        return sanitize_phone(v)

    @validator("eventDate")
    def validate_event_date(cls, v):
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
            return v
        except ValueError:
            raise ValueError("Invalid date format")

class InsertEventBooking(EventBookingBase):
    pass

class UpdateEventBooking(BaseModel):
    clientName: Optional[str] = Field(None, min_length=2, max_length=100)
    eventDate: Optional[str] = None
    eventType: Optional[str] = Field(None, min_length=1, max_length=50)
    guestCount: Optional[int] = Field(None, ge=1, le=10000)
    pricePerPlate: Optional[int] = Field(None, ge=0, le=100000)
    servingBoysNeeded: Optional[int] = Field(None, ge=0, le=100)
    contactEmail: Optional[EmailStr] = None
    contactPhone: Optional[str] = None
    specialRequests: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(pending|confirmed|completed|cancelled)$")
    advancePaymentStatus: Optional[str] = Field(None, pattern="^(pending|paid)$")
    finalPaymentStatus: Optional[str] = Field(None, pattern="^(pending|paid)$")
    advancePaymentApprovalStatus: Optional[str] = Field(None, pattern="^(pending|approved|rejected)$")
    finalPaymentApprovalStatus: Optional[str] = Field(None, pattern="^(pending|approved|rejected)$")
    advancePaymentScreenshot: Optional[str] = None
    finalPaymentScreenshot: Optional[str] = None
    totalAmount: Optional[int] = Field(None, gt=0)
    advanceAmount: Optional[int] = Field(None, gt=0)

class InsertBookingItem(BaseModel):
    bookingId: str = Field(..., min_length=1)
    foodItemId: str = Field(..., min_length=1)
    quantity: int = Field(1, gt=0)

class InsertCompanyInfo(BaseModel):
    companyName: Optional[str] = Field(None, max_length=100)
    tagline: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = Field(None, max_length=500)
    eventsPerYear: Optional[int] = Field(500, ge=0, le=100000)
    yearsExperience: Optional[int] = Field(15, ge=0, le=100)
    websiteUrl: Optional[str] = None
    upiId: Optional[str] = Field(None, pattern=r"^[\w\-@.]+$")
    minAdvanceBookingDays: Optional[int] = Field(2, ge=0, le=30)
    primaryColor: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    logoUrl: Optional[str] = None

    @validator("phone", pre=True)
    def validate_phone(cls, v):
        if v is None: return None
        return sanitize_phone(v)

class InsertStaff(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., min_length=1, max_length=50)
    phone: str = Field(..., min_length=10)

    @validator("name", pre=True)
    def validate_name(cls, v):
        return sanitize_name(v)

    @validator("phone", pre=True)
    def validate_phone(cls, v):
        return sanitize_phone(v)

class InsertCustomerReview(BaseModel):
    customerName: str = Field(..., min_length=1)
    eventType: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=10)

class InsertAdminNotification(BaseModel):
    type: str = Field(..., pattern="^(booking|payment)$")
    title: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    bookingId: Optional[str] = None
    read: bool = False

class InsertUserCode(BaseModel):
    code: str = Field(..., min_length=4, max_length=20)
    isUsed: bool = False
    expiresAt: Optional[str] = None
    notes: Optional[str] = Field(None, max_length=200)

    @validator("expiresAt")
    def validate_expires_at(cls, v):
        if not v: return v
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
            return v
        except ValueError:
            raise ValueError("Invalid expiration date")

class InsertCodeRequest(BaseModel):
    customerName: str = Field(..., min_length=1, max_length=100)
    customerEmail: EmailStr
    customerPhone: str = Field(..., min_length=10)
    eventDetails: Optional[str] = Field(None, max_length=1000)
    status: str = Field("pending", pattern="^(pending|granted|rejected)$")

    @validator("customerName", pre=True)
    def validate_customer_name(cls, v):
        return sanitize_name(v)

    @validator("customerPhone", pre=True)
    def validate_customer_phone(cls, v):
        return sanitize_phone(v)
