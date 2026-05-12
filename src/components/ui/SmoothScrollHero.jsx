'use client';
import { memo, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import { cn } from '@/lib/utils';


const SmoothScrollHeroBackground = memo(function SmoothScrollHeroBackground({
  scrollHeight = 1500,
  desktopImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2071',
  mobileImage = 'https://images.unsplash.com/photo-1511207538754-e8555f2bc187?q=80&w=2412',
  initialClipPercentage = 25,
  finalClipPercentage = 75,
}) {
  const { scrollY } = useScroll();

  const clipStart = useTransform(scrollY, [0, scrollHeight], [initialClipPercentage, 0]);
  const clipEnd = useTransform(scrollY, [0, scrollHeight], [finalClipPercentage, 100]);
  const clipPath = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`;

  const backgroundSize = useTransform(scrollY, [0, scrollHeight + 500], ['170%', '100%']);

  return (
    <motion.div
      className="sticky top-0 h-screen w-full bg-black"
      style={{ clipPath, willChange: 'transform, opacity' }}
    >
      <motion.div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `url('${desktopImage}')`,
          backgroundSize,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <motion.div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage: `url('${mobileImage}')`,
          backgroundSize,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </motion.div>
  );
});


const SmoothScrollHero = memo(function SmoothScrollHero({
  scrollHeight = 1500,
  desktopImage = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2071',
  mobileImage = 'https://images.unsplash.com/photo-1511207538754-e8555f2bc187?q=80&w=2412',
  initialClipPercentage = 25,
  finalClipPercentage = 75,
  children,
  className,
}) {
  return (
    <div
      className={cn('relative w-full', className)}
      style={{ height: `calc(${scrollHeight}px + 100vh)` }}
    >
      <SmoothScrollHeroBackground
        scrollHeight={scrollHeight}
        desktopImage={desktopImage}
        mobileImage={mobileImage}
        initialClipPercentage={initialClipPercentage}
        finalClipPercentage={finalClipPercentage}
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
});

export { SmoothScrollHero };
