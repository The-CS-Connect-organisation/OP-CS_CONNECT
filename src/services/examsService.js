import { getDataMode, DATA_MODES } from '../config/dataMode';
import { apiRequest } from './apiClient';
import { localAttemptsRepo, localAuditRepo, localExamsRepo, localQuestionBankRepo } from './localRepo';

const nowIso = () => new Date().toISOString();

export const examsService = {
  async listExamsForUser(user) {
    if (!user) return [];
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const query = user?.class ? `?classId=${encodeURIComponent(user.class)}` : '';
      const payload = await apiRequest(`/exams${query}`, { method: 'GET' });
      return payload?.items ?? payload?.exams ?? [];
    }
    const all = localExamsRepo.list();
    if (user.role === 'student') return all.filter((e) => !e.class || e.class === user.class);
    return all;
  },

  async createExam({ exam, actor }) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest('/exams', { method: 'POST', body: JSON.stringify(exam) });
      localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'exams.create', mode: 'REMOTE_API' });
      return payload?.exam ?? payload;
    }
    const all = localExamsRepo.list();
    const next = [{ ...exam, id: exam.id ?? `exam-${Date.now()}`, createdAt: nowIso(), createdBy: actor?.id ?? null }, ...all];
    localExamsRepo.saveAll(next);
    localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'exams.create', mode: 'LOCAL_DEMO' });
    return next[0];
  },

  async listQuestionBank({ className, subject } = {}) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const qs = new URLSearchParams();
      if (className) qs.set('class', className);
      if (subject) qs.set('subject', subject);
      const payload = await apiRequest(`/questions?${qs.toString()}`, { method: 'GET' });
      return payload?.questions ?? payload ?? [];
    }
    const all = localQuestionBankRepo.list();
    return all.filter((q) => (!className || q.class === className) && (!subject || q.subject === subject));
  },

  async upsertQuestions({ questions, actor }) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest('/questions/bulk', { method: 'POST', body: JSON.stringify({ questions }) });
      localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'questions.bulkUpsert', mode: 'REMOTE_API' });
      return payload?.questions ?? payload ?? [];
    }
    const all = localQuestionBankRepo.list();
    const byId = new Map(all.map((q) => [q.id, q]));
    for (const q of questions ?? []) byId.set(q.id, { ...byId.get(q.id), ...q });
    const next = [...byId.values()];
    localQuestionBankRepo.saveAll(next);
    localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'questions.bulkUpsert', mode: 'LOCAL_DEMO' });
    return next;
  },

  async startAttempt({ examId, student, questionIds }) {
    const attempt = {
      id: `att-${examId}-${student.id}-${Date.now()}`,
      examId,
      studentId: student.id,
      startedAt: nowIso(),
      finishedAt: null,
      answers: {}, // { [questionId]: answer }
      questionIds: questionIds ?? [],
      score: null,
      maxScore: null,
    };

    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/exams/${examId}/attempts`, { method: 'POST', body: JSON.stringify(attempt) });
      localAuditRepo.append({ actorId: student?.id, actorEmail: student?.email, action: 'exams.attemptStart', targetId: examId, mode: 'REMOTE_API' });
      return payload?.attempt ?? payload;
    }

    const all = localAttemptsRepo.list();
    localAttemptsRepo.saveAll([attempt, ...(Array.isArray(all) ? all : [])]);
    localAuditRepo.append({ actorId: student?.id, actorEmail: student?.email, action: 'exams.attemptStart', targetId: examId, mode: 'LOCAL_DEMO' });
    return attempt;
  },

  async finishAttempt({ attemptId, updates, actor }) {
    if (getDataMode() === DATA_MODES.REMOTE_API) {
      const payload = await apiRequest(`/attempts/${attemptId}`, { method: 'PATCH', body: JSON.stringify(updates) });
      localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'exams.attemptFinish', targetId: attemptId, mode: 'REMOTE_API' });
      return payload?.attempt ?? payload;
    }

    const all = localAttemptsRepo.list();
    const next = (Array.isArray(all) ? all : []).map((a) => (a.id === attemptId ? { ...a, ...updates } : a));
    localAttemptsRepo.saveAll(next);
    localAuditRepo.append({ actorId: actor?.id, actorEmail: actor?.email, action: 'exams.attemptFinish', targetId: attemptId, mode: 'LOCAL_DEMO' });
    return next.find((a) => a.id === attemptId) ?? null;
  },
};

