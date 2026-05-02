import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Check, X, Minus, ChevronLeft, ChevronRight, Terminal, Activity, Calendar, Users, Zap, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

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
    present: { icon: Check, color: 'text-[var(--text-muted)]', activeColor: 'bg-zinc-100 text-black', label: 'P' },
    late: { icon: Clock, color: 'text-[var(--text-muted)]', activeColor: 'bg-white/[0.06] text-[var(--text-muted)] border-white/12', label: 'L' },
    absent: { icon: X, color: 'text-[var(--text-muted)]', activeColor: 'bg-white text-[var(--text-primary)]', label: 'A' },
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
  }, [selectedDate, selectedClass]);

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
    addToast?.(`Registry Synchronized: ${selectedClass} | ${selectedDate}.`, 'success');
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
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Overview
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className="animate-pulse" /> Live_Sync
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <CheckSquare className="text-[var(--text-muted)]" size={48} />
           Attendance
        </h1>
      </motion.div>

      {/* Control Strip */}
      <Card className="flex flex-col md:flex-row gap-6 p-6 border-[var(--border-default)] bg-nova-base/50 backdrop-blur-xl">
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest block">Reference_Date</label>
          <input type="date" value={selectedDate} onChange={e => { playClick(); setSelectedDate(e.target.value); }} className="input-field max-w-[200px] font-mono" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest block">Cluster_ID</label>
          <select value={selectedClass} onChange={e => { playClick(); setSelectedClass(e.target.value); }} className="input-field min-w-[140px] font-mono">
            <option value="10-A" className="bg-nova-base">10-A</option>
            <option value="10-B" className="bg-nova-base">10-B</option>
          </select>
        </div>
        <div className="flex-1" />
        <Button variant="primary" onClick={handleSubmit} className="shadow-[0_0_20px_rgba(255,255,255,0.3)] min-w-[200px]" icon={Zap}>
          Synchronize_Data
        </Button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                {visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() - 1))); }} className="p-2 border border-[var(--border-default)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-white/15 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => { playClick(); setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() + 1))); }} className="p-2 border border-[var(--border-default)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-white/15 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-[10px] font-mono text-[var(--text-muted)] uppercase text-center font-bold">
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
                    className={`aspect-square rounded-md text-[10px] font-mono transition-all flex flex-col items-center justify-center gap-1 border ${
                      isSelected 
                        ? 'border-white/25 bg-white/[0.06] text-[var(--text-muted)] shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                        : isCurrentMonth 
                          ? 'border-[var(--border-default)] hover:border-white/15 text-[var(--text-muted)]' 
                          : 'border-transparent opacity-20'
                    }`}
                  >
                    <span>{dObj.getDate()}</span>
                    {hasData && <div className="h-1 w-1 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 border-[var(--border-default)] bg-nova-base/30">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest mb-4">Summary_Telemetry</h4>
            <div className="space-y-4">
               {[
                 { label: 'Present', count: daySummary.present.length, color: 'text-[var(--text-primary)]' },
                 { label: 'Late', count: daySummary.late.length, color: 'text-rose-400' },
                 { label: 'Absent', count: daySummary.absent.length, color: 'text-[var(--text-muted)]' },
                 { label: 'Pending', count: daySummary.none.length, color: 'text-[var(--text-muted)]' }
               ].map(item => (
                 <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{item.label}</span>
                    <span className={`text-xl font-bold font-mono ${item.color}`}>{String(item.count).padStart(2, '0')}</span>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {students.map((student, idx) => {
              const current = marks[student.id] || 'present';
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="flex items-center gap-6 p-4 border-[var(--border-default)] hover:border-slate-600/30 transition-all duration-300 relative overflow-hidden group"
                    onMouseEnter={playClick}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] font-mono font-bold group-hover:border-white/12 transition-all">
                      {student.rollNo?.slice(-2) || '??'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wide group-hover:text-[var(--text-muted)] transition-colors">{student.name}</h4>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">ID: {student.id.slice(-8)}</p>
                    </div>
                    
                    <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const Icon = config.icon;
                        const isActive = current === status;
                        return (
                          <button
                            key={status}
                            onClick={() => handleMark(student.id, status)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isActive 
                                ? `${config.activeColor} shadow-lg scale-110` 
                                : `${config.color} hover:bg-[var(--bg-floating)]`
                            }`}
                            title={status.toUpperCase()}
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

