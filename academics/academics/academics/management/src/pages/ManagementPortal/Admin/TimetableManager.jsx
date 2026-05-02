import { motion } from 'framer-motion';
import { Calendar, Plus, Terminal, Clock, Hash, MapPin, User, ChevronRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

export const TimetableManager = () => {
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const { playClick, playBlip } = useSound();
  
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-4 pb-12 relative">
      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" 
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05), transparent 70%)', filter: 'blur(100px)' }} />

      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-[rgba(99,102,241,0.1)] text-indigo-400 border border-[rgba(99,102,241,0.2)] rounded-sm text-[10px] font-semibold font-mono shadow-[0_0_15px_rgba(99,102,241,0.2)]">
               Temporal_Core
             </span>
             <div className="h-[1px] w-8 bg-[var(--bg-floating)]" />
             <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Scheduler_Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-4" style={{ color: 'var(--text-primary)' }}>
             <Calendar className="text-indigo-400" size={48} />
             Chronos
          </h1>
        </div>
        <Button 
          variant="primary" 
          icon={Plus} 
          onClick={playBlip}
          className="shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          Inject_Sequence
        </Button>
      </motion.div>

      <div className="grid gap-8 relative z-10">
        {Object.entries(timetable).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center border-dashed rounded-xl" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-elevated)' }}>
             <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No_Temporal_Assets_Found</p>
          </motion.div>
        ) : (
          Object.entries(timetable).map(([className, schedule], idx) => (
            <motion.div 
              key={className}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-0 border overflow-hidden transition-all duration-500 group" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] rounded-lg flex items-center justify-center text-indigo-400 font-mono font-bold group-hover:scale-110 transition-transform">
                      {className.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tighter text-[var(--text-primary)]">{className}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={playClick}>Modify_Keys</Button>
                    <Button size="sm" variant="outline" icon={ChevronRight} onClick={playClick} />
                  </div>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <th className="p-4 text-[10px] font-semibold text-[var(--text-muted)] font-mono"><Clock size={12} className="inline mr-2" />Duration</th>
                        <th className="p-4 text-[10px] font-semibold text-[var(--text-muted)] font-mono"><Hash size={12} className="inline mr-2" />Segment</th>
                        <th className="p-4 text-[10px] font-semibold text-[var(--text-muted)] font-mono"><User size={12} className="inline mr-2" />Vector</th>
                        <th className="p-4 text-[10px] font-semibold text-[var(--text-muted)] font-mono"><MapPin size={12} className="inline mr-2" />Coordinate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((day, dIdx) => (
                        day.slots.map((slot, sIdx) => (
                          <motion.tr 
                            key={`${dIdx}-${sIdx}`} 
                            onMouseEnter={playClick}
                            className={`border-b transition-colors group/row group-hover:bg-[rgba(99,102,241,0.02)]`}
                            style={{ borderColor: 'var(--border-subtle)' }}
                          >
                            {sIdx === 0 && (
                              <td rowSpan={day.slots.length} className="p-6 border-r align-top" style={{ borderColor: 'var(--border-subtle)' }}>
                                <span className="text-xl font-bold tracking-widest vertical-text" style={{ writingMode: 'vertical-lr', color: 'var(--text-primary)' }}>
                                  {day.day}
                                </span>
                              </td>
                            )}
                            <td className="p-4 font-mono text-[var(--text-muted)] text-sm group-hover/row:text-[var(--text-muted)]">{slot.time}</td>
                            <td className="p-4">
                              <span className="text-sm font-bold uppercase text-[var(--text-primary)] tracking-wide block">{slot.subject}</span>
                            </td>
                            <td className="p-4 text-xs font-mono text-[var(--text-muted)] uppercase">{slot.teacher}</td>
                            <td className="p-4">
                               <span className="px-2 py-1 border rounded text-[10px] font-mono text-[var(--text-muted)] group-hover/row:border-indigo-500/20 group-hover/row:text-indigo-300 transition-colors"
                                 style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                                 {slot.room}
                               </span>
                            </td>
                          </motion.tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

