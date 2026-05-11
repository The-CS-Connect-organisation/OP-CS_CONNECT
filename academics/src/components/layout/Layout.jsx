import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MessageNotificationToast } from '../messaging/MessageNotificationToast';

export const Layout = ({ children, user, logout, notifications = [], onMarkRead, theme, toggleTheme, portalLogout }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [allUsers, setAllUsers] = useState([]);
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

  useEffect(() => {
    if (!user?.id) return;
    import('../../utils/apiClient').then(({ request }) => {
      request('/school/users?limit=500')
        .then(res => setAllUsers(res.users || res.items || []))
        .catch(() => {});
    });
  }, [user?.id]);

  const SidebarComponent = Sidebar;
  const handleLogout = logout || portalLogout;

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: '#fafaf9' }}>
      {/* Atmospheric background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40" />

        {/* Top-left decorative orb */}
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Bottom-right decorative orb */}
        <div
          className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Center glow */}
        <div
          className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating decorative dots */}
        {[
          { top: '12%', left: '8%', size: 3, delay: 0 },
          { top: '35%', left: '75%', size: 4, delay: 1.2 },
          { top: '70%', left: '15%', size: 3, delay: 0.6 },
          { top: '80%', left: '80%', size: 5, delay: 2 },
          { top: '20%', left: '60%', size: 2, delay: 0.4 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: 'rgba(234, 88, 12, 0.25)',
            }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: dot.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Global message notification toasts */}
      <MessageNotificationToast currentUser={user} allUsers={allUsers} />

      <SidebarComponent
        user={user}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10" style={{ marginLeft: '268px' }}>
        <TopBar
          user={user}
          isMobile={isMobile}
          setCollapsed={setCollapsed}
          isCollapsed={isCollapsed}
          onLogout={handleLogout}
          notifications={notifications}
          onMarkRead={onMarkRead}
        />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 relative" style={{ scrollBehavior: 'smooth' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{
                duration: 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
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