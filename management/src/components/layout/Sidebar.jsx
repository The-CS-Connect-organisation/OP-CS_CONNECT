import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, BookOpen, Clock, Calendar, CheckCircle, Banknote, 
  Bell, ChevronLeft, ChevronRight, X, Sparkles, Bot,
  LogOut, Settings, MessageCircle, FileText, BarChart3, ChevronDown,
  ClipboardList, UserCheck, PencilLine, Megaphone, Heart
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

/* ── Navigation Groups per Role ── */
const ROLE_NAV = {
  admin: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
        { title: 'Profile', icon: UserCheck, route: '/admin/profile' },
        { title: 'Analytics', icon: BarChart3, route: '/admin/analytics' },
      ]
    },
    {
      section: 'Management',
      items: [
        { title: 'Users', icon: Users, route: '/admin/users' },
        { title: 'Create Account', icon: UserCheck, route: '/admin/create-account' },
        { title: 'Bus Assignment', icon: FileText, route: '/admin/bus-assignment' },
        { title: 'Timetable', icon: Calendar, route: '/admin/timetable' },
        { title: 'Announcements', icon: Megaphone, route: '/admin/announcements' },
        { title: 'Payroll & HR', icon: Banknote, route: '/admin/payroll-hr' },
      ]
    },
    {
      section: 'Academic',
      items: [
        { title: 'Exams', icon: ClipboardList, route: '/admin/exams' },
        { title: 'Fees & Billing', icon: Banknote, route: '/admin/fees' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Lab', icon: Bot, route: '/admin/ai-lab' },
        { title: 'Comms Hub', icon: MessageCircle, route: '/admin/comms' },
      ]
    },
  ],
  student: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/student/dashboard' },
      ]
    },
    {
      section: 'Academic',
      items: [
        { title: 'Assignments', icon: FileText, route: '/student/assignments' },
        { title: 'Grades', icon: CheckCircle, route: '/student/grades' },
        { title: 'Timetable', icon: Clock, route: '/student/timetable' },
        { title: 'Attendance', icon: UserCheck, route: '/student/attendance' },
        { title: 'Notes', icon: BookOpen, route: '/student/notes' },
      ]
    },
    {
      section: 'Services',
      items: [
        { title: 'Fees', icon: Banknote, route: '/student/fees' },
        { title: 'Exams', icon: ClipboardList, route: '/student/exams' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Assistant', icon: Sparkles, route: '/student/ai-lab' },
        { title: 'Messages', icon: MessageCircle, route: '/student/comms' },
      ]
    },
  ],
  teacher: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/teacher/dashboard' },
      ]
    },
    {
      section: 'Teaching',
      items: [
        { title: 'Assignments', icon: FileText, route: '/teacher/assignments' },
        { title: 'Attendance', icon: UserCheck, route: '/teacher/attendance' },
        { title: 'Grading', icon: PencilLine, route: '/teacher/grading' },
        { title: 'Notes', icon: BookOpen, route: '/teacher/notes' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Lab', icon: Bot, route: '/teacher/ai-lab' },
        { title: 'Messages', icon: MessageCircle, route: '/teacher/comms' },
        { title: 'Exams', icon: ClipboardList, route: '/teacher/exams' },
      ]
    },
  ],
  parent: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/parent/dashboard' },
      ]
    },
    {
      section: 'My Children',
      items: [
        { title: 'Attendance', icon: UserCheck, route: '/parent/attendance' },
        { title: 'Grades', icon: CheckCircle, route: '/parent/grades' },
        { title: 'Fees', icon: Banknote, route: '/parent/fees' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'Messages', icon: MessageCircle, route: '/parent/comms' },
      ]
    },
  ],
  librarian: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/librarian/dashboard' },
        { title: 'Profile', icon: UserCheck, route: '/librarian/profile' },
      ]
    },
    {
      section: 'Library',
      items: [
        { title: 'Library Management', icon: BookOpen, route: '/librarian/library' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'Messages', icon: MessageCircle, route: '/librarian/comms' },
      ]
    },
  ],
};

/* ── Role colors ── */
const ROLE_COLOR = {
  admin: { bg: '#111111', text: 'white', label: 'Admin' },
  teacher: { bg: '#a855f7', text: 'white', label: 'Teacher' },
  student: { bg: '#ff6b9d', text: 'white', label: 'Student' },
  parent: { bg: '#6366f1', text: 'white', label: 'Parent' },
  librarian: { bg: '#8b5cf6', text: 'white', label: 'Librarian' },
};

