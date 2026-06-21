# OP-CS_CONNECT Master Plan — Full Audit & Fix Roadmap

## 🔍 Complete Bug Catalog (Frontend + Backend)

### Frontend Issues (OP-CS_CONNECT repo)

#### 🔴 CRITICAL — Data Loss / Wrong Values

| # | Issue | Files | Detail | Fixed |
| F1 | **Mark-read uses GET not PUT** | `NotificationCenter.tsx` | `apiFetch('/notifications/${id}', 'GET')` — server ignores PUT-only handler; state reverts on remount | ✓ |
| F2 | **Mark-all-read never calls API** | `NotificationCenter.tsx` | Local state only; no backend call | ✓ |
| F3 | **Optimistic updates, no rollback** | `AdminComms.tsx`, `AdminAnnouncements.tsx`, `AdminFees.tsx` + 20+ pages | `setState` before API responds; on failure, user sees committed data that never persisted | Partial — 15+ files done, ~10 remain |
| F4 | **Silent catch blocks in 40+ files** | All pages | `catch (err) { console.log(err) }` — user never sees failures | ✓ (89 blocks fixed) |
| F5 | **Fallback demo data on API failure** | 10 Manager + 2 Parent pages | On API error, hardcoded mock data injected without user awareness | |
| F6 | **3 different API call patterns** | All pages | `api.method()` vs `apiFetch(...)` vs bare `fetch()` — different error handling, payloads, auth per pattern | Partial — `CSLibrary.tsx` fixed; `teacher/MarkAttendance.tsx` remains |
| F7 | **`from`/`to` vs `startTime`/`endTime`** | `AdminScheduling.tsx`, `TimetableManagement.tsx`, `ManagerScheduling.tsx`, 3 role Timetable pages | 3 different time field conventions sent to same API | ✓ |
| F8 | **`class` vs `className` vs `classId`** | Same timetable files | Same entity referenced with 3 field names | ✓ |
| F9 | **No JWT/bearer token** | `src/lib/api.ts` | Auth relies entirely on `x-user-id` header — any userId can be spoofed via localStorage | ✓ |
| F10 | **Production URL hardcoded** | `src/lib/api.ts:2` | `https://op-csconnect-backend-production.up.railway.app/api` — no dev/staging alternative | ✓ (`VITE_API_BASE`) |
| F11 | **`any[]` types everywhere** | `src/lib/store.ts` | No TypeScript validation on API responses — silent type mismatches | |
| F12 | **No cache invalidation** | `src/lib/store.ts` | Data fetched once per page load via 11 parallel requests, never refreshed | |
| F13 | **AI keys exposed to browser if set** | `src/lib/ai.ts` | `VITE_CEREBRAS_API_KEY`, `VITE_GEMINI_API_KEY` would leak to client-side JS | |
| F14 | **Sensitive PII in localStorage** | Zustand persist | Aadhar numbers, phone numbers, addresses serialized to `eduvault-auth` key | |

#### 🔴 CRITICAL — Finance/Currency

| # | Issue | Files | Detail | Fixed |
| F15 | **Mixed currency: `$` vs `₹` vs `formatCurrency()`** | `AdminFees.tsx`, `AdminFeeInstallments.tsx`, `student/Fees.tsx`, `ManagerFees.tsx` | 3 different currency conventions across fee pages | Partial — `AdminFees.tsx` fixed |
| F16 | **Hardcoded conversion rate 83.5** | `AdminFeeInstallments.tsx` | `amount / 83.5` for "USD Equivalent" — client-side, will become stale | N/A — code no longer exists |
| F17 | **ERP "Money Format" setting is dead** | `AdminERP.tsx` | Saves thousands_sep, decimal_sep, currency_symbol to backend; no page reads them | |
| F18 | **Fee status enums incompatible** | `AdminFees.tsx` vs `student/Fees.tsx` | Admin: `paid/pending/overdue`; Student: `paid/partial/unpaid` | |
| F19 | **Payment mode enums incompatible** | `AdminFees.tsx` vs `student/Fees.tsx` | Admin: `Cash/Cheque/Bank Transfer/Online/DD/Other`; Student: `cash/card/online` | |
| F20 | **Tax computed as flat addition** | `AdminInvoicing.tsx` | `(subtotal + taxAmount)` — not `(subtotal * taxRate / 100)` | ✓ |
| F21 | **Fee installment system is solo** | `AdminFeeInstallments.tsx` | Installment fields (`totalAmount`, `installments`, `frequency`, `downPayment`, `gracePeriod`, `lateFeePercent`) don't exist in any other fee page | |

