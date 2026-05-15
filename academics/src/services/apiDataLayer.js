/**
 * API Data Layer
 * Centralized API communication layer with caching, error handling, and retry logic
 * Abstracts all HTTP calls to backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://op-csconnect-backend-production.up.railway.app/api';
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const cache = new Map();
const requestCache = new Map();

function getCachedData(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(pattern = null) {
  if (!pattern) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

async function makeRequest(method, endpoint, data = null, options = {}) {
  const { useCache = true, cacheKey = null, retries = MAX_RETRIES, timeout = 30000 } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKeyToUse = cacheKey || `${method}:${endpoint}`;

  if (method === 'GET' && useCache) {
    const cached = getCachedData(cacheKeyToUse);
    if (cached) return { success: true, data: cached, fromCache: true };
  }
  if (requestCache.has(cacheKeyToUse)) return requestCache.get(cacheKeyToUse);

  const requestPromise = performRequest(method, url, data, retries, timeout)
    .then(response => {
      if (method === 'GET' && useCache && response.success) setCachedData(cacheKeyToUse, response.data);
      if (method !== 'GET') clearCache(endpoint.split('/')[1]);
      return response;
    })
    .catch(error => { requestCache.delete(cacheKeyToUse); throw error; })
    .finally(() => setTimeout(() => requestCache.delete(cacheKeyToUse), 100));

  requestCache.set(cacheKeyToUse, requestPromise);
  try { return await requestPromise; }
  catch (error) { requestCache.delete(cacheKeyToUse); throw error; }
}

async function performRequest(method, url, data, retries, timeout) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        signal: controller.signal,
      };
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        if (data instanceof FormData) {
          delete options.headers['Content-Type'];
          options.body = data;
        } else options.body = JSON.stringify(data);
      }
      const response = await fetch(url, options);
      clearTimeout(timeoutId);
      if (!response.ok) throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) throw error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError || new Error('Request failed after retries');
}

function getAuthToken() {
  try {
    const tokenJson = localStorage.getItem('sms_auth_token');
    if (!tokenJson) return '';
    return typeof tokenJson === 'string' && tokenJson.startsWith('"')
      ? JSON.parse(tokenJson) : tokenJson || '';
  } catch { return ''; }
}

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; this.name = 'ApiError'; }
}

// ── TEACHER API ──
export const teacherApi = {
  async getClassAttendance(classId, date) {
    return makeRequest('GET', `/teacher/attendance/class/${classId}?date=${date}`);
  },
  async markAttendance(classId, date, entries) {
    return makeRequest('POST', '/teacher/attendance/mark', { classId, date, entries });
  },
  async getGradingTemplates(subject = null) {
    const query = subject ? `?subject=${subject}` : '';
    return makeRequest('GET', `/teacher/grading/templates${query}`);
  },
  async bulkGradeSubmissions(assignmentId, grades, templateId = null) {
    return makeRequest('POST', '/teacher/grading/bulk', { assignmentId, grades, templateId });
  },
  async getClassAnalytics(classId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/analytics/class/${classId}${query}`);
  },
  async getClassTrends(classId, months = 6) {
    return makeRequest('GET', `/teacher/analytics/class/${classId}/trends?months=${months}`);
  },
  async getStudentProgress(studentId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/progress/student/${studentId}${query}`);
  },
  async getStudentTimeline(studentId) {
    return makeRequest('GET', `/teacher/progress/student/${studentId}/timeline`);
  },
  async createNotification(notification) {
    return makeRequest('POST', '/teacher/notifications', notification);
  },
  async getNotifications(page = 1, limit = 20) {
    return makeRequest('GET', `/teacher/notifications?page=${page}&limit=${limit}`);
  },
  async getUnreadCount() {
    return makeRequest('GET', '/teacher/notifications/unread-count');
  },
  async createNote(classId, note, files = null) {
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', note.title);
    formData.append('content', note.content);
    formData.append('category', note.category);
    formData.append('tags', JSON.stringify(note.tags));
    if (files) files.forEach(file => formData.append('files', file));
    return makeRequest('POST', '/teacher/notes', formData, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
  },
  async getNotes(classId, category = null, tag = null) {
    let query = `?classId=${classId}`;
    if (category) query += `&category=${category}`;
    if (tag) query += `&tag=${tag}`;
    return makeRequest('GET', `/teacher/notes/class/${classId}${query}`);
  },
  async updateNote(noteId, updates) { return makeRequest('PUT', `/teacher/notes/${noteId}`, updates); },
  async deleteNote(noteId) { return makeRequest('DELETE', `/teacher/notes/${noteId}`); },
  async getMessageTemplates(category = null) {
    const query = category ? `?category=${category}` : '';
    return makeRequest('GET', `/teacher/message-templates${query}`);
  },
  async createMessageTemplate(template) { return makeRequest('POST', '/teacher/message-templates', template); },
  async sendMessage(recipientId, classId, content, templateId = null) {
    return makeRequest('POST', '/teacher/messages/quick', { recipientId, classId, content, templateId });
  },
  async generateClassReport(classId, format = 'json', term = null) {
    const query = `?format=${format}${term ? `&term=${term}` : ''}`;
    return makeRequest('GET', `/teacher/reports/class/${classId}${query}`);
  },
  async generateStudentReport(studentId, format = 'json', term = null) {
    const query = `?format=${format}${term ? `&term=${term}` : ''}`;
    return makeRequest('GET', `/teacher/reports/student/${studentId}${query}`);
  },
  async getDashboard() { return makeRequest('GET', '/teacher/dashboard', null, { cacheKey: 'teacher:dashboard' }); },
  async exportAttendance(classId, startDate, endDate, format = 'csv') {
    return makeRequest('GET', `/teacher/export/attendance?classId=${classId}&startDate=${startDate}&endDate=${endDate}&format=${format}`);
  },
  async exportGrades(classId, subject = null, term = null, format = 'csv') {
    let query = `?classId=${classId}&format=${format}`;
    if (subject) query += `&subject=${subject}`;
    if (term) query += `&term=${term}`;
    return makeRequest('GET', `/teacher/export/grades${query}`);
  },
  async exportStudents(classId, format = 'csv') {
    return makeRequest('GET', `/teacher/export/students?classId=${classId}&format=${format}`);
  },
  async getInsights() { return makeRequest('GET', '/teacher/insights', null, { cacheKey: 'teacher:insights' }); },
  async getProductivityScore() { return makeRequest('GET', '/teacher/productivity/score'); },
  async getMessageDeliveryStatus(messageId) { return makeRequest('GET', `/teacher/messages/${messageId}/delivery-status`); },
  async getFilterOptions(collection) { return makeRequest('GET', `/teacher/filter/options?collection=${collection}`); },
  async performAdvancedSearch(searchTerm, collections, filters = null) {
    return makeRequest('POST', '/teacher/search/advanced', { searchTerm, collections, filters });
  },
  async getShortcuts() { return makeRequest('GET', '/teacher/shortcuts', null, { cacheKey: 'teacher:shortcuts' }); },
  async updateShortcut(action, keys) { return makeRequest('PUT', `/teacher/shortcuts/${action}`, { keys }); },
  async trackShortcut(action) { return makeRequest('POST', `/teacher/shortcuts/${action}/track`); },
  async getShortcutStats(days = 7) { return makeRequest('GET', `/teacher/shortcuts/stats?days=${days}`); },
  async analyzeAttendance(studentId, classId) { return makeRequest('GET', `/teacher/ai/attendance-analysis/${studentId}?classId=${classId}`); },
  async identifyLearningGaps(studentId, classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/teacher/ai/learning-gaps/${studentId}${query}`);
  },
  async predictPerformance(studentId, classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/teacher/ai/performance-prediction/${studentId}${query}`);
  },
  async recommendAssignment(classId, subject) { return makeRequest('GET', `/teacher/ai/assignment-recommendation/${classId}?subject=${subject}`); },
  async generateClassInsights(classId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/ai/class-insights/${classId}${query}`);
  },
  async generateFeedback(submissionId, marks, maxMarks, rubric = null) {
    return makeRequest('POST', '/teacher/ai/generate-feedback', { submissionId, marks, maxMarks, rubric });
  },

  // ── Library (Teacher can view) ──
  async getLibraryBooks() { return makeRequest('GET', '/school/library/books', null, { cacheKey: 'library:books' }); },
  async getLibraryTransactions() { return makeRequest('GET', '/school/library/transactions'); },

  // ── Assignments with Supplies ──
  async createAssignmentWithSupplies(data) { return makeRequest('POST', '/school/assignments-with-supplies', data, { useCache: false }); },
  async updateAssignmentSupplies(assignmentId, data) { return makeRequest('PATCH', `/school/assignments/${assignmentId}/supplies`, data, { useCache: false }); },

  // ── Book Heavy Day ──
  async analyzeBookLoad(classId, date) { return makeRequest('GET', `/school/book-load/${classId}/${date}`); },
  async sendBookHeavyAlert(data) { return makeRequest('POST', '/school/book-load-alert', data, { useCache: false }); },

// ── Uniform Schedule ──
   async createUniformSchedule(data) { return makeRequest('POST', '/school/uniform-schedules', data, { useCache: false }); },
   async getUniformSchedule(classId, date) { return makeRequest('GET', `/school/uniform-schedules/${classId}/${date}`); },

   // ── Parent Dashboard ──
   async getParentDashboard() { return makeRequest('GET', '/parent/dashboard'); },

   // ── Parent Book Heavy Alerts ──
   async getBookHeavyAlerts() { return makeRequest('GET', '/parent/book-alerts'); },

   // ── Supply Analytics (Teacher) ──
   async getSupplyAnalytics() { return makeRequest('GET', '/teacher/supply-analytics'); },

   // ── Student Supply Alerts ──
   async getStudentSupplyAlerts() { return makeRequest('GET', '/student/supply-alerts'); },

   // ── Bulk Parent Notification (Teacher/Admin) ──
   async sendBulkParentNotification(data) { return makeRequest('POST', '/parent/send-bulk-notification', data, { useCache: false }); },

   // ── Lost & Found ──
  async getLostItems(params = {}) {
    const qp = new URLSearchParams(params).toString();
    return makeRequest('GET', `/lost-and-found?${qp}`);
  },
  async getMyLostItems() { return makeRequest('GET', '/lost-and-found/my'); },
  async createLostItem(data) { return makeRequest('POST', '/lost-and-found', data, { useCache: false }); },
  async claimLostItem(itemId, data) { return makeRequest('POST', `/lost-and-found/${itemId}/claim`, data, { useCache: false }); },
  async deleteLostItem(itemId) { return makeRequest('DELETE', `/lost-and-found/${itemId}`); },

  // ── Anonymous Reports ──
  async getReports(params = {}) {
    const qp = new URLSearchParams(params).toString();
    return makeRequest('GET', `/reports?${qp}`);
  },
  async getReportById(reportId) { return makeRequest('GET', `/reports/${reportId}`); },
  async createReport(data) { return makeRequest('POST', '/reports', data, { useCache: false }); },
  async updateReportStatus(reportId, data) { return makeRequest('PATCH', `/reports/${reportId}/status`, data, { useCache: false }); },

  // ── Clinic / Health Records ──
  async submitHealthRecord(data) { return makeRequest('POST', '/clinic/records', data, { useCache: false }); },
  async getHealthRecords(studentId, params = {}) {
    const qp = new URLSearchParams(params).toString();
    return makeRequest('GET', `/clinic/records/${studentId}?${qp}`);
  },
  async sendClinicAlert(data) { return makeRequest('POST', '/clinic/alerts', data, { useCache: false }); },
  async getClinicAlerts(params = {}) {
    const qp = new URLSearchParams(params).toString();
    return makeRequest('GET', `/clinic/alerts?${qp}`);
  },
  async getClinicDashboard() { return makeRequest('GET', '/clinic/dashboard'); },

  // ── IT Helpdesk ──
  async createTicket(data) { return makeRequest('POST', '/helpdesk', data, { useCache: false }); },
  async getTickets(params = {}) {
    const qp = new URLSearchParams(params).toString();
    return makeRequest('GET', `/helpdesk?${qp}`);
  },
  async updateTicket(ticketId, data) { return makeRequest('PATCH', `/helpdesk/${ticketId}`, data, { useCache: false }); },
  async assignTicket(ticketId, data) { return makeRequest('POST', `/helpdesk/${ticketId}/assign`, data, { useCache: false }); },
  async resolveTicket(ticketId, data) { return makeRequest('POST', `/helpdesk/${ticketId}/resolve`, data, { useCache: false }); },
  async getDeviceInventory() { return makeRequest('GET', '/helpdesk/devices'); },
  async requestDevice(data) { return makeRequest('POST', '/helpdesk/devices/request', data, { useCache: false }); },
};

// ── STUDENT API ──
export const studentApi = {
  async getProfile() { return makeRequest('GET', '/student/profile', null, { cacheKey: 'student:profile' }); },
  async getExpandedProfile(studentId) { return makeRequest('GET', `/school/students/${studentId}/profile`, null, { cacheKey: `student:expanded-profile:${studentId}` }); },
  async updateProfile(updates) { return makeRequest('PUT', '/student/profile', updates, { useCache: false }); },
  async getDashboard() { return makeRequest('GET', '/student/dashboard', null, { cacheKey: 'student:dashboard' }); },
  async getGrades(subject = null, term = null) {
    let query = '?';
    if (subject) query += `subject=${subject}&`;
    if (term) query += `term=${term}`;
    return makeRequest('GET', `/student/grades${query}`, null, { cacheKey: `student:grades:${subject}:${term}` });
  },
  async getAttendance(startDate = null, endDate = null, subject = null) {
    let query = '?';
    if (startDate) query += `startDate=${startDate}&`;
    if (endDate) query += `endDate=${endDate}&`;
    if (subject) query += `subject=${subject}`;
    return makeRequest('GET', `/student/attendance${query}`, null, { cacheKey: 'student:attendance' });
  },
  async getAssignments(status = null) {
    const query = status ? `?status=${status}` : '';
    return makeRequest('GET', `/student/assignments${query}`, null, { cacheKey: `student:assignments:${status}` });
  },
  async submitAssignment(assignmentId, submission) { return makeRequest('POST', `/school/assignments/${assignmentId}/submissions`, submission, { useCache: false }); },
  async getNotifications() { return makeRequest('GET', '/student/notifications', null, { useCache: false }); },
  async getTimetable() { return makeRequest('GET', '/student/timetable', null, { cacheKey: 'student:timetable' }); },
  async getNotes(classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/school/notes${query}`);
  },
  async getProgress() { return makeRequest('GET', '/student-assistant/analytics'); },

  // ── Library (Student can view all, borrow/return) ──
  async getLibraryBooks() { return makeRequest('GET', '/school/library/books', null, { cacheKey: 'library:books' }); },
  async getLibraryTransactions() { return makeRequest('GET', '/school/library/transactions'); },
  async borrowBook(txData) { return makeRequest('POST', '/school/library/transactions/borrow', txData, { useCache: false }); },
  async returnBook(txId) { return makeRequest('POST', `/school/library/transactions/${txId}/return`, null, { useCache: false }); },

  // ── Digital Fridge (Student side) ──
  async createFridgeItem(data) { return makeRequest('POST', '/school/fridge-items', data, { useCache: false }); },
  async getFridgeItems() { return makeRequest('GET', '/school/fridge-items'); },
  async updateFridgeItem(itemId, data) { return makeRequest('PATCH', `/school/fridge-items/${itemId}`, data, { useCache: false }); },
  async deleteFridgeItem(itemId) { return makeRequest('DELETE', `/school/fridge-items/${itemId}`, null, { useCache: false }); },

  // ── Book Heavy Day (Student can check) ──
  async checkBookLoad(classId, date) { return makeRequest('GET', `/school/book-load/${classId}/${date}`); },

  // ── Uniform Schedule (Student can check) ──
  async getUniformSchedule(classId, date) { return makeRequest('GET', `/school/uniform-schedules/${classId}/${date}`); },
  async getTodaysUniform() { return makeRequest('GET', '/school/uniform-today'); },
};

// ── PARENT API ──
export const parentApi = {
  async getProfile() { return makeRequest('GET', '/parent/profile', null, { cacheKey: 'parent:profile' }); },
  async getChildren() { return makeRequest('GET', '/parent/children'); },

  // ── Notifications (Parents receive many types) ──
  async getNotifications() { return makeRequest('GET', '/parent/notifications', null, { useCache: false }); },
  async markNotificationRead(notificationId) { return makeRequest('POST', `/parent/notifications/${notificationId}/read`, null, { useCache: false }); },

  // ── Library (Parents can view transactions for their children) ──
  async getLibraryTransactions() { return makeRequest('GET', '/school/library/transactions'); },

  // ── Digital Fridge (Parent side) ──
  async createFridgeItem(data) { return makeRequest('POST', '/school/fridge-items', data, { useCache: false }); },
  async getFridgeItems() { return makeRequest('GET', '/school/fridge-items'); },
  async updateFridgeItem(itemId, data) { return makeRequest('PATCH', `/school/fridge-items/${itemId}`, data, { useCache: false }); },
  async deleteFridgeItem(itemId) { return makeRequest('DELETE', `/school/fridge-items/${itemId}`, null, { useCache: false }); },

  // ── Book Heavy Day Alerts ──
  async getBookHeavyAlerts() { return makeRequest('GET', '/parent/book-alerts'); },

  // ── Stationery Alerts ──
  async getStationeryAlerts() { return makeRequest('GET', '/parent/supply-alerts'); },

  // ── Uniform Schedule ──
  async getTodaysUniform() { return makeRequest('GET', '/school/uniform-today'); },
  async getUniformSchedule(classId, date) { return makeRequest('GET', `/school/uniform-schedules/${classId}/${date}`); },

  // ── Attendance & Grades ──
  async getAttendance(startDate, endDate, subject) {
    let query = '?';
    if (startDate) query += `startDate=${startDate}&`;
    if (endDate) query += `endDate=${endDate}&`;
    if (subject) query += `subject=${subject}`;
    return makeRequest('GET', `/parent/attendance${query}`);
  },
  async getGrades(subject, term) {
    let query = '?';
    if (subject) query += `subject=${subject}&`;
    if (term) query += `term=${term}`;
    return makeRequest('GET', `/parent/grades${query}`);
  },

  async markNotificationRead(nId) { return makeRequest('POST', `/notifications/${nId}/read`); },

  // ── Bus Tracking ──
  async getBusTracking() { return makeRequest('GET', '/parent/bus-tracking'); },
};

// ── LIBRARY API ──
export const libraryApi = {
  async getLibraryBooks() { return makeRequest('GET', '/school/library/books', null, { cacheKey: 'library:books' }); },
  async getLibraryTransactions() { return makeRequest('GET', '/school/library/transactions'); },
  async addBook(data) { return makeRequest('POST', '/school/library/books', data, { useCache: false }); },
  async updateBook(bookId, data) { return makeRequest('PATCH', `/school/library/books/${bookId}`, data, { useCache: false }); },
  async deleteBook(bookId) { return makeRequest('DELETE', `/school/library/books/${bookId}`, null, { useCache: false }); },
  async issueBook(data) { return makeRequest('POST', '/school/library/transactions/borrow', data, { useCache: false }); },
  async returnBook(txId) { return makeRequest('POST', `/school/library/transactions/${txId}/return`, null, { useCache: false }); },
};

// ── AUTH API ──
export const authApi = {
  async login(email, password) {
    const response = await makeRequest('POST', '/auth/login', { email, password }, { useCache: false });
    if (response.success && response.data?.token) localStorage.setItem('sms_auth_token', response.data.token);
    return response;
  },
  async signup(userData) {
    const response = await makeRequest('POST', '/auth/signup', userData, { useCache: false });
    if (response.success && response.data?.token) localStorage.setItem('sms_auth_token', response.data.token);
    return response;
  },
  async logout() { localStorage.removeItem('sms_auth_token'); clearCache(); },
  async getCurrentUser() { return makeRequest('GET', '/auth/me'); },
  async updateProfile(updates) { return makeRequest('PUT', '/auth/profile', updates); },
};

// ── UTILITY ──
export const apiUtils = { clearCache, getCachedData, setCachedData, getAuthToken, setAuthToken: (t) => localStorage.setItem('sms_auth_token', t), removeAuthToken: () => localStorage.removeItem('sms_auth_token') };

const httpMethods = {
  get: (endpoint, options = {}) => makeRequest('GET', endpoint, null, options),
  post: (endpoint, data, options = {}) => makeRequest('POST', endpoint, data, options),
  put: (endpoint, data, options = {}) => makeRequest('PUT', endpoint, data, options),
  patch: (endpoint, data, options = {}) => makeRequest('PATCH', endpoint, data, options),
  delete: (endpoint, options = {}) => makeRequest('DELETE', endpoint, null, options),
};

export default { ...httpMethods, teacherApi, studentApi, parentApi, authApi, apiUtils };