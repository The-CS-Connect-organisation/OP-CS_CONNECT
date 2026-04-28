import { useState, useEffect, useRef } from 'react';

/**
 * Monitor FPS and detect performance degradation
 * Returns current FPS and performance quality level
 */
export const usePerformanceMonitor = () => {
  const [performance, setPerformance] = useState({
    fps: 60,
    quality: 'high', // 'high', 'medium', 'low'
    isLowPerformance: false
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef([]);

  useEffect(() => {
    let animationFrameId;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime.current;
      
      if (delta >= 1000) { // Update every second
        const currentFPS = Math.round((frameCount.current * 1000) / delta);
        fpsHistory.current.push(currentFPS);
        
        // Keep last 60 frames (1 minute at 1fps sampling)
        if (fpsHistory.current.length > 60) {
          fpsHistory.current.shift();
        }
        
        // Calculate average FPS
        const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
        
        // Determine quality level
        let quality = 'high';
        let isLowPerformance = false;
        
        if (avgFPS < 30) {
          quality = 'low';
          isLowPerformance = true;
        } else if (avgFPS < 55) {
          quality = 'medium';
          isLowPerformance = true;
        }
        
        setPerformance({ fps: Math.round(avgFPS), quality, isLowPerformance });
        
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      frameCount.current++;
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return performance;
};
