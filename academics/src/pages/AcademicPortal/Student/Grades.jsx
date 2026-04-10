import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, BookOpen, Download, FileText, Terminal, Activity, Hash, Layers, Zap, ChevronRight, BarChart3, Database } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { MarksChart, SubjectWiseChart } from '../../../components/charts/MarksChart';
import { useMarks } from '../../../hooks/useSchoolData';
import { useSound } from '../../../hooks/useSound';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Grades = ({ user }) => {
  const { report } = useMarks(user?.id);
  // API returns { marks: [{ id, student_id, subject, exam_type, score, term }] }
  const rawMarks = report?.marks || [];
  // Normalise to what the UI expects
  const myMarks = rawMarks.map(m => ({
    ...m,
    examName: m.term || m.exam_type || 'Exam',
    marksObtained: m.score ?? m.marksObtained ?? 0,
    totalMarks: 100,
    grade: m.score >= 90 ? 'A1' : m.score >= 80 ? 'A2' : m.score >= 70 ? 'B1' : m.score >= 60 ? 'B2' : m.score >= 50 ? 'C1' : m.score >= 40 ? 'C2' : m.score >= 33 ? 'D' : 'E',
  }));
  const { playClick, playBlip } = useSound();
  const [selectedBoard, setSelectedBoard] = useState('CBSE');

  const overallAvg = report?.percentage ?? 0;
  const gradeDistribution = useMemo(() => {
    const dist = {};
    myMarks.forEach(m => {
      const g = m.score >= 90 ? 'A' : m.score >= 75 ? 'B' : m.score >= 60 ? 'C' : m.score >= 45 ? 'D' : 'F';
      dist[g] = (dist[g] || 0) + 1;
    });
    return dist;
  }, [myMarks]);

  const generateReportCard = () => {
    playBlip();
    const doc = new jsPDF();
    
    const boardConfig = {
      CBSE: { name: 'Central Board of Secondary Education', logo: 'CBSE' },
      ICSE: { name: 'Council for the Indian School Certificate Examinations', logo: 'ICSE' },
      State: { name: 'State Board of Education', logo: 'STATE' }
    };
    
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(boardConfig[selectedBoard].logo, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(boardConfig[selectedBoard].name, 105, 28, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Student Name: ${user.name}`, 20, 55);
    doc.text(`Class: ${user.class}`, 20, 62);
    doc.text(`Roll No: ${user.rollNo}`, 20, 69);
    doc.text(`Academic Year: 2025-26`, 20, 76);
    
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
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('This is a computer-generated report card.', 105, finalY, { align: 'center' });
    doc.text('SchoolSync Management System', 105, finalY + 7, { align: 'center' });
    
    doc.save(`${user.name}_${selectedBoard}_ReportCard.pdf`);
  };

  const gradeColors = { 'A1': 'emerald', 'A2': 'emerald', 'B1': 'indigo', 'B2': 'indigo', 'C1': 'amber', 'C2': 'amber', 'D': 'yellow', 'E': 'rose' };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
               Overview
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
               <Activity size={10} className="animate-pulse" /> Stream_Analytics_Online
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <Award className="text-[var(--text-muted)]" size={48} />
             Scholar_Index
          </h1>
        </div>

        <div className="flex gap-4 items-center">
          <select 
            value={selectedBoard} 
            onChange={e => { playClick(); setSelectedBoard(e.target.value); }}
            className="input-field py-3 px-6 text-[10px] font-mono font-semibold w-40 appearance-none bg-nova-base border-[var(--border-default)] focus:border-white/25 transition-all text-[var(--text-primary)]"
          >
            <option value="CBSE">CBSE_MODE</option>
            <option value="ICSE">ICSE_MODE</option>
            <option value="State">STATE_BOARD</option>
          </select>
          <Button 
            variant="primary" 
            icon={Download} 
            onClick={generateReportCard}
            className="shadow-[0_0_20px_rgba(255,255,255,0.2)] font-mono text-[10px] tracking-widest uppercase py-3"
          >
            Export_Buffer
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, label: 'QUORUM_AVERAGE', value: `${overallAvg}%`, color: 'rose' },
          { icon: Database, label: 'VECTORS_PROCESSED', value: myMarks.length, color: 'zinc' },
          { icon: BarChart3, label: 'PEAK_PERFORMANCE', value: Object.keys(gradeDistribution).sort()[0] || '-', color: 'rose' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="relative p-8 group hover:border-white/20 transition-all duration-500 bg-nova-base/40">
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 pointer-events-none ${s.color === 'rose' ? 'bg-white' : 'bg-slate-500'}`} />
               <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-nova-base border border-[var(--border-default)] flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 ${s.color === 'rose' ? 'text-[var(--text-muted)] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-[var(--text-muted)]'}`}>
                    <s.icon size={24} />
                  </div>
                  <p className="text-4xl font-bold text-[var(--text-primary)] font-mono tracking-tighter mb-1">{s.value}</p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-widest">{s.label}</p>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
             <div className="flex items-center gap-3 mb-8">
                <Activity size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Performance Over Time</h3>
             </div>
             <MarksChart data={myMarks} />
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
          <Card className="p-6 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
             <div className="flex items-center gap-3 mb-8">
                <Layers size={16} className="text-[var(--text-muted)]" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Subject Distribution</h3>
             </div>
             <SubjectWiseChart data={myMarks} />
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-[var(--border-default)] overflow-hidden bg-nova-base/40 backdrop-blur-sm">
          <div className="p-6 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-elevated)]">
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <h3 className="text-[10px] font-mono font-bold uppercase text-[var(--text-primary)] tracking-[0.4em]">Raw_Data_Stream</h3>
            </div>
            <Badge variant="rose" className="font-mono text-[9px] uppercase tracking-widest px-4">{selectedBoard} Transcript</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-nova-base/50">
                  <th className="text-left py-6 px-8 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Module_ID</th>
                  <th className="text-left py-6 px-8 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Subject_Entity</th>
                  <th className="text-center py-6 px-8 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Quantum_Index</th>
                  <th className="text-center py-6 px-8 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Grade_Value</th>
                  <th className="text-center py-6 px-8 text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <AnimatePresence mode="popLayout">
                  {myMarks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <Terminal size={48} className="mx-auto text-zinc-900 mb-6" />
                        <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.4em]">Void_State_Detected: No_Marks_Found</p>
                      </td>
                    </tr>
                  ) : (
                    myMarks.map((m, idx) => (
                      <motion.tr 
                        key={m.id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-[var(--bg-elevated)] transition-colors cursor-crosshair"
                        onMouseEnter={playClick}
                      >
                        <td className="py-5 px-8 text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{m.examName}</td>
                        <td className="py-5 px-8 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{m.subject}</td>
                        <td className="py-5 px-8 text-center">
                           <span className="font-mono text-xl font-bold text-[var(--text-primary)]">{m.marksObtained}</span>
                           <span className="font-mono text-[10px] text-[var(--text-muted)] ml-1">/ {m.totalMarks}</span>
                        </td>
                        <td className="py-5 px-8 text-center">
                           <Badge variant={gradeColors[m.grade] || 'default'} className="font-mono text-xs px-4 py-1 justify-center min-w-[50px]">{m.grade}</Badge>
                        </td>
                        <td className="py-5 px-8 text-center text-[10px] font-mono text-[var(--text-muted)] font-bold tracking-widest">
                           {((m.marksObtained/m.totalMarks)*100).toFixed(1)}%
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
