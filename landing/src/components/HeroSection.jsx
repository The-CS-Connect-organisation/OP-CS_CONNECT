import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import HeroScene3D from './3d/HeroScene3D.jsx';
import AnimatedText from './animations/AnimatedText.jsx';
import ParallaxLayer from './animations/ParallaxLayer.jsx';
import DNAHelixAnimation from './nerdy/DNAHelixAnimation.jsx';
import AtomOrbitAnimation from './nerdy/AtomOrbitAnimation.jsx';
import TypewriterTextEffect from './nerdy/TypewriterTextEffect.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';
import usePerformanceMonitor from '../hooks/usePerformanceMonitor.js';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection({ loginRef }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { shouldReduceQuality } = usePerformanceMonitor();

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

  const orb1Animate = reducedMotion
    ? {}
    : { x: [0, 60, -30, 0], y: [0, -40, 60, 0] };

  const orb2Animate = reducedMotion
    ? {}
    : { x: [0, -50, 40, 0], y: [0, 50, -30, 0] };

  const orbTransition = {
    duration: 12,
    repeat: Infinity,
    repeatType: 'mirror',
    ease: 'easeInOut',
  };

  return (
    <section
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6"
    >
      {/* Three.js 3D Scene */}
      {!prefersReducedMotion && !shouldReduceQuality && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <HeroScene3D />
        </div>
      )}

      {/* Nerdy 3D elements in parallax layers */}
      {!prefersReducedMotion && !shouldReduceQuality && (
        <>
          <ParallaxLayer speed={0.3} depth={0.2} className="absolute top-[10%] right-[5%] pointer-events-none z-[2]">
            <DNAHelixAnimation height={250} width={150} />
          </ParallaxLayer>
          <ParallaxLayer speed={0.4} depth={0.3} className="absolute bottom-[15%] left-[8%] pointer-events-none z-[2]">
            <AtomOrbitAnimation size={180} electronsCount={3} />
          </ParallaxLayer>
        </>
      )}

      {/* Animated background orbs */}
      <motion.div
        aria-hidden="true"
        className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,157,0.18) 0%, rgba(196,77,255,0.08) 60%, transparent 80%)',
          filter: 'blur(40px)',
        }}
        animate={orb1Animate}
        transition={orbTransition}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,107,157,0.06) 60%, transparent 80%)',
          filter: 'blur(60px)',
        }}
        animate={orb2Animate}
        transition={{ ...orbTransition, duration: 16 }}
      />

      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-[#ff6b9d]/20 text-xs font-semibold text-[#ff6b9d] tracking-wide uppercase">
            <Sparkles size={12} />
            Cornerstone SchoolSync Platform
          </div>
        </motion.div>

        {/* Headline with AnimatedText */}
        <motion.div variants={itemVariants}>
          <AnimatedText
            text="One Platform. Every Learner."
            splitBy="word"
            staggerDelay={0.08}
            duration={2}
            gradient={true}
            gradientColors={['#ffffff', '#6366f1', '#a855f7', '#ec4899']}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6"
            as="h1"
          />
        </motion.div>

        {/* Subtext with typewriter effect */}
        <motion.div variants={itemVariants} className="mb-10">
          <TypewriterTextEffect
            text="The unified school management system for students, teachers, parents, and administrators — built for the modern classroom."
            speed={30}
            delay={1000}
            showCursor={false}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
          />
        </motion.div>

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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 z-10"
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
