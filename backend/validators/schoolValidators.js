import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid object id');

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const createClassSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(40),
    grade: z.string().trim().min(1).max(20),
    section: z.string().trim().min(1).max(20),
    privacyLeaderboardEnabled: z.boolean().optional(),
  }),
});

export const createStudentProfileSchema = z.object({
  body: z.object({
    userId: objectId,
    grade: z.string().trim().min(1).max(20),
    section: z.string().trim().min(1).max(20),
    rollNumber: z.string().trim().min(1).max(30),
    subjects: z.array(z.string().trim().min(1).max(100)).min(1),
    parentName: z.string().trim().max(100).optional(),
    parentPhone: z.string().trim().max(40).optional(),
  }),
});

export const createTeacherProfileSchema = z.object({
  body: z.object({
    userId: objectId,
    subjects: z.array(z.string().trim().min(1).max(100)).min(1),
    phone: z.string().trim().max(40).optional(),
  }),
});

export const createAssignmentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().min(5).max(5000),
    subject: z.string().trim().min(2).max(100),
    classId: objectId,
    dueDate: z.string().datetime(),
    maxMarks: z.number().int().min(1).max(1000),
  }),
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(10000).optional(),
  }),
  params: z.object({
    assignmentId: objectId,
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    marks: z.number().min(0).max(1000),
    feedback: z.string().trim().max(5000).optional(),
  }),
  params: z.object({
    submissionId: objectId,
  }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    classId: objectId,
    date: z.string().datetime(),
    entries: z
      .array(
        z.object({
          studentId: objectId,
          status: z.enum(['present', 'absent', 'late']),
        })
      )
      .min(1),
  }),
});

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    body: z.string().trim().min(2).max(5000),
    category: z.enum(['exam', 'holiday', 'event', 'emergency']),
    scope: z.enum(['school', 'class']),
    classId: objectId.optional(),
    pinned: z.boolean().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    recipientId: objectId.optional(),
    classId: objectId.optional(),
    content: z.string().trim().min(1).max(5000),
  }),
});

export const createMarkSchema = z.object({
  body: z.object({
    studentId: objectId,
    classId: objectId,
    subject: z.string().trim().min(2).max(100),
    examType: z.enum(['unit_test', 'mid_term', 'final']),
    score: z.number().min(0).max(100),
    term: z.string().trim().min(1).max(50),
  }),
});

export const saveTimetableSchema = z.object({
  body: z.object({
    classId: objectId,
    entries: z
      .array(
        z.object({
          day: z.string().trim().min(3).max(20),
          period: z.number().int().min(1).max(12),
          subject: z.string().trim().min(2).max(100),
          teacherId: objectId,
          room: z.string().trim().min(1).max(50),
        })
      )
      .min(1),
  }),
});
