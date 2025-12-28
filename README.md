# Project - Backend & Frontend Separated

This project consists of two independent applications: a backend API server and a frontend React application.

## Structure

```
project/
├── backend/        - Express.js API server
├── frontend/       - React application with Vite
└── attached_assets/ - Static assets
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Documentation

- See `DEVELOPMENT.md` for detailed development guide
- See `backend/README.md` for backend setup
- See `frontend/README.md` for frontend setup

## Environment Files

Copy example files and configure:
- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`
