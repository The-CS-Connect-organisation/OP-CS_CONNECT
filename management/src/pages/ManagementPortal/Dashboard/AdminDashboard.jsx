import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, TrendingUp, Bell, Calendar, BarChart3,
  CreditCard, UserPlus2, Activity, AlertTriangle, Zap
} from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const QUICK_ACTIONS = [
  { label: 'Register User', icon: UserPlus2, path: '/admin/users', color: '#111111' },
  { label: 'Process Fees', icon: CreditCard, path: '/admin/fees', color: '#3b82f6' },
  { label: 'Announcement', icon: Bell, path: '/admin/announcements', color: '#a855f7' },
  { label: 'View Reports', icon: BarChart3, path: '/admin/analytics', color: '#10b981' },
];

/* ── Animated Counter ── */
const useAnimatedCount = (target, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return count;
};

/* ── Live Clock ── */
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, delay, color = '#111111' }) => {
  const numericValue = typeof value === 'number' ? value : null;
  const animatedCount = useAnimatedCount(numericValue || 0);
  const displayValue = numericValue !== null ? animatedCount : value;
  const { playClick } = useSound();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring', stiffness: 200, damping: 22 }}
      className="nova-card-stat p-6 cursor-pointer group"
      onMouseEnter={playClick}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {displayValue}
      </span>
    </motion.div>
  );
};

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl border"
      style={{ 
        background: '#ffffff', 
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || 'var(--text-primary)' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const CHART_COLORS = ['#111111', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];

/* ── MAIN COMPONENT ── */
export const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { playClick, playBlip } = useSound();
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: assignments } = useStore(KEYS.ASSIGNMENTS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { data: marks } = useStore(KEYS.MARKS, []);
  const { data: fees } = useStore(KEYS.FEES, []);
  const { data: announcements } = useStore(KEYS.ANNOUNCEMENTS, []);

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const overallAttendanceRate = attendance.length > 0 ? Math.round(
    (attendance.filter(a => a.status === 'present').length / Math.max(attendance.length, 1)) * 100
  ) : 0;
  const paidFees = fees.filter(f => String(f.status).toLowerCase() === 'paid').reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const classes = Array.from(new Set(students.map(s => s.class).filter(Boolean)));
  const classAttendance = classes.map(cls => {
    const classStudents = students.filter(s => s.class === cls);
    const classData = attendance.filter(a => classStudents.some(s => s.id === a.studentId));
    const present = classData.filter(a => a.status === 'present').length;
    const rate = classData.length > 0 ? Math.round((present / classData.length) * 100) : 0;
    return { class: cls, attendance: rate };
  });

  const gradeDist = marks.reduce((acc, m) => {
    acc[m.grade] = (acc[m.grade] || 0) + 1;
    return acc;
  }, {});
  const gradePieData = Object.entries(gradeDist).map(([name, value]) => ({ name, value }));

  const admissionsTrend = useMemo(() => {
    const monthMap = {};
    students.forEach(s => {
      const month = (s.joined || '').slice(0, 7) || 'Unknown';
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }));
  }, [students]);

  const lowAttendanceStudents = students
    .map(s => {
      const entries = attendance.filter(a => a.studentId === s.id);
      const rate = entries.length
        ? Math.round((entries.filter(a => a.status === 'present').length / entries.length) * 100)
        : 100;
      return { ...s, rate };
    })
    .filter(s => s.rate < 75)
    .slice(0, 4);

  const pendingFees = fees.filter(f => f.status === 'pending');
  const activityFeed = [
    ...assignments.slice(-4).map(a => ({ text: `Assignment: ${a.title || 'Untitled'}`, time: 'Just now' })),
    ...fees.slice(-3).map(f => ({ text: `Fee ${f.status}: ${f.studentName}`, time: '2m ago' })),
    ...announcements.slice(-2).map(n => ({ text: `Announcement: ${n.title}`, time: '5m ago' })),
  ].slice(0, 8);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">
      {/* ── Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden"
      >
        {/* Subtle pink blush */}
        <div className="absolute top-0 right-0 w-64 h-full rounded-xl pointer-events-none" 
          style={{ background: 'radial-gradient(ellipse at top right, rgba(255,107,157,0.06), transparent 60%)' }} />
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Admin Console
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-10 rounded-full bg-black" />
            Dashboard
          </h1>
        </div>
        <div className="text-right hidden sm:flex flex-col items-end justify-center gap-0.5 mt-4 md:mt-0">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Local time</span>
          <LiveClock />
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={students.length} delay={0.1} color="#111111" />
        <StatCard icon={UserCheck} label="Active Teachers" value={teachers.length} delay={0.15} color="#a855f7" />
        <StatCard icon={CreditCard} label="Revenue" value={`₹${paidFees.toLocaleString('en-IN')}`} delay={0.2} color="#3b82f6" />
        <StatCard icon={TrendingUp} label="Attendance Rate" value={`${overallAttendanceRate}%`} delay={0.25} color="#10b981" />
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Class Attendance */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-black" /> 
            Class Attendance
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={classAttendance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="class" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="attendance" fill="url(#gradBlack)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="gradBlack" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#111111" stopOpacity={0.25}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Grade Distribution */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7' }} /> 
            Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={gradePieData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                {gradePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Admissions */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} /> 
            Monthly Admissions
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={admissionsTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradBlue)" />
              <defs>
                <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Actions & Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="lg:col-span-2 nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Zap size={14} style={{ color: 'var(--text-primary)' }} /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { playBlip(); navigate(action.path); }}
                onMouseEnter={playClick}
                className="group p-5 rounded-xl flex flex-col items-center justify-center gap-3 transition-all duration-200 border hover:scale-[1.02] cursor-pointer"
                style={{ 
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-default)',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = `${action.color}30`;
                  e.currentTarget.style.background = `${action.color}06`;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="p-3 rounded-xl transition-all duration-200"
                  style={{ background: `${action.color}10` }}>
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-xs font-semibold text-center transition-colors" style={{ color: 'var(--text-secondary)' }}>{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="nova-card p-6">
          <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Activity size={14} style={{ color: '#3b82f6' }} /> Recent Activity
          </h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto no-scrollbar">
            {activityFeed.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-start border-l-2 pl-3 py-1 cursor-default"
                style={{ borderColor: 'var(--border-strong)' }}
                onMouseEnter={playClick}
              >
                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{entry.text}</span>
                <span className="text-[10px] font-mono shrink-0 ml-2" style={{ color: 'var(--text-dim)' }}>{entry.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Alerts ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} 
        className="nova-card p-6" style={{ borderLeft: '3px solid var(--semantic-warning)' }}
      >
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: '#d97706' }}>
          <AlertTriangle size={16} /> Alerts & Warnings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--semantic-error)' }} />
              Low Attendance Students
            </p>
            <div className="space-y-2.5">
              {lowAttendanceStudents.map(s => (
                <div key={s.id} className="flex justify-between items-center py-1.5 border-b text-sm" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                  <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded-md"
                    style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--semantic-error)' }}
                  >{s.rate}%</span>
                </div>
              ))}
              {lowAttendanceStudents.length === 0 && <span className="text-xs" style={{ color: 'var(--text-dim)' }}>All students meeting attendance threshold ✓</span>}
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--semantic-warning)' }} />
              Pending Fee Payments
            </p>
            <div className="space-y-2.5">
              {pendingFees.slice(0, 4).map(f => (
                <div key={f.id} className="flex justify-between items-center py-1.5 border-b text-sm" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="font-medium truncate pr-2" style={{ color: 'var(--text-secondary)' }}>{f.studentName}</span>
                  <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded-md shrink-0"
                    style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--semantic-warning)' }}
                  >{f.term}</span>
                </div>
              ))}
              {pendingFees.length === 0 && <span className="text-xs" style={{ color: 'var(--text-dim)' }}>No pending payments ✓</span>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
