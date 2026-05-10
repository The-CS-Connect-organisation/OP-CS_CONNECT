import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowDown, Zap, Users, School, CheckCircle, Sparkles } from 'lucide-react';

/**
 * HERO SECTION - GLASSY PLAYFUL (PRO MAX OPTIMIZED)
 * 
 * DESIGN PIVOT:
 * - Restored the "Playful" emoji vibe but with "Glassmorphism"
 * - Restored the 3 Key Stats (Students, Teachers, Uptime)
 * - Optimized with Memoization & GPU-acceleration
 */

// ── Memoized Optimized Components ─────────────────────────────────────────────

const GridSystem = memo(() => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 [will-change:transform]">
    <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:48px_48px]" />
  </div>
));

const GlassOrb = memo(({ emoji, x, y, dur, delay }) => (
  <motion.div
    className="absolute hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 shadow-xl z-10 [will-change:transform]"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{ duration: dur, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    <span className="text-3xl drop-shadow-md select-none">{emoji}</span>
  </motion.div>
));

const StatCard = memo(({ value, label, icon: Icon, delay }) => (
  <motion.div
    className="flex flex-col items-center px-8 py-4 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-lg [will-change:transform]"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.6)" }}
  >
    <div className="text-3xl font-black text-orange-600 mb-1">{value}</div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
      <Icon size={12} className="text-orange-400" />
      {label}
    </div>
  </motion.div>
));

// ── Interaction Logic ─────────────────────────────────────────────────────────

const MagneticButton = memo(({ children, primary, onClick }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({ 
      x: (e.clientX - (left + width / 2)) * 0.3, 
      y: (e.clientY - (top + height / 2)) * 0.3 
    });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      onClick={onClick}
      className={`
        px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider
        transition-all duration-300 flex items-center gap-3 relative overflow-hidden
        ${primary ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/30' : 'bg-white text-orange-600 border-2 border-orange-100'}
      `}
      animate={{ x: pos.x, y: pos.y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
      {primary && <Zap size={16} className="fill-current" />}
    </motion.button>
  );
});

// ── Main Component ────────────────────────────────────────────────────────────

export default function HeroSection({ loginRef }) {
  const lightRef = useRef(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const yMove = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const handleMove = (e) => {
      if (lightRef.current) {
        lightRef.current.style.setProperty('--x', `${e.clientX}px`);
        lightRef.current.style.setProperty('--y', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const scrollToLogin = () => loginRef?.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#fdf8f4] overflow-hidden">
      <GridSystem />
      
      {/* Dynamic Cursor Spotlight */}
      <div 
        ref={lightRef}
        className="fixed inset-0 pointer-events-none z-[1] opacity-40"
        style={{ background: 'radial-gradient(circle 600px at var(--x, 50%) var(--y, 50%), rgba(245, 158, 11, 0.15), transparent 80%)' }}
      />

      {/* Floating Emojis (Restored & Upgraded) */}
      <GlassOrb emoji="📚" x={10} y={15} dur={12} delay={0} />
      <GlassOrb emoji="🎓" x={85} y={20} dur={15} delay={1} />
      <GlassOrb emoji="🎨" x={5}  y={70} dur={11} delay={0.5} />
      <GlassOrb emoji="🔬" x={90} y={75} dur={14} delay={2} />
      <GlassOrb emoji="🏀" x={75} y={10} dur={13} delay={1.5} />
      <GlassOrb emoji="🧠" x={20} y={85} dur={16} delay={3} />

      {/* Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-orange-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-200/20 blur-[100px] rounded-full" />

      {/* Main Content */}
      <motion.div 
        className="relative z-20 text-center max-w-5xl px-6"
        style={{ opacity, y: yMove }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles size={14} />
          The Future of Learning
        </motion.div>

        {/* Headline */}
        <h1 className="text-7xl md:text-9xl font-[900] text-gray-900 leading-[0.9] tracking-tighter mb-8">
          ONE <br />
          <span className="text-orange-500 drop-shadow-sm">PLATFORM.</span>
        </h1>

        {/* Description */}
        <motion.p
          className="max-w-xl mx-auto text-lg md:text-xl text-gray-500 font-bold mb-12 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Complete management for Students, Teachers, and Admins. <br />
          Everything your school needs, unified.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-5 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <MagneticButton primary onClick={scrollToLogin}>Get Started</MagneticButton>
          <MagneticButton onClick={() => alert('Registration is managed by administrators.')}>Sign Up</MagneticButton>
        </motion.div>

        {/* Stats Row (Restored) */}
        <div className="flex flex-wrap justify-center gap-6">
          <StatCard value="10K+" label="Students" icon={Users} delay={1.0} />
          <StatCard value="500+" label="Teachers" icon={School} delay={1.2} />
          <StatCard value="99.9%" label="Uptime" icon={CheckCircle} delay={1.4} />
        </div>
      </motion.div>

      {/* Scroll Trigger */}
      <motion.div
        className="absolute bottom-10 flex flex-col items-center gap-3 z-20 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        onClick={scrollToLogin}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown size={18} className="text-orange-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
