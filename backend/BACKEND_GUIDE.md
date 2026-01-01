# Backend Development Guide: Replit Canteen App

This guide explains the backend architecture and how to start developing server-side features.

## 🚀 Where to Start?

The entry point for the backend is **`backend/index.js`**. This is where the Express server is initialized and all routes are connected.

### 1. The Entry Point: `backend/index.js`
- **What it does:** Initializes the Express application, sets up middleware (CORS, JSON parsing, Sessions), connects to MongoDB, and registers all API routes.
- **Port:** The backend runs on port **3000**.

### 2. Database Models: `backend/models/`
This folder defines the structure of your data using Mongoose schemas.
- **`FoodItem.js`:** Defines what a food item looks like (name, description, price, image, category).
- **`User.js`:** Defines user accounts for the admin dashboard.
- **`Review.js`:** Structure for customer reviews.

### 3. API Routes: `backend/routes.js`
- **What it does:** This file contains all the "endpoints" the frontend calls.
- **Example:** When the frontend asks for `GET /api/food-items`, the code in this file fetches the data from the database and sends it back.

### 4. Middleware: `backend/middleware/` (if present) or inline
- Handles things like checking if a user is logged in before allowing them to add food items.

---

## 🛠️ How to make a change?

1. **Want to add a new API endpoint?**
   - Open `backend/routes.js`.
   - Add a new route (e.g., `router.post('/api/new-feature', ...)`).
   - If it needs to store data, create/update a model in `backend/models/`.

2. **Want to change the database structure?**
   - Edit the relevant file in `backend/models/`.
   - Note: Existing data in MongoDB might need to be updated to match the new schema.

3. **Want to change server configuration?**
   - Edit `backend/index.js` (e.g., changing CORS settings or adding new global middleware).

## 🗄️ Database (MongoDB)
We use Mongoose to talk to MongoDB Atlas. The connection string is managed via environment variables.
- The connection logic is handled at the start of `backend/index.js`.

## 🔐 Authentication
The backend uses `passport` and `express-session` for handling admin logins. This ensures that only authorized users can modify the menu.

---

## 💡 Pro Tip: Hot Reloading
The backend is set up with `tsx watch`. This means every time you save a file in the `backend/` folder, the server will automatically restart with your latest changes!