import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.1, 0.25, 1] // Apple's signature easing
    } 
  },
};

export default function HeroSection({ loginRef }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const scrollToLogin = () => {
    loginRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white px-6"
    >
      {/* Subtle gradient orb */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Cornerstone Logo */}
        <motion.div variants={itemVariants} className="mb-16">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 920 220" 
            className="w-full max-w-3xl mx-auto"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
            <rect x="10" y="10" width="150" height="200" rx="22" fill="#1f2937"/>
            <rect x="26" y="26" width="56" height="168" rx="14" fill="url(#logoGradient)"/>
            <text 
              x="54" 
              y="128" 
              fontSize="66" 
              fontFamily="Georgia, serif" 
              fontWeight="700" 
              textAnchor="middle" 
              fill="#ffffff"
            >
              C
            </text>
            <text 
              x="182" 
              y="116" 
              fontSize="90" 
              fontFamily="Georgia, serif" 
              fontWeight="700" 
              fill="#1f2937"
            >
              Cornerstone
            </text>
            <text 
              x="188" 
              y="168" 
              fontSize="34" 
              fontFamily="Brush Script MT, cursive" 
              fill="#f97316"
            >
              We Lay Foundation for your child's future...
            </text>
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          style={{ color: '#1f2937' }}
        >
          One Platform.
          <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Every Learner.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-normal"
          style={{ color: '#6b7280' }}
        >
          The unified school management system for students, teachers, parents, and administrators.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToLogin}
            className="group px-10 py-5 rounded-full font-semibold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            }}
          >
            Get Started
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button
            onClick={scrollToLogin}
            className="px-10 py-5 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ 
              color: '#f59e0b',
              border: '2px solid #f59e0b'
            }}
          >
            View Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        style={{ color: '#9ca3af' }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}
