import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, School, Loader2 } from 'lucide-react';

// Spinning ring images from the snippet — replaced with CSS rings since we can't
// use external framerusercontent images reliably. Same vibe, pure CSS.

export default function WaitlistSection() {
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const canvasRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !schoolName) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setSchoolName('');
      setEmail('');
      fireConfetti();
    }, 1400);
  };

  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#f59e0b', '#f97316', '#10b981', '#8b5cf6', '#ffffff'];
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 2.2) * 10,
        life: 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
      });
    }

    const animate = () => {
      if (!particles.length) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.5; p.life -= 2;
        ctx.globalAlpha = Math.max(0, p.life / 100);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(animate);
    };
    animate();
  };

  return (
    <section className="relative w-full min-h-screen bg-[#09090b] flex items-center justify-center overflow-hidden">

      {/* Animated CSS rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[320, 480, 640, 800].map((size, i) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-white/[0.06]"
            style={{ width: size, height: size }}
            animate={{ rotate: i % 2 === 0 ? [0, 360] : [0, -360] }}
            transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
        {/* Glow blob */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />
      </div>

      {/* Gradient overlay — bottom fade */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #09090b 10%, rgba(9,9,11,0.7) 40%, transparent 100%)' }}
      />

      {/* Content */}
      <div className="relative z-20 w-full flex flex-col items-center justify-end pb-24 gap-6 px-6 pt-32">

        {/* School icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl shadow-lg overflow-hidden ring-1 ring-white/10 flex items-center justify-center mb-2"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <School size={30} className="text-white" />
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-4xl md:text-5xl font-black text-center text-white tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Not at Cornerstone?
        </motion.h2>

        <motion.p
          className="text-lg font-medium text-white/50 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          We can set up SchoolSync for your institution too. Drop your details and we'll reach out.
        </motion.p>

        {/* Form */}
        <motion.div
          className="w-full max-w-md mt-4 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Confetti canvas */}
          <canvas
            ref={canvasRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none z-50"
          />

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-[60px] flex items-center justify-center gap-3 rounded-full font-semibold text-white"
                style={{ background: '#10b981', boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}
              >
                <CheckCircle size={20} />
                <span>We'll be in touch soon!</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-3"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  required
                  placeholder="Your school name"
                  value={schoolName}
                  disabled={status === 'loading'}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full h-[52px] px-5 rounded-full text-sm font-medium text-white placeholder-zinc-500 outline-none disabled:opacity-60"
                  style={{
                    background: '#27272a',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                  }}
                />
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    disabled={status === 'loading'}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[60px] pl-6 pr-[160px] rounded-full text-sm font-medium text-white placeholder-zinc-500 outline-none disabled:opacity-60"
                    style={{
                      background: '#27272a',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
                    }}
                  />
                  <div className="absolute top-[6px] right-[6px] bottom-[6px]">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="h-full px-6 rounded-full font-bold text-white text-sm flex items-center justify-center gap-2 min-w-[140px] transition-all hover:brightness-110 active:scale-95 disabled:cursor-wait"
                      style={{ background: '#f59e0b' }}
                    >
                      {status === 'loading' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <span>Get in touch</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fine print */}
        <motion.p
          className="text-xs text-white/20 text-center mt-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          We typically respond within 24 hours. No spam, ever.
        </motion.p>
      </div>
    </section>
  );
}
