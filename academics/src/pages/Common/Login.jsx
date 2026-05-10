import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck,
  GraduationCap, BookOpen, Users, Bus, UserCog, Cpu, Brain, Zap, ChevronRight
} from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { ForgotPassword } from './ForgotPassword';

// ── Canvas Neural Background ──────────────────────────────────────────────────

const NeuralCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const rand = (a, b) => Math.random() * (b - a) + a;

    const init = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rand(0, canvas.width),
          y: rand(0, canvas.height),
          vx: rand(-0.25, 0.25),
          vy: rand(-0.25, 0.25),
          r: rand(1.2, 3),
          pulse: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.015, 0.035),
          alpha: rand(0.3, 0.8),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const glowR = p.r + Math.sin(p.pulse) * 1.2 + 1;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 3);
        grad.addColorStop(0, `rgba(0, 212, 255, ${p.alpha * 0.9})`);
        grad.addColorStop(0.4, `rgba(139, 92, 246, ${p.alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Mouse interaction — attract nearby particles
      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.015;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          const maxV = 1.5;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > maxV) { p.vx = (p.vx / spd) * maxV; p.vy = (p.vy / spd) * maxV; }
        }
      });

      animId = requestAnimationFrame(draw);
    };

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    resize();
    init();
    draw();

    window.addEventListener('resize', () => { resize(); init(); });
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #0d1117 0%, #010409 100%)' }}
    />
  );
};

// ── Animated Logo Mark ────────────────────────────────────────────────────────

const AILogoMark = ({ size = 56 }) => (
  <motion.div
    className="relative flex items-center justify-center"
    style={{ width: size, height: size }}
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* Outer ring */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: 'conic-gradient(from 0deg, #00d4ff, #8b5cf6, #00d4ff)', padding: 2 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    >
      <div className="w-full h-full rounded-full" style={{ background: '#0d1117' }} />
    </motion.div>
    {/* Inner glow */}
    <div className="absolute inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)' }} />
    {/* Brain icon */}
    <Brain size={size * 0.42} className="relative z-10" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.6))' }} />
    {/* Pulse dot */}
    <motion.div
      className="absolute top-1 right-1 w-2 h-2 rounded-full"
      style={{ background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }}
      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.div>
);

// ── Neural SVG logo mark for header ───────────────────────────────────────────

const NeuralLogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="14" stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="4 2" style={{ animation: 'spin 12s linear infinite' }} />
    <circle cx="16" cy="16" r="9" stroke="#8b5cf6" strokeWidth="1" opacity="0.6" />
    <circle cx="16" cy="16" r="3" fill="#00d4ff" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
    <line x1="16" y1="7" x2="16" y2="13" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
    <line x1="16" y1="19" x2="16" y2="25" stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
    <line x1="7" y1="16" x2="13" y2="16" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.8" />
    <line x1="19" y1="16" x2="25" y2="16" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.8" />
    <circle cx="16" cy="7" r="1.5" fill="#00d4ff" opacity="0.8" />
    <circle cx="16" cy="25" r="1.5" fill="#00d4ff" opacity="0.8" />
    <circle cx="7" cy="16" r="1.5" fill="#8b5cf6" opacity="0.8" />
    <circle cx="25" cy="16" r="1.5" fill="#8b5cf6" opacity="0.8" />
  </svg>
);

// ── Ambient floating orbs ─────────────────────────────────────────────────────

const Orb = ({ className, color, size, duration, delay }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none blur-[80px] ${className}`}
    style={{ background: color, width: size, height: size }}
    animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

// ── Role Groups ────────────────────────────────────────────────────────────────

