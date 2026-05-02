import React, { useEffect, useRef } from 'react';
import './AnimatedGradient.css';

const AnimatedGradient = ({ 
  colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'],
  duration = 10,
  blendMode = 'normal',
  opacity = 0.8,
  className = ''
}) => {
  const gradientRef = useRef(null);

  useEffect(() => {
    if (!gradientRef.current) return;

    const element = gradientRef.current;
    element.style.setProperty('--gradient-duration', `${duration}s`);
    element.style.setProperty('--gradient-blend-mode', blendMode);
    element.style.setProperty('--gradient-opacity', opacity);

    // Create gradient stops
    const gradientStops = colors.map((color, index) => {
      const position = (index / (colors.length - 1)) * 100;
      return `${color} ${position}%`;
    }).join(', ');

    element.style.setProperty('--gradient-colors', gradientStops);
  }, [colors, duration, blendMode, opacity]);

  return (
    <div 
      ref={gradientRef}
      className={`animated-gradient ${className}`}
      style={{
        background: `linear-gradient(45deg, ${colors.join(', ')})`
      }}
    />
  );
};

export default AnimatedGradient;
