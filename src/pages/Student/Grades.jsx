import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, BookOpen, Download, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MarksChart, SubjectWiseChart } from '../../components/charts/MarksChart';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Grades = ({ user }) => {
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: exams } = useStore(KEYS.EXAMS, []);
  const myMarks = marks.filter(m => m.studentId === user.id);
  
  const [selectedBoard, setSelectedBoard] = useState('CBSE'); // CBSE, ICSE, State

  const overallAvg = useMemo(() => {
    if (myMarks.length === 0) return 0;
    return Math.round(myMarks.reduce((a, b) => a + b.marksObtained, 0) / myMarks.length);
  }, [myMarks]);

  const gradeDistribution = useMemo(() => {
    const dist = {};
    myMarks.forEach(m => { dist[m.grade] = (dist[m.grade] || 0) + 1; });
    return dist;
  }, [myMarks]);

  const generateReportCard = () => {
    const doc = new jsPDF();
    
    // Board-specific header
    const boardConfig = {
      CBSE: { name: 'Central Board of Secondary Education', logo: 'CBSE' },
      ICSE: { name: 'Council for the Indian School Certificate Examinations', logo: 'ICSE' },
      State: { name: 'State Board of Education', logo: 'STATE' }
    };
    
    // Header
    doc.setFillColor(14, 165, 233); // primary-500
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(boardConfig[selectedBoard].logo, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(boardConfig[selectedBoard].name, 105, 28, { align: 'center' });
    
    // Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Student Name: ${user.name}`, 20, 55);
    doc.text(`Class: ${user.class}`, 20, 62);
    doc.text(`Roll No: ${user.rollNo}`, 20, 69);
    doc.text(`Academic Year: 2025-26`, 20, 76);
    
    // Marks Table
    const tableData = myMarks.map(m => [
      m.examName,
      m.subject,
      m.marksObtained,
      m.totalMarks,
      m.grade,
      `${((m.marksObtained/m.totalMarks)*100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: 85,
      head: [['Exam', 'Subject', 'Obtained', 'Total', 'Grade', 'Percentage']],
      body: tableData,
      theme: selectedBoard === 'CBSE' ? 'striped' : 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [14, 165, 233] }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('This is a computer-generated report card.', 105, finalY, { align: 'center' });
    doc.text('SchoolSync Management System', 105, finalY + 7, { align: 'center' });
    
    doc.save(`${user.name}_${selectedBoard}_ReportCard.pdf`);
  };

  const gradeColors = { 'A1': 'green', 'A2': 'green', 'B1': 'blue', 'B2': 'blue', 'C1': 'orange', 'C2': 'orange', 'D': 'yellow', 'E': 'red' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Award className="text-primary-500" /> Grades & Performance
          </h1>
          <p className="text-gray-500 mt-1">Your academic performance overview</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedBoard} 
            onChange={e => setSelectedBoard(e.target.value)}
            className="input-field py-2 px-3 text-sm w-32"
          >
            <option value="CBSE">CBSE Format</option>
            <option value="ICSE">ICSE Format</option>
            <option value="State">State Board</option>
          </select>
          <Button variant="primary" icon={Download} size="sm" onClick={generateReportCard}>
            Download Report
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, label: 'Overall Average', value: `${overallAvg}%`, color: 'from-purple-500 to-pink-500' },
          { icon: BookOpen, label: 'Exams Taken', value: myMarks.length, color: 'from-emerald-500 to-teal-500' },
          { icon: Award, label: 'Best Grade', value: Object.keys(gradeDistribution).sort()[0] || '-', color: 'from-amber-500 to-orange-500' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="text-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-white mx-auto mb-3`}>
                <s.icon size={28} />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card><MarksChart data={myMarks} title="Marks Trend Over Exams" /></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card><SubjectWiseChart data={myMarks} /></Card>
        </motion.div>
      </div>

      {/* Exam Results Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Exam Results</h3>
            <Badge color="blue">{selectedBoard}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Exam</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Subject</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Marks</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Grade</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {myMarks.map((m, idx) => (
                  <motion.tr key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + idx * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-white">{m.examName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{m.subject}</td>
                    <td className="py-3 px-4 text-sm text-center font-medium text-gray-800 dark:text-white">{m.marksObtained}/{m.totalMarks}</td>
                    <td className="py-3 px-4 text-center"><Badge color={gradeColors[m.grade] || 'gray'}>{m.grade}</Badge></td>
                    <td className="py-3 px-4 text-sm text-center text-gray-600 dark:text-gray-300">{((m.marksObtained/m.totalMarks)*100).toFixed(1)}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {myMarks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>No exam results yet</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};