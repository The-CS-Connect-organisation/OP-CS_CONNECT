
# 🎓 EduVault AI — Cornerstone International School ERP

> **The most insane, AI-powered, multi-role School Management Platform you will ever lay your eyes on.**  
> Built by a single developer (yes, one person) who decided that schools deserved NASA-level tech, not 1990s PHP spreadsheets.

---

## 🚀 Who Is This For?

This platform was built for **every single person in a school ecosystem**:

| Role | Why They'll Love It |
|------|-------------------|
| 🎒 **Students** | AI study plans, grade tracking, bus GPS, club socials, focus mode, dope achievements |
| 👨‍🏫 **Teachers** | AI grading, attendance with one tap, lesson plans, class analytics, auto report cards |
| 🏫 **Admin** | Full ERP (payroll, HR, invoicing, scheduling), AI insights, lost & found, clinic, IT helpdesk |
| 🌐 **Coordinator** | Multi-school comparison, zone analytics, compliance dashboards |
| 🚌 **Driver** | Route GPS, student boarding scanner, SOS alerts, digital fridge for lunches |
| 👪 **Parent** | Real-time bus tracking, grades, fees, timetable — no more WhatsApp groups |
| 📚 **Librarian** | Book catalogue, borrow/return tracking, overdue alerts, supply management |
| 💼 **Manager** | Full enterprise control — SIS, HR, finance, transport, exams, auditing, security logs |

---

## 🧠 What Did I Learn Building This?

Everything. **Literally everything.**

- **React at scale** — 200+ components, 150+ routes, zero crashes. Zustand for state, React Router for navigation, lazy loading for perf.
- **TypeScript sorcery** — generics, discriminated unions, mapped types across 4-phase architecture.
- **Tailwind CSS mastery** — custom violet/indigo/fuchsia design system, glassmorphism, dark/light modes, responsive across every breakpoint.
- **Framer Motion** — micro-interactions on every card, button, modal, page transition. Butter-smooth 60fps.
- **Three.js + React Three Fiber** — 3D elements that make the UI feel like a sci-fi film.
- **GSAP** — scroll-triggered animations on the landing page that competitors can only dream of.
- **Radix UI primitives** — accessible, headless, unstyled components (dialog, dropdown, select, tooltip, tabs, etc.)
- **AI integration** — Cerebras API + Gemini API powering study plans, essay grading, performance analysis, and a chatbot in every dashboard.
- **Firebase** — realtime database for live sync, auth for secure login, storage for assets.
- **Stream Chat** — real-time messaging between students, teachers, parents, and admins.
- **Recharts** — 25+ chart types across dashboards (line, bar, radar, pie, area, composition).
- **Architecture** — designed 4 phases of features across 8 user roles with 5+ route modules each. Enterprise-grade folder structure.
- **Awwwards-grade landing** — scroll-linked animations, video previews, 3D hero, drag-to-continue auth flow.
- **Performance** — code splitting, lazy routes, memo'd components, optimized re-renders, Vite bundling.

---

## ✨ What Makes This Special?

- **8 distinct dashboards** — Student, Teacher, Admin, Coordinator, Driver, Parent, Librarian, Manager. Each with *completely custom* UI, navigation, and feature set.
- **150+ routes** — more pages than most SaaS startups shipping with 20-person teams.
- **AI everywhere** — essay grader, study planner, anomaly detection, performance predictor, and a chat assistant that knows context.
- **Real-time** — bus GPS, messaging, notifications, collaboration. Everything syncs instantly.
- **Glassmorphism design system** — dark mode, light mode, custom scrollbars, gradient accents, glow effects.
- **3D elements** — Three.js integrated into React without sacrificing perf.
- **Zero backend latency** — Firebase realtime database means data flows instantly.
- **Demo-ready** — seed data with 12 users across all roles, sample grades, assignments, bus routes, clubs, and more.

---

## 📸 Feature Highlights

