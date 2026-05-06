import { useState, useEffect, useCallback } from 'react';
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

  // Load users once for notification display
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
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
      {/* Simple gradient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />
      </div>

      {/* Global message notification toasts + incoming call overlay */}
      <MessageNotificationToast currentUser={user} allUsers={allUsers} />

      <SidebarComponent 
        user={user}
        isMobile={isMobile} 
        isCollapsed={isCollapsed} 
        setCollapsed={setCollapsed} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10" style={{ marginLeft: '256px' }}>
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
          className="flex-1 overflow-y-auto p-4 md:p-6 relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
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