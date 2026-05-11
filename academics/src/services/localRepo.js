import { KEYS, getFromStorage, setToStorage } from '../data/schema';

const nowIso = () => new Date().toISOString();
const nowDate = () => new Date().toISOString().split('T')[0];
const daysAgo = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().split('T')[0];
};

// ── Demo seed data ─────────────────────────────────────────────────────────────

const DEMO_USERS = [
  { id: 'student-1', name: 'Aarav Patel', email: 'student@schoolsync.edu', password: 'student123', role: 'student', class: '10-A', rollNo: '12', avatar: '👦', isActive: true },
  { id: 'student-2', name: 'Priya Sharma', email: 'student2@schoolsync.edu', password: 'student123', role: 'student', class: '10-A', rollNo: '15', avatar: '👧', isActive: true },
  { id: 'student-3', name: 'Rahul Verma', email: 'student3@schoolsync.edu', password: 'student123', role: 'student', class: '10-B', rollNo: '8', avatar: '👦', isActive: true },
  { id: 'teacher-1', name: 'Sarah Wilson', email: 'teacher@schoolsync.edu', password: 'teacher123', role: 'teacher', subject: 'Mathematics', avatar: '👨‍🏫', isActive: true },
  { id: 'teacher-2', name: 'John Smith', email: 'teacher2@schoolsync.edu', password: 'teacher123', role: 'teacher', subject: 'English', avatar: '👩‍🏫', isActive: true },
  { id: 'teacher-3', name: 'Michael Lee', email: 'teacher3@schoolsync.edu', password: 'teacher123', role: 'teacher', subject: 'Physics', avatar: '👨‍🏫', isActive: true },
  { id: 'admin-1', name: 'Admin User', email: 'admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👩‍💼', isActive: true },
  { id: 'parent-1', name: 'Priya Patel', email: 'parent@schoolsync.edu', password: 'parent123', role: 'parent', childId: 'student-1', avatar: '🧑', isActive: true },
];

const DEMO_ASSIGNMENTS = [
  { id: 'assign-1', title: 'Algebra Fundamentals', subject: 'Mathematics', class: '10-A', teacherId: 'teacher-1', teacherName: 'Sarah Wilson', description: 'Complete exercises 1-20 from Chapter 3. Focus on quadratic equations and factorization.', dueDate: daysAgo(-2), totalMarks: 50, status: 'active' },
  { id: 'assign-2', title: 'English Essay: Climate Change', subject: 'English', class: '10-A', teacherId: 'teacher-2', teacherName: 'John Smith', description: 'Write a 500-word persuasive essay on the impact of climate change. Include at least 3 citations.', dueDate: daysAgo(-1), totalMarks: 30, status: 'active' },
  { id: 'assign-3', title: 'Physics Lab Report', subject: 'Physics', class: '10-A', teacherId: 'teacher-3', teacherName: 'Michael Lee', description: 'Document your observations from the pendulum experiment. Include graphs and calculations.', dueDate: daysAgo(-7), totalMarks: 40, status: 'active' },
  { id: 'assign-4', title: 'History: Industrial Revolution', subject: 'History', class: '10-A', teacherId: 'teacher-4', teacherName: 'Emily Brown', description: 'Create a timeline of major events during the Industrial Revolution. Minimum 10 events.', dueDate: daysAgo(3), totalMarks: 25, status: 'active' },
  { id: 'assign-5', title: 'Chemistry: Periodic Table Quiz', subject: 'Chemistry', class: '10-A', teacherId: 'teacher-5', teacherName: 'David Chen', description: 'Online quiz on elements 1-36. Multiple choice and short answer format.', dueDate: daysAgo(-5), totalMarks: 20, status: 'graded' },
  { id: 'assign-6', title: 'Biology: Cell Structure Diagram', subject: 'Biology', class: '10-A', teacherId: 'teacher-6', teacherName: 'Lisa Wang', description: 'Draw and label a plant cell. Include all organelles with their functions.', dueDate: daysAgo(-14), totalMarks: 35, status: 'graded' },
  { id: 'assign-7', title: 'Computer Science: Python Basics', subject: 'Computer Science', class: '10-A', teacherId: 'teacher-7', teacherName: 'Alex Kim', description: 'Write a Python program that calculates the factorial of a number using recursion.', dueDate: daysAgo(5), totalMarks: 45, status: 'active' },
  { id: 'assign-8', title: 'Geography: Map Reading', subject: 'Geography', class: '10-A', teacherId: 'teacher-8', teacherName: 'Rajesh Kumar', description: 'Complete the map reading exercises from pages 45-50. Use coordinates to locate places.', dueDate: daysAgo(-10), totalMarks: 30, status: 'graded' },
];

