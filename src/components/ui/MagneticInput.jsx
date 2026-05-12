'use client';
import { memo, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';


const MagneticInput = memo(function MagneticInput({
  className,
  type,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const radius = 120;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{
        background: isVisible
          ? `radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, #3b82f6, transparent 80%)`
          : 'transparent',
      }}
      className="group/input rounded-lg p-[2px] transition duration-300"
    >
      <input
        type={type}
        className={cn(
          `shadow-input dark:placeholder:text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
          className
        )}
        {...props}
      />
    </motion.div>
  );
});

export { MagneticInput };
