import { useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';

export default function Navbar({ loginRef }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToLogin = (e) => {
    e.preventDefault();
    loginRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.04)' : 'none',
      }}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between"
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="#" aria-label="SchoolSync home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">School</span>
            <span className="text-xl font-bold text-orange-500">Sync</span>
          </a>
          <div className="h-6 w-px bg-gray-200 mx-2" />
          <a
            href="https://www.cornerstoneschool.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cornerstone School website"
          >
            <img
              src="/OP-CS_CONNECT/cslogo.png"
              alt="Cornerstone"
              className="h-7"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </a>
        </motion.div>

        {/* Nav Links + CTA */}
        <motion.div
          className="flex items-center gap-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <a
            href="#login"
            onClick={scrollToLogin}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)',
            }}
          >
            Sign In
          </a>
        </motion.div>
      </nav>
    </motion.header>
  );
}