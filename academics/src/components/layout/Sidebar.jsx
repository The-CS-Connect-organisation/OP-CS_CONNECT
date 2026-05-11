import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, Clock, Calendar, CheckCircle, Banknote,
  Bell, ChevronLeft, ChevronRight, X, Sparkles, Bot,
  LogOut, Settings, MessageCircle, FileText, BarChart3, ChevronDown,
  ClipboardList, UserCheck, PencilLine, Megaphone, Heart, Wallet, Bus, Award, Zap, Trophy, Sunrise
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { KEYS } from '../../data/schema';
import { useSound } from '../../hooks/useSound';

const ROLE_NAV = {
  admin: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
        { title: 'Analytics', icon: BarChart3, route: '/admin/analytics' },
      ]
    },
    {
      section: 'Management',
      items: [
        { title: 'Users', icon: Users, route: '/admin/users' },
        { title: 'Accounts', icon: Wallet, route: '/admin/accounts' },
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
    {
      section: 'Transportation',
      items: [
        { title: 'Bus Assignment', icon: Bus, route: '/admin/bus-assignment' },
      ]
    },
  ],
  student: [
    {
      section: 'Overview',
      items: [
        { title: 'Daily Briefing', icon: Sunrise, route: '/student/briefing' },
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
        { title: 'Shared Notes', icon: BookOpen, route: '/student/shared-notes' },
        { title: 'Announcements', icon: Megaphone, route: '/student/announcements' },
        { title: 'Study Planner', icon: Calendar, route: '/student/planner' },
        { title: 'CS Calendar', icon: Calendar, route: '/student/calendar' },
        { title: 'Focus Mode', icon: Zap, route: '/student/focus' },
      ]
    },
    {
      section: 'Services',
      items: [
        { title: 'Fees', icon: Banknote, route: '/student/fees' },
        { title: 'Exams', icon: ClipboardList, route: '/student/exams' },
        { title: 'Bus Tracking', icon: Heart, route: '/student/bus-tracking' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Assistant', icon: Sparkles, route: '/student/ai-lab' },
        { title: 'Messages', icon: MessageCircle, route: '/student/messages' },
        { title: 'Nexus Hub', icon: Users, route: '/student/nexus' },
        { title: 'Achievements', icon: Trophy, route: '/student/achievements' },
        { title: 'Profile', icon: Users, route: '/student/profile' },
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
        { title: 'Grading', icon: PencilLine, route: '/teacher/submissions' },
        { title: 'Class Notes', icon: BookOpen, route: '/teacher/class-notes' },
        { title: 'Exams', icon: ClipboardList, route: '/teacher/exams' },
        { title: 'Report Cards', icon: Award, route: '/teacher/report-cards' },
      ]
    },
    {
      section: 'Analytics',
      items: [
        { title: 'Class Analytics', icon: BarChart3, route: '/teacher/analytics' },
        { title: 'Student Progress', icon: CheckCircle, route: '/teacher/progress' },
        { title: 'Performance Reports', icon: FileText, route: '/teacher/reports' },
      ]
    },
    {
      section: 'Communication',
      items: [
        { title: 'Quick Messenger', icon: MessageCircle, route: '/teacher/messaging' },
        { title: 'Notifications', icon: Bell, route: '/teacher/notifications' },
        { title: 'Comms Hub', icon: Megaphone, route: '/teacher/comms' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Lab', icon: Bot, route: '/teacher/ai-lab' },
      ]
    },
  ],
  driver: [
    {
      section: 'Overview',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, route: '/driver/dashboard' },
      ]
    },
    {
      section: 'My Account',
      items: [
        { title: 'Profile', icon: Users, route: '/driver/profile' },
      ]
    },
  ],
  librarian: [
    {
      section: 'Overview',
      items: [
        { title: 'Library', icon: BookOpen, route: '/librarian/library' },
      ]
    },
    {
      section: 'My Account',
      items: [
        { title: 'Profile', icon: Users, route: '/librarian/profile' },
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
        { title: 'Timetable', icon: Clock, route: '/parent/timetable' },
        { title: 'Fees', icon: Banknote, route: '/parent/fees' },
      ]
    },
    {
      section: 'Services',
      items: [
        { title: 'Bus Tracking', icon: Heart, route: '/parent/bus-tracking' },
        { title: 'Notifications', icon: Bell, route: '/parent/notifications' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'Messages', icon: MessageCircle, route: '/parent/comms' },
        { title: 'Profile', icon: Users, route: '/parent/profile' },
      ]
    },
  ],
};

