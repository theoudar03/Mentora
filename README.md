# SAFEHARBOR — AI-Based Student Mental Health Safety & Support System

A production-ready MERN stack starter architecture designed for modular scale, clear role-based access, and simple integration for future AI/ML tools.

## Structure Overview

- **Frontend:** React + Vite + Tailwind CSS (v4)
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Core Systems:** Role-based routing, Context API for state management, Central API utility wrapper, MVC backend.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local instance or Atlas cluster)

## Environment Setup

### Backend

1. Nagivate to `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file and configure it:

   ```bash
   cp .env.example .env
   ```

   > Ensure `MONGO_URI` points to a valid MongoDB database.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Demo & Testing Note

A demo `Login` layout is available for testing the role-based dashboard without a populated backend yet. Just select the demo users from the dropdown instead of needing to configure real database records immediately.

## Directory Structure Overview

**Server (Backend)**

- `config/` - Database connection and configuration files.
- `controllers/` - Route logic for auth, surveys, messages, risk profiles. Includes `aiController` for future ML endpoints.
- `models/` - Mongoose schemas (User, Survey, MentalHealthRisk, Message).
- `routes/` - Express routing definitions.
- `middleware/` - JWT protect middleware and RBAC (role-based access control) functions.
- `services/` - Future complex logic or 3rd-party services.
- `utils/` - Utility/helper files.

**Client (Frontend)**

- `src/api/` - Pre-configured Axios instance (`apiClient.js`) that attaches JWT tokens.
- `src/components/` - Future highly reusable UI components.
- `src/context/` - `AuthContext` for managing global user state locally.
- `src/hooks/` - Convenience hooks like `useAuth()`.
- `src/layouts/` - Contains the `DashboardLayout` integrating a sidebar and Role guard logic.
- `src/pages/` - Role-specific dashboards (Student, Mentor, Welfare) and shared pages.
- `src/routes/` - `AppRoutes.jsx` handling all navigation logic.
