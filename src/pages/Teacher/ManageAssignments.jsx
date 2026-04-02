import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';

export const ManageAssignments = ({ user, addToast }) => {
  const { data: assignments, add, update, remove } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: users } = useStore(KEYS.USERS, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 });

  const myAssignments = assignments.filter(a => a.teacherId === user.id);
  const classes = ['10-A', '10-B'];

  const handleSubmit = () => {
    if (editing) {
      update(editing.id, formData);
      addToast('Assignment updated successfully! ✏️', 'success');
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
      addToast('Assignment created successfully! 📝', 'success');
    }
    setModalOpen(false);
    setEditing(null);
    setFormData({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 });
  };

  const handleEdit = (a) => {
    setEditing(a);
    setFormData({ title: a.title, subject: a.subject, class: a.class, description: a.description, dueDate: a.dueDate, totalMarks: a.totalMarks });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FileText className="text-primary-500" /> Manage Assignments
          </h1>
          <p className="text-gray-500 mt-1">{myAssignments.length} assignments created</p>
        </motion.div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditing(null); setFormData({ title: '', subject: '', class: '10-A', description: '', dueDate: '', totalMarks: 20 }); setModalOpen(true); }}>
          New Assignment
        </Button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {myAssignments.map((a, idx) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-800 dark:text-white">{a.title}</h4>
                  <p className="text-sm text-gray-500">{a.subject} • Class {a.class}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Due: {a.dueDate}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {a.submissions.filter(s => s.submittedAt).length}/{a.submissions.length} submitted</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Edit} onClick={() => handleEdit(a)}>Edit</Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => { remove(a.id); addToast('Assignment deleted', 'info'); }}>Delete</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Assignment' : 'Create Assignment'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} className="input-field" placeholder="Assignment title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
              <input value={formData.subject} onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))} className="input-field" placeholder="Subject" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
              <select value={formData.class} onChange={e => setFormData(d => ({ ...d, class: e.target.value }))} className="input-field">
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="input-field" rows={3} placeholder="Assignment description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input type="date" value={formData.dueDate} onChange={e => setFormData(d => ({ ...d, dueDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Marks</label>
              <input type="number" value={formData.totalMarks} onChange={e => setFormData(d => ({ ...d, totalMarks: parseInt(e.target.value) }))} className="input-field" />
            </div>
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