const DEMO_ATTENDANCE = [
  { id: 'att-1', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(0), status: 'present', subject: 'Mathematics' },
  { id: 'att-2', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(1), status: 'present', subject: 'English' },
  { id: 'att-3', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(2), status: 'late', subject: 'Physics' },
  { id: 'att-4', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(3), status: 'present', subject: 'Chemistry' },
  { id: 'att-5', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(4), status: 'present', subject: 'Mathematics' },
  { id: 'att-6', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(5), status: 'absent', subject: 'Biology' },
  { id: 'att-7', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(6), status: 'present', subject: 'History' },
  { id: 'att-8', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(7), status: 'present', subject: 'Computer Science' },
  { id: 'att-9', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(8), status: 'present', subject: 'Geography' },
  { id: 'att-10', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(9), status: 'present', subject: 'English' },
  { id: 'att-11', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(10), status: 'late', subject: 'Mathematics' },
  { id: 'att-12', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(11), status: 'present', subject: 'Physics' },
  { id: 'att-13', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(12), status: 'present', subject: 'Chemistry' },
  { id: 'att-14', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(13), status: 'present', subject: 'Biology' },
  { id: 'att-15', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(14), status: 'absent', subject: 'History' },
  { id: 'att-16', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(15), status: 'present', subject: 'Computer Science' },
  { id: 'att-17', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(16), status: 'present', subject: 'Geography' },
  { id: 'att-18', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(17), status: 'present', subject: 'Mathematics' },
  { id: 'att-19', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(18), status: 'late', subject: 'English' },
  { id: 'att-20', studentId: 'student-1', studentName: 'Aarav Patel', class: '10-A', date: daysAgo(19), status: 'present', subject: 'Physics' },
];

const DEMO_GRADES = [
  { id: 'grade-1', studentId: 'student-1', examName: 'Unit Test 1', subject: 'Mathematics', marksObtained: 85, totalMarks: 100, grade: 'A1' },
  { id: 'grade-2', studentId: 'student-1', examName: 'Unit Test 1', subject: 'English', marksObtained: 78, totalMarks: 100, grade: 'B1' },
  { id: 'grade-3', studentId: 'student-1', examName: 'Unit Test 1', subject: 'Physics', marksObtained: 92, totalMarks: 100, grade: 'A1' },
  { id: 'grade-4', studentId: 'student-1', examName: 'Unit Test 1', subject: 'Chemistry', marksObtained: 88, totalMarks: 100, grade: 'A2' },
  { id: 'grade-5', studentId: 'student-1', examName: 'Unit Test 1', subject: 'Biology', marksObtained: 74, totalMarks: 100, grade: 'B1' },
  { id: 'grade-6', studentId: 'student-1', examName: 'Half-Yearly Exam', subject: 'Mathematics', marksObtained: 156, totalMarks: 200, grade: 'A1' },
  { id: 'grade-7', studentId: 'student-1', examName: 'Half-Yearly Exam', subject: 'English', marksObtained: 142, totalMarks: 200, grade: 'B2' },
  { id: 'grade-8', studentId: 'student-1', examName: 'Half-Yearly Exam', subject: 'Physics', marksObtained: 178, totalMarks: 200, grade: 'A1' },
  { id: 'grade-9', studentId: 'student-1', examName: 'Half-Yearly Exam', subject: 'Chemistry', marksObtained: 165, totalMarks: 200, grade: 'A2' },
  { id: 'grade-10', studentId: 'student-1', examName: 'Half-Yearly Exam', subject: 'Biology', marksObtained: 155, totalMarks: 200, grade: 'A2' },
  { id: 'grade-11', studentId: 'student-1', examName: 'Unit Test 2', subject: 'Mathematics', marksObtained: 79, totalMarks: 100, grade: 'B1' },
  { id: 'grade-12', studentId: 'student-1', examName: 'Unit Test 2', subject: 'English', marksObtained: 82, totalMarks: 100, grade: 'B1' },
  { id: 'grade-13', studentId: 'student-1', examName: 'Unit Test 2', subject: 'Computer Science', marksObtained: 95, totalMarks: 100, grade: 'A1' },
];

