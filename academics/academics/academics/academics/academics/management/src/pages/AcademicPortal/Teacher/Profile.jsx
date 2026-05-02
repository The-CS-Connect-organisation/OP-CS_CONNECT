import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, BookOpen, GraduationCap, Terminal, Activity, Hash, Layers, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useSound } from '../../../hooks/useSound';

export const Profile = ({ user }) => {
  const { playClick } = useSound();
  const subjects = user.subjects || [];

  const infoFields = [
    { icon: Mail, label: 'Communication_Index', value: user.email },
    { icon: Phone, label: 'Telemetry_Line', value: user.phone },
    { icon: GraduationCap, label: 'Department_Sector', value: user.department || 'GLOBAL_OPS' },
    { icon: BookOpen, label: 'Knowledge_Domains', value: subjects.length ? subjects.join(', ') : 'GENERAL' },
    { icon: ShieldCheck, label: 'Security_Clearance', value: user.role.toUpperCase() },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
           <motion.div 
             whileHover={{ scale: 1.05, rotate: 2 }}
             onMouseEnter={playClick}
             className="w-40 h-40 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-8xl shadow-[0_0_30px_rgba(0,0,0,0.5)] relative group cursor-crosshair"
           >
              <div className="absolute inset-0 bg-white/[0.03] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              {user.avatar || '👨‍🏫'}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white text-[10px] font-mono font-bold rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                VERIFIED
              </div>
           </motion.div>
           
           <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                 <span className="px-3 py-1 bg-white/[0.06] text-[var(--text-muted)] border border-white/12 rounded-sm text-[10px] font-semibold font-mono shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                   Identity_Core
                 </span>
                 <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
                 <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Auth_Token: BK_{user.id.slice(-4)}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
                 {user.name}
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-xs uppercase tracking-[0.4em]">{user.department || 'ACADEMIC_OPERATIONS'} • SINCE_{user.joined}</p>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Main Info Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 border-[var(--border-default)] bg-nova-base/20 backdrop-blur-xl group overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] blur-[80px] rounded-full pointer-events-none group-hover:bg-black/05 transition-colors" />
            
            <div className="flex items-center gap-3 mb-8">
               <Terminal size={16} className="text-[var(--text-muted)]" />
               <h3 className="text-sm font-semibold text-[var(--text-primary)] font-mono">Profile Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {infoFields.map((field, idx) => (
                <motion.div 
                  key={field.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2 border-l border-[var(--border-default)] pl-6 hover:border-white/20 transition-colors py-2"
                >
                  <p className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <field.icon size={12} className="text-[var(--text-muted)]" />
                    {field.label}
                  </p>
                  <p className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight truncate">{field.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: 'Assigned_Sectors', value: '02', icon: Layers },
               { label: 'Active_Cohorts', value: '18', icon: Activity },
               { label: 'Uptime_Index', value: '98%', icon: Hash }
             ].map((stat, idx) => (
               <Card key={stat.label} className="p-6 border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-white/12 transition-all text-center group">
                  <stat.icon size={20} className="mx-auto mb-4 text-[var(--text-muted)] group-hover:text-[var(--text-muted)] transition-colors" />
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-mono mb-1">{stat.value}</p>
                  <p className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
               </Card>
             ))}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-[var(--border-default)] bg-white text-[var(--text-primary)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-nova-base/10 blur-3xl rounded-full" />
             <h3 className="text-xs font-semibold mb-6 relative z-10">Broadcast Messages</h3>
             <div className="space-y-4 relative z-10">
                <p className="text-sm font-medium leading-relaxed opacity-90 italic">
                  "Knowledge is the primary currency of the sector. Distribute with precision."
                </p>
                <div className="h-[1px] bg-white/20 w-12" />
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-60">Auth_Level: PRIMARY_DOMAIN_ADMIN</p>
             </div>
          </Card>

          <Card className="p-6 border-[var(--border-default)] bg-nova-base/40">
             <h3 className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-widest mb-6">Linked_Subjects</h3>
             <div className="flex flex-wrap gap-2">
                {subjects.map(s => (
                  <Badge key={s} color="rose" className="font-mono text-xs px-4 py-1.5 border-white/12 bg-white/[0.03] hover:bg-black/05 transition-all cursor-crosshair">
                    {s.toUpperCase()}
                  </Badge>
                ))}
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

