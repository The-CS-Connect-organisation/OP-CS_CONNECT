// Data structure helpers for localStorage
export const KEYS = {
  USERS: 'sms_users',
  CURRENT_USER: 'sms_current_user',
  ASSIGNMENTS: 'sms_assignments',
  ATTENDANCE: 'sms_attendance',
  MARKS: 'sms_marks',
  TIMETABLE: 'sms_timetable',
  NOTES: 'sms_notes',
  ANNOUNCEMENTS: 'sms_announcements',
  NOTIFICATIONS: 'sms_notifications',
  FEES: 'sms_fees',           // ← Added for Fee Management
  NOTE_REQUESTS: 'sms_note_requests',
  CHAT_MESSAGES: 'sms_chat_messages',
  // Call signalling is stored under per-room localStorage keys for scalability.
  THEME: 'sms_theme',
};
// ... rest of the file stays the same

export const getFromStorage = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving to ${key}:`, e);
    return false;
  }
};

export const removeFromStorage = (key) => {
  localStorage.removeItem(key);
};