#### 🟠 HIGH — Scheduling/Timetable

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| F22 | **Period numbers ≠ standard** | `AdminScheduling.tsx` vs `TimetableManagement.tsx` | Admin: `Math.floor(minutesFromStart / 45)`; Management: hardcoded period-to-time map |
| F23 | **Room field: 4 names** | All timetable files | `room`, `roomName`, `roomId`, `location` across different pages |
| F24 | **`api.generateTimetable()` never called by Manager** | `ManagerScheduling.tsx` | Admin calls `POST /scheduling/timetable/generate` with params; Manager never does |
| F25 | **`SELECT * FROM timetable` O(n) crash risk** | `ManagerScheduling.tsx:391` | No WHERE clause — fetches entire timetable table |
| F26 | **AdminScheduling 943-line monolith** | `AdminScheduling.tsx` | One component does: timetable viewing, period management, class selection, subject assignment, teacher assignment, collision detection |
| F27 | **Dead menu item: Generated Timetable** | `Common/AdminSidebar.tsx:410` | Menu feature removed from routing but menu entry remains |

#### 🟠 HIGH — Announcements/Notifications/Messages

| # | Issue | Files | Detail | Fixed |
| F28 | **2 announcement endpoints: `circulars` vs `announcements`** | `AdminAnnouncements.tsx` uses `getCirculars()`; `student/Announcements.tsx` uses `getAnnouncements()` | Same feature, different endpoints | |
| F29 | **CommunicationHub triple overlap** | `CommunicationHub.tsx` | Calls `getMessages()`, `getAnnouncements()`, `getCirculars()` — overlaps every role-specific page | |
| F30 | **`createdAt` vs `date` mismatch** | `NotificationCenter.tsx` vs `student/Notifications.tsx` | Same concept, different field names | N/A — `student/Notifications.tsx` no longer exists |
| F31 | **`message` vs `body` mismatch** | `CommunicationHub.tsx` vs `student/Messages.tsx` | Same concept, different field names | N/A — both use `content` |
| F32 | **`author` vs `authorName` mismatch** | `AdminComms.tsx` vs `CommunicationHub.tsx` | Same concept, different field names | N/A — neither page uses these fields |
| F33 | **Fake random online status** | `CommunicationHub.tsx:187` | `Math.random() > 0.5` — users see fake "online" indicators | N/A — code no longer present |
| F34 | **Student Messages.tsx — no send/receive API** | `student/Messages.tsx` | Uses `api.getUser(memberId)` only; no message API | N/A — already has full API + polling + rollback |
| F35 | **ManagerAnnouncements: mock-only** | `ManagerAnnouncements.tsx` | Hardcoded data, never calls API | ✓ |
| F36 | **ManagerComms: mock-only** | `ManagerComms.tsx` | Hardcoded data, never calls API | ✓ |

#### 🟡 MEDIUM — Student/Teacher/Parent Pages

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| F37 | **Student GPA stale: `user?.gpa`** | `DailyBriefing.tsx`, `Profile.tsx` | Uses initial-load GPA; never refreshed after grade changes | ✓ |
| F38 | **CSLibrary: bare `fetch()`** | `admin/CSLibrary.tsx` | Completely different API access pattern; no auth interceptor | ✓ |
| F39 | **Parent timetable: different field structure** | `parent/Timetable.tsx` | Returns different fields than student/teacher timetable endpoints | |
| F40 | **Teacher MarkAttendance: raw `apiFetch`** | `teacher/MarkAttendance.tsx` | Bypasses `api.*` wrapper | |

