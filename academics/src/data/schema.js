// Data structure helpers - Firebase + localStorage fallback
export const KEYS = {
  USERS: 'sms_users',
  STUDENTS: 'sms_students',
  TEACHERS: 'sms_teachers',
  CURRENT_USER: 'sms_current_user',
  AUTH_TOKEN: 'sms_auth_token',
  ASSIGNMENTS: 'sms_assignments',
  ATTENDANCE: 'sms_attendance',
  MARKS: 'sms_marks',
  GRADES: 'sms_grades',
  EXAMS: 'sms_exams',
  TIMETABLE: 'sms_timetable',
  NOTES: 'sms_notes',
  ANNOTATIONS: 'sms_annotations',
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
  SUBMISSIONS: 'sms_submissions',
  EXAM_ATTEMPTS: 'sms_exam_attempts',
  QUESTION_BANK: 'sms_question_bank',
  AUDIT_LOG: 'sms_audit_log',
  LEAVE_REQUESTS: 'sms_leave_requests',
  MEETING_INVITES: 'sms_meeting_invites',
  CONVERSATIONS: 'sms_conversations',
  CALENDAR_EVENTS: 'sms_calendar_events',
  FOCUS_TASKS: 'sms_focus_tasks',
  FOCUS_HISTORY: 'sms_focus_history',
};
export const STORAGE_EVENT = 'sms_storage_changed';

const emitStorageChange = (key) => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
};

// Keys that use localStorage (all data keys for persistence)
const LOCAL_STORAGE_KEYS = new Set([
  KEYS.CURRENT_USER,
  KEYS.AUTH_TOKEN,
  KEYS.THEME,
  KEYS.USERS,
  KEYS.STUDENTS,
  KEYS.TEACHERS,
  KEYS.ASSIGNMENTS,
  KEYS.ATTENDANCE,
  KEYS.MARKS,
  KEYS.GRADES,
  KEYS.EXAMS,
  KEYS.TIMETABLE,
  KEYS.NOTES,
  KEYS.ANNOTATIONS,
  KEYS.ANNOUNCEMENTS,
  KEYS.NOTIFICATIONS,
  KEYS.FEES,
  KEYS.NOTE_REQUESTS,
  KEYS.CHAT_MESSAGES,
  KEYS.PAYROLL,
  KEYS.HR_RECORDS,
  KEYS.STUDENT_XP,
  KEYS.BADGES,
  KEYS.STUDY_ACTIVITY,
  KEYS.GOALS,
  KEYS.WEEKLY_CHALLENGE,
  KEYS.SUBMISSIONS,
  KEYS.EXAM_ATTEMPTS,
  KEYS.QUESTION_BANK,
  KEYS.AUDIT_LOG,
  KEYS.LEAVE_REQUESTS,
  KEYS.MEETING_INVITES,
  KEYS.CONVERSATIONS,
  KEYS.CALENDAR_EVENTS,
  KEYS.FOCUS_TASKS,
  KEYS.FOCUS_HISTORY,
]);

export const getFromStorage = (key, defaultValue = null) => {
  if (!LOCAL_STORAGE_KEYS.has(key)) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try { return JSON.parse(item); } catch { return item; }
  } catch (err) {
    console.error(`Error reading from localStorage for ${key}:`, err);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  if (!LOCAL_STORAGE_KEYS.has(key)) {
    emitStorageChange(key);
    return true;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing to localStorage for ${key}:`, err);
  }
  emitStorageChange(key);
  return true;
};

export const removeFromStorage = (key) => {
  if (!LOCAL_STORAGE_KEYS.has(key)) {
    emitStorageChange(key);
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing from localStorage for ${key}:`, err);
  }
  emitStorageChange(key);
};