export const Sidebar = ({ isMobile, isCollapsed, setCollapsed, onLogout }) => {
  const { data: user } = useStore(KEYS.CURRENT_USER, null);
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick, playBlip } = useSound();
  const [collapsedSections, setCollapsedSections] = useState({});

  const role = user?.role || 'student';
  const navGroups = ROLE_NAV[role] || [];
  const roleColor = ROLE_COLOR[role] || ROLE_COLOR.student;
  
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [location.pathname, isMobile, setCollapsed]);

  const toggleSection = (section) => {
    if (isCollapsed) return;
    playClick();
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40" 
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => { playBlip(); setCollapsed(true); }} 
        />
      )}
      
      <motion.aside
        initial={false}
        animate={{ 
          width: isCollapsed ? '72px' : '256px',
          x: isMobile && isCollapsed ? '-100%' : '0%'
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col overflow-hidden border-r"
        style={{
          background: '#ffffff',
          borderColor: 'var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* ── Logo Area ── */}
        <div className="h-[64px] flex items-center justify-between px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-default)' }}>
          <AnimatePresence mode="popLayout">
            {!isCollapsed ? (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12, transition: { duration: 0.1 } }}
                className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#111111', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <span className="text-[var(--text-primary)] font-bold text-sm">C</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight text-sm" style={{ color: 'var(--text-primary)' }}>Cornerstone</span>
                  <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    SchoolSync
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="collapsed" className="w-full flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  style={{ background: '#111111', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  onClick={() => setCollapsed(false)}
                >
                  <span className="text-[var(--text-primary)] font-bold text-sm">C</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isMobile && !isCollapsed && (
            <button onClick={() => setCollapsed(true)} className="md:hidden p-1 rounded-lg hover:bg-black/05 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-0.5 relative z-10 px-2">
          {navGroups.map((group, gIdx) => (
            <div key={group.section} className={gIdx > 0 ? 'mt-1' : ''}>
              {/* Section header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(group.section)}
                  className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg transition-colors hover:bg-black/03"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
                    {group.section}
                  </span>
                  <ChevronDown 
                    size={11} 
                    className={`transition-transform duration-200`}
                    style={{ 
                      color: 'var(--text-dim)',
                      transform: collapsedSections[group.section] ? 'rotate(-90deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>
              )}

              {isCollapsed && gIdx > 0 && (
                <div className="mx-3 my-2 h-[1px]" style={{ background: 'var(--border-default)' }} />
              )}

              <AnimatePresence initial={false}>
                {!collapsedSections[group.section] && group.items.map((item) => {
                  const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + '/');
                  return (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      key={item.title}
                      onClick={() => { playBlip(); navigate(item.route); }}
                      onMouseEnter={playClick}
                      className={`relative flex items-center gap-3 py-2 rounded-xl transition-all duration-150 w-full overflow-hidden ${
                        isCollapsed ? 'justify-center px-1' : 'px-3'
                      }`}
                      style={{ 
                        background: isActive ? 'rgba(0,0,0,0.07)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                      title={isCollapsed ? item.title : undefined}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div 
                          layoutId="sidebarIndicator" 
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                          style={{ background: '#111111' }}
                          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                      )}
                      
                      <item.icon size={17} className="shrink-0" />
                      
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'var(--border-default)' }}>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="mb-2 p-2 rounded-xl flex items-center gap-3"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: roleColor.bg, color: roleColor.text }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
                  <span className="text-[10px] font-medium capitalize" style={{ color: 'var(--text-muted)' }}>{role}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => { playBlip(); navigate(`/${role}/settings`); }}
            onMouseEnter={playClick}
            className={`flex items-center gap-2.5 w-full py-2 rounded-xl transition-all hover:bg-black/05 ${isCollapsed ? 'justify-center' : 'px-3'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            <Settings size={17} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>

          <button
            onClick={() => { playBlip(); setCollapsed(!isCollapsed); }}
            onMouseEnter={playClick}
            className={`flex items-center gap-2.5 w-full py-2 rounded-xl transition-all hover:bg-black/05 ${isCollapsed ? 'justify-center' : 'px-3'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          <button
            onClick={() => { playBlip(); onLogout(); }}
            onMouseEnter={playClick}
            className={`flex items-center gap-2.5 w-full py-2 rounded-xl transition-all hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'px-3'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={17} />
            {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};
