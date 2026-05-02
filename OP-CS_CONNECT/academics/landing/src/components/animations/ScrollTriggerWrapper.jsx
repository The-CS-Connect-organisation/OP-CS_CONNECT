import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useReducedMotion from '../../hooks/useReducedMotion';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const ScrollTriggerWrapper = ({ 
  children, 
  animation = 'fadeUp',
  duration = 1,
  delay = 0,
  stagger = 0,
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false,
  markers = false,
  className = ''
}) => {
  const elementRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!elementRef.current || prefersReducedMotion) return;

    const element = elementRef.current;
    const children = element.children;

    // Define animation presets
    const animations = {
      fadeUp: {
        from: { opacity: 0, y: 60 },
        to: { opacity: 1, y: 0 }
      },
      fadeDown: {
        from: { opacity: 0, y: -60 },
        to: { opacity: 1, y: 0 }
      },
      fadeLeft: {
        from: { opacity: 0, x: -60 },
        to: { opacity: 1, x: 0 }
      },
      fadeRight: {
        from: { opacity: 0, x: 60 },
        to: { opacity: 1, x: 0 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      },
      scaleUp: {
        from: { opacity: 0, scale: 1.2 },
        to: { opacity: 1, scale: 1 }
      },
      rotate: {
        from: { opacity: 0, rotation: -10 },
        to: { opacity: 1, rotation: 0 }
      },
      blur: {
        from: { opacity: 0, filter: 'blur(10px)' },
        to: { opacity: 1, filter: 'blur(0px)' }
      }
    };

    const selectedAnimation = animations[animation] || animations.fadeUp;

    // Set initial state
    gsap.set(children.length > 0 ? children : element, selectedAnimation.from);

    // Create scroll trigger animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: start,
        end: end,
        scrub: scrub,
        markers: markers,
        toggleActions: 'play none none reverse'
      }
    });

    // Apply animation
    if (children.length > 0 && stagger > 0) {
      // Stagger animation for multiple children
      tl.to(children, {
        ...selectedAnimation.to,
        duration: duration,
        delay: delay,
        stagger: stagger,
        ease: 'power3.out'
      });
    } else {
      // Single element animation
      tl.to(children.length > 0 ? children : element, {
        ...selectedAnimation.to,
        duration: duration,
        delay: delay,
        ease: 'power3.out'
      });
    }

    // Cleanup
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [animation, duration, delay, stagger, start, end, scrub, markers, prefersReducedMotion]);

  // If reduced motion is preferred, render without animation
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default ScrollTriggerWrapper;
