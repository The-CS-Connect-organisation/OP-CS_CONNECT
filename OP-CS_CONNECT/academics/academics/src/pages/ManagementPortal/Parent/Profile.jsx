import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Users, ShieldCheck, Heart, Clock, Award, Globe, Home, Baby } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useSound } from '../../../hooks/useSound';

export const Profile = ({ user }) => {
  const { playClick, playBlip } = useSound();

  const infoFields = [
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone || '+1 (555) 000-0000' },
    { icon: Calendar, label: 'Member Since', value: user.joined || '2024' },
    { icon: Home, label: 'Address', value: user.address || '123 Main Street, City' },
    { icon: ShieldCheck, label: 'Account Status', value: 'Active Guardian' },
    { icon: Globe, label: 'Preferred Language', value: user.language || 'English' },
  ];

  const childrenInfo = user.children || [
    { name: 'John Doe', class: '10-A', rollNo: 'STU001' },
    { name: 'Jane Doe', class: '8-B', rollNo: 'STU002' }
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 font-sans">
      {/* ── Profile Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-end gap-10 bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-50" />
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onMouseEnter={playBlip}
          className="w-44 h-44 rounded-[40px] bg-rose-50 border border-rose-200 flex items-center justify-center text-8xl shadow-lg relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-rose-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          {user.avatar || '👨‍👩‍👧‍👦'}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-white border border-rose-200 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm">
            Guardian
          </div>
        </motion.div>
        
        <div className="text-center md:text-left relative z-10 flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
             <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-rose-100 shadow-sm">
               Verified Parent
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">ID: {user.id.toUpperCase()}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">
             {user.name}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center md:justify-start gap-4">
            Parent/Guardian 
            <span className="w-1 h-1 rounded-full bg-slate-200" /> 
            {childrenInfo.length} Child{childrenInfo.length > 1 ? 'ren' : ''} Enrolled
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Profile Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <User size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              {infoFields.map((field, idx) => (
                <motion.div 
                   key={field.label}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="space-y-2 border-l-2 border-slate-50 pl-6 hover:border-rose-600/20 transition-all cursor-default"
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

          {/* Children Information */}
          <Card className="p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
               <Users size={18} className="text-slate-400" />
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Children Information</h3>
            </div>

            <div className="space-y-4">
              {childrenInfo.map((child, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-default"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-sm">
                    {child.avatar || '👦'}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-900 mb-1">{child.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Class: {child.class} • Roll No: {child.rollNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Active</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 bg-slate-900 border border-slate-900 rounded-3xl shadow-2xl relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/20 blur-3xl rounded-full" />
             <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-8 relative z-10 flex items-center gap-2">
               <Heart size={14} /> Guardian Bio
             </h3>
             <div className="space-y-6 relative z-10">
                <p className="text-sm font-medium leading-relaxed text-slate-300">
                  Committed parent actively involved in children's education and school activities. Dedicated to supporting academic excellence and holistic development.
                </p>
                <div className="h-1 w-12 bg-rose-500 rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Parent Since: {user.joined || '2024'}</p>
             </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Award size={14} /> Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Children</span>
                <span className="text-lg font-bold text-slate-900">{childrenInfo.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meetings Attended</span>
                <span className="text-lg font-bold text-slate-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Login</span>
                <span className="text-lg font-bold text-slate-900">Today</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
