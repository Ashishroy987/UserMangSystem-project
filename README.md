# Purple Merit MERN Assessment

This repository contains a full-stack User Management System built for the Purple Merit MERN Stack Developer Intern assessment.

## Features

- JWT-based authentication with hashed passwords
- Role-based authorization for `admin`, `manager`, and `user`
- Searchable and paginated user management
- Soft deactivation for users
- Self-service profile management
- Audit metadata with `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`
- React frontend with protected routes and role-aware navigation

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Mongoose, Zod
- Database: MongoDB
- Auth: JWT

## Project Structure

```text
backend/
  src/
    config/
    constants/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    services/
    utils/
    validators/
frontend/
  src/
    components/
    lib/
    pages/
    state/
```

## Local Setup

### 1. Backend

Create `backend/.env` from `backend/.env.example` and set:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/purple-merit-assessment
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=1d
SEED_ON_STARTUP=true
```

Run the API:

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Seeded Demo Accounts

If `SEED_ON_STARTUP=true`, the backend creates demo users when the database is empty:

- Admin: `admin@purplemerit.local` / `Admin@123`
- Manager: `manager@purplemerit.local` / `Manager@123`
- User: `user@purplemerit.local` / `User@1234`

## Important API Endpoints

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

## Role Rules

- Admin can create, update, view, and deactivate any user.
- Manager can view users and update non-admin users.
- User can only view and update their own profile.
- Inactive users cannot log in.

## Suggested Deployment

- Backend: Render or Railway
- Frontend: Vercel or Netlify
- MongoDB: MongoDB Atlas

Update `VITE_API_URL` in the deployed frontend to point to the deployed backend URL.

## Demo Video Checklist

- Login as admin
- Show user listing with search/filter/pagination
- Create and update a user
- Open the audit detail view
- Show manager restrictions on admin accounts
- Show normal user profile-only access
