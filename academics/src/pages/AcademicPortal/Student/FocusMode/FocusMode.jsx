import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, SkipForward, Target, Clock, Flame,
  Zap, CheckCircle2, Trash2, Sparkles, Brain, Trophy, BarChart3,
  ChevronRight, Plus, Calendar, BookOpen, AlertCircle, Timer
} from 'lucide-react';
import { getFromStorage, setToStorage } from '../../../../data/schema';
import { useSound } from '../../../../hooks/useSound';

// ── Timer configs ─────────────────────────────────────────────────────────────
const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;
const POMODORO_LONG = 15 * 60;
const SESSIONS_BEFORE_LONG = 4;

const POMODORO_Modes = {
  work: { label: 'Focus', duration: POMODORO_WORK, color: '#ea580c', bg: '#fff7ed', icon: Zap },
  short: { label: 'Short Break', duration: POMODORO_BREAK, color: '#10b981', bg: '#f0fdf4', icon: Coffee },
  long: { label: 'Long Break', duration: POMODORO_LONG, color: '#8b5cf6', bg: '#f5f3ff', icon: Coffee },
};

// ── Stats helpers ──────────────────────────────────────────────────────────────
const getSessionStats = () => {
  const history = getFromStorage('sms_focus_history', []);
  const today = new Date().toDateString();
  const todaySessions = history.filter(s => new Date(s.completedAt).toDateString() === today);
  const totalMinutes = history.reduce((sum, s) => sum + (s.duration || 25), 0);
  const streak = calcStreak(history);
  return { totalSessions: history.length, todaySessions: todaySessions.length, totalMinutes, streak };
};

const calcStreak = (history) => {
  if (!history.length) return 0;
  const dates = [...new Set(history.map(s => new Date(s.completedAt).toDateString()))].sort().reverse();
  let streak = 0;
  let check = new Date();
  check.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const dd = new Date(d);
    if (dd.toDateString() === check.toDateString()) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }
  return streak;
};

const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ── SVG Ring ───────────────────────────────────────────────────────────────────
const TimerRing = ({ progress, color, size = 280 }) => {
  const r = (size - 20) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - progress) }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
    </svg>
  );
};

