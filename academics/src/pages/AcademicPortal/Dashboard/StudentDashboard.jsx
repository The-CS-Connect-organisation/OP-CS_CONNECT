import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, FileText, UserCheck } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#111111' }) => {
  const { playClick } = useSound();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="nova-card-stat p-6 cursor-pointer"
      onMouseEnter={playClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</span>
      {subtitle && (
        <span className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <span className="w-1 h-1 rounded-full" style={{ background: color }} />
          {subtitle}
        </span>
      )}
    </motion.div>
  );
};

export const StudentDashboard = ({ user }) => {
  const { playClick } = useSound();
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const { data: announcements, update: updateAnnouncement } = useStore(KEYS.ANNOUNCEMENTS, []);

  const myAssignments = assignments.filter(a => a.class === user.class);
  const pendingAssignments = myAssignments.filter(a => {
    const sub = a.submissions?.find(s => s.studentId === user.id);
    return !sub || sub.status === 'pending';
  });

  const myMarks = marks.filter(m => m.studentId === user.id);
  const avgMarks = myMarks.length > 0 ? Math.round(myMarks.reduce((a, b) => a + b.marksObtained, 0) / myMarks.length) : 0;

  const myAttendance = attendance.filter(a => a.studentId === user.id);
  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = timetable[user.class]?.find(t => t.day === today)?.slots || [];

  useEffect(() => {
    if (!user || announcements.length === 0) return;
    const toMark = announcements.filter(a => !(a.readBy || []).includes(user.id));
    if (toMark.length === 0) return;
    toMark.forEach(a => {
      updateAnnouncement(a.id, { readBy: [...(a.readBy || []), user.id] });
    });
  }, [announcements, user, updateAnnouncement]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-full rounded-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(255,107,157,0.06), transparent 60%)' }}
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(255,107,157,0.08)', color: '#ff6b9d', border: '1px solid rgba(255,107,157,0.20)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Student Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-9 rounded-full bg-black" />
            Welcome back, {user.name.split(' ')[0]} ✨
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {[`Class: ${user.class}`, `ID: ${user.admissionNo || user.rollNo}`, today].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Attendance" value={`${attendanceRate}%`} subtitle="Monthly average" delay={0.1} color="#10b981" />
        <StatCard icon={FileText} label="Pending Tasks" value={pendingAssignments.length} subtitle="Needs attention" delay={0.15} color="#f59e0b" />
        <StatCard icon={Award} label="Average Score" value={`${avgMarks}%`} subtitle="Performance" delay={0.2} color="#a855f7" />
        <StatCard icon={Clock} label="Classes Today" value={todaySchedule.length} subtitle="Scheduled" delay={0.25} color="#3b82f6" />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
            Today's Schedule
          </h3>
          {todaySchedule.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No classes scheduled 📅</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((slot, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl transition-colors"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                  <div className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold flex-shrink-0"
                    style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)' }}>
                    {slot.time.split(' ')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{slot.subject}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{slot.teacher} • Room {slot.room}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Assignments */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--semantic-warning)' }} />
            Pending Assignments
          </h3>
          {pendingAssignments.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>All caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingAssignments.map(a => {
                const isLate = new Date(a.dueDate) < new Date();
                return (
                  <div key={a.id} onMouseEnter={playClick}
                    className="p-3.5 rounded-xl transition-colors cursor-pointer"
                    style={{ 
                      background: isLate ? 'rgba(239,68,68,0.04)' : 'var(--bg-surface)',
                      border: `1px solid ${isLate ? 'rgba(239,68,68,0.15)' : 'var(--border-default)'}` 
                    }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.subject} • Due: {a.dueDate}</p>
                      </div>
                      {isLate && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--semantic-error)' }}
                        >Overdue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            Announcements
          </h3>
          <div className="space-y-3">
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} className="border-l-2 pl-3 py-1.5 transition-colors"
                style={{ borderColor: a.priority === 'high' ? 'var(--semantic-error)' : 'var(--border-strong)' }}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5`}
                    style={{ 
                      background: a.priority === 'high' ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.05)',
                      color: a.priority === 'high' ? 'var(--semantic-error)' : 'var(--text-muted)'
                    }}>
                    {a.priority} priority
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{a.date}</span>
                </div>
                <p className="text-sm leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>{a.title}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No announcements</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
