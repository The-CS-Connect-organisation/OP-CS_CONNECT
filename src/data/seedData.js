import { KEYS, getFromStorage, setToStorage } from './schema';

/** Generate seed data if no data exists */
export const initializeApp = () => {
  if (getFromStorage(KEYS.USERS)) return; // Already seeded

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDate(d);
  };

  // ==================== USERS ====================
  const users = [
    {
      id: 'admin-1', name: 'Dr. Sarah Mitchell', email: 'admin@schoolsync.edu',
      password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(365),
      phone: '+91 98765 43210', department: 'Administration'
    },
    {
      id: 'teacher-1', name: 'Prof. James Anderson', email: 'james@schoolsync.edu',
      password: 'teacher123', role: 'teacher', avatar: '👨‍🏫', joined: daysAgo(300),
      phone: '+91 98765 43211', department: 'Mathematics', subjects: ['Mathematics', 'Physics']
    },
    {
      id: 'teacher-2', name: 'Dr. Emily Chen', email: 'emily@schoolsync.edu',
      password: 'teacher123', role: 'teacher', avatar: '👩‍🏫', joined: daysAgo(280),
      phone: '+91 98765 43212', department: 'Science', subjects: ['Biology', 'Chemistry']
    },
    {
      id: 'student-1', name: 'Alex Thompson', email: 'alex@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200),
      phone: '+91 98765 43220', class: '10-A', rollNo: '10A-001', 
      parentName: 'Michael Thompson', parentPhone: '+91 98765 43230'
    },
    {
      id: 'student-2', name: 'Sophia Martinez', email: 'sophia@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👧', joined: daysAgo(200),
      phone: '+91 98765 43221', class: '10-A', rollNo: '10A-002',
      parentName: 'Carlos Martinez', parentPhone: '+91 98765 43231'
    },
    {
      id: 'student-3', name: 'Ethan Kim', email: 'ethan@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200),
      phone: '+91 98765 43222', class: '10-A', rollNo: '10A-003',
      parentName: 'Jin Kim', parentPhone: '+91 98765 43232'
    }
  ];

  // ==================== ASSIGNMENTS ====================
  const assignments = [
    {
      id: 'asgn-1', title: 'Quadratic Equations Practice', subject: 'Mathematics',
      teacherId: 'teacher-1', teacherName: 'Prof. James Anderson', class: '10-A',
      description: 'Solve problems 1-20 from Chapter 5. Show all steps.',
      dueDate: daysAgo(-3), createdAt: daysAgo(10), totalMarks: 20,
      submissions: [
        { studentId: 'student-1', studentName: 'Alex Thompson', submittedAt: daysAgo(-5), marks: 18, status: 'graded', file: 'alex_quadratic.pdf' },
        { studentId: 'student-2', studentName: 'Sophia Martinez', submittedAt: daysAgo(-4), marks: 20, status: 'graded', file: 'sophia_quadratic.pdf' },
        { studentId: 'student-3', studentName: 'Ethan Kim', submittedAt: null, marks: null, status: 'pending', file: null },
      ]
    },
    {
      id: 'asgn-2', title: 'Cell Biology Lab Report', subject: 'Biology',
      teacherId: 'teacher-2', teacherName: 'Dr. Emily Chen', class: '10-A',
      description: 'Write a detailed lab report on the onion cell observation experiment.',
      dueDate: daysAgo(-1), createdAt: daysAgo(7), totalMarks: 25,
      submissions: [
        { studentId: 'student-1', studentName: 'Alex Thompson', submittedAt: daysAgo(-2), marks: null, status: 'submitted', file: 'alex_lab_report.pdf' },
        { studentId: 'student-2', studentName: 'Sophia Martinez', submittedAt: null, marks: null, status: 'pending', file: null },
      ]
    }
  ];

  // ==================== ATTENDANCE ====================
  const attendance = [];
  const subjects = ['Mathematics', 'Biology', 'English Literature', 'Physics', 'Chemistry'];
  for (let d = 0; d < 30; d++) {
    const date = daysAgo(d);
    ['student-1', 'student-2', 'student-3'].forEach(sid => {
      subjects.forEach(subject => {
        const isPresent = Math.random() > 0.15;
        attendance.push({
          id: `att-${sid}-${d}-${subject}`,
          studentId: sid, date, subject,
          status: isPresent ? (Math.random() > 0.1 ? 'present' : 'late') : 'absent'
        });
      });
    });
  }

  // ==================== MARKS ====================
  const marks = [];
  const exams = [
    { name: 'Unit Test 1', date: daysAgo(60) },
    { name: 'Unit Test 2', date: daysAgo(30) },
    { name: 'Mid Term', date: daysAgo(15) },
  ];
  exams.forEach(exam => {
    subjects.forEach(subject => {
      ['student-1', 'student-2', 'student-3'].forEach(sid => {
        marks.push({
          id: `mark-${sid}-${exam.name}-${subject}`,
          studentId: sid, examName: exam.name, date: exam.date,
          subject, marksObtained: Math.floor(Math.random() * 30) + 70,
          totalMarks: 100
        });
      });
    });
  });
  marks.forEach(m => {
    const pct = (m.marksObtained / m.totalMarks) * 100;
    if (pct >= 90) m.grade = 'A+';
    else if (pct >= 80) m.grade = 'A';
    else if (pct >= 70) m.grade = 'B+';
    else if (pct >= 60) m.grade = 'B';
    else if (pct >= 50) m.grade = 'C';
    else m.grade = 'F';
  });

  // ==================== TIMETABLE ====================
  const timetable = {
    '10-A': [
      { day: 'Monday', slots: [
        { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '08:50 - 09:35', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '09:40 - 10:25', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
      ]},
      { day: 'Tuesday', slots: [
        { time: '08:00 - 08:45', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '08:50 - 09:35', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
      ]}
    ]
  };

  // ==================== NOTES ====================
  const notes = [
    { id: 'note-1', title: 'Quadratic Equations Summary', subject: 'Mathematics',
      teacherId: 'teacher-1', teacherName: 'Prof. James Anderson', class: '10-A',
      description: 'Complete summary of quadratic equations.', createdAt: daysAgo(5), 
      fileSize: '2.4 MB', type: 'PDF' },
  ];

  // ==================== ANNOUNCEMENTS ====================
  const announcements = [
    { id: 'ann-1', title: 'Annual Sports Day', content: 'Annual Sports Day will be held on March 15th.',
      author: 'Dr. Sarah Mitchell', authorRole: 'admin', date: daysAgo(2), priority: 'high' },
  ];

  // ==================== NOTIFICATIONS ====================
  const notifications = [
    { id: 'notif-1', userId: 'student-1', title: 'New Assignment', message: 'Quadratic Equations Practice has been posted', type: 'assignment', read: false, createdAt: daysAgo(1) },
  ];

  // ==================== FEES (NEW) ====================
  const fees = [
    {
      id: 'fee-1',
      studentId: 'student-1',
      studentName: 'Alex Thompson',
      term: 'Term 1 (2026)',
      amount: 18500,
      dueDate: '2026-04-15',
      status: 'pending',
      createdAt: '2026-03-01'
    },
    {
      id: 'fee-2',
      studentId: 'student-1',
      studentName: 'Alex Thompson',
      term: 'Term 2 (2026)',
      amount: 19200,
      dueDate: '2026-08-10',
      status: 'pending',
      createdAt: '2026-03-01'
    },
    {
      id: 'fee-3',
      studentId: 'student-2',
      studentName: 'Sophia Martinez',
      term: 'Term 1 (2026)',
      amount: 18500,
      dueDate: '2026-04-15',
      status: 'paid',
      paidAt: '2026-03-20',
      transactionId: 'UPI1742345678'
    }
  ];

  // Save all to localStorage
  setToStorage(KEYS.USERS, users);
  setToStorage(KEYS.ASSIGNMENTS, assignments);
  setToStorage(KEYS.ATTENDANCE, attendance);
  setToStorage(KEYS.MARKS, marks);
  setToStorage(KEYS.TIMETABLE, timetable);
  setToStorage(KEYS.NOTES, notes);
  setToStorage(KEYS.ANNOUNCEMENTS, announcements);
  setToStorage(KEYS.NOTIFICATIONS, notifications);
  setToStorage(KEYS.FEES, fees);        // ← New
};

// Add this in schema.js KEYS object:
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
  FEES: 'sms_fees',           // ← Add this line
  THEME: 'sms_theme',
};