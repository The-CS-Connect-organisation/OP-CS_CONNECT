'use client';
import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';


const LetterSwapForward = memo(function LetterSwapForward({
  children,
  className,
  swapDelay = 30,
  swapDuration = 300,
}) {
  const [displayText, setDisplayText] = useState(children);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(children);
      return;
    }

    let iteration = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*';
    const original = children;

    const interval = setInterval(() => {
      setDisplayText(
        original
          .split('')
          .map((letter, index) => {
            if (index < iteration) return original[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= original.length) {
        clearInterval(interval);
        setDisplayText(original);
      }

      iteration += 1 / 3;
    }, swapDelay);

    return () => clearInterval(interval);
  }, [isHovered, children, swapDelay]);

  return (
    <span
      className={cn('inline-block cursor-pointer', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
});


const LetterSwapPingPong = memo(function LetterSwapPingPong({
  children,
  className,
  swapDelay = 20,
}) {
  const [displayText, setDisplayText] = useState(children);
  const [isHovered, setIsHovered] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(children);
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    const original = children;
    let iteration = 0;
    let ascending = true;

    const animate = () => {
      if (ascending) {
        setDisplayText(
          original
            .split('')
            .map((letter, index) => {
              if (index < iteration) return original[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        iteration += 0.5;
        if (iteration >= original.length) ascending = false;
      } else {
        iteration -= 0.5;
        setDisplayText(
          original
            .split('')
            .map((letter, index) => {
              if (index < iteration) return original[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );
        if (iteration <= 0) ascending = true;
      }

      frameRef.current = setTimeout(animate, swapDelay);
    };

    frameRef.current = setTimeout(animate, swapDelay);

    return () => clearTimeout(frameRef.current);
  }, [isHovered, children, swapDelay]);

  return (
    <span
      className={cn('inline-block cursor-pointer', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
});

export { LetterSwapForward, LetterSwapPingPong };
