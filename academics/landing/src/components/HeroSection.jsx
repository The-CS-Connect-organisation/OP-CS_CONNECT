import { useRef, memo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GraduationCap, CheckCircle, ArrowRight, Sparkles, TrendingUp, ShieldCheck, Globe } from 'lucide-react';

/**
 * HERO SECTION — WHITE + ORANGE THEME
 * Bold headline left, CTA right, zero dark from the hero.
 * Portal dark login stays in the /login route — not here.
 */

// ── Animated Counter ────────────────────────────────────────────────────────────
const AnimatedCounter = memo(({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
});

// ── Floating Badge ──────────────────────────────────────────────────────────────
const FloatingBadge = memo(() => (
  <motion.div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
    initial={{ opacity: 0, y: -12, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    whileInView={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Sparkles size={13} className="text-orange-500" />
    </motion.div>
    <span className="text-[11px] font-bold text-orange-700 uppercase tracking-widest">
      Cornerstone International School
    </span>
  </motion.div>
));

// ── Value Pill ─────────────────────────────────────────────────────────────────
const ValuePill = memo(({ text, delay }) => (
  <motion.div
    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600"
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.05, borderColor: '#f59e0b', color: '#ea580c' }}
  >
    <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
    {text}
  </motion.div>
));

// ── Stat Block ─────────────────────────────────────────────────────────────────
const StatBlock = memo(({ value, label, delay }) => (
  <motion.div
    className="flex flex-col items-center px-8 py-5 border-r border-gray-200 last:border-0"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="text-4xl font-black text-gray-900">
      <AnimatedCounter target={value} />
    </div>
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-1">{label}</div>
  </motion.div>
));

// ── CTA Card (right side, replaces login panel) ────────────────────────────────
const CTACard = memo(() => (
  <motion.div
    className="w-full max-w-md mx-auto"
    initial={{ opacity: 0, x: 40, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-orange-500/10 overflow-hidden">

      {/* Top accent stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />

      {/* Glow blob */}
      <motion.div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative p-8 space-y-6">

        {/* Icon + heading */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Academic Portal</h3>
            <p className="text-sm text-gray-500 font-medium">Your unified school hub awaits</p>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="space-y-3">
          {[
            { icon: ShieldCheck, text: 'Secure role-based access — students, teachers, parents, admins' },
            { icon: Globe, text: 'Live timetable, attendance, fees & grades — all in one place' },
            { icon: TrendingUp, text: 'AI-powered insights & real-time analytics dashboard' },
          ].map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600 leading-snug">{text}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <motion.a
            href="/OP-CS_CONNECT/academics/#/login"
            className="flex items-center justify-center gap-2 w-full h-13 px-6 py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(249,115,22,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Access Academic Portal</span>
            <ArrowRight size={16} className="flex-shrink-0" />
          </motion.a>

          <motion.a
            href="/OP-CS_CONNECT/academics/"
            className="flex items-center justify-center gap-2 w-full h-13 px-6 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all"
            style={{ borderColor: 'var(--border-color, #e5e7eb)', color: 'var(--text-secondary, #4b5563)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, backgroundColor: '#fafafa' }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Explore All Features</span>
          </motion.a>
        </div>

        {/* Trust line */}
        <motion.p
          className="text-center text-[11px] text-gray-400 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          Trusted by 500+ students and families across 12+ countries
        </motion.p>
      </div>
    </div>
  </motion.div>
));

// ── Grid Background ────────────────────────────────────────────────────────────
const GridBackground = memo(() => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0">
    <div className="absolute inset-0 bg-[linear-gradient(#1a1a2e_1px,transparent_1px),linear-gradient(90deg,#1a1a2e_1px,transparent_1px)] bg-[size:56px_56px]" />
  </div>
));

// ── Main Component ────────────────────────────────────────────────────────────
export default function HeroSection({ loginRef }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(162deg, #ffffff 0%, #fffbeb 45%, #fef3c7 100%)' }}
    >
      <GridBackground />

      {/* Ambient gradient blobs */}
      <motion.div
        className="absolute -top-24 -right-24 w-[55%] h-[55%] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[50%] h-[50%] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
      />

      {/* Decorative ring */}
      <motion.div
        className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[320px] h-[320px] rounded-full pointer-events-none hidden lg:block"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{
          border: '2px dashed rgba(249,115,22,0.12)',
          background: 'transparent',
        }}
      />

      {/* Main content two-column */}
      <div
        className="relative z-20 min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-24 gap-12 lg:gap-20"
        style={{ y: yOffset, opacity }}
      >

        {/* ── Left: Hero copy ── */}
        <div className="flex-1 text-center lg:text-left max-w-xl">

          {/* Badge */}
          <FloatingBadge />

          {/* Headline */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mt-8 mb-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            Unified School
            <br />
            <span
              className="text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              Management Platform
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-base md:text-lg text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Complete digital infrastructure for administrators, teachers, students, and parents —
            all within a single, blazing-fast platform powered by AI.
          </motion.p>

          {/* Value pills */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <ValuePill text="Attendance & Grading" delay={0.6} />
            <ValuePill text="Timetable Manager" delay={0.65} />
            <ValuePill text="Fee Tracking" delay={0.7} />
            <ValuePill text="AI-Powered Insights" delay={0.75} />
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="flex justify-center lg:justify-start divide-x divide-gray-200 rounded-2xl bg-white/60 border border-gray-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
          >
            <StatBlock value={4} label="User Portals" delay={0.9} />
            <StatBlock value={12} label="Core Modules" delay={0.95} />
            <StatBlock value={100} suffix="%" label="Digital Workflow" delay={1.0} />
          </motion.div>
        </div>

        {/* ── Right: CTA card (replaces login panel) ── */}
        <div className="w-full lg:w-auto flex-shrink-0 flex items-center">
          <CTACard />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-widest">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-orange-300 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
