import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicSidebar } from './AcademicSidebar';
import { TopBar } from './TopBar';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export const Layout = ({ children, user, logout, notifications = [], onMarkRead, theme, toggleTheme, portalLogout }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const location = useLocation();
  const [scrollRef, isVisible] = useScrollAnimation({ threshold: 0.1 });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse parallax for background
  const handleMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  }, []);


  const SidebarComponent = AcademicSidebar;
  const handleLogout = logout || portalLogout;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex h-screen overflow-hidden relative" 
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Aurora Background with Mouse Parallax */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dot Grid Texture */}
        <div className="absolute inset-0 nova-dot-grid opacity-40" />
        
        {/* Animated Aurora Blobs with Parallax */}
        <motion.div
          animate={{ 
            x: mousePos.x * -15,
            y: mousePos.y * -15,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 157, 0.06), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{ 
            x: mousePos.x * 10,
            y: mousePos.y * 10,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.2 }}
          className="absolute bottom-[10%] -left-[5%] w-[35vw] h-[35vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <motion.div
          animate={{ 
            x: mousePos.x * -8,
            y: mousePos.y * 8,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.4 }}
          className="absolute top-[40%] -right-[10%] w-[30vw] h-[30vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04), transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <motion.div
          animate={{ 
            x: mousePos.x * 12,
            y: mousePos.y * -8,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.1 }}
          className="absolute -bottom-[5%] -right-[15%] w-[25vw] h-[25vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 191, 0, 0.03), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{ 
            x: mousePos.x * -6,
            y: mousePos.y * -10,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, delay: 0.3 }}
          className="absolute top-[20%] left-[10%] w-[20vw] h-[20vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04), transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Grain Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      </div>

      <SidebarComponent 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setCollapsed={setCollapsed} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopBar 
          user={user}
          isMobile={isMobile} 
          setCollapsed={setCollapsed} 
          isCollapsed={isCollapsed} 
          onLogout={handleLogout} 
          notifications={notifications}
          onMarkRead={onMarkRead}
        />

        {/* Scrollable Content */}
        <main 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1600px] mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};