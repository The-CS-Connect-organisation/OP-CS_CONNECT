import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Calendar, Clock, FileText, Brain, CheckCircle2, AlertCircle, ChevronRight, Target, Zap } from 'lucide-react';
import { getFromStorage } from '../../../../data/schema';
import { useSound } from '../../../../hooks/useSound';

const AI_TIPS = [
  "Math tip: Practice algebraic equations daily — just 20 minutes builds pattern recognition faster than cramming.",
  "Physics insight: Draw free-body diagrams for every mechanics problem. Visual memory beats memorizing formulas.",
  "Chemistry hack: Memorize the periodic table in groups of 3-4 elements daily using mnemonic stories.",
  "Biology tip: Draw diagrams from memory, then compare. The act of drawing burns concepts into long-term memory.",
  "English: Read one paragraph out loud daily. Reading fluency directly improves comprehension scores.",
  "Focus tip: Use the Pomodoro technique — 25 min study, 5 min break. Your brain consolidates memory during breaks.",
];

export const DailyBriefing = ({ user, addToast }) => {
  const { playClick, playBlip } = useSound();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    setAssignments(getFromStorage('sms_assignments', []));
    setExams(getFromStorage('sms_exams', []));
    setTimetable(getFromStorage('sms_timetable', []));
    setAttendance(getFromStorage('sms_attendance', []));
  }, []);

  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todaySlots = timetable[user?.class]?.find(t => t.day === todayDay)?.slots || [];

  const pendingAssignments = assignments.filter(a => a.status === 'active' && new Date(a.dueDate) >= new Date()).slice(0, 4);
  const upcomingExams = exams.filter(e => e.status === 'scheduled' && new Date(e.date) >= new Date()).slice(0, 3);

  const thisWeekAttend = attendance.slice(0, 7);
  const presentCount = thisWeekAttend.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = thisWeekAttend.length > 0 ? Math.round((presentCount / thisWeekAttend.length) * 100) : 100;

  const aiTip = AI_TIPS[today.getDay() % AI_TIPS.length];

  return (
    <div className="max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 4px 14px rgba(234,88,12,0.35)' }}>
            <Sunrise size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm font-medium" style={{ color: '#a8a29e' }}>{dateStr}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's classes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="nova-card p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={16} style={{ color: '#ea580c' }} /> Today's Classes
            </h3>
            {todaySlots.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: '#a8a29e' }}>No classes scheduled today</p>
            ) : (
              <div className="space-y-2.5">
                {todaySlots.map((slot, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 rounded-xl border"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <div className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0"
                      style={{ background: '#ea580c15', color: '#ea580c' }}>
                      {slot.time?.split(' ')[0] || '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{slot.subject}</p>
                      <p className="text-[10px]" style={{ color: '#a8a29e' }}>{slot.teacher} • Room {slot.room}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pending assignments + upcoming exams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="nova-card p-6">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                <AlertCircle size={16} style={{ color: '#f59e0b' }} /> Pending Work
              </h3>
              {pendingAssignments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: '#10b981' }} />
                  <p className="text-xs font-medium" style={{ color: '#10b981' }}>All caught up!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingAssignments.map(a => (
                    <div key={a.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                      <p className="text-[10px]" style={{ color: '#a8a29e' }}>{a.subject} • Due {a.dueDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="nova-card p-6">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
                <FileText size={16} style={{ color: '#ef4444' }} /> Upcoming Exams
              </h3>
              {upcomingExams.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: '#a8a29e' }}>No upcoming exams</p>
              ) : (
                <div className="space-y-2">
                  {upcomingExams.map(e => (
                    <div key={e.id} className="p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{e.name}</p>
                      <p className="text-[10px]" style={{ color: '#a8a29e' }}>{e.subject} • {e.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* AI Coach tip */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="nova-card p-6"
            style={{ background: 'linear-gradient(135deg, #fff7ed, #fff)', border: '1px solid rgba(234,88,12,0.15)' }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#ea580c', boxShadow: '0 4px 12px rgba(234,88,12,0.35)' }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#ea580c' }}>AI Study Coach</p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{aiTip}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Quick stats */}
        <div className="space-y-6">
          {/* Attendance */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
            className="nova-card p-6">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} /> Attendance This Week
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${attendanceRate} 100`} strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{attendanceRate}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#a8a29e' }}>{presentCount}/{thisWeekAttend.length} days present</p>
                <p className="text-[10px] mt-1" style={{ color: attendanceRate >= 75 ? '#10b981' : '#ef4444' }}>
                  {attendanceRate >= 75 ? 'Above threshold' : 'Below 75% - attend all classes!'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
            className="nova-card p-6">
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { icon: Target, label: 'Study Planner', route: '/student/planner', color: '#ea580c' },
                { icon: Zap, label: 'Focus Mode', route: '/student/focus', color: '#8b5cf6' },
                { icon: Calendar, label: 'CS Calendar', route: '/student/calendar', color: '#3b82f6' },
              ].map(item => (
                <button key={item.route} onClick={() => window.location.href = item.route}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-sm"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <span className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    <item.icon size={16} style={{ color: item.color }} /> {item.label}
                  </span>
                  <ChevronRight size={14} style={{ color: '#a8a29e' }} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Date widget */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}
            className="nova-card p-6 text-center">
            <div className="text-5xl font-black tracking-tighter" style={{ color: '#ea580c', lineHeight: 1 }}>{today.getDate()}</div>
            <div className="text-sm font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{today.toLocaleDateString('en-US', { month: 'long' })}</div>
            <div className="text-xs" style={{ color: '#a8a29e' }}>{today.toLocaleDateString('en-US', { year: 'numeric' })}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};