import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, BookOpen, Plus, X, Loader2, Save, Trash2, RotateCcw } from 'lucide-react';
import { request } from '../../utils/apiClient';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { label: 'Period 1', time: '08:00 - 08:45' },
  { label: 'Period 2', time: '08:45 - 09:30' },
  { label: 'Period 3', time: '09:30 - 10:15' },
  { label: 'Break',     time: '10:15 - 10:30' },
  { label: 'Period 4', time: '10:30 - 11:15' },
  { label: 'Period 5', time: '11:15 - 12:00' },
  { label: 'Lunch',    time: '12:00 - 12:45' },
  { label: 'Period 6', time: '12:45 - 13:30' },
  { label: 'Period 7', time: '13:30 - 14:15' },
];

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
  'Biology', 'History', 'Geography', 'Computer Science', 'Physical Education',
  'Art', 'Music', 'Environmental Studies', 'Hindi', 'French',
];

const TEACHERS_PRESET = [
  'Sarah Wilson', 'John Smith', 'Emily Brown', 'Michael Lee',
  'David Chen', 'Alex Kim', 'Lisa Wang', 'Rajesh Kumar',
];

const AdminTimetable = ({ user, addToast }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetableEntries, setTimetableEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editCell, setEditCell] = useState(null); // { day, period }
  const [cellData, setCellData] = useState({ subject: '', teacher: '', room: '' });

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoading(true);
        const res = await request('/school/classes');
        const list = res?.classes || res?.items || res || [];
        setClasses(list);
        if (list.length > 0 && !selectedClass) {
          setSelectedClass(list[0].id || list[0].class_id || list[0]);
        }
      } catch (e) {
        console.error('Failed to load classes', e);
        addToast?.('Failed to load classes', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  // Load timetable entries when class changes
  useEffect(() => {
    if (!selectedClass) return;
    let alive = true;
    const loadEntries = async () => {
      try {
        setLoadingEntries(true);
        const res = await request(`/school/timetables?classId=${encodeURIComponent(selectedClass)}`);
        const raw = res?.timetable || res?.data?.timetable || res?.entries || res?.data?.entries || [];
        const entries = Array.isArray(raw) ? raw : [];
        if (!alive) return;
        // Index by day|period
        const map = {};
        entries.forEach(e => { map[`${e.day}|${e.period}`] = e; });
        setTimetableEntries(map);
        setHasChanges(false);
      } catch (e) {
        console.error('Failed to load timetable entries', e);
        if (!alive) return;
        setTimetableEntries({});
      } finally {
        if (alive) setLoadingEntries(false);
      }
    };
    loadEntries();
    return () => { alive = false; };
  }, [selectedClass]);

  const handleCellClick = useCallback((day, period) => {
    const existing = timetableEntries[`${day}|${period}`] || {};
    setCellData({ subject: existing.subject || '', teacher: existing.teacher || '', room: existing.room || '' });
    setEditCell({ day, period });
  }, [timetableEntries]);

  const handleCellSave = useCallback(() => {
    if (!editCell) return;
    setTimetableEntries(prev => ({
      ...prev,
      [`${editCell.day}|${editCell.period}`]: {
        day: editCell.day,
        period: editCell.period,
        subject: cellData.subject,
        teacher: cellData.teacher,
        room: cellData.room,
        time: PERIODS.find(p => p.label === editCell.period)?.time || '',
      },
    }));
    setHasChanges(true);
    setEditCell(null);
  }, [editCell, cellData]);

  const handleCellDelete = useCallback((day, period) => {
    setTimetableEntries(prev => {
      const next = { ...prev };
      delete next[`${day}|${period}`];
      return next;
    });
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!selectedClass) return;
    try {
      setSaving(true);
      const entries = Object.values(timetableEntries).filter(e => e.subject);
      await request('/school/timetables', {
        method: 'PUT',
        body: JSON.stringify({ classId: selectedClass, entries }),
      });
      setHasChanges(false);
      addToast?.('Timetable saved successfully', 'success');
    } catch (e) {
      addToast?.('Failed to save timetable: ' + (e.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTimetableEntries({});
    setHasChanges(true);
  };

  const subjectColor = (subject) => {
    const colors = {
      Mathematics: 'from-pink-500/10 to-pink-500/5 border-pink-200',
      English: 'from-amber-500/10 to-amber-500/5 border-amber-200',
      Science: 'from-violet-500/10 to-violet-500/5 border-violet-200',
      Physics: 'from-purple-500/10 to-purple-500/5 border-purple-200',
      Chemistry: 'from-blue-500/10 to-blue-500/5 border-blue-200',
      Biology: 'from-emerald-500/10 to-emerald-500/5 border-emerald-200',
      History: 'from-rose-500/10 to-rose-500/5 border-rose-200',
      Geography: 'from-green-500/10 to-green-500/5 border-green-200',
      'Computer Science': 'from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-200',
      'Physical Education': 'from-red-500/10 to-red-500/5 border-red-200',
      Art: 'from-orange-500/10 to-orange-500/5 border-orange-200',
      Music: 'from-cyan-500/10 to-cyan-500/5 border-cyan-200',
    };
    return colors[subject] || 'from-gray-500/10 to-gray-500/5 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Timetable Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage class schedules across all days</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {hasChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700"
            >
              Unsaved changes
            </motion.span>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <RotateCcw size={14} /> Clear All
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-all"
            style={{ background: saving ? '#888' : 'var(--primary)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Timetable'}
          </button>
        </div>
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border-color)' }}>
        <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Select Class</label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="animate-spin" /> Loading classes...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classes.map(cls => {
              const id = cls.id || cls.class_id || cls;
              const name = cls.name || cls.class_name || cls.grade || id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedClass(id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedClass === id
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Timetable grid */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        {loadingEntries ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 size={20} className="animate-spin" style={{ color: '#ea580c' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading timetable...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider w-44"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="text-center py-3 px-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period, pIdx) => (
                  <tr key={period.label}
                    className={pIdx % 2 === 0 ? '' : ''}
                    style={{ background: pIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}
                  >
                    <td className="py-3 px-4 w-44">
                      <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{period.label}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{period.time}</div>
                    </td>
                    {DAYS.map(day => {
                      const key = `${day}|${period.label}`;
                      const entry = timetableEntries[key];
                      return (
                        <td key={day} className="py-2 px-2">
                          {entry?.subject ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`p-3 rounded-xl bg-gradient-to-br border text-xs cursor-pointer hover:shadow-md transition-all relative group ${subjectColor(entry.subject)}`}
                              onClick={() => handleCellClick(day, period.label)}
                            >
                              <div className="font-bold text-gray-900 mb-1 leading-tight">{entry.subject}</div>
                              <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{entry.teacher || '—'}</div>
                              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Room {entry.room || '—'}</div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCellDelete(day, period.label); }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => handleCellClick(day, period.label)}
                              className="w-full min-h-[80px] rounded-xl border-2 border-dashed flex items-center justify-center hover:border-orange-300 hover:bg-orange-50/30 transition-all"
                              style={{ borderColor: 'var(--border-color)' }}
                            >
                              <Plus size={14} className="text-gray-300" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cell editor modal */}
      <AnimatePresence>
        {editCell && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setEditCell(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Edit Slot</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {editCell.day} — {editCell.period}
                  </p>
                </div>
                <button onClick={() => setEditCell(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X size={18} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Subject</label>
                  <select
                    value={cellData.subject}
                    onChange={e => setCellData(d => ({ ...d, subject: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  >
                    <option value="">— Select subject —</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Teacher</label>
                  <input
                    type="text"
                    value={cellData.teacher}
                    onChange={e => setCellData(d => ({ ...d, teacher: e.target.value }))}
                    list="teacher-presets"
                    placeholder="Teacher name"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  />
                  <datalist id="teacher-presets">
                    {TEACHERS_PRESET.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Room</label>
                  <input
                    type="text"
                    value={cellData.room}
                    onChange={e => setCellData(d => ({ ...d, room: e.target.value }))}
                    placeholder="Room number"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditCell(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCellSave}
                  className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-105"
                  style={{ background: '#ea580c' }}
                >
                  {cellData.subject ? 'Save Slot' : 'Clear Slot'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTimetable;
