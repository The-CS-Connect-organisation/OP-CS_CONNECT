import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPaginatedResponse, parsePagination } from '../utils/pagination.js';
import { User } from '../models/User.js';
import {
  Announcement,
  Assignment,
  AttendanceRecord,
  ClassRoom,
  Mark,
  Message,
  StudentProfile,
  Submission,
  TeacherProfile,
  Timetable,
} from '../models/School.js';

const gradeFromPercentage = (percentage) => {
  if (percentage >= 90) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 45) return 'D';
  return 'F';
};

export const createClassRoom = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.create(req.body);
  res.status(201).json({ success: true, classRoom });
});

export const createStudentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId).lean();
  if (!user || user.role !== 'student') throw new ApiError(400, 'userId must belong to a student');
  const profile = await StudentProfile.create(req.body);
  res.status(201).json({ success: true, profile });
});

export const createTeacherProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId).lean();
  if (!user || user.role !== 'teacher') throw new ApiError(400, 'userId must belong to a teacher');
  const profile = await TeacherProfile.create(req.body);
  res.status(201).json({ success: true, profile });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.grade) filter.grade = req.query.grade;
  if (req.query.section) filter.section = req.query.section;
  if (req.query.minAttendance) filter.attendancePercent = { $gte: Number(req.query.minAttendance) };

  const [items, total] = await Promise.all([
    StudentProfile.find(filter).sort({ xp: -1 }).skip(skip).limit(limit).lean(),
    StudentProfile.countDocuments(filter),
  ]);

  res.json({ success: true, ...buildPaginatedResponse({ items, total, page, limit }) });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({
    ...req.body,
    teacherId: req.user.id,
    attachments: (req.files || []).map((file) => ({
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename || file.originalname}`,
    })),
  });
  res.status(201).json({ success: true, assignment });
});

export const listAssignments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.classId) filter.classId = req.query.classId;
  if (req.query.subject) filter.subject = req.query.subject;
  const [items, total] = await Promise.all([
    Assignment.find(filter).sort({ dueDate: 1 }).skip(skip).limit(limit).lean(),
    Assignment.countDocuments(filter),
  ]);
  res.json({ success: true, ...buildPaginatedResponse({ items, total, page, limit }) });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).lean();
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  const submittedAt = new Date();
  const isLate = submittedAt > new Date(assignment.dueDate);
  const submission = await Submission.findOneAndUpdate(
    { assignmentId: assignment._id, studentId: req.user.id },
    {
      assignmentId: assignment._id,
      studentId: req.user.id,
      submittedAt,
      isLate,
      content: req.body.content,
      attachments: (req.files || []).map((file) => ({
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename || file.originalname}`,
      })),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!isLate) {
    await StudentProfile.updateOne({ userId: req.user.id }, { $inc: { xp: 10 } });
  }

  res.status(201).json({ success: true, submission });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.submissionId);
  if (!submission) throw new ApiError(404, 'Submission not found');
  submission.marks = req.body.marks;
  submission.feedback = req.body.feedback || '';
  submission.gradedAt = new Date();
  await submission.save();

  if (submission.marks >= 100) {
    await StudentProfile.updateOne({ userId: submission.studentId }, { $inc: { xp: 25 }, $addToSet: { badges: 'Top Scorer' } });
  }

  res.json({ success: true, submission });
});

