
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const userId = localStorage.getItem('eduvault-user-id') || '';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText, message: res.statusText }));
    throw new Error(err.message || err.error || 'API Error');
  }
  return res.json();
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
  getTimetable: (className: string) => apiFetch(`/timetable/${className}`),
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
  getClubs: () => apiFetch('/clubs'),
  createClub: (data: any) => apiFetch('/clubs', { method: 'POST', body: JSON.stringify(data) }),

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
  createStudyTask: (data: any) => apiFetch('/study-plan', { method: 'POST', body: JSON.stringify(data) }),
  updateStudyTask: (id: string, data: any) => apiFetch(`/study-plan/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudyTask: (id: string) => apiFetch(`/study-plan/${id}`, { method: 'DELETE' }),

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
  deleteBusAssignment: (id: string) => apiFetch(`/bus/assignments/${id}`, { method: 'DELETE' }),

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
};