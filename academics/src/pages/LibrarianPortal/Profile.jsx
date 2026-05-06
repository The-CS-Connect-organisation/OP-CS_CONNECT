import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, BookOpen, Calendar, Library, Fingerprint, Activity, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useSound } from '../../hooks/useSound';

export const Profile = ({ user }) => {
  const { playClick } = useSound();
  
  const infoFields = [
    { icon: Mail, label: 'Email_Vector', value: user.email },
    { icon: Phone, label: 'Comm_Link', value: user.phone || 'NO_LINK' },
    { icon: Library, label: 'Department', value: 'Library_Services' },
    { icon: Calendar, label: 'Init_Date', value: user.joined || 'UNKNOWN' },
  ];

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto w-full pt-4 pb-12 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-1000" 
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06), transparent 70%)', filter: 'blur(120px)' }} />

      {/* Immersive Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="nova-card p-10 relative overflow-hidden group border"
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(168,85,247,0.05)] blur-[120px] rounded-full pointer-events-none group-hover:bg-[rgba(168,85,247,0.1)] transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl shadow-glow relative overflow-hidden group/avatar border"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
            {user.avatar || '📚'}
            <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
          </motion.div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
               <span className="px-2 py-0.5 border rounded-sm text-[9px] font-semibold font-mono"
                 style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)', color: '#a855f7' }}>
                 Library_Manager
               </span>
               <div className="h-[1px] w-6 bg-[var(--bg-floating)]" />
               <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1">
                 <Activity size={10} className="animate-pulse" /> Status_Active
               </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-[var(--text-primary)] mb-2">
              {user.name}
            </h1>
            <p className="text-purple-400 font-mono text-xs uppercase tracking-[0.4em] mb-6">Knowledge_Keeper</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge variant="purple">Librarian</Badge>
              <Badge variant="default">Authorized</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-8 relative z-10">
        {/* Main Info */}
        <div className="md:col-span-3 space-y-8">
          <Card className="nova-card p-8 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono mb-8 flex items-center gap-2">
              <Fingerprint size={14} className="text-purple-400" /> Entity_Identity_Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {infoFields.map((field, idx) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={playClick}
                  className="flex items-center gap-4 p-4 rounded-xl border transition-all cursor-crosshair group"
                  style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--text-muted)] group-hover:text-purple-400 border transition-all shadow-inner"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                    <field.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-widest mb-0.5">{field.label}</p>
                    <p className="text-sm font-bold text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{field.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Library Stats */}
        <div className="md:col-span-2 space-y-8">
          <Card className="nova-card p-8 border flex flex-col" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <h3 className="text-xs font-semibold text-[var(--text-muted)] font-mono mb-8 flex items-center gap-2">
              <BookOpen size={14} className="text-purple-400" /> Library_Stats
            </h3>
            
            <div className="space-y-8 flex-1">
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    <span>Books_Managed</span>
                    <span className="text-purple-400">2,847</span>
                 </div>
                 <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full shadow-glow" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }} />
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                    <span>Active_Loans</span>
                    <span className="text-purple-400">342</span>
                 </div>
                 <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }} className="h-full shadow-glow" style={{ background: '#a855f7' }} />
                 </div>
               </div>
            </div>

            <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
               <div className="flex items-center gap-2 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                  <Clock size={12} /> Last_Update: {new Date().toLocaleTimeString()}
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

