/**
 * Firebase Service Layer
 * Handles all Firebase Realtime Database operations
 * Replaces localStorage with real-time data from Firebase
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
  limitToLast,
} from 'firebase/database';

// Initialize Firebase (use your config)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ============================================================================
// USERS SERVICE
// ============================================================================

export const firebaseUsersService = {
  /**
   * Get all users
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'users'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  /**
   * Get user by ID
   */
  async getById(userId) {
    try {
      const snapshot = await get(ref(database, `users/${userId}`));
      if (!snapshot.exists()) return null;
      return { id: userId, ...snapshot.val() };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  /**
   * Get user by email
   */
  async getByEmail(email) {
    try {
      const snapshot = await get(
        query(ref(database, 'users'), orderByChild('email'), equalTo(email))
      );
      if (!snapshot.exists()) return null;
      const data = snapshot.val();
      if (!data || typeof data !== 'object') return null;
      const userId = Object.keys(data)[0];
      if (!userId) return null;
      return { id: userId, ...data[userId] };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  /**
   * Create or update user
   */
  async upsert(userId, userData) {
    try {
      await set(ref(database, `users/${userId}`), {
        ...userData,
        updatedAt: new Date().toISOString(),
      });
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  },

  /**
   * Subscribe to user changes
   */
  subscribe(userId, callback) {
    const userRef = ref(database, `users/${userId}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: userId, ...snapshot.val() });
      }
    }, (error) => {
      console.error('Error subscribing to user changes:', error);
      callback(null);
    });
  },

  /**
   * Subscribe to all users
   */
  subscribeAll(callback) {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const users = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(users);
      } else {
        callback([]);
      }
    });
  },
};

// ============================================================================
// ASSIGNMENTS SERVICE
// ============================================================================

export const firebaseAssignmentsService = {
  /**
   * Get all assignments
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'assignments'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  },

  /**
   * Get assignments by class
   */
  async getByClass(classId) {
    try {
      const snapshot = await get(
        query(ref(database, 'assignments'), orderByChild('classId'), equalTo(classId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching assignments by class:', error);
      return [];
    }
  },

  /**
   * Get assignments by teacher
   */
  async getByTeacher(teacherId) {
    try {
      const snapshot = await get(
        query(ref(database, 'assignments'), orderByChild('teacherId'), equalTo(teacherId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching assignments by teacher:', error);
      return [];
    }
  },

  /**
   * Create assignment
   */
  async create(assignmentData) {
    try {
      const newRef = ref(database, `assignments/${Date.now()}`);
      await set(newRef, {
        ...assignmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: Date.now().toString(), ...assignmentData };
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  /**
   * Update assignment
   */
  async update(assignmentId, updates) {
    try {
      await update(ref(database, `assignments/${assignmentId}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { id: assignmentId, ...updates };
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  /**
   * Delete assignment
   */
  async delete(assignmentId) {
    try {
      await remove(ref(database, `assignments/${assignmentId}`));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  /**
   * Subscribe to assignments
   */
  subscribe(callback) {
    const assignmentsRef = ref(database, 'assignments');
    return onValue(assignmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const assignments = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(assignments);
      } else {
        callback([]);
      }
    });
  },
};

// ============================================================================
// SUBMISSIONS SERVICE
// ============================================================================

export const firebaseSubmissionsService = {
  /**
   * Get all submissions
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'submissions'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  /**
   * Get submissions by assignment
   */
  async getByAssignment(assignmentId) {
    try {
      const snapshot = await get(
        query(ref(database, 'submissions'), orderByChild('assignmentId'), equalTo(assignmentId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching submissions by assignment:', error);
      return [];
    }
  },

  /**
   * Get submissions by student
   */
  async getByStudent(studentId) {
    try {
      const snapshot = await get(
        query(ref(database, 'submissions'), orderByChild('studentId'), equalTo(studentId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching submissions by student:', error);
      return [];
    }
  },

  /**
   * Create submission
   */
  async create(submissionData) {
    try {
      const newRef = ref(database, `submissions/${Date.now()}`);
      await set(newRef, {
        ...submissionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: Date.now().toString(), ...submissionData };
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  },

  /**
   * Update submission
   */
  async update(submissionId, updates) {
    try {
      await update(ref(database, `submissions/${submissionId}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { id: submissionId, ...updates };
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },

  /**
   * Subscribe to submissions
   */
  subscribe(callback) {
    const submissionsRef = ref(database, 'submissions');
    return onValue(submissionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const submissions = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(submissions);
      } else {
        callback([]);
      }
    });
  },
};

// ============================================================================
// ATTENDANCE SERVICE
// ============================================================================

export const firebaseAttendanceService = {
  /**
   * Get all attendance records
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'attendance_records'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  /**
   * Get attendance by student
   */
  async getByStudent(studentId) {
    try {
      const snapshot = await get(
        query(ref(database, 'attendance_records'), orderByChild('studentId'), equalTo(studentId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching attendance by student:', error);
      return [];
    }
  },

  /**
   * Get attendance by class
   */
  async getByClass(classId) {
    try {
      const snapshot = await get(
        query(ref(database, 'attendance_records'), orderByChild('classId'), equalTo(classId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching attendance by class:', error);
      return [];
    }
  },

  /**
   * Create attendance record
   */
  async create(attendanceData) {
    try {
      const newRef = ref(database, `attendance_records/${Date.now()}`);
      await set(newRef, {
        ...attendanceData,
        createdAt: new Date().toISOString(),
      });
      return { id: Date.now().toString(), ...attendanceData };
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  },

  /**
   * Update attendance record
   */
  async update(attendanceId, updates) {
    try {
      await update(ref(database, `attendance_records/${attendanceId}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { id: attendanceId, ...updates };
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  /**
   * Subscribe to attendance
   */
  subscribe(callback) {
    const attendanceRef = ref(database, 'attendance_records');
    return onValue(attendanceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const records = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(records);
      } else {
        callback([]);
      }
    });
  },
};

// ============================================================================
// MARKS SERVICE
// ============================================================================

export const firebaseMarksService = {
  /**
   * Get all marks
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'marks'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching marks:', error);
      return [];
    }
  },

  /**
   * Get marks by student
   */
  async getByStudent(studentId) {
    try {
      const snapshot = await get(
        query(ref(database, 'marks'), orderByChild('studentId'), equalTo(studentId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching marks by student:', error);
      return [];
    }
  },

  /**
   * Get marks by class
   */
  async getByClass(classId) {
    try {
      const snapshot = await get(
        query(ref(database, 'marks'), orderByChild('classId'), equalTo(classId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching marks by class:', error);
      return [];
    }
  },

  /**
   * Create mark record
   */
  async create(markData) {
    try {
      const newRef = ref(database, `marks/${Date.now()}`);
      await set(newRef, {
        ...markData,
        createdAt: new Date().toISOString(),
      });
      return { id: Date.now().toString(), ...markData };
    } catch (error) {
      console.error('Error creating mark:', error);
      throw error;
    }
  },

  /**
   * Update mark record
   */
  async update(markId, updates) {
    try {
      await update(ref(database, `marks/${markId}`), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { id: markId, ...updates };
    } catch (error) {
      console.error('Error updating mark:', error);
      throw error;
    }
  },

  /**
   * Subscribe to marks
   */
  subscribe(callback) {
    const marksRef = ref(database, 'marks');
    return onValue(marksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const marks = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(marks);
      } else {
        callback([]);
      }
    });
  },
};

// ============================================================================
// NOTIFICATIONS SERVICE
// ============================================================================

export const firebaseNotificationsService = {
  /**
   * Get all notifications
   */
  async getAll() {
    try {
      const snapshot = await get(ref(database, 'notifications'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Get notifications for user
   */
  async getForUser(userId) {
    try {
      const snapshot = await get(
        query(ref(database, 'notifications'), orderByChild('userId'), equalTo(userId))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching notifications for user:', error);
      return [];
    }
  },

  /**
   * Create notification
   */
  async create(notificationData) {
    try {
      const newRef = ref(database, `notifications/${Date.now()}`);
      await set(newRef, {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false,
      });
      return { id: Date.now().toString(), ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await update(ref(database, `notifications/${notificationId}`), {
        read: true,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Subscribe to notifications
   */
  subscribe(callback) {
    const notificationsRef = ref(database, 'notifications');
    return onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifications = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        callback(notifications);
      } else {
        callback([]);
      }
    });
  },
};

export default {
  firebaseUsersService,
  firebaseAssignmentsService,
  firebaseSubmissionsService,
  firebaseAttendanceService,
  firebaseMarksService,
  firebaseNotificationsService,
};
