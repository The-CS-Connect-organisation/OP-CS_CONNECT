import { KEYS, getFromStorage, setToStorage } from '../data/schema';

const nowIso = () => new Date().toISOString();

export const localUsersRepo = {
  list: () => getFromStorage(KEYS.USERS, []),
  findByEmail: (email) => {
    const users = getFromStorage(KEYS.USERS, []);
    return users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) ?? null;
  },
};

export const localAssignmentsRepo = {
  list: () => getFromStorage(KEYS.ASSIGNMENTS, []),
  saveAll: (assignments) => setToStorage(KEYS.ASSIGNMENTS, assignments),
};

export const localSubmissionsRepo = {
  key: 'sms_submissions',
  list: () => getFromStorage('sms_submissions', []),
  upsert: (submission) => {
    const all = getFromStorage('sms_submissions', []);
    const next = Array.isArray(all) ? [...all] : [];
    const idx = next.findIndex((s) => s.id === submission.id);
    if (idx >= 0) next[idx] = { ...next[idx], ...submission, updatedAt: nowIso() };
    else next.push({ ...submission, createdAt: nowIso(), updatedAt: nowIso() });
    setToStorage('sms_submissions', next);
    return submission;
  },
};

export const localExamsRepo = {
  list: () => getFromStorage(KEYS.EXAMS, []),
  saveAll: (exams) => setToStorage(KEYS.EXAMS, exams),
};

export const localAttemptsRepo = {
  list: () => getFromStorage('sms_exam_attempts', []),
  saveAll: (attempts) => setToStorage('sms_exam_attempts', attempts),
};

export const localQuestionBankRepo = {
  list: () => getFromStorage('sms_question_bank', []),
  saveAll: (questions) => setToStorage('sms_question_bank', questions),
};

export const localAuditRepo = {
  list: () => getFromStorage('sms_audit_log', []),
  append: (entry) => {
    const all = getFromStorage('sms_audit_log', []);
    const next = Array.isArray(all) ? all : [];
    const full = { id: `audit-${Date.now()}`, at: nowIso(), ...entry };
    setToStorage('sms_audit_log', [full, ...next].slice(0, 5000));
    return full;
  },
};