#### 🟡 MEDIUM — Admin/Manager Pages (local state, no API)

| # | Issue | Files | Detail | Fixed |
| F41 | AdminFoodService — mock orders, no API | | | |
| F42 | AdminLostFound — local state only | | | ✓ |
| F43 | AdminAnonymousReports — no API | | | ✓ |
| F44 | AdminRoomBooking — local state only | | | |
| F45 | AdminTransport — hardcoded routes | | | |
| F46 | AdminBusAssignment — mock-only | | ManagerBusAssignment also mock-only | |
| F47 | AdminCalendar — local events only | | | |
| F48 | AdminEnrolment — raw `apiFetch` | | | |
| F49 | AdminITHelpdesk — tickets local only | | | ✓ |
| F50 | AdminClinic — mock appointments only | | | ✓ |
| F51 | AdminAthletics — local state only | | | |
| F52 | AdminPortfolio — local state only | | | |
| F53 | AdminFacilities — local state only | | | |
| F54 | AdminSkipBus — local state only | | | ✓ |
| F55 | AdminAssetTracking — local state only | | | |
| F56 | AdminDiscipline — local state only | | | |
| F57 | AdminCounselling — no API | | | |
| F58 | AdminActivities — local state only | | | |

#### 🟢 LOW — Cosmetic/Structural

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| F59 | Hardcoded class lists differ | `AdminScheduling.tsx`, `TimetableManagement.tsx`, `student/Timetable.tsx` | `['6A','6B']` vs `['6-A','6-B']` | ✓ |
| F60 | Duplicate npm dependencies | `package.json` | `moment` + `date-fns`, `react-icons` + `lucide-react`, `motion` + `framer-motion` |
| F61 | No testing framework | `package.json` | Zero test dependencies |
| F62 | No error tracking | — | No Sentry, no error boundary |
| F63 | No offline persistence | `src/lib/store.ts` | In-memory Zustand cache lost on every refresh |
| F64 | FCM VAPID key missing | `.env` | Push notifications silently fail |

---

### Backend Issues (OP-CS_CONNECT_-Backend- repo)

#### 🔴 CRITICAL — Security

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| B1 | **5 API keys exposed in committed `.env`** | `.env` | Firebase DB_SECRET, Cerebras API key, Gemini API key, Groq API key — full read/write DB access exposed |
| B2 | **Plaintext passwords in database** | `src/index.ts` + `src/data/db.json` | Passwords stored as-is under `users/{id}.password`; logged in plaintext on login |
| B3 | **No auth middleware** | `src/index.ts` | Zero routes require valid token; `x-user-id` header is self-attested |
| B4 | **Firebase DB_SECRET in URL query param** | `src/firebase.ts` + `src/index.ts:63-94` | `?auth=${DB_SECRET}` exposed in server logs, request logs, any proxy |
| B5 | **Wildcard CORS + credentials** | `src/index.ts:40-43` | `Access-Control-Allow-Origin: *` + `Access-Control-Allow-Credentials: true` — violates CORS spec |
| B6 | **`.env` not in `.gitignore`** | `.gitignore` | All secrets in git history |
| B7 | **No input validation on any route** | All 212 inline handlers | No zod/joi/express-validator; only presence checks (`if (!x)`) |
| B8 | **Path traversal via Firebase URLs** | All `getData()` calls | `getData(\`users/${req.params.id}\`)` — `../` can access any Firebase path |
| B9 | **Password logged in plaintext** | `src/index.ts:467` | `console.log('[Login] Attempting login with:', { email, password })` |
| B10 | **OTP enumeration (no rate limit)** | `src/index.ts:510-523` | `POST /api/auth/forgot-password` can be spammed for any email |

