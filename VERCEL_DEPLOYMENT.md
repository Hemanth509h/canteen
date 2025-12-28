# Vercel Deployment Guide

To host this project on Vercel, you'll need to follow these steps. Since the project uses a separate frontend (Vite) and backend (Express), you'll need a specific configuration to make it work as a monorepo or two separate deployments.

## Prerequisites
1. A [Vercel account](https://vercel.com).
2. [Vercel CLI](https://vercel.com/cli) installed (optional, but helpful).
3. Your project pushed to a GitHub, GitLab, or Bitbucket repository.

## Step 1: Prepare the Backend for Serverless
Vercel handles Node.js backends as **Serverless Functions**.

1.  **Create a `vercel.json` in the root directory:**
    ```json
    {
      "version": 2,
      "builds": [
        {
          "src": "backend/index.ts",
          "use": "@vercel/node"
        },
        {
          "src": "package.json",
          "use": "@vercel/static-build",
          "config": { "distDir": "frontend/dist" }
        }
      ],
      "routes": [
        {
          "src": "/api/(.*)",
          "dest": "backend/index.ts"
        },
        {
          "src": "/(.*)",
          "dest": "frontend/dist/$1"
        }
      ]
    }
    ```

2.  **Export the Express app:**
    In `backend/index.ts`, ensure you are exporting the `app` instance:
    ```typescript
    export default app;
    ```

## Step 2: Configure Frontend Environment
1.  **API URL:**
    In production, your frontend needs to know where the backend is. Since Vercel hosts both on the same domain in this config, you can often use relative paths (`/api/...`).
    However, if you deploy them separately:
    - Set an environment variable `VITE_API_URL` in the Vercel dashboard.

## Step 3: Deployment
1.  **Via Vercel Dashboard:**
    - Import your Git repository.
    - Vercel will auto-detect the frameworks.
    - **Build Command:** `npm run build` (Ensure this command builds both frontend and backend).
    - **Output Directory:** `frontend/dist` (or wherever Vite outputs).

2.  **Via CLI:**
    ```bash
    vercel
    ```

## Step 4: Environment Variables
Add these in the Vercel Project Settings:
- `MONGODB_URI`: Your MongoDB connection string.
- `ADMIN_PASSWORD`: Your desired admin password.
- `ADMIN_PASSWORD_HASH`: (Optional) A pre-hashed bcrypt password.

## Step 5: Important Notes
- **Serverless Limits:** Vercel serverless functions have a maximum execution time (usually 10-60 seconds). Ensure your database queries are optimized.
- **Static Assets:** Images in `frontend/public` will be served automatically at the root.
- **Database:** Since Vercel is serverless, you MUST use a cloud database like **MongoDB Atlas**. Local databases will not work.
