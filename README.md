# 🎓 Cornerstone SchoolSync: Advanced School Management Ecosystem

Welcome to **Cornerstone SchoolSync**, a comprehensive, AI-integrated school management system designed for modern educational institutions. This project features a split-portal architecture, providing specialized experiences for students, parents, teachers, and administrators.

---

## 🏗️ Architecture Overview

SchoolSync is built with a **decentralized, portal-based architecture**. Unlike monolithic systems, it splits the application into two independent, standalone portals to ensure performance, security, and specialized user experiences.

### 1. 🎓 Academic Portal (`/academics`)
*   **Target Audience**: Students and Parents.
*   **Purpose**: Focuses on learning management, academic progress tracking, and student-parent-teacher communication.
*   **Key Features**: Student Dashboard, Grade Tracking, Attendance Reports, Timetable View, Fee Management, and an AI-powered Learning Lab.

### 2. 🏢 Management Portal (`/management`)
*   **Target Audience**: Administrators and Teachers.
*   **Purpose**: Focuses on school operations, staff management, academic administration, and institutional analytics.
*   **Key Features**: Admin Dashboard, Teacher Dashboard, User Management (HR), Payroll, Analytics, Announcement System, and Timetable Management.

---

## 🧠 Core AI Integration

SchoolSync leverages **OpenRouter AI** to provide a suite of intelligent tools that enhance the educational experience:

*   **Doubt Solver**: Instant AI-powered assistance for students.
*   **Study Planner**: Personalized study schedules based on student performance and goals.
*   **Grade Predictor**: Analyzes historical data to forecast student outcomes.
*   **Assignment Feedback**: Automated, constructive feedback for teachers to review and share.
*   **Summary Generator**: Extracts key insights from uploaded PDF study materials.
*   **Quiz Generator**: Automatically creates assessments from course content.
*   **Attendance Insights**: Identifies patterns and provides early warnings for at-risk students.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express 5.x |
| **Database** | Supabase (PostgreSQL) |
| **Real-time** | Socket.io |
| **AI Provider** | OpenRouter (LLM Agnostic) |
| **Mobile** | Expo (React Native), Expo Router |
| **Utilities** | Zod (Validation), Multer (File Uploads), JWT (Auth) |

---

## 📁 Unified Project Structure

This project has been reorganized into **three major folders** for clarity and performance:

1.  **`academics/`**: The frontend portal for students and parents.
2.  **`management/`**: The frontend portal for administrators and teachers.
3.  **`backend/`**: The single, unified backend that powers both portals.

```text
.
├── academics/             # Academic Portal (Frontend)
├── management/            # Management Portal (Frontend)
├── backend/               # SINGLE shared backend (Source of Truth)
├── .env.example           # Root environment template
└── supabase_schema.sql    # Central database schema
```

---

## 🚀 Unified Backend Setup

SchoolSync now uses a **Single Shared Backend** located in the root `/backend` folder. Both portals (`/academics` and `/management`) connect to this unified service.

### ⚙️ Step 1: Configure Environment
1. Create a `.env` file in the **root directory**.
2. Use `.env.example` as a template.
3. Once you host your backend, set `VITE_API_BASE_URL` to your production URL in your portal `.env` files.

### 🌐 Step 2: Launch the Backend
1. `cd academics` (or `management`)
2. `npm run dev:api` (This will launch the shared root backend)

### 🎨 Step 3: Launch the Frontends
- **Academics**: `cd academics` -> `npm run dev`
- **Management**: `cd management` -> `npm run dev`

---

## 🗄️ Database Setup

The project uses Supabase. To initialize the database:
1. Create a new Supabase project.
2. Run the SQL commands in `supabase_schema.sql` in the Supabase SQL Editor.
3. Update the `.env` files in each portal with your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## 📝 License

This project is for educational and institutional management purposes.

---
*Built with ❤️ for Cornerstone SchoolSync.*
