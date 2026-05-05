import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, BookOpen, GraduationCap, Clock, Award, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useSound } from '../../hooks/useSound';

export const Profile = ({ user }) => {
  const { playClick } = useSound();
  const subjects = user.subjects || [];

  const infoFields = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone || '+1 (555) 000-0000' },
    { icon: GraduationCap, label: 'Department', value: user.department || 'Academic Affairs' },
    { icon: BookOpen, label: 'Primary Subjects', value: subjects.length ? subjects.join(', ') : 'General Education' },
    { icon: ShieldCheck, label: 'Account Rank', value: user.role.toUpperCase() },
    { icon: MapPin, label: 'Office Location', value: 'Block A, Room 302' },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      {/* ── Profile Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-end gap-10 bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onMouseEnter={playClick}
          className="w-44 h-44 rounded-[40px] bg-slate-50 border border-slate-200 flex items-center justify-center text-8xl shadow-lg relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          {user.avatar || '👨‍🏫'}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
            Active
          </div>
        </motion.div>
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
             <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 shadow-sm">
               Verified Instructor
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Emp ID: {user.id.toUpperCase()}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
             {user.name}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-4">
            {user.department || 'Academic Operations'} 
            <span className="w-1 h-1 rounded-full bg-slate-200" /> 
            Member since {user.joined || '2024'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Profile Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <UserCircle size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              {infoFields.map((field, idx) => (
                <motion.div 
                   key={field.label}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="space-y-2 border-l-2 border-slate-50 pl-6 hover:border-indigo-600/20 transition-all cursor-default"
                >
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <field.icon size={12} className="text-slate-300" />
                    {field.label}
                  </p>
                  <p className="text-lg font-bold text-slate-900 tracking-tight truncate">{field.value}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { label: 'Assigned Classes', value: '10-A, 10-B', icon: MapPin },
               { label: 'Active Projects', value: '18', icon: Award },
               { label: 'Average Uptime', value: '98%', icon: Clock }
             ].map((stat, idx) => (
               <Card key={stat.label} className="p-8 bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all text-center group rounded-3xl">
                  <stat.icon size={20} className="mx-auto mb-4 text-slate-200 group-hover:text-indigo-600 transition-colors" />
                  <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
               </Card>
             ))}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-slate-900 border border-slate-900 rounded-3xl shadow-2xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full" />
             <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-8 relative z-10 flex items-center gap-2">
               <Globe size={14} /> Professional Bio
             </h3>
             <div className="space-y-6 relative z-10">
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  Dedicated educator focused on fostering interdisciplinary learning and leveraging educational technology to enhance student engagement and outcomes.
                </p>
                <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Academic Specialization: Science & Tech</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