| Feature | What It Does |
|---------|-------------|
| AI Study Planner | Generates personalized study schedules based on grades & deadlines |
| AI Essay Grader | Scores submissions with feedback in seconds |
| Bus GPS Tracking | Live map view, route stops, student boarding |
| Social Clubs | Club feeds, posts, likes, comments, member management |
| Achievements | Peer-to-peer recognition with likes & comments |
| Digital Fridge | Parents track what their kids ate for lunch |
| Focus Mode | Pomodoro timer + block distractions + ambient sounds |
| Daily Briefing | AI-curated morning summary of schedule, weather, events |
| Classroom Module | Lesson plans, exercises, room bookings, bell schedules |
| Full ERP | Chart of accounts, budgets, invoices, payments, expenses, POs |
| Anonymous Reports | Students report issues without revealing identity |
| Lost & Found | Digital lost property with photo uploads |
| Clinic Module | Health records, nurse visits, medicine tracking |
| IT Helpdesk | Ticket system for tech support requests |

---

## 🛠️ Tech Stack

```
Frontend         → React 18 + TypeScript + Vite
Styling          → Tailwind CSS + Custom Glassmorphism Design System
Animations       → Framer Motion + GSAP + CSS Animations
3D Graphics      → Three.js + React Three Fiber + @react-three/drei
Charts           → Recharts (25+ chart types)
State            → Zustand (persisted across sessions)
Routing          → React Router DOM v6 (150+ routes)
Auth             → Firebase Authentication
Database         → Firebase Realtime Database
Storage          → Firebase Cloud Storage
AI               → Cerebras API + Gemini API + Groq API
Chat             → Stream Chat SDK + Stream Chat React
UI Primitives    → Radix UI (Avatar, Dialog, Dropdown, Select, Tabs, Tooltip, etc.)
Icons            → Lucide React + React Icons
Forms            → React Hot Toast + CVA + Tailwind Merge
Date Handling    → date-fns
Build Tool       → Vite 5
Bundling         → TypeScript (strict mode) + SWC
Deployment       → Vercel
```

---

## 🏗️ Project Architecture

```
src/
├── components/
│   ├── ai/              # AI Chat Panel (chatbot in every dashboard)
│   ├── awwwards/        # Landing page components (Hero, About, Features, Story, Contact)
│   ├── borrowed-books/  # Library borrowed books tracker
│   ├── hooks/           # Custom React hooks
│   ├── layout/          # Sidebar, TopBar, DashboardLayout, ResponsiveShell, BottomNavBar
│   └── ui/              # Button, Card, Avatar, Badge, Progress, 404 page, GenericPage
├── lib/
│   ├── ai.ts            # AI service client (Cerebras + Gemini + Groq)
│   ├── api.ts           # Backend API client (axios-like fetch wrapper)
│   ├── avatar.ts        # Avatar generation utility
│   ├── firebase.ts      # Firebase config + initialization
│   ├── mock-data.ts     # 1000+ lines of rich demo data
│   ├── nav-config.ts    # Per-role navigation configuration
│   ├── store.ts         # Zustand stores (auth, theme, notifications)
│   └── utils.ts         # Formatting, validation, helper functions
├── pages/
│   ├── auth/            # Animated login with drag-to-continue
│   ├── student/         # 25+ student pages (Dashboard, Assignments, Grades, etc.)
│   ├── teacher/         # 15+ teacher pages (Grading, Analytics, Classroom, etc.)
│   ├── admin/           # 40+ admin pages (ERP, HR, Finance, Scheduling, etc.)
│   ├── manager/         # 30+ manager pages (SIS, Payroll, Audit, Security, etc.)
│   ├── coordinator/     # Coordinator dashboard with multi-school comparison
│   ├── driver/          # Driver dashboard with GPS + SOS
│   ├── parent/          # Parent dashboard with child monitoring
│   ├── librarian/       # Librarian dashboard with catalogue management
│   └── shared/          # CommunicationHub, QuickMessenger, AILab, CSLibrary
├── App.tsx              # 150+ routes, role-based guards, lazy loading
├── main.tsx             # Entry point with Providers
└── index.css            # Tailwind directives + custom glassmorphism styles
```

