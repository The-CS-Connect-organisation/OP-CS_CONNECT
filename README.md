
# 🎓 EduVault AI - School Management ERP

> Next-generation AI-powered School Management ERP System with 5 distinct user dashboards, real-time features, and cutting-edge UI/UX.

## ✨ Features

### 5 User Dashboards
- 🎒 **Student** - GPA tracking, AI study plans, assignments, attendance, fees
- 👨‍🏫 **Teacher** - Class management, AI grading, attendance, analytics
- 🏫 **Admin** - School overview, user management, finance, AI insights
- 🌐 **Coordinator** - Multi-school comparison, compliance, zone analytics
- 🚌 **Driver** - Route management, student boarding, GPS tracking, SOS

### AI Features (Powered by Cerebras + Gemini)
- 🧠 AI Study Plan Generator
- 📝 AI Essay Grading
- 📊 AI Performance Analysis
- 🔔 Smart Notifications
- 🗺️ AI Route Optimization
- 📈 AI Attendance Anomaly Detection
- 💬 AI Chat Assistant (every dashboard)

### Design
- 🌙 Dark Mode + ☀️ Light Mode toggle
- ✨ Glassmorphism + gradient accents
- 🎭 Framer Motion animations everywhere
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Violet/Indigo/Fuchsia design system

## 🚀 Quick Start

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔑 Demo Login

Select any role on the login page and click "Sign In" - no real credentials needed!

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State**: Zustand (persisted)
- **AI**: Cerebras API + Gemini API
- **Backend**: Firebase (Auth + Realtime DB + Storage)
- **Chat**: Stream Chat SDK

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ai/          # AI Chat Panel
│   │   ├── layout/      # Sidebar, TopBar, DashboardLayout
│   │   └── ui/          # Button, Card, Avatar, Badge, Progress
│   ├── lib/
│   │   ├── ai.ts        # AI service (Cerebras + Gemini)
│   │   ├── firebase.ts  # Firebase config
│   │   ├── mock-data.ts # Rich demo data
│   │   ├── store.ts     # Zustand stores
│   │   └── utils.ts     # Utility functions
│   ├── pages/
│   │   ├── auth/        # Login
│   │   ├── student/     # Student Dashboard
│   │   ├── teacher/     # Teacher Dashboard
│   │   ├── admin/       # Admin Dashboard
│   │   ├── coordinator/ # Coordinator Dashboard
│   │   └── driver/      # Driver Dashboard
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                 # API keys
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🔐 Environment Variables

All API keys are pre-configured in `.env`:
- Firebase (Auth, Realtime DB, Storage)
- Cerebras API (AI inference)
- Gemini API (AI inference)
- Stream Chat (Real-time messaging)

---

Built with ❤️ by Navaneeth | Powered by AI
