import bcrypt from 'bcryptjs';
import { connectDatabase, closeDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import {
  Announcement,
  Assignment,
  AttendanceRecord,
  ClassRoom,
  Mark,
  ParentProfile,
  StudentProfile,
  Submission,
  TeacherProfile,
} from '../models/School.js';

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    ClassRoom.deleteMany({}),
    StudentProfile.deleteMany({}),
    TeacherProfile.deleteMany({}),
    ParentProfile.deleteMany({}),
    Assignment.deleteMany({}),
    Submission.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Mark.deleteMany({}),
    Announcement.deleteMany({}),
  ]);

  const adminHash = await bcrypt.hash('Admin@123', 12);
  const teacherHash = await bcrypt.hash('Teacher@123', 12);
  const studentHash = await bcrypt.hash('Student@123', 12);
  const parentHash = await bcrypt.hash('Parent@123', 12);

  const teacherSeed = [
    { name: 'Rajesh Kumar', subjects: ['Mathematics'], experience: 12 },
    { name: 'Priya Sharma', subjects: ['English Literature'], experience: 8 },
    { name: 'Anil Verma', subjects: ['Physics'], experience: 10 },
    { name: 'Sunita Patel', subjects: ['Chemistry'], experience: 7 },
    { name: 'Mohammed Irfan', subjects: ['Computer Science'], experience: 5 },
    { name: 'Kavitha Nair', subjects: ['Biology'], experience: 9 },
    { name: 'Deepak Singh', subjects: ['History', 'Civics'], experience: 11 },
    { name: 'Ananya Reddy', subjects: ['Mathematics', 'Statistics'], experience: 6 },
  ];
  const studentNames = [
    'Aarav Menon', 'Ishita Kapoor', 'Vivaan Joshi', 'Diya Malhotra', 'Aditya Rao',
    'Saanvi Iyer', 'Rohan Bhat', 'Meera Khanna', 'Kunal Deshmukh', 'Tanvi Arora',
    'Harsh Vyas', 'Neha Banerjee', 'Yash Jain', 'Pooja Sinha', 'Arjun Bansal',
    'Niharika Das', 'Ritik Choudhary', 'Simran Gill', 'Lakshya Dutta', 'Riya Narang',
  ];

  const admin = await User.create({
    name: 'Greenfield Super Admin',
    email: 'admin@greenfield.edu',
    passwordHash: adminHash,
    role: 'admin',
  });

  const teachers = await User.insertMany(
    teacherSeed.map((teacher, idx) => ({
      name: teacher.name,
      email: `teacher${idx + 1}@greenfield.edu`,
      passwordHash: teacherHash,
      role: 'teacher',
    }))
  );

  const students = await User.insertMany(
    studentNames.map((name, idx) => ({
      name,
      email: `student${idx + 1}@greenfield.edu`,
      passwordHash: studentHash,
      role: 'student',
    }))
  );
  const parents = await User.insertMany(
    studentNames.map((name, idx) => ({
      name: `${name.split(' ')[0]}'s Parent`,
      email: `parent${idx + 1}@greenfield.edu`,
      passwordHash: parentHash,
      role: 'parent',
    }))
  );

  const classes = await ClassRoom.insertMany([
    { name: 'Grade 9-A', grade: '9', section: 'A' },
    { name: 'Grade 10-A', grade: '10', section: 'A' },
    { name: 'Grade 11-A', grade: '11', section: 'A' },
  ]);

  const attendanceBand = [95, 93, 91, 88, 86, 84, 82, 80, 78, 76, 74, 72];

  for (let i = 0; i < students.length; i += 1) {
    const classRoom = classes[i % classes.length];
    classRoom.studentIds = [...(classRoom.studentIds || []), students[i]._id];
  }
  for (let i = 0; i < teachers.length; i += 1) {
    const first = classes[i % classes.length];
    const second = classes[(i + 1) % classes.length];
    first.teacherIds = [...(first.teacherIds || []), teachers[i]._id];
    second.teacherIds = [...(second.teacherIds || []), teachers[i]._id];
  }
  await Promise.all(classes.map((c) => c.save()));

  await TeacherProfile.insertMany(
    teachers.map((teacher, idx) => ({
      userId: teacher._id,
      subjects: teacherSeed[idx].subjects,
      classIds: classes.filter((c) => (c.teacherIds || []).some((id) => id.toString() === teacher._id.toString())).map((c) => c._id),
      phone: `+91-98${String(7654300 + idx).padStart(7, '0')}`,
    }))
  );

  await StudentProfile.insertMany(
    students.map((student, idx) => {
      const classRoom = classes[idx % classes.length];
      const attendancePercent = attendanceBand[idx % attendanceBand.length];
      return {
        userId: student._id,
        grade: classRoom.grade,
        section: classRoom.section,
        rollNumber: `${classRoom.grade}${classRoom.section}-${String(idx + 1).padStart(3, '0')}`,
        subjects: ['Mathematics', 'Physics', 'English'],
        attendancePercent,
        parentName: parents[idx].name,
        parentPhone: `+91-90${String(1000000 + idx).padStart(7, '0')}`,
        xp: Math.max(10, 120 - idx * 4),
        badges: attendancePercent >= 90 ? ['Punctual'] : attendancePercent <= 75 ? ['Needs Support'] : ['Consistent'],
      };
    }))
  );

  await ParentProfile.insertMany(
    parents.map((parent, idx) => ({
      userId: parent._id,
      childIds: [students[idx]._id],
      phone: `+91-90${String(1000000 + idx).padStart(7, '0')}`,
    }))
  );

  const assignments = await Assignment.insertMany(
    classes.flatMap((classRoom, idx) => ([
      {
        title: `${classRoom.name} Mathematics Worksheet`,
        description: `Practice algebra and data interpretation for ${classRoom.name}.`,
        subject: 'Mathematics',
        classId: classRoom._id,
        teacherId: teachers[idx % teachers.length]._id,
        dueDate: new Date(Date.now() + (idx + 3) * 24 * 60 * 60 * 1000),
        maxMarks: 100,
      },
      {
        title: `${classRoom.name} Science Lab Report`,
        description: `Submit full lab observations and inferences for ${classRoom.name}.`,
        subject: 'Physics',
        classId: classRoom._id,
        teacherId: teachers[(idx + 2) % teachers.length]._id,
        dueDate: new Date(Date.now() + (idx + 5) * 24 * 60 * 60 * 1000),
        maxMarks: 100,
      },
    ]))
  );

  await Submission.insertMany(
    students.slice(0, 15).map((student, idx) => {
      const assignment = assignments[idx % assignments.length];
      const submittedAt = new Date(Date.now() - idx * 3600 * 1000);
      return {
        assignmentId: assignment._id,
        studentId: student._id,
        submittedAt,
        isLate: submittedAt > assignment.dueDate,
        content: `Submission draft by ${student.name}.`,
        marks: 65 + (idx % 35),
        feedback: 'Good attempt. Improve structure and examples.',
        gradedAt: new Date(),
      };
    })
  );

  await Mark.insertMany(
    students.flatMap((student, idx) => {
      const classRoom = classes[idx % classes.length];
      return [
        { studentId: student._id, classId: classRoom._id, subject: 'Mathematics', examType: 'unit_test', score: 60 + (idx % 35), term: 'Term 1' },
        { studentId: student._id, classId: classRoom._id, subject: 'Physics', examType: 'mid_term', score: 58 + ((idx * 2) % 35), term: 'Term 1' },
        { studentId: student._id, classId: classRoom._id, subject: 'English', examType: 'final', score: 62 + ((idx * 3) % 30), term: 'Term 1' },
      ];
    })
  );

  const attendanceRows = [];
  for (let day = 0; day < 30; day += 1) {
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    for (let i = 0; i < students.length; i += 1) {
      const classRoom = classes[i % classes.length];
      const teacher = teachers[i % teachers.length];
      const statusPick = (i + day) % 14;
      const status = statusPick < 10 ? 'present' : statusPick < 12 ? 'late' : 'absent';
      attendanceRows.push({
        classId: classRoom._id,
        studentId: students[i]._id,
        teacherId: teacher._id,
        date,
        status,
      });
    }
  }
  await AttendanceRecord.insertMany(attendanceRows);

  await Announcement.insertMany([
    {
      title: 'Greenfield International School Orientation',
      body: 'New academic year orientation starts next Monday at 9 AM.',
      category: 'event',
      scope: 'school',
      createdBy: admin._id,
      pinned: true,
    },
    {
      title: 'Mid Term Schedule Released',
      body: 'Exam IDs and hall ticket details are available in student portal.',
      category: 'exam',
      scope: 'school',
      createdBy: admin._id,
      pinned: true,
    },
    {
      title: 'Heavy Rain Alert',
      body: 'School transport delay expected tomorrow due to rain forecast.',
      category: 'emergency',
      scope: 'school',
      createdBy: admin._id,
      pinned: false,
    },
  ]);

  console.log('Greenfield International School seed complete.');
  console.log('Admin Login: admin@greenfield.edu / Admin@123');
  console.log('Teacher Login: teacher1@greenfield.edu / Teacher@123');
  console.log('Student Login: student1@greenfield.edu / Student@123');
  console.log('Parent Login: parent1@greenfield.edu / Parent@123');

  await closeDatabase();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error(error);
  await closeDatabase();
  process.exit(1);
});
