import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen, Users, Bus, UserCog } from 'lucide-react';

const PHRASES = ['Learn.', 'Grow.', 'Succeed.'];

// Demo credentials - only Alicia Morgan (Admin)
// New accounts can be created via the Create Account feature
const DEMO_PROFILES = [
  { role: 'Admin',    icon: UserCog,       color: '#10b981', bg: '#f0fdf4', email: 'admin@schoolsync.edu',  password: 'admin123'   },
];

const AuroraBlob = ({ color, x, y, size, delay, duration }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0.3 }}
    animate={{
      scale: [0.8, 1.2, 0.9, 1.1, 0.8],
      opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
      x: [0, 30, -20, 40, 0],
      y: [0, -20, 30, -10, 0]
    }}
    transition={{ duration: duration || 8, delay: delay || 0, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
    className="absolute rounded-full"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: 'blur(80px)' }}
  />
);

const Particle = ({ delay, duration, size, startX, startY, color }) => {
  const rx = (Math.random() - 0.5) * 60;
  const ry = -(60 + Math.random() * 80);
  return (
    <motion.div
      initial={{ left: startX, top: startY, opacity: 0, scale: 0 }}
      animate={{ y: [0, ry, 0], x: [0, rx, 0], opacity: [0, 0.6, 0], scale: [0, size, 0] }}
      transition={{ duration: duration || 3, delay: delay || 0, repeat: Infinity, repeatDelay: Math.random() * 2, ease: "easeOut" }}
      className="absolute rounded-full"
      style={{ width: size * 3, height: size * 3, background: color || 'rgba(255, 107, 157, 0.5)', filter: 'blur(1px)' }}
    />
  );
};

const LoadingCounter = ({ duration }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);
      if (p >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);
  return <span>{Math.round(progress)}%</span>;
};

