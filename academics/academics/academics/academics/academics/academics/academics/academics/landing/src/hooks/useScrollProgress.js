import { useState, useEffect, useRef } from 'react';

/**
 * Track scroll position and progress percentage
 */
const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (currentScrollY / maxScroll) : 0;
      
      setScrollProgress(Math.min(1, Math.max(0, progress)));
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
};

export default useScrollProgress;
