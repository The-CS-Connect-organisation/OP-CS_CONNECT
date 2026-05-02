import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import useReducedMotion from '../../hooks/useReducedMotion';
import './AnimatedText.css';

const AnimatedText = ({ 
  text,
  splitBy = 'word', // 'word' or 'char'
  staggerDelay = 0.05,
  duration = 2,
  gradient = true,
  gradientColors = ['#6366f1', '#a855f7', '#ec4899'],
  className = '',
  as: Component = 'h1'
}) => {
  const textRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!textRef.current || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = textRef.current;
    const spans = element.querySelectorAll('.animated-text-unit');

    // Set initial state
    gsap.set(spans, { 
      opacity: 0, 
      y: 20,
      rotationX: -90
    });

    // Create intersection observer for triggering animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            
            // Animate text reveal
            gsap.to(spans, {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: duration / spans.length,
              stagger: staggerDelay,
              ease: 'back.out(1.2)',
              onComplete: () => {
                // Start gradient animation after reveal
                if (gradient) {
                  animateGradient(element);
                }
              }
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [text, staggerDelay, duration, gradient, isVisible, prefersReducedMotion]);

  const animateGradient = (element) => {
    gsap.to(element, {
      '--gradient-position': '200%',
      duration: 3,
      ease: 'none',
      repeat: -1
    });
  };

  const splitText = () => {
    if (splitBy === 'char') {
      return text.split('').map((char, index) => (
        <span key={index} className="animated-text-unit">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else {
      return text.split(' ').map((word, index) => (
        <span key={index} className="animated-text-unit">
          {word}
          {index < text.split(' ').length - 1 && '\u00A0'}
        </span>
      ));
    }
  };

  const gradientStyle = gradient ? {
    background: `linear-gradient(90deg, ${gradientColors.join(', ')}, ${gradientColors[0]})`,
    backgroundSize: '200% 100%',
    backgroundPosition: 'var(--gradient-position, 0%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  if (prefersReducedMotion) {
    return (
      <Component className={`animated-text ${className}`} style={gradientStyle}>
        {text}
      </Component>
    );
  }

  return (
    <Component 
      ref={textRef} 
      className={`animated-text ${className}`}
      style={gradientStyle}
    >
      {splitText()}
    </Component>
  );
};

export default AnimatedText;
