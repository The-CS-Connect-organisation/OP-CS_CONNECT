import React, { useRef, useCallback, useState, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GraduationCap, CheckCircle } from 'lucide-react';

/**
 * HERO SECTION — PROFESSIONAL INSTITUTIONAL
 * Clean, credible, modern. No emojis, no fake stats.
 */

const GridPattern = memo(() => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-0">
    <div className="absolute inset-0 bg-[linear-gradient(#1a1a2e_1px,transparent_1px),linear-gradient(90deg,#1a1a2e_1px,transparent_1px)] bg-[size:64px_64px]" />
  </div>
));

const SectionBadge = memo(({ children }) => (
  <motion.div
    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-semibold text-orange-700 uppercase tracking-widest"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
));

const StatItem = memo(({ value, label, delay }) => (
  <motion.div
    className="flex flex-col items-center px-8 py-5"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="text-4xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{label}</div>
  </motion.div>
));

const StatDivider = memo(() => (
  <div className="hidden md:block w-px h-16 bg-gray-200" />
));

// ── Main Component ────────────────────────────────────────────────────────────

export default function HeroSection({ loginRef }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yOffset = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToLogin = useCallback(() => {
    loginRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loginRef]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
    >
      <GridPattern />

      {/* Gradient fades */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      {/* Main Content */}
      <motion.div
        className="relative z-20 text-center max-w-4xl px-6"
        style={{ y: yOffset, opacity }}
      >
        {/* Badge */}
        <SectionBadge>
          <GraduationCap size={13} className="text-orange-500" />
          Cornerstone International School
        </SectionBadge>

        {/* Headline */}
        <motion.h1
          className="mt-10 text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Unified School
          <br />
          <span className="text-orange-500">Management Platform</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Complete digital infrastructure for administrators, teachers, students, and parents —
          all within a single, secure platform.
        </motion.p>

        {/* Key Value Props */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {['Attendance & Grading', 'Timetable Management', 'Fee Tracking', 'AI-Powered Insights'].map((item) => (
            <span key={item} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100">
              <CheckCircle size={13} className="text-green-500" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            onClick={scrollToLogin}
            className="px-10 py-4 rounded-2xl font-semibold text-base text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Access Portal
          </motion.button>
          <motion.button
            className="px-10 py-4 rounded-2xl font-semibold text-base text-gray-700 border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Request Demo
          </motion.button>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="mt-20 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <StatItem value="4" label="User Portals" delay={1.0} />
          <StatDivider />
          <StatItem value="12+" label="Core Modules" delay={1.1} />
          <StatDivider />
          <StatItem value="100%" label="Digital Workflow" delay={1.2} />
        </motion.div>
      </motion.div>
    </section>
  );
}