import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

// ── Orbital ring that spins around the headline ──────────────────────────────
const OrbitalRing = ({ radius, duration, delay, dotColor, dotCount = 6 }) => {
  const dots = Array.from({ length: dotCount });
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ transformOrigin: 'center' }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      {dots.map((_, i) => {
        const angle = (i / dotCount) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 6 + i % 3 * 2,
              height: 6 + i % 3 * 2,
              background: dotColor,
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              boxShadow: `0 0 8px ${dotColor}`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        );
      })}
    </motion.div>
  );
};

// ── Exploding spark burst on click ───────────────────────────────────────────
const SparkBurst = ({ x, y, active }) => {
  const sparks = Array.from({ length: 16 });
  return (
    <AnimatePresence>
      {active && sparks.map((_, i) => {
        const angle = (i / 16) * 2 * Math.PI;
        const dist = 60 + Math.random() * 80;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none z-50"
            style={{
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              background: ['#f59e0b', '#f97316', '#fbbf24', '#fff'][i % 4],
              top: y,
              left: x,
              boxShadow: '0 0 6px #f59e0b',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        );
      })}
    </AnimatePresence>
  );
};

// ── Floating emoji orbs ───────────────────────────────────────────────────────
const FloatingOrbs = () => {
  const items = [
    { icon: '📚', x: 8,  y: 15, dur: 14, delay: 0   },
    { icon: '🎓', x: 88, y: 20, dur: 17, delay: 1.5 },
    { icon: '📝', x: 5,  y: 65, dur: 11, delay: 3   },
    { icon: '🏆', x: 90, y: 70, dur: 19, delay: 0.8 },
    { icon: '📐', x: 20, y: 80, dur: 15, delay: 2.2 },
    { icon: '🔬', x: 78, y: 10, dur: 13, delay: 4   },
    { icon: '✏️', x: 50, y: 5,  dur: 16, delay: 1   },
    { icon: '🧮', x: 95, y: 45, dur: 12, delay: 3.5 },
    { icon: '📊', x: 3,  y: 40, dur: 18, delay: 2.8 },
    { icon: '🌟', x: 60, y: 88, dur: 10, delay: 0.5 },
  ];
  return (
    <>
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none select-none"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          animate={{
            y: [0, -25, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: item.dur, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
        >
          {item.icon}
        </motion.div>
      ))}
    </>
  );
};

// ── Pulsing ring wave ─────────────────────────────────────────────────────────
const RingWave = ({ delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none border border-orange-400/30"
    style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    initial={{ width: 100, height: 100, opacity: 0.6 }}
    animate={{ width: 900, height: 900, opacity: 0 }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeOut' }}
  />
);

// ── Morphing blob ─────────────────────────────────────────────────────────────
const MorphBlob = ({ style, delay, duration }) => (
  <motion.div
    className="absolute pointer-events-none blur-3xl"
    style={style}
    animate={{
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 60% 70% 40% / 50% 60% 30% 60%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      scale: [1, 1.25, 1],
      x: [0, 40, 0],
      y: [0, -30, 0],
    }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Animated grid ─────────────────────────────────────────────────────────────
const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.07]">
    <svg className="w-full h-full">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f59e0b" strokeWidth="0.8" />
        </pattern>
      </defs>
      <motion.rect
        width="100%" height="100%" fill="url(#grid)"
        animate={{ x: [0, 60, 0], y: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  </div>
);

// ── Shooting star ─────────────────────────────────────────────────────────────
const ShootingStar = ({ delay }) => {
  const startX = Math.random() * 60;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ top: `${Math.random() * 40}%`, left: `${startX}%` }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], x: 200, y: 80 }}
      transition={{ duration: 1.2, repeat: Infinity, delay, repeatDelay: 4 + Math.random() * 6 }}
    >
      <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent rotate-[20deg]" />
    </motion.div>
  );
};

