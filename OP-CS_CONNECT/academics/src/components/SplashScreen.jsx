import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

const PHRASES = ['Learn.', 'Grow.', 'Succeed.'];

// Aurora blob component
const AuroraBlob = ({ color, x, y, size, delay, duration }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.3 }}
      animate={{
        scale: [0.8, 1.2, 0.9, 1.1, 0.8],
        opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
        x: [0, 30, -20, 40, 0],
        y: [0, -20, 30, -10, 0]
      }}
      transition={{
        duration: duration || 8,
        delay: delay || 0,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }}
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: color,
        filter: 'blur(80px)',
      }}
    />
  );
};

// Floating particle
const Particle = ({ delay, duration, size, startX, startY, color }) => {
  const randomOffsetX = (Math.random() - 0.5) * 60;
  const randomOffsetY = -(60 + Math.random() * 80);

  return (
    <motion.div
      initial={{
        left: startX,
        top: startY,
        opacity: 0,
        scale: 0
      }}
      animate={{
        y: [0, randomOffsetY, 0],
        x: [0, randomOffsetX, 0],
        opacity: [0, 0.6, 0],
        scale: [0, size, 0],
      }}
      transition={{
        duration: duration || 3,
        delay: delay || 0,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "easeOut"
      }}
      className="absolute rounded-full"
      style={{
        width: size * 3,
        height: size * 3,
        background: color || 'rgba(255, 107, 157, 0.5)',
        filter: 'blur(1px)',
      }}
    />
  );
};

