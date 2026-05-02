import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Calendar, Users, Award, Terminal, Activity, Hash, Layers } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const ManageExams = ({ user, addToast }) => {
  const { data: exams, add, update, remove } = useStore(KEYS.EXAMS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { playClick, playBlip } = useSound();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Unit Test', subject: '', class: '10-A',
    maxMarks: 100, date: '', description: ''
  });

  const myExams = useMemo(() => {
    if (user.role === 'teacher') {
      return exams.filter(e => e.createdBy === user.id);
    }
    return exams;
  }, [exams, user]);

  const handleSubmit = () => {
    playBlip();
    const examData = {
      id: editing?.id || `exam-${Date.now()}`,
      ...formData,
      createdBy: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'scheduled'
    };
    
    if (editing) {
      update(editing.id, examData);
      addToast('Assessment Protocol Updated! ✏️', 'success');
    } else {
      add(examData);
      addToast('Assessment Protocol Deployed! 📝', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ name: '', type: 'Unit Test', subject: '', class: '10-A', maxMarks: 100, date: '', description: '' });
  };

  const examTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Practical', 'Oral'];
  // Get unique classes from Firebase users data
  const classes = Array.from(new Set(users.filter(u => u.role === 'student').map(s => s.class).filter(Boolean))).sort();

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-white/[0.06] text-[var(--text-muted)] border border-white/12 rounded-sm text-[10px] font-semibold font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               Assessment_Governor
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Global_Status_Nominal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <Award className="text-[var(--text-muted)]" size={48} />
             Examinations
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => { playBlip(); setEditing(null); setModalOpen(true); }}
          className="shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Initialize_Test
        </Button>
      </motion.div>

      <div className="grid gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {myExams.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center nova-card border-dashed border-[var(--border-default)]">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No_Scheduled_Protocols_Detected</p>
             </motion.div>
          ) : (
            myExams.slice().reverse().map((exam, idx) => (
              <motion.div 
                key={exam.id} 
                layout
                initial={{ opacity: 0, y: 30, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Card 
                  className="group flex flex-col md:flex-row gap-6 p-6 border border-[var(--border-default)] hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                  onMouseEnter={playClick}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] blur-[60px] rounded-full pointer-events-none group-hover:bg-black/05 transition-colors" />
                  <div className="w-16 h-16 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-muted)] group-hover:border-white/12 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <Layers size={28} />
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{exam.name}</h4>
                      <Badge variant="indigo">{exam.type}</Badge>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest mb-4">{exam.subject} • Target: {exam.class}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-bold"><Calendar size={12} className="text-[var(--text-muted)]" /> Scheduled: {exam.date}</span>
                      <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Hash size={12} className="text-[var(--text-muted)]" /> Max_Marks: {exam.maxMarks}</span>
                      <span className="h-1 w-1 bg-[var(--bg-floating)] rounded-full" />
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Activity size={12} className="text-[var(--text-muted)]" /> Status: {exam.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col justify-end gap-3 self-start md:self-center relative z-10">
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { playBlip(); setEditing(exam); setFormData(exam); setModalOpen(true); }}
                      className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { playBlip(); remove(exam.id); addToast('Protocol Purged.', 'info'); }}
                      className="p-3 text-[var(--text-muted)]/70 hover:text-rose-400 bg-white/[0.06] border border-white/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editing ? 'MODIFY_PROTOCOL' : 'INITIALIZE_PROTOCOL'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-lg flex items-center gap-3">
             <Terminal size={16} className="text-[var(--text-muted)] shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-normal">
                Auth level: Root. Validation of all exam vectors is required before sector broadcasting.
             </p>
          </div>
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Protocol_Header</label>
              <input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="input-field" placeholder="EXAM_VERSION_ALPHA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Variant_Type</label>
                <select value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value }))} className="input-field cursor-pointer font-mono">
                  {examTypes.map(t => <option key={t} value={t} className="bg-nova-base">{t}</option>)}
                </select>
              </div>
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Sector_Target</label>
                <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="input-field cursor-pointer font-mono">
                  {classes.map(c => <option key={c} value={c} className="bg-nova-base">{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Domain_Subject</label>
                <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="input-field" placeholder="E.g. Logic_Gates" />
              </div>
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Peak_Capacity (Marks)</label>
                <input type="number" value={formData.maxMarks} onChange={e => setFormData(d => ({ ...d, maxMarks: parseInt(e.target.value) }))} className="input-field font-mono" />
              </div>
            </div>
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Execution_Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="input-field font-mono" />
            </div>
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Data_Parameters</label>
              <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="input-field min-h-[100px] resize-none" placeholder="Instructions / Syllabus / Objectives..." />
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-6 border-t border-[var(--border-default)]">
            <Button variant="secondary" onClick={() => { playBlip(); setModalOpen(false); }}>Abort_Action</Button>
            <Button variant="primary" onClick={handleSubmit} className="shadow-[0_0_20px_rgba(255,255,255,0.3)]">{editing ? 'Commit_Protocols' : 'Deploy_Protocols'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
