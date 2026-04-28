import { useState, useEffect, useRef } from 'react';

/**
 * Track scroll position, progress percentage, direction, and velocity
 */
export const useScrollProgress = () => {
  const [scrollData, setScrollData] = useState({
    scrollY: 0,
    progress: 0,
    direction: 'down',
    velocity: 0
  });
  
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (currentScrollY / maxScroll) * 100 : 0;
      
      const now = Date.now();
      const timeDelta = now - lastTimestamp.current;
      const scrollDelta = currentScrollY - lastScrollY.current;
      const velocity = timeDelta > 0 ? Math.abs(scrollDelta / timeDelta) : 0;
      
      const direction = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : scrollData.direction;
      
      setScrollData({
        scrollY: currentScrollY,
        progress: Math.min(100, Math.max(0, progress)),
        direction,
        velocity
      });
      
      lastScrollY.current = currentScrollY;
      lastTimestamp.current = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollData.direction]);

  return scrollData;
};
