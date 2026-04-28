import { useState, useEffect, useRef } from 'react';

/**
 * Track mouse position with throttling for 60fps performance
 * Returns normalized coordinates (-1 to 1) for easy 3D transformations
 */
export const useMousePosition = (throttleMs = 16.67) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, normalizedX: 0, normalizedY: 0 });
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const now = Date.now();
      if (now - lastUpdate.current < throttleMs) return;
      
      lastUpdate.current = now;
      
      const x = event.clientX;
      const y = event.clientY;
      
      // Normalize to -1 to 1 range
      const normalizedX = (x / window.innerWidth) * 2 - 1;
      const normalizedY = -((y / window.innerHeight) * 2 - 1); // Invert Y for 3D
      
      setMousePosition({ x, y, normalizedX, normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [throttleMs]);

  return mousePosition;
};
