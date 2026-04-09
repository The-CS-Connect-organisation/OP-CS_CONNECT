import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('logo');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('text'), 800);
    const timer2 = setTimeout(() => setPhase('complete'), 1500);
    const timer3 = setTimeout(() => onComplete(), 1600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-50 to-green-50 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* School Logo - Professional Design */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: phase === 'logo' ? 1 : 1, 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.8, 
            type: "spring",
            stiffness: 100,
          }}
          className="relative mb-6"
        >
          {/* Outer ring */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-green-600 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative overflow-hidden">
              {/* Inner decorative circle */}
              <div className="absolute inset-2 rounded-full border-2 border-blue-100" />
              
              {/* School Icon - Academic Building */}
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="relative z-10">
                {/* Building base */}
                <rect x="16" y="28" width="32" height="20" rx="2" fill="url(#buildingGrad)" />
                {/* Roof */}
                <path d="M12 28 L32 12 L52 28 Z" fill="url(#roofGrad)" />
                {/* Door */}
                <rect x="26" y="36" width="12" height="12" rx="1" fill="url(#doorGrad)" />
                {/* Windows */}
                <rect x="20" y="32" width="4" height="4" rx="0.5" fill="#3b82f6" opacity="0.8" />
                <rect x="40" y="32" width="4" height="4" rx="0.5" fill="#3b82f6" opacity="0.8" />
                {/* Bell tower */}
                <rect x="28" y="18" width="8" height="6" rx="1" fill="#22c55e" />
                {/* Cross on top */}
                <path d="M32 8 L32 14 M29 11 L35 11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                {/* Steps */}
                <rect x="20" y="48" width="24" height="2" rx="0.5" fill="#6b7280" opacity="0.5" />
                <rect x="22" y="50" width="20" height="2" rx="0.5" fill="#6b7280" opacity="0.4" />
                
                <defs>
                  <linearGradient id="buildingGrad" x1="16" y1="28" x2="48" y2="48">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="roofGrad" x1="12" y1="12" x2="52" y2="28">
                    <stop stopColor="#22c55e" />
                    <stop offset="1" stopColor="#16a34a" />
                  </linearGradient>
                  <linearGradient id="doorGrad" x1="26" y1="36" x2="38" y2="48">
                    <stop stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-green-500 blur-xl opacity-30 -z-10" />
        </motion.div>

        {/* School Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase === 'text' || phase === 'complete' ? 1 : 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Cornerstone School
          </h1>
          <p className="text-sm text-gray-500 mt-1 tracking-wide">
            Excellence in Education Since 1995
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'complete' ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-gray-400 mb-6"
        >
          Management Portal
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'logo' || phase === 'text' ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-2">Loading...</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SplashScreen;