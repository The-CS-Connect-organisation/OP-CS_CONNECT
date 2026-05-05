import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, UserCircle, Settings, LogOut, Command, ChevronRight } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

const getBreadcrumbs = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2) return [];
  const role = parts[0];
  const page = parts.slice(1).map(p => 
    p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
  return [{ label: role.charAt(0).toUpperCase() + role.slice(1) }, ...page.map(p => ({ label: p }))];
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const TopBar = ({ isMobile, setCollapsed, isCollapsed, onLogout, user: propsUser }) => {
  const { data: storedUser } = useStore(KEYS.CURRENT_USER, null);
  const user = propsUser || storedUser; // Use prop user if available, fallback to stored
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef(null);
  const { playClick, playBlip } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);
  const greeting = useMemo(() => getGreeting(), []);

  const handleLogout = () => {
    playBlip();
    if (onLogout) onLogout();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className="h-[64px] flex-shrink-0 relative z-40 flex flex-col justify-center border-b"
      style={{ 
        background: 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="px-4 md:px-6 flex items-center justify-between relative z-10 w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Hamburger Menu - Mobile */}
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => { playBlip(); setCollapsed(!isCollapsed); }}
            className="md:hidden p-2 rounded-xl transition-colors hover:bg-black/05"
            style={{ color: 'var(--text-muted)' }}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </motion.button>

          <div className="hidden md:flex flex-col min-w-0">
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-dim)' }}>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} />}
                  <span className={i === breadcrumbs.length - 1 ? 'font-medium' : ''} style={{ color: i === breadcrumbs.length - 1 ? 'var(--text-secondary)' : 'var(--text-dim)' }}>{crumb.label}</span>
                </span>
              ))}
            </div>
            <span className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
              {greeting}, <span style={{ color: 'var(--text-muted)' }}>{user?.name?.split(' ')[0]}</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full hidden lg:block mx-4">
          <div 
            className="relative flex items-center h-9 rounded-xl border transition-all duration-200"
            style={{ 
              background: searchFocused ? '#ffffff' : 'var(--bg-surface)',
              borderColor: searchFocused ? '#111111' : 'var(--border-default)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Search size={14} className="absolute left-3" style={{ color: searchFocused ? 'var(--text-primary)' : 'var(--text-dim)' }} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              onFocus={() => { playClick(); setSearchFocused(true); }}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent border-none pl-9 pr-12 py-2 focus:outline-none focus:ring-0 text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
            <div className="absolute right-2">
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-dim)', borderColor: 'var(--border-default)' }}>
                <Command size={9} /> K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-2.5" ref={profileRef}>
          {/* Bell */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { playBlip(); setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-xl transition-colors hover:bg-black/05"
              style={{ color: 'var(--text-muted)' }}
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400" />
            </motion.button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 6, scale: 0.97 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                  className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border z-50"
                  style={{ 
                    background: '#ffffff',
                    borderColor: 'var(--border-default)', 
                    boxShadow: 'var(--shadow-xl)' 
                  }}
                >
                  <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-default)' }}>
                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      Notifications
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 border border-pink-100">2 new</span>
                  </div>
                  <div className="flex flex-col max-h-[280px] overflow-y-auto no-scrollbar">
                    {[
                      { id: 1, title: 'System Sync Complete', desc: 'Database backup finished', time: '1m ago', unread: true },
                      { id: 2, title: 'New Assignment', desc: 'Math homework due Monday', time: '10m ago', unread: true },
                      { id: 3, title: 'Fee Reminder', desc: 'Term 2 payment approaching', time: '2h ago', unread: false }
                    ].map(n => (
                      <button key={n.id} className="p-3.5 text-left border-b transition-colors hover:bg-black/02 w-full"
                        style={{ borderColor: 'var(--border-subtle)', background: n.unread ? 'var(--bg-surface)' : 'transparent' }}>
                        <div className="flex justify-between w-full mb-0.5">
                          <span className="text-sm font-medium" style={{ color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{n.title}</span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>{n.time}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { playBlip(); setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-colors border hover:bg-black/03"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[var(--text-primary)]"
                style={{ background: '#111111' }}>
                {user?.profilePhotoUrl 
                  ? <img src={user.profilePhotoUrl} className="w-full h-full rounded-lg object-cover" alt="" /> 
                  : (user?.name?.charAt(0) || 'U')
                }
              </div>
              <div className="hidden md:flex flex-col items-start text-left">
                <span className="text-sm font-semibold leading-none mb-0.5 max-w-[90px] truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
                <span className="text-[10px] font-medium capitalize leading-none" style={{ color: 'var(--text-muted)' }}>{user?.role}</span>
              </div>
            </motion.button>
            
            <AnimatePresence>
              {showProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 6, scale: 0.97 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border p-1.5 z-50"
                  style={{ 
                    background: '#ffffff', 
                    borderColor: 'var(--border-default)', 
                    boxShadow: 'var(--shadow-xl)' 
                  }}
                >
                  <div className="p-3 mb-1 rounded-lg flex gap-3 items-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-[var(--text-primary)] shrink-0"
                      style={{ background: '#111111' }}>
                      {user?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
                      <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => { playBlip(); navigate(`/${user?.role}/profile`); setShowProfile(false); }} 
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors w-full text-left hover:bg-black/05"
                      style={{ color: 'var(--text-secondary)' }}>
                      <UserCircle size={15} style={{ color: 'var(--text-muted)' }} /> Profile
                    </button>
                    <button onClick={() => { playBlip(); navigate(`/${user?.role}/settings`); setShowProfile(false); }} 
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors w-full text-left hover:bg-black/05"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Settings size={15} style={{ color: 'var(--text-muted)' }} /> Settings
                    </button>
                    <div className="h-[1px] my-1 mx-2" style={{ background: 'var(--border-default)' }} />
                    <button onClick={handleLogout} 
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors w-full text-left font-medium hover:bg-red-50 hover:text-red-500"
                      style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