// ── Headline with letter-by-letter entrance ───────────────────────────────────
const AnimatedHeadline = ({ text, className }) => {
  const letters = text.split('');
  return (
    <span className={className}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

// ── Glowing CTA button ────────────────────────────────────────────────────────
const GlowButton = ({ children, onClick, primary }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative px-8 py-3 rounded-xl font-bold text-sm overflow-hidden"
      style={primary
        ? { background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#fff' }
        : { background: 'white', color: '#f59e0b', border: '2px solid #f59e0b' }
      }
      whileHover={{ scale: 1.07, boxShadow: primary ? '0 0 30px rgba(245,158,11,0.5)' : '0 0 20px rgba(245,158,11,0.2)' }}
      whileTap={{ scale: 0.96 }}
    >
      {/* shimmer */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
        initial={{ x: '-100%' }}
        animate={hovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroSection({ loginRef }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [burst, setBurst] = useState({ active: false, x: 0, y: 0 });
  const [reducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const mouseX = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const { scrollY } = useScroll();
  const orbY = useTransform(scrollY, [0, 600], [0, 120]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  const handleClick = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setBurst({ active: true, x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setBurst(b => ({ ...b, active: false })), 700);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const scrollToLogin = () => loginRef?.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      onClick={handleClick}
      className="relative flex flex-col items-center justify-center overflow-hidden bg-white px-6 cursor-crosshair"
      style={{ height: '100vh', paddingTop: '56px', boxSizing: 'border-box' }}
    >
      {/* ── Background layers ── */}
      <AnimatedGrid />

      {/* Morphing blobs */}
      <MorphBlob delay={0}  duration={14} style={{ width: 500, height: 500, top: '5%',  left: '-10%', background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
      <MorphBlob delay={3}  duration={17} style={{ width: 400, height: 400, bottom: '5%', right: '-8%',  background: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
      <MorphBlob delay={6}  duration={20} style={{ width: 350, height: 350, top: '40%', left: '5%',   background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />

      {/* Pulsing ring waves */}
      {!reducedMotion && [0, 1.3, 2.6].map((d, i) => <RingWave key={i} delay={d} />)}

      {/* Shooting stars */}
      {!reducedMotion && [0, 2, 4.5, 7, 9.5].map((d, i) => <ShootingStar key={i} delay={d} />)}

      {/* Big central glow orb */}
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none blur-3xl"
        style={{ y: orbY, background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, rgba(249,115,22,0.06) 50%, transparent 70%)' }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mouse spotlight */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(500px circle at ${mousePos.x}% ${mousePos.y}%, rgba(245,158,11,0.1), transparent 50%)` }}
        />
      )}

      {/* Floating emoji orbs */}
      {!reducedMotion && <FloatingOrbs />}

      {/* Click spark burst */}
      <SparkBurst x={burst.x} y={burst.y} active={burst.active} />

      {/* ── Orbital rings around headline ── */}
      {!reducedMotion && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <OrbitalRing radius={260} duration={18} delay={0}   dotColor="#f59e0b" dotCount={8} />
          <OrbitalRing radius={340} duration={28} delay={1}   dotColor="#f97316" dotCount={6} />
          <OrbitalRing radius={420} duration={38} delay={0.5} dotColor="#fbbf24" dotCount={5} />
        </div>
      )}

      {/* ── Main content ── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-300 bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >🔥</motion.span>
          Unified School Platform
        </motion.div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 mb-2 leading-tight" style={{ perspective: 800 }}>
          <AnimatedHeadline text="One Platform." className="block" />
        </h1>

        {/* Sub-headline with gradient shimmer */}
        <motion.div
          className="text-2xl sm:text-3xl font-bold mb-5 relative inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b, #f97316, #fbbf24, #f59e0b)', backgroundSize: '300% 100%' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            Complete School Management
          </motion.span>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          The unified school management system for students, teachers, parents, and administrators.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          <GlowButton primary onClick={scrollToLogin}>
            <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            Get Started
          </GlowButton>
          <GlowButton onClick={() => alert('Please contact an administrator to sign up.')}>
            Sign Up
          </GlowButton>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex justify-center gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
        >
          {[
            { val: '10K+', label: 'Students' },
            { val: '500+', label: 'Teachers' },
            { val: '99.9%', label: 'Uptime' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ scale: 1.1 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            >
              <div className="text-2xl font-black text-orange-500">{stat.val}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator — pinned to bottom center */}
      <motion.button
        onClick={scrollToLogin}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400 hover:text-orange-500 transition-colors z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ y: -4 }}
      >
        <span className="text-xs mb-1 tracking-widest uppercase">Scroll Down</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowDown size={20} />
        </motion.div>
      </motion.button>
    </section>
  );
}