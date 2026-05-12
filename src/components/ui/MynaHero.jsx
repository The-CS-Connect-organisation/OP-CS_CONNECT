'use client';
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


const FEATURE_BADGES = [
  { icon: '🤖', label: 'AI-Powered' },
  { icon: '⚡', label: 'Real-time Sync' },
  { icon: '🔒', label: 'Enterprise Security' },
  { icon: '📊', label: 'Analytics Dashboard' },
  { icon: '📱', label: 'Mobile First' },
  { icon: '🌐', label: 'Cloud-Native' },
];

const FEATURE_CARDS = [
  {
    title: 'Smart Scheduling',
    description: 'AI-driven timetable optimization that adapts to your school\'s unique rhythm.',
    badge: 'Popular',
    badgeColor: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    icon: '📅',
  },
  {
    title: 'Attendance Tracking',
    description: 'Biometric + geofenced attendance with instant parent notifications.',
    badge: 'New',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: '✅',
  },
  {
    title: 'Grade Analytics',
    description: 'Deep insights into student performance with predictive alerts.',
    badge: 'Trending',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: '📈',
  },
];

const MynaHero = memo(function MynaHero({
  headline = 'THE AI REVOLUTION\nFOR SCHOOL MANAGEMENT',
  subheadline = 'Cornerstone transforms how schools operate — from admissions to assessments, powered by cutting-edge AI.',
  className,
}) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const wordVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(10px)' },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const words = headline.split(' ');

  return (
    <section className={cn('w-full py-20 px-4 md:px-8', className)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
            <span className="text-pink-500 text-sm font-medium">Introducing Cornerstone 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6">
            {words.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="inline-block mr-[0.25em] dark:text-white text-zinc-900"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            {FEATURE_BADGES.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.05, duration: 0.3 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredCard(i)}
              onHoverEnd={() => setHoveredCard(null)}
              className={cn(
                'relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer',
                'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
                'hover:border-pink-500/30 dark:hover:border-pink-500/30 hover:shadow-xl hover:shadow-pink-500/5',
                hoveredCard === i && 'ring-2 ring-pink-500/20'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{card.icon}</span>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', card.badgeColor)}>
                  {card.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {card.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-pink-500">
                <span>Learn more</span>
                <motion.span
                  animate={{ x: hoveredCard === i ? [0, 4, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

export { MynaHero };
