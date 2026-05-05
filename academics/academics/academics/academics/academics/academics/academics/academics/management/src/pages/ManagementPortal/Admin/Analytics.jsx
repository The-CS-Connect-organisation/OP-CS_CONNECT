import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';
import { Activity, Users, GraduationCap, TrendingUp, Download, FileText } from 'lucide-react';

const COLORS = ['#111111', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, color = '#111111', delay }) => {
  const { playClick } = useSound();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      onMouseEnter={playClick}
      className="nova-card p-6 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
          <Icon size={19} style={{ color }} />
        </div>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: '65%' }} 
          transition={{ delay: delay + 0.4, duration: 1 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl border"
      style={{ background: '#ffffff', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || 'var(--text-primary)' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export const Analytics = () => {
  const { data: users } = useStore(KEYS.USERS, []);
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { playBlip } = useSound();

  const stats = useMemo(() => {
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    
    const classDist = {};
    students.forEach(s => {
      classDist[s.class] = (classDist[s.class] || 0) + 1;
    });
    const classData = Object.keys(classDist).map(key => ({ name: key, students: classDist[key] }));

    const totalAtt = attendance.length;
    const presentAtt = attendance.filter(a => a.status === 'present').length;
    const attRate = totalAtt ? Math.round((presentAtt / totalAtt) * 100) : 0;

    return { students: students.length, teachers: teachers.length, classData, attRate };
  }, [users, attendance]);

  // Calculate tier data from actual marks in Firebase
  const tierData = useMemo(() => {
    const gradeCounts = marks.reduce((acc, m) => {
      const grade = (m.grade || 'N/A').toUpperCase();
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
  }, [marks]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full relative pt-2 pb-12">

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }} 
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(59,130,246,0.05), transparent 60%)' }} />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-3"
            style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Analytics
          </span>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-10 rounded-full bg-black" />
            Analytics
          </h1>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={playBlip} className="btn-secondary text-sm py-2.5 px-5 flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          <button onClick={playBlip} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            <FileText size={14} /> Report
          </button>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={GraduationCap} label="Total Students" value={stats.students} color="#111111" delay={0.1} />
        <StatCard icon={Users} label="Total Teachers" value={stats.teachers} color="#a855f7" delay={0.2} />
        <StatCard icon={TrendingUp} label="Attendance Rate" value={`${stats.attRate}%`} color="#10b981" delay={0.3} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.4 }}
          className="nova-card p-6"
        >
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-black" /> Students per Class
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.classData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="students" fill="url(#anaBarGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="anaBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#111111" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.5 }}
          className="nova-card p-6"
        >
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#a855f7' }} /> Grade Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {tierData.map((tier, i) => (
              <div key={tier.name} className="text-center">
                <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: COLORS[i] }} />
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{tier.name}</p>
                <p className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{tier.value}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Area chart */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }}
        className="nova-card p-6"
      >
        <h3 className="text-sm font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} /> Enrollment Trend
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={stats.classData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="url(#areaGrad)" strokeWidth={2.5} />
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
