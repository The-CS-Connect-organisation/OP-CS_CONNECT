'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const PoemAnimation = memo(function PoemAnimation({
  lines = [
    'In halls of learning, we unite',
    'With curiosity, we ignite',
    'Teachers guide, students grow',
    'Together, wisdom we bestow',
  ],
  className,
  theme = 'dark',
}) {
  const contentRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
    function adjustContentSize() {
      if (contentRef.current) {
        const viewportWidth = window.innerWidth;
        const baseWidth = 1000;
        const scaleFactor = viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.9 : 1;
        contentRef.current.style.transform = `scale(${scaleFactor})`;
      }
    }
    adjustContentSize();
    window.addEventListener('resize', adjustContentSize);
    return () => window.removeEventListener('resize', adjustContentSize);
  }, []);

  const poemHTML = lines.map((line, i) => `<p key="${i}" class="text-sm md:text-base font-medium leading-relaxed">${line}</p>`).join('');

  return (
    <section className={cn('w-full py-20 px-4 md:px-8 flex items-center justify-center overflow-hidden', className)}>
      <div className="relative" style={{ perspective: '1200px' }}>
        {mounted && (
          <div
            ref={contentRef}
            className="relative"
            style={{
              width: '1000px',
              height: '562px',
              transformStyle: 'preserve-3d',
              transform: 'scale(1)',
              transition: 'transform 0.3s',
            }}
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
                transform: 'translateZ(-150px)',
              }}
            >
              {[
                { transform: 'rotateY(0deg) translateZ(150px)', bg: 'bg-gradient-to-br from-violet-500/10 to-indigo-500/5' },
                { transform: 'rotateY(90deg) translateZ(150px)', bg: 'bg-gradient-to-br from-indigo-500/10 to-blue-500/5' },
                { transform: 'rotateY(180deg) translateZ(150px)', bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5' },
                { transform: 'rotateY(270deg) translateZ(150px)', bg: 'bg-gradient-to-br from-cyan-500/10 to-violet-500/5' },
              ].map((face, idx) => (
                <div
                  key={idx}
                  className={cn('absolute inset-0 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center p-8', face.bg)}
                  style={{ transform: face.transform }}
                >
                  <div className="text-center space-y-3">
                    <div
                      className={cn('inline-block', isDark ? 'text-white' : 'text-zinc-900')}
                      dangerouslySetInnerHTML={{ __html: poemHTML }}
                    />
                    <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
                    <p className={cn('text-xs uppercase tracking-widest font-semibold', isDark ? 'text-zinc-500' : 'text-zinc-400')}>
                      Cornerstone
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-pink-500/10 via-transparent to-indigo-500/10 blur-3xl -z-10" />
          </div>
        )}
      </div>
    </section>
  );
});

export { PoemAnimation };
