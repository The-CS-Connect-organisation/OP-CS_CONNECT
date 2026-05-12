import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { ForgotPassword } from './ForgotPassword';
import { Ripple } from '@/components/ui/Ripple';
import { TechOrbitDisplay } from '@/components/ui/TechOrbitDisplay';
import { AuthTabs } from '@/components/ui/AuthTabs';

const ALL_ROLES = [
  { id: 'student',   label: 'Student',   color: '#ff6b9d' },
  { id: 'teacher',   label: 'Teacher',   color: '#a855f7' },
  { id: 'admin',      label: 'Admin',    color: '#10b981' },
  { id: 'parent',     label: 'Parent',   color: '#3b82f6' },
  { id: 'driver',     label: 'Driver',   color: '#f59e0b' },
  { id: 'librarian',  label: 'Lib',      color: '#8b5cf6' },
];

const DEMO_USERS = [
  { role: 'student',   label: 'Student 1', email: 'student@schoolsync.edu',    password: 'student123' },
  { role: 'student',   label: 'Student 2', email: 'student2@schoolsync.edu',    password: 'student123' },
  { role: 'student',   label: 'Student 3', email: 'student3@schoolsync.edu',    password: 'student123' },
  { role: 'teacher',   label: 'Teacher 1', email: 'teacher@schoolsync.edu',    password: 'teacher123' },
  { role: 'teacher',   label: 'Teacher 2', email: 'teacher2@schoolsync.edu',  password: 'teacher123' },
  { role: 'teacher',   label: 'Teacher 3', email: 'teacher3@schoolsync.edu',  password: 'teacher123' },
  { role: 'admin',     label: 'Admin 1',   email: 'admin@schoolsync.edu',      password: 'admin123' },
  { role: 'admin',     label: 'Admin 2',   email: 'admin2@schoolsync.edu',     password: 'admin123' },
  { role: 'admin',     label: 'Admin 3',   email: 'admin3@schoolsync.edu',     password: 'admin123' },
  { role: 'parent',    label: 'Parent 1',  email: 'parent@schoolsync.edu',     password: 'parent123' },
  { role: 'parent',    label: 'Parent 2',  email: 'parent2@schoolsync.edu',    password: 'parent123' },
  { role: 'parent',    label: 'Parent 3',  email: 'parent3@schoolsync.edu',    password: 'parent123' },
  { role: 'driver',    label: 'Driver 1',  email: 'driver@schoolsync.edu',     password: 'driver123' },
  { role: 'driver',    label: 'Driver 2',  email: 'driver2@schoolsync.edu',    password: 'driver123' },
  { role: 'driver',    label: 'Driver 3',  email: 'driver3@schoolsync.edu',    password: 'driver123' },
  { role: 'librarian', label: 'Lib 1',     email: 'librarian@schoolsync.edu',  password: 'librarian123' },
  { role: 'librarian', label: 'Lib 2',     email: 'librarian2@schoolsync.edu', password: 'librarian123' },
  { role: 'librarian', label: 'Lib 3',     email: 'librarian3@schoolsync.edu', password: 'librarian123' },
];

const TechIcon = ({ emoji, color }) => (
  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
    <span className="text-2xl">{emoji}</span>
  </div>
);

