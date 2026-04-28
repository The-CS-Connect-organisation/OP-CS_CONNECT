import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, TrendingUp, Calendar, Activity, Terminal, Hash, Layers, Zap, Info, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AttendanceChart } from '../../../components/charts/AttendanceChart';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const Attendance = ({ user }) => {
  const { data: attendance } = useStore(KEYS.ATTENDANCE, []);
  const { playClick } = useSound();
  const myAttendance = attendance.filter(a => a.studentId === user.id);

  const stats = useMemo(() => {
    const total = myAttendance.length;
    const present = myAttendance.filter(a => a.status === 'present').length;
    const late = myAttendance.filter(a => a.status === 'late').length;
    const absent = total - present - late;
    return { total, present, late, absent, rate: total > 0 ? Math.round((present / total) * 100) : 0 };
  }, [myAttendance]);

  const subjectStats = useMemo(() => {
    const map = {};
    myAttendance.forEach(a => {
      if (!map[a.subject]) map[a.subject] = { total: 0, present: 0 };
      map[a.subject].total++;
      if (a.status === 'present' || a.status === 'late') map[a.subject].present++;
    });
    return Object.entries(map).map(([subject, data]) => ({
      subject,
      ...data,
      rate: Math.round((data.present / data.total) * 100)
    }));
  }, [myAttendance]);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Registry_Stream
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <Activity size={10} className="animate-pulse" /> Live_Telemetry_Active
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <CheckSquare className="text-[var(--text-muted)]" size={48} />
           Attendance
        </h1>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'QUORUM_INDEX', value: `${stats.rate}%`, icon: Zap, color: stats.rate >= 75 ? 'rose' : 'zinc' },
          { label: 'Present', value: stats.present, icon: Activity, color: 'rose' },
          { label: 'LATENCY_STATE', value: stats.late, icon: Clock, color: 'zinc' },
          { label: 'VACUUM_STATE', value: stats.absent, icon: Info, color: 'zinc' },
        ].map((s, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:border-white/20 transition-all duration-500">
               <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-20 pointer-events-none transition-colors ${s.color === 'rose' ? 'bg-white' : 'bg-slate-500'}`} />
               <div className="flex flex-col items-center justify-center p-4">
                  <div className={`w-12 h-12 rounded-2xl bg-nova-base border border-[var(--border-default)] flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 ${s.color === 'rose' ? 'text-[var(--text-muted)] border-white/10' : 'text-[var(--text-muted)]'}`}>
                    <s.icon size={20} />
                  </div>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-mono tracking-tighter mb-1">{s.value}</p>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-[0.2em]">{s.label}</p>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visualization */}
        <div className="lg:col-span-8 space-y-8">
           <Card className="p-8 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-8">
                 <Terminal size={16} className="text-[var(--text-muted)]" />
                 <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Attendance History</h3>
              </div>
              <div className="h-[300px]">
                <AttendanceChart data={myAttendance} />
              </div>
           </Card>
        </div>

        {/* Sector Analytics */}
        <div className="lg:col-span-4">
          <Card className="p-8 border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <h3 className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest mb-8 flex items-center gap-2">
              <Layers size={14} className="text-[var(--text-muted)]" /> Subject_Quorum_Analytics
            </h3>
            <div className="space-y-8">
              {subjectStats.map((s, idx) => (
                <motion.div 
                  key={s.subject} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (idx * 0.1) }}
                  className="space-y-3"
                  onMouseEnter={() => playClick?.()}
                >
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[150px]">{s.subject}</span>
                    <Badge variant={s.rate >= 75 ? 'rose' : s.rate >= 50 ? 'amber' : 'default'} className="font-mono text-[9px] px-2 py-0.5 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {s.rate}%
                    </Badge>
                  </div>
                  <div className="h-6 bg-nova-base border border-[var(--border-default)] rounded-sm overflow-hidden p-1 relative">
                    <motion.div
                      initial={{ width: 0 }} 
                      animate={{ width: `${s.rate}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-xs transition-colors duration-500 ${
                        s.rate >= 75 ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 
                        s.rate >= 50 ? 'bg-slate-500' : 'bg-[var(--bg-floating)]'
                      }`}
                    />
                    {/* Tick marks */}
                    <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
                       {[...Array(5)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white/30" />)}
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)] tracking-widest uppercase">
                     <span>P: {s.present}</span>
                     <span>T: {s.total}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

