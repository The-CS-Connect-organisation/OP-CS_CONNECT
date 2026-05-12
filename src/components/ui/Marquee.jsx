'use client';
import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';


const Marquee = memo(function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = true,
  vertical = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={cn('flex overflow-hidden', vertical ? 'flex-col' : 'flex-row', className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
        vertical ? 'flex-col' : 'flex-row',
        '[gap:var(--gap)]',
        className
      )}
      aria-label="marquee"
      role="marquee"
    >
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 justify-around',
            vertical ? 'flex-col animate-marquee-vertical' : 'flex-row animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
});

export { Marquee };
