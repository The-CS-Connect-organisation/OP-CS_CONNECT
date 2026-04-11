import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// 5 rows x 8 cols = 40 squares that fly in and form a grid, then the logo punches through
const COLS = 8;
const ROWS = 5;
const TOTAL = COLS * ROWS;

const COLORS = [
  '#6366f1','#8b5cf6','#3b82f6','#10b981',
  '#f59e0b','#ec4899','#06b6d4','#84cc16',
];

const squares = Array.from({ length: TOTAL }, (_, i) => {
  const angle = (i / TOTAL) * Math.PI * 2;
  const radius = 900 + Math.random() * 400;
  return {
    id: i,
    color: COLORS[i % COLORS.length],
    fromX: Math.cos(angle) * radius,
    fromY: Math.sin(angle) * radius,
    fromRotate: (Math.random() - 0.5) * 720,
    delay: 0.02 + (i * 0.025),
  };
});

export default function SplashScreen({ onComplete }) {
  const timerRef = useRef(null);
  const [phase, setPhase] = useState('fly'); // fly -> logo -> out

  useEffect(() => {
    // Phase 1: squares fly in (1.4s)
    // Phase 2: logo punches through (0.6s)
    // Phase 3: fade out (0.5s)
    const t1 = setTimeout(() => setPhase('logo'), 1400);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onComplete?.(), 2800);
    timerRef.current = [t1, t2, t3];
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [onComplete]);

  const skip = () => {
    timerRef.current?.forEach?.(clearTimeout);
    onComplete?.();
  };

  const SQ_SIZE = 72;

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
      {/* Flying squares */}
      {squares.map((sq) => {
        const col = sq.id % COLS;
        const row = Math.floor(sq.id / COLS);
        const targetX = (col - COLS / 2 + 0.5) * (SQ_SIZE + 4);
        const targetY = (row - ROWS / 2 + 0.5) * (SQ_SIZE + 4);

        return (
          <motion.div
            key={sq.id}
            initial={{ x: sq.fromX, y: sq.fromY, rotate: sq.fromRotate, opacity: 1 }}
            animate={phase === 'out'
              ? { x: sq.fromX * 0.3, y: sq.fromY * 0.3, opacity: 0, scale: 0.5 }
              : { x: targetX, y: targetY, rotate: 0, opacity: 1 }
            }
            transition={phase === 'out'
              ? { duration: 0.5, ease: [0.4, 0, 1, 1], delay: sq.id * 0.005 }
              : { duration: 0.7, delay: sq.delay, ease: [0.16, 1, 0.3, 1] }
            }
            style={{
              position: 'absolute',
              width: SQ_SIZE, height: SQ_SIZE,
              borderRadius: 12,
              background: sq.color,
            }}
          />
        );
      })}

      {/* Logo punches through the grid */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={phase === 'fly'
          ? { scale: 0, opacity: 0 }
          : phase === 'logo'
            ? { scale: 1, opacity: 1 }
            : { scale: 1.2, opacity: 0 }
        }
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}
      >
        {/* White circle behind logo so it's visible */}
        <div style={{
          width: 120, height: 120, borderRadius: 28,
          background: '#ffffff',
          boxShadow: '0 0 0 8px rgba(255,255,255,0.9), 0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Cornerstone"
            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
          />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 16, padding: '10px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', fontFamily: 'Inter,sans-serif' }}>
            Cornerstone
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6366f1', fontFamily: 'Inter,sans-serif', marginTop: 2 }}>
            SchoolSync
          </div>
        </div>
      </motion.div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute', bottom: 28,
        fontSize: 11, color: '#94a3b8',
        letterSpacing: '0.08em', fontFamily: 'Inter,sans-serif',
        userSelect: 'none',
      }}>
        click to skip
      </div>
    </div>
  );
}
