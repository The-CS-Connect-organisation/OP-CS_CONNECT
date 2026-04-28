import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight, Activity, Calendar, Users, Zap, Clock, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

export const MarkAttendance = ({ user, addToast }) => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance, add, update } = useStore(KEYS.ATTENDANCE, []);
  const { playClick, playBlip, playSwitch } = useSound();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [marks, setMarks] = useState({});

  const students = useMemo(
    () => users.filter(u => u.role === 'student' && u.class === selectedClass),
    [users, selectedClass]
  );

  const subjects = user.subjects || ['General'];

  const statusConfig = {
    present: { icon: Check, color: 'text-slate-400', activeColor: 'bg-emerald-600 text-white shadow-emerald-600/20', label: 'Present' },
    late: { icon: Clock, color: 'text-slate-400', activeColor: 'bg-amber-500 text-white shadow-amber-500/20', label: 'Late' },
    absent: { icon: X, color: 'text-slate-400', activeColor: 'bg-rose-600 text-white shadow-rose-600/20', label: 'Absent' },
  };

  const getAggregatedStatusForStudent = (studentId, date) => {
    const recs = attendance.filter(a => a.studentId === studentId && a.date === date);
    if (recs.length === 0) return 'none';
    const statuses = recs.map(r => r.status);
    if (statuses.includes('absent')) return 'absent';
    if (statuses.includes('late')) return 'late';
    if (statuses.includes('present')) return 'present';
    return 'none';
  };

  const daySummary = useMemo(() => {
    const map = { present: [], late: [], absent: [], none: [] };
    for (const s of students) {
      const status = getAggregatedStatusForStudent(s.id, selectedDate);
      map[status]?.push(s);
    }
    return map;
  }, [students, attendance, selectedDate]);

  useEffect(() => {
    const next = {};
    for (const s of students) {
      const status = getAggregatedStatusForStudent(s.id, selectedDate);
      if (status !== 'none') next[s.id] = status;
    }
    setMarks(next);
  }, [selectedDate, selectedClass, students]);

  const handleMark = (studentId, status) => {
    playSwitch();
    setMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    playBlip();
    let changedCount = 0;
    for (const subject of subjects) {
      for (const student of students) {
        const status = marks[student.id] || 'present';
        const existing = attendance.find(
          a => a.studentId === student.id && a.date === selectedDate && a.subject === subject
        );
        const payload = { studentId: student.id, date: selectedDate, subject, status };
        if (existing) {
          update(existing.id, payload);
        } else {
          add({ id: `att-${student.id}-${selectedDate}-${subject}-${Date.now()}`, ...payload });
        }
        changedCount++;
      }
    }
    addToast?.(`Attendance saved for ${selectedClass} - ${selectedDate}`, 'success');
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

  const getDayIndicator = (dateObj) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const studentsIds = new Set(students.map(s => s.id));
    const recs = attendance.filter(a => a.date === dateStr && studentsIds.has(a.studentId));
    if (recs.length === 0) return null;
    return true;
  };

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
          <input type="date" value={selectedDate} onChange={e => { playClick(); setSelectedDate(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-900 focus:bg-white transition-all" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Class</label>
          <select value={selectedClass} onChange={e => { playClick(); setSelectedClass(e.target.value); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-slate-900 focus:bg-white transition-all min-w-[140px]">
            <option value="10-A">10-A</option>
            <option value="10-B">10-B</option>
          </select>
        </div>
        <div className="flex-1" />
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          className="bg-slate-900 hover:bg-slate-800 text-white min-w-[200px] rounded-2xl h-12 shadow-xl shadow-slate-900/10 self-center" 
          icon={Zap}
        >
          Publish Records
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
                <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() - 1))); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() + 1))); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-[9px] font-bold text-slate-400 uppercase text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dObj) => {
                const dateStr = dObj.toISOString().split('T')[0];
                const isCurrentMonth = dObj.getMonth() === visibleMonth.getMonth();
                const isSelected = dateStr === selectedDate;
                const hasData = getDayIndicator(dObj);

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
                    {hasData && !isSelected && <div className="h-1 w-1 rounded-full bg-slate-900" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-8 bg-slate-50 border border-slate-200 rounded-3xl">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-6">Daily Summary</h4>
            <div className="space-y-5">
               {[
                 { label: 'Present', count: daySummary.present.length, color: 'text-emerald-600' },
                 { label: 'Late', count: daySummary.late.length, color: 'text-amber-600' },
                 { label: 'Absent', count: daySummary.absent.length, color: 'text-rose-600' },
                 { label: 'Unmarked', count: daySummary.none.length, color: 'text-slate-400' }
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
            {students.length === 0 ? (
              <div className="py-24 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
                <Search size={40} className="mx-auto mb-4 text-slate-200" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No students found in {selectedClass}</p>
              </div>
            ) : (
              students.map((student, idx) => {
                const current = marks[student.id] || 'present';
                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card 
                      className="flex items-center gap-6 p-4 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all rounded-3xl group"
                      onMouseEnter={playClick}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        {student.rollNo || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-900 truncate">{student.name}</h4>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-0.5">ID: {student.id}</p>
                      </div>
                      
                      <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const Icon = config.icon;
                          const isActive = current === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleMark(student.id, status)}
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
