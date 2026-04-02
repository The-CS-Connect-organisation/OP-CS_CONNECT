import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout = ({ user, children, notifications, theme, toggleTheme, onLogout, onMarkRead }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar
        role={user.role}
        isCollapsed={collapsed}
        toggleCollapse={() => setCollapsed(!collapsed)}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
      />
      <motion.div
        animate={{ marginLeft: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        <TopBar
          user={user}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          notifications={notifications}
          onMarkRead={onMarkRead}
        />
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};
