import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Save, Download, Search, Terminal, Activity, Hash, Zap, FileText, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const EnterGrades = ({ user, addToast }) => {
  const { data: exams } = useStore(KEYS.EXAMS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: marks, add, update } = useStore(KEYS.MARKS, []);
  const { playClick, playBlip } = useSound();
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [grades, setGrades] = useState({});
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const myExams = useMemo(() => {
    const classMatches = (e) => e.class === user.class;
    const subjectMatches = (e) => {
      const teacherSubjects = user.subjects || [];
      return teacherSubjects.length === 0 || teacherSubjects.includes(e.subject);
    };
    return exams.filter(e => classMatches(e) && subjectMatches(e));
  }, [exams, user]);

  const students = useMemo(() => users.filter(u => u.role === 'student'), [users]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const handleGradeChange = (studentId, value) => {
    setGrades(prev => ({ ...prev, [studentId]: value }));
  };

  const calculateGrade = (marksObtained, totalMarks) => {
    const pct = (marksObtained / totalMarks) * 100;
    if (pct >= 90) return 'A1';
    if (pct >= 80) return 'A2';
    if (pct >= 70) return 'B1';
    if (pct >= 60) return 'B2';
    if (pct >= 50) return 'C1';
    if (pct >= 40) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
  };

  const saveGrades = () => {
    if (!selectedExam) return;
    playBlip();
    
    Object.entries(grades).forEach(([studentId, marksObtained]) => {
      const existing = marks.find(m => m.studentId === studentId && m.examId === selectedExam.id);
      const gradeData = {
        id: existing?.id || `mark-${studentId}-${selectedExam.id}`,
        studentId,
        examId: selectedExam.id,
        examName: selectedExam.name,
        subject: selectedExam.subject,
        date: selectedExam.date,
        marksObtained: parseInt(marksObtained) || 0,
        totalMarks: selectedExam.maxMarks,
        grade: calculateGrade(parseInt(marksObtained) || 0, selectedExam.maxMarks),
        gradedBy: user.id,
        gradedAt: new Date().toISOString().split('T')[0]
      };
      
      if (existing) {
        update(existing.id, gradeData);
      } else {
        add(gradeData);
      }
    });
    
    addToast(`Grades Synchronized for ${selectedExam.name}! ✅`, 'success');
    setGrades({});
    setSelectedExam(null);
  };

  const generateReportCard = (student) => {
    playBlip();
    const studentMarks = marks.filter(m => m.studentId === student.id);
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('SchoolSync Report Card', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Student: ${student.name}`, 20, 35);
    doc.text(`Class: ${student.class}`, 20, 42);
    doc.text(`Roll No: ${student.rollNo}`, 20, 49);
    
    const tableData = studentMarks.map(m => [
      m.examName,
      m.subject,
      m.marksObtained,
      m.totalMarks,
      m.grade,
      `${((m.marksObtained/m.totalMarks)*100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Exam', 'Subject', 'Obtained', 'Total', 'Grade', 'Percentage']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 }
    });
    
    doc.save(`${student.name}_ReportCard.pdf`);
    addToast('Report Card Downloaded! 📄', 'success');
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Grader_Protocol
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className="animate-pulse" /> Evaluating_Stream
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <Award className="text-[var(--text-muted)]" size={48} />
           Grade_Entry
        </h1>
      </motion.div>

      <Card className="p-6 border-[var(--border-default)] bg-nova-base/50 backdrop-blur-xl">
        <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest mb-3 block">Target_Assessment_Module</label>
        <div className="relative">
          <select 
            className="input-field pl-12 font-mono appearance-none"
            value={selectedExam?.id || ''}
            onChange={e => {
              playClick();
              const exam = myExams.find(ex => ex.id === e.target.value);
              setSelectedExam(exam || null);
              setGrades({});
            }}
          >
            <option value="" className="bg-nova-base">-- Select subject --</option>
            {myExams.map(exam => (
              <option key={exam.id} value={exam.id} className="bg-nova-base">
                {exam.name.toUpperCase()} ( {exam.subject.toUpperCase()} | CL_{exam.class} )
              </option>
            ))}
          </select>
          <Terminal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        </div>
      </Card>

      {selectedExam && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-muted)] transition-colors" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="PROBE_STUDENT_ENTITY..." 
                className="input-field pl-12 font-mono uppercase text-xs" 
              />
            </div>
            <Button variant="primary" icon={Save} onClick={saveGrades} className="shadow-[0_0_20px_rgba(255,255,255,0.3)]">Save_All_Vectors</Button>
            <Button variant="secondary" icon={Download} onClick={() => { playBlip(); setShowPreview(true); }}>Summary_Buffer</Button>
          </div>

          <Card className="overflow-hidden border-[var(--border-default)] bg-[var(--bg-elevated)] backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    <th className="text-left py-6 px-6 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Entity</th>
                    <th className="text-left py-6 px-6 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Roll_No</th>
                    <th className="text-center py-6 px-6 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Marks (Max: {selectedExam.maxMarks})</th>
                    <th className="text-center py-6 px-6 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Grade_Index</th>
                    <th className="text-right py-6 px-6 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student, idx) => {
                      const existingGrade = marks.find(m => m.studentId === student.id && m.examId === selectedExam.id);
                      const currentMarks = grades[student.id] || existingGrade?.marksObtained || '';
                      const currentGrade = currentMarks ? calculateGrade(parseInt(currentMarks), selectedExam.maxMarks) : '-';
                      
                      return (
                        <motion.tr 
                          key={student.id} 
                          initial={{ opacity: 0, scale: 0.98 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-[var(--bg-floating)] transition-colors"
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <span className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-muted)]">
                                {student.avatar}
                              </span>
                              <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6 font-mono text-[var(--text-muted)] text-xs tracking-widest uppercase">{student.rollNo}</td>
                          <td className="py-5 px-6">
                            <div className="flex justify-center">
                              <input 
                                type="number" 
                                min="0" 
                                max={selectedExam.maxMarks}
                                value={currentMarks}
                                onChange={e => { handleGradeChange(student.id, e.target.value); }}
                                className="w-24 px-4 py-3 text-center rounded-lg border-2 border-[var(--border-default)] bg-nova-base font-bold font-mono text-[var(--text-primary)] focus:border-white/25 focus:ring-0 transition-all text-xl"
                                placeholder="00"
                              />
                            </div>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <Badge variant={currentGrade === 'E' ? 'rose' : currentGrade.startsWith('A') ? 'emerald' : currentGrade.startsWith('B') ? 'indigo' : 'amber'} className="font-mono px-4 py-1.5 min-w-[50px] justify-center">
                              {currentGrade}
                            </Badge>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <button 
                              onClick={() => generateReportCard(student)}
                              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              title="Export_PDF"
                            >
                              <FileText size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}

      <Modal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        title="REPORT_BUFFER_PREVIEW"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-nova-base border border-[var(--border-default)] rounded-lg">
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
               Select an entity to finalize data export. PDF generator will initialize upon selection.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-nothing">
            {filteredStudents.map(student => (
              <button 
                key={student.id}
                onClick={() => { generateReportCard(student); setShowPreview(false); }}
                className="group p-5 text-left rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-white/12 transition-all flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{student.name}</p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">{student.rollNo} • CL_{student.class}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
