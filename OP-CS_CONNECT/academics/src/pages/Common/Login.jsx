import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

export const Login = ({ onLogin, onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { playClick, playBlip } = useSound();
  const autofillAttempted = useRef(false);

  // Auto-fill AND auto-submit from landing page sessionStorage in one shot
  useEffect(() => {
    const raw = sessionStorage.getItem('schoolsync_autofill');
    if (!raw) return;
    try {
      const { email: e, password: p, portal } = JSON.parse(raw);
      if (portal !== 'academics') return;
      sessionStorage.removeItem('schoolsync_autofill');
      if (!e || !p) return;
      // Set state for visual feedback
      setEmail(e);
      setPassword(p);
      // Submit immediately without waiting for re-render
      setLoading(true);
      onLogin(e, p).then((result) => {
        if (!result?.success) {
          setError(result?.error || 'Login failed');
          setLoading(false);
        }
      }).catch(() => {
        setError('Login failed. Please try again.');
        setLoading(false);
      });
    } catch {
      sessionStorage.removeItem('schoolsync_autofill');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playBlip();
    
    // Smooth delay for auth feel
    await new Promise(r => setTimeout(r, 800));
    
    const result = await onLogin(email.trim().toLowerCase(), password.trim());
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans text-slate-900">
      {/* 🌫️ Soft Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px] p-6"
      >
        {/* Brand Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 mb-5"
          >
            <ShieldCheck size={28} className="text-blue-600" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cornerstone</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Academic Portal Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                  placeholder="you@schoolsync.edu" 
                  required 
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot?</button>
              </div>
              <div className="relative group">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all" 
                  placeholder="Enter password" 
                  required 
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <button 
                  type="button" 
                  onClick={() => { playClick(); setShowPassword(!showPassword); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-600 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-rose-600 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playClick}
              className={`w-full h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-slate-800 shadow-lg shadow-slate-900/10'}`}
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                   <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                   <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <button 
              onClick={onSwitch}
              className="text-slate-900 font-semibold hover:underline underline-offset-4 transition-all"
            >
              Contact Admin
            </button>
          </p>
          <p className="text-[10px] text-slate-400 mt-10 font-medium uppercase tracking-widest">
            Cornerstone SchoolSync Platform
          </p>
        </div>
      </motion.div>
    </div>
  );
};