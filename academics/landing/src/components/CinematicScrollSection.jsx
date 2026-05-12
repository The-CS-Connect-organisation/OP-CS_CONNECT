import { useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform } from 'framer-motion';

/**
 * SmoothScrollHero — scroll-driven clip-path reveal with parallax background.
 * Inspired by the snippet provided. Uses a Pexels school/education image.
 */
const SCROLL_HEIGHT = 1500;
// 📸 Swap these URLs with your own school photos when ready
const DESKTOP_IMAGE =
  'https://images.pexels.com/photos/8471939/pexels-photo-8471939.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80';
const MOBILE_IMAGE =
  'https://images.pexels.com/photos/8471939/pexels-photo-8471939.jpeg?auto=compress&cs=tinysrgb&w=800&q=80';

function ScrollBackground() {
  const { scrollY } = useScroll();

  const clipStart = useTransform(scrollY, [0, SCROLL_HEIGHT], [25, 0]);
  const clipEnd   = useTransform(scrollY, [0, SCROLL_HEIGHT], [75, 100]);
  const clipPath  = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`;
  const bgSize    = useTransform(scrollY, [0, SCROLL_HEIGHT + 500], ['170%', '100%']);

  return (
    <motion.div
      className="sticky top-0 h-screen w-full bg-black"
      style={{ clipPath, willChange: 'transform, opacity' }}
    >
      {/* Mobile */}
      <motion.div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: `url(${MOBILE_IMAGE})`,
          backgroundSize: bgSize,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Desktop */}
      <motion.div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `url(${DESKTOP_IMAGE})`,
          backgroundSize: bgSize,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Overlay text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="text-center px-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="text-white/80 text-sm font-bold uppercase tracking-[0.3em] mb-3">
            Cornerstone International School
          </p>
          <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
            Where Every Student<br />
            <span className="text-orange-400">Finds Their Path</span>
          </h2>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function CinematicScrollSection() {
  return (
    <section
      style={{ height: `calc(${SCROLL_HEIGHT}px + 100vh)` }}
      className="relative w-full"
      aria-label="Cinematic scroll section"
    >
      <ScrollBackground />
    </section>
  );
}
