import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, CheckCircle, FileText, Star, AlertCircle, Terminal, Activity, Hash, Zap } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const GradeSubmissions = ({ user, addToast }) => {
  const { data: assignments, update } = useStore(KEYS.ASSIGNMENTS, []);
  const { playClick, playBlip } = useSound();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const pendingSubmissions = myAssignments.flatMap(a =>
    a.submissions
      .filter(s => (s.status || 'pending') !== 'graded')
      .map(s => ({
        ...s,
        assignmentTitle: a.title,
        assignmentId: a.id,
        totalMarks: a.totalMarks,
      }))
  );

  const handleGrade = () => {
    if (!selectedSubmission || !grade) return;
    playBlip();
    const assignment = assignments.find(a => a.id === selectedSubmission.assignmentId);
    const updatedSubmissions = assignment.submissions.map(s =>
      s.studentId === selectedSubmission.studentId ? { ...s, marks: parseInt(grade), status: 'graded', gradedAt: new Date().toISOString() } : s
    );
    update(assignment.id, { submissions: updatedSubmissions });
    setSelectedSubmission(null);
    setGrade('');
    addToast('Vector_Graded [SUCCESS] ⭐', 'success');
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-white/[0.06] text-[var(--text-muted)] border border-white/12 rounded-sm text-[10px] font-semibold font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)]">
             Overview
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className="text-[var(--text-muted)] animate-pulse" /> Stream_Active
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <GraduationCap className="text-[var(--text-muted)]" size={48} />
           Assessments
        </h1>
        <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest mt-4">
          Processing {pendingSubmissions.length} pending data packets for validation.
        </p>
      </motion.div>

      {pendingSubmissions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="nova-card py-24 text-center border-dashed border-[var(--border-default)]"
        >
          <div className="w-20 h-20 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
            <CheckCircle size={40} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] tracking-widest mb-2">All Clear</h3>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">All_Nodes_Validated</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 relative z-10">
          <AnimatePresence mode="popLayout">
            {pendingSubmissions.map((sub, idx) => (
              <motion.div 
                key={`${sub.assignmentId}-${sub.studentId}`} 
                layout
                initial={{ opacity: 0, y: 30, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card 
                  className="group flex flex-col md:flex-row md:items-center gap-6 p-6 border border-[var(--border-default)] hover:border-white/12 transition-all duration-500 relative overflow-hidden"
                  onMouseEnter={playClick}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 to-rose-500/0 group-hover:from-rose-500/5 transition-all duration-700 pointer-events-none" />
                  
                  <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-muted)] group-hover:border-white/12 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <span className="text-xl font-bold font-mono">{sub.studentName.charAt(0)}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">
                        {sub.studentName}
                      </h4>
                      <Badge variant="rose">Pending</Badge>
                    </div>
                    <p className="text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-[0.2em] mb-3">
                      Target_Module: {sub.assignmentTitle}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><FileText size={12} className="text-[var(--text-muted)]" /> V_ID: {sub.assignmentId.split('-')[1]}</span>
                       <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                       <span className="flex items-center gap-1.5"><Hash size={12} className="text-[var(--text-muted)]" /> Max: {sub.totalMarks}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={Star} 
                    onClick={() => { playBlip(); setSelectedSubmission(sub); }}
                    className="shadow-[0_0_15px_rgba(255,255,255,0.2)] md:w-auto w-full"
                  >
                    Assess_Vector
                  </Button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Grade Entry Modal */}
      <Modal 
        isOpen={!!selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
        title="VALIDATE_ENTRY"
        size="md"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                 <Terminal size={16} className="text-[var(--text-muted)]" />
                 <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none">Entity_Specs</span>
              </div>
              <h4 className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter mb-1">{selectedSubmission.studentName}</h4>
              <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest">{selectedSubmission.assignmentTitle}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex gap-3 items-start">
                <AlertCircle size={18} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                   Offline submission detected. Authenticate marks manually within the defined range [0 - {selectedSubmission.totalMarks}].
                </p>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors flex items-center gap-2">
                   <Zap size={10} /> Marks_Payload
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={grade} 
                    onChange={e => setGrade(e.target.value)} 
                    className="input-field text-4xl py-6 pr-24 font-bold font-mono text-center tracking-tighter border-2 focus:border-white/25 transition-all text-[var(--text-primary)]" 
                    max={selectedSubmission.totalMarks} 
                    min={0} 
                    placeholder="00" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono text-xl font-bold">
                    / {selectedSubmission.totalMarks}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-6 border-t border-[var(--border-default)]">
              <Button variant="secondary" onClick={() => { playBlip(); setSelectedSubmission(null); }}>Abort</Button>
              <Button variant="primary" onClick={handleGrade} disabled={!grade} className="shadow-[0_0_20px_rgba(255,255,255,0.3)]">Commit_Grade</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

