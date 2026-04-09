# SchoolSync - AI First School Management

Production-ready school management platform with role-based access, AI tutoring features, and real-time communication.

## Tech Stack

- Frontend: React + Vite + Tailwind
- Backend: Express + MongoDB + Mongoose
- Auth: JWT + role middleware
- AI: OpenRouter (`openai/gpt-4o` default, configurable per request)
- Realtime: Socket.IO
- Validation: Zod on request payloads

## Environment

Create `.env`:

```env
OPENROUTER_API_KEY=...
MONGODB_URI=...
JWT_SECRET=...
PORT=5000
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run

- `npm install`
- `npm run dev` (frontend)
- `npm run dev:api` (backend)
- `npm run seed:api` (seed fake school data)

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)
- `GET /auth/health`

### AI Features (Bearer token required)

- `POST /ai/doubt-solver` (supports `stream: true` SSE)
- `POST /ai/study-planner`
- `POST /ai/grade-predictor`
- `POST /ai/assignment-feedback`
- `POST /ai/summary-generator` (`multipart/form-data`, `pdf` file)
- `POST /ai/quiz-generator`
- `POST /ai/attendance-insights`

All AI calls are logged to MongoDB (`AIInteraction`) with prompt, response, usage, model, and timestamp.

### School Features (Bearer token + role checks)

- Classes: `POST /school/classes`
- Student profiles: `POST /school/students/profiles`, `GET /school/students`
- Teacher profiles: `POST /school/teachers/profiles`
- Assignments:
  - `POST /school/assignments` (teacher/admin)
  - `GET /school/assignments`
  - `POST /school/assignments/:assignmentId/submissions` (student)
  - `PATCH /school/submissions/:submissionId/grade` (teacher/admin)
- Attendance:
  - `POST /school/attendance`
  - `GET /school/attendance/:studentId/report?month=4&year=2026&format=csv`
- Announcements:
  - `POST /school/announcements`
  - `GET /school/announcements`
- Messaging:
  - `POST /school/messages`
  - `PATCH /school/messages/:messageId/read`
- Marks & report cards:
  - `POST /school/marks`
  - `GET /school/report-cards/:studentId`
- Leaderboard: `GET /school/leaderboard/:classId`
- Timetable: `PUT /school/timetables` (includes clash detection)

## Security & Quality

- Secrets from `.env`
- Centralized error handler with Mongo error logging
- Auth route rate limiting
- Pagination on list endpoints
- Input validation with Zod
- Helmet, CORS, and request logging with Morgan

## PWA

- Manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js`
- Offline cache baseline for installability and timetable/notices viewing patterns
