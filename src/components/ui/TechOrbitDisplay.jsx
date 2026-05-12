'use client';
import { memo } from 'react';
import { OrbitingCircles } from './OrbitingCircles';


const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray = [],
  text = 'OP-CS CONNECT',
}) {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-5xl md:text-7xl font-bold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        {text}
      </span>

      {iconsArray.map((icon, index) => (
        <OrbitingCircles
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

export { TechOrbitDisplay };