const LoginForm = ({ selectedRole, onRoleChange, email, setEmail, password, setPassword, handleSubmit, error, loading, demoUsers, onDemoClick, playClick }) => {
  const [showPassword, setShowPassword] = useState(false);

  const roleUsers = demoUsers.filter(u => u.role === selectedRole);
  const selectedRoleData = ALL_ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] dark:bg-[#09090b] overflow-hidden relative font-sans text-slate-900 dark:text-slate-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 dark:bg-blue-950/40 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 dark:bg-indigo-950/40 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] p-6"
      >
        <div className="text-center mb-8">
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src="/cornerstone-logo.svg"
            alt="Cornerstone"
            className="w-14 h-14 rounded-2xl object-contain shadow-sm border border-slate-200 dark:border-zinc-700 mx-auto mb-5"
            style={{ background: 'white', padding: '6px' }}
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cornerstone</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">SchoolSync Academic Portal</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex gap-1 p-1 rounded-2xl mb-5 bg-slate-100 dark:bg-zinc-800">
            {ALL_ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => { onRoleChange(r.id); setEmail(''); setPassword(''); setError(''); playClick(); }}
                className="flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all duration-200"
                style={{
                  background: selectedRole === r.id ? 'white' : 'transparent',
                  color: selectedRole === r.id ? r.color : '#94a3b8',
                  boxShadow: selectedRole === r.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-2 text-center">
              Demo — {selectedRoleData?.label}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roleUsers.map((cred) => (
                <motion.button
                  key={cred.email}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { playClick(); setEmail(cred.email); setPassword(cred.password); onDemoClick?.(); }}
                  className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border"
                  style={{
                    background: selectedRoleData?.color + '15',
                    color: selectedRoleData?.color,
                    borderColor: selectedRoleData?.color + '40'
                  }}
                >
                  {cred.label}
                </motion.button>
              ))}
            </div>
            {roleUsers.find(c => c.email === email) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-between"
              >
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{email}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{roleUsers.find(c => c.email === email)?.password}</span>
              </motion.div>
            )}
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">or enter manually</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-400/5 transition-all"
                  placeholder="you@schoolsync.edu"
                  required
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password</label>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl py-3 pl-11 pr-11 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-blue-500/5 dark:focus:ring-blue-400/5 transition-all"
                  placeholder="Enter password"
                  required
                />
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                <button
                  type="button"
                  onClick={() => { playClick(); setShowPassword(!showPassword); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors p-1"
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
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={playClick}
              className={`w-full h-12 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all active:scale-[0.98] ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-slate-800 dark:hover:bg-zinc-200 shadow-lg shadow-slate-900/10 dark:shadow-none'}`}
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-white/50 dark:bg-zinc-900/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                   <div className="w-1.5 h-1.5 bg-white/50 dark:bg-zinc-900/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                   <div className="w-1.5 h-1.5 bg-white/50 dark:bg-zinc-900/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-slate-900 dark:text-white font-semibold hover:underline underline-offset-4 transition-all"
            >
              Contact Admin
            </button>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-10 font-medium uppercase tracking-widest">
            Cornerstone SchoolSync Platform
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export const Login = ({ onLogin, onSwitch }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { playClick, playBlip } = useSound();

  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1]);
  if (params.has('autologin') && params.has('pass')) {
    return null;
  }

  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('schoolsync_autofill');
    console.log('Checking sessionStorage for autofill:', raw);
    if (!raw) {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.split('?')[1]);
      const autologin = params.get('autologin');
      const pass = params.get('pass');
      if (autologin && pass) {
        setEmail(decodeURIComponent(autologin));
        setPassword(decodeURIComponent(pass));
        setLoading(true);
        onLogin(decodeURIComponent(autologin), decodeURIComponent(pass)).then((result) => {
          if (result?.success) {
            navigate(`/${result.user.role}/dashboard`);
            window.location.hash = window.location.hash.split('?')[0];
          } else {
            setError(result?.error || 'Login failed');
            setLoading(false);
          }
        });
      }
      return;
    }
    try {
      const { email: e, password: p, portal } = JSON.parse(raw);
      if (portal !== 'academics') return;
      sessionStorage.removeItem('schoolsync_autofill');
      if (!e || !p) return;
      setEmail(e);
      setPassword(p);
      setLoading(true);
      onLogin(e, p).then((result) => {
        if (result?.success) {
          navigate(`/${result.user.role}/dashboard`);
        } else {
          setError(result?.error || 'Login failed');
          setLoading(false);
        }
      });
    } catch {
      sessionStorage.removeItem('schoolsync_autofill');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playBlip();
    await new Promise(r => setTimeout(r, 800));
    const result = await onLogin(email.trim().toLowerCase(), password.trim());
    if (result.success) {
      navigate(`/${result.user.role}/dashboard`);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <LoginForm
      selectedRole={selectedRole}
      onRoleChange={setSelectedRole}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      error={error}
      loading={loading}
      demoUsers={DEMO_USERS}
      playClick={playClick}
    />
  );
};
