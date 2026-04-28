# Cornerstone SchoolSync: Independent Portal Split

This repository contains two completely independent, standalone applications for the Cornerstone school management system.

## 📁 Directory Structure
- **`academics/`**: The Academic Portal (Students & Teachers).
- **`management/`**: The Management Portal (Admins & Parents).
- **`backend/`**: Refrence copy of the core backend infrastructure.
- **`supabase_schema.sql`**: Database reference file.

---

## 🚀 Getting Started

Since these are two independent projects, you must install and run them separately:

### 🎓 Academics Portal
1. `cd academics`
2. `npm install`
3. `npm run dev`  *(Runs on http://localhost:5173)*

### 🏢 Management Portal
1. `cd management`
2. `npm install`
3. `npm run dev`  *(Runs on http://localhost:5174)*

## 🛠️ Port Setup
- **Academics**: Port 5173
- **Management**: Port 5174

This allows you to run both portals simultaneously for a full-system development experience.

---
**Note**: Each folder contains its own `.env` file and `backend` directory to ensure full isolation.
