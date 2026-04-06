import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagementSidebar } from './ManagementSidebar';
import { TopBar } from './TopBar';

export const Layout = ({ children, user, onLogout, notifications, onMarkRead }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SidebarComponent = ManagementSidebar;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle dot texture */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 nova-dot-grid opacity-60" />
        <div 
          className="absolute -top-[10%] right-[5%] w-[35vw] h-[35vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 157, 0.06), transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute bottom-[10%] -left-[5%] w-[30vw] h-[30vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.04), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <SidebarComponent 
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setCollapsed={setCollapsed} 
        onLogout={onLogout} 
      />
      
      <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        <TopBar 
          user={user}
          isMobile={isMobile} 
          setCollapsed={setCollapsed} 
          isCollapsed={isCollapsed} 
          onLogout={onLogout} 
          notifications={notifications}
          onMarkRead={onMarkRead}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar relative w-full h-full p-4 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
