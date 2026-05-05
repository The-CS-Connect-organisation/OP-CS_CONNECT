import React, { useRef, useEffect, useState } from 'react';
import useScrollProgress from '../../hooks/useScrollProgress';
import useMousePosition from '../../hooks/useMousePosition';
import useReducedMotion from '../../hooks/useReducedMotion';

const ParallaxLayer = ({ 
  children,
  speed = 0.5, // 0 = no movement, 1 = normal scroll speed, >1 = faster
  depth = 0, // For mouse parallax (0-1, higher = more movement)
  enableMouseParallax = true,
  className = ''
}) => {
  const layerRef = useRef(null);
  const scrollProgress = useScrollProgress();
  const mousePosition = useMousePosition();
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState('translate3d(0, 0, 0)');

  useEffect(() => {
    if (prefersReducedMotion) {
      setTransform('translate3d(0, 0, 0)');
      return;
    }

    const scrollY = window.scrollY;
    const parallaxY = scrollY * (1 - speed);

    let mouseX = 0;
    let mouseY = 0;

    if (enableMouseParallax && mousePosition.x !== null && depth > 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      mouseX = ((mousePosition.x - centerX) / centerX) * depth * 50;
      mouseY = ((mousePosition.y - centerY) / centerY) * depth * 50;
    }

    setTransform(`translate3d(${mouseX}px, ${-parallaxY + mouseY}px, 0)`);
  }, [scrollProgress, mousePosition, speed, depth, enableMouseParallax, prefersReducedMotion]);

  return (
    <div
      ref={layerRef}
      className={`parallax-layer ${className}`}
      style={{
        transform: transform,
        willChange: 'transform',
        transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxLayer;
