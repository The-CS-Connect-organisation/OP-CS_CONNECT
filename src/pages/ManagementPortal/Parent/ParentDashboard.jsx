import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Award, Bell, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';
import { MessageDock } from '@/components/ui/MessageDock';

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

export const ParentDashboard = ({ user }) => {
  const { playClick } = useSound();
  const { data: students } = useStore(KEYS.STUDENTS, []);
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: announcements } = useStore(KEYS.ANNOUNCEMENTS, []);

  // In a real app, we'd filter by user.childrenIds
  // For seeding demo, we'll pick the first child linked to this parent or just the first student
  const myChildren = useMemo(() => {
    return students.filter(s => s.parentId === user.id || s.id === user.childId);
  }, [students, user]);

  const activeChild = myChildren[0] || students[0];

  const childMarks = useMemo(() => {
    if (!activeChild) return [];
    return marks.filter(m => m.studentId === activeChild.id);
  }, [marks, activeChild]);

  const avgMarks = useMemo(() => {
    if (childMarks.length === 0) return 0;
    return Math.round(childMarks.reduce((a, b) => a + b.marksObtained, 0) / childMarks.length);
  }, [childMarks]);

  const childAttendance = useMemo(() => {
    if (!activeChild) return [];
    return attendance.filter(a => a.studentId === activeChild.id);
  }, [attendance, activeChild]);

  const attendanceRate = useMemo(() => {
    if (childAttendance.length === 0) return 0;
    const present = childAttendance.filter(a => a.status === 'present').length;
    return Math.round((present / childAttendance.length) * 100);
  }, [childAttendance]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-full rounded-xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.06), transparent 60%)' }}
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.20)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Parent Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 mb-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-9 rounded-full bg-indigo-600" />
            Hello, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Monitoring progress for <span className="text-indigo-600 font-bold">{activeChild?.name || 'your children'}</span>
          </p>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Children enrolled" value={myChildren.length || 1} subtitle="Linked to account" delay={0.1} color="#a855f7" />
        <StatCard icon={UserCheck} label="Daily Attendance" value={`${attendanceRate}%`} subtitle="Last 30 days" delay={0.15} color="#10b981" />
        <StatCard icon={Award} label="Avg Performance" value={`${avgMarks}%`} subtitle="Academic Year" delay={0.2} color="#3b82f6" />
        <StatCard icon={TrendingUp} label="Progress Rank" value="Top 15%" subtitle="Class Percentile" delay={0.25} color="#ec4899" />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Academic Performance */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
              Academic Performance
            </h3>
            <button className="text-xs font-bold flex items-center gap-1 text-indigo-600 hover:gap-2 transition-all">
              View Detailed Report <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {childMarks.length === 0 ? (
              <div className="py-12 border border-dashed rounded-xl flex items-center justify-center" style={{ borderColor: 'var(--border-default)' }}>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No grade reports available yet 📚</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childMarks.slice(0, 4).map((mark, idx) => (
                  <div key={idx} className="p-4 rounded-xl flex items-center justify-between"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{mark.subject}</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{mark.marksObtained}/{mark.totalMarks}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-mono font-bold" style={{ color: mark.marksObtained > 75 ? '#10b981' : '#f59e0b' }}>
                        {mark.grade || 'A'}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{mark.examType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Announcements */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff6b9d' }} />
            School Notices
          </h3>
          <div className="space-y-4">
            {announcements.slice(0, 3).map(a => (
              <div key={a.id} className="relative pl-4 pb-4 border-l transition-colors"
                style={{ borderColor: 'var(--border-default)' }}
              >
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-dim)' }}>{a.date}</span>
                  {a.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-600">Urgent</span>
                  )}
                </div>
                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{a.content}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text-dim)' }}>No new notices 🔔</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Events/Schedule */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
           <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
            Academic Calendar
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Parent-Teacher Meet', date: 'April 20, 2026', type: 'Meeting' },
              { title: 'Annual Sports Day', date: 'May 05, 2026', type: 'Event' },
              { title: 'Summer Vacation Starts', date: 'June 01, 2026', type: 'Holiday' }
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/03 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" 
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                  <Calendar size={18} style={{ color: '#10b981' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{event.date} • {event.type}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* MessageDock floating widget */}
      <MessageDock
        user={user}
        position="bottom"
        theme="dark"
      />
    </div>
  );
};