export const markAttendance = asyncHandler(async (req, res) => {
  const { classId, date, entries } = req.body;
  await Promise.all(
    entries.map((entry) =>
      AttendanceRecord.findOneAndUpdate(
        { classId, studentId: entry.studentId, date },
        { classId, studentId: entry.studentId, teacherId: req.user.id, date, status: entry.status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  // Recalculate attendance percentages and apply low-attendance alerts.
  await Promise.all(
    entries.map(async (entry) => {
      const [total, presentOrLate] = await Promise.all([
        AttendanceRecord.countDocuments({ studentId: entry.studentId }),
        AttendanceRecord.countDocuments({ studentId: entry.studentId, status: { $in: ['present', 'late'] } }),
      ]);
      const attendancePercent = total > 0 ? Math.round((presentOrLate / total) * 100) : 100;
      await StudentProfile.updateOne({ userId: entry.studentId }, { attendancePercent });
    })
  );

  res.json({ success: true, message: 'Attendance updated' });
});

export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const month = Number(req.query.month ?? new Date().getMonth() + 1);
  const year = Number(req.query.year ?? new Date().getFullYear());
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const records = await AttendanceRecord.find({
    studentId,
    date: { $gte: start, $lt: end },
  })
    .sort({ date: 1 })
    .lean();

  const csvRows = ['date,status', ...records.map((r) => `${new Date(r.date).toISOString().slice(0, 10)},${r.status}`)];
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-${studentId}-${year}-${month}.csv`);
    return res.status(200).send(csvRows.join('\n'));
  }

  return res.json({ success: true, records });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, createdBy: req.user.id });
  if (req.io) req.io.emit('announcement:new', announcement);
  res.status(201).json({ success: true, announcement });
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.scope) filter.scope = req.query.scope;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.classId) filter.classId = req.query.classId;
  const [items, total] = await Promise.all([
    Announcement.find(filter).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Announcement.countDocuments(filter),
  ]);
  res.json({ success: true, ...buildPaginatedResponse({ items, total, page, limit }) });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await Message.create({
    senderId: req.user.id,
    recipientId: req.body.recipientId,
    classId: req.body.classId,
    content: req.body.content,
    readBy: [req.user.id],
  });
  if (req.io) req.io.emit('message:new', message);
  res.status(201).json({ success: true, message });
});

export const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.messageId,
    { $addToSet: { readBy: req.user.id } },
    { new: true }
  ).lean();
  if (!message) throw new ApiError(404, 'Message not found');
  res.json({ success: true, message });
});

export const createMark = asyncHandler(async (req, res) => {
  const mark = await Mark.create(req.body);
  res.status(201).json({ success: true, mark });
});

export const getReportCard = asyncHandler(async (req, res) => {
  const marks = await Mark.find({ studentId: req.params.studentId }).lean();
  if (!marks.length) {
    return res.json({ success: true, report: { total: 0, percentage: 0, grade: 'N/A', marks: [] } });
  }
  const total = marks.reduce((sum, m) => sum + m.score, 0);
  const percentage = Number((total / marks.length).toFixed(2));
  const grade = gradeFromPercentage(percentage);
  const subjectBreakdown = marks.reduce((acc, mark) => {
    if (!acc[mark.subject]) acc[mark.subject] = [];
    acc[mark.subject].push(mark.score);
    return acc;
  }, {});
  res.json({
    success: true,
    report: {
      total,
      percentage,
      grade,
      strengths: Object.entries(subjectBreakdown)
        .filter(([, scores]) => scores.reduce((s, x) => s + x, 0) / scores.length >= 75)
        .map(([subject]) => subject),
      weaknesses: Object.entries(subjectBreakdown)
        .filter(([, scores]) => scores.reduce((s, x) => s + x, 0) / scores.length < 60)
        .map(([subject]) => subject),
      marks,
    },
  });
});

export const saveTimetable = asyncHandler(async (req, res) => {
  const { classId, entries } = req.body;

  const duplicateSlots = new Set();
  for (const entry of entries) {
    const slot = `${entry.day}|${entry.period}|${entry.room}`;
    if (duplicateSlots.has(slot)) {
      throw new ApiError(400, `Timetable clash detected at ${slot}`);
    }
    duplicateSlots.add(slot);
  }

  const timetable = await Timetable.findOneAndUpdate({ classId }, { classId, entries }, { upsert: true, new: true });
  res.json({ success: true, timetable });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const classRoom = await ClassRoom.findById(req.params.classId).lean();
  if (!classRoom) throw new ApiError(404, 'Class not found');
  if (!classRoom.privacyLeaderboardEnabled && req.user.role === 'student') {
    throw new ApiError(403, 'Leaderboard is disabled for this class');
  }

  const students = await StudentProfile.find({ userId: { $in: classRoom.studentIds } })
    .sort({ xp: -1, attendancePercent: -1 })
    .limit(50)
    .lean();
  res.json({ success: true, leaderboard: students });
});