const DEMO_NOTES = [
  { id: 'note-1', title: 'Quadratic Equations - Complete Guide', subject: 'Mathematics', teacherId: 'teacher-1', teacherName: 'Sarah Wilson', class: '10-A', description: 'Comprehensive notes covering all methods of solving quadratic equations including factorization, completing the square, and quadratic formula.', created_at: daysAgo(5) },
  { id: 'note-2', title: 'Shakespeare: Julius Caesar Analysis', subject: 'English', teacherId: 'teacher-2', teacherName: 'John Smith', class: '10-A', description: 'Character analysis, themes, and key quotes from Act 1-3 of Julius Caesar. Includes essay writing tips.', created_at: daysAgo(10) },
  { id: 'note-3', title: 'Kinematics and Motion Notes', subject: 'Physics', teacherId: 'teacher-3', teacherName: 'Michael Lee', class: '10-A', description: 'Full chapter notes on kinematics covering displacement, velocity, acceleration, and equations of motion with solved examples.', created_at: daysAgo(8) },
  { id: 'note-4', title: 'Chemical Bonding Summary', subject: 'Chemistry', teacherId: 'teacher-5', teacherName: 'David Chen', class: '10-A', description: 'Quick reference guide for ionic, covalent, and metallic bonding. Includes diagrams and examples.', created_at: daysAgo(12) },
  { id: 'note-5', title: 'Cell Division: Mitosis & Meiosis', subject: 'Biology', teacherId: 'teacher-6', teacherName: 'Lisa Wang', class: '10-A', description: 'Detailed comparison of mitosis and meiosis with labeled diagrams and stages explanation.', created_at: daysAgo(15) },
];

const DEMO_SUBMISSIONS = [
  { id: 'sub-assign-5-student-1', assignmentId: 'assign-5', studentId: 'student-1', studentName: 'Aarav Patel', status: 'graded', marks: 18, feedback: 'Good understanding of periodic trends. Keep practicing.', submittedAt: daysAgo(3), gradedAt: daysAgo(1) },
  { id: 'sub-assign-6-student-1', assignmentId: 'assign-6', studentId: 'student-1', studentName: 'Aarav Patel', status: 'graded', marks: 30, feedback: 'Excellent diagram work! Very neat and accurate labeling.', submittedAt: daysAgo(12), gradedAt: daysAgo(8) },
  { id: 'sub-assign-8-student-1', assignmentId: 'assign-8', studentId: 'student-1', studentName: 'Aarav Patel', status: 'graded', marks: 25, feedback: 'Great map reading skills. Well done!', submittedAt: daysAgo(8), gradedAt: daysAgo(4) },
];

const DEMO_EXAMS = [
  { id: 'exam-1', name: 'Unit Test 3', subject: 'Mathematics', class: '10-A', date: daysAgo(-10), maxMarks: 100, status: 'completed' },
  { id: 'exam-2', name: 'Half-Yearly Examination', subject: 'All Subjects', class: '10-A', date: daysAgo(-30), maxMarks: 200, status: 'completed' },
  { id: 'exam-3', name: 'Unit Test 1', subject: 'All Subjects', class: '10-A', date: daysAgo(-60), maxMarks: 100, status: 'completed' },
  { id: 'exam-4', name: 'Pre-Board Exam 1', subject: 'All Subjects', class: '10-A', date: daysAgo(14), maxMarks: 200, status: 'scheduled' },
  { id: 'exam-5', name: 'Unit Test 4', subject: 'English', class: '10-A', date: daysAgo(7), maxMarks: 50, status: 'scheduled' },
];

const DEMO_NOTIFICATIONS = [
  { id: 'ntf-1', userId: 'student-1', type: 'assignment', message: 'New assignment: Algebra Fundamentals due tomorrow', read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), meta: { subject: 'Mathematics', assignmentId: 'assign-1' } },
  { id: 'ntf-2', userId: 'student-1', type: 'deadline', message: 'Chemistry Lab Report due in 2 days', read: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString(), meta: { subject: 'Chemistry', assignmentId: 'assign-3' } },
  { id: 'ntf-3', userId: 'student-1', type: 'announcement', message: 'Half-Yearly exam results are now available', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), meta: {} },
  { id: 'ntf-4', userId: 'student-1', type: 'achievement', message: 'You earned the "Early Bird" badge!', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), meta: { badge: 'early-bird' } },
  { id: 'ntf-5', userId: 'student-1', type: 'reminder', message: 'Attendance rate is below 75%. Attend all classes!', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), meta: {} },
  { id: 'ntf-6', userId: 'teacher-1', type: 'submission', message: 'Aarav Patel submitted Algebra Fundamentals', read: false, createdAt: new Date(Date.now() - 10 * 60000).toISOString(), meta: { assignmentId: 'assign-1', studentId: 'student-1' } },
  { id: 'ntf-7', userId: 'admin-1', type: 'announcement', message: 'System backup completed successfully', read: true, createdAt: new Date(Date.now() - 3600000).toISOString(), meta: {} },
];

