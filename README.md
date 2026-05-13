# SchoolSync - AI First School Management

Production-ready school management platform with role-based access, AI tutoring features, and real-time communication.

## Tech Stack

- **Frontend**: React + Vite + Tailwind
- **Backend**: Express + Firebase Realtime Database
- **Auth**: JWT + role middleware
- **AI**: OpenRouter / Groq / Cerebras (configurable)
- **Realtime**: Socket.IO
- **Database**: Firebase Realtime Database

## Architecture

The app uses a **REMOTE_API** data mode - all data comes from Firebase via the backend API. Nothing is hardcoded.

### User Roles
- **Student**: Dashboard, timetable, assignments, grades, attendance, AI lab
- **Teacher**: Class management, grading, attendance, analytics, notes
- **Parent**: Child's grades, attendance, fees, communications
- **Admin**: Full system control, user management, analytics
- **Driver**: Bus tracking, route management

## Environment

Frontend uses hardcoded API URL for GitHub Pages deployment:
```
https://op-cs-connect-backend-vym7.onrender.com/api
```

## Running

### Frontend
```bash
cd OP-CS_CONNECT
npm install
npm run dev  # or npm run build for production
```

### Backend
```bash
cd OP-CS_CONNECT_-Backend-
npm install
npm start  # Runs on port 5000
```

## Re-Seeding Firebase Data

To regenerate seed data (e.g., after upgrading seed version):

1. Open Firebase Console → Realtime Database
2. Navigate to `_meta/seed_v100_done`
3. Delete this key
4. Restart backend server - it will auto-seed fresh data

## API Overview

Base URL: `/api`

### Auth
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (Bearer token)
- `POST /auth/password-reset` - Request OTP
- `POST /auth/reset-password` - Reset with token

### School Features (Bearer token + role checks)
- `GET /school/classes` - List all classes
- `POST /school/classes` - Create class (admin)
- `GET /school/students` - List students
- `GET /school/students/:id/profile` - Expanded student profile
- `GET /school/teachers` - List teachers
- `POST /school/assignments` - Create assignment (teacher)
- `GET /school/assignments` - List assignments
- `POST /school/assignments/:id/submissions` - Submit (student)
- `PATCH /school/submissions/:id/grade` - Grade (teacher)
- `POST /school/attendance` - Mark attendance
- `GET /school/attendance/:studentId/report` - Attendance report
- `POST /school/announcements` - Create announcement
- `GET /school/announcements` - List announcements
- `POST /school/messages` - Send message
- `GET /school/messages?otherUserId=` - Get conversation
- `POST /school/marks` - Add marks
- `GET /school/report-cards/:studentId` - Report card
- `GET /school/leaderboard/:classId` - XP leaderboard
- `GET /school/timetables?classId=` - Timetable

### AI Features
- `POST /ai/chat` - AI chat with context
- `GET /ai/history` - Chat history

### Gamification
- `POST /gamification/xp` - Award XP
- `GET /gamification/stats/:studentId` - Student stats
- `GET /gamification/leaderboard/:classId` - Class leaderboard

### Student Assistant
- `POST /student-assistant/doubts/resolve` - AI doubt solving
- `POST /student-assistant/study-plan/generate` - Generate study plan
- `POST /student-assistant/flashcards/generate` - Generate flashcards
- `POST /student-assistant/practice-tests/generate` - Generate test

## Security

- JWT authentication with role-based access
- Rate limiting (general + auth endpoints)
- Input validation with Zod
- Helmet security headers
- CORS configured for deployed frontend
- Firebase security rules for production

## PWA

- Manifest: `public/manifest.webmanifest`
- Installable on mobile devices
- Offline support for basic features