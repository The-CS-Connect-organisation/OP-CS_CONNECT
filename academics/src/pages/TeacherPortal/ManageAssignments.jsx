import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Users, Calendar, Info, Zap, Hash, Clock, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';
import { notificationsService } from '../../services/notificationsService';
import { localAuditRepo } from '../../services/localRepo';

export const ManageAssignments = ({ user, addToast }) => {
  const { data: assignments, add, update, remove } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: submissions } = useStore('sms_submissions', []);
  const { playClick, playBlip } = useSound();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 });

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const classes = ['10-A', '10-B', '11-A', '11-B', '12-A'];

  const handleSubmit = () => {
    playBlip();
    if (!formData.title || !formData.subject) {
      addToast('Please fill in required fields', 'error');
      return;
    }
    
    if (editing) {
      update(editing.id, formData);
      addToast('Assignment updated successfully', 'success');
    } else {
      const newAssignment = {
        id: `asgn-${Date.now()}`,
        ...formData,
        teacherId: user.id,
        teacherName: user.name,
        createdAt: new Date().toISOString().split('T')[0],
      };
      add(newAssignment);
      addToast('New assignment published', 'success');

      // Notify students (local/in-app)
      users
        .filter((u) => u.role === 'student' && u.class === formData.class)
        .forEach((stu) => {
          notificationsService.emit({
            userId: stu.id,
            message: `New assignment posted: ${newAssignment.title} (${newAssignment.subject})`,
            type: 'assignment',
            meta: { assignmentId: newAssignment.id, class: newAssignment.class, subject: newAssignment.subject },
            actor: user,
          });
        });
      localAuditRepo.append({ actorId: user.id, actorEmail: user.email, action: 'assignments.create', targetId: newAssignment.id, mode: 'LOCAL_DEMO' });
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
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
               Assignment Registry
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-2">Active Tasks: {myAssignments.length}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
             <FileText className="text-slate-300" size={40} />
             Assignments
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => { playBlip(); setEditing(null); setModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 rounded-2xl px-8 h-12"
        >
          Create New Task
        </Button>
      </motion.div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {myAssignments.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">No assignments published yet</p>
             </motion.div>
          ) : (
            myAssignments.slice().reverse().map((a, idx) => (
              <motion.div 
                key={a.id} 
                layout
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="group flex flex-col md:flex-row gap-6 p-6 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 rounded-3xl"
                  onMouseEnter={playClick}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Zap size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{a.title}</h4>
                       <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200">{a.class}</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{a.subject} • ID: {a.id.split('-')[1]}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Due: {a.dueDate}</span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} /> Submissions: {submissions.filter(s => s.assignmentId === a.id && !!s.submittedAt).length} / {users.filter(u => u.role === 'student' && u.class === a.class).length}
                      </span>
                      <span className="flex items-center gap-1.5"><Hash size={12} /> Total Marks: {a.totalMarks}</span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2 self-start md:self-center">
                    <button 
                      onClick={() => handleEdit(a)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { playBlip(); remove(a.id); addToast('Assignment deleted', 'info'); }}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
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
        title={editing ? 'Modify Assignment' : 'New Assignment'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
               <Info size={16} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Provide assignment details below. All fields marked with * are required.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Title *</label>
              <input value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Enter assignment title" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Subject *</label>
                <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="E.g. Mathematics" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Class *</label>
                <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium min-h-[100px] resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" placeholder="Detailed instructions for students..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData(d => ({ ...d, dueDate: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Max Score</label>
                <input type="number" value={formData.totalMarks} onChange={e => setFormData(d => ({ ...d, totalMarks: parseInt(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { playBlip(); setModalOpen(false); }} className="px-6 py-2.5">Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} className="px-6 py-2.5 bg-slate-900 text-white shadow-xl shadow-slate-900/10">{editing ? 'Update Task' : 'Publish Task'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
