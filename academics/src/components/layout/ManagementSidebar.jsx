import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Clock, Calendar, Banknote,
  ChevronLeft, ChevronRight, X, Bot,
  LogOut, Settings, MessageCircle, BarChart3, ChevronDown,
  ClipboardList, Megaphone, Bus, Search, AlertTriangle, HeartPulse,
  FileText, GraduationCap, School, Bell, Activity, Shield, Plus
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
    {
      section: 'Tools & Features',
      items: [
        { title: 'Lost & Found', icon: Search, route: '/manager/lost-and-found' },
        { title: 'Anonymous Report', icon: AlertTriangle, route: '/manager/anonymous-report' },
        { title: 'School Clinic', icon: HeartPulse, route: '/manager/clinic' },
        { title: 'E-Portfolio', icon: FileText, route: '/manager/portfolios' },
        { title: 'IT Helpdesk', icon: Settings, route: '/manager/helpdesk' },
        { title: 'Skip the Bus', icon: Bus, route: '/manager/skip-bus' },
        { title: 'Fee Installments', icon: Banknote, route: '/manager/fees' },
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
        { title: 'Attendance', icon: Users, route: '/parent/attendance' },
        { title: 'Grades', icon: ClipboardList, route: '/parent/grades' },
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
};

const ROLE_COLOR = {
  admin: { bg: '#111111', text: 'white', label: 'Admin' },
  parent: { bg: '#6366f1', text: 'white', label: 'Parent' },
};

export const ManagementSidebar = ({ isMobile, isCollapsed, setCollapsed, onLogout }) => {
  const { data: user } = useStore(KEYS.CURRENT_USER, null);
  const location = useLocation();
  const navigate = useNavigate();
  const { playClick, playBlip } = useSound();
  const [collapsedSections, setCollapsedSections] = useState({});

  const role = user?.role || 'admin';
  const navGroups = ROLE_NAV[role] || [];
  const roleColor = ROLE_COLOR[role] || ROLE_COLOR.admin;
  
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
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#111111' }}>
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold tracking-tight text-sm">Management</span>
                  <span className="text-[10px] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Portal Ready
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="collapsed" className="w-full flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: '#111111' }} onClick={() => setCollapsed(false)}>
                  <span className="text-white font-bold text-sm">M</span>
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
                      {isActive && <motion.div layoutId="mIndicator" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#111111]" />}
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
