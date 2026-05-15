import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Trash2, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { teacherApi, studentApi } from '../../services/apiDataLayer';
import { getSocket } from '../../utils/socketClient';
import { Select } from '../../components/ui/Select';

const UNIFORM_TYPES = [
  { value: 'regular', label: '🏫 Regular', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { value: 'sports', label: '⚽ Sports', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'house_colors', label: '🏠 House Colors', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { value: 'formal', label: '👔 Formal', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'winter', label: '❄️ Winter', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { value: 'summer', label: '☀️ Summer', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { value: 'custom', label: '✨ Custom', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function UniformSchedule({ user, addToast }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({ classId: '', date: '', uniformType: 'regular', customDescription: '', notes: '' });
  const [selectedClass, setSelectedClass] = useState('');
  const [classSchedules, setClassSchedules] = useState([]);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await teacherApi.getUniformSchedule(selectedClass, selectedDate);
      if (res?.success) {
        setSchedules(res.schedules || []);
      }
    } catch (e) {
      addToast?.('Failed to load uniform schedules', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedClass, selectedDate]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  // WebSocket listener for real-time uniform updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('notification:new', (data) => {
      if (data.type === 'uniform-update') {
        addToast?.('📋 Uniform schedule updated', 'info');
        loadSchedules();
      }
    });
    return () => { socket.off('notification:new', () => {}); };
  }, [loadSchedules, addToast]);

  const getTodaysUniform = useCallback(async () => {
    try {
      const res = await studentApi.getTodaysUniform();
      if (res?.success && res.schedules?.length > 0) {
        const todaySchedules = res.schedules;
        setSchedules(todaySchedules);
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
    } catch (e) {
      addToast?.('Failed to fetch today\'s uniform', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    getTodaysUniform();
  }, [getTodaysUniform]);

  const handleCreateSchedule = async () => {
    if (!formData.classId || !formData.date || !formData.uniformType) {
      addToast?.('Please fill in all required fields', 'error');
      return;
    }
    try {
      await teacherApi.createUniformSchedule({
        classId: formData.classId,
        date: formData.date,
        uniformType: formData.uniformType,
        customDescription: formData.customDescription,
        notes: formData.notes,
      });
      addToast?.('Uniform schedule created successfully', 'success');
      setShowForm(false);
      setFormData({ classId: '', date: '', uniformType: 'regular', customDescription: '', notes: '' });
      loadSchedules();
    } catch (e) {
      addToast?.('Failed to create uniform schedule', 'error');
    }
  };

  const getUniformTypeLabel = (type) => {
    const found = UNIFORM_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getUniformTypeStyle = (type) => {
    const found = UNIFORM_TYPES.find(t => t.value === type);
    return found ? found.color : 'bg-slate-500/10 text-slate-400';
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return WEEKDAYS[date.getDay()];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">👔 Uniform Schedule</h2>
          <p className="text-sm text-slate-400 mt-1">Manage school uniform schedules for all classes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Plus size={16} /> Add Schedule
          </button>
          <button onClick={loadSchedules} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Today's Uniform Widget */}
      <motion.div className="nova-card p-5" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            <h3 className="text-sm font-bold text-gray-900">Today's Uniform</h3>
          </div>
          <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw size={20} className="animate-spin text-slate-400" />
          </div>
        ) : schedules.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {schedules.map((s) => (
              <div key={s.id} className={`p-3 rounded-xl border text-center ${getUniformTypeStyle(s.uniform_type)}`}>
                <p className="text-xs font-bold">{getUniformTypeLabel(s.uniform_type)}</p>
                {s.class_id && <p className="text-[9px] text-slate-500 mt-0.5">{s.class_id}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No uniform schedules set for today</p>
        )}
      </motion.div>

      {/* Date & Class Filter */}
      <div className="nova-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <Select
            options={['', 'class-10-a', 'class-10-b', 'class-9-a', 'class-9-b', 'class-8-a', 'class-7-a']}
            labels={['All Classes', 'Class 10-A', 'Class 10-B', 'Class 9-A', 'Class 9-B', 'Class 8-A', 'Class 7-A']}
            value={selectedClass}
            onChange={v => setSelectedClass(v)}
            className="w-40"
          />
          <span className="text-xs text-slate-500">{schedules.length} schedules found</span>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
              <p>No uniform schedules found</p>
              <p className="text-xs mt-1">Use the button above to create a new schedule</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <motion.div key={schedule.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-4 p-4 rounded-xl border bg-white/5 backdrop-blur-sm border-slate-700/40 hover:border-slate-600 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getUniformTypeStyle(schedule.uniform_type)}`}>
                  <span className="text-xl">
                    {schedule.uniform_type === 'sports' ? '⚽' :
                     schedule.uniform_type === 'formal' ? '👔' :
                     schedule.uniform_type === 'winter' ? '❄️' :
                     schedule.uniform_type === 'summer' ? '☀️' :
                     schedule.uniform_type === 'house_colors' ? '🏠' :
                     schedule.uniform_type === 'custom' ? '✨' : '🏫'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white capitalize">{getUniformTypeLabel(schedule.uniform_type)}</p>
                    {schedule.class_id && <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full font-medium">{schedule.class_id}</span>}
                  </div>
                  {schedule.custom_description && <p className="text-xs text-slate-400 mb-1">{schedule.custom_description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(schedule.date).toLocaleDateString()}</span>
                    <span>{getDayName(schedule.date)}</span>
                    {schedule.notes && <span>📝 {schedule.notes}</span>}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New Schedule Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" /> New Uniform Schedule
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Class *</label>
                  <input
                    required
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    placeholder="e.g., class-10-a"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Uniform Type *</label>
                  <Select
                    options={UNIFORM_TYPES.map(t => t.value)}
                    labels={UNIFORM_TYPES.map(t => t.label)}
                    value={formData.uniformType}
                    onChange={v => setFormData({ ...formData, uniformType: v })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Custom Description</label>
                  <input
                    value={formData.customDescription}
                    onChange={e => setFormData({ ...formData, customDescription: e.target.value })}
                    placeholder="e.g., White shirt with navy pants"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Notes</label>
                  <input
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button onClick={handleCreateSchedule} className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all">
                  Create Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}