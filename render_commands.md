# Render Deployment Configuration

## Build Command
```bash
cd backend && npm install && cd ../frontend && npm install && cd ../backend && npm run build && cd ../frontend && npm run build
```

## Start Command
```bash
# Render requires a single start command. 
# Usually, you'd deploy backend and frontend as separate services.
# If running as a single service:
cd backend && npm run start & cd ../frontend && npm run start
```

## Note for Render
1. **Root Directory**: Ensure the "Root Directory" in Render is set to the project root.
2. **Environment Variables**: Set `NODE_ENV=production` and any other required secrets (like `MONGODB_URI`) in the Render dashboard.
3. **Frontend Proxy**: Ensure the frontend's production build points to the correct backend URL.
