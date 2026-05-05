# Platform Fixes — Phase 2 Tasks

Last updated: May 5, 2026  
Legend: ✅ Done | 🔄 In Progress | ⏳ Pending

---

## BLOCK A — GetStream Chat

### ✅ A1 — Update STREAM_API_KEY to n9v8bfwy45pn everywhere
**Completed:** May 5, 2026  
**What was done:**
- `OP-CS_CONNECT_-Backend-/config/env.js` — default fallback updated
- `OP-CS_CONNECT/academics/src/lib/streamClient.js` — FALLBACK_API_KEY updated
- `OP-CS_CONNECT/src/lib/streamClient.js` — FALLBACK_API_KEY updated
- `OP-CS_CONNECT/management/src/lib/streamClient.js` — updated
- Deleted all deeply nested duplicate folders (`academics/academics/academics/...` 9 levels deep) — hundreds of dead files removed

---

### ✅ A2 — Provision 15 demo GetStream users (3 per role)
**Completed:** May 5, 2026  
**What was done:**
- `OP-CS_CONNECT_-Backend-/seed/bootstrapDefaults.js` — rewritten with 15 demo users:

| Role | Accounts |
|------|----------|
| Student | student@, student2@, student3@schoolsync.edu |
| Teacher | teacher@, teacher2@, teacher3@schoolsync.edu |
| Admin | admin@, admin2@, admin3@schoolsync.edu |
| Driver | driver@, driver2@, driver3@schoolsync.edu |
| Parent | parent@, parent2@, parent3@schoolsync.edu |

- Bootstrap version bumped to `v2` so it re-runs on next Render deploy and creates the new accounts
- Each user is provisioned in GetStream via `serverClient.upsertUser()` on creation
- All passwords: `[role]123` (e.g. `student123`, `admin123`)

---

### ✅ A3 — Fix CommunicationHub real-time messaging
**Completed:** May 5, 2026  
**What was done:**
- `CommunicationHub.jsx` — removed broken `isMongoId()` check that was blocking API calls (Firebase IDs are not UUIDs)
- Contacts now load from `GET /school/users` instead of broken teacher/student profile endpoints
- `useApi` now correctly activates whenever user has a token + ID
- ChatModal was already solid — real-time events, typing indicators, file uploads all wired correctly

---

### ✅ A4 — Fix NexusHub club chat
**Completed:** May 5, 2026  
**What was done:**
- `NexusHub.jsx` — replaced hardcoded `fetch('https://op-cs-connect-backend-vym7.onrender.com/api/school/stream-token...')` with shared `createUserToken()` from `streamClient.js`
- Removed unused `StreamChat` direct import
- Club chat now uses the same token flow as CommunicationHub

**Note on calls:** Voice/video call overlay in NexusHub is UI-only (no WebRTC). This is a known limitation — real WebRTC calls require a separate video SDK integration (tracked separately).

---

## BLOCK B — Missing Backend Routes

### ✅ B1 — Add /api/fees/:feeId/send-reminder endpoint
**Completed:** May 5, 2026  
**What was done:**
- `OP-CS_CONNECT_-Backend-/routes/feesRoutes.js` — added `POST /:feeId/send-reminder`
  - Validates fee exists and is not already paid
  - Creates a notification record for the student
  - Emits `notification:new` socket event to student's room
  - Tracks `last_reminder_sent_at` and `reminder_count` on the fee record
- `OP-CS_CONNECT/academics/src/pages/AdminPortal/AdminFees.jsx` — **fully rewritten**
  - Now loads real fee data from `GET /api/fees`
  - Stats (collected, pending, overdue, collection rate) calculated from real data
  - Send Reminder button calls `POST /api/fees/:id/send-reminder` with loading state

---

### ✅ B2 — Teacher notifications routes
**Status:** Already existed in backend  
**Verified:** `teacherController.js` exports `createNotification`, `getMyNotifications`, `getUnreadNotificationCount`, `checkAutomatedNotifications` — all wired in `teacherRoutes.js`

---

### ✅ B3 — Teacher messages/quick + message-templates routes
**Status:** Already existed in backend  
**Verified:** `teacherController.js` exports `getMessageTemplates`, `createMessageTemplate`, `sendQuickMessage` — all wired in `teacherRoutes.js`

---