---

## 🚀 Quick Start

```bash
# Clone & go
git clone <your-repo-url>
cd OP-CS_CONNECT

# Install everything
npm install

# Drop your .env with Firebase + Cerebras + Gemini + Groq keys
# (see .env.example for the schema)

# Launch dev server
npm run dev

# Open http://localhost:5173 — instant dashboard access
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🎒 Student | aarav@eduvault.ai | demo1234 |
| 👨‍🏫 Teacher | rajesh@eduvault.ai | demo1234 |
| 🏫 Admin | meera@eduvault.ai | demo1234 |
| 🌐 Coordinator | vikram@eduvault.ai | demo1234 |
| 🚌 Driver | raju@eduvault.ai | demo1234 |
| 👪 Parent | parent@eduvault.ai | demo1234 |
| 📚 Librarian | librarian@eduvault.ai | demo1234 |
| 💼 Manager | manager@eduvault.ai | demo1234 |

**No setup required.** Just select any role on the login page and you're in. The app seeds everything automatically.

---

## 🔐 Environment Variables

| Variable | What It Powers |
|----------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase Auth + DB + Storage |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime DB endpoint |
| `VITE_CEREBRAS_API_KEY` | AI inference (study plans, grading) |
| `VITE_GEMINI_API_KEY` | AI inference (chat, analysis) |
| `VITE_GROQ_API_KEY` | AI inference (fallback, experiments) |
| `VITE_STREAM_API_KEY` | Real-time chat SDK |

---

## 🌙 What Makes the UI Special?

- Dual theme (dark/light) with persistent preference
- Glassmorphism cards with backdrop blur + gradient borders
- Custom scrollbars (thin, themed)
- Animated page transitions via Framer Motion
- Responsive from 320px to 4K
- Bottom nav bar on mobile, sidebar on desktop
- Real-time notification badges with auto-update
- 3D decorative elements (Three.js) that don't tank performance
- Every button, card, and modal has micro-interactions

---

## 🧪 Design Philosophy

> "If a student can open this and feel like they're in a sci-fi movie, I've done my job."

- **Every pixel matters** — no default UI anywhere. Every component is custom-styled.
- **Role-first architecture** — each role gets *exactly* what they need, nothing they don't.
- **Speed is a feature** — lazy loading, code splitting, memoization. First load is instant.
- **AI-native** — AI isn't tacked on, it's baked into every dashboard as a first-class citizen.
- **Offline-resilient** — Zustand persistence means you don't lose state on refresh.

---

## 📈 By the Numbers

- **~200** React components
- **150+** routes across 8 roles
- **4** architecture phases (ERP Core → Advanced → Enterprise → Platform)
- **59+** backend API route modules consumed
- **25+** chart types rendered
- **3** AI providers (Cerebras, Gemini, Groq)
- **1** developer

---

## 🏆 Awards-Worthy Landing Page

The landing page (`/`) is built to Awwwards standards:
- Scroll-linked animations via GSAP
- 3D hero section via React Three Fiber
- Video preview with play-on-scroll
- Drag-to-continue auth flow
- Animated feature cards with staggered reveals
- Parallax story section
- Fully responsive + performance-optimized

---

## 📄 License & Attribution

Built with ❤️ by **Navaneeth**  
Powered by Cerebras, Gemini, Groq, Firebase, and way too much coffee.  
**Not affiliated with any school.** This is a showcase of what one developer can do.

---

> *"The best time to build an ERP was 20 years ago. The second best time is now."*

---

Designed with love by **Navaneeth Nalabothu** and **Rishith Manchala**  
Powered by AI
