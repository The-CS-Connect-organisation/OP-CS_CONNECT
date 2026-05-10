import { useRef, useCallback, useState, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GraduationCap, CheckCircle, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Users, Bus, BookOpen, UserCog } from 'lucide-react';

/**
 * HERO SECTION — PROFESSIONAL + INTEGRATED LOGIN
 * Clean institutional messaging above, embedded auth panel below.
 */

const GridPattern = memo(() => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-0">
    <div className="absolute inset-0 bg-[linear-gradient(#1a1a2e_1px,transparent_1px),linear-gradient(90deg,#1a1a2e_1px,transparent_1px)] bg-[size:64px_64px]" />
  </div>
));

const ROLE_GROUPS = [
  { role: 'Student', icon: Users,    color: '#ff6b9d' },
  { role: 'Teacher', icon: BookOpen, color: '#a855f7' },
  { role: 'Parent',  icon: Users,    color: '#3b82f6' },
  { role: 'Admin',   icon: UserCog,  color: '#10b981' },
];

const DEMO_ACCOUNTS = {
  Student:  [{ email: 'student@schoolsync.edu',  password: 'student123' }],
  Teacher:  [{ email: 'teacher@schoolsync.edu',  password: 'teacher123' }],
  Parent:   [{ email: 'parent@schoolsync.edu',    password: 'parent123'  }],
  Admin:    [{ email: 'admin@schoolsync.edu',    password: 'admin123'   }],
};

// ── Embedded Login Panel ─────────────────────────────────────────────────────

const LoginPanel = ({ onSelect }) => {
  const [activeTab, setActiveTab] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    // Small delay then trigger navigation
    setTimeout(() => onSelect(acc.email, acc.password), 100);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    onSelect(email, password);
  };

  const activeAcc = DEMO_ACCOUNTS[activeTab]?.[0];

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        {/* Panel header */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 tracking-tight">Sign In</p>
            <p className="text-[10px] text-gray-500">Cornerstone Academic Portal</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Role tabs */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Portal Access</p>
            <div className="grid grid-cols-4 gap-1.5">
              {ROLE_GROUPS.map(({ role, icon: Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setActiveTab(role); setError(''); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all"
                  style={{
                    background: activeTab === role ? `${color}12` : 'transparent',
                    borderColor: activeTab === role ? color : '#e5e7eb',
                  }}
                >
                  <Icon size={13} style={{ color: activeTab === role ? color : '#9ca3af' }} />
                  <span className="text-[9px] font-semibold" style={{ color: activeTab === role ? color : '#9ca3af' }}>{role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Demo quick-login */}
          {activeAcc && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick Demo</p>
              <button
                type="button"
                onClick={() => handleQuickLogin(activeAcc)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 border-dashed transition-all text-left group"
                style={{ borderColor: ROLE_GROUPS.find(g => g.role === activeTab)?.color + '50' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: ROLE_GROUPS.find(g => g.role === activeTab)?.color }}>
                    →
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-900">{activeAcc.email}</p>
                    <p className="text-[9px] text-gray-400 font-mono">{activeAcc.password}</p>
                  </div>
                </div>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-gray-400"
                >
                  →
                </motion.span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[9px] text-gray-400 uppercase tracking-widest font-semibold">manual</span></div>
          </div>

          {/* Manual form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="Email address"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all"
              />
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all"
              />
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-xs text-red-500 font-medium px-1"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)' }}
            >
              <span>Access Portal</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-gray-400">
            Need access? <span className="text-orange-500 font-semibold">Contact your administrator</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// ── Stat Item ─────────────────────────────────────────────────────────────────

const StatItem = memo(({ value, label, delay }) => (
  <motion.div
    className="flex flex-col items-center px-8 py-5"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</div>
  </motion.div>
));

const StatDivider = memo(() => (
  <div className="hidden md:block w-px h-16 bg-gray-200" />
));

// ── Main Component ────────────────────────────────────────────────────────────

export default function HeroSection({ loginRef }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleLoginSelect = useCallback((email, password) => {
    // Store in sessionStorage so academics portal can pick it up
    sessionStorage.setItem('schoolsync_autofill', JSON.stringify({ email, password, portal: 'academics' }));
    // Navigate to academics portal
    const roleMap = {
      'student@schoolsync.edu': 'student', 'student2@schoolsync.edu': 'student', 'student3@schoolsync.edu': 'student',
      'teacher@schoolsync.edu': 'teacher', 'teacher2@schoolsync.edu': 'teacher', 'teacher3@schoolsync.edu': 'teacher',
      'parent@schoolsync.edu': 'parent', 'parent2@schoolsync.edu': 'parent', 'parent3@schoolsync.edu': 'parent',
      'driver@schoolsync.edu': 'driver', 'driver2@schoolsync.edu': 'driver', 'driver3@schoolsync.edu': 'driver',
      'admin@schoolsync.edu': 'admin', 'admin2@schoolsync.edu': 'admin', 'admin3@schoolsync.edu': 'admin',
    };
    const role = roleMap[email?.toLowerCase()] || 'student';
    window.location.href = `/academics/#/${role}/dashboard?autologin=${encodeURIComponent(email)}&pass=${encodeURIComponent(password)}`;
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)' }}
    >
      <GridPattern />

      {/* Soft ambient blobs */}
      <motion.div
        className="absolute top-[-15%] right-[-5%] w-[45%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[45%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Two-column layout */}
      <div className="relative z-20 min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-20 gap-16">

        {/* ── Left: Hero content ── */}
        <motion.div
          className="flex-1 text-center lg:text-left max-w-lg"
          style={{ y: yOffset, opacity }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-semibold text-orange-700 uppercase tracking-widest mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap size={13} className="text-orange-500" />
            Cornerstone International School
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Unified School
            <br />
            <span className="text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #FF6B35, #F97316)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              Management Platform
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-base md:text-lg text-gray-500 leading-relaxed mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Complete digital infrastructure for administrators, teachers, students, and parents —
            all within a single, secure platform.
          </motion.p>

          {/* Value Props */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {['Attendance & Grading', 'Timetable Management', 'Fee Tracking', 'AI-Powered Insights'].map((item, i) => (
              <motion.span
                key={item}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <CheckCircle size={12} className="text-green-500" />
                {item}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex justify-center lg:justify-start gap-0 divide-x divide-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            {[
              { v: '4', l: 'User Portals' },
              { v: '12+', l: 'Core Modules' },
              { v: '100%', l: 'Digital Workflow' },
            ].map((s, i) => (
              <div key={i} className="px-6 py-2 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.v}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: Login panel ── */}
        <div className="w-full lg:w-auto flex-shrink-0">
          <LoginPanel onSelect={handleLoginSelect} />
        </div>
      </div>
    </section>
  );
}