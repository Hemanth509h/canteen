# Data Flow Journey: From Frontend Click to Database Save

This guide follows the journey of a single piece of data (a new catering booking) through the entire application stack.

---

## Step 1: User Action (Frontend)
**File:** `frontend/src/pages/customer/customer-home.tsx`
The user fills out a form and clicks "Book Now". This triggers a function that collects the data into a JavaScript object.

```json
{
  "clientName": "Jane Smith",
  "eventDate": "2025-12-31",
  "eventType": "Wedding",
  "guestCount": 150,
  "contactPhone": "1234567890",
  "contactEmail": "jane@example.com"
}
```

---

## Step 2: Sending the Request (The Helper)
**File:** `frontend/src/lib/queryClient.ts`
The frontend calls `apiRequest("POST", "/api/bookings", data)`. This uses the browser's `fetch` API to send the data over the network.

---

## Step 3: The Proxy Bridge (Vite)
**File:** `frontend/vite.config.ts`
Because the URL starts with `/api`, Vite's proxy captures it and forwards it from the frontend server (port 5000) to the backend server (port 3000).

---

## Step 4: The Receptionist (Backend Entry)
**File:** `backend/index.ts`
The request arrives at the backend. 
- `express.json()` reads the raw data and puts it in `req.body`.
- Logging middleware prints: `POST /api/bookings 201 in 45ms`.

---

## Step 5: The Manager (Routes)
**File:** `backend/routes.ts`
The code matches the URL `/api/bookings` with the `POST` method.
- **Validation:** It uses `insertEventBookingSchema` from `schema.ts` to check if the phone number is valid, the email is correct, etc.
- **Business Logic:** It calculates the total amount based on the guest count.
- **Execution:** It calls `storage.createBooking(bookingData)`.

---

## Step 6: The Librarian (Storage)
**File:** `backend/storage.ts`
The storage layer handles the specific logic for saving. In this project, it's a "wrapper" that prepares the data for the actual database.

---

## Step 7: The Archive (Database/MongoDB)
**File:** `backend/db.ts`
The `MongoStorage` class uses **Mongoose Models** to finally write the data into the **MongoDB** collection named `eventbookings`.

---

## Step 8: The Response (Back to User)
The backend sends a `201 Created` response back through the same path. The frontend receives the success message and shows a "Booking Successful!" toast to the user.
