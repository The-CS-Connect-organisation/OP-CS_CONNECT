import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, ShieldCheck, Award, Clock, Settings, Globe, Building, Key, Activity, Users, Database } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useSound } from '../../hooks/useSound';

export const Profile = ({ user }) => {
  const { playClick, playBlip } = useSound();

  const infoFields = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone || '+1 (555) 000-0000' },
    { icon: Calendar, label: 'Member Since', value: user.joined || '2024' },
    { icon: Building, label: 'Department', value: user.department || 'Administration' },
    { icon: ShieldCheck, label: 'Access Level', value: 'Super Administrator' },
    { icon: Key, label: 'Admin ID', value: user.id.toUpperCase() },
  ];

  const systemStats = [
    { label: 'Total Users', value: '2,547', icon: Users, color: 'blue' },
    { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'green' },
    { label: 'Active Sessions', value: '342', icon: Clock, color: 'purple' },
    { label: 'Database Size', value: '45.2 GB', icon: Database, color: 'orange' },
  ];

  const permissions = [
    'User Management',
    'System Configuration',
    'Financial Oversight',
    'Academic Records',
    'Communication Control',
    'Security Administration',
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      {/* ── Profile Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-end gap-10 bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl opacity-30" />
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onMouseEnter={playBlip}
          className="w-44 h-44 rounded-[40px] bg-slate-800 border border-slate-600 flex items-center justify-center text-8xl shadow-2xl relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {user.avatar || '👨‍💼'}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-blue-600 border border-blue-500 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
            Admin
          </div>
        </motion.div>
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
             <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/30 shadow-sm">
               System Administrator
             </div>
             <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-green-500/30 shadow-sm">
               Verified
             </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
             {user.name}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-4">
            {user.department || 'School Administration'} 
            <span className="w-1 h-1 rounded-full bg-slate-600" /> 
            Full System Access
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Profile Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <User size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Administrator Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              {infoFields.map((field, idx) => (
                <motion.div 
                   key={field.label}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="space-y-2 border-l-2 border-slate-50 pl-6 hover:border-blue-600/20 transition-all cursor-default"
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

          {/* System Stats */}
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <Activity size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">System Overview</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-default"
                >
                  <stat.icon size={20} className={`mb-3 ${
                    stat.color === 'blue' ? 'text-blue-500' :
                    stat.color === 'green' ? 'text-green-500' :
                    stat.color === 'purple' ? 'text-purple-500' :
                    'text-orange-500'
                  }`} />
                  <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Permissions */}
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <ShieldCheck size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">System Permissions</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {permissions.map((permission, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.05) }}
                  className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all cursor-default"
                >
                  {permission}
                </motion.span>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-slate-900 border border-slate-900 rounded-3xl shadow-2xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full" />
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/20 blur-3xl rounded-full" />
             <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-8 relative z-10 flex items-center gap-2">
               <Settings size={14} /> Admin Bio
             </h3>
             <div className="space-y-6 relative z-10">
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  Senior system administrator responsible for managing the entire SchoolSync platform, ensuring security, performance, and reliability across all modules.
                </p>
                <div className="h-1 w-12 bg-blue-500 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Admin Since: {user.joined || '2024'}</p>
             </div>
          </Card>

          {/* Security Status */}
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Security Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2FA Enabled</span>
                <span className="text-sm font-bold text-green-600">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Login</span>
                <span className="text-sm font-bold text-slate-900">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Login Attempts</span>
                <span className="text-sm font-bold text-slate-900">0 Failed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Timeout</span>
                <span className="text-sm font-bold text-slate-900">30 min</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