// ── Seeder ─────────────────────────────────────────────────────────────────────

let seeded = false;

export function seedIfNeeded() {
  if (seeded) return;
  seeded = true;

  // Users
  const existingUsers = getFromStorage(KEYS.USERS, null);
  if (existingUsers === null || !Array.isArray(existingUsers) || existingUsers.length === 0) {
    setToStorage(KEYS.USERS, DEMO_USERS);
  }

  // Assignments
  const existingAssigns = getFromStorage(KEYS.ASSIGNMENTS, null);
  if (existingAssigns === null || !Array.isArray(existingAssigns) || existingAssigns.length === 0) {
    setToStorage(KEYS.ASSIGNMENTS, DEMO_ASSIGNMENTS);
  }

  // Attendance
  const existingAttend = getFromStorage(KEYS.ATTENDANCE, null);
  if (existingAttend === null || !Array.isArray(existingAttend) || existingAttend.length === 0) {
    setToStorage(KEYS.ATTENDANCE, DEMO_ATTENDANCE);
  }

  // Grades
  const existingGrades = getFromStorage(KEYS.GRADES, null);
  if (existingGrades === null || !Array.isArray(existingGrades) || existingGrades.length === 0) {
    setToStorage(KEYS.GRADES, DEMO_GRADES);
  }

  // Notes
  const existingNotes = getFromStorage(KEYS.NOTES, null);
  if (existingNotes === null || !Array.isArray(existingNotes) || existingNotes.length === 0) {
    setToStorage(KEYS.NOTES, DEMO_NOTES);
  }

  // Submissions
  const existingSubs = getFromStorage('sms_submissions', null);
  if (existingSubs === null || !Array.isArray(existingSubs) || existingSubs.length === 0) {
    setToStorage('sms_submissions', DEMO_SUBMISSIONS);
  }

  // Exams
  const existingExams = getFromStorage(KEYS.EXAMS, null);
  if (existingExams === null || !Array.isArray(existingExams) || existingExams.length === 0) {
    setToStorage(KEYS.EXAMS, DEMO_EXAMS);
  }

  // Notifications
  const existingNtf = getFromStorage(KEYS.NOTIFICATIONS, null);
  if (existingNtf === null || !Array.isArray(existingNtf) || existingNtf.length === 0) {
    setToStorage(KEYS.NOTIFICATIONS, DEMO_NOTIFICATIONS);
  }
}

// ── Repos ──────────────────────────────────────────────────────────────────────

export const localUsersRepo = {
  list: () => getFromStorage(KEYS.USERS, DEMO_USERS),
  findByEmail: (email) => {
    const users = getFromStorage(KEYS.USERS, DEMO_USERS);
    return users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) ?? null;
  },
};

export const localAssignmentsRepo = {
  list: () => getFromStorage(KEYS.ASSIGNMENTS, DEMO_ASSIGNMENTS),
  saveAll: (assignments) => setToStorage(KEYS.ASSIGNMENTS, assignments),
};

export const localSubmissionsRepo = {
  key: 'sms_submissions',
  list: () => getFromStorage('sms_submissions', DEMO_SUBMISSIONS),
  upsert: (submission) => {
    const all = getFromStorage('sms_submissions', DEMO_SUBMISSIONS);
    const next = Array.isArray(all) ? [...all] : [];
    const idx = next.findIndex((s) => s.id === submission.id);
    if (idx >= 0) next[idx] = { ...next[idx], ...submission, updatedAt: nowIso() };
    else next.push({ ...submission, createdAt: nowIso(), updatedAt: nowIso() });
    setToStorage('sms_submissions', next);
    return submission;
  },
};

export const localExamsRepo = {
  list: () => getFromStorage(KEYS.EXAMS, DEMO_EXAMS),
  saveAll: (exams) => setToStorage(KEYS.EXAMS, exams),
};

export const localAttemptsRepo = {
  list: () => getFromStorage('sms_exam_attempts', []),
  saveAll: (attempts) => setToStorage('sms_exam_attempts', attempts),
};

export const localQuestionBankRepo = {
  list: () => getFromStorage('sms_question_bank', []),
  saveAll: (questions) => setToStorage('sms_question_bank', questions),
};

export const localAuditRepo = {
  list: () => getFromStorage('sms_audit_log', []),
  append: (entry) => {
    const all = getFromStorage('sms_audit_log', []);
    const next = Array.isArray(all) ? all : [];
    const full = { id: `audit-${Date.now()}`, at: nowIso(), ...entry };
    setToStorage('sms_audit_log', [full, ...next].slice(0, 5000));
    return full;
  },
};