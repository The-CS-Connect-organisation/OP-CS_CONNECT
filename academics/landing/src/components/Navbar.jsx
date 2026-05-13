import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Smooth navbar background transition
  const navOpacity = useTransform(scrollY, [0, 100], [0, 0.95]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled
          ? 'rgba(255,255,255,0.6)'
          : 'rgba(255,255,255,0.25)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.5)'
          : '1px solid rgba(255,255,255,0.2)',
        boxShadow: scrolled
          ? '0 4px 24px rgba(245,158,11,0.08), 0 1px 0 rgba(255,255,255,0.6) inset'
          : '0 1px 0 rgba(255,255,255,0.3) inset',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="max-w-7xl mx-auto px-6 h-[56px] flex items-center justify-between"
      >
        {/* Logos - Compact in corner */}
        <motion.div 
          className="flex items-center gap-2" 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* SchoolSync Text Logo */}
          <a 
            href="#" 
            aria-label="SchoolSync home"
          >
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 leading-none">
              SchoolSync
            </span>
          </a>
          
          {/* Separator */}
          <div className="h-6 w-px bg-gray-300"></div>
          
          {/* Cornerstone Logo - Smaller and compact */}
          <a 
            href="https://www.cornerstoneschool.edu.in/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center" 
            aria-label="Cornerstone School website"
          >
            <img
              src="/OP-CS_CONNECT/cslogo.png"
              alt="Cornerstone"
              className="h-6"
            />
          </a>
        </motion.div>

        {/* Sign In Button */}
        <motion.a
          href="/academics/login"
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
