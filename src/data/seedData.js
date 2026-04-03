import { KEYS, getFromStorage, setToStorage } from './schema';

export const initializeApp = () => {
  if (getFromStorage(KEYS.USERS)) return; // Already seeded

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDate(d);
  };

  // Seed Users
  const users = [
    { id: 'admin-1', name: 'Dr. Sarah Mitchell', email: 'admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(365), phone: '+91 98765 43210' },
    { id: 'teacher-1', name: 'Prof. James Anderson', email: 'james@schoolsync.edu', password: 'teacher123', role: 'teacher', avatar: '👨‍🏫', joined: daysAgo(300), phone: '+91 98765 43211', department: 'Mathematics', subjects: ['Mathematics', 'Physics'] },
    { id: 'teacher-2', name: 'Dr. Emily Chen', email: 'emily@schoolsync.edu', password: 'teacher123', role: 'teacher', avatar: '👩‍🏫', joined: daysAgo(280), phone: '+91 98765 43212', department: 'Science', subjects: ['Biology', 'Chemistry'] },
    { id: 'student-1', name: 'Alex Thompson', email: 'alex@schoolsync.edu', password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200), phone: '+91 98765 43220', class: '10-A', rollNo: '10A-001', parentName: 'Michael Thompson', parentPhone: '+91 98765 43230' },
    { id: 'student-2', name: 'Sophia Martinez', email: 'sophia@schoolsync.edu', password: 'student123', role: 'student', avatar: '👧', joined: daysAgo(200), phone: '+91 98765 43221', class: '10-A', rollNo: '10A-002', parentName: 'Carlos Martinez', parentPhone: '+91 98765 43231' },
  ];

  // Seed Fees: ₹1,50,000 split into 3 terms for EACH student
  const fees = [];
  const students = users.filter(u => u.role === 'student');
  const totalFee = 150000;
  const termAmount = totalFee / 3; // ₹50,000 per term
  const terms = [
    { name: 'Term 1 (Apr-Jul)', dueDate: '2026-04-15' },
    { name: 'Term 2 (Aug-Nov)', dueDate: '2026-08-15' },
    { name: 'Term 3 (Dec-Mar)', dueDate: '2026-12-15' },
  ];

  students.forEach(student => {
    terms.forEach((term, idx) => {
      fees.push({
        id: `fee-${student.id}-${idx + 1}`,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        term: term.name,
        amount: termAmount,
        dueDate: term.dueDate,
        status: idx === 0 ? 'pending' : 'pending', // All start as pending
        paidAt: null,
        transactionId: null,
        paymentMethod: null,
        createdAt: daysAgo(30 + idx * 30),
      });
    });
  });

  // Other seed data (empty arrays for now)
  const assignments = [];
  const attendance = [];
  const marks = [];
  const timetable = {};
  const notes = [];
  const announcements = [];
  const notifications = [];

  // Save to localStorage
  setToStorage(KEYS.USERS, users);
  setToStorage(KEYS.ASSIGNMENTS, assignments);
  setToStorage(KEYS.ATTENDANCE, attendance);
  setToStorage(KEYS.MARKS, marks);
  setToStorage(KEYS.TIMETABLE, timetable);
  setToStorage(KEYS.NOTES, notes);
  setToStorage(KEYS.ANNOUNCEMENTS, announcements);
  setToStorage(KEYS.NOTIFICATIONS, notifications);
  setToStorage(KEYS.FEES, fees); // ← Save fees!
};