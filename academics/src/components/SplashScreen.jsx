import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cornerstone brand colors
const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

// Grid of squares that fly in to form the CS logo area
const SQUARES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  delay: 0.05 + (i * 0.06),
  fromX: (Math.random() - 0.5) * 800,
  fromY: (Math.random() - 0.5) * 600,
  fromRotate: (Math.random() - 0.5) * 360,
}));

export default function SplashScreen({ onComplete }) {
  const timerRef = useRef(null);

  useEffect(() => {
    // Auto-complete after animation finishes
    timerRef.current = setTimeout(() => {
      onComplete?.();
    }, 3200);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#0a0a0f' }}
      onClick={() => { clearTimeout(timerRef.current); onComplete?.(); }}
    >
      {/* Background squares flying in */}
      {SQUARES.map((sq) => (
        <motion.div
          key={sq.id}
          initial={{ x: sq.fromX, y: sq.fromY, rotate: sq.fromRotate, opacity: 0, scale: 0.3 }}
          animate={{ x: 0, y: 0, rotate: 0, opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 0] }}
          transition={{
            delay: sq.delay,
            duration: 1.8,
            times: [0, 0.3, 0.7, 1],
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: 'absolute',
            width: 48 + (sq.id % 3) * 16,
            height: 48 + (sq.id % 3) * 16,
            background: sq.color,
            borderRadius: 8,
            opacity: 0.15 + (sq.id % 4) * 0.05,
            left: `${10 + (sq.id % 8) * 11}%`,
            top: `${10 + Math.floor(sq.id / 8) * 30}%`,
          }}
        />
      ))}

      {/* Center logo reveal */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo box */}
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 96, height: 96,
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)',
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Cornerstone"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>

        {/* School name — letter by letter */}
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              fontFamily: 'Inter, sans-serif',
              textAlign: 'center',
            }}
          >
            Cornerstone
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#64748b',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          SchoolSync
        </motion.div>

        {/* Colored bar */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: 3,
            width: 200,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6, #10b981)',
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Fade out overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 0.6 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0a0a0f',
          pointerEvents: 'none',
        }}
      />

      {/* Skip hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 32,
          fontSize: 11,
          color: '#64748b',
          letterSpacing: '0.1em',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        click to skip
      </motion.p>
    </div>
  );
}
