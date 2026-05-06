import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import DemoCredentialsPanel from './DemoCredentialsPanel.jsx';

const ROLE_MAP = {
  'student@schoolsync.edu': 'student',  'student2@schoolsync.edu': 'student',  'student3@schoolsync.edu': 'student',
  'teacher@schoolsync.edu': 'teacher',  'teacher2@schoolsync.edu': 'teacher',  'teacher3@schoolsync.edu': 'teacher',
  'parent@schoolsync.edu':  'parent',   'parent2@schoolsync.edu':  'parent',   'parent3@schoolsync.edu':  'parent',
  'driver@schoolsync.edu':  'driver',   'driver2@schoolsync.edu':  'driver',   'driver3@schoolsync.edu':  'driver',
  'admin@schoolsync.edu':   'admin',    'admin2@schoolsync.edu':   'admin',    'admin3@schoolsync.edu':   'admin',
  'librarian@schoolsync.edu': 'librarian',
};

export default function LoginSection({ sectionRef }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);
    const role = ROLE_MAP[email.trim().toLowerCase()] || 'student';
    const encodedEmail = encodeURIComponent(email.trim().toLowerCase());
    const encodedPassword = encodeURIComponent(password.trim());
    window.location.href = `/OP-CS_CONNECT/academics/#/${role}/dashboard?autologin=${encodedEmail}&pass=${encodedPassword}`;
  };

  const handleDemoSelect = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <section id="login" ref={sectionRef} aria-label="Login"
      className="relative py-28 px-6 bg-[#0a0a0a] flex items-center justify-center">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        <motion.div className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white/50 tracking-wide uppercase mb-5">
            Sign In
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
          <p className="text-white/40 text-sm mt-2">One platform for everyone at Cornerstone.</p>
        </motion.div>

        <motion.div className="rounded-3xl p-8"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="ls-email" className="block text-xs font-semibold text-white/50 mb-1.5">Email Address</label>
              <div className="relative group">
                <input id="ls-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                  placeholder="you@schoolsync.edu"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/40 focus:bg-white/[0.06] transition-all"
                  style={errors.email ? { borderColor: '#f59e0b55' } : {}} />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-white/50 transition-colors" />
              </div>
              {errors.email && <p className="text-xs text-[#f59e0b] mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="ls-password" className="block text-xs font-semibold text-white/50 mb-1.5">Password</label>
              <div className="relative group">
                <input id="ls-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Enter password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#f59e0b]/40 focus:bg-white/[0.06] transition-all"
                  style={errors.password ? { borderColor: '#f59e0b55' } : {}} />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-white/50 transition-colors" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors p-1">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#f59e0b] mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] mt-2"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}>
              {loading ? (
                <div className="flex items-center gap-1.5">
                  {[0, 0.1, 0.2].map((d, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce bg-white/60" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <DemoCredentialsPanel onSelect={handleDemoSelect} />
        </motion.div>
      </div>
    </section>
  );
}
