import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, FileUp, Plus, Upload } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { DropzoneUpload } from '../../../components/ui/DropzoneUpload';

export const ExamCenter = ({ user, addToast }) => {
  const { data: exams, add } = useStore(KEYS.EXAMS, []);
  const { data: marks, add: addMark } = useStore(KEYS.MARKS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const [form, setForm] = useState({ name: '', subject: '', class: '10-A', date: '', maxMarks: 100, paperUrl: '' });
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [score, setScore] = useState('');

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);
  const visibleExams = useMemo(() => {
    if (user.role === 'student') return exams.filter((e) => e.class === user.class || !e.class);
    return exams;
  }, [exams, user]);

  const createExam = () => {
    if (!form.name || !form.subject || !form.date) return;
    add({ id: `exam-${Date.now()}`, ...form, createdBy: user.id, createdAt: new Date().toISOString() });
    addToast('Exam created', 'success');
    setForm({ name: '', subject: '', class: '10-A', date: '', maxMarks: 100, paperUrl: '' });
  };

  const submitMarks = () => {
    const exam = exams.find((e) => e.id === selectedExamId);
    const student = users.find((u) => u.id === selectedStudentId);
    if (!exam || !student || score === '') return;
    addMark({
      id: `mk-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      examId: exam.id,
      examName: exam.name,
      subject: exam.subject,
      score: Number(score),
      total: Number(exam.maxMarks || 100),
      grade: Number(score) >= 90 ? 'A' : Number(score) >= 75 ? 'B' : Number(score) >= 60 ? 'C' : Number(score) >= 45 ? 'D' : 'F',
      date: new Date().toISOString().split('T')[0],
    });
    addToast('Marks saved', 'success');
    setScore('');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.05), transparent 60%)' }} />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.20)' }}>
            <Award size={10} /> Exam Center
          </span>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-10 rounded-full bg-black" />
            Exams & Papers
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Admin creates exams, teachers upload papers and marks, students view everything.
          </p>
        </div>
      </motion.div>

      {/* Create Exam */}
      {(user.role === 'admin' || user.role === 'teacher') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="nova-card p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-black" /> Create Exam
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input className="input-field" placeholder="Exam name" value={form.name} onChange={(e) => setForm((d) => ({ ...d, name: e.target.value }))} />
            <input className="input-field" placeholder="Subject" value={form.subject} onChange={(e) => setForm((d) => ({ ...d, subject: e.target.value }))} />
            <input className="input-field" placeholder="Class" value={form.class} onChange={(e) => setForm((d) => ({ ...d, class: e.target.value }))} />
            <input type="date" className="input-field" value={form.date} onChange={(e) => setForm((d) => ({ ...d, date: e.target.value }))} />
            <input type="number" className="input-field" value={form.maxMarks} onChange={(e) => setForm((d) => ({ ...d, maxMarks: e.target.value }))} />
          </div>
          <DropzoneUpload
            label="Upload Exam Paper PDF"
            accept="application/pdf"
            maxSizeMb={10}
            previewUrl={form.paperUrl}
            onUploaded={(doc) => setForm((d) => ({ ...d, paperUrl: doc.dataUrl, paperName: doc.fileName }))}
            onClear={() => setForm((d) => ({ ...d, paperUrl: '', paperName: '' }))}
          />
          <button onClick={createExam} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <Plus size={15} /> Create Exam
          </button>
        </motion.div>
      )}

      {/* Enter Marks */}
      {(user.role === 'teacher' || user.role === 'admin') && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="nova-card p-6 space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--semantic-success)' }} /> Enter Marks
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
      {visibleExams.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold px-1" style={{ color: 'var(--text-muted)' }}>All Exams</h3>
          {visibleExams.map((exam) => {
            const myMarks = marks.filter((m) => m.examId === exam.id && (user.role !== 'student' || m.studentId === user.id));
            return (
              <motion.div key={exam.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="nova-card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{exam.name}</h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{exam.subject} · Class {exam.class} · {exam.date}</p>
                  </div>
                  {exam.paperUrl && (
                    <a href={exam.paperUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors hover:bg-black/04"
                      style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                      <FileUp size={13} /> View Paper
                    </a>
                  )}
                </div>
                {myMarks.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                    {myMarks.map((mark) => (
                      <div key={mark.id} className="flex items-center justify-between p-3 rounded-xl text-sm"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{mark.studentName || 'You'}</span>
                        <span className="font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                          {mark.score}/{mark.total} <span className="ml-1 px-1.5 py-0.5 rounded text-xs"
                            style={{ background: 'rgba(0,0,0,0.06)' }}>({mark.grade})</span>
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
    </div>
  );
};
