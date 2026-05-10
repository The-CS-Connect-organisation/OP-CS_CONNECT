import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight, Users, Zap, Clock, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { teacherApi } from '../../services/apiDataLayer';
import { useSound } from '../../hooks/useSound';

export const MarkAttendance = ({ user, addToast }) => {
  const { playClick, playBlip, playSwitch } = useSound();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [marks, setMarks] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusConfig = {
    present: { icon: Check, color: 'text-slate-400', activeColor: 'bg-emerald-600 text-white shadow-emerald-600/20', label: 'Present' },
    late: { icon: Clock, color: 'text-slate-400', activeColor: 'bg-amber-500 text-white shadow-amber-500/20', label: 'Late' },
    absent: { icon: X, color: 'text-slate-400', activeColor: 'bg-rose-600 text-white shadow-rose-600/20', label: 'Absent' },
  };

  // Load attendance data when class or date changes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Use direct request instead of teacherApi wrapper to avoid double .data
        const { request } = await import('../../utils/apiClient');
        const res = await request(`/teacher/attendance/class/${selectedClass}?date=${selectedDate}`);
        if (!alive) return;
        const studentList = res?.students ?? res?.data?.students ?? [];
        const existingAttendance = res?.attendance ?? res?.data?.attendance ?? [];

        setStudents(studentList);

        // Pre-fill marks from existing attendance
        const initialMarks = {};
        existingAttendance.forEach(entry => {
          initialMarks[entry.studentId || entry.student_id] = entry.status;
        });
        // Default unmarked students to 'present'
        studentList.forEach(s => {
          if (!initialMarks[s._id ?? s.id]) {
            initialMarks[s._id ?? s.id] = 'present';
          }
        });
        setMarks(initialMarks);
      } catch (err) {
        if (!alive) return;
        addToast?.('Failed to load attendance data', 'error');
        setStudents([]);
        setMarks({});
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedClass, selectedDate]);

  const daySummary = useMemo(() => {
    const map = { present: 0, late: 0, absent: 0, none: 0 };
    students.forEach(s => {
      const id = s._id ?? s.id;
      const status = marks[id] ?? 'none';
      if (map[status] !== undefined) map[status]++;
      else map.none++;
    });
    return map;
  }, [students, marks]);

  const handleMark = (studentId, status) => {
    playSwitch();
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    playBlip();
    try {
      setSubmitting(true);
      const entries = students.map(s => {
        const id = s._id ?? s.id;
        return { studentId: id, status: marks[id] || 'present', notes: '' };
      });
      await teacherApi.markAttendance(selectedClass, selectedDate, entries);
      addToast?.(`Attendance saved for ${selectedClass} - ${selectedDate}`, 'success');
    } catch (err) {
      addToast?.(err?.message || 'Failed to save attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const monthDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const first = new Date(year, month, 1);
    const firstWeekday = first.getDay();
    const startDate = new Date(year, month, 1 - firstWeekday);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [visibleMonth]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
            Student Records
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Enabled
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 flex items-center gap-4">
          <Users className="text-slate-300" size={40} />
          Mark Attendance
        </h1>
      </motion.div>

      <Card className="flex flex-col md:flex-row gap-6 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => { playClick(); setSelectedDate(e.target.value); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Class</label>
          <select
            value={selectedClass}
            onChange={e => { playClick(); setSelectedClass(e.target.value); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-900 focus:bg-white transition-all min-w-[140px]"
          >
            <option value="10-A">10-A</option>
            <option value="10-B">10-B</option>
            <option value="11-A">11-A</option>
            <option value="11-B">11-B</option>
          </select>
        </div>
        <div className="flex-1" />
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={submitting || loading}
          className="bg-slate-900 hover:bg-slate-800 text-white min-w-[200px] rounded-2xl h-12 shadow-xl shadow-slate-900/10 self-center"
          icon={Zap}
        >
          {submitting ? 'Saving...' : 'Publish Records'}
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)); }}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)); }}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-[9px] font-bold text-slate-400 uppercase text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dObj) => {
                const dateStr = dObj.toISOString().split('T')[0];
                const isCurrentMonth = dObj.getMonth() === visibleMonth.getMonth();
                const isSelected = dateStr === selectedDate;

                return (
                  <button
                    key={dateStr}
                    onClick={() => { playClick(); setSelectedDate(dateStr); }}
                    className={`aspect-square rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 border ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                        : isCurrentMonth
                          ? 'border-transparent text-slate-600 hover:bg-slate-50'
                          : 'border-transparent opacity-20'
                    }`}
                  >
                    <span>{dObj.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-6">Daily Summary</h4>
            <div className="space-y-5">
              {[
                { label: 'Present', count: daySummary.present, color: 'text-emerald-600' },
                { label: 'Late', count: daySummary.late, color: 'text-amber-600' },
                { label: 'Absent', count: daySummary.absent, color: 'text-rose-600' },
                { label: 'Unmarked', count: daySummary.none, color: 'text-slate-400' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                  <span className={`text-xl font-bold ${item.color}`}>{String(item.count).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Student List */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading students...</p>
              </motion.div>
            ) : students.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No students found in {selectedClass}</p>
              </motion.div>
            ) : (
              students.map((student, idx) => {
                const id = student._id ?? student.id;
                const current = marks[id] || 'present';
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      className="flex items-center gap-6 p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all rounded-3xl group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {student.rollNo || student.rollNumber || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-900 truncate">{student.name}</h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">ID: {id}</p>
                      </div>

                      <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const Icon = config.icon;
                          const isActive = current === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleMark(id, status)}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? `${config.activeColor} shadow-lg scale-110`
                                  : `${config.color} hover:bg-white hover:text-slate-900`
                              }`}
                              title={config.label}
                            >
                              <Icon size={18} />
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
