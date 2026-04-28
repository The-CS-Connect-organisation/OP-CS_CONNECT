import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] // Apple's signature easing
    } 
  },
};

export default function HeroSection({ loginRef }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects - Apple style
  const logoY = useTransform(scrollY, [0, 500], [0, -50]);
  const logoOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const contentY = useTransform(scrollY, [0, 500], [0, -80]);
  const orbY = useTransform(scrollY, [0, 500], [0, 100]);

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
      {/* Animated gradient orb with parallax */}
      <motion.div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none blur-3xl"
        style={{
          y: orbY,
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.1) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: contentY }}
      >
        {/* Cornerstone Logo with parallax */}
        <motion.div 
          variants={itemVariants} 
          className="mb-16"
          style={{ y: logoY, opacity: logoOpacity }}
        >
          <motion.img 
            src="/cornerstone-logo.svg" 
            alt="Cornerstone SchoolSync" 
            className="w-full max-w-3xl mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2 
            }}
          />
        </motion.div>

        {/* Headline with stagger */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          style={{ color: '#1f2937' }}
        >
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            One Platform.
          </motion.span>
          <br />
          <motion.span 
            className="inline-block"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Every Learner.
          </motion.span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-normal"
          style={{ color: '#6b7280' }}
        >
          The unified school management system for students, teachers, parents, and administrators.
        </motion.p>

        {/* CTA Buttons with hover effects */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={scrollToLogin}
            className="group relative px-10 py-5 rounded-full font-semibold text-lg text-white overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(245,158,11,0.3)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative flex items-center">
              Get Started
              <motion.span 
                className="ml-2 inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
          <motion.button
            onClick={scrollToLogin}
            className="px-10 py-5 rounded-full font-semibold text-lg bg-white"
            style={{ 
              color: '#f59e0b',
              border: '2px solid #f59e0b'
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: '#fff7ed',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            View Demo
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
