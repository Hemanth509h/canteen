# Frontend Development Guide: Replit Canteen App

Welcome! This guide explains the structure of the frontend and how to start building or modifying it.

## 🚀 Where to Start?

The best place to start is **`frontend/src/main.tsx`**. This is the entry point of the application.

### 1. The Entry Point: `frontend/src/main.tsx`
- **What it does:** It sets up the React environment, initializes the Query Client (for data fetching), and renders the `App` component.
- **Key Imports:** 
  - `QueryClientProvider`: Manages the state of your data fetching.
  - `Toaster`: Handles those little notification pop-ups.

### 2. The Root Component: `frontend/src/App.tsx`
- **What it does:** This is the "brain" of your app's layout. It handles **Routing**.
- **How it works:** It uses a library called `wouter`. 
  - If the URL is `/`, it shows the `HomePage`.
  - If the URL is `/admin`, it shows the `AdminDashboard`.
  - If a page isn't found, it shows a `NotFound` page.

### 3. The Pages: `frontend/src/pages/`
This folder contains the main views of your app:
- **`HomePage.tsx`:** What users see first. It lists food items and the menu.
- **`AdminDashboard.tsx`:** The private area where food items can be added or edited.

### 4. The Building Blocks: `frontend/src/components/`
Small, reusable pieces of UI:
- **`FoodCard.tsx`:** How an individual food item looks.
- **`Navbar.tsx`:** The navigation bar at the top.
- **`ui/` folder:** Contains basic elements like buttons, inputs, and dialogs (powered by Shadcn UI).

### 5. Data & Logic: `frontend/src/lib/` and `hooks/`
- **`api.ts`:** Contains functions that talk to your backend (e.g., `fetchFoodItems`).
- **`use-food-items.ts`:** A custom "hook" that uses React Query to make data fetching easy and efficient.

---

## 🛠️ How to make a change?

1. **Want to change the layout?** Go to `App.tsx`.
2. **Want to change how a food item looks?** Go to `components/FoodCard.tsx`.
3. **Want to add a new page?** 
   - Create a new file in `pages/`.
   - Add a `<Route />` for it in `App.tsx`.
4. **Want to change the styles?** We use **Tailwind CSS**. You can change colors and spacing directly in the component files using class names (e.g., `className="bg-blue-500 p-4"`).

## 📡 Talking to the Backend
The frontend is configured to talk to the backend on port 3000 via a proxy. You don't need to worry about the URL; just use `/api/...` in your fetch requests!