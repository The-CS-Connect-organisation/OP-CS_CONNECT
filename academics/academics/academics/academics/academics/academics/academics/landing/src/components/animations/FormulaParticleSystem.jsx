import React, { useRef, useEffect } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const FormulaParticleSystem = ({ 
  formulaCount = 15,
  speed = 0.3
}) => {
  const canvasRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();
  const formulasRef = useRef([]);
  const animationRef = useRef(null);

  const formulas = [
    'E=mc²',
    'a²+b²=c²',
    'F=ma',
    'πr²',
    '∫f(x)dx',
    '∑n²',
    'Δx/Δt',
    'sin²θ+cos²θ=1',
    'e^(iπ)+1=0',
    'x=(-b±√(b²-4ac))/2a',
    'PV=nRT',
    'λ=h/p',
    '∇·E=ρ/ε₀',
    'dS≥0',
    'H=TS+PV'
  ];

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

    const adjustedCount = shouldReduceQuality ? Math.floor(formulaCount * 0.6) : formulaCount;

    class FormulaParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.formula = formulas[Math.floor(Math.random() * formulas.length)];
        this.opacity = Math.random() * 0.4 + 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.fontSize = Math.random() * 10 + 16;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Wrap around screen
        if (this.x < -100) this.x = window.innerWidth + 100;
        if (this.x > window.innerWidth + 100) this.x = -100;
        if (this.y < -100) this.y = window.innerHeight + 100;
        if (this.y > window.innerHeight + 100) this.y = -100;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        ctx.fillStyle = '#a855f7';
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.formula, 0, 0);
        ctx.restore();
      }
    }

    formulasRef.current = Array.from({ length: adjustedCount }, () => new FormulaParticle());

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      formulasRef.current.forEach(formula => {
        formula.update();
        formula.draw(ctx);
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
  }, [formulaCount, speed, shouldReduceQuality]);

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
        zIndex: 1
      }}
    />
  );
};

export default FormulaParticleSystem;
