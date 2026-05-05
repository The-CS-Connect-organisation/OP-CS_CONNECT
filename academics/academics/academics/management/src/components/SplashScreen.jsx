import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCog } from 'lucide-react';

function SplashScreen({ onComplete, onLogin }) {
  const [phase, setPhase] = useState('logo');
  const [email, setEmail] = useState('admin@schoolsync.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // Only auto-complete if no onLogin handler (simple splash mode)
    if (!onLogin) {
      const timer1 = setTimeout(() => setPhase('text'), 800);
      const timer2 = setTimeout(() => setPhase('complete'), 1500);
      const timer3 = setTimeout(() => onComplete(), 1600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // If onLogin is provided, show login form after animation
      const timer1 = setTimeout(() => setPhase('text'), 800);
      const timer2 = setTimeout(() => setPhase('login'), 1500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [onComplete, onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!onLogin) {
      onComplete();
      return;
    }
    
    setLoginError('');
    setLoginLoading(true);
    try {
      const result = await onLogin(email.trim().toLowerCase(), password.trim());
      if (result?.success) {
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
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-50 to-green-50 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        {/* School Logo - Professional Design */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: phase === 'logo' || phase === 'text' || phase === 'login' ? 1 : 1, 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.8, 
            type: "spring",
            stiffness: 100,
          }}
          className="relative mb-6"
        >
          {/* Outer ring */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-green-600 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
              {/* Inner decorative circle */}
              <div className="absolute inset-2 rounded-full border-2 border-blue-100" />
              
              {/* School Icon - Academic Building */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="relative z-10">
                {/* Building base */}
                <rect x="16" y="28" width="32" height="20" rx="2" fill="url(#buildingGrad)" />
                {/* Roof */}
                <path d="M12 28 L32 12 L52 28 Z" fill="url(#roofGrad)" />
                {/* Door */}
                <rect x="26" y="36" width="12" height="12" rx="1" fill="url(#doorGrad)" />
                {/* Windows */}
                <rect x="20" y="32" width="4" height="4" rx="0.5" fill="#3b82f6" opacity="0.8" />
                <rect x="40" y="32" width="4" height="4" rx="0.5" fill="#3b82f6" opacity="0.8" />
                {/* Bell tower */}
                <rect x="28" y="18" width="8" height="6" rx="1" fill="#22c55e" />
                {/* Cross on top */}
                <path d="M32 8 L32 14 M29 11 L35 11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                {/* Steps */}
                <rect x="20" y="48" width="24" height="2" rx="0.5" fill="#6b7280" opacity="0.5" />
                <rect x="22" y="50" width="20" height="2" rx="0.5" fill="#6b7280" opacity="0.4" />
                
                <defs>
                  <linearGradient id="buildingGrad" x1="16" y1="28" x2="48" y2="48">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="roofGrad" x1="12" y1="12" x2="52" y2="28">
                    <stop stopColor="#22c55e" />
                    <stop offset="1" stopColor="#16a34a" />
                  </linearGradient>
                  <linearGradient id="doorGrad" x1="26" y1="36" x2="38" y2="48">
                    <stop stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-green-500 blur-xl opacity-30 -z-10" />
        </motion.div>

        {/* School Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase === 'text' || phase === 'login' ? 1 : 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Cornerstone School
          </h1>
          <p className="text-sm text-gray-500 mt-1 tracking-wide">
            Management Portal
          </p>
        </motion.div>

        {/* Loading indicator - shown during initial animation */}
        <AnimatePresence>
          {phase === 'logo' || phase === 'text' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-2">Loading...</span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Login Form - shown when onLogin is provided */}
        <AnimatePresence>
          {phase === 'login' && onLogin && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-6"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="admin@schoolsync.edu"
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
                        className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                      >
                        {loginError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className={`w-full h-11 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all ${loginLoading ? 'opacity-70 cursor-wait' : 'hover:shadow-lg active:scale-[0.98]'}`}
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

                {/* Skip link - REMOVED: no separate login page exists */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default SplashScreen;
