import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Clock, CheckCircle, Banknote, 
  ChevronLeft, ChevronRight, X, Sparkles, Bot,
  LogOut, Settings, MessageCircle, FileText, ChevronDown,
  ClipboardList, UserCheck, PencilLine, Globe, Bus
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
      ]
    },
    {
      section: 'Management',
      items: [
        { title: 'Users', icon: UserCheck, route: '/admin/users' },
        { title: 'Analytics', icon: CheckCircle, route: '/admin/analytics' },
        { title: 'Timetable', icon: Clock, route: '/admin/timetable' },
        { title: 'Exams', icon: ClipboardList, route: '/admin/exams' },
        { title: 'Fees', icon: Banknote, route: '/admin/fees' },
        { title: 'Payroll', icon: Banknote, route: '/admin/payroll' },
      ]
    },
    {
      section: 'Transportation',
      items: [
        { title: 'Bus Assignment', icon: Bus, route: '/admin/bus-assignment' },
      ]
    },
    {
      section: 'Communication',
      items: [
        { title: 'Announcements', icon: FileText, route: '/admin/announcements' },
        { title: 'Messages', icon: MessageCircle, route: '/admin/comms' },
      ]
    },
    {
      section: 'Settings',
      items: [
        { title: 'Configuration', icon: Settings, route: '/admin/settings' },
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
        { title: 'Study Planner', icon: Sparkles, route: '/student/planner' },
      ]
    },
    {
      section: 'Services',
      items: [
        { title: 'Fees', icon: Banknote, route: '/student/fees' },
        { title: 'Bus Tracking', icon: Bus, route: '/student/bus-tracking' },
        { title: 'Exams', icon: ClipboardList, route: '/student/exams' },
      ]
    },
    {
      section: 'Community',
      items: [
        { title: 'Nexus Hub', icon: Globe, route: '/student/nexus' },
        { title: 'Messages', icon: MessageCircle, route: '/student/comms' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'AI Assistant', icon: Sparkles, route: '/student/ai-lab' },
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
      section: 'Services',
      items: [
        { title: 'Bus Tracking', icon: Bus, route: '/parent/bus-tracking' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { title: 'Messages', icon: MessageCircle, route: '/parent/comms' },
        { title: 'Settings', icon: Settings, route: '/parent/settings' },
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
      section: 'Academic',
      items: [
        { title: 'Manage Assignments', icon: FileText, route: '/teacher/assignments' },
        { title: 'Grade Submissions', icon: CheckCircle, route: '/teacher/submissions' },
        { title: 'Enter Grades', icon: PencilLine, route: '/teacher/grades' },
        { title: 'Mark Attendance', icon: UserCheck, route: '/teacher/attendance' },
        { title: 'Manage Exams', icon: ClipboardList, route: '/teacher/exams' },
        { title: 'Resources', icon: BookOpen, route: '/teacher/notes' },
      ]
    },
    {
      section: 'Profile',
      items: [
        { title: 'My Profile', icon: Settings, route: '/teacher/profile' },
      ]
    }
  ],
};

const ROLE_COLOR = {
  admin: { bg: '#3b82f6', text: 'white', label: 'Admin' },
  parent: { bg: '#6366f1', text: 'white', label: 'Parent' },
  student: { bg: '#ff6b9d', text: 'white', label: 'Student' },
  teacher: { bg: '#a855f7', text: 'white', label: 'Teacher' },
};

export const AcademicSidebar = ({ isMobile, isCollapsed, setCollapsed, onLogout }) => {
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
      {isMobile && !isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40" 
          style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => { playBlip(); setCollapsed(true); }} 
        />
      )}
      
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '72px' : '256px', x: isMobile && isCollapsed ? '-100%' : '0%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col overflow-hidden border-r"
        style={{ background: '#ffffff', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="h-[64px] flex items-center justify-between px-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-default)' }}>
          <AnimatePresence mode="popLayout">
            {!isCollapsed ? (
              <motion.div key="expanded" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#ff6b9d' }}>
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight text-sm">Academic</span>
                  <span className="text-[10px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                    Learning System
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="collapsed" className="w-full flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#ff6b9d' }} onClick={() => setCollapsed(false)}>
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-3 flex flex-col gap-0.5 px-2">
          {navGroups.map((group, gIdx) => (
            <div key={group.section} className={gIdx > 0 ? 'mt-1' : ''}>
              {!isCollapsed && (
                <button onClick={() => toggleSection(group.section)} className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg hover:bg-black/03">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">{group.section}</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 text-[var(--text-dim)] ${collapsedSections[group.section] ? '-rotate-90' : ''}`} />
                </button>
              )}
              <AnimatePresence initial={false}>
                {!collapsedSections[group.section] && group.items.map((item) => {
                  const isActive = location.pathname === item.route;
                  return (
                    <motion.button
                      key={item.title}
                      onClick={() => { playBlip(); navigate(item.route); }}
                      className={`relative flex items-center gap-3 py-2 rounded-xl w-full ${isCollapsed ? 'justify-center px-1' : 'px-3'}`}
                      style={{ background: isActive ? 'rgba(0,0,0,0.07)' : 'transparent', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    >
                      {isActive && <motion.div layoutId="aIndicator" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#ff6b9d]" />}
                      <item.icon size={17} className="shrink-0" />
                      {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="border-t p-2 space-y-0.5" style={{ borderColor: 'var(--border-default)' }}>
          <button onClick={() => { playBlip(); onLogout(); }} className={`flex items-center gap-2.5 w-full py-2 rounded-xl hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'px-3'}`} style={{ color: 'var(--text-muted)' }}>
            <LogOut size={17} />
            {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};
