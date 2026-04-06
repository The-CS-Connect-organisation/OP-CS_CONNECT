import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = ['Learn.', 'Grow.', 'Succeed.'];

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState(0); // 0=logo, 1=tagline, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => onComplete(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: '#ffffff' }}
        >
          {/* Subtle background texture */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
            {/* Pink blush top-right */}
            <div className="absolute top-0 right-0 w-[40vw] h-[40vh]" style={{
              background: 'radial-gradient(ellipse at top right, rgba(255,107,157,0.08), transparent 60%)',
            }} />
            {/* Purple blush bottom-left */}
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh]" style={{
              background: 'radial-gradient(ellipse at bottom left, rgba(168,85,247,0.06), transparent 60%)',
            }} />
          </div>

          {/* Center content */}
          <div className="relative flex flex-col items-center">
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
              className="relative mb-6"
            >
              {/* Outer glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: '#111111',
                  filter: 'blur(24px)',
                  opacity: 0.10,
                  width: '100px',
                  height: '100px',
                  left: '-10px',
                  top: '-10px',
                }}
              />
              {/* Main logo box */}
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: '#111111',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                  className="text-[var(--text-primary)] font-bold text-3xl relative z-10"
                >
                  C
                </motion.span>
                {/* Shimmer sweep */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12" />
                </motion.div>
              </div>
            </motion.div>

            {/* Text content */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: '#111111' }}>
                    Cornerstone
                  </h1>
                  <p className="text-sm font-medium mb-6" style={{ color: 'rgba(0,0,0,0.4)' }}>
                    School Management System
                  </p>

                  {/* Animated phrases */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {PHRASES.map((phrase, i) => (
                      <motion.span
                        key={phrase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="text-sm font-semibold"
                        style={{ 
                          color: i === 1 ? '#ff6b9d' : '#111111',
                        }}
                      >
                        {phrase}
                      </motion.span>
                    ))}
                  </div>

                  {/* Loading bar */}
                  <div className="w-48 h-0.5 rounded-full mx-auto overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.2, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: '#111111' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner accents */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 48 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute top-8 left-8 h-[2px] rounded-full"
            style={{ background: '#111111' }}
          />
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 48 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute top-8 left-8 w-[2px] rounded-full"
            style={{ background: '#111111' }}
          />
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 48 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-8 right-8 h-[2px] rounded-full"
            style={{ background: '#111111' }}
          />
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 48 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-8 right-8 w-[2px] rounded-full"
            style={{ background: '#111111' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;

