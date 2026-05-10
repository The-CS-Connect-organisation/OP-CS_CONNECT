import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, FileUp, Plus, Upload, Brain, Play, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { DropzoneUpload } from '../../../components/ui/DropzoneUpload';
import { examsService } from '../../../services/examsService';
import { notificationsService } from '../../../services/notificationsService';
import { localAuditRepo } from '../../../services/localRepo';
import { apiRequest } from '../../../services/apiClient';
import { getDataMode, DATA_MODES } from '../../../config/dataMode';

export const ExamCenter = ({ user, addToast }) => {
  const { data: localExams, add: addLocalExam } = useStore(KEYS.EXAMS, []);
  const { data: marks, add: addMark } = useStore(KEYS.MARKS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: localQuestionBank, setData: setLocalQuestionBank } = useStore('sms_question_bank', []);
  const { data: localAttempts, setData: setLocalAttempts } = useStore('sms_exam_attempts', []);

  const [apiExams, setApiExams] = useState([]);
  const [apiQuestionBank, setApiQuestionBank] = useState([]);
  const [apiAttempts, setApiAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ name: '', subject: '', class: '10-A', date: '', maxMarks: 100, paperUrl: '' });
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [score, setScore] = useState('');

  const [qForm, setQForm] = useState({
    class: '10-A',
    subject: '',
    text: '',
    marks: 1,
    options: ['', '', '', ''],
    correctIndex: 0,
  });

  const [activeAttempt, setActiveAttempt] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const useApi = getDataMode() === DATA_MODES.REMOTE_API;

  // Load data from API
  useEffect(() => {
    if (!useApi) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const [examRes, questRes] = await Promise.all([
          examsService.listExamsForUser(user),
          examsService.listQuestionBank({}),
        ]);
        setApiExams(Array.isArray(examRes) ? examRes : []);
        setApiQuestionBank(Array.isArray(questRes) ? questRes : []);
      } catch (err) {
        console.error('Failed to load exams from API', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, useApi]);

  const exams = useApi ? apiExams : localExams;
  const questionBank = useApi ? apiQuestionBank : localQuestionBank;
  const attempts = useApi ? apiAttempts : localAttempts;

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);
  const visibleExams = useMemo(() => {
    if (user.role === 'student') return exams.filter((e) => e.class === user.class || !e.class || e.class_id === user.class);
    return exams;
  }, [exams, user]);

  const myAttempts = useMemo(() => {
    if (user.role !== 'student') return [];
    return (attempts || []).filter((a) => a.studentId === user.id || a.student_id === user.id).sort((a, b) => new Date(b.startedAt || b.started_at) - new Date(a.startedAt || a.started_at));
  }, [attempts, user]);

  const createExam = async () => {
    if (!form.name || !form.subject || !form.date) return;
    playBlip?.();
    const examData = { name: form.name, subject: form.subject, class: form.class, date: form.date, maxMarks: Number(form.maxMarks) };

    if (useApi) {
      try {
        const created = await examsService.createExam({ exam: examData, actor: user });
        setApiExams(prev => [created, ...prev]);
        addToast?.('Exam created', 'success');
      } catch (err) {
        addToast?.('Failed to create exam: ' + err.message, 'error');
        return;
      }
    } else {
      const exam = { id: `exam-${Date.now()}`, ...examData, createdBy: user.id, createdAt: new Date().toISOString() };
      addLocalExam(exam);
      addToast?.('Exam created', 'success');
    }

    setForm({ name: '', subject: '', class: '10-A', date: '', maxMarks: 100, paperUrl: '' });
  };

  const submitMarks = () => {
    const exam = exams.find((e) => e.id === selectedExamId || e.id === selectedExamId);
    const student = users.find((u) => u.id === selectedStudentId);
    if (!exam || !student || score === '') return;
    addMark({
      id: `mk-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      examId: exam.id,
      examName: exam.name || exam.subject,
      subject: exam.subject,
      score: Number(score),
      total: Number(exam.maxMarks || exam.max_marks || 100),
      grade: Number(score) >= 90 ? 'A' : Number(score) >= 75 ? 'B' : Number(score) >= 60 ? 'C' : Number(score) >= 45 ? 'D' : 'F',
      date: new Date().toISOString().split('T')[0],
    });
    addToast?.('Marks saved', 'success');
    setScore('');
  };

  const addQuestion = async () => {
    if (!qForm.subject || !qForm.text || qForm.options.some((o) => !o.trim())) {
      addToast?.('Fill question, subject, and all options', 'error');
      return;
    }
    const q = {
      type: 'mcq',
      class: qForm.class,
      subject: qForm.subject,
      text: qForm.text,
      marks: Number(qForm.marks || 1),
      options: qForm.options.map((o) => o.trim()),
      correctIndex: Number(qForm.correctIndex || 0),
    };

    if (useApi) {
      try {
        const created = await apiRequest('/exams/questions', { method: 'POST', body: JSON.stringify(q) });
        const qWithId = { id: created?.question?.id || `q-${Date.now()}`, ...q, createdAt: new Date().toISOString(), createdBy: user.id };
        setApiQuestionBank(prev => [qWithId, ...prev]);
        addToast?.('Question added to bank', 'success');
      } catch (err) {
        addToast?.('Failed to add question: ' + err.message, 'error');
        return;
      }
    } else {
      const qWithId = { id: `q-${Date.now()}`, ...q, createdAt: new Date().toISOString(), createdBy: user.id };
      setLocalQuestionBank([qWithId, ...(Array.isArray(localQuestionBank) ? localQuestionBank : [])]);
      addToast?.('Question added to bank', 'success');
    }

    setQForm((d) => ({ ...d, subject: d.subject, text: '', marks: 1, options: ['', '', '', ''], correctIndex: 0 }));
  };

  const startMock = async (exam) => {
    if (!exam) return;
    const pool = (Array.isArray(questionBank) ? questionBank : []).filter(
      (q) => q.type === 'mcq' && (!exam.class || !exam.class_id || q.class === exam.class || q.class === exam.class_id)
    );
    if (pool.length === 0) {
      addToast?.('No questions available for this exam. Ask teacher to add a question bank.', 'error');
      return;
    }
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(10, shuffled.length));
    const attempt = {
      id: `att-${exam.id}-${user.id}-${Date.now()}`,
      examId: exam.id,
      examName: exam.name,
      subject: exam.subject,
      class: exam.class || exam.class_id,
      studentId: user.id,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      questionIds: picked.map((q) => q.id),
      answers: {},
      score: null,
      maxScore: picked.reduce((s, q) => s + (q.marks || 1), 0),
    };

    if (useApi) {
      try {
        const apiAttempt = await examsService.startAttempt({ examId: exam.id, student: user, questionIds: picked.map(q => q.id) });
        setApiAttempts(prev => [{ ...attempt, id: apiAttempt?.id || attempt.id }, ...(Array.isArray(apiAttempts) ? apiAttempts : [])]);
      } catch (err) {
        console.error('API attempt failed, using local', err);
      }
    } else {
      setLocalAttempts([attempt, ...(Array.isArray(localAttempts) ? localAttempts : [])]);
    }

    setActiveAttempt(attempt);
    setActiveQuestions(picked);
    setActiveIdx(0);
  };

  const setAnswer = (questionId, answer) => {
    setActiveAttempt((prev) => {
      if (!prev) return prev;
      return { ...prev, answers: { ...(prev.answers || {}), [questionId]: answer } };
    });
  };

  const finishMock = () => {
    if (!activeAttempt) return;
    const answers = activeAttempt.answers || {};
    let scoreSum = 0;
    for (const q of activeQuestions) {
      const a = answers[q.id];
      if (q.type === 'mcq' && Number(a) === Number(q.correctIndex)) scoreSum += Number(q.marks || 1);
    }
    const finished = { ...activeAttempt, finishedAt: new Date().toISOString(), score: scoreSum };

    if (useApi) {
      const existing = apiAttempts.find(a => a.id === activeAttempt.id);
      if (existing) {
        setApiAttempts(prev => prev.map(a => a.id === activeAttempt.id ? finished : a));
      }
      examsService.finishAttempt({ attemptId: activeAttempt.id, updates: { score: scoreSum, finished: true }, actor: user }).catch(console.error);
    } else {
      setLocalAttempts([finished, ...(Array.isArray(localAttempts) ? localAttempts : [])]);
    }

    setActiveAttempt(null);
    setActiveQuestions([]);
    setActiveIdx(0);
    addToast?.(`Mock completed. Score: ${scoreSum}/${finished.maxScore}`, 'success');
  };

  const playBlip = () => {};

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 md:p-8 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-red-100 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
              <Award size={10} /> Exam Center
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {user?.role === 'admin' ? 'Admin Mode' : user?.role === 'teacher' ? 'Teacher Mode' : 'Student Mode'}
            </span>
            {useApi && <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 ml-auto">API</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 text-gray-900">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-amber-500 to-red-500" />
            Exams & Papers
          </h1>
          <p className="text-sm mt-2 text-gray-500">
            Admin creates exams, teachers upload papers and marks, students view everything.
          </p>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && useApi && (
        <div className="text-center py-8">
          <div className="animate-pulse text-sm text-gray-500">Loading exams...</div>
        </div>
      )}

      {/* Create Exam */}
      {(user.role === 'admin' || user.role === 'teacher') && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800" /> Create Exam
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="input-field" placeholder="Exam name" value={form.name} onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))} />
            <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm((d) => ({ ...d, subject: e.target.value }))} />
            <input className="input-field" placeholder="Class" value={form.class} onChange={(e) => setForm((d) => ({ ...d, class: e.target.value }))} />
            <input type="date" className="input-field" value={form.date} onChange={(e) => setForm((d) => ({ ...d, date: e.target.value }))} />
            <input type="number" className="input-field" value={form.maxMarks} onChange={(e) => setForm((d) => ({ ...d, maxMarks: e.target.value }))} />
          </div>
          <button onClick={createExam} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <Plus size={15} /> Create Exam
          </button>
        </motion.div>
      )}

      {/* Enter Marks */}
      {(user.role === 'teacher' || user.role === 'admin') && !loading && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Enter Marks
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <select className="input-field" value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
              <option value="">Select exam</option>
              {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name} ({exam.subject})</option>)}
            </select>
            <select className="input-field" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">Select student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
            <input className="input-field" type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <button onClick={submitMarks} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <Upload size={15} /> Save Marks
          </button>
        </motion.div>
      )}

      {/* Exam list */}
      {!loading && visibleExams.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold px-1 text-gray-500">All Exams</h3>
          {visibleExams.map((exam) => {
            const myMarks = marks.filter((m) => m.examId === exam.id && (user.role !== 'student' || m.studentId === user.id));
            return (
              <motion.div key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card p-5 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{exam.name}</h3>
                    <p className="text-sm mt-0.5 text-gray-500">{exam.subject} · Class {exam.class || exam.class_name || 'N/A'} · {exam.date || exam.created_at?.split('T')[0]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.role === 'student' && (
                      <button
                        onClick={() => startMock(exam)}
                        className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 text-gray-800 border-gray-200"
                      >
                        <Play size={13} /> Start Mock
                      </button>
                    )}
                    {exam.paperUrl && (
                      <a href={exam.paperUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50 text-gray-600 border-gray-200">
                        <FileUp size={13} /> View Paper
                      </a>
                    )}
                  </div>
                </div>
                {myMarks.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2 border-gray-200">
                    {myMarks.map((mark) => (
                      <div key={mark.id} className="flex items-center justify-between p-3 rounded-xl text-sm bg-gray-50 border border-gray-200">
                        <span className="text-gray-600">{mark.studentName || 'You'}</span>
                        <span className="font-bold font-mono text-gray-900">
                          {mark.score}/{mark.total} <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-700">({mark.grade})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Student mock attempt runner */}
      {user.role === 'student' && activeAttempt && (
        <div className="glass-card p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Brain size={16} /> Mock Attempt
              </h2>
              <p className="text-sm text-gray-500">{activeAttempt.examName} · {activeAttempt.subject}</p>
            </div>
            <button onClick={finishMock} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
              <CheckCircle2 size={15} /> Finish & Score
            </button>
          </div>

          {activeQuestions.length > 0 && (
            <>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Question {activeIdx + 1} / {activeQuestions.length}</span>
                <span>Max score: {activeAttempt.maxScore}</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/70 border border-gray-200">
                <p className="font-semibold text-gray-900 mb-3">{activeQuestions[activeIdx].text}</p>
                <div className="space-y-2">
                  {activeQuestions[activeIdx].options.map((opt, i) => {
                    const selected = Number(activeAttempt.answers?.[activeQuestions[activeIdx].id]) === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswer(activeQuestions[activeIdx].id, i)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                          selected ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                  disabled={activeIdx === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  onClick={() => setActiveIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
                  disabled={activeIdx >= activeQuestions.length - 1}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Student attempt history */}
      {user.role === 'student' && !loading && (
        <div className="glass-card p-6 backdrop-blur-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">My Mock Attempts</h3>
          {myAttempts.length === 0 ? (
            <p className="text-sm text-gray-500">No attempts yet.</p>
          ) : (
            <div className="space-y-2">
              {myAttempts.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.examName || a.subject}</p>
                    <p className="text-xs text-gray-500">{a.subject} · {new Date(a.startedAt || a.started_at).toLocaleString()}</p>
                  </div>
                  <div className="font-mono font-bold text-gray-900">
                    {a.score ?? '-'} / {a.maxScore ?? a.max_score ?? '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question bank management */}
      {(user.role === 'admin' || user.role === 'teacher') && !loading && (
        <div className="glass-card p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Question Bank (MCQ)
          </h2>

          <div className="grid md:grid-cols-2 gap-3">
            <input className="input-field" placeholder="Subject" value={qForm.subject} onChange={(e) => setQForm((d) => ({ ...d, subject: e.target.value }))} />
            <input className="input-field" placeholder="Class" value={qForm.class} onChange={(e) => setQForm((d) => ({ ...d, class: e.target.value }))} />
          </div>
          <textarea className="input-field min-h-[110px]" placeholder="Question text" value={qForm.text} onChange={(e) => setQForm((d) => ({ ...d, text: e.target.value }))} />

          <div className="grid md:grid-cols-2 gap-3">
            {qForm.options.map((opt, idx) => (
              <input
                key={idx}
                className="input-field"
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={(e) =>
                  setQForm((d) => {
                    const next = d.options.slice();
                    next[idx] = e.target.value;
                    return { ...d, options: next };
                  })
                }
              />
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <select className="input-field" value={qForm.correctIndex} onChange={(e) => setQForm((d) => ({ ...d, correctIndex: Number(e.target.value) }))}>
              {[0, 1, 2, 3].map((i) => <option key={i} value={i}>Correct: {String.fromCharCode(65 + i)}</option>)}
            </select>
            <input className="input-field" type="number" min={1} value={qForm.marks} onChange={(e) => setQForm((d) => ({ ...d, marks: Number(e.target.value) }))} />
            <button onClick={addQuestion} className="btn-primary flex items-center justify-center gap-2 text-sm py-2.5 px-5">
              <Plus size={15} /> Add Question
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Total questions: {(Array.isArray(questionBank) ? questionBank : []).length}</p>
          </div>
        </div>
      )}
    </div>
  );
};
