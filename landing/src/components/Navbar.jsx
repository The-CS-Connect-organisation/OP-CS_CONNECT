import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar({ loginRef }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
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
      animate={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.90)' : 'rgba(10,10,10,0)',
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        borderBottomColor: scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0)',
      }}
      style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group" aria-label="SchoolSync home">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#c44dff] flex items-center justify-center shadow-lg shadow-[#ff6b9d]/20">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            Cornerstone <span className="text-[#ff6b9d]">SchoolSync</span>
          </span>
        </a>

        {/* Sign In */}
        <a
          href="#login"
          onClick={scrollToLogin}
          className="px-5 py-2 rounded-full text-sm font-semibold text-white border border-white/10 hover:border-[#ff6b9d]/50 hover:text-[#ff6b9d] transition-all duration-200 glass"
        >
          Sign In
        </a>
      </nav>
    </motion.header>
  );
}
