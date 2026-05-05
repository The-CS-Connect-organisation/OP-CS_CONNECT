import { KEYS, getFromStorage, setToStorage } from './schema';
import { getDataMode, DATA_MODES } from '../config/dataMode';
import { apiRequest } from '../services/apiClient';

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
      avatar: '👨‍👩‍👧',
      joined: daysAgo(250 - idx * 2),
      phone: `+91 90300 00${String(idx + 1).padStart(3, '0')}`,
    }));
    const drivers = [
      { id: 'driver-1', name: 'Rajesh Kumar', email: 'driver@schoolsync.edu', password: 'driver123', role: 'driver', avatar: '🚌', joined: daysAgo(200), phone: '+91 90400 00001', busNumber: 'BUS-001', licensePlate: 'DL-01-AB-1234', routeId: 'route-1' },
      { id: 'driver-2', name: 'Suresh Patel', email: 'driver2@schoolsync.edu', password: 'driver123', role: 'driver', avatar: '🚌', joined: daysAgo(190), phone: '+91 90400 00002', busNumber: 'BUS-002', licensePlate: 'DL-01-CD-5678', routeId: 'route-2' },
      { id: 'driver-3', name: 'Mohan Singh', email: 'driver3@schoolsync.edu', password: 'driver123', role: 'driver', avatar: '🚌', joined: daysAgo(180), phone: '+91 90400 00003', busNumber: 'BUS-003', licensePlate: 'DL-01-EF-9012', routeId: 'route-3' },
    ];
    return [...admins, ...teachers, ...students, ...parents, ...drivers];
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

  // Check data mode - only seed in LOCAL_DEMO mode
  const dataMode = getDataMode();
  console.log('🌱 Data mode:', dataMode);

  if (dataMode === DATA_MODES.REMOTE_API) {
    console.log('🌱 REMOTE_API mode - skipping local seed (data comes from backend)');
    return;
  }

  // Force re-seed when seed data structure changes (e.g., email fixes).
  const SEED_VERSION = 5; // Bump this to force re-seed (Driver persistence fix)
  const storedVersion = getFromStorage('sms_seed_version', 0);
  console.log('🌱 Seed initialization - storedVersion:', storedVersion, 'SEED_VERSION:', SEED_VERSION);
  if (storedVersion < SEED_VERSION) {
    console.log('🌱 Version mismatch - clearing stale data');
    // Clear stale user data using storage abstraction
    // NOTE: Do NOT clear CURRENT_USER or AUTH_TOKEN - these are session data that should persist
    setToStorage(KEYS.USERS, null);
    setToStorage(KEYS.FEES, null);
    setToStorage(KEYS.ATTENDANCE, null);
    setToStorage('sms_seed_version', SEED_VERSION);
  }

  // Ensure `users` exists.
  let users = getFromStorage(KEYS.USERS, null);
  console.log('🌱 Users from storage:', users?.length || 0, 'users');
  if (users && users.length > 0) {
    console.log('🌱 First user:', users[0]);
    console.log('🌱 Admin users:', users.filter(u => u.role === 'admin').map(u => ({ name: u.name, email: u.email })));
  }
  if (!Array.isArray(users) || users.length === 0) {
    console.log('🌱 Seeding users for LOCAL_DEMO mode...');
    users = seedUsers();
    console.log('🌱 Seeded users:', users.length, 'users');
    console.log('🌱 First seeded user:', users[0]);
    console.log('🌱 Admin users seeded:', users.filter(u => u.role === 'admin').map(u => ({ name: u.name, email: u.email })));
    setToStorage(KEYS.USERS, users);
    console.log('🌱 Users saved to storage for LOCAL_DEMO mode');
  }

  // Ensure `fees` exists for current users.
  const existingFees = getFromStorage(KEYS.FEES, null);
  if (!Array.isArray(existingFees) || existingFees.length === 0) {
    const fees = seedFeesForUsers(users);
    setToStorage(KEYS.FEES, fees);
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
  if (!Array.isArray(notes)) setToStorage(KEYS.NOTES, []);

  const announcements = getFromStorage(KEYS.ANNOUNCEMENTS, null);
  if (!Array.isArray(announcements)) setToStorage(KEYS.ANNOUNCEMENTS, []);

  const notifications = getFromStorage(KEYS.NOTIFICATIONS, null);
  if (!Array.isArray(notifications)) setToStorage(KEYS.NOTIFICATIONS, []);
};
