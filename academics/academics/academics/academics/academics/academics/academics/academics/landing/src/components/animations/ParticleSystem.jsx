import React, { useRef, useEffect } from 'react';
import useMousePosition from '../../hooks/useMousePosition';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';

const ParticleSystem = ({ 
  particleCount = 50,
  particleColor = '#6366f1',
  particleSize = 3,
  speed = 0.5,
  mouseInteraction = true,
  interactionRadius = 100
}) => {
  const canvasRef = useRef(null);
  const mousePosition = useMousePosition();
  const { shouldReduceQuality } = usePerformanceMonitor();
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = shouldReduceQuality ? 1 : Math.min(window.devicePixelRatio, 2);

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Adjust particle count based on performance
    const adjustedCount = shouldReduceQuality ? Math.floor(particleCount * 0.5) : particleCount;

    // Initialize particles
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.size = Math.random() * particleSize + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction
        if (mouseInteraction && mousePosition.x !== null) {
          const dx = mousePosition.x - this.x;
          const dy = mousePosition.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < interactionRadius) {
            const force = (interactionRadius - distance) / interactionRadius;
            this.vx -= (dx / distance) * force * 0.5;
            this.vy -= (dy / distance) * force * 0.5;
          }
        }

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Boundary check
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

        // Keep within bounds
        this.x = Math.max(0, Math.min(window.innerWidth, this.x));
        this.y = Math.max(0, Math.min(window.innerHeight, this.y));
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Create particles
    particlesRef.current = Array.from({ length: adjustedCount }, () => new Particle());

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particlesRef.current.forEach((particle, i) => {
        particle.update();
        particle.draw(ctx);

        // Draw connections
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = particleColor;
            ctx.globalAlpha = (1 - distance / 120) * 0.2;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, particleColor, particleSize, speed, mouseInteraction, interactionRadius, mousePosition, shouldReduceQuality]);

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

export default ParticleSystem;
