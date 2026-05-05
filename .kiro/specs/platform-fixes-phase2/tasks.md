# Platform Fixes — Phase 2 Tasks

All tasks below are ordered by priority. Each task has a clear scope, affected files, and done criteria.

---

## BLOCK A — GetStream Chat (Highest Priority)

### A1 — Update STREAM_API_KEY across codebase to n9v8bfwy45pn
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT_-Backend-/config/env.js` — default fallback key
- `OP-CS_CONNECT/academics/src/lib/streamClient.js` — FALLBACK_API_KEY
- `OP-CS_CONNECT/src/lib/streamClient.js` — FALLBACK_API_KEY

**Done when:** All hardcoded references to `h8334x6zj8ze` replaced with `n9v8bfwy45pn`

---

### A2 — Provision 15 demo GetStream users (3 per role)
**Status:** TODO  
**Demo accounts to create in GetStream (app ID: 1568723):**

| Role | Email | Password | GetStream User ID |
|------|-------|----------|-------------------|
| Student | student@schoolsync.edu | student123 | student_1 |
| Student | student2@schoolsync.edu | student123 | student_2 |
| Student | student3@schoolsync.edu | student123 | student_3 |
| Teacher | teacher@schoolsync.edu | teacher123 | teacher_1 |
| Teacher | teacher2@schoolsync.edu | teacher123 | teacher_2 |
| Teacher | teacher3@schoolsync.edu | teacher123 | teacher_3 |
| Admin | admin@schoolsync.edu | admin123 | admin_1 |
| Admin | admin2@schoolsync.edu | admin123 | admin_2 |
| Admin | admin3@schoolsync.edu | admin123 | admin_3 |
| Driver | driver@schoolsync.edu | driver123 | driver_1 |
| Driver | driver2@schoolsync.edu | driver123 | driver_2 |
| Driver | driver3@schoolsync.edu | driver123 | driver_3 |
| Parent | parent@schoolsync.edu | parent123 | parent_1 |
| Parent | parent2@schoolsync.edu | parent123 | parent_2 |
| Parent | parent3@schoolsync.edu | parent123 | parent_3 |

**Backend:** Add these 15 users to `bootstrapDefaults.js`  
**Done when:** All 15 accounts exist in Firebase + GetStream users provisioned on first login

---

### A3 — Fix CommunicationHub real-time messaging
**Status:** TODO  
**Problem:** Messages load once on mount, no real-time updates. Channel setup may fail if GetStream user not provisioned.  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/AcademicPortal/shared/CommunicationHub.jsx`
- `OP-CS_CONNECT/academics/src/hooks/useStreamChat.js`

**Fix:**
- Subscribe to channel events after connecting
- Handle connection errors gracefully with retry
- Show proper empty state when no messages

**Done when:** Two users can send/receive messages in real time

---

### A4 — Fix NexusHub club chat + voice/video calls
**Status:** TODO  
**Problem:** Club chat uses hardcoded backend URL instead of shared `streamClient.js`. Voice/video call overlay shows but no actual WebRTC connection.  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/AcademicPortal/shared/NexusHub.jsx`

**Fix:**
- Replace hardcoded `fetch('https://op-cs-connect-backend-vym7.onrender.com/api/school/stream-token...')` with `createUserToken()` from streamClient
- For calls: implement basic WebRTC via GetStream's video SDK or show "Coming Soon" honestly instead of fake UI

**Done when:** Club chat sends/receives messages. Calls either work or show honest "Coming Soon" state.

---

## BLOCK B — Missing Backend Routes

### B1 — Add /api/fees/:feeId/send-reminder endpoint
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT_-Backend-/routes/feesRoutes.js`

**What it should do:**
- Look up the fee record and the student
- Create a notification for the student (via `/api/notifications` POST internally)
- Emit a socket event to the student's room
- Return `{ success: true, message: 'Reminder sent' }`

**Frontend fix:**
- `OP-CS_CONNECT/academics/src/pages/AdminPortal/AdminFees.jsx` — wire the button to call `POST /api/fees/:feeId/send-reminder`

**Done when:** Clicking "Send Reminder" creates a notification visible in the student's notification center

---

### B2 — Add /api/teacher/notifications routes
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT_-Backend-/routes/teacherRoutes.js`

**Endpoints needed:**
- `GET /api/teacher/notifications?page=&limit=` — list notifications created by this teacher
- `POST /api/teacher/notifications` — create notification for a student/class
- `GET /api/teacher/notifications/unread-count` — count of unread notifications sent to teacher

**Done when:** NotificationCenter page loads real data and can create triggers

---

### B3 — Add /api/teacher/messages/quick + /api/teacher/message-templates
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT_-Backend-/routes/teacherRoutes.js`

