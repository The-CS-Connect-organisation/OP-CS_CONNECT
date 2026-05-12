import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * CinematicContainerScroll — Scroll-driven 3D card animation
 * Framer Motion powered — no Spline dependency needed
 * Parallax cards emerge as user scrolls, with 3D depth
 */
export default function CinematicContainerScroll() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const cards = [
    {
      title: 'AI Doubt Resolver',
      description: 'Get instant, accurate answers to any academic question from our GPT-powered AI tutor — available 24/7.',
      gradient: 'from-orange-400 to-amber-500',
      icon: '🤖',
      tag: 'AI Lab',
    },
    {
      title: 'Personalized Study Plans',
      description: 'AI-generated study plans that adapt to your learning pace, strengths, and areas needing improvement.',
      gradient: 'from-purple-500 to-pink-500',
      icon: '📚',
      tag: 'AI Lab',
    },
    {
      title: 'Auto-Grading & Analytics',
      description: 'Submit practice tests and get instant feedback with detailed analytics on every answer.',
      gradient: 'from-cyan-500 to-blue-500',
      icon: '📊',
      tag: 'AI Lab',
    },
    {
      title: 'Smart Flashcards',
      description: 'AI-generated flashcards from any topic — spaced repetition ensures you never forget what you\'ve learned.',
      gradient: 'from-green-500 to-emerald-500',
      icon: '🃏',
      tag: 'AI Lab',
    },
    {
      title: 'Real-Time Study Analytics',
      description: 'Track your productivity score, study streaks, and performance trends across all subjects.',
      gradient: 'from-violet-500 to-indigo-500',
      icon: '📈',
      tag: 'Analytics',
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24 bg-white overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-orange-50/50" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-semibold text-orange-700 mb-4">
            <span>✨</span>
            AI-Powered Features
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Everything your child needs to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              excel
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From doubt resolution to personalized study plans — our AI Lab is your child's personal academic assistant.
          </p>
        </motion.div>

        {/* Scroll-driven card stack */}
        <div className="relative h-[600vh]">
          <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 60%)`,
                scale: useTransform(springProgress, [0, 1], [0.8, 1.5]),
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-4">
              {cards.map((card, i) => {
                const totalCards = cards.length;
                const progress = i / totalCards;

                // Each card has its own reveal timing
                const cardProgress = useTransform(
                  scrollYProgress,
                  [
                    Math.max(0, progress * 0.8 - 0.05),
                    Math.min(1, progress * 0.8 + 0.25),
                  ],
                  [0, 1]
                );

                const opacity = useTransform(cardProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0.8]);
                const y = useTransform(cardProgress, [0, 0.5, 1], [80, 0, -20]);
                const scale = useTransform(cardProgress, [0, 0.5, 1], [0.85, 1, 0.95]);
                const rotate = useTransform(
                  cardProgress,
                  [0, 0.5, 1],
                  [i % 2 === 0 ? 2 : -2, 0, i % 2 === 0 ? 1 : -1]
                );

                return (
                  <motion.div
                    key={card.title}
                    className="relative"
                    style={{ opacity, y, scale, rotate, position: 'absolute' }}
                  >
                    <div className="relative bg-white rounded-2xl border border-gray-100 p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                      {/* Gradient border on hover */}
                      <div
                        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${card.gradient}`}
                        style={{ padding: '2px' }}
                      >
                        <div className="w-full h-full bg-white rounded-2xl" />
                      </div>

                      {/* Tag */}
                      <div className="relative flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${card.gradient}`}>
                          {card.tag}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="relative text-4xl mb-4">{card.icon}</div>

                      {/* Title */}
                      <h3 className="relative text-lg font-black text-gray-900 mb-2">{card.title}</h3>

                      {/* Description */}
                      <p className="relative text-sm text-gray-600 leading-relaxed">{card.description}</p>

                      {/* CTA */}
                      <div className="relative mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
                        <span>Explore feature</span>
                        <motion.span
                          className="inline-block"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
