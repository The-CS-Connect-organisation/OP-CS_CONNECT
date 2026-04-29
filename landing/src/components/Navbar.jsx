import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Navbar({ loginRef }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Smooth navbar background transition
  const navOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);

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
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
        WebkitBackacity: scrolled ? 'blur(20px)' : 'blur(0px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        {/* Logo */}
        <motion.a 
          href="#" 
          className="flex items-center gap-3 group" 
          aria-label="Cornerstone home"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.img
            src="/OP-CS_CONNECT/cslogo.png"
            alt="Cornerstone"
            className="h-10"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          />
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
            SchoolSync
          </span>
        </motion.a>

        {/* Sign In Button */}
        <motion.a
          href="#login"
          onClick={scrollToLogin}
          className="relative px-6 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 8px 20px rgba(245,158,11,0.3)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative">Sign In</span>
        </motion.a>
      </nav>
    </motion.header>
  );
}
