import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// 6 cols x 4 rows = 24 squares — same vibe as LTT
const COLS = 6;
const ROWS = 4;
const SQ = 80; // square size px
const GAP = 6;

const COLORS = [
  '#6366f1','#8b5cf6','#3b82f6','#10b981',
  '#f59e0b','#ec4899','#06b6d4','#a855f7',
  '#14b8a6','#f97316','#84cc16','#e11d48',
  '#0ea5e9','#d946ef','#22c55e','#eab308',
  '#6366f1','#8b5cf6','#3b82f6','#10b981',
  '#f59e0b','#ec4899','#06b6d4','#a855f7',
];

const squares = Array.from({ length: COLS * ROWS }, (_, i) => {
  const angle = (i / (COLS * ROWS)) * Math.PI * 2 + Math.random() * 0.5;
  const radius = 700 + Math.random() * 500;
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    id: i,
    color: COLORS[i],
    fromX: Math.cos(angle) * radius,
    fromY: Math.sin(angle) * radius,
    fromRotate: (Math.random() - 0.5) * 540,
    // final grid position (centered)
    toX: (col - (COLS - 1) / 2) * (SQ + GAP),
    toY: (row - (ROWS - 1) / 2) * (SQ + GAP),
    delay: 0.03 + i * 0.03,
  };
});

// Phases: 'fly' → squares slam in | 'hold' → brief pause | 'reveal' → squares scatter, logo appears | 'done'
export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('fly');
  const timers = useRef([]);

  const clear = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 1600);
    const t2 = setTimeout(() => setPhase('reveal'), 2000);
    const t3 = setTimeout(() => onComplete?.(), 3600);
    timers.current = [t1, t2, t3];
    return clear;
  }, []);

  const skip = () => { clear(); onComplete?.(); };

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* ── Squares ── */}
      {squares.map((sq) => {
        const isReveal = phase === 'reveal';
        // On reveal, scatter back out in a different direction
        const scatterAngle = (sq.id / (COLS * ROWS)) * Math.PI * 2 + Math.PI;
        const scatterDist = 600 + Math.random() * 400;

        return (
          <motion.div
            key={sq.id}
            initial={{ x: sq.fromX, y: sq.fromY, rotate: sq.fromRotate, opacity: 0 }}
            animate={
              phase === 'fly' || phase === 'hold'
                ? { x: sq.toX, y: sq.toY, rotate: 0, opacity: 1 }
                : {
                    x: Math.cos(scatterAngle) * scatterDist,
                    y: Math.sin(scatterAngle) * scatterDist,
                    rotate: sq.fromRotate * 0.5,
                    opacity: 0,
                  }
            }
            transition={
              phase === 'fly'
                ? { duration: 0.65, delay: sq.delay, ease: [0.16, 1, 0.3, 1] }
                : phase === 'hold'
                  ? { duration: 0 }
                  : { duration: 0.5, delay: sq.id * 0.008, ease: [0.4, 0, 1, 1] }
            }
            style={{
              position: 'absolute',
              width: SQ, height: SQ,
              borderRadius: 10,
              background: sq.color,
            }}
          />
        );
      })}

      {/* ── Logo reveal (appears when squares scatter) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={phase === 'reveal' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: 24,
          background: '#ffffff',
          boxShadow: '0 8px 40px rgba(99,102,241,0.25), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Cornerstone"
            style={{ width: '88%', height: '88%', objectFit: 'contain' }}
          />
        </div>

        {/* Loading text */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#64748b',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}>
          Loading...
        </div>

        {/* Gradient progress bar */}
        <div style={{
          width: 220, height: 3, borderRadius: 999,
          background: '#e2e8f0', overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={phase === 'reveal' ? { width: '100%' } : { width: '0%' }}
            transition={{ duration: 1.4, delay: 0.2, ease: 'easeInOut' }}
            style={{
              height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6, #10b981)',
            }}
          />
        </div>
      </motion.div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute', bottom: 28,
        fontSize: 11, color: '#cbd5e1',
        letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif',
        userSelect: 'none',
      }}>
        click to skip
      </div>
    </div>
  );
}
