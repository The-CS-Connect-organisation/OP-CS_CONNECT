# 🏢 SchoolSync - Management Portal

This is the **Management Portal** for Cornerstone SchoolSync, specifically designed for **Administrators** and **Teachers**. It focuses on school operations, staff management, and academic administration.

## 🚀 Key Features

- **Admin Dashboard**: High-level overview of school performance, analytics, and HR.
- **Teacher Dashboard**: Centralized hub for managing classes, attendance, and student performance.
- **User Management**: Comprehensive system for managing students, teachers, and staff profiles.
- **Academic Administration**: Manage assignments, exams, and grade submissions.
- **Timetable Management**: Intelligent timetable creator with conflict detection.
- **AI Administration**: AI-powered tools for teachers (Assignment Feedback, Quiz Generator, Attendance Insights).
- **Communication Center**: Institutional announcements and internal messaging.
- **Payroll & HR**: Basic payroll management for staff.

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
   PORT=5001
   ```

### Running the App
- **Frontend**: `npm run dev` (Runs on http://localhost:5174)
- **Backend API**: `npm run dev:api` (Runs on http://localhost:5001)
- **Seed Data**: `npm run seed:api` (Initialize sample data)

## 📁 Portal Structure

- `/src/pages/ManagementPortal/Admin`: Admin-specific pages (Analytics, HR, Payroll).
- `/src/pages/AcademicPortal/Teacher`: Teacher-specific pages (Grades, Attendance, Assignments).
- `/src/pages/AcademicPortal/Dashboard`: Specialized teacher dashboard.
- `/backend`: Isolated backend service for this portal.
- `/schoolsync-...`: Mobile application (Expo) for the management experience.

---
*Cornerstone SchoolSync - Streamlining school operations through intelligence.*
