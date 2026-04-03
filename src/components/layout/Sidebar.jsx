import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, BookOpen, FileText, GraduationCap, BarChart3,
  Users, Bell, Settings, LogOut, Moon, Sun, BookMarked, ClipboardList,
  Award, UserCircle, FileUp, CheckSquare, MessageSquare, CreditCard
} from 'lucide-react';

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
  { icon: Calendar, label: 'Timetable', path: '/student/timetable' },
  { icon: FileText, label: 'Assignments', path: '/student/assignments' },
  { icon: CheckSquare, label: 'Attendance', path: '/student/attendance' },
  { icon: Award, label: 'Grades', path: '/student/grades' },
  { icon: BookMarked, label: 'Notes', path: '/student/notes' },
  { icon: CreditCard, label: 'Fees', path: '/student/fees' },     // ← New
  { icon: UserCircle, label: 'Profile', path: '/student/profile' },
];

const teacherNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
  { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
  { icon: CheckSquare, label: 'Attendance', path: '/teacher/attendance' },
  { icon: FileUp, label: 'Upload Notes', path: '/teacher/notes' },
  { icon: GraduationCap, label: 'Grade Submissions', path: '/teacher/grading' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Manage Users', path: '/admin/users' },
  { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
  { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
];

export const Sidebar = ({ role, isCollapsed, toggleCollapse, theme, toggleTheme, onLogout }) => {
  const navItems = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : adminNav;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full glass border-r border-gray-200/50 dark:border-gray-700/50 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
        >
          S
        </motion.div>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <h1 className="text-xl font-bold gradient-text">SchoolSync</h1>
            <p className="text-xs text-gray-400">Management Portal</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <NavLink
              to={item.path}
              end={item.path.endsWith('dashboard')}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={toggleTheme}
          className={`nav-item w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
          title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={toggleCollapse}
          className={`nav-item w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">{isCollapsed ? 'Expand' : 'Collapse'}</span>}
        </button>

        <button
          onClick={onLogout}
          className="nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};