### ✅ B4 — Assignment grading endpoint path fix
**Completed:** May 5, 2026  
**What was done:**
- `OP-CS_CONNECT/academics/src/services/assignmentsService.js` — fixed `grade()` method
  - Was calling: `POST /school/assignments/:id/submissions/:studentId/grade` (wrong, 404)
  - Now calls: `GET /school/assignments/:id/submissions` to find submission ID, then `PATCH /school/submissions/:submissionId/grade` (correct)

---

### ⏳ B5 — Add /api/exams routes
**Status:** Pending  
**What's needed:**
- Create `OP-CS_CONNECT_-Backend-/routes/examRoutes.js`
- Endpoints: `GET /api/exams`, `POST /api/exams`, `GET /api/questions`, `POST /api/questions/bulk`, `POST /api/exams/:examId/attempts`, `PATCH /api/attempts/:attemptId`
- Register in `app.js`

---

## BLOCK C — Admin Dashboard & Analytics

### ✅ C1 — Wire Admin Dashboard stats to real API calls
**Completed:** May 5, 2026  
**What was done:**
- `OP-CS_CONNECT/academics/src/pages/AdminPortal/AdminDashboard.jsx` — rewritten
  - Calls `GET /school/users` → counts students, teachers, parents
  - Calls `GET /fees` → sums paid fees for revenue stat
  - Calls `GET /school/announcements` → recent activity feed
  - All stats now live data, no hardcoded zeros

---

### ⏳ C2 — Wire Admin Analytics to real data
**Status:** Pending  
**What's needed:**
- Replace hardcoded chart arrays in `AdminAnalytics.jsx` with API calls
- Aggregate attendance/marks data on frontend

---

## BLOCK D — Demo Credentials & Login UX

### ✅ D0 — Fix demo credential emails to match Firebase accounts
**Completed:** May 5, 2026  
**What was done:**
- `Login.jsx` — `alex@` → `student@`, `james@` → `teacher@`
- `SplashScreen.jsx` — same corrections
- `DemoCredentialsPanel.jsx` — same corrections
- `LoginSection.jsx` — roleMap updated to match new emails

---

### ⏳ D1 — Update Quick Login panel to show all 15 demo accounts
**Status:** Pending  
**What's needed:**
- Expand `DEMO_PROFILES` in `Login.jsx` and `SplashScreen.jsx` to show 3 per role
- Scrollable grid layout for 15 accounts

---

### ⏳ D2 — Embed full login form directly in landing hero (no redirect)
**Status:** Pending  
**What's needed:**
- `LoginSection.jsx` — render full login form inline instead of redirecting to `/academics/#/login`
- On success, redirect to correct dashboard

---

## BLOCK E — Study Planner AI

### ⏳ E1 — Connect Study Planner to Cerebras AI backend
**Status:** Pending  
**What's needed:**
- `StudyPlanner.jsx` — call `POST /api/student-assistant/study-plan/generate` on "Generate Plan"
- Use AI response to populate plan content before PDF generation

---

## Previously Fixed (Phase 1 Criticals)

| Fix | Status |
|-----|--------|
| demo_otp removed from production | ✅ |
| /seed-demo-users requires admin auth | ✅ |
| Bootstrap runs once via Firebase flag | ✅ |
| Double Socket.IO handler eliminated | ✅ |
| signToken accepts expiresIn param | ✅ |
| generalLimiter dead admin skip removed | ✅ |
| Auth token key unified to sms_auth_token | ✅ |
| ProtectedRoute uses Navigate not window.location | ✅ |
| autoLoginInProgress dead state removed | ✅ |
| error state cleared on successful login | ✅ |
| /api/notifications route created | ✅ |
| Stream API key sourced from backend token response | ✅ |
| Dead aiService.js and firebaseService.js deleted | ✅ |
| academics/src/hooks/useAuth.js — removed initializeApp | ✅ |
| academics/src/data/seedData.js deleted | ✅ |
| Demo credential emails fixed (alex→student, james→teacher) | ✅ |

---

## Remaining Work Summary

| Task | Priority |
|------|----------|
| B5 — Exams routes | High |
| C2 — Admin Analytics real data | Medium |
| D1 — 15 accounts in Quick Login | Medium |
| D2 — Embed login in landing hero | Medium |
| E1 — Study Planner AI | Low |
