import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Hash, Terminal, Activity, Zap, Layers, ChevronRight, BookOpen, GraduationCap } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { KEYS } from '../../../data/schema';
import { useSound } from '../../../hooks/useSound';

// Subject color mapping
const SUBJECT_COLORS = {
  Mathematics: { bg: 'rgba(255, 107, 157, 0.1)', border: 'rgba(255, 107, 157, 0.3)', text: '#ff6b9d', glow: 'rgba(255, 107, 157, 0.15)' },
  Physics: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7', glow: 'rgba(168, 85, 247, 0.15)' },
  Chemistry: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.15)' },
  Biology: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.15)' },
  English: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.15)' },
  'Computer Science': { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)', text: '#ec4899', glow: 'rgba(236, 72, 153, 0.15)' },
  History: { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.15)' },
  Geography: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e', glow: 'rgba(34, 197, 94, 0.15)' },
  'Physical Education': { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.15)' },
  default: { bg: 'rgba(0, 0, 0, 0.05)', border: 'rgba(0, 0, 0, 0.15)', text: '#374151', glow: 'rgba(0, 0, 0, 0.05)' },
};

const getSubjectColor = (subject) => {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
};

// Day tabs with icons
const DAY_ICONS = {
  Monday: '🌟',
  Tuesday: '📚',
  Wednesday: '✏️',
  Thursday: '🎯',
  Friday: '🏆',
  Saturday: '🎨',
  Sunday: '💤',
};

export const Timetable = ({ user }) => {
  const { data: timetable } = useStore(KEYS.TIMETABLE, {});
  const { playClick, playBlip } = useSound();
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
  
  const classTimetable = timetable[user.class] || [];
  const todaySchedule = classTimetable.find(t => t.day === selectedDay)?.slots || [];

  const getTimePeriod = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 15) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto w-full pt-2 pb-12">
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(255, 107, 157, 0.08)', color: '#ff6b9d', border: '1px solid rgba(255, 107, 157, 0.20)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Schedule
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-10 rounded-full bg-black" />
            Timetable
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {user.class} • {classTimetable.length} days scheduled
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="nova-card p-4 min-w-[120px]">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Today's Classes</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{todaySchedule.length}</p>
          </div>
          <div className="nova-card p-4 min-w-[120px]">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>This Week</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {classTimetable.reduce((acc, day) => acc + (day.slots?.length || 0), 0)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Day Selector Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {classTimetable.map((day, idx) => {
          const isActive = selectedDay === day.day;
          const icon = DAY_ICONS[day.day] || '📅';
          return (
            <motion.button
              key={day.day}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { playClick(); setSelectedDay(day.day); }}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-white text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{day.day}</span>
              {isActive && (
                <motion.div
                  layoutId="dayIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Schedule Grid ── */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedDay}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid gap-4"
          >
            {todaySchedule.length === 0 ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="nova-card border-dashed border-[var(--border-default)] py-24 text-center"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'var(--bg-elevated)' }}>
                  <Terminal size={32} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No Classes Scheduled</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enjoy your free time! 🎉</p>
              </motion.div>
            ) : (
              todaySchedule.map((slot, idx) => {
                const colors = getSubjectColor(slot.subject);
                const isNow = slot.time.includes('Now') || false;
                
                return (
                  <motion.div
                    key={`${selectedDay}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <div 
                      className={`nova-card p-5 cursor-pointer group relative overflow-hidden ${isNow ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                      onMouseEnter={playClick}
                    >
                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at left, ${colors.glow}, transparent 60%)` }}
                      />

                      <div className="flex items-center gap-5 relative z-10">
                        {/* Time Block */}
                        <div className="flex-shrink-0">
                          <div 
                            className="w-20 h-20 rounded-xl flex flex-col items-center justify-center"
                            style={{ 
                              background: 'white',
                              border: `1px solid ${colors.border}`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            }}
                          >
                            <Clock size={16} className="mb-1" style={{ color: colors.text }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {slot.time.split(' - ')[0] || slot.time.split(' ')[0]}
                            </span>
                            {slot.time.includes('-') && (
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {slot.time.split(' - ')[1]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Connector Line */}
                        <div className="flex-shrink-0 hidden md:block">
                          <div className="w-8 h-[2px]" style={{ background: colors.border }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span 
                                  className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                                >
                                  {getTimePeriod(slot.time)}
                                </span>
                                {isNow && (
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Now
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                {slot.subject}
                              </h3>
                            </div>

                            <ChevronRight 
                              size={24} 
                              className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" 
                            />
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap gap-4 mt-4">
                            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                                <User size={14} />
                              </div>
                              <span className="font-medium">{slot.teacher}</span>
                            </span>
                            <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                                <MapPin size={14} />
                              </div>
                              <span className="font-medium">Room {slot.room}</span>
                            </span>
                            {slot.duration && (
                              <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-elevated)' }}>
                                  <Clock size={14} />
                                </div>
                                <span className="font-medium">{slot.duration}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Subject indicator bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                        style={{ background: colors.text }}
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};