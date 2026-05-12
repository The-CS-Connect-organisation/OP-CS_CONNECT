'use client';
import { memo } from 'react';
import { cn } from '@/lib/utils';


const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}) {
  return (
    <section
      className={cn(
        'max-w-[50%] absolute inset-0 flex items-center justify-center',
        'dark:bg-white/5 bg-neutral-50',
        '[mask-image:linear-gradient(to_bottom,black,transparent)]',
        'dark:[mask-image:linear-gradient(to_bottom,white,transparent)]',
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = 5 + i * 5;

        return (
          <span
            key={i}
            className="absolute animate-ripple rounded-full bg-foreground/15 border"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              borderStyle,
              borderWidth: '1px',
              borderColor: `var(--foreground) dark:var(--background) / ${borderOpacity / 100})`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </section>
  );
});

export { Ripple };
