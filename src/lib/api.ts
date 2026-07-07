
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://op-csconnect-backend-production.up.railway.app/api');

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('eduvault-token');
  const userId = localStorage.getItem('eduvault-user-id');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message: string;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || res.statusText;
    } catch {
      message = text || res.statusText;
    }
    throw new Error(message);
  }
  const payload = await res.json();
  return payload;
}

export async function apiFetchPaginated(endpoint: string, page = 1, limit = 20, options: RequestInit = {}) {
  const sep = endpoint.includes('?') ? '&' : '?';
  return apiFetch(`${endpoint}${sep}page=${page}&limit=${limit}`, options);
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data: any) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string) =>
    apiFetch('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
  getMe: () => apiFetch('/auth/me'),

  // Users
  getUsers: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/users${query}`);
  },
  getUser: (id: string) => apiFetch(`/users/${id}`),
  createUser: (data: any) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiFetch(`/users/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: (className?: string) => {
    const query = className ? `?class=${className}` : '';
    return apiFetch(`/students${query}`);
  },
  getStudent: (id: string) => apiFetch(`/students/${id}`),
  getStudentGrades: (id: string) => apiFetch(`/students/${id}/grades`),
  getStudentAttendance: (id: string) => apiFetch(`/students/${id}/attendance`),
  getStudentFees: (id: string) => apiFetch(`/students/${id}/fees`),
  getStudentGoals: (id: string) => apiFetch(`/students/${id}/goals`),
  createGoal: (id: string, data: any) => apiFetch(`/students/${id}/goals`, { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, goalId: string, data: any) => apiFetch(`/students/${id}/goals/${goalId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Teachers
  getTeachers: () => apiFetch('/teachers'),
  getTeacher: (id: string) => apiFetch(`/teachers/${id}`),
  getTeacherClasses: (id: string) => apiFetch(`/teachers/${id}/classes`),

  // Sections
  getMySection: (teacherId: string) => apiFetch(`/v1/sections/my/${teacherId}`),
  getSectionMembers: (sectionId: string) => apiFetch(`/v1/sections/${sectionId}/members`),
  addSectionMember: (sectionId: string, studentId: string) =>
    apiFetch(`/v1/sections/${sectionId}/members`, { method: 'POST', body: JSON.stringify({ studentId }) }),
  removeSectionMember: (sectionId: string, studentId: string) =>
    apiFetch(`/v1/sections/${sectionId}/members/${studentId}`, { method: 'DELETE' }),

  // Subjects
  getSubjects: () => apiFetch('/subjects'),
  getSubject: (id: string) => apiFetch(`/subjects/${id}`),

  // Dashboard
  getDashboardStats: (role?: string, userId?: string) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (userId) params.set('userId', userId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/dashboard/stats${query}`);
  },

  // Assignments
  getAssignments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/assignments${query}`);
  },
  getAssignment: (id: string) => apiFetch(`/assignments/${id}`),
  createAssignment: (data: any) => apiFetch('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateAssignment: (id: string, data: any) => apiFetch(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAssignment: (id: string) => apiFetch(`/assignments/${id}`, { method: 'DELETE' }),
  submitAssignment: (id: string, data: any) => apiFetch(`/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  gradeAssignment: (id: string, data: any) => apiFetch(`/assignments/${id}/grade`, { method: 'POST', body: JSON.stringify(data) }),

  // Timetable
  getTimetable: (className?: string) => {
    const endpoint = className ? `/timetable/${className}` : '/timetable';
    return apiFetch(endpoint);
  },
  updateTimetable: (className: string, schedule: any) => apiFetch('/timetable', { method: 'POST', body: JSON.stringify({ className, schedule }) }),

  // Schools
  getSchools: () => apiFetch('/schools'),

  // Routes
  getRoutes: () => apiFetch('/routes'),
  getRoute: (id: string) => apiFetch(`/routes/${id}`),
  createRoute: (data: any) => apiFetch('/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateRoute: (id: string, data: any) => apiFetch(`/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events
  getEvents: () => apiFetch('/events'),
  createEvent: (data: any) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id: string) => apiFetch(`/events/${id}`, { method: 'DELETE' }),

  // Clubs
  getClubs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/clubs${query}`);
  },
  createClub: (data: any) => apiFetch('/clubs', { method: 'POST', body: JSON.stringify(data) }),
  approveClub: (id: string) => apiFetch(`/clubs/${id}/approve`, { method: 'PUT' }),
  rejectClub: (id: string) => apiFetch(`/clubs/${id}/reject`, { method: 'PUT' }),
  joinClub: (clubId: string, userId: string) => apiFetch(`/clubs/${clubId}/join`, { method: 'POST', body: JSON.stringify({ userId }) }),
  leaveClub: (clubId: string, userId: string) => apiFetch(`/clubs/${clubId}/leave`, { method: 'POST', body: JSON.stringify({ userId }) }),
  approveJoinRequest: (clubId: string, userId: string) => apiFetch(`/clubs/${clubId}/join/${userId}/approve`, { method: 'PUT' }),
  rejectJoinRequest: (clubId: string, userId: string) => apiFetch(`/clubs/${clubId}/join/${userId}/reject`, { method: 'PUT' }),

  // Messages
  getMessages: (userId: string) => apiFetch(`/messages/${userId}`),
  sendMessage: (from: string, to: string, content: string) =>
    apiFetch('/messages', { method: 'POST', body: JSON.stringify({ from, to, content }) }),

  // Notifications
  getNotifications: (userId: string) => apiFetch(`/notifications/${userId}`),
  createNotification: (data: any) => apiFetch('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markNotificationRead: (userId: string, id: string) =>
    apiFetch(`/notifications/${userId}/${id}/read`, { method: 'PUT' }),

  // Question Bank
  getQuestionBank: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/question-bank${query}`);
  },
  createQuestion: (data: any) => apiFetch('/question-bank', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  markAttendance: (data: any) => apiFetch('/attendance/mark', { method: 'POST', body: JSON.stringify(data) }),
  getClassAttendance: (className: string, date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiFetch(`/attendance/class/${className}${query}`);
  },

  // Notes
  getNotes: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/notes${query}`);
  },
  createNote: (data: any) => apiFetch('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id: string, data: any) => apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id: string) => apiFetch(`/notes/${id}`, { method: 'DELETE' }),

  // Chat Channels
  getChatChannels: () => apiFetch('/chat/channels'),
  createChatChannel: (data: any) => apiFetch('/chat/channels', { method: 'POST', body: JSON.stringify(data) }),
  getChannelMessages: (channelId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiFetch(`/chat/channels/${channelId}/messages${query}`);
  },
  sendChannelMessage: (channelId: string, data: any) => apiFetch(`/chat/channels/${channelId}/messages`, { method: 'POST', body: JSON.stringify(data) }),

  // Grades
  enterGrades: (data: any) => apiFetch('/grades/enter', { method: 'POST', body: JSON.stringify(data) }),

  // Circulars
  getCirculars: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/circulars${query}`);
  },
  createCircular: (data: any) => apiFetch('/circulars', { method: 'POST', body: JSON.stringify(data) }),
  updateCircular: (id: string, data: any) => apiFetch(`/circulars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCircular: (id: string) => apiFetch(`/circulars/${id}`, { method: 'DELETE' }),

  // Announcements
  getAnnouncements: (priority?: string) => {
    const query = priority ? `?priority=${priority}` : '';
    return apiFetch(`/announcements${query}`);
  },
  createAnnouncement: (data: any) => apiFetch('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: string, data: any) => apiFetch(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) => apiFetch(`/announcements/${id}`, { method: 'DELETE' }),

  // Exams
  getExams: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/exams${query}`);
  },
  createExam: (data: any) => apiFetch('/exams', { method: 'POST', body: JSON.stringify(data) }),
  updateExam: (id: string, data: any) => apiFetch(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExam: (id: string) => apiFetch(`/exams/${id}`, { method: 'DELETE' }),

  // Supply Alerts
  getSupplyAlerts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/supply-alerts${query}`);
  },
  createSupplyAlert: (data: any) => apiFetch('/supply-alerts', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplyAlert: (id: string, data: any) => apiFetch(`/supply-alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Book Alerts
  getBookAlerts: (className?: string) => {
    const query = className ? `?class=${className}` : '';
    return apiFetch(`/book-alerts${query}`);
  },
  createBookAlert: (data: any) => apiFetch('/book-alerts', { method: 'POST', body: JSON.stringify(data) }),

  // Digital Fridge
  getDigitalFridge: (childId: string) => apiFetch(`/digital-fridge/${childId}`),
  createDigitalFridgeItem: (data: any) => apiFetch('/digital-fridge', { method: 'POST', body: JSON.stringify(data) }),

  // Uniform Schedule
  getUniformSchedule: () => apiFetch('/uniform-schedule'),
  createUniformSchedule: (data: any) => apiFetch('/uniform-schedule', { method: 'POST', body: JSON.stringify(data) }),
  updateUniformSchedule: (id: string, data: any) => apiFetch(`/uniform-schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // AI
  chatAI: (messages: any[], model?: string, systemPrompt?: string) =>
    apiFetch('/ai/chat', { method: 'POST', body: JSON.stringify({ messages, model, systemPrompt }) }),
  gradeEssay: (essay: string, rubric: string, subject: string) =>
    apiFetch('/ai/grade', { method: 'POST', body: JSON.stringify({ essay, rubric, subject }) }),
  getStudyPlan: (subject: string, topics: string[], level: string) =>
    apiFetch('/ai/study-plan', { method: 'POST', body: JSON.stringify({ subject, topics, level }) }),
  getAIModels: () => apiFetch('/ai/models'),
  transcribeAudio: (audioBase64: string, filename?: string) =>
    apiFetch('/ai/transcribe', { method: 'POST', body: JSON.stringify({ audioBase64, filename }) }),
  textToSpeech: (text: string, voice?: string) =>
    apiFetch('/ai/tts', { method: 'POST', body: JSON.stringify({ text, voice }) }),

  // Notes
  getSharedNotes: () => apiFetch('/notes/shared'),
  likeSharedNote: (id: string) => apiFetch(`/notes/shared/${id}/like`, { method: 'POST' }),
  shareNote: (id: string, userId: string) => apiFetch(`/notes/${id}/share`, { method: 'POST', body: JSON.stringify({ userId }) }),

  // Announcements
  markAnnouncementRead: (id: string) => apiFetch(`/announcements/${id}/read`, { method: 'POST' }),

  // Study Planner
  createStudyTask: (data: any) => apiFetch('/study-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateStudyTask: (id: string, data: any) => apiFetch(`/study-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudyTask: (id: string) => apiFetch(`/study-plans/${id}`, { method: 'DELETE' }),

  // Calendar
  getCalendarEvents: () => apiFetch('/calendar'),
  createCalendarEvent: (data: any) => apiFetch('/calendar', { method: 'POST', body: JSON.stringify(data) }),
  deleteCalendarEvent: (id: string) => apiFetch(`/calendar/${id}`, { method: 'DELETE' }),

  // Nexus Hub
  getNexusPosts: () => apiFetch('/nexus/posts'),
  createNexusPost: (data: any) => apiFetch('/nexus/posts', { method: 'POST', body: JSON.stringify(data) }),
  likeNexusPost: (id: string) => apiFetch(`/nexus/posts/${id}/like`, { method: 'POST' }),

  // Achievements
  getAchievements: () => apiFetch('/achievements'),
  getAccolades: () => apiFetch('/accolades'),

  // Assignments
  publishAssignment: (id: string) => apiFetch(`/assignments/${id}/publish`, { method: 'POST' }),

  // Attendance

  // Timetable
  createTimetableEntry: (data: any) => apiFetch('/timetable', { method: 'POST', body: JSON.stringify(data) }),
  deleteTimetableEntry: (id: string) => apiFetch(`/timetable/${id}`, { method: 'DELETE' }),

  // Analytics
  getClassAnalytics: (className: string) => apiFetch(`/analytics/class/${className}`),
  getStudentProgress: (className: string) => apiFetch(`/analytics/progress?class=${className}`),
  getPerformanceReport: (className: string, term: string) => apiFetch(`/analytics/performance?class=${className}&term=${term}`),
  getAdminAnalytics: () => apiFetch('/analytics/admin'),
  getManagerAnalytics: () => apiFetch('/analytics/manager'),
  getManagerAcademics: () => apiFetch('/analytics/manager/academics'),
  getManagerFinance: () => apiFetch('/analytics/manager/finance'),
  getManagerTransport: () => apiFetch('/analytics/manager/transport'),
  getCoordinatorDashboard: () => apiFetch('/analytics/coordinator'),

  // Parent
  getParentDashboard: () => apiFetch('/parent/dashboard'),
  getChildAttendance: (childId: string, month?: string) => apiFetch(`/parent/attendance/${childId}${month ? `?month=${month}` : ''}`),
  getChildGrades: (childId: string) => apiFetch(`/parent/grades/${childId}`),
  getChildTimetable: (childId: string) => apiFetch(`/parent/timetable/${childId}`),
  getChildFees: (childId: string) => apiFetch(`/parent/fees/${childId}`),
  getChildBusTracking: (childId: string) => apiFetch(`/parent/bus/${childId}`),

  // Bus
  getBusAssignments: () => apiFetch('/bus/assignments'),
  createBusAssignment: (data: any) => apiFetch('/bus/assignments', { method: 'POST', body: JSON.stringify(data) }),
  updateBusAssignment: (id: string, data: any) => apiFetch(`/bus/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBusAssignment: (id: string) => apiFetch(`/bus/assignments/${id}`, { method: 'DELETE' }),
  setDriverLeave: (driverId: string, onLeave: boolean) => apiFetch(`/bus/drivers/${driverId}/leave`, { method: 'PUT', body: JSON.stringify({ onLeave }) }),

  // Fees
  getFeeRecords: () => apiFetch('/fees'),
  getAccountRecords: () => apiFetch('/accounts'),

  // Payroll
  getPayrollRecords: (month?: string) => apiFetch(`/payroll${month ? `?month=${month}` : ''}`),

  // Library
  getBooks: () => apiFetch('/books'),

  // Daily Briefing
  getDailyBriefing: () => apiFetch('/daily-briefing'),

  // Borrowed Books
  getBorrowedBooks: () => apiFetch('/books/borrowed'),
  getBorrowedBooksByStudent: (studentId: string) => apiFetch(`/books/borrowed/${studentId}`),
  borrowBook: (data: any) => apiFetch('/books/borrow', { method: 'POST', body: JSON.stringify(data) }),
  returnBook: (bookId: string) => apiFetch(`/books/return/${bookId}`, { method: 'PUT' }),

  // Accolades
  getAccoladesByStudent: (studentId: string) => apiFetch(`/accolades/${studentId}`),
  submitAccolade: (data: any) => apiFetch('/accolades', { method: 'POST', body: JSON.stringify(data) }),
  approveAccolade: (id: string, approvedBy: string) => apiFetch(`/accolades/${id}/approve`, { method: 'PUT', body: JSON.stringify({ approvedBy }) }),
  rejectAccolade: (id: string, rejectedBy: string, reason: string) => apiFetch(`/accolades/${id}/reject`, { method: 'PUT', body: JSON.stringify({ rejectedBy, reason }) }),

  // Study Plans
  getStudyPlans: (studentId: string) => apiFetch(`/study-plans/${studentId}`),
  createStudyPlan: (studentId: string, plan: any) => apiFetch('/study-plans', { method: 'POST', body: JSON.stringify({ studentId, plan }) }),
  updateStudyPlanTask: (planId: string, studentId: string, taskIndex: number, completed: boolean) =>
    apiFetch(`/study-plans/${planId}/task`, { method: 'PUT', body: JSON.stringify({ studentId, taskIndex, completed }) }),

  // Announcements (extended)
  pinAnnouncement: (id: string) => apiFetch(`/announcements/${id}/pin`, { method: 'PUT' }),
  approveAnnouncement: (id: string, approvedBy: string) => apiFetch(`/announcements/${id}/approve`, { method: 'PUT', body: JSON.stringify({ approvedBy }) }),

  // User Profile
  updateUserAvatar: (userId: string, avatarUrl: string) => apiFetch(`/users/${userId}/avatar`, { method: 'PUT', body: JSON.stringify({ avatarUrl }) }),
  updateUserProfile: (userId: string, data: any) => apiFetch(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Achievements (extended)
  createAchievement: (data: any) => apiFetch('/achievements', { method: 'POST', body: JSON.stringify(data) }),
  toggleAchievementLike: (id: string, userId: string) => apiFetch(`/achievements/${id}/like`, { method: 'POST', body: JSON.stringify({ userId }) }),
  addAchievementComment: (id: string, authorId: string, authorName: string, content: string) =>
    apiFetch(`/achievements/${id}/comment`, { method: 'POST', body: JSON.stringify({ authorId, authorName, content }) }),

  // ========== PHASE 3 API METHODS ==========

  // --- Counselling ---
  getCounsellingSessions: () => apiFetch('/counselling/sessions'),
  createCounsellingSession: (data: any) => apiFetch('/counselling/sessions', { method: 'POST', body: JSON.stringify(data) }),
  updateCounsellingSession: (id: string, data: any) => apiFetch(`/counselling/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getWellbeingCheckins: () => apiFetch('/counselling/checkins'),
  createWellbeingCheckin: (data: any) => apiFetch('/counselling/checkins', { method: 'POST', body: JSON.stringify(data) }),
  getReferrals: () => apiFetch('/counselling/referrals'),
  createReferral: (data: any) => apiFetch('/counselling/referrals', { method: 'POST', body: JSON.stringify(data) }),
  updateReferralStatus: (id: string, action: string) => apiFetch(`/counselling/referrals/${id}/${action}`, { method: 'PUT' }),
  getCarePlans: () => apiFetch('/counselling/care-plans'),
  createCarePlan: (data: any) => apiFetch('/counselling/care-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateCarePlan: (id: string, data: any) => apiFetch(`/counselling/care-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMTSS: () => apiFetch('/counselling/mtss'),
  createMTSS: (data: any) => apiFetch('/counselling/mtss', { method: 'POST', body: JSON.stringify(data) }),
  updateMTSS: (id: string, data: any) => apiFetch(`/counselling/mtss/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getGrievances: () => apiFetch('/counselling/grievances'),
  createGrievance: (data: any) => apiFetch('/counselling/grievances', { method: 'POST', body: JSON.stringify(data) }),
  updateGrievanceStatus: (id: string, action: string) => apiFetch(`/counselling/grievances/${id}/${action}`, { method: 'PUT' }),
  getCounsellorCaseload: (counsellorId: string) => apiFetch(`/counselling/caseload/${counsellorId}`),

  // --- Health ---
  getHealthRecords: () => apiFetch('/health/records'),
  createHealthRecord: (data: any) => apiFetch('/health/records', { method: 'POST', body: JSON.stringify(data) }),
  updateHealthRecord: (id: string, data: any) => apiFetch(`/health/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getImmunisations: () => apiFetch('/health/immunisations'),
  createImmunisation: (data: any) => apiFetch('/health/immunisations', { method: 'POST', body: JSON.stringify(data) }),
  getIEPs: () => apiFetch('/health/iep'),
  createIEP: (data: any) => apiFetch('/health/iep', { method: 'POST', body: JSON.stringify(data) }),
  updateIEP: (id: string, data: any) => apiFetch(`/health/iep/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getScreenings: () => apiFetch('/health/screenings'),
  createScreening: (data: any) => apiFetch('/health/screenings', { method: 'POST', body: JSON.stringify(data) }),
  getNurseVisits: () => apiFetch('/health/visits'),
  createNurseVisit: (data: any) => apiFetch('/health/visits', { method: 'POST', body: JSON.stringify(data) }),
  getDietaryProfiles: () => apiFetch('/health/dietary'),
  createDietaryProfile: (data: any) => apiFetch('/health/dietary', { method: 'POST', body: JSON.stringify(data) }),
  updateDietaryProfile: (id: string, data: any) => apiFetch(`/health/dietary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- Discipline ---
  getDisciplineIncidents: () => apiFetch('/discipline/incidents'),
  createDisciplineIncident: (data: any) => apiFetch('/discipline/incidents', { method: 'POST', body: JSON.stringify(data) }),
  updateDisciplineIncident: (id: string, data: any) => apiFetch(`/discipline/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  resolveDisciplineIncident: (id: string, data: any) => apiFetch(`/discipline/incidents/${id}/resolve`, { method: 'PUT', body: JSON.stringify(data) }),
  getBIPs: () => apiFetch('/discipline/bip'),
  createBIP: (data: any) => apiFetch('/discipline/bip', { method: 'POST', body: JSON.stringify(data) }),
  updateBIP: (id: string, data: any) => apiFetch(`/discipline/bip/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  logBIPProgress: (id: string, data: any) => apiFetch(`/discipline/bip/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
  getDetentions: () => apiFetch('/discipline/detentions'),
  createDetention: (data: any) => apiFetch('/discipline/detentions', { method: 'POST', body: JSON.stringify(data) }),
  updateDetentionStatus: (id: string, action: string) => apiFetch(`/discipline/detentions/${id}/${action}`, { method: 'PUT' }),
  getPositiveBehaviour: () => apiFetch('/discipline/positive-behaviour'),
  createPositiveBehaviour: (data: any) => apiFetch('/discipline/positive-behaviour', { method: 'POST', body: JSON.stringify(data) }),

  // --- Activities ---
  getClubsExtended: () => apiFetch('/activities/clubs'),
  createClubExtended: (data: any) => apiFetch('/activities/clubs', { method: 'POST', body: JSON.stringify(data) }),
  updateClubExtended: (id: string, data: any) => apiFetch(`/activities/clubs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addClubMember: (clubId: string, studentId: string) => apiFetch(`/activities/clubs/${clubId}/members`, { method: 'POST', body: JSON.stringify({ studentId }) }),
  removeClubMember: (clubId: string, studentId: string) => apiFetch(`/activities/clubs/${clubId}/members/${studentId}`, { method: 'DELETE' }),
  getClubActivities: (clubId?: string) => {
    const query = clubId ? `?clubId=${clubId}` : '';
    return apiFetch(`/activities/activities${query}`);
  },
  createClubActivity: (data: any) => apiFetch('/activities/activities', { method: 'POST', body: JSON.stringify(data) }),
  getFieldTrips: () => apiFetch('/activities/field-trips'),
  createFieldTrip: (data: any) => apiFetch('/activities/field-trips', { method: 'POST', body: JSON.stringify(data) }),
  updateFieldTrip: (id: string, data: any) => apiFetch(`/activities/field-trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  recordFieldTripConsent: (id: string, studentId: string) => apiFetch(`/activities/field-trips/${id}/consent/${studentId}`, { method: 'POST' }),
  getElections: () => apiFetch('/activities/elections'),
  createElection: (data: any) => apiFetch('/activities/elections', { method: 'POST', body: JSON.stringify(data) }),
  nominateCandidate: (electionId: string, data: any) => apiFetch(`/activities/elections/${electionId}/nominate`, { method: 'POST', body: JSON.stringify(data) }),
  castVote: (electionId: string, data: any) => apiFetch(`/activities/elections/${electionId}/vote`, { method: 'POST', body: JSON.stringify(data) }),
  getElectionResults: (electionId: string) => apiFetch(`/activities/elections/${electionId}/results`),
  getServiceHours: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return apiFetch(`/activities/service-hours${query}`);
  },
  logServiceHours: (data: any) => apiFetch('/activities/service-hours', { method: 'POST', body: JSON.stringify(data) }),
  getHobbies: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return apiFetch(`/activities/hobbies${query}`);
  },
  addHobby: (data: any) => apiFetch('/activities/hobbies', { method: 'POST', body: JSON.stringify(data) }),

  // --- Portfolio ---
  getStudentPortfolio: (studentId: string) => apiFetch(`/portfolio/${studentId}`),
  addReflection: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/reflections`, { method: 'POST', body: JSON.stringify(data) }),
  getReflections: (studentId: string) => apiFetch(`/portfolio/${studentId}/reflections`),
  addPortfolioAchievement: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/achievements`, { method: 'POST', body: JSON.stringify(data) }),
  getEndorsements: (studentId: string) => apiFetch(`/portfolio/${studentId}/endorsements`),
  addEndorsement: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/endorsements`, { method: 'POST', body: JSON.stringify(data) }),
  getCollegeApps: (studentId: string) => apiFetch(`/portfolio/${studentId}/college-apps`),
  addCollegeApp: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/college-apps`, { method: 'POST', body: JSON.stringify(data) }),
  updateCollegeAppStatus: (id: string, data: any) => apiFetch(`/portfolio/college-apps/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getResume: (studentId: string) => apiFetch(`/portfolio/${studentId}/resume`),
  updateResume: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/resume`, { method: 'POST', body: JSON.stringify(data) }),
  getCareerReadiness: (studentId: string) => apiFetch(`/portfolio/${studentId}/career-readiness`),
  addCareerReadiness: (studentId: string, data: any) => apiFetch(`/portfolio/${studentId}/career-readiness`, { method: 'POST', body: JSON.stringify(data) }),
  sharePortfolio: (studentId: string) => apiFetch(`/portfolio/${studentId}/share`, { method: 'POST' }),

  // --- Enrolment ---
  getEnrolmentApplications: () => apiFetch('/enrolment/applications'),
  createEnrolmentApplication: (data: any) => apiFetch('/enrolment/applications', { method: 'POST', body: JSON.stringify(data) }),
  updateEnrolmentApplication: (id: string, data: any) => apiFetch(`/enrolment/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  processEnrolmentApplication: (id: string, action: string) => apiFetch(`/enrolment/applications/${id}/${action}`, { method: 'PUT' }),
  getSchoolCapacity: () => apiFetch('/enrolment/capacity'),
  setSchoolCapacity: (data: any) => apiFetch('/enrolment/capacity', { method: 'POST', body: JSON.stringify(data) }),
  getAdmissionOffers: () => apiFetch('/enrolment/offers'),
  createAdmissionOffer: (data: any) => apiFetch('/enrolment/offers', { method: 'POST', body: JSON.stringify(data) }),
  respondToOffer: (id: string, action: string) => apiFetch(`/enrolment/offers/${id}/${action}`, { method: 'PUT' }),
  getWaitlist: () => apiFetch('/enrolment/waitlist'),
  addWaitlist: (data: any) => apiFetch('/enrolment/waitlist', { method: 'POST', body: JSON.stringify(data) }),
  updateWaitlistPriority: (id: string, data: any) => apiFetch(`/enrolment/waitlist/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getWithdrawals: () => apiFetch('/enrolment/withdrawals'),
  processWithdrawal: (data: any) => apiFetch('/enrolment/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
  getSchoolTours: () => apiFetch('/enrolment/tours'),
  bookSchoolTour: (data: any) => apiFetch('/enrolment/tours', { method: 'POST', body: JSON.stringify(data) }),
  getScholarships: () => apiFetch('/enrolment/scholarships'),
  createScholarship: (data: any) => apiFetch('/enrolment/scholarships', { method: 'POST', body: JSON.stringify(data) }),

  // ========== PHASE 4 API METHODS ==========

  // --- Facilities ---
  getBuildings: () => apiFetch('/facilities/buildings'),
  createBuilding: (data: any) => apiFetch('/facilities/buildings', { method: 'POST', body: JSON.stringify(data) }),
  getFacilityRooms: () => apiFetch('/facilities/rooms'),
  createFacilityRoom: (data: any) => apiFetch('/facilities/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateFacilityRoom: (id: string, data: any) => apiFetch(`/facilities/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getWorkOrders: () => apiFetch('/facilities/work-orders'),
  createWorkOrder: (data: any) => apiFetch('/facilities/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkOrder: (id: string, data: any) => apiFetch(`/facilities/work-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignWorkOrder: (id: string, data: any) => apiFetch(`/facilities/work-orders/${id}/assign`, { method: 'PUT', body: JSON.stringify(data) }),
  completeWorkOrder: (id: string) => apiFetch(`/facilities/work-orders/${id}/complete`, { method: 'PUT' }),
  getInspections: () => apiFetch('/facilities/inspections'),
  createInspection: (data: any) => apiFetch('/facilities/inspections', { method: 'POST', body: JSON.stringify(data) }),
  getEnergyUsage: () => apiFetch('/facilities/energy'),
  logEnergyUsage: (data: any) => apiFetch('/facilities/energy', { method: 'POST', body: JSON.stringify(data) }),
  getSupplyAudit: () => apiFetch('/facilities/supply-audit'),
  updateSupplyStock: (data: any) => apiFetch('/facilities/supply-audit', { method: 'POST', body: JSON.stringify(data) }),
  getCleaningSchedules: () => apiFetch('/facilities/cleaning'),
  createCleaningSchedule: (data: any) => apiFetch('/facilities/cleaning', { method: 'POST', body: JSON.stringify(data) }),
  getVisitorLogs: () => apiFetch('/facilities/visitors'),
  logVisitor: (data: any) => apiFetch('/facilities/visitors', { method: 'POST', body: JSON.stringify(data) }),
  getEmergencyDrills: () => apiFetch('/facilities/emergency-drills'),
  logEmergencyDrill: (data: any) => apiFetch('/facilities/emergency-drills', { method: 'POST', body: JSON.stringify(data) }),
  getSafetyIncidents: () => apiFetch('/facilities/safety-incidents'),
  reportSafetyIncident: (data: any) => apiFetch('/facilities/safety-incidents', { method: 'POST', body: JSON.stringify(data) }),

  // --- Asset Tracking ---
  getAssets: () => apiFetch('/facilities/assets'),
  createAsset: (data: any) => apiFetch('/facilities/assets', { method: 'POST', body: JSON.stringify(data) }),
  updateAsset: (id: string, data: any) => apiFetch(`/facilities/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAsset: (id: string) => apiFetch(`/facilities/assets/${id}`, { method: 'DELETE' }),

  // --- Transport ---
  getTransportRoutes: () => apiFetch('/transport/routes'),
  createTransportRoute: (data: any) => apiFetch('/transport/routes', { method: 'POST', body: JSON.stringify(data) }),
  updateTransportRoute: (id: string, data: any) => apiFetch(`/transport/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getFleetVehicles: () => apiFetch('/transport/vehicles'),
  addFleetVehicle: (data: any) => apiFetch('/transport/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateFleetVehicle: (id: string, data: any) => apiFetch(`/transport/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getFleetMaintenance: () => apiFetch('/transport/maintenance'),
  logFleetMaintenance: (data: any) => apiFetch('/transport/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  getDrivers: () => apiFetch('/transport/drivers'),
  addDriver: (data: any) => apiFetch('/transport/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriver: (id: string, data: any) => apiFetch(`/transport/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getVehicleTracking: (vehicleId: string) => apiFetch(`/transport/tracking/${vehicleId}`),
  updateVehiclePosition: (vehicleId: string, data: any) => apiFetch(`/transport/tracking/${vehicleId}`, { method: 'POST', body: JSON.stringify(data) }),
  getRidership: () => apiFetch('/transport/ridership'),
  logRidership: (data: any) => apiFetch('/transport/ridership', { method: 'POST', body: JSON.stringify(data) }),
  getGeofences: () => apiFetch('/transport/geofences'),
  createGeofence: (data: any) => apiFetch('/transport/geofences', { method: 'POST', body: JSON.stringify(data) }),
  getDelays: () => apiFetch('/transport/delays'),
  reportDelay: (data: any) => apiFetch('/transport/delays', { method: 'POST', body: JSON.stringify(data) }),
  getRouteChanges: () => apiFetch('/transport/route-changes'),
  requestRouteChange: (data: any) => apiFetch('/transport/route-changes', { method: 'POST', body: JSON.stringify(data) }),
  processRouteChange: (id: string, action: string) => apiFetch(`/transport/route-changes/${id}/${action}`, { method: 'PUT' }),

  // --- Food Service ---
  getMenus: () => apiFetch('/food-service/menus'),
  createMenu: (data: any) => apiFetch('/food-service/menus', { method: 'POST', body: JSON.stringify(data) }),
  updateMenu: (id: string, data: any) => apiFetch(`/food-service/menus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPreorders: () => apiFetch('/food-service/preorders'),
  placePreorder: (data: any) => apiFetch('/food-service/preorders', { method: 'POST', body: JSON.stringify(data) }),
  getPOSTransactions: () => apiFetch('/food-service/pos'),
  createPOSTransaction: (data: any) => apiFetch('/food-service/pos', { method: 'POST', body: JSON.stringify(data) }),
  getFoodInventory: () => apiFetch('/food-service/inventory'),
  addFoodInventory: (data: any) => apiFetch('/food-service/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateFoodInventory: (id: string, data: any) => apiFetch(`/food-service/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getRecipes: () => apiFetch('/food-service/recipes'),
  createRecipe: (data: any) => apiFetch('/food-service/recipes', { method: 'POST', body: JSON.stringify(data) }),
  getMealAccount: (studentId: string) => apiFetch(`/food-service/meal-accounts/${studentId}`),
  topupMealAccount: (studentId: string, data: any) => apiFetch(`/food-service/meal-accounts/${studentId}/topup`, { method: 'POST', body: JSON.stringify(data) }),
  chargeMealAccount: (studentId: string, data: any) => apiFetch(`/food-service/meal-accounts/${studentId}/charge`, { method: 'POST', body: JSON.stringify(data) }),
  getFSMEligibility: () => apiFetch('/food-service/fsm-eligibility'),
  setFSMEligibility: (data: any) => apiFetch('/food-service/fsm-eligibility', { method: 'POST', body: JSON.stringify(data) }),
  getFoodWaste: () => apiFetch('/food-service/waste'),
  logFoodWaste: (data: any) => apiFetch('/food-service/waste', { method: 'POST', body: JSON.stringify(data) }),

  // --- Athletics ---
  getSportProgrammes: () => apiFetch('/athletics/programmes'),
  createSportProgramme: (data: any) => apiFetch('/athletics/programmes', { method: 'POST', body: JSON.stringify(data) }),
  updateSportProgramme: (id: string, data: any) => apiFetch(`/athletics/programmes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getTeams: () => apiFetch('/athletics/teams'),
  createTeam: (data: any) => apiFetch('/athletics/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: any) => apiFetch(`/athletics/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addPlayerToRoster: (teamId: string, data: any) => apiFetch(`/athletics/teams/${teamId}/roster`, { method: 'POST', body: JSON.stringify(data) }),
  removePlayerFromRoster: (teamId: string, studentId: string) => apiFetch(`/athletics/teams/${teamId}/roster/${studentId}`, { method: 'DELETE' }),
  getGames: () => apiFetch('/athletics/games'),
  scheduleGame: (data: any) => apiFetch('/athletics/games', { method: 'POST', body: JSON.stringify(data) }),
  updateGame: (id: string, data: any) => apiFetch(`/athletics/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  recordGameResult: (id: string, data: any) => apiFetch(`/athletics/games/${id}/result`, { method: 'PUT', body: JSON.stringify(data) }),
  getCoaches: () => apiFetch('/athletics/coaches'),
  addCoach: (data: any) => apiFetch('/athletics/coaches', { method: 'POST', body: JSON.stringify(data) }),
  getSportsEquipment: () => apiFetch('/athletics/equipment'),
  addSportsEquipment: (data: any) => apiFetch('/athletics/equipment', { method: 'POST', body: JSON.stringify(data) }),
  updateSportsEquipment: (id: string, data: any) => apiFetch(`/athletics/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getSportsInjuries: () => apiFetch('/athletics/injuries'),
  logSportsInjury: (data: any) => apiFetch('/athletics/injuries', { method: 'POST', body: JSON.stringify(data) }),
  clearInjury: (id: string) => apiFetch(`/athletics/injuries/${id}/clear`, { method: 'PUT' }),
  getMedicalClearances: () => apiFetch('/athletics/medical-clearance'),
  addMedicalClearance: (data: any) => apiFetch('/athletics/medical-clearance', { method: 'POST', body: JSON.stringify(data) }),
  getTeamStats: (teamId: string) => apiFetch(`/athletics/stats/${teamId}`),
  getPlayerStats: (teamId: string, studentId: string) => apiFetch(`/athletics/stats/${teamId}/players/${studentId}`),

  // --- Alumni ---
  getAlumniProfiles: () => apiFetch('/alumni/profiles'),
  createAlumniProfile: (data: any) => apiFetch('/alumni/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateAlumniProfile: (id: string, data: any) => apiFetch(`/alumni/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAlumniDirectory: () => apiFetch('/alumni/directory'),
  getAlumniNews: () => apiFetch('/alumni/news'),
  createAlumniNews: (data: any) => apiFetch('/alumni/news', { method: 'POST', body: JSON.stringify(data) }),
  getCampaigns: () => apiFetch('/alumni/campaigns'),
  createCampaign: (data: any) => apiFetch('/alumni/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) => apiFetch(`/alumni/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCommunityGroups: () => apiFetch('/alumni/groups'),
  createCommunityGroup: (data: any) => apiFetch('/alumni/groups', { method: 'POST', body: JSON.stringify(data) }),
  joinCommunityGroup: (groupId: string, userId: string) => apiFetch(`/alumni/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  leaveCommunityGroup: (groupId: string, userId: string) => apiFetch(`/alumni/groups/${groupId}/members/${userId}`, { method: 'DELETE' }),
  getCommunityPolls: () => apiFetch('/alumni/polls'),
  createCommunityPoll: (data: any) => apiFetch('/alumni/polls', { method: 'POST', body: JSON.stringify(data) }),
  castPollVote: (pollId: string, data: any) => apiFetch(`/alumni/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify(data) }),
  getCommunityEvents: () => apiFetch('/alumni/events'),
  createCommunityEvent: (data: any) => apiFetch('/alumni/events', { method: 'POST', body: JSON.stringify(data) }),
  rsvpEvent: (eventId: string, data: any) => apiFetch(`/alumni/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify(data) }),
  getParentEngagement: (parentId: string) => apiFetch(`/alumni/engagement/${parentId}`),
  getAlumniSurveys: () => apiFetch('/alumni/surveys'),
  submitAlumniSurvey: (surveyId: string, data: any) => apiFetch(`/alumni/surveys/${surveyId}/response`, { method: 'POST', body: JSON.stringify(data) }),
  getPTConferences: () => apiFetch('/alumni/pt-conferences'),
  bookPTConference: (data: any) => apiFetch('/alumni/pt-conferences', { method: 'POST', body: JSON.stringify(data) }),

  // --- Platform ---
  getWorkflows: () => apiFetch('/platform/workflows'),
  createWorkflow: (data: any) => apiFetch('/platform/workflows', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) => apiFetch(`/platform/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getSystemTasks: () => apiFetch('/platform/tasks'),
  createSystemTask: (data: any) => apiFetch('/platform/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateSystemTask: (id: string, data: any) => apiFetch(`/platform/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  completeSystemTask: (id: string) => apiFetch(`/platform/tasks/${id}/complete`, { method: 'PUT' }),
  getSystemConfig: () => apiFetch('/platform/config'),
  setSystemConfig: (data: any) => apiFetch('/platform/config', { method: 'POST', body: JSON.stringify(data) }),
  getManagedSchools: () => apiFetch('/platform/multitenant/schools'),
  addManagedSchool: (data: any) => apiFetch('/platform/multitenant/schools', { method: 'POST', body: JSON.stringify(data) }),
  getHouseholds: () => apiFetch('/platform/households'),
  createHousehold: (data: any) => apiFetch('/platform/households', { method: 'POST', body: JSON.stringify(data) }),
  updateHousehold: (id: string, data: any) => apiFetch(`/platform/households/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addHouseholdMember: (householdId: string, data: any) => apiFetch(`/platform/households/${householdId}/members`, { method: 'POST', body: JSON.stringify(data) }),
  getSystemSurveys: () => apiFetch('/platform/surveys'),
  createSystemSurvey: (data: any) => apiFetch('/platform/surveys', { method: 'POST', body: JSON.stringify(data) }),
  submitSystemSurveyResponse: (surveyId: string, data: any) => apiFetch(`/platform/surveys/${surveyId}/response`, { method: 'POST', body: JSON.stringify(data) }),
  getCRMContacts: () => apiFetch('/platform/crm'),
  createCRMContact: (data: any) => apiFetch('/platform/crm', { method: 'POST', body: JSON.stringify(data) }),
  updateCRMContact: (id: string, data: any) => apiFetch(`/platform/crm/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPlatformDocuments: () => apiFetch('/platform/documents'),
  uploadPlatformDocument: (data: any) => apiFetch('/platform/documents', { method: 'POST', body: JSON.stringify(data) }),
  deletePlatformDocument: (id: string) => apiFetch(`/platform/documents/${id}`, { method: 'DELETE' }),
  getBulkOperations: () => apiFetch('/platform/bulk-operations'),
  executeBulkOperation: (data: any) => apiFetch('/platform/bulk-operations', { method: 'POST', body: JSON.stringify(data) }),

  // Leave Requests
  getLeaveRequests: () => apiFetch('/leave-requests'),
  getLeaveRequestsByStudent: (studentId: string) => apiFetch(`/leave-requests/${studentId}`),
  createLeaveRequest: (data: any) => apiFetch('/leave-requests', { method: 'POST', body: JSON.stringify(data) }),
  approveLeaveRequest: (id: string, approvedBy: string) => apiFetch(`/leave-requests/${id}/approve`, { method: 'PUT', body: JSON.stringify({ approvedBy }) }),
  rejectLeaveRequest: (id: string) => apiFetch(`/leave-requests/${id}/reject`, { method: 'PUT' }),

  // Clubs (extended)
  createClubPost: (clubId: string, data: any) => apiFetch(`/clubs/${clubId}/posts`, { method: 'POST', body: JSON.stringify(data) }),
  toggleClubPostLike: (clubId: string, postId: string, userId: string) =>
    apiFetch(`/clubs/${clubId}/posts/${postId}/like`, { method: 'POST', body: JSON.stringify({ userId }) }),

  // ========== PHASE 1 + 2 API METHODS ==========

  // Period Attendance
  markPeriodAttendance: (data: any) => apiFetch('/attendance/period/mark', { method: 'POST', body: JSON.stringify(data) }),
  getPeriodAttendance: (className: string, date: string) => apiFetch(`/attendance/period/${className}/${date}`),
  getPeriodAttendanceByPeriod: (className: string, date: string, period: string) => apiFetch(`/attendance/period/${className}/${date}/${period}`),

  // Attendance Policies
  getAttendancePolicies: () => apiFetch('/attendance/policies'),
  createAttendancePolicy: (data: any) => apiFetch('/attendance/policies', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendancePolicy: (id: string, data: any) => apiFetch(`/attendance/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Teacher Attendance
  markTeacherAttendance: (data: any) => apiFetch('/attendance/teacher/mark', { method: 'POST', body: JSON.stringify(data) }),
  getTeacherAttendance: (date: string) => apiFetch(`/attendance/teacher/${date}`),
  getTeacherAttendanceSummary: (teacherId: string) => apiFetch(`/attendance/teacher/summary/${teacherId}`),

  // Attendance Reports
  getAttendanceReport: (className: string, month?: string) => {
    const query = month ? `?month=${month}` : '';
    return apiFetch(`/attendance/reports/${className}${query}`);
  },

  getAttendance: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/attendance${query}`);
  },

  // Absence Requests
  getAbsenceRequests: () => apiFetch('/attendance/absence-requests'),
  createAbsenceRequest: (data: any) => apiFetch('/attendance/absence-requests', { method: 'POST', body: JSON.stringify(data) }),
  reviewAbsenceRequest: (id: string, action: 'approve' | 'reject', reviewedBy: string) =>
    apiFetch(`/attendance/absence-requests/${id}/${action}`, { method: 'PUT', body: JSON.stringify({ reviewedBy }) }),

  // Timetable Generator
  generateTimetable: (data: any) => apiFetch('/scheduling/timetable/generate', { method: 'POST', body: JSON.stringify(data) }),
  getGeneratedTimetable: (className: string) => apiFetch(`/scheduling/timetable/${className}`),
  updateTimetableEntry: (className: string, day: string, periodIdx: number, data: any) =>
    apiFetch(`/scheduling/timetable/${className}/${day}/${periodIdx}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Room Booking
  getRoomBookings: (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiFetch(`/scheduling/rooms${query}`);
  },
  createRoomBooking: (data: any) => apiFetch('/scheduling/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoomBooking: (id: string, data: any) => apiFetch(`/scheduling/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoomBooking: (id: string) => apiFetch(`/scheduling/rooms/${id}`, { method: 'DELETE' }),
  getRooms: () => apiFetch('/scheduling/rooms/list'),

  // Bell Schedules
  getBellSchedules: () => apiFetch('/scheduling/bell-schedules'),
  createBellSchedule: (data: any) => apiFetch('/scheduling/bell-schedules', { method: 'POST', body: JSON.stringify(data) }),
  updateBellSchedule: (id: string, data: any) => apiFetch(`/scheduling/bell-schedules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBellSchedule: (id: string) => apiFetch(`/scheduling/bell-schedules/${id}`, { method: 'DELETE' }),

  // Class Coverage
  getCoverageRequests: () => apiFetch('/scheduling/coverage'),
  createCoverageRequest: (data: any) => apiFetch('/scheduling/coverage', { method: 'POST', body: JSON.stringify(data) }),
  updateCoverageRequest: (id: string, data: any) => apiFetch(`/scheduling/coverage/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Subject Choices
  getSubjectChoices: (studentId: string) => apiFetch(`/scheduling/subject-choices/${studentId}`),
  setSubjectChoices: (studentId: string, data: any) => apiFetch(`/scheduling/subject-choices/${studentId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Co-teaching
  getCoTeaching: () => apiFetch('/scheduling/co-teaching'),
  createCoTeaching: (data: any) => apiFetch('/scheduling/co-teaching', { method: 'POST', body: JSON.stringify(data) }),

  // SIS - Custom Fields
  getCustomFields: (entityType: string) => apiFetch(`/sis/custom-fields/${entityType}`),
  setCustomFields: (entityType: string, data: any) => apiFetch(`/sis/custom-fields/${entityType}`, { method: 'POST', body: JSON.stringify(data) }),

  // SIS - Transfers
  getStudentTransfers: () => apiFetch('/sis/transfers'),
  createStudentTransfer: (data: any) => apiFetch('/sis/transfers', { method: 'POST', body: JSON.stringify(data) }),
  updateStudentTransfer: (id: string, data: any) => apiFetch(`/sis/transfers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // SIS - Families
  getFamilies: () => apiFetch('/sis/families'),
  createFamily: (data: any) => apiFetch('/sis/families', { method: 'POST', body: JSON.stringify(data) }),
  updateFamily: (id: string, data: any) => apiFetch(`/sis/families/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // SIS - Lockers
  getLockers: () => apiFetch('/sis/lockers'),
  assignLocker: (data: any) => apiFetch('/sis/lockers', { method: 'POST', body: JSON.stringify(data) }),

  // SIS - Student Notes
  getStudentNotes: (studentId: string) => apiFetch(`/sis/student-notes/${studentId}`),
  createStudentNote: (studentId: string, data: any) => apiFetch(`/sis/student-notes/${studentId}`, { method: 'POST', body: JSON.stringify(data) }),

  // SIS - Graduation / Promotions / TC
  getGraduationStatus: (studentId: string) => apiFetch(`/sis/graduation/${studentId}`),
  setGraduationStatus: (studentId: string, data: any) => apiFetch(`/sis/graduation/${studentId}`, { method: 'POST', body: JSON.stringify(data) }),
  getPromotions: () => apiFetch('/sis/promotions'),
  createPromotion: (data: any) => apiFetch('/sis/promotions', { method: 'POST', body: JSON.stringify(data) }),
  getTransferCertificates: () => apiFetch('/sis/tc'),
  issueTransferCertificate: (data: any) => apiFetch('/sis/tc', { method: 'POST', body: JSON.stringify(data) }),

  // Exams - Results Workflow
  getExamResults: (examId: string) => apiFetch(`/exams/results/${examId}`),
  enterExamResult: (examId: string, data: any) => apiFetch(`/exams/results/${examId}`, { method: 'POST', body: JSON.stringify(data) }),
  publishExamResults: (examId: string) => apiFetch(`/exams/results/${examId}/publish`, { method: 'POST' }),

  // Exams - Grace Marks
  applyGraceMarks: (examId: string, data: any) => apiFetch(`/exams/grace/${examId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Exams - Online Exams
  createOnlineExam: (data: any) => apiFetch('/exams/online', { method: 'POST', body: JSON.stringify(data) }),
  getOnlineExam: (id: string) => apiFetch(`/exams/online/${id}`),
  submitOnlineExam: (id: string, data: any) => apiFetch(`/exams/online/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  gradeOnlineExam: (id: string, studentId: string) => apiFetch(`/exams/online/${id}/grade/${studentId}`, { method: 'POST' }),

  // Exams - Analytics
  getExamAnalytics: (examId: string) => apiFetch(`/exams/analytics/${examId}`),

  // Classroom - Lesson Plans
  getLessonPlans: (classId?: string) => {
    const query = classId ? `?class=${classId}` : '';
    return apiFetch(`/classroom/lesson-plans${query}`);
  },
  createLessonPlan: (data: any) => apiFetch('/classroom/lesson-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateLessonPlan: (id: string, data: any) => apiFetch(`/classroom/lesson-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLessonPlan: (id: string) => apiFetch(`/classroom/lesson-plans/${id}`, { method: 'DELETE' }),

  // Classroom - Rubrics
  getRubrics: () => apiFetch('/classroom/rubrics'),
  createRubric: (data: any) => apiFetch('/classroom/rubrics', { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Peer Review
  getPeerReviews: (assignmentId: string) => apiFetch(`/classroom/peer-review/${assignmentId}`),
  submitPeerReview: (assignmentId: string, data: any) => apiFetch(`/classroom/peer-review/${assignmentId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Hall Passes
  getHallPasses: () => apiFetch('/classroom/hall-passes'),
  createHallPass: (data: any) => apiFetch('/classroom/hall-passes', { method: 'POST', body: JSON.stringify(data) }),
  endHallPass: (id: string) => apiFetch(`/classroom/hall-passes/${id}/end`, { method: 'PUT' }),

  // Classroom - Progress Notes
  getProgressNotes: (studentId: string) => apiFetch(`/classroom/progress-notes/${studentId}`),
  createProgressNote: (studentId: string, data: any) => apiFetch(`/classroom/progress-notes/${studentId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Programs
  getPrograms: () => apiFetch('/classroom/programs'),
  createProgram: (data: any) => apiFetch('/classroom/programs', { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Rooms
  getClassrooms: () => apiFetch('/classroom/rooms'),

  // Classroom - Courses
  getCourses: () => apiFetch('/classroom/courses'),
  createCourse: (data: any) => apiFetch('/classroom/courses', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) => apiFetch(`/classroom/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Classroom - Lessons
  getLessons: (courseId: string) => apiFetch(`/classroom/lessons/${courseId}`),
  createLesson: (courseId: string, data: any) => apiFetch(`/classroom/lessons/${courseId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Certificates
  getCertificates: (studentId: string) => apiFetch(`/classroom/certificates/${studentId}`),
  issueCertificate: (data: any) => apiFetch('/classroom/certificates', { method: 'POST', body: JSON.stringify(data) }),

  // Classroom - Exercises
  getExercises: (subjectId?: string) => {
    const query = subjectId ? `?subject=${subjectId}` : '';
    return apiFetch(`/classroom/exercises${query}`);
  },
  createExercise: (data: any) => apiFetch('/classroom/exercises', { method: 'POST', body: JSON.stringify(data) }),
  submitExercise: (id: string, data: any) => apiFetch(`/classroom/exercises/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Chart of Accounts
  getChartOfAccounts: () => apiFetch('/finance/accounts'),
  createAccount: (data: any) => apiFetch('/finance/accounts', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - General Ledger
  getJournalEntries: () => apiFetch('/finance/journal'),
  createJournalEntry: (data: any) => apiFetch('/finance/journal', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Budgets
  getBudgets: () => apiFetch('/finance/budgets'),
  createBudget: (data: any) => apiFetch('/finance/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id: string, data: any) => apiFetch(`/finance/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Finance - Invoices
  getInvoices: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return apiFetch(`/finance/invoices${query}`);
  },
  getInvoice: (id: string) => apiFetch(`/finance/invoices/${id}`),
  createInvoice: (data: any) => apiFetch('/finance/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoice: (id: string, data: any) => apiFetch(`/finance/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInvoice: (id: string) => apiFetch(`/finance/invoices/${id}`, { method: 'DELETE' }),
  downloadInvoicePdf: (id: string) => `${API_BASE}/finance/invoices/${id}/pdf`,
  sendInvoice: (id: string) => apiFetch(`/finance/invoices/${id}/send`, { method: 'POST' }),
  recordInvoicePayment: (id: string, data: any) => apiFetch(`/finance/invoices/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Quotes
  getQuotes: () => apiFetch('/finance/quotes'),
  createQuote: (data: any) => apiFetch('/finance/quotes', { method: 'POST', body: JSON.stringify(data) }),
  convertQuoteToInvoice: (id: string) => apiFetch(`/finance/quotes/${id}/convert`, { method: 'POST' }),

  // Finance - Payments
  getPayments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/finance/payments${query}`);
  },
  createPayment: (data: any) => apiFetch('/finance/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Expenses
  getExpenses: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/finance/expenses${query}`);
  },
  createExpense: (data: any) => apiFetch('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: any) => apiFetch(`/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approveExpense: (id: string, approvedBy: string) => apiFetch(`/finance/expenses/${id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy }) }),

  // Finance - Concessions
  getConcessions: () => apiFetch('/finance/concessions'),
  createConcession: (data: any) => apiFetch('/finance/concessions', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Payment Plans
  getPaymentPlans: () => apiFetch('/finance/payment-plans'),
  createPaymentPlan: (data: any) => apiFetch('/finance/payment-plans', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Financial Aid
  getFinancialAid: () => apiFetch('/finance/financial-aid'),
  createFinancialAid: (data: any) => apiFetch('/finance/financial-aid', { method: 'POST', body: JSON.stringify(data) }),
  approveFinancialAid: (id: string, approvedBy: string) => apiFetch(`/finance/financial-aid/${id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy }) }),

  // Finance - Late Fees
  getLateFees: () => apiFetch('/finance/late-fees'),
  createLateFee: (data: any) => apiFetch('/finance/late-fees', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Procurement
  getProcurementOrders: () => apiFetch('/finance/procurement'),
  createProcurementOrder: (data: any) => apiFetch('/finance/procurement', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Recurring Invoices
  getRecurringInvoices: () => apiFetch('/finance/recurring'),
  createRecurringInvoice: (data: any) => apiFetch('/finance/recurring', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Fee Automation
  getFeeAutomation: () => apiFetch('/finance/fee-automation'),
  createFeeAutomation: (data: any) => apiFetch('/finance/fee-automation', { method: 'POST', body: JSON.stringify(data) }),

  // Finance - Spending Analytics
  getSpendingAnalytics: (month?: string) => {
    const query = month ? `?month=${month}` : '';
    return apiFetch(`/finance/spending-analytics${query}`);
  },

  // HR - Staff Directory
  getStaffDirectory: () => apiFetch('/hr/staff'),
  createStaff: (data: any) => apiFetch('/hr/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: string, data: any) => apiFetch(`/hr/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // HR - Positions
  getStaffPositions: () => apiFetch('/hr/positions'),
  createStaffPosition: (data: any) => apiFetch('/hr/positions', { method: 'POST', body: JSON.stringify(data) }),

  // HR - Leave
  getStaffLeave: (staffId?: string) => {
    const query = staffId ? `?staffId=${staffId}` : '';
    return apiFetch(`/hr/leave${query}`);
  },
  createStaffLeave: (data: any) => apiFetch('/hr/leave', { method: 'POST', body: JSON.stringify(data) }),
  approveStaffLeave: (id: string, approvedBy: string) => apiFetch(`/hr/leave/${id}/approve`, { method: 'POST', body: JSON.stringify({ approvedBy }) }),

  // HR - Certifications
  getCertifications: (staffId: string) => apiFetch(`/hr/certifications/${staffId}`),
  createCertification: (staffId: string, data: any) => apiFetch(`/hr/certifications/${staffId}`, { method: 'POST', body: JSON.stringify(data) }),

  // HR - Training
  getTrainingSessions: () => apiFetch('/hr/training'),
  createTrainingSession: (data: any) => apiFetch('/hr/training', { method: 'POST', body: JSON.stringify(data) }),

  // HR - Appraisals
  getAppraisals: (staffId: string) => apiFetch(`/hr/appraisals/${staffId}`),
  createAppraisal: (staffId: string, data: any) => apiFetch(`/hr/appraisals/${staffId}`, { method: 'POST', body: JSON.stringify(data) }),

  // HR - Recruitment
  getRecruitments: () => apiFetch('/hr/recruitment'),
  createRecruitment: (data: any) => apiFetch('/hr/recruitment', { method: 'POST', body: JSON.stringify(data) }),
  updateRecruitment: (id: string, data: any) => apiFetch(`/hr/recruitment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // HR - Onboarding
  getOnboardingTasks: () => apiFetch('/hr/onboarding'),
  createOnboardingTask: (data: any) => apiFetch('/hr/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  // HR - Payroll
  getPayroll: (month?: string) => {
    const query = month ? `?month=${month}` : '';
    return apiFetch(`/hr/payroll${query}`);
  },
  createPayrollEntry: (data: any) => apiFetch('/hr/payroll', { method: 'POST', body: JSON.stringify(data) }),
  processPayroll: (month: string) => apiFetch(`/hr/payroll/process/${month}`, { method: 'POST' }),

  // Library - Catalogue
  getLibraryCatalogue: () => apiFetch('/library/catalogue'),
  createLibraryItem: (data: any) => apiFetch('/library/catalogue', { method: 'POST', body: JSON.stringify(data) }),
  updateLibraryItem: (id: string, data: any) => apiFetch(`/library/catalogue/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLibraryItem: (id: string) => apiFetch(`/library/catalogue/${id}`, { method: 'DELETE' }),

  // Library - Holds
  getHolds: () => apiFetch('/library/holds'),
  createHold: (data: any) => apiFetch('/library/holds', { method: 'POST', body: JSON.stringify(data) }),
  fulfillHold: (id: string) => apiFetch(`/library/holds/${id}/fulfill`, { method: 'POST' }),

  // Library - Fines
  getFines: () => apiFetch('/library/fines'),
  createFine: (data: any) => apiFetch('/library/fines', { method: 'POST', body: JSON.stringify(data) }),
  payFine: (id: string) => apiFetch(`/library/fines/${id}/pay`, { method: 'POST' }),

  // Library - Class Sets
  getClassSets: () => apiFetch('/library/class-sets'),
  createClassSet: (data: any) => apiFetch('/library/class-sets', { method: 'POST', body: JSON.stringify(data) }),

  // Library - Reading Logs
  getReadingLogs: (studentId: string) => apiFetch(`/library/reading-logs/${studentId}`),
  createReadingLog: (data: any) => apiFetch('/library/reading-logs', { method: 'POST', body: JSON.stringify(data) }),

  // Library - Programmes
  getReadingProgrammes: () => apiFetch('/library/programmes'),
  createReadingProgramme: (data: any) => apiFetch('/library/programmes', { method: 'POST', body: JSON.stringify(data) }),

  // CS Library (digital book search)
  searchCSLibrary: (params: any) =>
    apiFetch('/cs-library/search', { method: 'POST', body: JSON.stringify(params) }),
  getCSLibraryBook: (bookId: string) =>
    apiFetch(`/cs-library/book/${bookId}`),

  // Library - Reviews
  getBookReviews: (bookId: string) => apiFetch(`/library/reviews/${bookId}`),
  createBookReview: (data: any) => apiFetch('/library/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Library - Interlibrary Loans
  getInterlibraryLoans: () => apiFetch('/library/ill'),
  createInterlibraryLoan: (data: any) => apiFetch('/library/ill', { method: 'POST', body: JSON.stringify(data) }),

  // Comms - Push
  getPushNotifications: () => apiFetch('/comms/push'),
  sendPushNotification: (data: any) => apiFetch('/comms/push', { method: 'POST', body: JSON.stringify(data) }),

  // Comms - Emergency Alerts
  getEmergencyAlerts: () => apiFetch('/comms/emergency'),
  createEmergencyAlert: (data: any) => apiFetch('/comms/emergency', { method: 'POST', body: JSON.stringify(data) }),

  // Comms - Moderation
  getModerationQueue: () => apiFetch('/comms/moderation'),
  moderateContent: (id: string, action: string, moderatedBy: string) =>
    apiFetch(`/comms/moderation/${id}`, { method: 'PUT', body: JSON.stringify({ action, moderatedBy }) }),

  // Comms - Email
  getEmailLogs: () => apiFetch('/comms/email'),
  sendEmail: (data: any) => apiFetch('/comms/email', { method: 'POST', body: JSON.stringify(data) }),

  // Comms - Translations
  getTranslations: () => apiFetch('/comms/translations'),
  createTranslation: (data: any) => apiFetch('/comms/translations', { method: 'POST', body: JSON.stringify(data) }),

  // ERP - Clients
  getClients: () => apiFetch('/erp/clients'),
  createClient: (data: any) => apiFetch('/erp/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: any) => apiFetch(`/erp/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => apiFetch(`/erp/clients/${id}`, { method: 'DELETE' }),

  // ERP - Leads
  getLeads: () => apiFetch('/erp/leads'),
  createLead: (data: any) => apiFetch('/erp/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: any) => apiFetch(`/erp/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ERP - Products
  getProducts: () => apiFetch('/erp/products'),
  createProduct: (data: any) => apiFetch('/erp/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => apiFetch(`/erp/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ERP - Orders
  getOrders: () => apiFetch('/erp/orders'),
  createOrder: (data: any) => apiFetch('/erp/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string, data: any) => apiFetch(`/erp/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ERP - Company Settings
  getCompanySettings: () => apiFetch('/erp/company'),
  updateCompanySettings: (data: any) => apiFetch('/erp/company', { method: 'PUT', body: JSON.stringify(data) }),

  // ERP - Money Format
  getMoneyFormat: () => apiFetch('/erp/money-format'),
  updateMoneyFormat: (data: any) => apiFetch('/erp/money-format', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin - Anonymous Reports
  getAnonymousReports: () => apiFetch('/anonymous-reports'),
  createAnonymousReport: (data: any) => apiFetch('/anonymous-reports', { method: 'POST', body: JSON.stringify(data) }),
  updateAnonymousReportStatus: (id: string, status: string) =>
    apiFetch(`/anonymous-reports/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Admin - Clinic Visits
  getClinicVisits: () => apiFetch('/clinic'),
  createClinicVisit: (data: any) => apiFetch('/clinic', { method: 'POST', body: JSON.stringify(data) }),

  // Admin - IT Helpdesk
  getHelpdeskTickets: () => apiFetch('/helpdesk'),
  createHelpdeskTicket: (data: any) => apiFetch('/helpdesk', { method: 'POST', body: JSON.stringify(data) }),
  updateHelpdeskTicket: (id: string, data: any) => apiFetch(`/helpdesk/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin - Lost & Found
  getLostFoundItems: () => apiFetch('/lost-found'),
  createLostFoundItem: (data: any) => apiFetch('/lost-found', { method: 'POST', body: JSON.stringify(data) }),
  claimLostFoundItem: (id: string) => apiFetch(`/lost-found/${id}/claim`, { method: 'PUT' }),
  archiveLostFoundItem: (id: string) => apiFetch(`/lost-found/${id}/archive`, { method: 'PUT' }),

  // Admin - Skip Bus
  getSkipBusRequests: () => apiFetch('/skip-bus'),
  createSkipBusRequest: (data: any) => apiFetch('/skip-bus', { method: 'POST', body: JSON.stringify(data) }),
  approveSkipBusRequest: (id: string) => apiFetch(`/skip-bus/${id}/approve`, { method: 'PUT' }),
  rejectSkipBusRequest: (id: string) => apiFetch(`/skip-bus/${id}/reject`, { method: 'PUT' }),

  // ========== AUCTION HOUSE ==========
  getTalentMarketListings: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/talent-market/listings${query}`);
  },
  getTalentMarketListing: (id: string) => apiFetch(`/talent-market/listings/${id}`),
  createTalentMarketListing: (data: any) => apiFetch('/talent-market/listings', { method: 'POST', body: JSON.stringify(data) }),
  updateTalentMarketListing: (id: string, data: any) => apiFetch(`/talent-market/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTalentMarketListing: (id: string) => apiFetch(`/talent-market/listings/${id}`, { method: 'DELETE' }),
  submitToTalentMarket: (listingId: string, data: any) => apiFetch(`/talent-market/listings/${listingId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  updateSubmissionStatus: (listingId: string, submissionId: string, data: any) =>
    apiFetch(`/talent-market/listings/${listingId}/submissions/${submissionId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getMyTalentMarketSubmissions: (studentId: string) => apiFetch(`/talent-market/my-submissions/${studentId}`),

  // ========== UNIVERSAL INBOX ==========
  getInbox: (userId: string) => apiFetch(`/talent-market/inbox/${userId}`),
  createInboxItem: (data: any) => apiFetch('/talent-market/inbox', { method: 'POST', body: JSON.stringify(data) }),
  markInboxItemRead: (id: string) => apiFetch(`/talent-market/inbox/${id}/read`, { method: 'PUT' }),
  markAllInboxRead: (userId: string) => apiFetch(`/talent-market/inbox/read-all/${userId}`, { method: 'PUT' }),
  deleteInboxItem: (id: string) => apiFetch(`/talent-market/inbox/${id}`, { method: 'DELETE' }),
};