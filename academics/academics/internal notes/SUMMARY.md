# Cornerstone SchoolSync - System Architecture & Overview

This document provides a detailed summary of the Cornerstone SchoolSync platform, its directory structure, and the functionality of its components.

## 📂 Project Structure

The codebase is organized into four main directories:

1.  **[academics](./academics)**: The frontend portal for Students and Parents.
2.  **[Management](./Management)**: The frontend portal for Administrators and Teachers.
3.  **[Backend](./Backend)**: The core API and server-side logic (Express.js).
4.  **[internal notes](./internal%20notes)**: Secure repository for setup files, Supabase schemas, and credentials.

---

## 🎓 1. Academics Portal (`/academics`)
Focused on the learning experience and student-parent interaction.

### 👤 Student Features
- **Dashboard**: Real-time overview of academics, attendance, and upcoming tasks.
- **Timetable**: Weekly class schedule view.
- **Assignments**: View, download, and submit coursework.
- **Attendance**: Detailed tracking of academic presence.
- **Grades**: Performance analytics and report cards.
- **Notes**: Repository for lecture notes and study materials.
- **Fee Management**: View outstanding dues and payment history.
- **AI Lab**: AI-powered study assistance tools.
- **Communication Hub**: Real-time messaging and announcements.
- **Exam Center**: Schedule and performance data for examinations.

### 👪 Parent Features
- **Dashboard**: High-level overview of their child's progress.
- **Attendance & Grades**: Monitoring tools for student performance.
- **Fee Management**: Secure interface for fee oversight.
- **Communication**: Direct channel to school administration and teachers.

---

## 🏢 2. Management Portal (`/Management`)
The administrative backbone for controlling school operations.

### 👑 Admin Features
- **User Management**: Control over student, teacher, and staff accounts.
- **Announcements**: System-wide news and notification broadcasts.
- **Analytics**: Data-driven insights into school performance and attendance.
- **Timetable Manager**: Visual tool for scheduling classes and room allocations.
- **Payroll & HR**: Management of staff salaries, benefits, and records.
- **Fee Control**: Global oversight of school financial records.

### 👨‍🏫 Teacher Features (In Academics Portal)
*Note: Teachers primarily interact with the `academics` portal for classroom management.*
- **Teacher Dashboard**: Class-specific insights and quick actions.
- **Manage Assignments**: Create and distribute tasks.
- **Grade Submissions**: Review and mark student work.
- **Mark Attendance**: Real-time digital roll call.
- **Upload Notes**: Share resources directly with students.

---

## ⚙️ 3. Backend System (`/Backend`)
Powering the entire ecosystem with a robust Express.js API.

### 🚀 Core Technologies
- **Express.js**: High-performance routing and middleware.
- **Socket.io**: Enabling real-time communication for the Chat system.
- **Supabase**: Primary database and authentication provider.
- **Helmet/Morgan**: Security and logging abstractions.

### 🛤️ API Endpoints
- `/api/auth`: User registration, login, and session management.
- `/api/ai`: Integration with AI models for the AI Lab.
- `/api/school`: Core business logic for grades, attendance, and timetables.
- `/api/chat`: Messaging services and real-time event handling.

---

## 🔐 4. Internal Notes (`/internal notes`)
Contains sensitive configuration and technical documentation.
- `ALL_CREDENTIALS.txt`: API keys, database secrets, and environment configurations.
- `supabase_schema.sql`: The definitive database blueprint for replicating the environment.

---

## ✅ System Integrity Status
- **Directory Structure**: Validated and organized into the 4-quadrant model.
- **Build Status (Frontend)**: `academics` and `Management` builds verified successful.
- **Redirects**: Legacy redirect loops resolved; entry points standardized.
