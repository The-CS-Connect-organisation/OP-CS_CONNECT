import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, AlertTriangle, CheckCircle, X, RefreshCw
} from 'lucide-react';
import { teacherApi } from '../../services/apiDataLayer';

export function UniformSchedule({ user, addToast }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: '', date: new Date().toISOString().split('T')[0],
    uniformType: 'regular', customDescription: '', notes: ''
  });
  const [todayUniform, setTodayUniform] = useState(null);

  useEffect(() => { loadSchedules(); loadTodaysUniform(); }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getUniformSchedule('', selectedDate);
      if (res?.success && res.schedules) {
        setSchedules(res.schedules);
      }
    } catch (e) { addToast?.('Failed to load schedules', 'error'); }
    finally { setLoading(false); }
  };

  const loadTodaysUniform = async () => {
    try {
      const res = await teacherApi.getTodaysUniform();
      if (res?.success) setTodayUniform(res.schedules || []);
    } catch { /* ignore */ }
  };

  const handleCreate = async () => {
    if (!formData.classId) { addToast?.('Class ID required', 'error'); return; }
    try {
      await teacherApi.createUniformSchedule({
        classId: formData.classId,
        date: formData.date,
        uniformType: formData.uniformType,
        customDescription: formData.customDescription || null,
        notes: formData.notes || null
      });
      addToast?.('Uniform schedule created', 'success');
      setShowForm(false);
      setFormData({ classId: '', date: new Date().toISOString().split('T')[0], uniformType: 'regular', customDescription: '', notes: '' });
      loadSchedules();
      loadTodaysUniform();
    } catch (e) { addToast?.('Failed to create schedule', 'error'); }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const typeStyles = {
    regular: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    sports: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    house_colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    formal: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    winter: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    summer: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    custom: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  };

  const typeLabels = {
    regular: '👔 Regular', sports: '⚽ Sports', house_colors: '🏠 House Colors',
    formal: '🤵 Formal', winter: '🧥 Winter', summer: '☀️ Summer', custom: '✨ Custom'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">👔 Uniform Schedule</h2>
          <p className="text-sm text-slate-400 mt-1">Manage school uniform schedules and types</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(true); setFormData({ ...formData, date: new Date().toISOString().split('T')[0] }); }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            <PlusCircle size={16} /> Add Schedule
          </button>
          <button onClick={loadTodaysUniform} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-300 transition-all flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Today's Uniform Card */}
      {todayUniform && todayUniform.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-white/80" />
            <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Today's Uniform</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {todayUniform.map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <p className="text-sm font-bold text-white">{s.class_id || s.class || 'All Classes'}</p>
                <p className={`text-xs font-semibold mt-1 ${typeStyles[s.uniform_type] || 'bg-slate-500/20 text-slate-300'}`}>
                  {typeLabels[s.uniform_type] || s.uniform_type || 'Regular'}
                </p>
                {s.custom_description && <p className="text-[10px] text-blue-200 mt-1">{s.custom_description}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Schedule List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700/40 overflow-hidden">
        <div className="p-5 border-b border-slate-700/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Upcoming Schedules</h3>
          <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); loadSchedules(); }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No uniform schedules for this date</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            <AnimatePresence>
              {schedules.map((sched, i) => (
                <motion.div key={sched.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${typeStyles[sched.uniform_type] || 'bg-slate-800 border-slate-700'}`}>
                      {sched.uniform_type === 'sports' ? '⚽' : sched.uniform_type === 'formal' ? '🤵' : sched.uniform_type === 'winter' ? '🧥' : sched.uniform_type === 'summer' ? '☀️' : '👔'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{sched.class_id || 'All Classes'}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${typeStyles[sched.uniform_type] || 'text-slate-400'}`}>
                        {typeLabels[sched.uniform_type] || sched.uniform_type}
                      </p>
                      {sched.custom_description && <p className="text-xs text-slate-400 mt-0.5">{sched.custom_description}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{formatDate(sched.date)}</p>
                    {sched.notes && <p className="text-[9px] text-slate-600 mt-0.5 italic">{sched.notes}</p>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Add Uniform Schedule</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input required value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} placeholder="Class ID (e.g., class-10-a)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
                <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-indigo-500" />
                <select value={formData.uniformType} onChange={e => setFormData({ ...formData, uniformType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white focus:outline-none focus:border-indigo-500">
                  <option value="regular">👔 Regular</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="house_colors">🏠 House Colors</option>
                  <option value="formal">🤵 Formal</option>
                  <option value="winter">🧥 Winter</option>
                  <option value="summer">☀️ Summer</option>
                  <option value="custom">✨ Custom</option>
                </select>
                <input value={formData.customDescription} onChange={e => setFormData({ ...formData, customDescription: e.target.value })} placeholder="Custom description (if custom type)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
                <input value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Notes (optional)" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
                <button onClick={handleCreate} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all">Schedule Uniform</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}