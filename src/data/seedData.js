import { KEYS } from './schema';
import { getFromStorage, setToStorage } from './schema';

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

  // Seed Users
  const users = [
    {
      id: 'admin-1', name: 'Dr. Sarah Mitchell', email: 'admin@schoolsync.edu',
      password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(365),
      phone: '+1 555-0100', department: 'Administration'
    },
    {
      id: 'teacher-1', name: 'Prof. James Anderson', email: 'james@schoolsync.edu',
      password: 'teacher123', role: 'teacher', avatar: '👨‍🏫', joined: daysAgo(300),
      phone: '+1 555-0101', department: 'Mathematics', subjects: ['Mathematics', 'Physics']
    },
    {
      id: 'teacher-2', name: 'Dr. Emily Chen', email: 'emily@schoolsync.edu',
      password: 'teacher123', role: 'teacher', avatar: '👩‍🏫', joined: daysAgo(280),
      phone: '+1 555-0102', department: 'Science', subjects: ['Biology', 'Chemistry']
    },
    {
      id: 'teacher-3', name: 'Mr. Robert Williams', email: 'robert@schoolsync.edu',
      password: 'teacher123', role: 'teacher', avatar: '👨‍🏫', joined: daysAgo(250),
      phone: '+1 555-0103', department: 'English', subjects: ['English Literature', 'Creative Writing']
    },
    {
      id: 'student-1', name: 'Alex Thompson', email: 'alex@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200),
      phone: '+1 555-0201', class: '10-A', rollNo: '10A-001', parentName: 'Michael Thompson',
      parentPhone: '+1 555-0301'
    },
    {
      id: 'student-2', name: 'Sophia Martinez', email: 'sophia@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👧', joined: daysAgo(200),
      phone: '+1 555-0202', class: '10-A', rollNo: '10A-002', parentName: 'Carlos Martinez',
      parentPhone: '+1 555-0302'
    },
    {
      id: 'student-3', name: 'Ethan Kim', email: 'ethan@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200),
      phone: '+1 555-0203', class: '10-A', rollNo: '10A-003', parentName: 'Jin Kim',
      parentPhone: '+1 555-0303'
    },
    {
      id: 'student-4', name: 'Olivia Brown', email: 'olivia@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👧', joined: daysAgo(200),
      phone: '+1 555-0204', class: '10-B', rollNo: '10B-001', parentName: 'David Brown',
      parentPhone: '+1 555-0304'
    },
    {
      id: 'student-5', name: 'Liam Johnson', email: 'liam@schoolsync.edu',
      password: 'student123', role: 'student', avatar: '👦', joined: daysAgo(200),
      phone: '+1 555-0205', class: '10-B', rollNo: '10B-002', parentName: 'Susan Johnson',
      parentPhone: '+1 555-0305'
    },
  ];

  // Seed Assignments
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
        { studentId: 'student-3', studentName: 'Ethan Kim', submittedAt: daysAgo(-3), marks: 22, status: 'graded', file: 'ethan_lab_report.pdf' },
      ]
    },
    {
      id: 'asgn-3', title: 'Shakespeare Essay', subject: 'English Literature',
      teacherId: 'teacher-3', teacherName: 'Mr. Robert Williams', class: '10-A',
      description: 'Write a 1000-word essay on the themes of ambition in Macbeth.',
      dueDate: daysAgo(-14), createdAt: daysAgo(21), totalMarks: 30,
      submissions: [
        { studentId: 'student-1', studentName: 'Alex Thompson', submittedAt: daysAgo(-15), marks: 27, status: 'graded', file: 'alex_macbeth.pdf' },
        { studentId: 'student-2', studentName: 'Sophia Martinez', submittedAt: daysAgo(-16), marks: 29, status: 'graded', file: 'sophia_macbeth.pdf' },
        { studentId: 'student-3', studentName: 'Ethan Kim', submittedAt: daysAgo(-14), marks: 25, status: 'graded', file: 'ethan_macbeth.pdf' },
      ]
    },
    {
      id: 'asgn-4', title: 'Physics: Newton\'s Laws', subject: 'Physics',
      teacherId: 'teacher-1', teacherName: 'Prof. James Anderson', class: '10-A',
      description: 'Complete the worksheet on Newton\'s three laws of motion with examples.',
      dueDate: daysAgo(-20), createdAt: daysAgo(27), totalMarks: 15,
      submissions: [
        { studentId: 'student-1', studentName: 'Alex Thompson', submittedAt: daysAgo(-22), marks: 14, status: 'graded', file: 'alex_newton.pdf' },
        { studentId: 'student-2', studentName: 'Sophia Martinez', submittedAt: daysAgo(-21), marks: 15, status: 'graded', file: 'sophia_newton.pdf' },
        { studentId: 'student-3', studentName: 'Ethan Kim', submittedAt: daysAgo(-20), marks: 12, status: 'graded', file: 'ethan_newton.pdf' },
      ]
    },
  ];

  // Seed Attendance (last 30 days)
  const attendance = [];
  const subjects = ['Mathematics', 'Biology', 'English Literature', 'Physics', 'Chemistry'];
  for (let d = 0; d < 30; d++) {
    const date = daysAgo(d);
    ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'].forEach(sid => {
      // 85% attendance rate
      const isPresent = Math.random() > 0.15;
      subjects.forEach(subject => {
        if (isPresent) {
          attendance.push({
            id: `att-${sid}-${d}-${subject}`,
            studentId: sid, date, subject,
            status: Math.random() > 0.1 ? 'present' : 'late'
          });
        }
      });
    });
  }

  // Seed Marks
  const marks = [];
  const exams = [
    { name: 'Unit Test 1', date: daysAgo(60) },
    { name: 'Unit Test 2', date: daysAgo(30) },
    { name: 'Mid Term', date: daysAgo(15) },
  ];
  exams.forEach(exam => {
    subjects.forEach(subject => {
      ['student-1', 'student-2', 'student-3', 'student-4', 'student-5'].forEach(sid => {
        marks.push({
          id: `mark-${sid}-${exam.name}-${subject}`,
          studentId: sid, examName: exam.name, date: exam.date,
          subject, marksObtained: Math.floor(Math.random() * 30) + 70,
          totalMarks: 100, grade: '', remarks: ''
        });
      });
    });
  });
  // Calculate grades
  marks.forEach(m => {
    const pct = (m.marksObtained / m.totalMarks) * 100;
    if (pct >= 90) m.grade = 'A+';
    else if (pct >= 80) m.grade = 'A';
    else if (pct >= 70) m.grade = 'B+';
    else if (pct >= 60) m.grade = 'B';
    else if (pct >= 50) m.grade = 'C';
    else m.grade = 'F';
  });

  // Seed Timetable
  const timetable = {
    '10-A': [
      { day: 'Monday', slots: [
        { time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '08:50 - 09:35', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '09:40 - 10:25', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '10:45 - 11:30', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '11:35 - 12:20', subject: 'Chemistry', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '13:00 - 13:45', subject: 'Physical Education', teacher: 'Coach Mike', room: 'Ground' },
      ]},
      { day: 'Tuesday', slots: [
        { time: '08:00 - 08:45', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '08:50 - 09:35', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '09:40 - 10:25', subject: 'Chemistry', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '10:45 - 11:30', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '11:35 - 12:20', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '13:00 - 13:45', subject: 'Art', teacher: 'Ms. Diana', room: 'Art Room' },
      ]},
      { day: 'Wednesday', slots: [
        { time: '08:00 - 08:45', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '08:50 - 09:35', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '09:40 - 10:25', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '10:45 - 11:30', subject: 'Chemistry', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '11:35 - 12:20', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '13:00 - 13:45', subject: 'Music', teacher: 'Mr. David', room: 'Music Room' },
      ]},
      { day: 'Thursday', slots: [
        { time: '08:00 - 08:45', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '08:50 - 09:35', subject: 'Chemistry', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '09:40 - 10:25', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '10:45 - 11:30', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '11:35 - 12:20', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '13:00 - 13:45', subject: 'Computer Science', teacher: 'Mr. Steve', room: 'Lab 3' },
      ]},
      { day: 'Friday', slots: [
        { time: '08:00 - 08:45', subject: 'Chemistry', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '08:50 - 09:35', subject: 'Biology', teacher: 'Dr. Emily Chen', room: 'Lab 1' },
        { time: '09:40 - 10:25', subject: 'English Literature', teacher: 'Mr. Robert Williams', room: '201' },
        { time: '10:45 - 11:30', subject: 'Mathematics', teacher: 'Prof. James Anderson', room: '201' },
        { time: '11:35 - 12:20', subject: 'Physics', teacher: 'Prof. James Anderson', room: 'Lab 2' },
        { time: '13:00 - 13:45', subject: 'Library', teacher: 'Ms. Green', room: 'Library' },
      ]},
    ]
  };

  // Seed Notes
  const notes = [
    { id: 'note-1', title: 'Quadratic Equations Summary', subject: 'Mathematics',
      teacherId: 'teacher-1', teacherName: 'Prof. James Anderson', class: '10-A',
      description: 'Complete summary of quadratic equations including formulas, discriminant, and graphical representation.',
      createdAt: daysAgo(5), fileSize: '2.4 MB', type: 'PDF' },
    { id: 'note-2', title: 'Cell Structure Diagrams', subject: 'Biology',
      teacherId: 'teacher-2', teacherName: 'Dr. Emily Chen', class: '10-A',
      description: 'Detailed diagrams of plant and animal cells with labeled organelles.',
      createdAt: daysAgo(8), fileSize: '5.1 MB', type: 'PDF' },
    { id: 'note-3', title: 'Macbeth Act Summaries', subject: 'English Literature',
      teacherId: 'teacher-3', teacherName: 'Mr. Robert Williams', class: '10-A',
      description: 'Chapter-wise summary of Shakespeare\'s Macbeth with key quotes.',
      createdAt: daysAgo(12), fileSize: '1.8 MB', type: 'PDF' },
    { id: 'note-4', title: 'Newton\'s Laws Cheat Sheet', subject: 'Physics',
      teacherId: 'teacher-1', teacherName: 'Prof. James Anderson', class: '10-A',
      description: 'Quick reference guide for all three laws of motion with real-world examples.',
      createdAt: daysAgo(15), fileSize: '890 KB', type: 'PDF' },
  ];

  // Seed Announcements
  const announcements = [
    { id: 'ann-1', title: 'Annual Sports Day', content: 'Annual Sports Day will be held on March 15th. All students are required to participate in at least one event.',
      author: 'Dr. Sarah Mitchell', authorRole: 'admin', date: daysAgo(2), priority: 'high', readBy: [] },
    { id: 'ann-2', title: 'Mid-Term Exam Schedule Released', content: 'The mid-term examination schedule has been released. Please check the timetable section for details.',
      author: 'Dr. Sarah Mitchell', authorRole: 'admin', date: daysAgo(5), priority: 'high', readBy: [] },
    { id: 'ann-3', title: 'Science Fair Registration Open', content: 'Register for the annual Science Fair by March 10th. Projects should be submitted individually or in groups of up to 3.',
      author: 'Dr. Emily Chen', authorRole: 'teacher', date: daysAgo(7), priority: 'medium', readBy: [] },
    { id: 'ann-4', title: 'Library Extended Hours', content: 'The school library will now be open until 5 PM on weekdays to support exam preparation.',
      author: 'Dr. Sarah Mitchell', authorRole: 'admin', date: daysAgo(10), priority: 'low', readBy: [] },
  ];

  // Seed Notifications
  const notifications = [
    { id: 'notif-1', userId: 'student-1', title: 'New Assignment', message: 'Quadratic Equations Practice has been posted', type: 'assignment', read: false, createdAt: daysAgo(1) },
    { id: 'notif-2', userId: 'student-1', title: 'Grade Posted', message: 'Your Macbeth Essay has been graded: 27/30', type: 'grade', read: false, createdAt: daysAgo(2) },
    { id: 'notif-3', userId: 'student-1', title: 'Announcement', message: 'Annual Sports Day on March 15th', type: 'announcement', read: true, createdAt: daysAgo(3) },
    { id: 'notif-4', userId: 'teacher-1', title: 'Submission Received', message: 'Alex Thompson submitted Quadratic Equations Practice', type: 'submission', read: false, createdAt: daysAgo(1) },
  ];

  setToStorage(KEYS.USERS, users);
  setToStorage(KEYS.ASSIGNMENTS, assignments);
  setToStorage(KEYS.ATTENDANCE, attendance);
  setToStorage(KEYS.MARKS, marks);
  setToStorage(KEYS.TIMETABLE, timetable);
  setToStorage(KEYS.NOTES, notes);
  setToStorage(KEYS.ANNOUNCEMENTS, announcements);
  setToStorage(KEYS.NOTIFICATIONS, notifications);
};