#### 🔴 CRITICAL — Data Integrity

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| B11 | **Auto-seed wipes DB on every restart** | `src/index.ts:2741-2747` | `seedDatabase()` called on startup — replaces ALL Firebase data with demo data |
| B12 | **Race conditions on read-then-write** | All routes | `getData(path)` → modify → `setData(path, value)` — no atomic operations; concurrent requests cause data loss |
| B13 | **Reset password overwrites entire user** | `src/index.ts:547` | `setData(\`users/${userId}/password\`, newPassword)` — actually writes to wrong path; should be `setData(\`users/${userId}\`, {...user, password})` |
| B14 | **OTP exposed in development responses** | `src/index.ts:528-530` | `otp: process.env.NODE_ENV === 'development' ? otp : undefined` |
| B15 | **Fallback AI response when APIs fail** | `src/index.ts:1659-1669` | Hardcoded canned responses returned silently — user thinks AI is working |
| B16 | **Agent log fire-and-forget on every AI request** | `src/index.ts:1537` | `fetch('http://127.0.0.1:7648/ingest/...').catch(()=>{})` — blocks on network, no error handling |

#### 🟠 HIGH — Architecture/Dead Code

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| B17 | **212 inline route handlers in one file** | `src/index.ts` (2750 lines) | Monolithic `index.ts` handles every route inline; route file architecture is a facade |
| B18 | **59 route files exist but only 32 mounted** | `src/routes/*.ts` | 27 route files (`accolades.ts`, `achievements.ts`, `ai.ts`, `analytics.ts`, `assignments.ts`, `bus.ts`, `chat.ts`, `daily-briefing.ts`, `dashboard.ts`, `digital-fridge.ts`, `events.ts`, `fees.ts`, `grades.ts`, `messages.ts`, `nexus.ts`, `notes.ts`, `notifications.ts`, `parent.ts`, `payroll.ts`, `question-bank.ts`, `routes.ts`, `schools.ts`, `study-plan.ts`, `subjects.ts`, `supply-alerts.ts`, `teachers.ts`, `uniform-schedule.ts`) are imported but their routes are NEVER mounted — routes defined in index.ts take precedence |
| B19 | **`firebase-admin` SDK installed but UNUSED** | `node_modules` + `src/` | 13.10.0 installed but backend uses raw REST `fetch()` with DB_SECRET |
| B20 | **`cors` package installed but UNUSED** | `node_modules` + `src/index.ts:39-49` | Manual CORS headers instead of proper cors middleware |
| B21 | **`uuid` package installed but UNUSED** | `node_modules` | Custom `id()` function using `Date.now()` + `Math.random()` |
| B22 | **Duplicate Firebase functions** | `src/firebase.ts` + `src/index.ts:63-94` | `getData`, `setData`, `removeData` defined in BOTH files |
| B23 | **AI API keys in URL query params** | `src/index.ts:1570, 1677, 1695` | Gemini API key passed as `?key=` — exposed in any proxy logs |
| B24 | **`html-pdf` deprecated phantomjs-based** | `package.json` + code | Library is unmaintained, phantomjs-based, XSS-prone |
| B25 | **PDF XSS via template interpolation** | `html-pdf` usage | `<p>${invoice.clientName}</p>` — no escaping of user-controlled data |
| B26 | **No query filtering — all data fetched client-side** | All list routes | Firebase `orderBy`/`equalTo` never used; every list fetches ALL records and filters in JS |

#### 🟡 MEDIUM — Missing Features

| # | Issue | Files | Detail |
|---|-------|-------|--------|
| B27 | **No rate limiting** | — | Any endpoint can be spammed |
| B28 | **No security headers** | — | No helmet, no CSP, no HSTS |
| B29 | **No request logging beyond basic console.log** | `src/index.ts:52-55` | "Method: GET, Path: /api/..." — no structured logging |
| B30 | **No health check for dependencies** | `src/index.ts:140-142` | `/api/health` returns static ok — doesn't check Firebase connectivity |
| B31 | **No graceful shutdown** | `src/index.ts:2735` | `app.listen(...)` — no SIGTERM handler |
| B32 | **Older TypeScript target** | `tsconfig.json` | Check if ES2020+ features are used |

---

## 🛠️ Fix Roadmap

### Phase 0: Foundation (shared layers, structural fixes)

