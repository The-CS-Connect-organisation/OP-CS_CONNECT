/**
 * Data normalization utilities
 * Maps snake_case backend fields to camelCase frontend conventions
 */

export function normalizeAssignment(raw) {
  if (!raw) return raw;
  return {
    ...raw,
    dueDate: raw.dueDate ?? raw.due_date,
    classId: raw.classId ?? raw.class_id,
    className: raw.className ?? raw.class_name,
    class: raw.class_name ?? raw.class ?? raw.className,
    teacherId: raw.teacherId ?? raw.teacher_id,
    teacherName: raw.teacherName ?? raw.teacher_name,
    totalMarks: raw.totalMarks ?? raw.maxMarks ?? raw.max_marks,
    title: raw.title ?? raw.name ?? '',
    subject: raw.subject ?? raw.subject_name ?? '',
  };
}

export function normalizeMark(raw) {
  if (!raw) return raw;
  return {
    ...raw,
    studentId: raw.studentId ?? raw.student_id,
    marksObtained: raw.marksObtained ?? raw.score ?? raw.obtained_marks ?? 0,
    totalMarks: raw.totalMarks ?? raw.max_marks ?? 100,
    examName: raw.examName ?? raw.exam_name ?? raw.exam_type ?? 'Exam',
    subject: raw.subject ?? raw.subject_name ?? '',
  };
}

export function normalizeAttendanceRecord(raw) {
  if (!raw) return raw;
  return {
    ...raw,
    studentId: raw.studentId ?? raw.student_id,
    date: raw.date ?? raw.created_at ?? '',
  };
}
