import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, CheckCircle, Clock, TrendingUp, Bell, BarChart3,
  MessageSquare, BookOpen, Zap, Calendar, Brain, ChevronRight,
  ArrowUpRight, AlertCircle, Award, Target
} from 'lucide-react';
import { request } from '../../utils/apiClient';
import { getFromStorage } from '../../data/schema';
import { Skeleton } from '../../components/ui/Skeleton';
import { teacherApi } from '../../services/apiDataLayer';

const ROUTE_MAP = {
  attendance: '/teacher/attendance',
  grading: '/teacher/submissions',
  analytics: '/teacher/analytics',
  progress: '/teacher/progress',
  messaging: '/teacher/messaging',
  notes: '/teacher/class-notes',
  notifications: '/teacher/notifications',
  reports: '/teacher/reports',
  insights: '/teacher/insights',
};

const StatCard = ({ icon: Icon, label, value, subtitle, delay, color = '#60a5fa', loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-2xl p-5 border border-slate-800/60 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 transition-all duration-300 hover:border-slate-700/80 hover:shadow-slate-900/30"
  >
    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/[0.02]" />
    <div className="relative flex items-start justify-between mb-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    {loading ? (
      <Skeleton className="h-10 w-20 mb-2" />
    ) : (
      <span className="text-3xl font-black tracking-tight text-white">{value ?? 0}</span>
    )}
    {subtitle && (
      <div className="flex items-center gap-2 mt-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[10px] text-slate-500">{subtitle}</span>
      </div>
    )}
  </motion.div>
);

