// Data structure helpers - Firebase only (no localStorage)
export const KEYS = {
  USERS: 'sms_users',
  CURRENT_USER: 'sms_current_user',
  AUTH_TOKEN: 'sms_auth_token',
  ASSIGNMENTS: 'sms_assignments',
  ATTENDANCE: 'sms_attendance',
  MARKS: 'sms_marks',
  EXAMS: 'sms_exams',
  TIMETABLE: 'sms_timetable',
  NOTES: 'sms_notes',
  ANNOUNCEMENTS: 'sms_announcements',
  NOTIFICATIONS: 'sms_notifications',
  FEES: 'sms_fees',
  NOTE_REQUESTS: 'sms_note_requests',
  CHAT_MESSAGES: 'sms_chat_messages',
  PAYROLL: 'sms_payroll',
  HR_RECORDS: 'sms_hr_records',
  THEME: 'sms_theme',
  STUDENT_XP: 'sms_student_xp',
  BADGES: 'sms_badges',
  STUDY_ACTIVITY: 'sms_study_activity',
  GOALS: 'sms_goals',
  WEEKLY_CHALLENGE: 'sms_weekly_challenge',
};
export const STORAGE_EVENT = 'sms_storage_changed';

const emitStorageChange = (key) => {
  // Allow this file to be imported safely in non-browser environments.
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
};

// Stub functions - all data comes from Firebase, except CURRENT_USER which uses localStorage for session persistence
export const getFromStorage = (key, defaultValue = null) => {
  // Only CURRENT_USER and AUTH_TOKEN use localStorage for session persistence
  if (key === KEYS.CURRENT_USER || key === KEYS.AUTH_TOKEN) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading from localStorage for ${key}:`, err);
      return defaultValue;
    }
  }
  // All other data comes from Firebase - return default value
  return defaultValue;
};

export const setToStorage = (key, value) => {
  // Only CURRENT_USER and AUTH_TOKEN use localStorage for session persistence
  if (key === KEYS.CURRENT_USER || key === KEYS.AUTH_TOKEN) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing to localStorage for ${key}:`, err);
    }
  }
  emitStorageChange(key);
  return true;
};

export const removeFromStorage = (key) => {
  // Only CURRENT_USER and AUTH_TOKEN use localStorage
  if (key === KEYS.CURRENT_USER || key === KEYS.AUTH_TOKEN) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing from localStorage for ${key}:`, err);
    }
  }
  emitStorageChange(key);
};