import React, { useRef, useEffect } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const CodeRainEffect = ({ 
  columns = 50,
  speed = 30,
  fontSize = 14
}) => {
  const canvasRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();
  const dropsRef = useRef([]);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>/\\|~`αβγδεζηθικλμνξοπρστυφχψω∑∫∂∇';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = shouldReduceQuality ? 1 : Math.min(window.devicePixelRatio, 2);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const adjustedColumns = shouldReduceQuality ? Math.floor(columns * 0.5) : columns;
    const columnWidth = window.innerWidth / adjustedColumns;

    // Initialize drops
    dropsRef.current = Array(adjustedColumns).fill(1);

    let lastTime = 0;
    const fps = shouldReduceQuality ? 20 : speed;
    const interval = 1000 / fps;

    const draw = (currentTime) => {
      if (currentTime - lastTime < interval) {
        requestAnimationFrame(draw);
        return;
      }

      lastTime = currentTime;

      // Semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.fillStyle = '#6366f1';
      ctx.font = `${fontSize}px 'Courier New', monospace`;

      dropsRef.current.forEach((y, i) => {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * columnWidth;

        // Draw character
        ctx.fillStyle = '#a855f7';
        ctx.fillText(text, x, y * fontSize);

        // Add glow effect for leading character
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x, y * fontSize);
        ctx.shadowBlur = 0;

        // Reset drop to top randomly
        if (y * fontSize > window.innerHeight && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }

        dropsRef.current[i]++;
      });

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [columns, speed, fontSize, shouldReduceQuality]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.6
      }}
    />
  );
};

export default CodeRainEffect;