const QuickActionButton = ({ icon: Icon, label, onClick, color = 'from-blue-600 to-sky-500', delay }) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group relative flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br text-white font-semibold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${color})`, boxShadow: `0 8px 32px -8px ${color.split(' ')[0]}40` }}
  >
    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
    <Icon size={22} className="relative z-10 mb-2 group-hover:scale-110 transition-transform" />
    <span className="relative z-10 text-xs text-center font-semibold tracking-wide">{label}</span>
    <ArrowUpRight size={14} className="absolute top-3 right-3 opacity-0 group-hover:opacity-70 transition-opacity" />
  </motion.button>
);

const PendingActionCard = ({ icon: Icon, title, count, color, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    onClick={onClick}
    className="cursor-pointer rounded-2xl border border-slate-800/60 bg-white/5 backdrop-blur-xl p-4 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:border-slate-700/80"
    style={{ borderLeft: `3px solid ${color}` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Click to view</p>
        </div>
      </div>
      <span className="text-2xl font-black" style={{ color }}>{count ?? 0}</span>
    </div>
  </motion.div>
);

function buildLocalDashboard(user) {
  const assignments = getFromStorage('sms_assignments', []);
  const submissions = getFromStorage('sms_submissions', []);
  const notes = getFromStorage('sms_notes', []);

  const myAssignments = assignments.filter(a => !user?.class || a.class === user.class);
  const pendingGrading = submissions.filter(s => s.status === 'submitted').length;
  const upcomingDeadlines = myAssignments
    .filter(a => a.dueDate && new Date(a.dueDate) >= new Date())
    .slice(0, 5)
    .map(a => ({ title: a.title, subject: a.subject, dueDate: a.dueDate, type: 'assignment' }));

  return {
    overview: {
      totalClasses: 4,
      totalStudents: 120,
      todayAttendance: 92,
      pendingGrading,
      unreadNotifications: 3,
      insightsCount: 2,
    },
    upcomingDeadlines,
    weeklyActivity: {
      assignmentsGraded: 12,
      attendanceMarked: 4,
      messagesSent: 8,
      notesCreated: 3,
    },
  };
}

export const TeacherDashboard = ({ user, addToast }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await request('/teacher/dashboard');
        if (!alive) return;
        const data = res?.data?.dashboard ?? res?.data ?? res ?? {};
        setDashboard(data);
      } catch (err) {
        if (!alive) return;
        const local = buildLocalDashboard(user);
        setDashboard(local);
        console.info('Teacher dashboard: using local demo data (API unavailable)');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  const overview = dashboard?.overview ?? {};
  const upcomingDeadlines = dashboard?.upcomingDeadlines ?? [];
  const weeklyActivity = dashboard?.weeklyActivity ?? {};

  const handleNavigate = (action) => {
    const route = ROUTE_MAP[action];
    if (route) navigate(route);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-8 relative overflow-hidden border border-slate-800/60 bg-gradient-to-br from-slate-900/80 to-slate-950/50 shadow-2xl shadow-black/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/15 to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 size={11} />
              {user?.department || 'Faculty'}
            </span>
            {(overview.unreadNotifications ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 ml-auto">
                <Bell size={11} />
                {overview.unreadNotifications} new
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 text-white mb-3">
            <span className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-sky-500" />
            Welcome back, {user?.name || 'Teacher'}
          </h1>
          <div className="flex flex-wrap gap-2 mt-4">
            {[`Department: ${user?.department || 'N/A'}`, `Subjects: ${Array.isArray(user?.subjects) ? user.subjects.join(', ') : (user?.subjects || 'N/A')}`].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard loading={loading} icon={Users} label="Total Classes" value={overview.totalClasses} subtitle="Active classes" delay={0.1} color="#60a5fa" />
        <StatCard loading={loading} icon={Users} label="Total Students" value={overview.totalStudents} subtitle="Enrolled" delay={0.15} color="#10b981" />
        <StatCard loading={loading} icon={CheckCircle} label="Today's Attendance" value={overview.todayAttendance != null ? `${overview.todayAttendance}%` : '—'} subtitle="Attendance rate" delay={0.2} color="#f59e0b" />
        <StatCard loading={loading} icon={Clock} label="Pending Grading" value={overview.pendingGrading} subtitle="Needs attention" delay={0.25} color="#a855f7" />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <QuickActionButton icon={CheckCircle} label="Mark Attendance" onClick={() => handleNavigate('attendance')} color="from-emerald-500 to-teal-500" delay={0.1} />
        <QuickActionButton icon={Zap} label="Grade Submissions" onClick={() => handleNavigate('grading')} color="from-amber-500 to-orange-500" delay={0.15} />
        <QuickActionButton icon={BarChart3} label="View Analytics" onClick={() => handleNavigate('analytics')} color="from-blue-500 to-sky-500" delay={0.2} />
        <QuickActionButton icon={TrendingUp} label="Student Progress" onClick={() => handleNavigate('progress')} color="from-violet-500 to-purple-500" delay={0.25} />
        <QuickActionButton icon={MessageSquare} label="Quick Message" onClick={() => handleNavigate('messaging')} color="from-pink-500 to-rose-500" delay={0.3} />
        <QuickActionButton icon={BookOpen} label="Class Notes" onClick={() => handleNavigate('notes')} color="from-indigo-500 to-blue-500" delay={0.35} />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <PendingActionCard
          icon={Clock}
          title="Pending Grading"
          count={overview.pendingGrading}
          color="#f59e0b"
          onClick={() => handleNavigate('grading')}
        />
        <PendingActionCard
          icon={Bell}
          title="Notifications"
          count={overview.unreadNotifications}
          color="#ef4444"
          onClick={() => handleNavigate('notifications')}
        />
        <PendingActionCard
          icon={Brain}
          title="AI Insights"
          count={overview.insightsCount ?? '→'}
          color="#8b5cf6"
          onClick={() => handleNavigate('insights')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-800/60 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-slate-400">
            <Calendar size={14} /> Upcoming Deadlines
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : upcomingDeadlines.length === 0 ? (
            <div className="py-12 border border-dashed rounded-xl flex items-center justify-center border-slate-700/40">
              <p className="text-xs text-slate-500">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingDeadlines.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-[10px] mt-0.5 text-slate-500">{item.subject || item.type}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 ml-3 flex-shrink-0">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Soon'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-slate-800/60 bg-white/5 backdrop-blur-xl p-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-slate-400">
            <FileText size={14} /> Weekly Activity
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Assignments Graded', value: weeklyActivity.assignmentsGraded ?? 0, color: '#10b981' },
                { label: 'Attendance Marked', value: weeklyActivity.attendanceMarked ?? 0, color: '#60a5fa' },
                { label: 'Messages Sent', value: weeklyActivity.messagesSent ?? 0, color: '#f59e0b' },
                { label: 'Notes Created', value: weeklyActivity.notesCreated ?? 0, color: '#8b5cf6' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <p className="text-sm font-medium text-slate-300">{item.label}</p>
                  <span className="text-base font-black" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};