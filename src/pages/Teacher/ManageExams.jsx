import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Calendar, Users, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const ManageExams = ({ user, addToast }) => {
  const { data: exams, add, update, remove } = useStore(KEYS.EXAMS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', type: 'Unit Test', subject: '', class: '10-A',
    maxMarks: 100, date: '', description: ''
  });

  const myExams = useMemo(() => {
    // Teachers see exams for their subjects/classes
    if (user.role === 'teacher') {
      return exams.filter(e => e.createdBy === user.id);
    }
    return exams;
  }, [exams, user]);

  const handleSubmit = () => {
    const examData = {
      id: editing?.id || `exam-${Date.now()}`,
      ...formData,
      createdBy: user.id,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'scheduled'
    };
    
    if (editing) {
      update(editing.id, examData);
      addToast('Exam updated successfully! ✏️', 'success');
    } else {
      add(examData);
      addToast('Exam created successfully! 📝', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ name: '', type: 'Unit Test', subject: '', class: '10-A', maxMarks: 100, date: '', description: '' });
  };

  const examTypes = ['Unit Test', 'Mid Term', 'Final Exam', 'Practical', 'Oral'];
  const classes = ['10-A', '10-B', '11-A', '11-B', '12-A', '12-B'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Award className="text-primary-500" /> Exam Management
          </h1>
          <p className="text-gray-500 mt-1">{myExams.length} exams created</p>
        </motion.div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditing(null); setModalOpen(true); }}>
          New Exam
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {myExams.map((exam, idx) => (
            <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                  <Award size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white">{exam.name}</h4>
                    <Badge color="blue">{exam.type}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{exam.subject} • Class {exam.class}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {exam.date}</span>
                    <span>Max Marks: {exam.maxMarks}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Edit} onClick={() => { setEditing(exam); setFormData(exam); setModalOpen(true); }}>Edit</Button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => { remove(exam.id); addToast('Exam deleted', 'info'); }} className="text-red-500" />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Exam' : 'Create Exam'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Name</label>
            <input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="input-field" placeholder="e.g., Mathematics Unit Test 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value }))} className="input-field">
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="input-field">
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="input-field" placeholder="e.g., Mathematics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Marks</label>
              <input type="number" value={formData.maxMarks} onChange={e => setFormData(d => ({ ...d, maxMarks: parseInt(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="input-field" rows={3} placeholder="Exam instructions, syllabus, etc." />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};