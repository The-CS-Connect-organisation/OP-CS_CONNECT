import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import DemoCredentialsPanel from './DemoCredentialsPanel.jsx';

const PORTAL_CONFIG = {
  academics: {
    label: 'Academic Portal',
    accent: '#f59e0b',
    placeholder: 'student@schoolsync.edu',
    hint: 'For students, teachers & parents',
  },
  management: {
    label: 'Management Portal',
    accent: '#ffffff',
    placeholder: 'admin@schoolsync.edu',
    hint: 'For administrators only',
  },
};

export default function LoginSection({ sectionRef }) {
  const [portal, setPortal] = useState('academics');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const config = PORTAL_CONFIG[portal];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    // Determine role from email
    const roleMap = {
      'alex@schoolsync.edu': 'student',
      'james@schoolsync.edu': 'teacher',
      'parent@schoolsync.edu': 'parent',
      'driver@schoolsync.edu': 'driver',
      'admin@schoolsync.edu': 'admin',
    };
    const role = roleMap[email.trim().toLowerCase()] || 'student';

    try {
      sessionStorage.setItem(
        'schoolsync_autofill',
        JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          portal,
          role,
        })
      );
    } catch {
      // sessionStorage unavailable — just go to portal root
      window.location.href = `/OP-CS_CONNECT/${portal}/#/login`;
      return;
    }

    // Redirect directly to dashboard
    window.location.href = `/OP-CS_CONNECT/${portal}/#/${role}/dashboard`;
  };

  const handleDemoSelect = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  const handlePortalSwitch = (p) => {
    setPortal(p);
    setErrors({});
  };

  return (
    <section
      id="login"
      ref={sectionRef}
      aria-label="Login"
      className="relative py-28 px-6 bg-[#0a0a0a] flex items-center justify-center"
    >
      {/* Subtle background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,107,157,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Section label */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-white/50 tracking-wide uppercase mb-5">
            Sign In
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-white/40 text-sm mt-2">Choose your portal and sign in below.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass-strong rounded-3xl p-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Portal Toggle */}
          <div
            role="group"
            aria-label="Portal selection"
            className="relative flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-8"
          >
            {(['academics', 'management']).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={portal === p}
                onClick={() => handlePortalSwitch(p)}
                className="relative flex-1 py-2.5 text-sm font-semibold rounded-xl z-10 transition-colors duration-200"
                style={{ color: portal === p ? (p === 'academics' ? '#f59e0b' : '#ffffff') : 'rgba(255,255,255,0.35)' }}
              >
                {PORTAL_CONFIG[p].label}
                {portal === p && (
                  <motion.div
                    layoutId="toggle-pill"
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{
                      background:
                        p === 'academics'
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(255,255,255,0.08)',
                      border:
                        p === 'academics'
                          ? '1px solid rgba(245,158,11,0.25)'
                          : '1px solid rgba(255,255,255,0.15)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Portal hint */}
          <AnimatePresence mode="wait">
            <motion.p
              key={portal}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-white/30 text-center -mt-4 mb-6"
            >
              {config.hint}
            </motion.p>
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="landing-email"
                className="block text-xs font-semibold text-white/50 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="landing-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                  placeholder={config.placeholder}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  style={errors.email ? { borderColor: '#f59e0b55' } : {}}
                />
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-white/50 transition-colors"
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-[#f59e0b] mt-1.5 ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="landing-password"
                className="block text-xs font-semibold text-white/50 mb-1.5"
              >
                Password
              </label>
              <div className="relative group">
                <input
                  id="landing-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  placeholder="Enter password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
                  style={errors.password ? { borderColor: '#f59e0b55' } : {}}
                />
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-white/50 transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-[#f59e0b] mt-1.5 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] mt-2"
              style={{
                background: portal === 'academics' ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : '#ffffff',
                color: portal === 'academics' ? '#ffffff' : '#0a0a0a',
                boxShadow:
                  portal === 'academics'
                    ? '0 8px 24px rgba(245,158,11,0.3)'
                    : '0 8px 24px rgba(255,255,255,0.15)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                  {[0, 0.1, 0.2].map((d, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: portal === 'academics' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                        animationDelay: `${d}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <DemoCredentialsPanel portal={portal} onSelect={handleDemoSelect} />
        </motion.div>
      </div>
    </section>
  );
}
