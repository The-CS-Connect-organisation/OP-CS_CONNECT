import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen, Users, Bus, UserCog } from 'lucide-react';

// ── Demo credentials ──────────────────────────────────────────────────────────
const ROLE_GROUPS = [
  { role: 'Student', icon: GraduationCap, color: '#f59e0b', accounts: [
    { email: 'student@schoolsync.edu',  password: 'student123', num: 1 },
    { email: 'student2@schoolsync.edu', password: 'student123', num: 2 },
    { email: 'student3@schoolsync.edu', password: 'student123', num: 3 },
  ]},
  { role: 'Teacher', icon: BookOpen, color: '#a855f7', accounts: [
    { email: 'teacher@schoolsync.edu',  password: 'teacher123', num: 1 },
    { email: 'teacher2@schoolsync.edu', password: 'teacher123', num: 2 },
    { email: 'teacher3@schoolsync.edu', password: 'teacher123', num: 3 },
  ]},
  { role: 'Parent', icon: Users, color: '#3b82f6', accounts: [
    { email: 'parent@schoolsync.edu',  password: 'parent123', num: 1 },
    { email: 'parent2@schoolsync.edu', password: 'parent123', num: 2 },
    { email: 'parent3@schoolsync.edu', password: 'parent123', num: 3 },
  ]},
  { role: 'Driver', icon: Bus, color: '#10b981', accounts: [
    { email: 'driver@schoolsync.edu',  password: 'driver123', num: 1 },
    { email: 'driver2@schoolsync.edu', password: 'driver123', num: 2 },
    { email: 'driver3@schoolsync.edu', password: 'driver123', num: 3 },
  ]},
  { role: 'Admin', icon: UserCog, color: '#ef4444', accounts: [
    { email: 'admin@schoolsync.edu',  password: 'admin123', num: 1 },
    { email: 'admin2@schoolsync.edu', password: 'admin123', num: 2 },
    { email: 'admin3@schoolsync.edu', password: 'admin123', num: 3 },
  ]},
];

const ROLE_MAP = {
  'student@schoolsync.edu': 'student', 'student2@schoolsync.edu': 'student', 'student3@schoolsync.edu': 'student',
  'teacher@schoolsync.edu': 'teacher', 'teacher2@schoolsync.edu': 'teacher', 'teacher3@schoolsync.edu': 'teacher',
  'parent@schoolsync.edu': 'parent',   'parent2@schoolsync.edu': 'parent',   'parent3@schoolsync.edu': 'parent',
  'driver@schoolsync.edu': 'driver',   'driver2@schoolsync.edu': 'driver',   'driver3@schoolsync.edu': 'driver',
  'admin@schoolsync.edu': 'admin',     'admin2@schoolsync.edu': 'admin',     'admin3@schoolsync.edu': 'admin',
};