const ROLE_COLOR = {
  admin:     { bg: '#1c1917', text: 'white', label: 'Admin' },
  teacher:   { bg: '#7c3aed', text: 'white', label: 'Teacher' },
  student:   { bg: '#ea580c', text: 'white', label: 'Student' },
  parent:    { bg: '#6366f1', text: 'white', label: 'Parent' },
  librarian: { bg: '#0ea5e9', text: 'white', label: 'Librarian' },
};

export const Sidebar = ({ user: propsUser, isMobile, isCollapsed, setCollapsed, onLogout }) => {
  const { data: storedUser } = useStore(KEYS.CURRENT_USER, null);
  const user = propsUser || storedUser;
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

  return (
    <>
      {isMobile && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(6px)' }}
          onClick={() => { playBlip(); setCollapsed(true); }}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: '268px' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed top-0 left-0 h-screen z-50 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Brand Header */}
        <div
          className="h-[68px] flex items-center justify-between px-5 flex-shrink-0 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.06)' }}
        >
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12, transition: { duration: 0.1 } }}
            className="flex items-center gap-3.5 overflow-hidden whitespace-nowrap"
          >
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}>
              <span className="text-white font-black text-base leading-none">C</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-tight text-base leading-tight" style={{ color: '#1c1917' }}>Cornerstone</span>
              <span className="text-[10px] font-medium flex items-center gap-1.5 mt-0.5" style={{ color: '#a8a29e' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
                SchoolSync
              </span>
            </div>
          </motion.div>

          {isMobile && !isCollapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#78716c', background: 'rgba(0,0,0,0.04)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col gap-0.5 relative z-10 px-3">
          {navGroups.map((group, gIdx) => (
            <div key={group.section} className={gIdx > 0 ? 'mt-2' : ''}>
              {/* Section label */}
              <button
                onClick={() => toggleSection(group.section)}
                className="w-full flex items-center justify-between px-3 py-2 mb-0.5 rounded-lg transition-all hover:bg-orange-50/50"
                style={{ cursor: 'default' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#d6d3d1', letterSpacing: '0.1em' }}>
                  {group.section}
                </span>
                <motion.div
                  animate={{ rotate: collapsedSections[group.section] ? -90 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ChevronDown size={11} style={{ color: '#d6d3d1' }} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {!collapsedSections[group.section] && group.items.map((item) => {
                  const isActive = location.pathname === item.route || location.pathname.startsWith(item.route + '/');
                  return (
                    <motion.button
                      key={item.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => { playBlip(); navigate(item.route); }}
                      onMouseEnter={playClick}
                      className="relative flex items-center gap-3.5 py-2.5 rounded-xl transition-all duration-150 w-full overflow-hidden px-3"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: isActive ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
                        color: isActive ? '#ea580c' : '#78716c',
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebarIndicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full"
                          style={{
                            background: 'linear-gradient(180deg, #ea580c, #f97316)',
                            boxShadow: '0 0 12px rgba(234, 88, 12, 0.4)',
                          }}
                          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        />
                      )}

                      <item.icon
                        size={17}
                        className="shrink-0 transition-colors"
                        style={{ color: isActive ? '#ea580c' : '#a8a29e' }}
                      />

                      <motion.span
                        className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                        style={{
                          color: isActive ? '#ea580c' : '#57534e',
                          fontWeight: isActive ? '700' : '500',
                        }}
                      >
                        {item.title}
                      </motion.span>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: '#ea580c', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="border-t p-3 space-y-0.5 flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(250,250,248,0.6)' }}
        >
          {/* User card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-2.5 p-2.5 rounded-xl flex items-center gap-3"
            style={{
              background: 'rgba(234, 88, 12, 0.04)',
              border: '1px solid rgba(234, 88, 12, 0.12)',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 shadow-sm"
              style={{ background: roleColor.bg, color: roleColor.text }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate" style={{ color: '#1c1917' }}>{user?.name}</span>
              <span className="text-[10px] font-semibold capitalize" style={{ color: '#a8a29e' }}>{role}</span>
            </div>
          </motion.div>

          <button
            onClick={() => { playBlip(); navigate(`/${role}/settings`); }}
            onMouseEnter={playClick}
            className="flex items-center gap-3 w-full py-2 rounded-xl transition-all px-3"
            style={{ color: '#78716c' }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
          >
            <Settings size={16} />
            <span className="text-sm font-medium">Settings</span>
          </button>

          <button
            onClick={() => { playBlip(); onLogout(); }}
            onMouseEnter={playClick}
            className="flex items-center gap-3 w-full py-2 rounded-xl transition-all px-3"
            style={{ color: '#dc2626' }}
            whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.06)' }}
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
