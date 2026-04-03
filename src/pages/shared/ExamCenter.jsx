import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, FileUp, Plus, Upload } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { DropzoneUpload } from '../../components/ui/DropzoneUpload';

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
    add({
      id: `exam-${Date.now()}`,
      ...form,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    });
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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 border border-orange-500/30 app-shell-gradient">
        <h1 className="text-3xl font-extrabold gradient-text flex items-center gap-2"><Award size={24} />Exam and Paper Center</h1>
        <p className="text-zinc-300 mt-1">Admin creates exams, teachers upload papers and marks, students view everything.</p>
      </motion.div>

      {(user.role === 'admin' || user.role === 'teacher') && (
        <Card className="bg-[#111] border border-orange-500/30 space-y-3">
          <h2 className="text-lg font-bold text-white">Create Exam</h2>
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
          <Button variant="primary" icon={Plus} onClick={createExam}>Create Exam</Button>
        </Card>
      )}

      {(user.role === 'teacher' || user.role === 'admin') && (
        <Card className="bg-[#111] border border-orange-500/30 space-y-3">
          <h2 className="text-lg font-bold text-white">Enter Marks</h2>
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
          <Button variant="primary" icon={Upload} onClick={submitMarks}>Save Marks</Button>
        </Card>
      )}

      <div className="grid gap-4">
        {visibleExams.map((exam) => {
          const myMarks = marks.filter((m) => m.examId === exam.id && (user.role !== 'student' || m.studentId === user.id));
          return (
            <Card key={exam.id} className="bg-[#111] border border-orange-500/25">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{exam.name}</h3>
                  <p className="text-zinc-400 text-sm">{exam.subject} · Class {exam.class} · {exam.date}</p>
                </div>
                {exam.paperUrl && (
                  <a href={exam.paperUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200">
                    <FileUp size={14} /> View Question Paper PDF
                  </a>
                )}
              </div>
              {myMarks.length > 0 && (
                <div className="mt-3 space-y-2 text-sm">
                  {myMarks.map((mark) => (
                    <div key={mark.id} className="p-3 rounded-xl bg-[#1a1a1a] border border-orange-500/20">
                      {mark.studentName || 'You'} - {mark.score}/{mark.total} ({mark.grade})
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
