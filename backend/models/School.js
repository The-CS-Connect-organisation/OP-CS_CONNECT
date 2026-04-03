import mongoose from 'mongoose';

const semesterPerformanceSchema = new mongoose.Schema(
  {
    semester: { type: String, required: true },
    percentage: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String, required: true },
  },
  { _id: false }
);

const parentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    childIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    phone: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    grade: { type: String, required: true, index: true },
    section: { type: String, required: true, index: true },
    rollNumber: { type: String, required: true, unique: true, index: true },
    subjects: [{ type: String, required: true }],
    attendancePercent: { type: Number, default: 100, min: 0, max: 100, index: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    performanceHistory: [semesterPerformanceSchema],
    xp: { type: Number, default: 0, index: true },
    badges: [{ type: String }],
    attendanceStreak: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

studentProfileSchema.index({ grade: 1, section: 1, attendancePercent: 1 });

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    subjects: [{ type: String, required: true, index: true }],
    phone: { type: String, trim: true },
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', index: true }],
  },
  { timestamps: true, versionKey: false }
);

const classRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    grade: { type: String, required: true, index: true },
    section: { type: String, required: true, index: true },
    privacyLeaderboardEnabled: { type: Boolean, default: true },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  },
  { timestamps: true, versionKey: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    subject: { type: String, required: true, trim: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    maxMarks: { type: Number, required: true, min: 1, max: 1000 },
    attachments: [{ fileName: String, mimeType: String, size: Number, url: String }],
  },
  { timestamps: true, versionKey: false }
);

assignmentSchema.index({ classId: 1, subject: 1, dueDate: -1 });

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submittedAt: { type: Date, default: Date.now, index: true },
    content: { type: String, trim: true, maxlength: 10000 },
    attachments: [{ fileName: String, mimeType: String, size: Number, url: String }],
    isLate: { type: Boolean, default: false, index: true },
    marks: { type: Number, min: 0 },
    feedback: { type: String, trim: true, maxlength: 5000 },
    gradedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const attendanceRecordSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

attendanceRecordSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true });

const markSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, index: true },
    subject: { type: String, required: true, index: true },
    examType: { type: String, enum: ['unit_test', 'mid_term', 'final'], required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    term: { type: String, required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

markSchema.index({ studentId: 1, subject: 1, term: 1 });

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    category: { type: String, enum: ['exam', 'holiday', 'event', 'emergency'], required: true, index: true },
    scope: { type: String, enum: ['school', 'class'], required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pinned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

announcementSchema.index({ scope: 1, classId: 1, pinned: -1, createdAt: -1 });

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', index: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true, versionKey: false }
);

messageSchema.index({ classId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });

const examScheduleSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, index: true },
    subject: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    room: { type: String, required: true, trim: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

examScheduleSchema.index({ classId: 1, date: 1, room: 1 }, { unique: true });

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassRoom', required: true, unique: true, index: true },
    entries: [
      {
        day: { type: String, required: true },
        period: { type: Number, required: true },
        subject: { type: String, required: true },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        room: { type: String, required: true },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const ParentProfile = mongoose.model('ParentProfile', parentProfileSchema);
export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export const TeacherProfile = mongoose.model('TeacherProfile', teacherProfileSchema);
export const ClassRoom = mongoose.model('ClassRoom', classRoomSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
export const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
export const Mark = mongoose.model('Mark', markSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Message = mongoose.model('Message', messageSchema);
export const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
export const Timetable = mongoose.model('Timetable', timetableSchema);
