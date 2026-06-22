
export const mockStudents = [
  { id: 's1', name: 'Aarav Sharma', email: 'aarav@eduvault.ai', class: '10-A', rollNo: '001', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', gpa: 3.8, attendance: 94, feesPaid: true },
  { id: 's2', name: 'Priya Patel', email: 'priya@eduvault.ai', class: '10-A', rollNo: '002', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', gpa: 3.9, attendance: 97, feesPaid: true },
  { id: 's3', name: 'Rohan Kumar', email: 'rohan@eduvault.ai', class: '10-B', rollNo: '003', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', gpa: 3.2, attendance: 85, feesPaid: false },
  { id: 's4', name: 'Ananya Singh', email: 'ananya@eduvault.ai', class: '10-A', rollNo: '004', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', gpa: 3.6, attendance: 91, feesPaid: true },
  { id: 's5', name: 'Vikram Reddy', email: 'vikram@eduvault.ai', class: '9-A', rollNo: '005', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', gpa: 3.4, attendance: 88, feesPaid: true },
  { id: 's6', name: 'Meera Nair', email: 'meera@eduvault.ai', class: '9-B', rollNo: '006', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', gpa: 3.7, attendance: 93, feesPaid: false },
  { id: 's7', name: 'Arjun Menon', email: 'arjun@eduvault.ai', class: '10-B', rollNo: '007', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', gpa: 3.1, attendance: 79, feesPaid: true },
  { id: 's8', name: 'Kavya Iyer', email: 'kavya@eduvault.ai', class: '9-A', rollNo: '008', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', gpa: 3.95, attendance: 98, feesPaid: true },
];

export const mockTeachers = [
  { id: 't1', name: 'Dr. Rajesh Gupta', email: 'rajesh@eduvault.ai', subject: 'Mathematics', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', classes: ['10-A', '10-B', '9-A'], rating: 4.8 },
  { id: 't2', name: 'Prof. Sunita Verma', email: 'sunita@eduvault.ai', subject: 'Physics', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face', classes: ['10-A', '10-B'], rating: 4.6 },
  { id: 't3', name: 'Mr. Anil Desai', email: 'anil@eduvault.ai', subject: 'Chemistry', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', classes: ['9-A', '9-B', '10-A'], rating: 4.5 },
  { id: 't4', name: 'Ms. Lakshmi Rao', email: 'lakshmi@eduvault.ai', subject: 'English', avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&h=150&fit=crop&crop=face', classes: ['10-A', '10-B', '9-A', '9-B'], rating: 4.9 },
];

export const mockSubjects = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH101', teacher: 'Dr. Rajesh Gupta', color: '#8b5cf6', icon: '📐' },
  { id: 'sub2', name: 'Physics', code: 'PHY101', teacher: 'Prof. Sunita Verma', color: '#3b82f6', icon: '⚡' },
  { id: 'sub3', name: 'Chemistry', code: 'CHEM101', teacher: 'Mr. Anil Desai', color: '#10b981', icon: '🧪' },
  { id: 'sub4', name: 'English', code: 'ENG101', teacher: 'Ms. Lakshmi Rao', color: '#f59e0b', icon: '📚' },
  { id: 'sub5', name: 'Biology', code: 'BIO101', teacher: 'Dr. Meena Krishnan', color: '#ec4899', icon: '🧬' },
  { id: 'sub6', name: 'Computer Science', code: 'CS101', teacher: 'Mr. Vikash Singh', color: '#6366f1', icon: '💻' },
];

export const mockAssignments = [
  { id: 'a1', title: 'Quadratic Equations Worksheet', subject: 'Mathematics', dueDate: '2026-01-20', status: 'pending', maxMarks: 50, description: 'Solve all problems from Chapter 5', color: '#8b5cf6' },
  { id: 'a2', title: 'Physics Lab Report', subject: 'Physics', dueDate: '2026-01-18', status: 'submitted', maxMarks: 30, scoredMarks: 27, description: "Write lab report for Ohm's Law experiment", color: '#3b82f6' },
  { id: 'a3', title: 'Organic Chemistry Notes', subject: 'Chemistry', dueDate: '2026-01-22', status: 'pending', maxMarks: 20, description: 'Prepare comprehensive notes on alkanes', color: '#10b981' },
  { id: 'a4', title: 'Essay: Modern Poetry', subject: 'English', dueDate: '2026-01-15', status: 'graded', maxMarks: 40, scoredMarks: 36, description: 'Write a 1000-word essay on modern Indian poetry', color: '#f59e0b' },
  { id: 'a5', title: 'Data Structures Assignment', subject: 'Computer Science', dueDate: '2026-01-25', status: 'pending', maxMarks: 60, description: 'Implement linked list and binary tree', color: '#6366f1' },
  { id: 'a6', title: 'Cell Biology Diagram', subject: 'Biology', dueDate: '2026-01-17', status: 'late', maxMarks: 25, description: 'Draw and label cell organelles', color: '#ec4899' },
];

export const mockGrades = [
  { subject: 'Mathematics', midTerm: 85, final: 92, assignments: 88, overall: 89, grade: 'A', trend: 'up' },
  { subject: 'Physics', midTerm: 78, final: 82, assignments: 90, overall: 83, grade: 'B+', trend: 'up' },
  { subject: 'Chemistry', midTerm: 90, final: 88, assignments: 85, overall: 88, grade: 'A', trend: 'stable' },
  { subject: 'English', midTerm: 92, final: 95, assignments: 90, overall: 93, grade: 'A+', trend: 'up' },
  { subject: 'Biology', midTerm: 75, final: 80, assignments: 78, overall: 78, grade: 'B+', trend: 'down' },
  { subject: 'Computer Science', midTerm: 95, final: 98, assignments: 96, overall: 97, grade: 'A+', trend: 'up' },
];

export const mockAttendance = [
  { month: 'Aug', present: 22, absent: 2, late: 1, percentage: 88 },
  { month: 'Sep', present: 20, absent: 3, late: 2, percentage: 80 },
  { month: 'Oct', present: 23, absent: 1, late: 0, percentage: 96 },
  { month: 'Nov', present: 21, absent: 2, late: 1, percentage: 88 },
  { month: 'Dec', present: 19, absent: 4, late: 2, percentage: 76 },
  { month: 'Jan', present: 15, absent: 1, late: 0, percentage: 94 },
];

export const mockTimetable = [
  { time: '08:00 - 08:45', monday: { subject: 'Mathematics', room: '101', color: '#8b5cf6' }, tuesday: { subject: 'Physics', room: 'Lab 1', color: '#3b82f6' }, wednesday: { subject: 'English', room: '201', color: '#f59e0b' }, thursday: { subject: 'Chemistry', room: 'Lab 2', color: '#10b981' }, friday: { subject: 'Biology', room: 'Lab 3', color: '#ec4899' } },
  { time: '08:50 - 09:35', monday: { subject: 'Physics', room: 'Lab 1', color: '#3b82f6' }, tuesday: { subject: 'Mathematics', room: '101', color: '#8b5cf6' }, wednesday: { subject: 'Chemistry', room: 'Lab 2', color: '#10b981' }, thursday: { subject: 'English', room: '201', color: '#f59e0b' }, friday: { subject: 'Computer Science', room: 'IT Lab', color: '#6366f1' } },
  { time: '09:40 - 10:25', monday: { subject: 'English', room: '201', color: '#f59e0b' }, tuesday: { subject: 'Biology', room: 'Lab 3', color: '#ec4899' }, wednesday: { subject: 'Mathematics', room: '101', color: '#8b5cf6' }, thursday: { subject: 'Computer Science', room: 'IT Lab', color: '#6366f1' }, friday: { subject: 'Physics', room: 'Lab 1', color: '#3b82f6' } },
  { time: '10:25 - 10:45', monday: { subject: 'Break', room: '', color: '#64748b' }, tuesday: { subject: 'Break', room: '', color: '#64748b' }, wednesday: { subject: 'Break', room: '', color: '#64748b' }, thursday: { subject: 'Break', room: '', color: '#64748b' }, friday: { subject: 'Break', room: '', color: '#64748b' } },
  { time: '10:45 - 11:30', monday: { subject: 'Chemistry', room: 'Lab 2', color: '#10b981' }, tuesday: { subject: 'Computer Science', room: 'IT Lab', color: '#6366f1' }, wednesday: { subject: 'Physics', room: 'Lab 1', color: '#3b82f6' }, thursday: { subject: 'Biology', room: 'Lab 3', color: '#ec4899' }, friday: { subject: 'Mathematics', room: '101', color: '#8b5cf6' } },
  { time: '11:35 - 12:20', monday: { subject: 'Biology', room: 'Lab 3', color: '#ec4899' }, tuesday: { subject: 'Chemistry', room: 'Lab 2', color: '#10b981' }, wednesday: { subject: 'Computer Science', room: 'IT Lab', color: '#6366f1' }, thursday: { subject: 'Mathematics', room: '101', color: '#8b5cf6' }, friday: { subject: 'English', room: '201', color: '#f59e0b' } },
  { time: '12:20 - 13:00', monday: { subject: 'Lunch', room: '', color: '#64748b' }, tuesday: { subject: 'Lunch', room: '', color: '#64748b' }, wednesday: { subject: 'Lunch', room: '', color: '#64748b' }, thursday: { subject: 'Lunch', room: '', color: '#64748b' }, friday: { subject: 'Lunch', room: '', color: '#64748b' } },
  { time: '13:00 - 13:45', monday: { subject: 'Computer Science', room: 'IT Lab', color: '#6366f1' }, tuesday: { subject: 'English', room: '201', color: '#f59e0b' }, wednesday: { subject: 'Biology', room: 'Lab 3', color: '#ec4899' }, thursday: { subject: 'Physics', room: 'Lab 1', color: '#3b82f6' }, friday: { subject: 'Chemistry', room: 'Lab 2', color: '#10b981' } },
];

export const mockFeeData = [
  { term: 'Term 1', amount: 25000, paid: 25000, due: 0, status: 'paid', date: '2026-06-15' },
  { term: 'Term 2', amount: 25000, paid: 15000, due: 10000, status: 'partial', date: '2026-10-01' },
  { term: 'Term 3', amount: 25000, paid: 0, due: 25000, status: 'unpaid', date: '2027-02-01' },
];

export const mockSchools = [
  { id: 'sch1', name: 'Cornerstone Academy - North', students: 450, teachers: 35, attendance: 92, feeCollection: 85, performance: 88, location: 'North Delhi' },
  { id: 'sch2', name: 'Cornerstone Academy - South', students: 380, teachers: 30, attendance: 89, feeCollection: 91, performance: 85, location: 'South Delhi' },
  { id: 'sch3', name: 'Cornerstone Academy - East', students: 320, teachers: 28, attendance: 94, feeCollection: 78, performance: 90, location: 'East Delhi' },
  { id: 'sch4', name: 'Cornerstone Academy - West', students: 410, teachers: 32, attendance: 91, feeCollection: 88, performance: 87, location: 'West Delhi' },
];

export const mockRoutes = [
  { id: 'r1', name: 'Route Alpha - North Zone', stops: 8, students: 32, distance: '12.5 km', duration: '45 min', status: 'active' },
  { id: 'r2', name: 'Route Beta - South Zone', stops: 6, students: 28, distance: '9.8 km', duration: '35 min', status: 'active' },
  { id: 'r3', name: 'Route Gamma - East Zone', stops: 10, students: 38, distance: '15.2 km', duration: '55 min', status: 'active' },
];

export const mockEvents = [
  { id: 'e1', title: 'Annual Sports Day', date: '2026-02-15', type: 'event', description: 'Inter-house athletic competition' },
  { id: 'e2', title: 'Science Exhibition', date: '2026-01-28', type: 'academic', description: 'Student science projects showcase' },
  { id: 'e3', title: 'Parent-Teacher Meeting', date: '2026-02-05', type: 'meeting', description: 'Mid-term PTM for all classes' },
  { id: 'e4', title: 'Republic Day Celebration', date: '2026-01-26', type: 'holiday', description: 'School holiday - Republic Day' },
];

export const mockClubs = [
  { id: 'c1', name: 'Coding Club', members: 45, icon: '💻', color: '#6366f1' },
  { id: 'c2', name: 'Debate Society', members: 30, icon: '🎤', color: '#8b5cf6' },
  { id: 'c3', name: 'Science Olympiad', members: 25, icon: '🔬', color: '#10b981' },
  { id: 'c4', name: 'Art & Design', members: 35, icon: '🎨', color: '#f59e0b' },
  { id: 'c5', name: 'Sports Academy', members: 60, icon: '⚽', color: '#3b82f6' },
];

export const mockPerformanceData = [
  { month: 'Aug', gpa: 3.4, attendance: 88, assignments: 82 },
  { month: 'Sep', gpa: 3.5, attendance: 80, assignments: 85 },
  { month: 'Oct', gpa: 3.6, attendance: 96, assignments: 88 },
  { month: 'Nov', gpa: 3.7, attendance: 88, assignments: 90 },
  { month: 'Dec', gpa: 3.5, attendance: 76, assignments: 84 },
  { month: 'Jan', gpa: 3.8, attendance: 94, assignments: 92 },
];

export const mockRevenueData = [
  { month: 'Aug', collected: 1250000, pending: 350000, expenses: 890000 },
  { month: 'Sep', collected: 1380000, pending: 280000, expenses: 920000 },
  { month: 'Oct', collected: 1520000, pending: 220000, expenses: 870000 },
  { month: 'Nov', collected: 1450000, pending: 310000, expenses: 950000 },
  { month: 'Dec', collected: 1680000, pending: 180000, expenses: 1100000 },
  { month: 'Jan', collected: 1750000, pending: 150000, expenses: 980000 },
];

export const mockExamSchedule = [
  { id: 'ex1', subject: 'Mathematics', date: '2026-02-10', time: '09:00 - 12:00', room: 'Hall A', type: 'Final' },
  { id: 'ex2', subject: 'Physics', date: '2026-02-12', time: '09:00 - 12:00', room: 'Hall A', type: 'Final' },
  { id: 'ex3', subject: 'Chemistry', date: '2026-02-14', time: '09:00 - 12:00', room: 'Hall B', type: 'Final' },
  { id: 'ex4', subject: 'English', date: '2026-02-17', time: '09:00 - 12:00', room: 'Hall A', type: 'Final' },
  { id: 'ex5', subject: 'Biology', date: '2026-02-19', time: '09:00 - 12:00', room: 'Hall B', type: 'Final' },
  { id: 'ex6', subject: 'Computer Science', date: '2026-02-21', time: '09:00 - 12:00', room: 'IT Lab', type: 'Final' },
];

export const mockDriverStudents = [
  { id: 'ds1', name: 'Aarav Sharma', class: '10-A', pickup: '07:15', dropoff: '15:30', boarded: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', parentPhone: '+91 98765 43210' },
  { id: 'ds2', name: 'Priya Patel', class: '10-A', pickup: '07:22', dropoff: '15:25', boarded: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', parentPhone: '+91 98765 43211' },
  { id: 'ds3', name: 'Rohan Kumar', class: '10-B', pickup: '07:30', dropoff: '15:20', boarded: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', parentPhone: '+91 98765 43212' },
  { id: 'ds4', name: 'Ananya Singh', class: '10-A', pickup: '07:35', dropoff: '15:18', boarded: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', parentPhone: '+91 98765 43213' },
  { id: 'ds5', name: 'Vikram Reddy', class: '9-A', pickup: '07:42', dropoff: '15:15', boarded: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', parentPhone: '+91 98765 43214' },
];

export const mockQuestionBank = [
  { id: 'q1', subject: 'Mathematics', question: 'Solve the quadratic equation: x² + 5x + 6 = 0', type: 'subjective', difficulty: 'Easy', marks: 5 },
  { id: 'q2', subject: 'Physics', question: "State Ohm's Law and derive its mathematical expression.", type: 'subjective', difficulty: 'Medium', marks: 10 },
  { id: 'q3', subject: 'Chemistry', question: 'What is the molecular formula of Glucose?', type: 'mcq', difficulty: 'Easy', marks: 2, options: ['C6H12O6', 'C12H22O11', 'C6H10O5', 'C2H5OH'] },
  { id: 'q4', subject: 'English', question: 'Who wrote "The Waste Land"?', type: 'mcq', difficulty: 'Medium', marks: 2, options: ['T.S. Eliot', 'W.B. Yeats', 'Robert Frost', 'Emily Dickinson'] },
  { id: 'q5', subject: 'Mathematics', question: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3', type: 'subjective', difficulty: 'Hard', marks: 8 },
];
