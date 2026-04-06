import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

export const Login = ({ onLogin }) => {
  const { playClick, playBlip } = useSound();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour12: false }));
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    playBlip();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await Promise.resolve(onLogin(email.trim().toLowerCase(), password.trim()));
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#ffffff' }}>
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 nova-dot-grid opacity-60" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vh] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255, 107, 157, 0.07), transparent 60%)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vh] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent 60%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative z-10 w-[55%] border-r" style={{ borderColor: 'var(--border-default)' }}>
        <div className="h-full flex flex-col justify-between max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#111111', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <span className="text-white font-bold text-base">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Cornerstone</h1>
              <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                SchoolSync Platform
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-5xl font-bold leading-[1.1] tracking-tight">
              <span style={{ color: 'var(--text-primary)' }}>Learn.</span><br/>
              <span style={{ color: '#ff6b9d' }}>Grow.</span><br/>
              <span style={{ color: 'var(--text-primary)' }}>Succeed.</span>
            </h2>
            <p className="text-base max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              A unified platform for students, teachers, and administrators to manage education seamlessly.
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {['AI-Powered', 'Real-time', 'Analytics', 'Secure'].map((f, i) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <Zap size={10} />
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between border-t pt-6"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--text-dim)' }}>v3.0.0 — SchoolSync</p>
            <p className="text-base font-bold font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>[ {timeStr} ]</p>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold mb-4"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Secure Access
            </span>
            <h3 className="text-3xl font-bold tracking-tight mt-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Email address</label>
              <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field pl-11" placeholder="you@schoolsync.edu" required />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11" placeholder="Enter your password" required />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: 'var(--text-dim)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="p-3 rounded-xl text-sm font-medium flex items-center gap-2"
                    style={{ background: 'rgba(244, 63, 94, 0.08)', color: 'var(--semantic-error)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-xs text-center mt-8" style={{ color: 'var(--text-dim)' }}>
            Protected by enterprise-grade security
          </p>
        </motion.div>
      </div>
    </div>
  );
};