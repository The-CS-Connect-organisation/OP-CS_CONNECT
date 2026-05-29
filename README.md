
# OP-CS_CONNECT Frontend — Educational ERP

A school management platform that we built as a learning project. We're two students who wanted to see if we could create something that would actually be useful for schools — a dashboard that works for everyone, from students to administrators.

---

## Who It's For

We tried to think of every role in a school and build something for each of them:

| Role | What They Get |
|------|--------------|
| **Students** | AI study plans, grade tracking, bus GPS, club socials, focus mode, interactive avatars |
| **Teachers** | AI-assisted grading, one-tap attendance, lesson plans, class analytics, report cards |
| **Admin** | Full ERP suite — payroll, HR, invoicing, scheduling, AI insights, clinic and IT helpdesk |
| **Coordinator** | Multi-school comparison, zone analytics, compliance dashboards |
| **Driver** | Live route GPS, student boarding scanner, SOS alerts |
| **Parents** | Real-time bus tracking, grades, fees, timetable |
| **Librarian** | Book catalogue, borrow/return tracking, overdue alerts |
| **Manager** | Enterprise control — SIS, HR, finance, transport, auditing, security logs |

---

## What We Used and Learned

- **React at scale** — 200+ components, 140+ routes with lazy loading and code splitting to keep the bundle small
- **State management** — Zustand for simple, persistent state without Redux boilerplate
- **Styling** — Tailwind CSS with custom glassmorphism, dark/light modes, and Radix UI primitives
- **Animations** — Framer Motion for micro-interactions, GSAP for landing page sequences
- **3D elements** — Three.js with React Three Fiber (we were curious and it was fun)
- **Data visualization** — Recharts for charts across manager and admin dashboards
- **AI integration** — Frontend talks to our backend AI handlers for chat, essay grading, and study planners
- **Avatars** — react-peeps for customizable SVG profile pictures

---

## Project Structure

```
src/
├── components/
│   ├── ai/              # AI Chat Panel
│   ├── layout/          # Sidebar, TopBar, DashboardLayout, ResponsiveShell
│   └── ui/              # Buttons, Cards, Dialogs, Charts, PeepAvatarMaker
├── lib/
│   ├── api.ts           # Backend API client
│   ├── store.ts         # Zustand stores (auth, theme, notifications)
│   └── utils.ts         # Tailwind merging, formatting
├── pages/
│   ├── auth/            # Login flows
│   ├── student/         # 25+ student pages
│   ├── teacher/         # 15+ teacher pages
│   ├── admin/           # 40+ admin pages
│   ├── manager/         # 30+ manager pages
│   └── shared/          # AILab, CommunicationHub
├── App.tsx              # 140+ lazy-loaded routes with role-based guards
├── main.tsx             # Entry point
└── index.css            # Tailwind directives and global styles
```

---

## Quick Start

```bash
git clone <your-repo-url>
cd OP-CS_CONNECT

npm install

# Set up .env with the API URL
# VITE_API_URL=https://your-backend-url/api

npm run dev     # Opens on http://localhost:5173
npm run build   # Production build
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | aarav@eduvault.ai | demo1234 |
| Teacher | rajesh@eduvault.ai | demo1234 |
| Admin | meera@eduvault.ai | demo1234 |
| Coordinator | vikram@eduvault.ai | demo1234 |
| Driver | raju@eduvault.ai | demo1234 |
| Parent | parent@eduvault.ai | demo1234 |
| Librarian | librarian@eduvault.ai | demo1234 |
| Manager | manager@eduvault.ai | demo1234 |

---

## Tech Stack

```
Frontend         → React 18 + TypeScript + Vite
Styling          → Tailwind CSS
Animations       → Framer Motion + GSAP
3D Graphics      → Three.js + @react-three/drei
Charts           → Recharts
State            → Zustand
Routing          → React Router DOM v6
UI Primitives    → Radix UI
Icons            → Lucide React
Avatars          → react-peeps
```

---

## A Note From Us

This started as a learning project — two students who wanted to build something real instead of just following tutorials. We made mistakes, rewrote things, and learned a ton along the way. It's not perfect, but we're proud of what we built and we hope it can be useful to someone.

If you find bugs or have ideas, we'd genuinely love to hear them. We're still learning.

---

Designed with love by **Navaneeth Nalabothu** and **Rishith Manchala**
Powered by AI
