import { KEYS, getFromStorage, setToStorage } from './schema';
import { getDataMode, DATA_MODES } from '../config/dataMode';

export const initializeApp = () => {
  const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDate(d);
  };

  const seedUsers = () => {
    // ONLY ALICIA MORGAN - NO OTHER DEMO ACCOUNTS
    return [
      { id: 'admin-1', name: 'Alicia Morgan', email: 'admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(420), phone: '+91 90000 00001' },
    ];
  };

  // Check data mode - only seed in LOCAL_DEMO mode
  const dataMode = getDataMode();
  console.log('🌱 Data mode:', dataMode);

  if (dataMode === DATA_MODES.REMOTE_API) {
    console.log('🌱 REMOTE_API mode - skipping local seed (data comes from backend)');
    return;
  }

  // Force re-seed when seed data structure changes
  const SEED_VERSION = 6; // Bumped for clean slate
  const storedVersion = getFromStorage('sms_seed_version', 0);
  console.log('🌱 Seed initialization - storedVersion:', storedVersion, 'SEED_VERSION:', SEED_VERSION);
  if (storedVersion < SEED_VERSION) {
    console.log('🌱 Version mismatch - clearing all demo data');
    // Clear all demo data
    setToStorage(KEYS.USERS, null);
    setToStorage(KEYS.FEES, null);
    setToStorage(KEYS.ATTENDANCE, null);
    setToStorage(KEYS.CURRENT_USER, null);
    setToStorage(KEYS.AUTH_TOKEN, null);
    setToStorage(KEYS.ASSIGNMENTS, null);
    setToStorage(KEYS.MARKS, null);
    setToStorage(KEYS.TIMETABLE, null);
    setToStorage(KEYS.NOTES, null);
    setToStorage(KEYS.ANNOUNCEMENTS, null);
    setToStorage(KEYS.NOTIFICATIONS, null);
    setToStorage('sms_seed_version', SEED_VERSION);
  }

  // Ensure `users` exists - only Alicia Morgan
  let users = getFromStorage(KEYS.USERS, null);
  console.log('🌱 Users from storage:', users?.length || 0, 'user(s)');
  if (!Array.isArray(users) || users.length === 0) {
    console.log('🌱 Seeding Alicia Morgan for LOCAL_DEMO mode...');
    users = seedUsers();
    console.log('🌱 Seeded users:', users.length, 'user(s)');
    setToStorage(KEYS.USERS, users);
    console.log('🌱 Users saved to storage for LOCAL_DEMO mode');
  }

  // Initialize empty collections for new accounts
  const fees = getFromStorage(KEYS.FEES, null);
  if (!Array.isArray(fees)) setToStorage(KEYS.FEES, []);

  const attendance = getFromStorage(KEYS.ATTENDANCE, null);
  if (!Array.isArray(attendance)) setToStorage(KEYS.ATTENDANCE, []);

  const assignments = getFromStorage(KEYS.ASSIGNMENTS, null);
  if (!Array.isArray(assignments)) setToStorage(KEYS.ASSIGNMENTS, []);

  const marks = getFromStorage(KEYS.MARKS, null);
  if (!Array.isArray(marks)) setToStorage(KEYS.MARKS, []);

  const timetable = getFromStorage(KEYS.TIMETABLE, null);
  if (!isObject(timetable)) setToStorage(KEYS.TIMETABLE, {});

  const notes = getFromStorage(KEYS.NOTES, null);
  if (!Array.isArray(notes)) setToStorage(KEYS.NOTES, []);

  const announcements = getFromStorage(KEYS.ANNOUNCEMENTS, null);
  if (!Array.isArray(announcements)) setToStorage(KEYS.ANNOUNCEMENTS, []);

  const notifications = getFromStorage(KEYS.NOTIFICATIONS, null);
  if (!Array.isArray(notifications)) setToStorage(KEYS.NOTIFICATIONS, []);
};