// ── Inline Login Panel ────────────────────────────────────────────────────────
const InlineLoginPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('Student');

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);
    const role = ROLE_MAP[email.trim().toLowerCase()] || 'student';
    const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
    const encodedPassword = encodeURIComponent(password.trim());
    window.location.href = `/OP-CS_CONNECT/#/${role}/dashboard?autologin=${encodedEmail}&pass=${encodedPassword}`;
  };

  const activeGroup = ROLE_GROUPS.find(g => g.role === activeRole);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Sign In</h3>
        <p className="text-xs text-slate-400 mt-0.5">Academic Portal · Cornerstone SchoolSync</p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Demo credentials — role tabs */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quick Demo Login</p>

          {/* Role tabs */}
          <div className="flex gap-1 mb-2 overflow-x-auto no-scrollbar">
            {ROLE_GROUPS.map(({ role, icon: Icon, color }) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeRole === role ? `${color}15` : '#f8fafc',
                  color: activeRole === role ? color : '#94a3b8',
                  border: `1px solid ${activeRole === role ? color + '40' : '#e2e8f0'}`,
                }}
              >
                <Icon size={11} />
                {role}
              </button>
            ))}
          </div>

          {/* 3 accounts for active role */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-1"
            >
              {activeGroup?.accounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoSelect(acc)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left"
                    style={{
                      background: isSelected ? `${activeGroup.color}08` : '#f8fafc',
                      borderColor: isSelected ? activeGroup.color + '50' : '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
                        style={{ background: activeGroup.color }}>
                        {acc.num}
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 truncate max-w-[140px]">{acc.email}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{acc.password}</span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[9px] text-slate-400 uppercase tracking-widest font-semibold">or enter manually</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Email address"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              required
            />
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              required
            />
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-xs text-red-500 font-medium flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500" />{error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <div className="flex gap-1">
                {[0, 0.1, 0.2].map((d, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
            ) : (
              <><span>Sign In</span><ArrowRight size={15} /></>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

// ── Floating emoji orbs ───────────────────────────────────────────────────────
const FloatingOrbs = () => {
  const items = [
    { icon: '📚', x: 5,  y: 15, dur: 14, delay: 0   },
    { icon: '🎓', x: 88, y: 20, dur: 17, delay: 1.5 },
    { icon: '📝', x: 3,  y: 65, dur: 11, delay: 3   },
    { icon: '🏆', x: 92, y: 70, dur: 19, delay: 0.8 },
    { icon: '📐', x: 18, y: 80, dur: 15, delay: 2.2 },
    { icon: '🔬', x: 80, y: 10, dur: 13, delay: 4   },
    { icon: '✏️', x: 50, y: 3,  dur: 16, delay: 1   },
    { icon: '🌟', x: 60, y: 90, dur: 10, delay: 0.5 },
  ];
  return (
    <>
      {items.map((item, i) => (
        <motion.div key={i} className="absolute text-2xl pointer-events-none select-none hidden lg:block"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: item.dur, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}>
          {item.icon}
        </motion.div>
      ))}
    </>
  );
};

// ── Animated grid ─────────────────────────────────────────────────────────────
const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
    <svg className="w-full h-full">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
        </pattern>
      </defs>
      <motion.rect width="100%" height="100%" fill="url(#grid)"
        animate={{ x: [0, 60, 0], y: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
    </svg>
  </div>
);

// ── Morphing blob ─────────────────────────────────────────────────────────────
const MorphBlob = ({ style, delay, duration }) => (
  <motion.div className="absolute pointer-events-none blur-3xl" style={style}
    animate={{
      borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%'],
      scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0],
    }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }} />
);

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  return (
    <section
      aria-label="Hero"
      className="relative flex items-center justify-center overflow-hidden bg-white px-6 min-h-screen"
      style={{ paddingTop: '72px', paddingBottom: '48px', boxSizing: 'border-box' }}
    >
      {/* Background */}
      <AnimatedGrid />
      <MorphBlob delay={0} duration={14} style={{ width: 500, height: 500, top: '5%', left: '-10%', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
      <MorphBlob delay={3} duration={17} style={{ width: 400, height: 400, bottom: '5%', right: '-8%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />

      {!reducedMotion && <FloatingOrbs />}

      {/* Two-column layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

        {/* ── Left: Headline + stats ── */}
        <div className="flex-1 text-center lg:text-left max-w-xl">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-300 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🔥</motion.span>
            Unified School Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-3 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            One Platform.
          </motion.h1>

          <motion.div
            className="text-2xl sm:text-3xl font-bold mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b, #f97316, #fbbf24, #f59e0b)', backgroundSize: '300% 100%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              Complete School Management
            </motion.span>
          </motion.div>

          <motion.p
            className="text-base sm:text-lg text-gray-500 max-w-md mx-auto lg:mx-0 leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            The unified school management system for students, teachers, parents, and administrators — all in one place.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex justify-center lg:justify-start gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { val: '10K+', label: 'Students' },
              { val: '500+', label: 'Teachers' },
              { val: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <motion.div key={i} className="text-center lg:text-left"
                whileHover={{ scale: 1.1 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}>
                <div className="text-2xl font-black text-orange-500">{stat.val}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: Embedded login form ── */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <InlineLoginPanel />
        </div>
      </div>
    </section>
  );
}
