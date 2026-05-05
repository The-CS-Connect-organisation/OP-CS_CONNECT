import React, { useRef, useEffect } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const BinaryDataStream = ({ 
  streamCount = 20,
  speed = 2
}) => {
  const canvasRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();
  const streamsRef = useRef([]);
  const animationRef = useRef(null);

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

    const adjustedCount = shouldReduceQuality ? Math.floor(streamCount * 0.6) : streamCount;

    class BinaryStream {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -50;
        this.speed = Math.random() * speed + 1;
        this.length = Math.floor(Math.random() * 20) + 10;
        this.binary = Array.from({ length: this.length }, () => Math.random() > 0.5 ? '1' : '0');
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.y += this.speed;

        // Update binary values occasionally
        if (Math.random() > 0.95) {
          const index = Math.floor(Math.random() * this.length);
          this.binary[index] = this.binary[index] === '1' ? '0' : '1';
        }

        // Reset when off screen
        if (this.y > window.innerHeight + 50) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.font = '12px "Courier New", monospace';
        ctx.textAlign = 'center';

        this.binary.forEach((bit, i) => {
          const y = this.y + (i * 15);
          
          if (y > 0 && y < window.innerHeight) {
            // Gradient opacity for trail effect
            const trailOpacity = this.opacity * (1 - (i / this.length) * 0.5);
            
            // Color based on bit value
            ctx.fillStyle = bit === '1' ? '#60a5fa' : '#6366f1';
            ctx.globalAlpha = trailOpacity;
            
            // Add glow for leading bits
            if (i < 3) {
              ctx.shadowBlur = 5;
              ctx.shadowColor = bit === '1' ? '#60a5fa' : '#6366f1';
            } else {
              ctx.shadowBlur = 0;
            }
            
            ctx.fillText(bit, this.x, y);
          }
        });

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    streamsRef.current = Array.from({ length: adjustedCount }, () => new BinaryStream());

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      streamsRef.current.forEach(stream => {
        stream.update();
        stream.draw(ctx);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [streamCount, speed, shouldReduceQuality]);

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
        opacity: 0.7
      }}
    />
  );
};

export default BinaryDataStream;
