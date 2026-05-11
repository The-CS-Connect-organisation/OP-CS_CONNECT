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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
// MESSAGES SERVICE
// ============================================================================

export const firebaseMessagesService = {
  /**
   * Get all messages for a conversation
   * @param {string} conversationId
   */
  async getMessages(conversationId) {
    try {
      const snapshot = await get(
        query(ref(database, `messages/${conversationId}/messages`), orderByChild('timestamp'))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  /**
   * Get conversation metadata
   * @param {string} userId1
   * @param {string} userId2
   */
  async getConversation(userId1, userId2) {
    const convId = [userId1, userId2].sort().join('_');
    try {
      const snapshot = await get(ref(database, `conversations/${convId}`));
      if (!snapshot.exists()) return null;
      return { conversationId: convId, id: convId, ...snapshot.val() };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  /**
   * Get all conversations for a user
   * @param {string} userId
   */
  async getConversations(userId) {
    try {
      const snapshot = await get(ref(database, 'conversations'));
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data)
        .filter(key => key.includes(userId))
        .map(key => ({ id: key, ...data[key] }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Create or update a conversation
   * @param {string} userId1
   * @param {string} userId2
   * @param {object} meta - { user1Name, user2Name, user1Role, user2Role, ... }
   */
  async upsertConversation(userId1, userId2, meta = {}) {
    const convId = [userId1, userId2].sort().join('_');
    try {
      await set(ref(database, `conversations/${convId}`), {
        id: convId,
        participants: [userId1, userId2],
        user1Id: userId1,
        user2Id: userId2,
        user1Name: meta.user1Name || '',
        user2Name: meta.user2Name || '',
        user1Role: meta.user1Role || 'student',
        user2Role: meta.user2Role || 'student',
        lastMessage: meta.lastMessage || '',
        lastMessageTime: meta.lastMessageTime || null,
        lastMessageSender: meta.lastMessageSender || null,
        unread1: meta.unread1 || 0,
        unread2: meta.unread2 || 0,
        groupName: meta.groupName || null,
        isGroup: meta.isGroup || false,
        createdAt: meta.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: convId, ...meta };
    } catch (error) {
      console.error('Error upserting conversation:', error);
      throw error;
    }
  },

  /**
   * Send a message (writes to Firebase RTDB)
   * @param {string} conversationId
   * @param {object} msgData - { senderId, senderName, receiverId, text, attachments }
   */
  async sendMessage(conversationId, msgData) {
    const msgId = ref(database).push().key;
    const timestamp = new Date().toISOString();
    const msg = {
      id: msgId,
      senderId: msgData.senderId,
      senderName: msgData.senderName,
      receiverId: msgData.receiverId,
      text: msgData.text,
      timestamp,
      read: false,
      attachments: msgData.attachments || [],
    };
    try {
      await set(ref(database, `messages/${conversationId}/messages/${msgId}`), msg);
      // Update conversation last message
      await update(ref(database, `conversations/${conversationId}`), {
        lastMessage: (msgData.text || '').substring(0, 80),
        lastMessageTime: timestamp,
        lastMessageSender: msgData.senderId,
        updatedAt: timestamp,
      });
      return msg;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark messages as read for a user
   * @param {string} conversationId
   * @param {string} userId
   */
  async markRead(conversationId, userId) {
    try {
      const snapshot = await get(ref(database, `messages/${conversationId}/messages`));
      if (!snapshot.exists()) return;
      const updates = {};
      snapshot.forEach(child => {
        const msg = child.val();
        if (msg.receiverId === userId && !msg.read) {
          updates[`messages/${conversationId}/messages/${child.key}/read`] = true;
        }
      });
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error marking read:', error);
    }
  },

  /**
   * Subscribe to new messages in a conversation (real-time)
   * @param {string} conversationId
   * @param {function} callback - called with new message
   * @returns unsubscribe function
   */
  subscribeToMessages(conversationId, callback) {
    const messagesRef = query(
      ref(database, `messages/${conversationId}/messages`),
      orderByChild('timestamp'),
      limitToLast(1)
    );
    return onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          callback({ id: child.key, ...child.val() });
        });
      }
    }, (error) => {
      console.error('Messages subscription error:', error);
    });
  },

  /**
   * Subscribe to a conversation's real-time updates
   * @param {string} conversationId
   * @param {function} callback
   * @returns unsubscribe function
   */
  subscribeToConversation(conversationId, callback) {
    const convRef = ref(database, `conversations/${conversationId}`);
    return onValue(convRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.key, ...snapshot.val() });
      }
    }, (error) => {
      console.error('Conversation subscription error:', error);
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

// ============================================================================
// LEADERBOARD SERVICE
// ============================================================================

export const firebaseLeaderboardService = {
  /**
   * Get leaderboard for a class (sorted by XP, top N)
   */
  async getByClass(classId, limitCount = 10) {
    try {
      const snapshot = await get(
        query(ref(database, `leaderboard/${classId}/students`), orderByChild('xp'), limitToFirst(limitCount))
      );
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.entries(data)
        .map(([studentId, val]) => ({ studentId, ...val }))
        .sort((a, b) => b.xp - a.xp);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  /**
   * Upsert a student entry in the leaderboard
   */
  async upsertStudent(classId, studentId, data) {
    try {
      await set(ref(database, `leaderboard/${classId}/students/${studentId}`), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error upserting leaderboard entry:', error);
    }
  },

  /**
   * Increment XP for a student
   */
  async addXP(classId, studentId, xpAmount) {
    try {
      const studentRef = ref(database, `leaderboard/${classId}/students/${studentId}`);
      const snapshot = await get(studentRef);
      const current = snapshot.exists() ? snapshot.val() : {};
      const newXP = (current.xp || 0) + xpAmount;
      await set(studentRef, {
        ...current,
        xp: newXP,
        updatedAt: new Date().toISOString(),
      });
      return newXP;
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  },

  /**
   * Sync all students' XP for a class from backend data
   * @param {string} classId
   * @param {Array} attendance - attendance records with {studentId, status}
   * @param {Array} marks - marks records with {studentId, score}
   * @param {Array} submissions - submission records with {studentId, status}
   */
  async syncAllStudents(classId, students, attendance, marks, submissions) {
    try {
      const updates = {};
      const now = new Date().toISOString();

      // Get week boundaries for weekly XP
      const weekStart = getWeekStart();

      for (const student of students) {
        const studentId = student.id || student.studentId || student._id;

        // All-time XP
        const presentDays = attendance.filter(a => {
          const sId = a.studentId || a.student_id;
          return sId === studentId && a.status === 'present';
        }).length;
        const studentMarks = marks.filter(m => {
          const sId = m.studentId || m.student_id;
          return sId === studentId;
        });
        const totalScore = studentMarks.reduce((s, m) => s + (parseFloat(m.score) || 0), 0);
        const submitCount = submissions.filter(s => {
          const sId = s.studentId || s.student_id;
          return sId === studentId && s.status === 'submitted';
        }).length;
        const xpAllTime = (presentDays * 5) + (Math.round(totalScore) * 2) + (submitCount * 10);

        // Weekly XP (only count attendance in the current week)
        const weeklyPresent = attendance.filter(a => {
          const sId = a.studentId || a.student_id;
          const aDate = new Date(a.date || a.createdAt);
          return sId === studentId && a.status === 'present' && aDate >= weekStart;
        }).length;
        const weeklyMarks = marks.filter(m => {
          const sId = m.studentId || m.student_id;
          const mDate = new Date(m.date || m.createdAt);
          return sId === studentId && mDate >= weekStart;
        });
        const weeklyScore = weeklyMarks.reduce((s, m) => s + (parseFloat(m.score) || 0), 0);
        const weeklySubs = submissions.filter(s => {
          const sId = s.studentId || s.student_id;
          const sDate = new Date(s.date || s.createdAt);
          return sId === studentId && s.status === 'submitted' && sDate >= weekStart;
        }).length;
        const xpWeekly = (weeklyPresent * 5) + (Math.round(weeklyScore) * 2) + (weeklySubs * 10);

        updates[`leaderboard/${classId}/students/${studentId}`] = {
          studentId,
          studentName: student.name || student.studentName || student.fullName || studentId,
          xp: xpAllTime,
          xpWeekly,
          avatar: student.avatar || null,
          classId,
          updatedAt: now,
        };
      }

      await update(ref(database), updates);
      console.log(`[Leaderboard] Synced ${students.length} students for class ${classId}`);
    } catch (error) {
      console.error('Error syncing leaderboard:', error);
      throw error;
    }
  },

  /**
   * Subscribe to leaderboard real-time updates
   */
  subscribe(classId, callback) {
    const lbRef = query(
      ref(database, `leaderboard/${classId}/students`),
      orderByChild('xp')
    );
    return onValue(lbRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const entries = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => b.xp - a.xp);
      callback(entries);
    }, (error) => {
      console.error('Leaderboard subscription error:', error);
      callback([]);
    });
  },

  /**
   * Subscribe to weekly leaderboard
   */
  subscribeWeekly(classId, callback) {
    const lbRef = query(
      ref(database, `leaderboard/${classId}/students`),
      orderByChild('xpWeekly')
    );
    return onValue(lbRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }
      const data = snapshot.val();
      const entries = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => b.xpWeekly - a.xpWeekly);
      callback(entries);
    }, (error) => {
      console.error('Weekly leaderboard subscription error:', error);
      callback([]);
    });
  },
};

// Helper: get start of current week (Monday)
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

export default {
  firebaseUsersService,
  firebaseAssignmentsService,
  firebaseSubmissionsService,
  firebaseAttendanceService,
  firebaseMarksService,
  firebaseMessagesService,
  firebaseNotificationsService,
  firebaseLeaderboardService,
};
