/**
 * API Data Layer
 * Centralized API communication layer with caching, error handling, and retry logic
 * Abstracts all HTTP calls to backend API
 */

// Hardcoded for GitHub Pages deployment - .env files don't work on static hosting
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://op-csconnect-backend-production.up.railway.app/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// In-memory cache
const cache = new Map();
const requestCache = new Map();

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Get cached data
 */
function getCachedData(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return cached.data;
}

/**
 * Set cached data
 */
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache
 */
function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

// ============================================================================
// REQUEST HANDLING
// ============================================================================

/**
 * Make HTTP request with retry logic
 */
async function makeRequest(method, endpoint, data = null, options = {}) {
  const {
    useCache = true,
    cacheKey = null,
    retries = MAX_RETRIES,
    timeout = 30000,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKeyToUse = cacheKey || `${method}:${endpoint}`;

  // Check cache for GET requests
  if (method === 'GET' && useCache) {
    const cached = getCachedData(cacheKeyToUse);
    if (cached) {
      console.log(`[Cache Hit] ${endpoint}`);
      return { success: true, data: cached, fromCache: true };
    }
  }

  // Prevent duplicate requests
  if (requestCache.has(cacheKeyToUse)) {
    return requestCache.get(cacheKeyToUse);
  }

  const requestPromise = performRequest(method, url, data, retries, timeout)
    .then(response => {
      // Cache successful GET responses
      if (method === 'GET' && useCache && response.success) {
        setCachedData(cacheKeyToUse, response.data);
      }

      // Clear related caches on mutations
      if (method !== 'GET') {
        clearCache(endpoint.split('/')[1]); // Clear cache for the resource type
      }

      return response;
    })
    .catch(error => {
      // Remove from cache on error
      requestCache.delete(cacheKeyToUse);
      throw error;
    })
    .finally(() => {
      // Clean up request cache after completion
      setTimeout(() => requestCache.delete(cacheKeyToUse), 100);
    });

  requestCache.set(cacheKeyToUse, requestPromise);

  try {
    return await requestPromise;
  } catch (error) {
    requestCache.delete(cacheKeyToUse);
    throw error;
  }
}

/**
 * Perform actual HTTP request with retry logic
 */
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
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Retry on server errors or network errors
      if (attempt < retries) {
        const delay = RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.warn(`[Retry ${attempt + 1}/${retries}] ${url} - Retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Get auth token
 */
function getAuthToken() {
  try {
    const tokenJson = localStorage.getItem('sms_auth_token');
    if (!tokenJson) {
      console.warn('No auth token found');
      return '';
    }
    // Parse if it's JSON (stored by setToStorage), otherwise use as-is
    const token = typeof tokenJson === 'string' && tokenJson.startsWith('"') 
      ? JSON.parse(tokenJson) 
      : tokenJson;
    return token || '';
  } catch (e) {
    console.warn('Error parsing auth token:', e);
    return '';
  }
}

// ============================================================================
// API ERROR CLASS
// ============================================================================

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// ============================================================================
// TEACHER API
// ============================================================================

export const teacherApi = {
  // Attendance
  async getClassAttendance(classId, date) {
    return makeRequest('GET', `/teacher/attendance/class/${classId}?date=${date}`);
  },

  async markAttendance(classId, date, entries) {
    return makeRequest('POST', '/teacher/attendance/mark', {
      classId,
      date,
      entries,
    });
  },

  // Grading
  async createGradingTemplate(template) {
    return makeRequest('POST', '/teacher/grading/templates', template);
  },

  async getGradingTemplates(subject = null) {
    const query = subject ? `?subject=${subject}` : '';
    return makeRequest('GET', `/teacher/grading/templates${query}`);
  },

  async bulkGradeSubmissions(assignmentId, grades, templateId = null) {
    return makeRequest('POST', '/teacher/grading/bulk', {
      assignmentId,
      grades,
      templateId,
    });
  },

  // Analytics
  async getClassAnalytics(classId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/analytics/class/${classId}${query}`);
  },

  async getClassTrends(classId, months = 6) {
    return makeRequest('GET', `/teacher/analytics/class/${classId}/trends?months=${months}`);
  },

  // Progress Tracking
  async getStudentProgress(studentId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/progress/student/${studentId}${query}`);
  },

  async getStudentTimeline(studentId) {
    return makeRequest('GET', `/teacher/progress/student/${studentId}/timeline`);
  },

  // Notifications
  async createNotification(notification) {
    return makeRequest('POST', '/teacher/notifications', notification);
  },

  async getNotifications(page = 1, limit = 20) {
    return makeRequest('GET', `/teacher/notifications?page=${page}&limit=${limit}`);
  },

  async getUnreadCount() {
    return makeRequest('GET', '/teacher/notifications/unread-count');
  },

  // Class Notes
  async createNote(classId, note, files = null) {
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('title', note.title);
    formData.append('content', note.content);
    formData.append('category', note.category);
    formData.append('tags', JSON.stringify(note.tags));

    if (files) {
      files.forEach(file => formData.append('files', file));
    }

    return makeRequest('POST', '/teacher/notes', formData, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
  },

  async getNotes(classId, category = null, tag = null) {
    let query = `?classId=${classId}`;
    if (category) query += `&category=${category}`;
    if (tag) query += `&tag=${tag}`;
    return makeRequest('GET', `/teacher/notes/class/${classId}${query}`);
  },

  async updateNote(noteId, updates) {
    return makeRequest('PUT', `/teacher/notes/${noteId}`, updates);
  },

  async deleteNote(noteId) {
    return makeRequest('DELETE', `/teacher/notes/${noteId}`);
  },

  // Messaging
  async getMessageTemplates(category = null) {
    const query = category ? `?category=${category}` : '';
    return makeRequest('GET', `/teacher/message-templates${query}`);
  },

  async createMessageTemplate(template) {
    return makeRequest('POST', '/teacher/message-templates', template);
  },

  async sendMessage(recipientId, classId, content, templateId = null) {
    return makeRequest('POST', '/teacher/messages/quick', {
      recipientId,
      classId,
      content,
      templateId,
    });
  },

  // Reports
  async generateClassReport(classId, format = 'json', term = null) {
    const query = `?format=${format}${term ? `&term=${term}` : ''}`;
    return makeRequest('GET', `/teacher/reports/class/${classId}${query}`);
  },

  async generateStudentReport(studentId, format = 'json', term = null) {
    const query = `?format=${format}${term ? `&term=${term}` : ''}`;
    return makeRequest('GET', `/teacher/reports/student/${studentId}${query}`);
  },

  // Dashboard
  async getDashboard() {
    return makeRequest('GET', '/teacher/dashboard', null, {
      cacheKey: 'teacher:dashboard',
    });
  },

  // Data Export
  async exportAttendance(classId, startDate, endDate, format = 'csv') {
    const query = `?classId=${classId}&startDate=${startDate}&endDate=${endDate}&format=${format}`;
    return makeRequest('GET', `/teacher/export/attendance${query}`);
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

  // Insights
  async getInsights() {
    return makeRequest('GET', '/teacher/insights', null, {
      cacheKey: 'teacher:insights',
    });
  },

  // Productivity Score
  async getProductivityScore() {
    return makeRequest('GET', '/teacher/productivity/score');
  },

  // Message Delivery
  async getMessageDeliveryStatus(messageId) {
    return makeRequest('GET', `/teacher/messages/${messageId}/delivery-status`);
  },

  // Advanced Search
  async getFilterOptions(collection) {
    return makeRequest('GET', `/teacher/filter/options?collection=${collection}`);
  },

  async performAdvancedSearch(searchTerm, collections, filters = null) {
    return makeRequest('POST', '/teacher/search/advanced', {
      searchTerm,
      collections,
      filters,
    });
  },

  // Keyboard Shortcuts
  async getShortcuts() {
    return makeRequest('GET', '/teacher/shortcuts', null, {
      cacheKey: 'teacher:shortcuts',
    });
  },

  async updateShortcut(action, keys) {
    return makeRequest('PUT', `/teacher/shortcuts/${action}`, { keys });
  },

  async trackShortcut(action) {
    return makeRequest('POST', `/teacher/shortcuts/${action}/track`);
  },

  async getShortcutStats(days = 7) {
    return makeRequest('GET', `/teacher/shortcuts/stats?days=${days}`);
  },

  // AI Features
  async analyzeAttendance(studentId, classId) {
    return makeRequest('GET', `/teacher/ai/attendance-analysis/${studentId}?classId=${classId}`);
  },

  async identifyLearningGaps(studentId, classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/teacher/ai/learning-gaps/${studentId}${query}`);
  },

  async predictPerformance(studentId, classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/teacher/ai/performance-prediction/${studentId}${query}`);
  },

  async recommendAssignment(classId, subject) {
    return makeRequest('GET', `/teacher/ai/assignment-recommendation/${classId}?subject=${subject}`);
  },

  async generateClassInsights(classId, term = null) {
    const query = term ? `?term=${term}` : '';
    return makeRequest('GET', `/teacher/ai/class-insights/${classId}${query}`);
  },

  async generateFeedback(submissionId, marks, maxMarks, rubric = null) {
    return makeRequest('POST', '/teacher/ai/generate-feedback', {
      submissionId,
      marks,
      maxMarks,
      rubric,
    });
  },
};

// ============================================================================
// STUDENT API
// ============================================================================

export const studentApi = {
  // Profile
  async getProfile() {
    return makeRequest('GET', '/student/profile', null, { cacheKey: 'student:profile' });
  },

  async getExpandedProfile(studentId) {
    return makeRequest('GET', `/school/students/${studentId}/profile`, null, { cacheKey: `student:expanded-profile:${studentId}` });
  },

  async updateProfile(updates) {
    return makeRequest('PUT', '/student/profile', updates, { useCache: false });
  },

  // Dashboard
  async getDashboard() {
    return makeRequest('GET', '/student/dashboard', null, { cacheKey: 'student:dashboard' });
  },

  // Grades
  async getGrades(subject = null, term = null) {
    let query = '?';
    if (subject) query += `subject=${subject}&`;
    if (term) query += `term=${term}`;
    return makeRequest('GET', `/student/grades${query}`, null, { cacheKey: `student:grades:${subject}:${term}` });
  },

  // Attendance
  async getAttendance(startDate = null, endDate = null, subject = null) {
    let query = '?';
    if (startDate) query += `startDate=${startDate}&`;
    if (endDate) query += `endDate=${endDate}&`;
    if (subject) query += `subject=${subject}`;
    return makeRequest('GET', `/student/attendance${query}`, null, { cacheKey: 'student:attendance' });
  },

  // Assignments
  async getAssignments(status = null) {
    const query = status ? `?status=${status}` : '';
    return makeRequest('GET', `/student/assignments${query}`, null, { cacheKey: `student:assignments:${status}` });
  },

  async submitAssignment(assignmentId, submission) {
    return makeRequest('POST', `/school/assignments/${assignmentId}/submissions`, submission, { useCache: false });
  },

  // Notifications
  async getNotifications() {
    return makeRequest('GET', '/student/notifications', null, { useCache: false });
  },

  // Timetable
  async getTimetable() {
    return makeRequest('GET', '/student/timetable', null, { cacheKey: 'student:timetable' });
  },

  // Notes (from school routes)
  async getNotes(classId = null) {
    const query = classId ? `?classId=${classId}` : '';
    return makeRequest('GET', `/school/notes${query}`);
  },

  // Progress (from student-assistant)
  async getProgress() {
    return makeRequest('GET', '/student-assistant/analytics');
  },
};

// ============================================================================
// STUDENT ASSISTANT API (AI-Powered Study Companion)
// ============================================================================

export const studentAssistantApi = {
  // AI Doubt Resolution
  async resolveDoubt(question, subject = null, context = null, imageUrl = null) {
    return makeRequest('POST', '/student-assistant/doubts/resolve', {
      question,
      subject,
      context,
      imageUrl,
    }, { useCache: false });
  },

  async getDoubtHistory(subject = null, page = 1, limit = 20) {
    let query = `?page=${page}&limit=${limit}`;
    if (subject) query += `&subject=${subject}`;
    return makeRequest('GET', `/student-assistant/doubts/history${query}`);
  },

  // Study Plan
  async generateStudyPlan(days = 7, focusAreas = [], examDate = null) {
    return makeRequest('POST', '/student-assistant/study-plan/generate', {
      days,
      focusAreas,
      examDate,
    }, { useCache: false });
  },

  async getStudyPlan(planId) {
    return makeRequest('GET', `/student-assistant/study-plan/${planId}`);
  },

  async updateStudyPlanProgress(planId, taskId, completed) {
    return makeRequest('PATCH', `/student-assistant/study-plan/${planId}/progress`, {
      taskId,
      completed,
    }, { useCache: false });
  },

  // Flashcards
  async generateFlashcards(text, subject, topic) {
    return makeRequest('POST', '/student-assistant/flashcards/generate', {
      text,
      subject,
      topic,
    }, { useCache: false });
  },

  async getFlashcards(subject = null) {
    const query = subject ? `?subject=${subject}` : '';
    return makeRequest('GET', `/student-assistant/flashcards${query}`);
  },

  async reviewFlashcard(setId, cardId, rating) {
    return makeRequest('POST', '/student-assistant/flashcards/review', {
      setId,
      cardId,
      rating,
    }, { useCache: false });
  },

  // Practice Tests
  async generatePracticeTest(subject, topic, difficulty = 'medium', questionCount = 10, timeLimit = null) {
    return makeRequest('POST', '/student-assistant/practice-tests/generate', {
      subject,
      topic,
      difficulty,
      questionCount,
      timeLimit,
    }, { useCache: false });
  },

  async submitPracticeTest(testId, answers) {
    return makeRequest('POST', `/student-assistant/practice-tests/${testId}/submit`, {
      answers,
    }, { useCache: false });
  },

  async getPracticeTests(subject = null, status = 'all') {
    let query = '';
    if (subject) query += `?subject=${subject}`;
    if (status !== 'all') query += `&status=${status}`;
    return makeRequest('GET', `/student-assistant/practice-tests${query}`);
  },

  // Study Analytics
  async getStudyAnalytics(period = 30) {
    return makeRequest('GET', `/student-assistant/analytics?period=${period}`);
  },

  // AI Answer Scorer
  async scoreAnswer(text, subject = 'english', questionPrompt = null, maxScore = 10, imageUrl = null) {
    return makeRequest('POST', '/student-assistant/score-answer', {
      text,
      subject,
      questionPrompt,
      maxScore,
      imageUrl,
    }, { useCache: false });
  },

  async getAnswerAnalysisHistory(subject = null, page = 1, limit = 20) {
    let query = `?page=${page}&limit=${limit}`;
    if (subject) query += `&subject=${subject}`;
    return makeRequest('GET', `/student-assistant/answer-history${query}`);
  },
};

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(email, password) {
    const response = await makeRequest('POST', '/auth/login', {
      email,
      password,
    }, { useCache: false });

    if (response.success && response.data?.token) {
      localStorage.setItem('sms_auth_token', response.data.token);
    }

    return response;
  },

  async signup(userData) {
    const response = await makeRequest('POST', '/auth/signup', userData, {
      useCache: false,
    });

    if (response.success && response.data?.token) {
      localStorage.setItem('sms_auth_token', response.data.token);
    }

    return response;
  },

  async logout() {
    localStorage.removeItem('sms_auth_token');
    clearCache();
  },

  async getCurrentUser() {
    return makeRequest('GET', '/auth/me');
  },

  async updateProfile(updates) {
    return makeRequest('PUT', '/auth/profile', updates);
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const apiUtils = {
  clearCache,
  getCachedData,
  setCachedData,
  getAuthToken,
  setAuthToken: (token) => localStorage.setItem('sms_auth_token', token),
  removeAuthToken: () => localStorage.removeItem('sms_auth_token'),
};

// ============================================================================
// GENERIC HTTP METHODS (for direct API calls)
// ============================================================================

const httpMethods = {
  get: (endpoint, options = {}) => makeRequest('GET', endpoint, null, options),
  post: (endpoint, data, options = {}) => makeRequest('POST', endpoint, data, options),
  put: (endpoint, data, options = {}) => makeRequest('PUT', endpoint, data, options),
  patch: (endpoint, data, options = {}) => makeRequest('PATCH', endpoint, data, options),
  delete: (endpoint, options = {}) => makeRequest('DELETE', endpoint, null, options),
};

export default {
  ...httpMethods,
  teacherApi,
  studentApi,
  authApi,
  apiUtils,
};
