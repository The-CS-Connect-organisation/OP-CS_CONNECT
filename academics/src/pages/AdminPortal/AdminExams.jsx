import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Edit2, Trash2, Eye, Calendar, Loader2, X } from 'lucide-react';
import { request } from '../../utils/apiClient';

const AdminExams = ({ user, addToast }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', class: '', date: '', maxMarks: 100 });
  const [creating, setCreating] = useState(false);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await request('/exams');
      setExams(res?.items || res?.exams || res?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.date) {
      addToast?.('Fill in name, subject, and date', 'error');
      return;
    }
    try {
      setCreating(true);
      await request('/exams', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          subject: form.subject,
          class: form.class || user.class || '',
          date: form.date,
          maxMarks: Number(form.maxMarks) || 100,
        }),
      });
      addToast?.('Exam scheduled successfully', 'success');
      setShowForm(false);
      setForm({ name: '', subject: '', class: '', date: '', maxMarks: 100 });
      fetchExams();
    } catch (e) {
      addToast?.('Failed to create exam: ' + (e.message || ''), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (examId) => {
    try {
      await request(`/exams/${examId}`, { method: 'DELETE' });
      setExams(prev => prev.filter(e => e.id !== examId));
      addToast?.('Exam deleted', 'success');
    } catch (e) {
      addToast?.('Failed to delete exam', 'error');
    }
  };

  const upcomingCount = exams.filter(e => e.status === 'scheduled' || e.status === 'upcoming' || (e.date && new Date(e.date) >= new Date())).length;
  const completedCount = exams.filter(e => e.status === 'completed' || (e.date && new Date(e.date) < new Date())).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Exam Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Schedule and manage examinations</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 transition-all hover:brightness-105"
          style={{ background: 'var(--primary)' }}
        >
          <Plus size={16} /> Schedule Exam
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>New Exam</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Exam Name</label>
                <input
                  type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Mid-Term Mathematics"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Subject</label>
                <input
                  type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g., Mathematics"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Class</label>
                <input
                  type="text" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                  placeholder="e.g., 10-A"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Date</label>
                <input
                  type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Max Marks</label>
                <input
                  type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))}
                  placeholder="100"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {creating ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{upcomingCount}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Upcoming Exams</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{completedCount}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Completed Exams</p>
        </div>
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{exams.length}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Exams</p>
        </div>
      </div>

      {/* Exam table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading exams...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={fetchExams} className="mt-3 text-sm text-orange-500 underline">Try again</button>
          </div>
        ) : exams.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No exams scheduled yet</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click "Schedule Exam" to create one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Exam Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Class</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Max Marks</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const isUpcoming = !exam.status && exam.date ? new Date(exam.date) >= new Date() : exam.status !== 'completed';
                  return (
                    <tr key={exam.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{exam.name}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{exam.subject}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{exam.class || '—'}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{exam.date}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{exam.maxMarks || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Opening exam details...', 'info')}>
                            <Eye size={15} style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100" onClick={() => addToast?.('Opening exam editor...', 'info')}>
                            <Edit2 size={15} style={{ color: 'var(--text-muted)' }} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50" onClick={() => handleDelete(exam.id)}>
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExams;
