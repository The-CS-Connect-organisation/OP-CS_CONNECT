import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Save, Download, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const EnterGrades = ({ user, addToast }) => {
  const { data: exams } = useStore(KEYS.EXAMS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: marks, add, update } = useStore(KEYS.MARKS, []);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [grades, setGrades] = useState({});
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const myExams = useMemo(() => exams.filter(e => e.createdBy === user.id), [exams, user]);
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
    
    addToast(`Grades saved for ${selectedExam.name}! ✅`, 'success');
    setGrades({});
    setSelectedExam(null);
  };

  const generateReportCard = (student) => {
    const studentMarks = marks.filter(m => m.studentId === student.id);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('SchoolSync Report Card', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Student: ${student.name}`, 20, 35);
    doc.text(`Class: ${student.class}`, 20, 42);
    doc.text(`Roll No: ${student.rollNo}`, 20, 49);
    
    // Table
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
    addToast('Report card downloaded! 📄', 'success');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Award className="text-primary-500" /> Enter Grades
        </h1>
        <p className="text-gray-500 mt-1">Grade students for exams</p>
      </motion.div>

      {/* Exam Selector */}
      <Card>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Exam</label>
        <select 
          className="input-field"
          value={selectedExam?.id || ''}
          onChange={e => {
            const exam = myExams.find(ex => ex.id === e.target.value);
            setSelectedExam(exam || null);
            setGrades({});
          }}
        >
          <option value="">-- Select an exam --</option>
          {myExams.map(exam => (
            <option key={exam.id} value={exam.id}>
              {exam.name} • {exam.subject} • {exam.class}
            </option>
          ))}
        </select>
      </Card>

      {selectedExam && (
        <>
          {/* Search & Actions */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search students..." 
                className="input-field pl-9" 
              />
            </div>
            <Button variant="primary" icon={Save} onClick={saveGrades}>Save All Grades</Button>
            <Button variant="secondary" icon={Download} onClick={() => setShowPreview(true)}>Preview Report</Button>
          </div>

          {/* Grade Entry Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Roll No</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Marks ({selectedExam.maxMarks})</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const existingGrade = marks.find(m => m.studentId === student.id && m.examId === selectedExam.id);
                    const currentMarks = grades[student.id] || existingGrade?.marksObtained || '';
                    const currentGrade = currentMarks ? calculateGrade(parseInt(currentMarks), selectedExam.maxMarks) : '-';
                    
                    return (
                      <motion.tr key={student.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{student.avatar}</span>
                            <span className="text-sm font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{student.rollNo}</td>
                        <td className="py-3 px-4">
                          <input 
                            type="number" 
                            min="0" 
                            max={selectedExam.maxMarks}
                            value={currentMarks}
                            onChange={e => handleGradeChange(student.id, e.target.value)}
                            className="w-20 px-3 py-2 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge color={currentGrade === 'E' ? 'red' : currentGrade.startsWith('A') ? 'green' : currentGrade.startsWith('B') ? 'blue' : 'orange'}>
                            {currentGrade}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="sm" onClick={() => generateReportCard(student)}>Report</Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Report Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Report Card Preview">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select a student to preview their report card:</p>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {filteredStudents.map(student => (
              <button 
                key={student.id}
                onClick={() => { generateReportCard(student); setShowPreview(false); }}
                className="p-4 text-left rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <p className="font-medium text-gray-800 dark:text-white">{student.name}</p>
                <p className="text-xs text-gray-500">{student.rollNo} • {student.class}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};