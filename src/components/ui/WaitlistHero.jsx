'use client';
import { memo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const WaitlistHero = memo(function WaitlistHero({
  headline = 'Want This for Your School?',
  subheadline = 'Join the waitlist and be the first to experience Cornerstone AI at your institution.',
  ctaLabel = 'Join Waitlist',
  successMessage = "You're on the list! We'll be in touch.",
  className,
  theme = 'dark',
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  const isDark = theme === 'dark';

  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#0079da', '#10b981', '#fbbf24', '#f472b6', '#fff'];

    canvas.width = 600;
    canvas.height = 600;

    const createParticle = () => ({
      x: 300, y: 300,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 2) * 10,
      life: 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 2,
    });

    for (let i = 0; i < 50; i++) particles.push(createParticle());

    const animate = () => {
      if (particles.length === 0) { ctx.clearRect(0, 0, 600, 600); return; }
      ctx.clearRect(0, 0, 600, 600);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 2;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) { particles.splice(i, 1); i--; }
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setLoading(false);
    setEmail('');
    fireConfetti();
  };

  return (
    <section className={cn('w-full py-20 px-4 md:px-8 relative overflow-hidden', className)}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ perspective: '1200px', transform: 'perspective(1200px) rotateX(15deg)', transformOrigin: 'center bottom' }}
      >
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute top-1/2 left-1/2" style={{ width: '2000px', height: '2000px', transform: 'translate(-50%, -50%)', zIndex: 0 }}>
            <div className="w-full h-full rounded-full border-2 border-pink-500/10" />
            <div className="absolute inset-0 animate-spin-slow-reverse rounded-full border border-indigo-500/10" style={{ width: '1500px', height: '1500px', top: '250px', left: '250px' }} />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: isDark
          ? 'linear-gradient(to top, #09090b 10%, rgba(9,9,11,0.8) 40%, transparent 100%)'
          : 'linear-gradient(to top, #f8fafc 10%, rgba(248,250,252,0.8) 40%, transparent 100%)',
      }} />

      <div className="max-w-2xl mx-auto relative z-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6',
              isDark ? 'bg-pink-500/20 border-pink-500/30' : 'bg-pink-100 border-pink-200'
            )}
            style={{ border: `1px solid ${isDark ? 'rgba(255,107,157,0.3)' : 'rgba(255,107,157,0.3)'}` }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full"
              style={{ background: isDark ? 'rgba(255,107,157,0.4)' : 'rgba(255,107,157,0.4)', border: '1px solid rgba(255,107,157,0.6)' }}
            />
            <span className={cn('text-sm font-medium', isDark ? 'text-pink-400' : 'text-pink-600')}>Coming Soon</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn('text-4xl md:text-5xl font-bold mb-4', isDark ? 'text-white' : 'text-zinc-900')}
          >
            {headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={cn('text-lg mb-8', isDark ? 'text-zinc-400' : 'text-zinc-500')}
          >
            {subheadline}
          </motion.p>

          <canvas ref={canvasRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-50" />

          {!submitted ? (
            <motion.form
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="relative h-[60px] max-w-md mx-auto group"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@school.edu"
                required
                disabled={loading}
                className={cn(
                  'w-full h-[60px] pl-6 pr-[150px] rounded-full outline-none transition-all duration-200',
                  isDark
                    ? 'bg-zinc-900 text-white placeholder:text-zinc-500'
                    : 'bg-white text-zinc-900 placeholder:text-zinc-400 border border-zinc-200',
                  'shadow-lg',
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                )}
              />
              <div className="absolute top-[6px] right-[6px] bottom-[6px]">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'h-full px-6 rounded-full font-semibold text-white transition-all active:scale-95 flex items-center justify-center min-w-[130px]',
                    isDark ? 'bg-pink-500 hover:bg-pink-400' : 'bg-pink-500 hover:bg-pink-400'
                  )}
                >
                  {loading ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    </span>
                  ) : ctaLabel}
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'flex flex-col items-center gap-3 py-4 px-8 rounded-full max-w-md mx-auto',
                'bg-emerald-500 text-white animate-success-glow'
              )}
              style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path className="animate-checkmark" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold">{successMessage}</span>
              </div>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className={cn('text-xs mt-6', isDark ? 'text-zinc-500' : 'text-zinc-400')}
          >
            No spam. Just one email when we launch.
          </motion.p>
        </div>
      </div>
    </section>
  );
});

export { WaitlistHero };
