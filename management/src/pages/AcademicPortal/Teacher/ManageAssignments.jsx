import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Users, Calendar, Terminal, Zap, Hash, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const ManageAssignments = ({ user, addToast }) => {
  const { data: assignments, add, update, remove } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { playClick, playBlip } = useSound();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 });

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const classes = ['10-A', '10-B', '11-A', '11-B', '12-A'];

  const handleSubmit = () => {
    playBlip();
    if (editing) {
      update(editing.id, formData);
      addToast('Assignment Vector Updated! ✏️', 'success');
    } else {
      const newAssignment = {
        id: `asgn-${Date.now()}`,
        ...formData,
        teacherId: user.id,
        teacherName: user.name,
        createdAt: new Date().toISOString().split('T')[0],
        submissions: users.filter(u => u.role === 'student' && u.class === formData.class).map(s => ({
          studentId: s.id, studentName: s.name, submittedAt: null, marks: null, status: 'pending', file: null
        }))
      };
      add(newAssignment);
      addToast('Assignment Deployed! 📝', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 });
  };

  const handleEdit = (a) => {
    playBlip();
    setEditing(a);
    setFormData({ title: a.title, subject: a.subject, class: a.class, description: a.description, dueDate: a.dueDate, totalMarks: a.totalMarks });
    setModalOpen(true);
  };

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
               Curriculum_Deployer
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Active_Modules: {myAssignments.length}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <FileText className="text-[var(--text-muted)]" size={48} />
             Assignments
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => { playBlip(); setEditing(null); setModalOpen(true); }}
          className="shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          Initialize_Module
        </Button>
      </motion.div>

      <div className="grid gap-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {myAssignments.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center nova-card border-dashed border-[var(--border-default)]">
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No_Assigned_Modules_Detected</p>
             </motion.div>
          ) : (
            myAssignments.slice().reverse().map((a, idx) => (
              <motion.div 
                key={a.id} 
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
                    <Zap size={28} />
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{a.title}</h4>
                      <Badge variant="default">{a.class}</Badge>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-widest mb-4">{a.subject} • V_ID: {a.id.split('-')[1]}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Clock size={12} className="text-[var(--text-muted)]" /> Deadline: {a.dueDate}</span>
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Users size={12} className="text-[var(--text-muted)]" /> Throughput: {a.submissions.filter(s => s.submittedAt).length} / {a.submissions.length}</span>
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Hash size={12} className="text-[var(--text-muted)]" /> Max_Score: {a.totalMarks}</span>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col justify-end gap-3 self-start md:self-center relative z-10">
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(a)}
                      className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl transition-all"
                    >
                      <Edit size={18} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { playBlip(); remove(a.id); addToast('Module Purged.', 'info'); }}
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
        title={editing ? 'MODIFY_MODULE' : 'INITIALIZE_MODULE'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg flex items-center gap-3">
             <span className="text-[var(--text-muted)]"><Terminal size={16} /></span>
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Compiler mode active. Check all vectors before commit.</p>
          </div>
          <div className="space-y-4">
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Module_Title</label>
              <input value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} className="input-field" placeholder="ASSIGNMENT_ALPHA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Subject_Domain</label>
                <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="input-field" placeholder="E.g. Quantum_Phys" />
              </div>
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Target_Cluster</label>
                <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="input-field appearance-none">
                  {classes.map(c => <option key={c} value={c} className="bg-nova-base">{c}</option>)}
                </select>
              </div>
            </div>
            <div className="group">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Operation_Specs</label>
              <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="input-field min-h-[100px] resize-none" placeholder="Describe module parameters..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Expiry_Timestamp</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData(d => ({ ...d, dueDate: e.target.value }))} className="input-field font-mono" />
              </div>
              <div className="group">
                <label className="text-[10px] font-semibold text-[var(--text-muted)] font-mono mb-2 block group-focus-within:text-[var(--text-muted)] transition-colors">Max_Score_Potential</label>
                <input type="number" value={formData.totalMarks} onChange={e => setFormData(d => ({ ...d, totalMarks: parseInt(e.target.value) }))} className="input-field font-mono" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-6 border-t border-[var(--border-default)] text-sm">
            <Button variant="secondary" onClick={() => { playBlip(); setModalOpen(false); }}>Abort_Command</Button>
            <Button variant="primary" onClick={handleSubmit} className="shadow-[0_0_20px_rgba(255,255,255,0.3)]">{editing ? 'Commit_Vector' : 'Execute_Deployment'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

