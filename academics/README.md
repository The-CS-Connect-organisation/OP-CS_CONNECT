# 🎓 SchoolSync - Academic Portal

This is the **Academic Portal** for Cornerstone SchoolSync, specifically designed for **Students** and **Parents**. It focuses on learning management, academic progress, and communication.

## 🚀 Key Features

- **Student Dashboard**: Personalized view of academic status, attendance, and upcoming tasks.
- **Parent Dashboard**: Oversight of children's academic performance and school communication.
- **AI Learning Lab**: Interactive AI tools for students (Doubt Solver, Study Planner, Grade Predictor, etc.).
- **Assignment Hub**: View assignments, submit work, and track grades.
- **Attendance Tracking**: Real-time attendance monitoring and monthly reports.
- **Messaging System**: Direct communication with teachers and staff.
- **Fee Management**: Portal for tracking and managing school fees.
- **PWA Ready**: Offline-capable web app for mobile-like experience.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express (Portal-isolated)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Socket.io
- **AI**: OpenRouter (GPT-4o / Claude / Gemini)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase account and database initialized with `supabase_schema.sql`

### Installation
1. `npm install`
2. Create a `.env` file based on `.env.example`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   OPENROUTER_API_KEY=your_api_key
   PORT=5000
   ```

### Running the App
- **Frontend**: `npm run dev` (Runs on http://localhost:5173)
- **Backend API**: `npm run dev:api` (Runs on http://localhost:5000)
- **Seed Data**: `npm run seed:api` (Initialize sample data)

## 📁 Portal Structure

- `/src/pages/AcademicPortal/Student`: Student-specific pages.
- `/src/pages/ManagementPortal/Parent`: Parent-specific dashboard.
- `/src/pages/AcademicPortal/shared`: Features shared across student/parent roles (AILab, CommunicationHub).
- `/backend`: Isolated backend service for this portal.
- `/schoolsync-...`: Mobile application (Expo) for the academic experience.

---
*Cornerstone SchoolSync - Empowering students and parents through technology.*
