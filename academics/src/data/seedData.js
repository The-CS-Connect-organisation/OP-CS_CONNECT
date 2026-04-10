import { KEYS, getFromStorage, setToStorage } from './schema';

export const initializeApp = () => {
  const isNonEmptyArray = (v) => Array.isArray(v) && v.length > 0;
  const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return formatDate(d);
  };

  const seedUsers = () => {
    const admins = [
      { id: 'admin-1', name: 'Alicia Morgan', email: 'admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(420), phone: '+91 90000 00001' },
      { id: 'admin-2', name: 'Rahul Venkataraman', email: 'rahul.admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👨‍💼', joined: daysAgo(380), phone: '+91 90000 00002' },
      { id: 'admin-3', name: 'Neha Kapoor', email: 'neha.admin@schoolsync.edu', password: 'admin123', role: 'admin', avatar: '👩‍💼', joined: daysAgo(340), phone: '+91 90000 00003' },
    ];
    const teachers = [
      ['James Anderson', 'Mathematics'], ['Emily Chen', 'Science'], ['Arjun Mehta', 'Physics'], ['Sara Iqbal', 'English'],
      ['David Roy', 'Computer Science'], ['Priyanka Menon', 'Biology'], ['Kiran Reddy', 'History'], ['Maya Thomas', 'Chemistry'],
    ].map((item, idx) => ({
      id: `teacher-${idx + 1}`,
      name: item[0],
      email: idx === 0 ? 'james@schoolsync.edu' : `teacher${idx + 1}@schoolsync.edu`,
      password: 'teacher123',
      role: 'teacher',
      avatar: '👨‍🏫',
      joined: daysAgo(300 - idx * 10),
      phone: `+91 90100 00${String(idx + 1).padStart(3, '0')}`,
      department: item[1],
      subjects: [item[1]],
    }));
    const students = [
      'Aarav Menon', 'Ishita Kapoor', 'Vivaan Joshi', 'Diya Malhotra', 'Aditya Rao',
      'Saanvi Iyer', 'Rohan Bhat', 'Meera Khanna', 'Kunal Deshmukh', 'Tanvi Arora',
    ].map((name, idx) => ({
      id: `student-${idx + 1}`,
      name,
      email: idx === 0 ? 'alex@schoolsync.edu' : `student${idx + 1}@schoolsync.edu`,
      password: 'student123',
      role: 'student',
      avatar: idx % 2 ? '👧' : '👦',
      joined: daysAgo(210 - idx),
      class: idx < 5 ? '10-A' : '10-B',
      section: idx < 5 ? 'A' : 'B',
      admissionNo: `GFS-2024-${String(idx + 1).padStart(3, '0')}`,
      rollNo: idx < 5 ? `10A-00${idx + 1}` : `10B-00${idx - 4}`,
      parentName: `Parent ${idx + 1}`,
      parentPhone: `+91 90200 00${String(idx + 1).padStart(3, '0')}`,
      attendancePercent: 92 - idx * 2,
    }));
    const parents = Array.from({ length: 20 }).map((_, idx) => ({
      id: `parent-${idx + 1}`,
      name: idx === 0 ? 'Priya Menon' : `Guardian ${idx + 1}`,
      email: idx === 0 ? 'parent@schoolsync.edu' : `parent${idx + 1}@schoolsync.edu`,
      password: 'parent123',
      role: 'parent',
      avatar: '🧑',
      joined: daysAgo(250 - idx * 2),
      phone: `+91 90300 00${String(idx + 1).padStart(3, '0')}`,
    }));
    return [...admins, ...teachers, ...students, ...parents];
  };

  const seedFeesForUsers = (users) => {
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
          status: 'pending',
          paidAt: null,
          transactionId: null,
          paymentMethod: null,
          createdAt: daysAgo(30 + idx * 30),
        });
      });
    });

    return fees;
  };

  const seedAttendance = (users) => {
    const students = users.filter(u => u.role === 'student');
    const subjects = ['Mathematics', 'Science', 'English'];
    const attendance = [];
    const dayLimit = 14; // Last 14 days

    students.forEach(student => {
      for (let i = 0; i < dayLimit; i++) {
        const date = daysAgo(i);
        const day = new Date(date).getDay();
        if (day === 0) continue; // Skip Sundays

        subjects.forEach(subject => {
          const rand = Math.random();
          let status = 'present';
          if (rand < 0.05) status = 'absent';
          else if (rand < 0.15) status = 'late';
          
          attendance.push({
            id: `att-${student.id}-${date}-${subject}-${i}`,
            studentId: student.id,
            date,
            subject,
            status
          });
        });
      }
    });
    return attendance;
  };

  // Force re-seed when seed data structure changes
  const SEED_VERSION = 4; // Bumped: fees now use API user IDs from localStorage current user
  const storedVersion = getFromStorage('sms_seed_version', 0);
  if (storedVersion < SEED_VERSION) {
    // Clear stale user data
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.FEES);
    localStorage.removeItem(KEYS.ATTENDANCE);
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    setToStorage('sms_seed_version', SEED_VERSION);
  }

  // Ensure `users` exists.
  let users = getFromStorage(KEYS.USERS, null);
  if (!Array.isArray(users) || users.length === 0) {
    users = seedUsers();
    setToStorage(KEYS.USERS, users);
  }

  // Ensure `fees` exists for current users.
  const existingFees = getFromStorage(KEYS.FEES, null);
  if (!Array.isArray(existingFees) || existingFees.length === 0) {
    // Seed fees for localStorage users AND for the currently logged-in API user
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    const feeStudents = [...users.filter(u => u.role === 'student')];
    // If logged-in user is a student with a UUID (from Supabase), add them too
    if (currentUser?.role === 'student' && !feeStudents.find(s => s.id === currentUser.id)) {
      feeStudents.push(currentUser);
    }
    const fees = seedFeesForUsers(feeStudents);
    setToStorage(KEYS.FEES, fees);
  } else {
    // Check if current logged-in student has fees; if not, add them
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    if (currentUser?.role === 'student') {
      const hasFees = existingFees.some(f => f.studentId === currentUser.id);
      if (!hasFees) {
        const newFees = seedFeesForUsers([currentUser]);
        setToStorage(KEYS.FEES, [...existingFees, ...newFees]);
      }
    }
  }

  const attendance = getFromStorage(KEYS.ATTENDANCE, null);
  if (!Array.isArray(attendance) || attendance.length === 0) {
    const seededAtt = seedAttendance(users);
    setToStorage(KEYS.ATTENDANCE, seededAtt);
  }

  const assignments = getFromStorage(KEYS.ASSIGNMENTS, null);
  if (!Array.isArray(assignments)) setToStorage(KEYS.ASSIGNMENTS, []);


  const marks = getFromStorage(KEYS.MARKS, null);
  if (!Array.isArray(marks) || marks.length === 0) {
    const students = users.filter((u) => u.role === 'student');
    const subjects = ['Mathematics', 'Science', 'English'];
    const seededMarks = students.flatMap((student, sIdx) =>
      subjects.flatMap((subject, subIdx) => ([
        {
          id: `mk-${student.id}-${subject}-c1`,
          studentId: student.id,
          subject,
          examType: 'unit_test',
          examName: 'Cycle Test 1',
          marksObtained: 62 + ((sIdx + subIdx * 3) % 32),
          maxMarks: 100,
          grade: 'B+',
          term: 'Term 1',
        },
        {
          id: `mk-${student.id}-${subject}-c2`,
          studentId: student.id,
          subject,
          examType: 'mid_term',
          examName: 'Cycle Test 2',
          marksObtained: 66 + ((sIdx + subIdx * 4) % 30),
          maxMarks: 100,
          grade: 'A',
          term: 'Term 1',
        },
      ]))
    );
    setToStorage(KEYS.MARKS, seededMarks);
  }

  const timetable = getFromStorage(KEYS.TIMETABLE, null);
  if (!isObject(timetable)) setToStorage(KEYS.TIMETABLE, {});

  const notes = getFromStorage(KEYS.NOTES, null);
  if (!Array.isArray(notes) || notes.length === 0) {
    const teachers = users.filter(u => u.role === 'teacher');
    const seededNotes = [
      { id: 'note-1', title: 'Quadratic Equations — Complete Notes', subject: 'Mathematics', class: '10-A', description: 'Comprehensive notes covering all methods to solve quadratic equations including factoring, completing the square, and the quadratic formula.', teacherId: teachers[0]?.id || 'teacher-1', teacherName: teachers[0]?.name || 'James Anderson', createdAt: daysAgo(10), fileSize: '2.4 MB', downloads: 12 },
      { id: 'note-2', title: 'Newton\'s Laws of Motion', subject: 'Physics', class: '10-A', description: 'Detailed explanation of all three laws with real-world examples, diagrams, and practice problems.', teacherId: teachers[2]?.id || 'teacher-3', teacherName: teachers[2]?.name || 'Arjun Mehta', createdAt: daysAgo(8), fileSize: '3.1 MB', downloads: 8 },
      { id: 'note-3', title: 'Essay Writing Techniques', subject: 'English', class: '10-A', description: 'Step-by-step guide to writing argumentative and descriptive essays with sample essays and marking rubric.', teacherId: teachers[3]?.id || 'teacher-4', teacherName: teachers[3]?.name || 'Sara Iqbal', createdAt: daysAgo(5), fileSize: '1.8 MB', downloads: 15 },
      { id: 'note-4', title: 'Organic Chemistry Basics', subject: 'Chemistry', class: '10-A', description: 'Introduction to organic compounds, functional groups, and basic reaction mechanisms.', teacherId: teachers[7]?.id || 'teacher-8', teacherName: teachers[7]?.name || 'Maya Thomas', createdAt: daysAgo(3), fileSize: '4.2 MB', downloads: 6 },
      { id: 'note-5', title: 'Data Structures in Python', subject: 'Computer Science', class: '10-B', description: 'Lists, tuples, dictionaries, and sets explained with code examples and exercises.', teacherId: teachers[4]?.id || 'teacher-5', teacherName: teachers[4]?.name || 'David Roy', createdAt: daysAgo(7), fileSize: '2.9 MB', downloads: 20 },
      { id: 'note-6', title: 'Cell Biology — Detailed Notes', subject: 'Biology', class: '10-B', description: 'Complete notes on cell structure, organelles, cell division, and cellular processes.', teacherId: teachers[5]?.id || 'teacher-6', teacherName: teachers[5]?.name || 'Priyanka Menon', createdAt: daysAgo(12), fileSize: '5.1 MB', downloads: 9 },
    ];
    setToStorage(KEYS.NOTES, seededNotes);
  }

  // Seed note requests — auto-approve all notes for all students
  const noteRequests = getFromStorage(KEYS.NOTE_REQUESTS, null);
  if (!Array.isArray(noteRequests) || noteRequests.length === 0) {
    const currentNotes = getFromStorage(KEYS.NOTES, []);
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    const studentUsers = users.filter(u => u.role === 'student');
    if (currentUser?.role === 'student') studentUsers.push(currentUser);
    const requests = [];
    currentNotes.forEach(note => {
      studentUsers.forEach(student => {
        if (!requests.find(r => r.noteId === note.id && r.studentId === student.id)) {
          requests.push({
            id: `req-${note.id}-${student.id}`,
            noteId: note.id,
            noteTitle: note.title,
            teacherId: note.teacherId,
            teacherName: note.teacherName,
            studentId: student.id,
            studentName: student.name,
            class: note.class,
            subject: note.subject,
            message: 'Auto-approved',
            status: 'fulfilled',
            createdAt: daysAgo(5),
            fulfilledAt: daysAgo(4),
            fulfilledBy: note.teacherName,
          });
        }
      });
    });
    setToStorage(KEYS.NOTE_REQUESTS, requests);
  } else {
    // Auto-approve for current logged-in student if not already
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    if (currentUser?.role === 'student') {
      const currentNotes = getFromStorage(KEYS.NOTES, []);
      const existing = noteRequests;
      let changed = false;
      currentNotes.forEach(note => {
        if (!existing.find(r => r.noteId === note.id && r.studentId === currentUser.id)) {
          existing.push({ id: `req-${note.id}-${currentUser.id}`, noteId: note.id, noteTitle: note.title, teacherId: note.teacherId, teacherName: note.teacherName, studentId: currentUser.id, studentName: currentUser.name, class: note.class, subject: note.subject, message: 'Auto-approved', status: 'fulfilled', createdAt: daysAgo(5), fulfilledAt: daysAgo(4), fulfilledBy: note.teacherName });
          changed = true;
        }
      });
      if (changed) setToStorage(KEYS.NOTE_REQUESTS, existing);
    }
  }

  const announcements = getFromStorage(KEYS.ANNOUNCEMENTS, null);
  if (!Array.isArray(announcements) || announcements.length === 0) {
    setToStorage(KEYS.ANNOUNCEMENTS, [
      { id: 'ann-1', title: 'New Academic Year Orientation', content: 'Orientation for the new academic year starts Monday at 9 AM in the main auditorium.', date: daysAgo(2), priority: 'high', category: 'event' },
      { id: 'ann-2', title: 'Mid Term Exam Schedule Released', content: 'Mid-term exams begin April 21. Hall tickets available in the student portal.', date: daysAgo(5), priority: 'high', category: 'exam' },
      { id: 'ann-3', title: 'Science Fair 2026 — Registrations Open', content: 'Annual Science Fair registrations are now open. Last date: April 30.', date: daysAgo(7), priority: 'normal', category: 'event' },
      { id: 'ann-4', title: 'Holiday: Republic Day', content: 'School will remain closed on January 26 for Republic Day.', date: daysAgo(10), priority: 'normal', category: 'holiday' },
      { id: 'ann-5', title: 'Parent-Teacher Meeting — April 20', content: 'PTM is scheduled for April 20 from 10 AM to 1 PM.', date: daysAgo(1), priority: 'high', category: 'event' },
    ]);
  }

  const exams = getFromStorage(KEYS.EXAMS, null);
  if (!Array.isArray(exams) || exams.length === 0) {
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');
    const currentUser = getFromStorage(KEYS.CURRENT_USER);
    const allStudents = currentUser?.role === 'student' ? [...students, currentUser] : students;
    setToStorage(KEYS.EXAMS, [
      { id: 'exam-1', name: 'Cycle Test 1 — Mathematics', subject: 'Mathematics', class: '10-A', date: daysAgo(30), maxMarks: 100, createdBy: teachers[0]?.id || 'teacher-1', status: 'evaluated', results: allStudents.filter(s => s.class === '10-A' || s.role === 'student').map((s, i) => ({ studentId: s.id, studentName: s.name, marks: 65 + (i * 7) % 30 })) },
      { id: 'exam-2', name: 'Mid Term — Physics', subject: 'Physics', class: '10-A', date: daysAgo(15), maxMarks: 100, createdBy: teachers[2]?.id || 'teacher-3', status: 'evaluated', results: allStudents.filter(s => s.class === '10-A' || s.role === 'student').map((s, i) => ({ studentId: s.id, studentName: s.name, marks: 60 + (i * 9) % 35 })) },
      { id: 'exam-3', name: 'Cycle Test 2 — English', subject: 'English', class: '10-B', date: daysAgo(20), maxMarks: 50, createdBy: teachers[3]?.id || 'teacher-4', status: 'evaluated', results: allStudents.filter(s => s.class === '10-B').map((s, i) => ({ studentId: s.id, studentName: s.name, marks: 35 + (i * 5) % 15 })) },
      { id: 'exam-4', name: 'Pre-Board — Chemistry', subject: 'Chemistry', class: '10-A', date: daysAgo(5), maxMarks: 100, createdBy: teachers[7]?.id || 'teacher-8', status: 'pending', results: [] },
    ]);
  }

  const notifications = getFromStorage(KEYS.NOTIFICATIONS, null);
  if (!Array.isArray(notifications)) setToStorage(KEYS.NOTIFICATIONS, []);
};