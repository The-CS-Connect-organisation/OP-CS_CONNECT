import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, GraduationCap, BookOpen, Users, Bus, UserCog } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { ForgotPassword } from './ForgotPassword';

const ALL_ROLES = [
  { id: 'student',   label: 'Student',   icon: GraduationCap, color: '#ff6b9d', bg: '#fff0f5' },
  { id: 'teacher',   label: 'Teacher',   icon: BookOpen,      color: '#a855f7', bg: '#faf0ff' },
  { id: 'admin',      label: 'Admin',    icon: UserCog,       color: '#10b981', bg: '#f0fdf4' },
  { id: 'parent',     label: 'Parent',   icon: Users,         color: '#3b82f6', bg: '#eff6ff' },
  { id: 'driver',     label: 'Driver',   icon: Bus,           color: '#f59e0b', bg: '#fffbeb' },
  { id: 'librarian',  label: 'Lib',      icon: BookOpen,      color: '#8b5cf6', bg: '#f5f3ff' },
];

const DEMO_USERS = [
  { role: 'student',   label: 'Student 1', email: 'student@schoolsync.edu',    password: 'student123',   color: '#ff6b9d', bg: '#fff0f5' },
  { role: 'student',   label: 'Student 2', email: 'student2@schoolsync.edu',    password: 'student123',   color: '#fb7185', bg: '#fff0f5' },
  { role: 'student',   label: 'Student 3', email: 'student3@schoolsync.edu',    password: 'student123',   color: '#f472b6', bg: '#fff0f5' },
  { role: 'teacher',   label: 'Teacher 1', email: 'teacher@schoolsync.edu',    password: 'teacher123',  color: '#a855f7', bg: '#faf0ff' },
  { role: 'teacher',   label: 'Teacher 2', email: 'teacher2@schoolsync.edu',  password: 'teacher123',  color: '#9333ea', bg: '#faf0ff' },
  { role: 'teacher',   label: 'Teacher 3', email: 'teacher3@schoolsync.edu',  password: 'teacher123',  color: '#7e22ce', bg: '#faf0ff' },
  { role: 'admin',     label: 'Admin 1',   email: 'admin@schoolsync.edu',      password: 'admin123',   color: '#10b981', bg: '#f0fdf4' },
  { role: 'admin',     label: 'Admin 2',   email: 'admin2@schoolsync.edu',     password: 'admin123',   color: '#059669', bg: '#f0fdf4' },
  { role: 'admin',     label: 'Admin 3',   email: 'admin3@schoolsync.edu',     password: 'admin123',   color: '#047857', bg: '#f0fdf4' },
  { role: 'parent',    label: 'Parent 1',  email: 'parent@schoolsync.edu',     password: 'parent123',  color: '#3b82f6', bg: '#eff6ff' },
  { role: 'parent',    label: 'Parent 2',  email: 'parent2@schoolsync.edu',    password: 'parent123',  color: '#2563eb', bg: '#eff6ff' },
  { role: 'parent',    label: 'Parent 3',  email: 'parent3@schoolsync.edu',    password: 'parent123',  color: '#1d4ed8', bg: '#eff6ff' },
  { role: 'driver',   label: 'Driver 1',  email: 'driver@schoolsync.edu',     password: 'driver123',  color: '#f59e0b', bg: '#fffbeb' },
  { role: 'driver',   label: 'Driver 2',  email: 'driver2@schoolsync.edu',    password: 'driver123',  color: '#d97706', bg: '#fffbeb' },
  { role: 'driver',   label: 'Driver 3',  email: 'driver3@schoolsync.edu',    password: 'driver123',  color: '#b45309', bg: '#fffbeb' },
  { role: 'librarian',label: 'Lib 1',    email: 'librarian@schoolsync.edu',  password: 'librarian123', color: '#8b5cf6', bg: '#f5f3ff' },
  { role: 'librarian',label: 'Lib 2',    email: 'librarian2@schoolsync.edu', password: 'librarian123', color: '#7c3aed', bg: '#f5f3ff' },
  { role: 'librarian',label: 'Lib 3',    email: 'librarian3@schoolsync.edu', password: 'librarian123', color: '#6d28d9', bg: '#f5f3ff' },
];

export const Login = ({ onLogin, onSwitch }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Auto-login from landing page sessionStorage
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

  const roleUsers = DEMO_USERS.filter(u => u.role === selectedRole);
  const selectedRoleData = ALL_ROLES.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans text-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px] p-6"
      >
        {/* Brand */}
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

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

          {/* Role tabs — all 6 roles */}
          <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: '#f1f5f9' }}>
            {ALL_ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => { setSelectedRole(r.id); setEmail(''); setPassword(''); setError(''); playClick(); }}
                className="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all duration-200"
                style={{
                  background: selectedRole === r.id ? 'white' : 'transparent',
                  color: selectedRole === r.id ? r.color : '#94a3b8',
                  boxShadow: selectedRole === r.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <r.icon size={12} />
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Demo quick-login — 3 buttons for selected role */}
          <div className="mb-5">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-2 text-center">
              Demo — {selectedRoleData?.label}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roleUsers.map((cred) => (
                <motion.button
                  key={cred.email}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { playClick(); setEmail(cred.email); setPassword(cred.password); setError(''); }}
                  className="py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all border"
                  style={{ background: cred.bg, color: cred.color, borderColor: `${cred.color}40` }}
                >
                  {cred.label}
                </motion.button>
              ))}
            </div>
            {/* Show selected credentials */}
            {roleUsers.find(c => c.email === email) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <span className="text-[10px] text-slate-500 font-mono">{email}</span>
                <span className="text-[10px] text-slate-400 font-mono">{roleUsers.find(c => c.email === email)?.password}</span>
              </motion.div>
            )}
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">or enter manually</span>
            </div>
          </div>

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
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot?</button>
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