// ── Task Item ─────────────────────────────────────────────────────────────────
const TaskItem = ({ task, onToggle, onDelete, color }) => {
  const colorMap = {
    Mathematics: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', dot: '#3b82f6' },
    Physics: { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9', dot: '#8b5cf6' },
    Chemistry: { bg: '#f0fdf4', border: '#10b981', text: '#047857', dot: '#10b981' },
    Biology: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c', dot: '#ef4444' },
    English: { bg: '#fff7ed', border: '#f97316', text: '#c2410c', dot: '#f97316' },
    default: { bg: '#f9fafb', border: '#6b7280', text: '#374151', dot: '#6b7280' },
  };
  const c = colorMap[task.subject] || colorMap.default;

  return (
    <motion.div
      layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer"
      style={{ background: task.completed ? 'rgba(16,185,129,0.04)' : c.bg, borderColor: task.completed ? '#10b98130' : c.border + '40' }}
      onClick={() => onToggle(task.id)}
    >
      <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0"
        style={{ borderColor: task.completed ? '#10b981' : c.dot, background: task.completed ? '#10b981' : 'transparent' }}>
        {task.completed && <CheckCircle2 size={12} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${task.completed ? 'line-through opacity-50' : ''}`}
          style={{ color: task.completed ? '#9ca3af' : c.text }}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: c.border + '20', color: c.text }}>{task.subject}</span>
          <span className="text-[9px]" style={{ color: '#a8a29e' }}>{task.duration}m</span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 transition-all"
        style={{ color: '#ef4444' }}
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
};

// ── Session History Panel ─────────────────────────────────────────────────────
const SessionHistory = () => {
  const history = getFromStorage('sms_focus_history', []);
  const grouped = {};
  history.forEach(s => {
    const d = new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(s);
  });

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>Session History</h4>
      {history.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No sessions yet. Start a Pomodoro to begin!</p>
      ) : (
        Object.entries(grouped).map(([date, sessions]) => (
          <div key={date}>
            <p className="text-[10px] font-semibold mb-1.5" style={{ color: '#a8a29e' }}>{date}</p>
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg mb-0.5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.mode === 'work' ? '#ea580c' : '#10b981' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.subject || 'Focus Session'}</span>
                <span className="text-[10px] ml-auto" style={{ color: '#a8a29e' }}>{s.duration}m</span>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

// ── Main FocusMode Component ────────────────────────────────────────────────────
const Coffee = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
  </svg>
);

export const FocusMode = ({ user, addToast }) => {
  const { playClick, playBlip } = useSound();
  const [tasks, setTasks] = useState([]);
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(POMODORO_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsDone, setSessionsDone] = useState(0);
  const [activeTask, setActiveTask] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef(null);

  const modeConfig = { work: { label: 'Focus', duration: POMODORO_WORK, color: '#ea580c', bg: '#fff7ed' },
    short: { label: 'Short Break', duration: POMODORO_BREAK, color: '#10b981', bg: '#f0fdf4' },
    long: { label: 'Long Break', duration: POMODORO_LONG, color: '#8b5cf6', bg: '#f5f3ff' } };

  const stats = getSessionStats();

  // Load tasks
  useEffect(() => {
    const saved = getFromStorage('sms_focus_tasks', []);
    setTasks(saved);
  }, []);

  // Storage listener
  useEffect(() => {
    const handler = () => {
      const saved = getFromStorage('sms_focus_tasks', []);
      setTasks(saved);
    };
    window.addEventListener('sms_storage_changed', handler);
    return () => window.removeEventListener('sms_storage_changed', handler);
  }, []);

  // Timer tick
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          handleSessionComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    playBlip();
    const history = getFromStorage('sms_focus_history', []);
    history.unshift({
      id: `session-${Date.now()}`,
      mode,
      duration: Math.round((modeConfig[mode].duration - timeLeft) / 60) || modeConfig[mode].duration / 60,
      subject: activeTask?.subject || 'General',
      completedAt: new Date().toISOString(),
    });
    setToStorage('sms_focus_history', history.slice(0, 500));

    if (mode === 'work') {
      setSessionsDone(s => {
        const next = s + 1;
        if (next % SESSIONS_BEFORE_LONG === 0) {
          setMode('long'); setTimeLeft(POMODORO_LONG);
        } else {
          setMode('short'); setTimeLeft(POMODORO_BREAK);
        }
        return next;
      });
      if (activeTask) toggleTask(activeTask.id);
    } else {
      setMode('work'); setTimeLeft(POMODORO_WORK);
    }
    setIsRunning(false);
    addToast?.(`Session complete! ${mode === 'work' ? 'Great focus!' : 'Take a break!'}`, 'success');
  };

  const startTimer = () => { playClick(); setIsRunning(true); };
  const pauseTimer = () => { playClick(); setIsRunning(false); };
  const resetTimer = () => { playClick(); setIsRunning(false); setTimeLeft(modeConfig[mode].duration); };

  const skipMode = () => {
    playClick();
    const next = mode === 'work' ? (sessionsDone % SESSIONS_BEFORE_LONG === SESSIONS_BEFORE_LONG - 1 ? 'long' : 'short') : 'work';
    setMode(next);
    setTimeLeft(modeConfig[next].duration);
    setIsRunning(false);
  };

  const toggleTask = (id) => {
    playClick();
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    setToStorage('sms_focus_tasks', updated);
  };

  const deleteTask = (id) => {
    playClick();
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    setToStorage('sms_focus_tasks', updated);
    if (activeTask?.id === id) setActiveTask(null);
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-[1400px] mx-auto w-full pt-4 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c' }}>
            Pomodoro
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Focus Mode
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a8a29e' }}>
          Pomodoro timer synced with your AI study plan tasks.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left: Timer + Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Flame, label: 'Streak', value: stats.streak, unit: 'days', color: '#ef4444' },
              { icon: Clock, label: 'Today', value: stats.todaySessions, unit: 'sessions', color: '#3b82f6' },
              { icon: Trophy, label: 'Total', value: stats.totalSessions, unit: 'sessions', color: '#f59e0b' },
              { icon: BarChart3, label: 'Hours', value: Math.round(stats.totalMinutes / 60 * 10) / 10, unit: 'hrs', color: '#10b981' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="nova-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15' }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px] font-medium" style={{ color: '#a8a29e' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timer Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="nova-card p-10 flex flex-col items-center"
            style={{ background: `linear-gradient(135deg, ${modeConfig[mode].bg} 0%, #ffffff 60%)` }}
          >
            {/* Mode tabs */}
            <div className="flex gap-2 mb-8">
              {['work', 'short', 'long'].map(m => (
                <button key={m} onClick={() => { playClick(); setMode(m); setTimeLeft(modeConfig[m].duration); setIsRunning(false); }}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: mode === m ? modeConfig[m].color : 'rgba(0,0,0,0.04)',
                    color: mode === m ? '#fff' : '#a8a29e',
                    boxShadow: mode === m ? `0 4px 12px ${modeConfig[m].color}40` : 'none',
                  }}>
                  {modeConfig[m].label}
                </button>
              ))}
            </div>

            {/* Ring */}
            <div className="relative mb-8">
              <TimerRing progress={timeLeft / modeConfig[mode].duration} color={modeConfig[mode].color} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black tracking-tighter" style={{ color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm font-semibold mt-2" style={{ color: modeConfig[mode].color }}>
                  {modeConfig[mode].label}
                </span>
                <span className="text-xs mt-1" style={{ color: '#a8a29e' }}>
                  Session {sessionsDone + 1} · {sessionsDone % SESSIONS_BEFORE_LONG}/{SESSIONS_BEFORE_LONG}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={resetTimer} className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
                style={{ borderColor: 'var(--border-default)', color: '#a8a29e' }}>
                <RotateCcw size={18} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={isRunning ? pauseTimer : startTimer}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${modeConfig[mode].color}, ${modeConfig[mode].color}dd)`,
                  boxShadow: `0 8px 24px ${modeConfig[mode].color}50`,
                }}>
                {isRunning ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={skipMode} className="w-12 h-12 rounded-xl border-2 flex items-center justify-center"
                style={{ borderColor: 'var(--border-default)', color: '#a8a29e' }}>
                <SkipForward size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Active task */}
          {activeTask && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="nova-card p-5 flex items-center gap-4"
              style={{ borderLeft: '4px solid #ea580c' }}>
              <Target size={20} style={{ color: '#ea580c' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#a8a29e' }}>Currently Studying</p>
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{activeTask.title}</p>
              </div>
              <button onClick={() => setActiveTask(null)} style={{ color: '#a8a29e' }}><X size={16} /></button>
            </motion.div>
          )}
        </div>

        {/* Right: Tasks + History */}
        <div className="space-y-6">
          {/* Task list */}
          <div className="nova-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                Study Tasks
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c' }}>
                {incompleteTasks.length} left
              </span>
            </div>

            {incompleteTasks.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles size={28} className="mx-auto mb-2" style={{ color: '#d6d3d1' }} />
                <p className="text-xs" style={{ color: '#a8a29e' }}>No tasks yet</p>
                <p className="text-[10px] mt-1" style={{ color: '#d6d3d1' }}>Generate a schedule in Study Planner</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {incompleteTasks.slice(0, 15).map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask}
                      onStart={() => { setActiveTask(task); if (!isRunning) startTimer(); }} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="nova-card p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#a8a29e' }}>
                Completed ({completedTasks.length})
              </h4>
              <div className="space-y-1">
                <AnimatePresence>
                  {completedTasks.slice(0, 8).map(task => (
                    <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* History toggle */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}
            onClick={() => { playClick(); setShowHistory(!showHistory); }}
            className="w-full nova-card p-4 flex items-center justify-between text-sm font-semibold"
            style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-2"><Clock size={15} />Session History</span>
            <ChevronRight size={16} style={{ transform: showHistory ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }} />
          </motion.button>
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="nova-card p-5 max-h-[320px] overflow-y-auto">
                  <SessionHistory />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};