import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Hash, Terminal, Activity, Zap, Layers, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const Timetable = ({ user }) => {
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const { playClick, playBlip } = useSound();
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  
  const classTimetable = timetable[user.class] || [];
  const todaySchedule = classTimetable.find(t => t.day === selectedDay)?.slots || [];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header section */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)] rounded-sm text-[10px] font-semibold font-mono">
               Schedule_Node
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
               <Activity size={10} className="animate-pulse" /> Temporal_Mapping: {user.class}
             </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-4">
             <Calendar className="text-[var(--text-muted)]" size={48} />
             Time_Stream
          </h1>
        </div>
      </motion.div>

      {/* Day Selector */}
      <div className="flex p-1 bg-nova-base border border-[var(--border-default)] rounded-xl overflow-x-auto scrollbar-nothing scroll-smooth">
        {classTimetable.map(day => (
          <motion.button 
            key={day.day} 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => { playClick(); setSelectedDay(day.day); }}
            className={`px-8 py-3 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedDay === day.day
                ? 'bg-white text-[var(--text-primary)] shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {day.day}
          </motion.button>
        ))}
      </div>

      {/* Schedule Flow */}
      <div className="grid gap-4 relative">
        <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-[var(--bg-elevated)] hidden md:block" />
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedDay}
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {todaySchedule.length === 0 ? (
              <div className="py-32 text-center nova-card border-dashed border-[var(--border-default)]">
                 <Terminal size={48} className="mx-auto text-zinc-900 mb-6" />
                 <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.4em]">No_Events_Scheduled_For_This_Node</p>
              </div>
            ) : (
              todaySchedule.map((slot, idx) => (
                <motion.div 
                  key={`${selectedDay}-${idx}`}
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="group flex flex-col md:flex-row items-center gap-8 p-6 border-[var(--border-default)] bg-nova-base/20 hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                    onMouseEnter={playClick}
                  >
                    {/* Time Slot */}
                    <div className="w-24 h-24 rounded-2xl bg-nova-base border border-[var(--border-default)] flex flex-col items-center justify-center transition-all duration-500 group-hover:border-white/12 group-hover:scale-105 shadow-xl flex-shrink-0 relative z-10">
                      <Clock size={18} className="text-[var(--text-muted)] mb-2" />
                      <span className="text-[10px] font-mono font-bold text-[var(--text-primary)] tracking-tighter">
                        {slot.time.split(' ')[0]}
                      </span>
                      <span className="text-[8px] font-mono text-[var(--text-muted)] font-semibold mt-1">
                        {slot.time.split(' ')[1]}
                      </span>
                    </div>

                    {/* Node Dot (Desktop) */}
                    <div className="absolute left-[31px] w-2.5 h-2.5 rounded-full bg-[var(--bg-elevated)] border-2 border-zinc-950 z-20 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 hidden md:block" />

                    {/* Content */}
                    <div className="flex-1 min-w-0 relative z-10 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                         <h4 className="text-2xl font-bold text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--text-muted)] transition-colors">
                           {slot.subject}
                         </h4>
                         <Badge variant="default" className="font-mono text-[9px] uppercase tracking-widest px-3 w-fit mx-auto md:mx-0">
                           {slot.time}
                         </Badge>
                      </div>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <span className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                          <User size={14} className="text-[var(--text-muted)]" />
                          <span className="text-[var(--text-muted)] font-bold">Teacher:</span> {slot.teacher}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                          <MapPin size={14} className="text-[var(--text-muted)]" />
                          <span className="text-[var(--text-muted)] font-bold">NODE:</span> {slot.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center self-center relative z-10">
                       <ChevronRight className="text-zinc-900 group-hover:text-[var(--text-muted)] group-hover:translate-x-2 transition-all duration-500" size={32} />
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

