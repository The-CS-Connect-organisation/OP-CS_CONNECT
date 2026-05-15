import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, CheckCircle, Trash2, X, AlertTriangle, Calendar } from 'lucide-react';
import { studentApi, parentApi } from '../../services/apiDataLayer';
import { Select } from '../../components/ui/Select';

export function DigitalFridge({ user, addToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'general', dueDate: '', assignedTo: '', priority: 'medium', sharedWith: [] });
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [view, setView] = useState('my'); // my, shared

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getFridgeItems();
      if (res?.success) setItems(res.items || []);
    } catch (e) { addToast?.('Failed to load fridge items', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!formData.title) { addToast?.('Title required', 'error'); return; }
    try {
      await studentApi.createFridgeItem({
        ...formData,
        sharedWith: formData.sharedWith.filter(Boolean)
      });
      addToast?.('Task created successfully', 'success');
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'general', dueDate: '', assignedTo: '', priority: 'medium', sharedWith: [] });
      loadItems();
    } catch (e) { addToast?.('Failed to create task', 'error'); }
  };

  const handleUpdate = async (itemId, updates) => {
    try {
      await studentApi.updateFridgeItem(itemId, updates);
      addToast?.('Task updated', 'success');
      loadItems();
    } catch (e) { addToast?.('Failed to update task', 'error'); }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await studentApi.deleteFridgeItem(itemId);
      addToast?.('Task deleted', 'success');
      loadItems();
    } catch (e) { addToast?.('Failed to delete task', 'error'); }
  };

  const categoryColors = { supplies: 'bg-blue-500/10 text-blue-400', forms: 'bg-purple-500/10 text-purple-400', permission: 'bg-amber-500/10 text-amber-400', reminder: 'bg-emerald-500/10 text-emerald-400', general: 'bg-slate-500/10 text-slate-400' };
  const priorityColors = { low: 'bg-blue-500/10 text-blue-400', medium: 'bg-amber-500/10 text-amber-400', high: 'bg-rose-500/10 text-rose-400' };
  const statusColors = { pending: 'bg-slate-500/10 text-slate-400', in_progress: 'bg-blue-500/10 text-blue-400', completed: 'bg-emerald-500/10 text-emerald-400' };

  const filteredItems = items.filter(item => {
    const matchStatus = !filters.status || item.status === filters.status;
    const matchCategory = !filters.category || item.category === filters.category;
    if (view === 'my') return matchStatus && matchCategory && (item.createdBy === user?.id || item.assignedTo === user?.id);
    return matchStatus && matchCategory && item.sharedWith?.includes(user?.id);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📋 Digital Fridge</h2>
          <p className="text-sm text-slate-400 mt-1">Shared tasks between parents and students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('my')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>My Tasks</button>
          <button onClick={() => setView('shared')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'shared' ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>Shared with Me</button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select options={['', 'pending', 'in_progress', 'completed']} labels={['All Status', 'Pending', 'In Progress', 'Completed']} value={filters.status} onChange={v => setFilters({ ...filters, status: v })} className="w-32" />
        <Select options={['', 'supplies', 'forms', 'permission', 'reminder', 'general']} labels={['All Categories', 'Supplies', 'Forms', 'Permission', 'Reminder', 'General']} value={filters.category} onChange={v => setFilters({ ...filters, category: v })} className="w-36" />
        <span className="text-xs text-slate-500">{filteredItems.length} tasks</span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading tasks...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
              <p>No tasks found</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 backdrop-blur-sm border-slate-700/40 hover:border-slate-600 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${categoryColors[item.category] || 'bg-slate-800 text-slate-400'}`}>
                  {item.category === 'supplies' ? '📦' : item.category === 'forms' ? '📄' : item.category === 'permission' ? '✍️' : item.category === 'reminder' ? '⏰' : '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                    {item.priority && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${priorityColors[item.priority] || 'bg-slate-700'}`}>{item.priority}</span>}
                  </div>
                  {item.description && <p className="text-xs text-slate-400 mb-2">{item.description.substring(0, 80)}{item.description.length > 80 ? '...' : ''}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    {item.dueDate && <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.dueDate).toLocaleDateString()}</span>}
                    <span className={`capitalize ${statusColors[item.status] || 'text-slate-400'}`}>{item.status || 'pending'}</span>
                    {item.assignedTo && <span>👤 {item.assignedTo}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {item.status !== 'completed' && (
                    <button onClick={() => handleUpdate(item.id, { status: 'completed' })} className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors">Done</button>
                  )}
                  {item.status === 'completed' && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">✓ Done</span>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">New Shared Task</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Task title" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description (optional)" rows={3} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 resize-none"></textarea>
                <div className="grid grid-cols-2 gap-3">
                  <Select options={['general', 'supplies', 'forms', 'permission', 'reminder']} labels={['General', 'Supplies', 'Forms', 'Permission', 'Reminder']} value={formData.category} onChange={v => setFormData({ ...formData, category: v })} className="w-full" />
                  <Select options={['low', 'medium', 'high']} labels={['Low', 'Medium', 'High']} value={formData.priority} onChange={v => setFormData({ ...formData, priority: v })} className="w-full" />
                </div>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                <input value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="Assign to (user ID, optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <input value={formData.sharedWith} onChange={e => setFormData({ ...formData, sharedWith: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Share with (user IDs, comma separated)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
                <button onClick={handleCreate} className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">Create Task</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}