// Sparkle effect
const Sparkle = ({ delay, x, y, size }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.2, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180]
      }}
      transition={{
        duration: 1.5,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 2 + Math.random() * 2,
        ease: "easeOut"
      }}
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: 'rgba(255, 215, 0, 0.9)',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
      }}
    />
  );
};

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0=intro, 1=tagline, 2=exit
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const containerRef = useRef(null);
  const logoControls = useAnimation();

  // Generate random particles
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: 0.4 + Math.random() * 1,
      startX: `${Math.random() * 100}%`,
      startY: `${Math.random() * 100}%`,
      color: [
        'rgba(255, 107, 157, 0.5)',
        'rgba(168, 85, 247, 0.5)',
        'rgba(59, 130, 246, 0.5)',
      ][Math.floor(Math.random() * 3)]
    }))
  ).current;

  // Generate sparkles
  const sparkles = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: 0.5 + i * 0.4,
      x: 25 + Math.random() * 50,
      y: 25 + Math.random() * 50,
      size: 5 + Math.random() * 6,
    }))
  ).current;

  // Phrase rotation
  useEffect(() => {
    if (phase === 1) {
      const interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Mouse parallax
  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 15;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 15;
      setMousePos({ x, y });
    }
  }, []);

  // Animation timeline
  useEffect(() => {
    // Logo entrance animation
    logoControls.start({
      scale: 1,
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
    });

    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => onComplete(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
  }, [onComplete, logoControls]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: 'blur(20px)',
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#ffffff' }}
        >
          {/* Aurora Background */}
          <div className="absolute inset-0 overflow-hidden">
            <AuroraBlob color="rgba(255, 107, 157, 0.12)" x={5} y={5} size="45vw" delay={0} duration={12} />
            <AuroraBlob color="rgba(168, 85, 247, 0.1)" x={55} y={65} size="38vw" delay={3} duration={14} />
            <AuroraBlob color="rgba(59, 130, 246, 0.08)" x={75} y={15} size="32vw" delay={1} duration={10} />
            <AuroraBlob color="rgba(255, 191, 0, 0.06)" x={25} y={75} size="28vw" delay={2} duration={16} />
          </div>

          {/* Dot Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 85%)',
            }} />
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map(p => (
              <Particle key={p.id} {...p} />
            ))}
          </div>

          {/* Sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            {sparkles.map(s => (
              <Sparkle key={s.id} {...s} />
            ))}
          </div>

          {/* Center content */}
          <motion.div
            className="relative flex flex-col items-center z-10 px-4"
            style={{
              transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
            }}
          >
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40, filter: 'blur(20px)' }}
              animate={logoControls}
              className="relative mb-6"
            >
              {/* Glow ring behind logo */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.4, 0.2],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-[-20px] rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, rgba(168,85,247,0.2), rgba(255,107,157,0.1), rgba(59,130,246,0.2), rgba(168,85,247,0.2))',
                  filter: 'blur(15px)',
                }}
              />

              {/* Main Logo */}
              <div className="relative">
                {/* Logo image */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative z-10"
                  style={{
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                  }}
                >
                  <img
                    src="logo.png"
                    alt="SchoolSync Logo"
                    onLoad={() => setLogoLoaded(true)}
                    className="h-20 md:h-24 w-auto object-contain"
                  />
                </motion.div>

                {/* Shimmer sweep effect */}
                <motion.div
                  initial={{ x: '-150%' }}
                  animate={{ x: '150%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 z-20"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    borderRadius: '12px',
                  }}
                />
              </div>

              {/* Orbiting accent dots */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px]"
              >
                <div className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full" style={{ transform: 'translateX(-50%)', background: '#ff6b9d', boxShadow: '0 0 12px rgba(255,107,157,0.6)' }} />
                <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full" style={{ transform: 'translateX(-50%)', background: '#a855f7', boxShadow: '0 0 10px rgba(168,85,247,0.6)' }} />
                <div className="absolute left-0 top-1/2 w-1.5 h-1.5 rounded-full" style={{ transform: 'translateY(-50%)', background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.6)' }} />
                <div className="absolute right-0 top-1/2 w-2 h-2 rounded-full" style={{ transform: 'translateY(-50%)', background: '#f59e0b', boxShadow: '0 0 10px rgba(245,158,11,0.6)' }} />
              </motion.div>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 0.5 ? 1 : 0, y: phase >= 0.5 ? 0 : 10 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center mb-2"
            >
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                Learning Management System
              </p>
            </motion.div>

            {/* Animated phrases */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
              transition={{ delay: 0.7 }}
              className="h-8 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-base font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {PHRASES[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Advanced Loading Bar */}
            <div className="mt-8 w-48 relative">
              {/* Loading bar track */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="h-1.5 rounded-full overflow-hidden relative"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {/* Animated gradient fill */}
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="h-full rounded-full relative"
                  style={{
                    background: 'linear-gradient(90deg, #ff6b9d, #a855f7, #3b82f6, #ff6b9d)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient-x 2s ease infinite',
                  }}
                >
                  {/* Shimmer on loading bar */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    }}
                  />
                </motion.div>

                {/* Leading glow dot */}
                <motion.div
                  initial={{ left: '0%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 2.5, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full -ml-1.5"
                  style={{
                    background: '#ff6b9d',
                    boxShadow: '0 0 12px rgba(255,107,157,0.8), 0 0 24px rgba(255,107,157,0.4)',
                  }}
                />
              </motion.div>

              {/* Loading percentage */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex justify-between mt-2"
              >
                <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-dim)' }}>
                  Loading
                </span>
                <motion.span
                  className="text-[10px] font-mono font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <LoadingCounter duration={2500} />
                </motion.span>
              </motion.div>
            </div>
          </motion.div>

          {/* Corner accent lines */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Top-left */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute top-8 left-8 w-12 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #ff6b9d, transparent)' }}
            />
            {/* Top-right */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute top-8 right-8 w-12 h-[2px]"
              style={{ background: 'linear-gradient(-90deg, #a855f7, transparent)' }}
            />
            {/* Bottom-left */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute bottom-8 left-8 w-12 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)' }}
            />
            {/* Bottom-right */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-8 right-8 w-12 h-[2px]"
              style={{ background: 'linear-gradient(-90deg, #ff6b9d, transparent)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Loading counter component
const LoadingCounter = ({ duration }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      if (newProgress >= 100) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return <span>{Math.round(progress)}%</span>;
};

export default SplashScreen;