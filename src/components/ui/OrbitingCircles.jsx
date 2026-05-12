'use client';
import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';


const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}
      <section
        style={{
          '--duration': duration,
          '--radius': radius,
          '--delay': -delay,
        }}
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border',
          'bg-black/10 dark:bg-white/10',
          '[animation-delay:calc(var(--delay)*1000ms)]',
          reverse && '[animation-direction:reverse]',
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

export { OrbitingCircles };
