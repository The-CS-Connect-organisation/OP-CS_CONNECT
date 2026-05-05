import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Calendar, Award, Info, Zap, Hash, Layers, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

export const ManageExams = ({ user, addToast }) => {
  const { data: exams, add, update, remove } = useStore(KEYS.EXAMS, []);
  const { data: users = [] } = useStore(KEYS.USERS, []);
  const { playClick, playBlip } = useSound();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Unit Test', subject: '', class: '10-A',
    maxMarks: 100, date: '', description: ''
  });

  const myExams = useMemo(() => {
    return exams.filter(e => e.createdBy === user.id);
  }, [exams, user.id]);

  const handleSubmit = () => {
    playBlip();
    if (!formData.name || !formData.subject || !formData.date) {
      addToast('Please provide exam name, subject and date', 'error');
      return;
    }

    const examData = {
      id: editing?.id || `exam-${Date.now()}`,
      ...formData,
      createdBy: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: editing?.status || 'scheduled'
    };
    
    if (editing) {
      update(editing.id, examData);
      addToast('Assessment schedule updated', 'success');
    } else {
      add(examData);
      addToast('New exam successfully scheduled', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ name: '', type: 'Unit Test', subject: '', class: '10-A', maxMarks: 100, date: '', description: '' });
  };

  const examTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Practical', 'Oral'];
  // Get unique classes from Firebase users data
  const classes = Array.from(new Set(users.filter(u => u.role === 'student').map(s => s.class).filter(Boolean))).sort();

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
               Examination Hub
             </div>
             <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 ml-2">Scheduled Protocols: {myExams.length}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
             <Award className="text-slate-300" size={40} />
             Manage Exams
          </h1>
        </div>
        
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={() => { playBlip(); setEditing(null); setModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 shadow-xl shadow-slate-900/10 px-8"
        >
          Schedule New Exam
        </Button>
      </motion.div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {myExams.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <FileText size={48} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No examinations scheduled yet</p>
             </motion.div>
          ) : (
            myExams.slice().reverse().map((exam, idx) => (
              <motion.div 
                key={exam.id} 
                layout
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="group flex flex-col md:flex-row gap-6 p-6 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-500 rounded-3xl relative overflow-hidden"
                  onMouseEnter={playClick}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500 shadow-sm shadow-inner">
                    <Layers size={24} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{exam.name}</h4>
                       <Badge variant="indigo" className="text-[9px] px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase font-black">{exam.type}</Badge>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">{exam.subject} • Cohort: {exam.class}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Calendar size={12} /> Date: {exam.date}</span>
                      <span className="flex items-center gap-1.5"><Hash size={12} /> Max Marks: {exam.maxMarks}</span>
                      <span className={`flex items-center gap-1.5 ${exam.status === 'evaluated' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                         <Zap size={12} /> Status: {exam.status?.toUpperCase() || 'SCHEDULED'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-3 self-start md:self-center">
                    <button 
                      onClick={() => { playBlip(); setEditing(exam); setFormData(exam); setModalOpen(true); }}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => { playBlip(); remove(exam.id); addToast('Exam record removed', 'info'); }}
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
        title={editing ? 'Update Assessment' : 'New Assessment'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
               <Info size={18} />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 leading-relaxed">
                Define the assessment parameters below. Upon registration, this exam will be broadcast to all students in the target cohort.
             </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Assessment Name *</label>
              <input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="E.g. Final Term Examination" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Category</label>
                <select value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner">
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Target Cohort</label>
                <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner">
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="E.g. Quantum Physics" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Maximum Score</label>
                <input type="number" value={formData.maxMarks} onChange={e => setFormData(d => ({ ...d, maxMarks: parseInt(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner text-center font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Scheduled Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner font-mono text-center" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Examination Guidelines</label>
              <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium min-h-[120px] resize-none focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" placeholder="E.g. Calculators allowed, sections A and B are mandatory..." />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-8 border-t border-slate-100">
            <Button variant="secondary" onClick={() => { playBlip(); setModalOpen(false); }} className="px-8 h-12 rounded-2xl border-slate-200 text-slate-500 font-bold">Discard</Button>
            <Button 
               variant="primary" 
               onClick={handleSubmit} 
               className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 shadow-xl shadow-slate-900/20 px-10 font-bold"
            >
               {editing ? 'Commit Changes' : 'Initialize Assessment'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
