import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Award, TrendingUp, Activity, ShieldCheck, Zap, Hash, Terminal } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useAttendance, useMarks } from '../../../hooks/useSchoolData';
import { useSound } from '../../../hooks/useSound';

const Badge = ({ children, color = 'zinc', className = '' }) => (
  <span className={`px-2 py-1 rounded border font-mono text-[10px] font-semibold ${color === 'rose' ? 'bg-rose-950/30 border-rose-900 text-[var(--text-muted)]' : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-muted)]'} ${className}`}>
    {children}
  </span>
);

export const Profile = ({ user }) => {
  const { playClick, playBlip } = useSound();

  const { report, loading: marksLoading } = useMarks(user?.id);
  const { records: attendanceRecords, loading: attLoading } = useAttendance(user?.id);

  const myMarks = report?.subjects || report?.marks || [];
  const avgMarks = myMarks.length > 0
    ? Math.round(myMarks.reduce((a, b) => a + (b.marksObtained ?? b.marks ?? 0), 0) / myMarks.length)
    : 0;

  const totalAttDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttDays > 0 ? Math.round((presentDays / totalAttDays) * 100) : 0;

  const infoFields = [
    { icon: Mail, label: 'EMAIL_ADDRESS', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Calendar, label: 'SYNC_DATE', value: user.joined },
    { icon: BookOpen, label: 'DOMAIN_CLASS', value: user.class },
    { icon: Hash, label: 'NODE_ID', value: user.rollNo },
    { icon: User, label: 'PARENT_AUTH', value: user.parentName },
    { icon: Phone, label: 'Parent Phone', value: user.parentPhone },
  ];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="flex items-center gap-3 mb-4">
           <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
             Identity_Core
           </span>
           <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
           <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck size={10} className="text-[var(--text-muted)] animate-pulse" /> Security_Layer_Active
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
           <Activity className="text-[var(--text-muted)]" size={48} />
           Protocol_ID
        </h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative group lg:col-span-12"
      >
        <Card className="p-8 md:p-12 border-[var(--border-default)] bg-nova-base/40 backdrop-blur-xl relative overflow-hidden transition-all duration-500 hover:border-white/15">
           {/* Abstract background element */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[150px] bg-white/[0.03] rounded-full pointer-events-none group-hover:bg-black/05 transition-colors duration-700" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }} 
                onMouseEnter={playBlip}
                className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-8xl shadow-2xl relative"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent rounded-3xl" />
                <span className="relative z-10 filter drop-shadow-2xl">{user.avatar}</span>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border-4 border-zinc-950 flex items-center justify-center text-[var(--text-primary)] shadow-xl">
                   <ShieldCheck size={18} />
                </div>
              </motion.div>

              <div className="flex-1 text-center md:text-left pt-6">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                   <Badge variant="rose" className="font-mono text-[9px] px-3">Active</Badge>
                   <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-bold">NODE: {user.rollNo}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] uppercase tracking-tighter mb-4 group-hover:text-[var(--text-muted)] transition-colors duration-500 leading-none">
                  {user.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">
                   <span className="flex items-center gap-2"><BookOpen size={14} className="text-[var(--text-muted)]" /> Domain: {user.class}</span>
                   <span className="hidden md:block w-1 h-1 bg-[var(--bg-floating)] rounded-full" />
                   <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--text-muted)]" /> Vector: {user.room || 'Primary'}</span>
                   <span className="hidden md:block w-1 h-1 bg-[var(--bg-floating)] rounded-full" />
                   <span className="flex items-center gap-2 uppercase">Sync: {user.joined}</span>
                </div>
              </div>
           </div>
        </Card>
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          { icon: Award, label: 'MEAN_EFFICIENCY', value: marksLoading ? '...' : `${avgMarks}%`, color: 'rose' },
          { icon: TrendingUp, label: 'QUORUM_UPTIME', value: attLoading ? '...' : `${attendanceRate}%`, color: 'zinc' },
          { icon: Calendar, label: 'BUFFER_DURATION', value: `${Math.floor((Date.now() - new Date(user.joined).getTime()) / (1000 * 60 * 60 * 24))}d`, color: 'rose' },
        ].map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (idx * 0.1) }}>
            <Card className="relative p-10 group hover:border-white/20 transition-all duration-500 bg-nova-base/40 backdrop-blur-md">
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[70px] opacity-10 pointer-events-none transition-all duration-500 group-hover:opacity-20 ${s.color === 'rose' ? 'bg-white' : 'bg-slate-500'}`} />
               <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 ${s.color === 'rose' ? 'text-[var(--text-muted)] border-white/10' : 'text-[var(--text-muted)]'}`}>
                    <s.icon size={24} />
                  </div>
                  <p className="text-4xl font-bold text-[var(--text-primary)] font-mono tracking-tighter mb-2">{s.value}</p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase tracking-[0.4em]">{s.label}</p>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Meta Stream */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="p-8 md:p-12 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
             <Terminal size={18} className="text-[var(--text-muted)]" />
             <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Profile Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
            {infoFields.map((field, idx) => (
              <div 
                key={idx} 
                className="group flex items-center gap-6 p-4 rounded-xl border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all duration-500 cursor-none"
                onMouseEnter={playClick}
              >
                <div className="w-12 h-12 rounded-xl bg-nova-base border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] transition-all duration-500 group-hover:border-white/25 group-hover:text-[var(--text-muted)] shadow-xl">
                  <field.icon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 group-hover:text-[var(--text-muted)] transition-colors">{field.label}</p>
                  <p className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-widest">{field.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none rotate-12">
             <Terminal size={400} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