const SplashScreen = ({ onComplete, onLogin }) => {
  // phase: 0=intro animation, 1=tagline, 2=show login form
  const [phase, setPhase] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const logoControls = useAnimation();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 0.4 + Math.random() * 1,
      startX: `${Math.random() * 100}%`,
      startY: `${Math.random() * 100}%`,
      color: ['rgba(255, 107, 157, 0.5)', 'rgba(168, 85, 247, 0.5)', 'rgba(59, 130, 246, 0.5)'][Math.floor(Math.random() * 3)]
    }))
  ).current;

  useEffect(() => {
    if (phase === 1) {
      const interval = setInterval(() => setPhraseIndex(p => (p + 1) % PHRASES.length), 700);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 15,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 15,
      });
    }
  }, []);

  useEffect(() => {
    logoControls.start({
      scale: 1, opacity: 1, y: 0, filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    });
    const t1 = setTimeout(() => setPhase(1), 800);
    // After tagline animation, show login form instead of auto-completing
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [logoControls]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!onLogin) { onComplete(); return; }
    setLoginError('');
    setLoginLoading(true);
    try {
      const result = await onLogin(email.trim().toLowerCase(), password.trim());
      if (result?.success) {
        // Dismiss splash so the dashboard can render
        onComplete();
      } else {
        setLoginError(result?.error || 'Invalid email or password');
        setLoginLoading(false);
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
      setLoginLoading(false);
    }
  };

  const handleSkip = () => onComplete();

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#ffffff' }}
    >
      {/* Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AuroraBlob color="rgba(255, 107, 157, 0.12)" x={5} y={5} size="45vw" delay={0} duration={12} />
        <AuroraBlob color="rgba(168, 85, 247, 0.1)" x={55} y={65} size="38vw" delay={3} duration={14} />
        <AuroraBlob color="rgba(59, 130, 246, 0.08)" x={75} y={15} size="32vw" delay={1} duration={10} />
        <AuroraBlob color="rgba(255, 191, 0, 0.06)" x={25} y={75} size="28vw" delay={2} duration={16} />
      </div>

      {/* Dot Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
      }} />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative flex flex-col items-center z-10 px-4 w-full max-w-[420px]"
        style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40, filter: 'blur(20px)' }}
          animate={logoControls}
          className="relative mb-4"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 180, 360] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-20px] rounded-full"
            style={{ background: 'conic-gradient(from 0deg, rgba(168,85,247,0.2), rgba(255,107,157,0.1), rgba(59,130,246,0.2), rgba(168,85,247,0.2))', filter: 'blur(15px)' }}
          />
          <motion.div whileHover={{ scale: 1.02 }} className="relative z-10" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}>
            <img src="logo.png" alt="SchoolSync Logo" className="h-16 md:h-20 w-auto object-contain" />
          </motion.div>
          {/* Orbiting dots */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-40px]">
            <div className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full" style={{ transform: 'translateX(-50%)', background: '#ff6b9d', boxShadow: '0 0 12px rgba(255,107,157,0.6)' }} />
            <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full" style={{ transform: 'translateX(-50%)', background: '#a855f7', boxShadow: '0 0 10px rgba(168,85,247,0.6)' }} />
            <div className="absolute left-0 top-1/2 w-1.5 h-1.5 rounded-full" style={{ transform: 'translateY(-50%)', background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />
            <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full" style={{ transform: 'translateY(-50%)', background: '#f59e0b', boxShadow: '0 0 10px rgba(245,158,11,0.6)' }} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-1"
        >
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Cornerstone SchoolSync</h1>
          <p className="text-xs text-gray-500 mt-0.5">Learning Management System</p>
        </motion.div>

        {/* Animated phrases — shown during phase 1 */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-8 flex items-center justify-center mb-2"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="text-base font-bold tracking-tight text-gray-800"
                >
                  {PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading bar — shown during phase 0 and 1 */}
        <AnimatePresence>
          {phase < 2 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.8 }}
              className="w-48 mt-4"
            >
              <div className="h-1.5 rounded-full overflow-hidden relative bg-gray-100">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #ff6b9d, #a855f7, #3b82f6)' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Loading</span>
                <span className="text-[10px] font-mono text-gray-400"><LoadingCounter duration={2200} /></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form — shown during phase 2 */}
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-4"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                {/* Quick Login Role Buttons */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3 text-center">Demo Account</p>
                  <div className="grid grid-cols-1 gap-2">
                    {DEMO_PROFILES.map(({ role, icon: Icon, color, bg, email: demoEmail, password: demoPass }) => (
                      <motion.button
                        key={role}
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setEmail(demoEmail); setPassword(demoPass); setLoginError(''); }}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all"
                        style={{
                          background: email === demoEmail ? bg : '#f9fafb',
                          borderColor: email === demoEmail ? color : '#e5e7eb',
                        }}
                        title={`Login as ${role}`}
                      >
                        <Icon size={16} style={{ color }} />
                        <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: email === demoEmail ? color : '#9ca3af' }}>
                          {role}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">or create new account</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@school.edu"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                      />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {loginError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                        {loginError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full h-11 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all ${loginLoading ? 'opacity-70 cursor-wait' : 'hover:bg-gray-800 active:scale-[0.98] shadow-lg shadow-gray-900/10'}`}
                  >
                    {loginLoading ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Skip link */}
              <p className="text-center mt-4 text-xs text-gray-400">
                <button onClick={handleSkip} className="hover:text-gray-600 transition-colors underline underline-offset-2">
                  Continue to login page
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Corner accents */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="absolute top-8 left-8 w-12 h-[2px]" style={{ background: 'linear-gradient(90deg, #ff6b9d, transparent)' }} />
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="absolute top-8 right-8 w-12 h-[2px]" style={{ background: 'linear-gradient(-90deg, #a855f7, transparent)' }} />
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="absolute bottom-8 left-8 w-12 h-[2px]" style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="absolute bottom-8 right-8 w-12 h-[2px]" style={{ background: 'linear-gradient(-90deg, #ff6b9d, transparent)' }} />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
