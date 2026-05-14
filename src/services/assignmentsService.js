import { getDataMode, DATA_MODES } from '../config/dataMode';
import { apiRequest } from './apiClient';
import { normalizeAssignment } from '../utils/normalizeData';
import { localAssignmentsRepo, localSubmissionsRepo, localAuditRepo } from './localRepo';
import { notificationsService } from './notificationsService';

const nowIso = () => new Date().toISOString();

const normalizeClass = (cls) => String(cls ?? '').replace(/[\s-]/g, '').toUpperCase();

export const assignmentsService = {
  async listForUser(user) {
    if (!user) return [];
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      if (user.role === 'teacher') {
        const payload = await apiRequest('/school/assignments?teacherId=' + user.id, { method: 'GET' });
        return (payload?.items ?? payload?.assignments ?? []).map(normalizeAssignment);
      }
      if (user.role === 'admin') {
        const payload = await apiRequest('/school/assignments', { method: 'GET' });
        return (payload?.items ?? payload?.assignments ?? []).map(normalizeAssignment);
      }
      // student (default)
      const payload = await apiRequest('/student/assignments', { method: 'GET' });
      return (payload?.assignments ?? payload?.items ?? []).map(normalizeAssignment);
    }

    const all = localAssignmentsRepo.list();
    return all.filter((a) => normalizeClass(a.class) === normalizeClass(user.class));
  },

  async listSubmissions({ assignmentId } = {}) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/school/assignments/${assignmentId}/submissions`, { method: 'GET' });
      return payload?.submissions ?? payload ?? [];
    }
    const all = localSubmissionsRepo.list();
    return assignmentId ? all.filter((s) => s.assignmentId === assignmentId) : all;
  },

  async submit({ assignment, student, contentText, attachment } = {}) {
    if (!assignment?.id || !student?.id) throw new Error('Missing assignment/student');

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/school/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        body: JSON.stringify({
          content: contentText ?? '',
          attachment,
        }),
      });
      localAuditRepo.append({ actorId: student.id, actorEmail: student.email, action: 'assignments.submit', targetId: assignment.id, mode: 'REMOTE_API' });
      return payload?.submission ?? payload;
    }

    const submission = {
      id: `sub-${assignment.id}-${student.id}`,
      assignmentId: assignment.id,
      studentId: student.id,
      studentName: student.name,
      status: 'submitted',
      submittedAt: nowIso(),
      content: contentText ?? '',
      attachment: attachment ?? null, // { dataUrl, fileName, mimeType }
      marks: null,
      feedback: '',
    };
    localSubmissionsRepo.upsert(submission);
    localAuditRepo.append({ actorId: student.id, actorEmail: student.email, action: 'assignments.submit', targetId: assignment.id, mode: 'LOCAL_DEMO' });

    // Notify teacher if present
    if (assignment.teacherId) {
      notificationsService.emit({
        userId: assignment.teacherId,
        message: `New submission: ${student.name} → ${assignment.title}`,
        type: 'assignment',
        meta: { assignmentId: assignment.id, studentId: student.id },
        actor: student,
      });
    }

    return submission;
  },

  async grade({ assignmentId, studentId, grader, marks, feedback }) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/school/assignments/${assignmentId}/submissions/${studentId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ marks, feedback }),
      });
      localAuditRepo.append({ actorId: grader?.id, actorEmail: grader?.email, action: 'assignments.grade', targetId: assignmentId, mode: 'REMOTE_API' });
      return payload?.submission ?? payload;
    }

    const all = localSubmissionsRepo.list();
    const existing = all.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
    const updated = {
      ...(existing ?? {
        id: `sub-${assignmentId}-${studentId}`,
        assignmentId,
        studentId,
        status: 'submitted',
        submittedAt: nowIso(),
      }),
      status: 'graded',
      marks: marks ?? null,
      feedback: String(feedback ?? ''),
      gradedAt: nowIso(),
      gradedBy: grader?.id ?? null,
    };
    localSubmissionsRepo.upsert(updated);
    localAuditRepo.append({ actorId: grader?.id, actorEmail: grader?.email, action: 'assignments.grade', targetId: assignmentId, mode: 'LOCAL_DEMO' });
    return updated;
  },
};

