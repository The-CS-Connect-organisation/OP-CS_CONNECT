import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6"
    >
      {/* Subtle gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 220" className="w-full max-w-2xl mx-auto">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#f97316"/>
              </linearGradient>
            </defs>
            <rect x="10" y="10" width="150" height="200" rx="22" fill="#111827"/>
            <rect x="26" y="26" width="56" height="168" rx="14" fill="url(#g1)"/>
            <text x="54" y="128" fontSize="66" fontFamily="Georgia, serif" fontWeight="700" textAnchor="middle" fill="#ffffff">C</text>
            <text x="182" y="116" fontSize="90" fontFamily="Georgia, serif" fontWeight="700" fill="#ffffff">Cornerstone</text>
            <text x="188" y="168" fontSize="34" fontFamily="Brush Script MT, cursive" fill="#f97316">We Lay Foundation for your child's future...</text>
          </svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-white"
        >
          One Platform.
          <br />
          <span className="gradient-text">Every Learner.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 font-light"
        >
          The unified school management system for students, teachers, parents, and administrators — built for the modern classroom.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToLogin}
            className="group px-8 py-4 rounded-2xl bg-[#ff6b9d] text-white font-bold text-base hover:bg-[#ff5a8e] transition-all duration-200 shadow-xl shadow-[#ff6b9d]/25 hover:shadow-[#ff6b9d]/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            Get Started
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button
            onClick={scrollToLogin}
            className="px-8 py-4 rounded-2xl glass border border-white/10 text-white/70 font-semibold text-base hover:text-white hover:border-white/20 transition-all duration-200"
          >
            View Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
