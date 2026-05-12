import { useRef, memo, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import {
  ArrowRight, Sparkles, ShieldCheck, Globe, Zap, Brain,
  Target, Users as UsersIcon, GraduationCap, BookOpen, Bus, Menu, X,
} from 'lucide-react';

// ── Letter Swap animation (from snippet) ──────────────────────────────────────
const LetterSwap = memo(({ label, className = '' }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={`inline-flex overflow-hidden relative cursor-default ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="sr-only">{label}</span>
      {label.split('').map((char, i) => (
        <span key={i} className="whitespace-pre relative inline-flex flex-col" style={{ height: '1.2em', overflow: 'hidden' }}>
          <motion.span
            className="relative"
            animate={{ y: hovered ? '-100%' : '0%' }}
            transition={{ duration: 0.35, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
          >
            {char}
          </motion.span>
          <motion.span
            className="absolute top-full"
            animate={{ y: hovered ? '-100%' : '0%' }}
            transition={{ duration: 0.35, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            {char}
          </motion.span>
        </span>
      ))}
    </span>
  );
});

// ── Animated underline text (from snippet) ────────────────────────────────────
const AnimatedUnderlineText = memo(({ text, className = '' }) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.5, ease: 'easeInOut', delay: 0.8 },
    },
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {text}
      </motion.span>
      <motion.svg
        width="100%"
        height="12"
        viewBox="0 0 300 12"
        className="absolute -bottom-2 left-0 w-full"
        style={{ overflow: 'visible' }}
      >
        <motion.path
          d="M 0,6 Q 75,0 150,6 Q 225,12 300,6"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
    </span>
  );
});

// ── Stat block ────────────────────────────────────────────────────────────────
const StatBlock = memo(({ value, label, icon: Icon, delay }) => (
  <motion.div
    className="flex flex-col items-center px-5 py-3 border-r border-gray-200 last:border-0"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center mb-1.5">
      <Icon size={14} className="text-orange-600" />
    </div>
    <div className="text-2xl font-black text-gray-900">{value}</div>
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mt-0.5">{label}</div>
  </motion.div>
));

// ── Feature label pill ────────────────────────────────────────────────────────
const FeatureLabel = memo(({ icon: Icon, label, delay }) => (
  <motion.div
    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-600"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ scale: 1.04, borderColor: '#f59e0b', color: '#ea580c' }}
  >
    <Icon size={14} className="text-orange-500 flex-shrink-0" />
    {label}
  </motion.div>
));

// ── CTA Card ──────────────────────────────────────────────────────────────────
const CTACard = memo(() => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: -((e.clientY - cy) / (rect.height / 2)) * 8,
      y: ((e.clientX - cx) / (rect.width / 2)) * 8,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ transformStyle: 'preserve-3d' }}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden transition-shadow duration-300"
        style={{ boxShadow: hovered ? '0 28px 64px rgba(249,115,22,0.18)' : '0 8px 32px rgba(249,115,22,0.08)' }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500" />
        <div className="relative p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Academic Portal</h3>
              <p className="text-sm text-gray-500 font-medium">Your unified school hub</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: ShieldCheck, text: 'Secure role-based access — students, teachers, parents, admins' },
              { icon: Globe, text: 'Live timetable, attendance, fees & grades — all in one place' },
              { icon: Brain, text: 'AI-powered insights & real-time analytics dashboard' },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}
              >
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={13} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600 leading-snug">{text}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <motion.a
              href="/OP-CS_CONNECT/academics/#/login"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 32px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span>Access Academic Portal</span>
              <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="#features"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm border-2 border-gray-200 text-gray-500 transition-all"
              whileHover={{ scale: 1.02, backgroundColor: '#fafafa' }}
              whileTap={{ scale: 0.98 }}
            >
              Explore All Features
            </motion.a>
          </div>

          <p className="text-center text-[11px] text-gray-400 font-medium">
            Trusted by 500+ students and families across 12+ countries
          </p>
        </div>
      </div>
    </motion.div>
  );
});

// ── Main Hero ─────────────────────────────────────────────────────────────────
const titleWords = ['THE', 'UNIFIED', 'SCHOOL', 'MANAGEMENT', 'PLATFORM'];

const featureLabels = [
  { icon: Sparkles, label: 'AI-Powered Learning' },
  { icon: Zap, label: 'Real-Time Analytics' },
  { icon: ShieldCheck, label: 'Secure & Role-Based' },
];

export default function HeroSection() {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [controls, isInView]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(162deg, #ffffff 0%, #fffbeb 45%, #fef3c7 100%)' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0">
        <div className="absolute inset-0 bg-[linear-gradient(#1a1a2e_1px,transparent_1px),linear-gradient(90deg,#1a1a2e_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      {/* Ambient blobs */}
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

      {/* Decorative spinning ring */}
      <motion.div
        className="absolute top-1/2 right-[6%] -translate-y-1/2 w-[280px] h-[280px] rounded-full pointer-events-none hidden lg:block"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ border: '2px dashed rgba(249,115,22,0.12)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 pt-28 pb-16 gap-12 lg:gap-20 w-full">

        {/* ── Left: Copy ── */}
        <div className="flex-1 text-center lg:text-left max-w-xl">

          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 mb-8"
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

          {/* Headline — word by word like MynaHero */}
          <motion.h1
            className="font-black text-gray-900 leading-tight tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
            initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                className={`inline-block mr-3 ${
                  i === 1
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500'
                    : i === 4
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500'
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-base md:text-lg text-gray-500 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            Complete digital infrastructure for administrators, teachers, students, and parents —
            all within a single, blazing-fast platform powered by AI.
          </motion.p>

          {/* Feature labels */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            {featureLabels.map((f, i) => (
              <FeatureLabel key={f.label} icon={f.icon} label={f.label} delay={1.0 + i * 0.12} />
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6, type: 'spring', stiffness: 100, damping: 10 }}
          >
            <motion.a
              href="/OP-CS_CONNECT/academics/#/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <LetterSwap label="GET STARTED" className="font-bold" />
              <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="#features"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm border-2 border-gray-200 text-gray-600 bg-white/60 backdrop-blur-sm"
              whileHover={{ scale: 1.02, borderColor: '#f59e0b', color: '#ea580c' }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Features
            </motion.a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="inline-flex divide-x divide-gray-200 rounded-2xl bg-white/70 border border-gray-200 shadow-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <StatBlock value="4" label="User Portals" icon={UsersIcon} delay={1.6} />
            <StatBlock value="12+" label="Core Modules" icon={Target} delay={1.65} />
            <StatBlock value="100%" label="Digital" icon={Zap} delay={1.7} />
          </motion.div>
        </div>

        {/* ── Right: 3D CTA Card ── */}
        <div className="w-full lg:w-auto flex-shrink-0 flex items-center">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md"
          >
            <CTACard />
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
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