**Endpoints needed:**
- `GET /api/teacher/message-templates` — list saved message templates for this teacher
- `POST /api/teacher/message-templates` — save a new template
- `POST /api/teacher/messages/quick` — send a message to a student or class (creates a notification + socket event)

**Done when:** QuickMessenger can load templates and send messages that appear in recipient's notification center

---

### B4 — Add /api/exams routes
**Status:** TODO  
**Affected files:**
- Create `OP-CS_CONNECT_-Backend-/routes/examRoutes.js`
- Register in `OP-CS_CONNECT_-Backend-/app.js`

**Endpoints needed:**
- `GET /api/exams` — list exams for user's class
- `POST /api/exams` — create exam (teacher/admin)
- `GET /api/questions` — list question bank
- `POST /api/questions/bulk` — upsert questions
- `POST /api/exams/:examId/attempts` — start attempt
- `PATCH /api/attempts/:attemptId` — finish/update attempt

**Done when:** ExamCenter can create, list, and attempt exams

---

### B5 — Fix assignment grading endpoint path
**Status:** TODO  
**Problem:** `assignmentsService.grade()` calls `/school/assignments/:id/submissions/:studentId/grade` but backend route is `PATCH /school/submissions/:submissionId/grade`  
**Affected files:**
- `OP-CS_CONNECT/academics/src/services/assignmentsService.js`

**Fix:** Change the API path in `grade()` to match the actual backend route

**Done when:** Teacher can grade a submission without 404

---

## BLOCK C — Admin Dashboard & Analytics

### C1 — Wire Admin Dashboard stats to real API calls
**Status:** TODO  
**Problem:** All stat cards show hardcoded 0s. No API calls made.  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/AdminPortal/AdminDashboard.jsx`

**Fix:** On mount, call:
- `GET /api/school/students` → count for total students
- `GET /api/school/teachers` → count for total teachers
- `GET /api/fees?status=paid` → sum for revenue
- `GET /api/school/announcements` → recent activity

**Done when:** Dashboard shows real counts from Firebase

---

### C2 — Wire Admin Analytics to real data
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/AdminPortal/AdminAnalytics.jsx`

**Fix:** Replace hardcoded chart data with API calls to student/attendance/marks endpoints. Aggregate on frontend if no dedicated analytics endpoint exists.

**Done when:** Charts reflect real data, not hardcoded arrays

---

## BLOCK D — Demo Credentials & Login UX

### D1 — Update Quick Login panel to show all 15 demo accounts
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/Common/Login.jsx` — DEMO_PROFILES array
- `OP-CS_CONNECT/academics/src/components/SplashScreen.jsx` — DEMO_PROFILES array

**Fix:** Expand DEMO_PROFILES to show 3 per role (student1/2/3, teacher1/2/3, etc.) in a scrollable grid

**Done when:** All 15 demo accounts visible and clickable in Quick Login

---

### D2 — Embed full login form directly in landing hero (no redirect)
**Status:** TODO  
**Affected files:**
- `OP-CS_CONNECT/academics/landing/src/components/LoginSection.jsx`
- `OP-CS_CONNECT/academics/landing/src/App.jsx`

**Current behaviour:** Clicking a role on the landing page redirects to `/academics/#/login`  
**Required behaviour:** The full login form (email + password + quick role buttons) renders inline in the hero section of the landing page. On successful login, redirect to the correct dashboard.

**Done when:** User never leaves the landing page to log in

---

## BLOCK E — Study Planner AI

### E1 — Connect Study Planner to Cerebras AI backend
**Status:** TODO  
**Problem:** Study Planner generates PDF locally with no AI. The `/student-assistant/study-plan/generate` endpoint exists but isn't called.  
**Affected files:**
- `OP-CS_CONNECT/academics/src/pages/AcademicPortal/Student/StudyPlanner.jsx`

**Fix:** On "Generate Plan" click, call `POST /api/student-assistant/study-plan/generate` with subject, weak chapters, target grade, exam date. Use the AI response to populate the plan before generating PDF.

**Done when:** Study plan content is AI-generated via Cerebras, not hardcoded

---

## Execution Order

```
A1 → A2 → B5 → B1 → B2 → B3 → A3 → A4 → B4 → C1 → C2 → D1 → D2 → E1
```

Start with A1 (key update) since it unblocks all GetStream work. B5 is a 2-line fix. Then backend routes B1-B3 before frontend wiring.