| Step | Task | Repo | Files | Est. Effort |
|------|------|------|-------|-------------|
| 0.1 | Create shared types catalog | Frontend | New `src/lib/types.ts` | 4h |
| 0.2 | Create unified API client with auth, error handling, retry | Frontend | Refactor `src/lib/api.ts` | 3h |
| 0.3 | Create React Query / custom fetch hooks | Frontend | New `src/hooks/useApi.ts` | 3h |
| 0.4 | Split backend monolithic `index.ts` into actual route files | Backend | Refactor `src/index.ts` → mount real route files | 8h |
| 0.5 | Use Firebase Admin SDK instead of raw REST | Backend | Rewrite `src/firebase.ts` | 2h |
| 0.6 | Add `.env` to `.gitignore` and rotate all exposed keys | Backend | `.env`, `.gitignore`, Firebase Console | 1h |
| 0.7 | Add proper CORS middleware | Backend | Use `cors` package | 30m |
| 0.8 | Add input validation (zod) | Backend | New middleware + route-level schemas | 4h |

### Phase 1: CRITICAL — Security fixes

| # | Task | Repo | Files |
|---|------|------|-------|
| 1 | Add bcrypt password hashing | Backend | `src/index.ts` auth routes |
| 2 | Add JWT token auth + middleware | Backend | New `src/middleware/auth.ts`, new `src/lib/jwt.ts` |
| 3 | Update frontend to use JWT bearer tokens | Frontend | `src/lib/api.ts`, `src/hooks/useAuth.ts`, `LoginScreen.tsx` |
| 4 | Remove password logging | Backend | `src/index.ts:467` |
| 5 | Add rate limiting to auth routes | Backend | `express-rate-limit` |
| 6 | Fix reset-password (don't overwrite entire user) | Backend | `src/index.ts:537-553` |
| 7 | Remove OTP exposure in dev mode | Backend | `src/index.ts:528-530` |
| 8 | Sanitize Firebase paths against traversal | Backend | All `getData()`/`setData()` calls |
| 9 | Remove auto-seed on startup | Backend | `src/index.ts:2741-2747` |
| 10 | Add atomic Firebase operations | Backend | Use `update()` instead of read-then-write patterns |
| 11 | Run payroll processing asynchronously | Backend | `src/index.ts:2627-2630` — synchronous loop with N+1 queries |
| 12 | Add security headers (helmet) | Backend | New middleware |

### Phase 1b: CRITICAL — Data integrity fixes

| # | Task | Repo | Files |
|---|------|------|-------|
| 13 | Fix mark-read to use PUT | Frontend | `NotificationCenter.tsx` |
| 14 | Wire mark-all-read to backend | Frontend | `NotificationCenter.tsx` |
| 15 | Add error rollback to optimistic updates | Frontend | All optimistic pages |
| 16 | Replace silent catches with toasts | Frontend | 40+ files + `apiFetch` wrapper |
| 17 | Remove fallback demo data injection | Frontend | 12 Manager + Parent pages |
| 18 | Migrate raw `apiFetch()` and bare `fetch()` to `api.*` | Frontend | `teacher/MarkAttendance.tsx`, `teacher/UploadNotes.tsx`, `admin/CSLibrary.tsx`, `admin/AdminEnrolment.tsx` |
| 19 | Unify timetable time fields (`startTime/endTime` canonical) | Frontend | All scheduling + timetable pages |
| 20 | Unify class field to `classId` | Frontend | All timetable pages |
| 21 | Fix `SELECT * FROM timetable` | Frontend | `ManagerScheduling.tsx:391` |
| 22 | Remove/reconnect dead menu item | Frontend | `Common/AdminSidebar.tsx:410` |

### Phase 1c: CRITICAL — Finance/Currency fixes

| # | Task | Repo | Files |
|---|------|------|-------|
| 23 | Unify currency to `formatCurrency()` | Frontend | `AdminFees.tsx`, `AdminFeeInstallments.tsx`, `student/Fees.tsx`, `ManagerFees.tsx` |
| 24 | Fix hardcoded 83.5 conversion | Frontend | `AdminFeeInstallments.tsx` — move to env var or remove |
| 25 | Wire ERP "Money Format" to actually work | Frontend | `AdminERP.tsx` + new `CurrencyContext` |
| 26 | Normalize fee statuses | Frontend | `AdminFees.tsx` ↔ `student/Fees.tsx` |
| 27 | Normalize payment modes | Frontend | Same files |
| 28 | Fix tax computation | Frontend | `AdminInvoicing.tsx` — `(subtotal * taxRate / 100)` |

### Phase 2: HIGH — Scheduling, Notifications, Announcements

| # | Task | Repo | Files |
|---|------|------|-------|
| 29 | Unify period calculation | Frontend | `AdminScheduling.tsx`, `TimetableManagement.tsx` |
| 30 | Unify room field to `roomId` | Frontend | All timetable files |
| 31 | Wire `api.generateTimetable()` into ManagerScheduling | Frontend | `ManagerScheduling.tsx` |
| 32 | Refactor AdminScheduling 943-line component | Frontend | Split into sub-components |
| 33 | Unify announcement endpoints | Frontend | `AdminAnnouncements.tsx`, `student/Announcements.tsx` |
| 34 | Remove CommunicationHub triple overlap | Frontend | `CommunicationHub.tsx` |
| 35 | Unify field names: `createdAt`/`date`, `message`/`body`, `author`/`authorName` | Frontend | All notification/message files |
| 36 | Remove fake random online status | Frontend | `CommunicationHub.tsx:187` |
| 37 | Connect student Messages to API | Frontend | `student/Messages.tsx` |
| 38 | Wire ManagerAnnouncements to API | Frontend | `ManagerAnnouncements.tsx` |
| 39 | Wire ManagerComms to API | Frontend | `ManagerComms.tsx` |

### Phase 3: MEDIUM — Student/Teacher/Parent Pages + Admin wiring

| # | Task | Repo | Files |
|---|------|------|-------|
| 40 | Fix stale GPA — compute fresh from grades | Frontend | `DailyBriefing.tsx`, `Profile.tsx` |
| 41 | Normalize attendance endpoints across roles | Frontend | `student/Attendance.tsx`, `parent/ParentAttendance.tsx`, `teacher/MarkAttendance.tsx` |
| 42 | Normalize exam endpoints across roles | Frontend | `student/Exams.tsx`, `teacher/ExamSyllabus.tsx`, `AdminExams.tsx` |
| 43-56 | Wire 14 admin local-state pages to real APIs | Frontend | FoodService, LostFound, AnonymousReports, RoomBooking, ITHelpdesk, Clinic, Athletics, Portfolio, Facilities, SkipBus, AssetTracking, Discipline, Counselling, Activities |
| 57 | Wire Calendar to backend | Frontend | `AdminCalendar.tsx` |
| 58 | Normalize hardcoded class lists | Frontend | All timetable files |

### Phase 4: Backend — Architectural fixes

| # | Task | Repo |
|---|------|------|
| 59-86 | Mount actual route modules (27 currently dead) | Backend |
| 87 | Remove duplicate Firebase functions from index.ts | Backend |
| 88 | Add proper logging (winston/pino) | Backend |
| 89 | Add graceful shutdown | Backend |
| 90 | Add Firebase connectivity check to health endpoint | Backend |
| 91 | Add query filtering using Firebase `orderBy`/`equalTo` | Backend |

### Phase 5: Verification

| Step | Task |
|------|------|
| V1 | Each page tested: create → read → update → delete flows |
| V2 | Cross-role verification: Admin creates → Student sees → Parent sees correct fields |
| V3 | Finance verification: Invoice in admin → fee status in student view → currency consistent |
| V4 | Error simulation: API failures → toast shown, no data corruption, no silent mocks |
| V5 | Security verification: No plaintext passwords in DB, no DB_SECRET in logs, JWT enforced |
| V6 | No auto-seed verification: restart server → production data intact |