const ROLE_GROUPS = [
  { role: 'Student',  icon: GraduationCap, color: '#ff6b9d', glow: 'rgba(255,107,157,0.3)',  label: 'Scholar'     },
  { role: 'Teacher',  icon: BookOpen,      color: '#a855f7', glow: 'rgba(168,85,247,0.3)',   label: 'Educator'    },
  { role: 'Parent',   icon: Users,         color: '#3b82f6', glow: 'rgba(59,130,246,0.3)',  label: 'Guardian'    },
  { role: 'Driver',   icon: Bus,           color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',  label: 'Transporter' },
  { role: 'Admin',    icon: UserCog,      color: '#10b981', glow: 'rgba(16,185,129,0.3)',  label: 'Administrator'},
];

const DEMO_CREDENTIALS = {
  Student:  [
    { email: 'student@schoolsync.edu',  password: 'student123'  },
    { email: 'student2@schoolsync.edu', password: 'student123'  },
    { email: 'student3@schoolsync.edu', password: 'student123'  },
  ],
  Teacher:  [
    { email: 'teacher@schoolsync.edu',  password: 'teacher123'  },
    { email: 'teacher2@schoolsync.edu', password: 'teacher123'  },
    { email: 'teacher3@schoolsync.edu', password: 'teacher123'  },
  ],
  Parent:   [
    { email: 'parent@schoolsync.edu',   password: 'parent123'   },
    { email: 'parent2@schoolsync.edu',  password: 'parent123'   },
    { email: 'parent3@schoolsync.edu',  password: 'parent123'   },
  ],
  Driver:   [
    { email: 'driver@schoolsync.edu',   password: 'driver123'   },
    { email: 'driver2@schoolsync.edu',  password: 'driver123'   },
    { email: 'driver3@schoolsync.edu',  password: 'driver123'   },
  ],
  Admin:    [
    { email: 'admin@schoolsync.edu',   password: 'admin123'    },
    { email: 'admin2@schoolsync.edu',  password: 'admin123'    },
    { email: 'admin3@schoolsync.edu',  password: 'admin123'    },
  ],
};

// ── Main Login Component ──────────────────────────────────────────────────────

export const Login = ({ onLogin, onSwitch }) => {
  const navigate = useNavigate();
  const { playClick, playBlip } = useSound();

  const [activeRole, setActiveRole] = useState('Student');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPw]    = useState(false);
  const [error, setError]            = useState('');
  const [loading, setLoading]        = useState(false);
  const [showForgot, setShowForgot]  = useState(false);
  const [scanlines, setScanlines]    = useState(true);
  const autofillRef                  = useRef(false);

  // Check URL hash for auto-login — if present, return null so App.jsx handles it
  const hash    = window.location.hash;
  const params  = new URLSearchParams(hash.split('?')[1]);
  if (params.has('autologin') && params.has('pass')) return null;
  if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

  // ── Auto-fill from sessionStorage (landing page pass-through) ──
  useEffect(() => {
    if (autofillRef.current) return;
    autofillRef.current = true;

    const raw = sessionStorage.getItem('schoolsync_autofill');
    if (!raw) return;
    try {
      const { email: e, password: p, portal } = JSON.parse(raw);
      if (portal !== 'academics' || !e || !p) return;
      sessionStorage.removeItem('schoolsync_autofill');
      setEmail(e); setPassword(p);
      setLoading(true);
      onLogin(e, p).then(result => {
        if (result?.success) {
          navigate(`/${result.user.role}/dashboard`);
        } else {
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

  // ── Demo quick-login ──
  const handleQuickLogin = (creds) => {
    playClick();
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
    setLoading(true);
    onLogin(creds.email, creds.password).then(result => {
      if (result?.success) {
        navigate(`/${result.user.role}/dashboard`);
      } else {
        setError(result?.error || 'Invalid credentials');
        setLoading(false);
      }
    }).catch(() => {
      setError('Login failed. Please try again.');
      setLoading(false);
    });
  };

  // ── Manual form submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    playBlip();
    try {
      const result = await onLogin(email.trim().toLowerCase(), password.trim());
      if (result?.success) {
        navigate(`/${result.user.role}/dashboard`);
      } else {
        setError(result?.error || 'Invalid email or password');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const activeGroup = ROLE_GROUPS.find(g => g.role === activeRole);
  const activeCreds = DEMO_CREDENTIALS[activeRole] || [];

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #0d1421 0%, #070b14 50%, #030609 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Neural particle canvas ── */}
      <NeuralCanvas />

      {/* ── Ambient orbs ── */}
      <Orb className="top-[10%] left-[5%]"  color="rgba(0,212,255,0.12)"   size={320} duration={14} delay={0}   />
      <Orb className="bottom-[5%] right-[5%]" color="rgba(139,92,246,0.10)"  size={400} duration={18} delay={4}   />
      <Orb className="top-[40%] right-[20%]" color="rgba(255,107,157,0.06)" size={250} duration={22} delay={8}   />
      <Orb className="bottom-[20%] left-[15%]" color="rgba(16,185,129,0.05)" size={200} duration={16} delay={2}  />

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} />
      </div>

      {/* ── Scanlines (toggle-able) ── */}
      <AnimatePresence>
        {scanlines && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />

      {/* ── Main content ── */}
      <div className="relative z-20 w-full max-w-[900px] mx-4 flex flex-col lg:flex-row items-center gap-0">

        {/* ── LEFT: Branding ── */}
        <motion.div
          className="flex-1 text-center lg:text-left lg:pr-12 mb-10 lg:mb-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-8">
            <NeuralLogoSVG />
            <div>
              <motion.div
                className="text-xl font-bold tracking-tight text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                School<span style={{ color: '#00d4ff' }}>Sync</span>
              </motion.div>
              <div className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30">AI-Powered Platform</div>
            </div>
          </div>

          {/* Headline */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Welcome to the</span>
            <br />
            <span
              style={{
                backgroundImage: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #ff6b9d 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 30px rgba(0,212,255,0.3))',
              }}
            >
              Neural Portal
            </span>
          </motion.h1>

          <motion.p
            className="text-sm leading-relaxed mb-8 max-w-sm mx-auto lg:mx-0"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Powered by adaptive AI — Cornerstone Academic Portal delivers
            real-time insights, intelligent automation, and seamless access
            for every stakeholder in your institution.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {[
              { icon: Brain,   text: 'AI Tutors',       color: '#00d4ff' },
              { icon: Zap,     text: 'Live Analytics',  color: '#a855f7' },
              { icon: ShieldCheck, text: 'Zero-Trust',  color: '#10b981' },
            ].map(({ icon: Icon, text, color }) => (
              <motion.div
                key={text}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{
                  color,
                  borderColor: `${color}30`,
                  background: `${color}08`,
                }}
                whileHover={{ scale: 1.05, borderColor: `${color}60` }}
              >
                <Icon size={12} style={{ color }} />
                {text}
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative stat */}
          <motion.div
            className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex -space-x-2">
              {['#ff6b9d','#a855f7','#3b82f6','#10b981'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center" style={{ background: c }}>
                  <span className="text-[8px] font-bold text-white">{String.fromCharCode(65+i)}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70">4 Portals</p>
              <p className="text-[10px] text-white/30">One unified system</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Login Card ── */}
        <motion.div
          className="w-full lg:w-[400px] flex-shrink-0"
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(13,20,33,0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(0,212,255,0.05), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,255,0.05)',
            }}
          >
            {/* Card top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(139,92,246,0.6), transparent)',
              }}
            />

            <div className="p-8">
              {/* Card header */}
              <div className="flex items-center gap-3 mb-7">
                <AILogoMark size={40} />
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Portal Access</h2>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">Cornerstone Academic</p>
                </div>
              </div>

              {/* Role tabs */}
              <div className="grid grid-cols-5 gap-1.5 mb-5">
                {ROLE_GROUPS.map(({ role, icon: Icon, color }) => {
                  const isActive = activeRole === role;
                  return (
                    <motion.button
                      key={role}
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { playClick(); setActiveRole(role); setError(''); }}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all relative overflow-hidden"
                      style={{
                        background: isActive ? `${color}15` : 'rgba(255,255,255,0.02)',
                        borderColor: isActive ? `${color}60` : 'rgba(255,255,255,0.06)',
                        boxShadow: isActive ? `0 0 16px ${color}20, inset 0 0 12px ${color}08` : 'none',
                      }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: `radial-gradient(circle at 50% 0%, ${color}20, transparent 70%)` }}
                          layoutId="roleGlow"
                        />
                      )}
                      <Icon size={13} style={{ color: isActive ? color : 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }} />
                      <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: isActive ? color : 'rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                        {role.slice(0, 4)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Demo quick-login cards */}
              <div className="space-y-1.5 mb-5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/20 mb-2 text-center">
                  Quick Demo · {activeGroup?.label || activeRole}
                </p>
                {activeCreds.map((creds, i) => {
                  const isSelected = email === creds.email;
                  return (
                    <motion.button
                      key={creds.email}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleQuickLogin(creds)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left"
                      style={{
                        background: isSelected ? `${activeGroup?.color}10` : 'rgba(255,255,255,0.02)',
                        borderColor: isSelected ? `${activeGroup?.color}40` : 'rgba(255,255,255,0.05)',
                        boxShadow: isSelected ? `0 0 12px ${activeGroup?.glow}` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                          style={{ background: activeGroup?.color }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[10px] font-mono text-white/50">{creds.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-white/25">{creds.password}</span>
                        <ChevronRight size={10} className="text-white/20" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-[8px] uppercase tracking-widest font-semibold"
                    style={{ color: 'rgba(255,255,255,0.2)', background: 'rgba(13,20,33,0.95)' }}>
                    Manual Auth
                  </span>
                </div>
              </div>

              {/* Manual form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Email address"
                    required
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-white/20 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      outline: 'none',
                    }}
                    onFocus={e => {
                      e.target.style.background = 'rgba(255,255,255,0.06)';
                      e.target.style.borderColor = `${activeGroup?.color || '#00d4ff'}60`;
                      e.target.style.boxShadow = `0 0 0 3px ${activeGroup?.glow || 'rgba(0,212,255,0.1)'}`;
                    }}
                    onBlur={e => {
                      e.target.style.background = 'rgba(255,255,255,0.04)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-cyan-400/60 transition-colors" />
                </div>

                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Password"
                    required
                    className="w-full rounded-xl py-3 pl-11 pr-11 text-sm font-medium text-white placeholder:text-white/20 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      outline: 'none',
                    }}
                    onFocus={e => {
                      e.target.style.background = 'rgba(255,255,255,0.06)';
                      e.target.style.borderColor = `${activeGroup?.color || '#00d4ff'}60`;
                      e.target.style.boxShadow = `0 0 0 3px ${activeGroup?.glow || 'rgba(0,212,255,0.1)'}`;
                    }}
                    onBlur={e => {
                      e.target.style.background = 'rgba(255,255,255,0.04)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 group-focus-within:text-cyan-400/60 transition-colors" />
                  <button
                    type="button"
                    onClick={() => { playClick(); setShowPw(v => !v); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#f87171',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-black transition-all relative overflow-hidden"
                  style={{
                    background: loading
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(0,212,255,0.25)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.4)' }}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <Cpu size={14} />
                      <span>Access Portal</span>
                      <ArrowRight size={14} className="ml-1" />
                    </>
                  )}
                </motion.button>

                {/* Forgot */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { playClick(); setShowForgot(true); }}
                    className="text-[10px] font-medium text-white/20 hover:text-cyan-400/70 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </div>

            {/* Card footer */}
            <div
              className="px-8 py-4 text-center border-t"
              style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
            >
              <p className="text-[9px] text-white/20 font-medium tracking-wider">
                Cornerstone International School · Powered by SchoolSync AI
              </p>
            </div>
          </div>

          {/* Scanlines toggle */}
          <button
            onClick={() => setScanlines(v => !v)}
            className="mt-3 mx-auto flex items-center gap-1.5 text-[8px] text-white/15 hover:text-white/30 transition-colors uppercase tracking-widest font-semibold"
            title="Toggle scanlines"
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${scanlines ? 'bg-cyan-400/40' : 'bg-white/10'}`} />
            CRT {scanlines ? 'ON' : 'OFF'}
          </button>
        </motion.div>
      </div>

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </div>
  );
};
