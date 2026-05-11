import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Users, ShieldCheck, GraduationCap, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: '#ea580c', bg: '#fff7ed' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '#1c1917', bg: '#fafaf9' },
  { id: 'parent', label: 'Parent', icon: Users, color: '#0891b2', bg: '#ecfeff' },
];

const FEATURE_BULLETS = [
  'AI-powered study planner with personalized schedules',
  'Real-time attendance tracking & analytics',
  'Smart exam preparation tools',
  'Instant grades & progress insights',
  'Class notes collaboration',
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  // Warm particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.25 + 0.05,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 88, 12, ${p.opacity})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', handleResize); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      setLoading(true);
      setError('');
      const result = await authService.login(email, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Please try again.');
        return;
      }
      const user = result.user;
      const dest = user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
      navigate(dest);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 40%, #ffffff 100%)' }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center w-[55%] px-16 relative" style={{ zIndex: 1 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1c1917' }}>OP-CS Connect</h1>
              <p className="text-xs font-medium" style={{ color: '#78716c' }}>Academic Excellence Platform</p>
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} style={{ color: '#ea580c' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ea580c' }}>Welcome back</span>
          </div>
          <h2 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: '#1c1917', letterSpacing: '-0.02em' }}>
            Your academic<br />
            <span style={{ color: '#ea580c' }}>journey starts here.</span>
          </h2>
          <p className="text-base leading-relaxed max-w-md mb-10" style={{ color: '#57534e' }}>
            The complete school management platform designed to help students, teachers, and parents stay connected and excel together.
          </p>
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4 mb-12"
        >
          {FEATURE_BULLETS.map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(234, 88, 12, 0.1)' }}>
                <ChevronRight size={12} style={{ color: '#ea580c' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#44403c' }}>{feat}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-12"
        >
          {[
            { value: '2,400+', label: 'Active Students' },
            { value: '98%', label: 'Satisfaction' },
            { value: '50+', label: 'Partner Schools' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>{s.value}</div>
              <div className="text-xs font-medium" style={{ color: '#a8a29e' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative" style={{ zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: '#1c1917' }}>OP-CS Connect</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-orange-200/30 overflow-hidden" style={{ border: '1px solid rgba(234, 88, 12, 0.1)' }}>

            {/* Card header */}
            <div className="px-8 pt-8 pb-6" style={{ background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.04), rgba(249, 115, 22, 0.02))' }}>
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#1c1917' }}>Sign in to your account</h2>
              <p className="text-sm" style={{ color: '#78716c' }}>Enter your credentials to continue</p>
            </div>

            <div className="px-8 pb-8 pt-6">
              {/* Role tabs */}
              <div className="flex gap-1.5 p-1.5 rounded-2xl mb-6" style={{ background: '#f5f5f4' }}>
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRole(r.id); setEmail(''); setPassword(''); setError(''); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: selectedRole === r.id ? 'white' : 'transparent',
                      color: selectedRole === r.id ? r.color : '#a8a29e',
                      boxShadow: selectedRole === r.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <r.icon size={13} />
                    <span className="hidden sm:inline">{r.label}</span>
                  </button>
                ))}
              </div>


              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#57534e' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#a8a29e' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); }}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium bg-white transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                      style={{ borderColor: error && !email ? '#ef4444' : '#e7e5e4', color: '#1c1917' }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#57534e' }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#a8a29e' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); }}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 rounded-xl border text-sm font-medium bg-white transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                      style={{ borderColor: error && !password ? '#ef4444' : '#e7e5e4', color: '#1c1917' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-gray-100"
                    >
                      {showPassword
                        ? <EyeOff size={16} style={{ color: '#a8a29e' }} />
                        : <Eye size={16} style={{ color: '#a8a29e' }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:brightness-105 active:scale-[0.98] mt-2"
                  style={{ background: '#ea580c', boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)' }}
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                    : <><span>Sign In</span><ArrowRight size={16} /></>
                  }
                </button>
              </form>

              {/* Forgot / register */}
              <div className="flex items-center justify-between mt-4">
                <button className="text-xs font-semibold transition-colors hover:underline" style={{ color: '#ea580c' }}>
                  Forgot password?
                </button>
                <button className="text-xs font-semibold transition-colors hover:underline" style={{ color: '#78716c' }}>
                  Contact admin
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#a8a29e' }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export { Login as Login };