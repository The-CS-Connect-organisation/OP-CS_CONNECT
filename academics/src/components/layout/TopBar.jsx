import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, UserCircle, Settings, LogOut, Command, ChevronRight, AlertCircle, FileText, MessageSquare, Award, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS, getFromStorage, setToStorage } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

// Notification category config
const CATEGORY_CONFIG = {
  deadline: { icon: AlertCircle, color: '#ef4444', label: 'Deadline' },
  reminder: { icon: Clock, color: '#f59e0b', label: 'Reminder' },
  announcement: { icon: FileText, color: '#3b82f6', label: 'Announcement' },
  message: { icon: MessageSquare, color: '#8b5cf6', label: 'Message' },
  achievement: { icon: Award, color: '#ea580c', label: 'Achievement' },
  assignment: { icon: CheckCircle, color: '#10b981', label: 'Assignment' },
  default: { icon: Bell, color: '#6b7280', label: 'Notification' },
};

const getCategoryConfig = (type) => CATEGORY_CONFIG[type] || CATEGORY_CONFIG.default;

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
  const user = propsUser || storedUser;
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const { playClick, playBlip } = useSound();
  const location = useLocation();
  const navigate = useNavigate();

  // Load notifications for current user
  useEffect(() => {
    if (!user?.id) return;
    const all = getFromStorage(KEYS.NOTIFICATIONS, []);
    const mine = all.filter(n => n.userId === user.id || !n.userId);
    setNotifications(mine.slice(0, 20));
  }, [user?.id]);

  // Real-time: listen for new notifications
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.detail?.key === KEYS.NOTIFICATIONS) {
        const all = getFromStorage(KEYS.NOTIFICATIONS, []);
        const mine = all.filter(n => n.userId === user?.id || !n.userId);
        setNotifications(mine.slice(0, 20));
      }
    };
    window.addEventListener('sms_storage_changed', handleStorage);
    return () => window.removeEventListener('sms_storage_changed', handleStorage);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const timeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleMarkAllRead = () => {
    const all = getFromStorage(KEYS.NOTIFICATIONS, []);
    const updated = all.map(n => n.userId === user?.id || !n.userId ? { ...n, read: true, readAt: new Date().toISOString() } : n);
    setToStorage(KEYS.NOTIFICATIONS, updated);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id) => {
    const all = getFromStorage(KEYS.NOTIFICATIONS, []);
    const updated = all.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n);
    setToStorage(KEYS.NOTIFICATIONS, updated);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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
            <span className="text-sm font-semibold mt-0.5 truncate flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <span style={{ color: '#ea580c' }}>{greeting}</span>
              <span style={{ color: 'var(--text-muted)' }}>, {user?.name?.split(' ')[0]}</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full hidden lg:block mx-4">
          <div 
            className="relative flex items-center h-9 rounded-xl border transition-all duration-200"
            style={{ 
              background: searchFocused ? '#ffffff' : 'var(--bg-surface)',
              borderColor: searchFocused ? '#ea580c' : 'var(--border-default)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(234,88,12,0.12)' : 'none'
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
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: '#ea580c', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-default)' }}>
                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ea580c' }} />
                      Notifications
                    </span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] font-semibold px-2 py-1 rounded-full transition-colors hover:bg-gray-100" style={{ color: 'var(--text-muted)' }}>
                          Mark all read
                        </button>
                      )}
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c' }}>
                        {unreadCount} new
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col max-h-[340px] overflow-y-auto no-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell size={24} className="mx-auto mb-2 text-gray-200" />
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const cat = getCategoryConfig(n.type);
                        const CatIcon = cat.icon;
                        return (
                          <button
                            key={n.id}
                            onClick={() => { handleMarkRead(n.id); setShowNotifications(false); }}
                            className="p-3.5 text-left border-b transition-colors hover:bg-black/02 w-full relative"
                            style={{ borderColor: 'var(--border-subtle)', background: n.read ? 'transparent' : 'rgba(234,88,12,0.03)' }}
                          >
                            {!n.read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />}
                            <div className="flex gap-3 items-start">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${cat.color}15` }}>
                                <CatIcon size={13} style={{ color: cat.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-0.5">
                                  <span className="text-sm font-medium leading-tight" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</span>
                                  <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-dim)' }}>{n.createdAt ? timeAgo(n.createdAt) : ''}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${cat.color}12`, color: cat.color }}>{cat.label}</span>
                                  {n.meta?.subject && <span className="text-[9px] text-gray-400">{n.meta.subject}</span>}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border-default)' }}>
                    <button onClick={() => { setShowNotifications(false); navigate(`/${user?.role}/notifications`); }} className="text-xs font-semibold transition-colors hover:underline" style={{ color: '#ea580c' }}>
                      View all notifications
                    </button>
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
                style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 2px 8px rgba(234,88,12,0.3)' }}>
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
                      style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 2px 8px rgba(234,88,12,0.3)' }}>
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

