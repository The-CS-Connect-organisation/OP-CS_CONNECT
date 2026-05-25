import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useSidebarStore, type UserRole } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  LayoutDashboard, BookOpen, ClipboardList, Calendar, MessageSquare,
  CreditCard, Trophy, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  Users, BarChart3, School, DollarSign, Shield, MapPin, Bus,
  FileText, UserCheck, Building2, Globe, Fuel,
  Sparkles, Bot, X, GraduationCap, StickyNote, Share2, Megaphone,
  Brain, Target, Award, Star, User, PenTool, FileCheck,
  TrendingUp, Radio, Wrench, Search, Heart, Clock, Zap,
  BookMarked, Library, Headphones, AlertTriangle, SkipForward,
  Wallet, Receipt, BadgeCheck, BarChart2, PieChart, Activity,
  Eye, Mail, Phone, Send, RadioTower, Siren, Package, Coffee,
  Stethoscope, HelpCircle, ThumbsUp, FolderOpen, Printer,
  FileSpreadsheet, Landmark, Banknote, UserPlus, CalendarDays,
  ListChecks, Gauge, Waypoints, Navigation, CircleUser, BookCopy,
  ScanLine, Route, ChevronDown, Home, GraduationCap as Cap, Briefcase
} from 'lucide-react'

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
}

interface NavSection {
  label: string
  items: NavItem[]
}

const navSections: Record<UserRole, NavSection[]> = {
  student: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/student' },
        { icon: Zap, label: 'Daily Briefing', path: '/student/daily-briefing' },
        { icon: CalendarDays, label: 'Calendar', path: '/student/cs-calendar' },
      ]
    },
    {
      label: 'Academics',
      items: [
        { icon: ClipboardList, label: 'Assignments', path: '/student/assignments' },
        { icon: BarChart3, label: 'Grades', path: '/student/grades' },
        { icon: Calendar, label: 'Timetable', path: '/student/timetable' },
        { icon: UserCheck, label: 'Attendance', path: '/student/attendance' },
        { icon: FileText, label: 'Exams', path: '/student/exams' },
        { icon: CreditCard, label: 'Fees', path: '/student/fees' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Assistant', path: '/student/ai' },
        { icon: Brain, label: 'Study Planner', path: '/student/study-planner' },
        { icon: Target, label: 'Focus Mode', path: '/student/focus-mode' },
        { icon: StickyNote, label: 'Notes', path: '/student/notes' },
        { icon: Share2, label: 'Shared Notes', path: '/student/shared-notes' },
        { icon: Library, label: 'CS Library', path: '/cs-library' },
      ]
    },
    {
      label: 'Community',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
        { icon: Globe, label: 'Social Club', path: '/student/social-club' },
        { icon: Megaphone, label: 'Announcements', path: '/student/announcements' },
        { icon: Bus, label: 'Bus Tracking', path: '/student/bus-tracking' },
      ]
    },
    {
      label: 'Profile',
      items: [
        { icon: Award, label: 'Achievements', path: '/student/achievements' },
        { icon: Star, label: 'Accolades', path: '/student/accolades' },
        { icon: User, label: 'Profile', path: '/student/profile' },
      ]
    },
  ],
  teacher: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/teacher' },
      ]
    },
    {
      label: 'Teaching',
      items: [
        { icon: ClipboardList, label: 'Assignments', path: '/teacher/assignments' },
        { icon: UserCheck, label: 'Attendance', path: '/teacher/attendance' },
        { icon: FileCheck, label: 'Grading', path: '/teacher/grading' },
        { icon: StickyNote, label: 'Class Notes', path: '/teacher/notes' },
        { icon: FileText, label: 'Exams', path: '/teacher/exams' },
        { icon: Cap, label: 'Report Cards', path: '/teacher/report-cards' },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Class Analytics', path: '/teacher/class-analytics' },
        { icon: TrendingUp, label: 'Student Progress', path: '/teacher/student-progress' },
        { icon: PieChart, label: 'Performance', path: '/teacher/performance-reports' },
      ]
    },
    {
      label: 'Communication',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },
        { icon: Bell, label: 'Notifications', path: '/teacher/notifications' },
        { icon: Radio, label: 'Comms Hub', path: '/teacher/comms-hub' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Lab', path: '/teacher/ai' },
        { icon: Library, label: 'CS Library', path: '/cs-library' },
      ]
    },
  ],
  admin: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
      ]
    },
    {
      label: 'Management',
      items: [
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Landmark, label: 'Accounts', path: '/admin/accounts' },
        { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
        { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
        { icon: Wallet, label: 'Payroll & HR', path: '/admin/payroll' },
      ]
    },
    {
      label: 'Academic',
      items: [
        { icon: FileText, label: 'Exams', path: '/admin/exams' },
        { icon: CreditCard, label: 'Fees & Billing', path: '/admin/fees' },
      ]
    },
    {
      label: 'Communications',
      items: [
        { icon: Sparkles, label: 'AI Lab', path: '/admin/ai' },
        { icon: Radio, label: 'Comms Hub', path: '/admin/comms-hub' },
        { icon: FileText, label: 'Circulars', path: '/admin/circulars' },
        { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
        { icon: Library, label: 'CS Library', path: '/cs-library' },
      ]
    },
    {
      label: 'Transport',
      items: [
        { icon: Bus, label: 'Bus Assignment', path: '/admin/bus-assignment' },
      ]
    },
    {
      label: 'Services',
      items: [
        { icon: Search, label: 'Lost & Found', path: '/admin/lost-found' },
        { icon: AlertTriangle, label: 'Anonymous Report', path: '/admin/anonymous-report' },
        { icon: Stethoscope, label: 'School Clinic', path: '/admin/clinic' },
        { icon: FolderOpen, label: 'E-Portfolio', path: '/admin/e-portfolio' },
        { icon: Headphones, label: 'IT Helpdesk', path: '/admin/it-helpdesk' },
        { icon: SkipForward, label: 'Skip the Bus', path: '/admin/skip-bus' },
        { icon: Receipt, label: 'Fee Installments', path: '/admin/fee-installments' },
      ]
    },
  ],
  parent: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/parent' },
      ]
    },
    {
      label: 'My Children',
      items: [
        { icon: UserCheck, label: 'Attendance', path: '/parent/attendance' },
        { icon: BarChart3, label: 'Grades', path: '/parent/grades' },
        { icon: Calendar, label: 'Timetable', path: '/parent/timetable' },
        { icon: CreditCard, label: 'Fees', path: '/parent/fees' },
      ]
    },
    {
      label: 'Services',
      items: [
        { icon: Bus, label: 'Bus Tracking', path: '/parent/bus-tracking' },
        { icon: Bell, label: 'Notifications', path: '/parent/notifications' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
        { icon: User, label: 'Profile', path: '/parent/profile' },
      ]
    },
  ],
  driver: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/driver' },
        { icon: MapPin, label: 'Route', path: '/driver/profile' },
        { icon: User, label: 'Profile', path: '/driver/profile' },
      ]
    },
  ],
  librarian: [
    {
      label: 'Main',
      items: [
        { icon: Library, label: 'Library', path: '/librarian' },
        { icon: BookOpen, label: 'Books', path: '/librarian' },
        { icon: User, label: 'Profile', path: '/librarian/profile' },
      ]
    },
  ],
  coordinator: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/coordinator' },
      ]
    },
    {
      label: 'Management',
      items: [
        { icon: Building2, label: 'Schools', path: '/coordinator/schools' },
        { icon: Users, label: 'Staff', path: '/coordinator/staff' },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Analytics', path: '/coordinator/analytics' },
      ]
    },
    {
      label: 'Communication',
      items: [
        { icon: Radio, label: 'Broadcast', path: '/coordinator/broadcast' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Reports', path: '/coordinator/ai' },
      ]
    },
  ],
  manager: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/manager' },
      ]
    },
    {
      label: 'People',
      items: [
        { icon: Users, label: 'User Management', path: '/manager/users' },
        { icon: Cap, label: 'Academics', path: '/manager/academics' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { icon: Wallet, label: 'Finance', path: '/manager/finance' },
        { icon: Bus, label: 'Transport', path: '/manager/transport' },
        { icon: Calendar, label: 'Events', path: '/manager/events' },
        { icon: FileText, label: 'Exams', path: '/manager/exams' },
        { icon: Clock, label: 'Timetable', path: '/manager/timetable' },
      ]
    },
    {
      label: 'Teaching',
      items: [
        { icon: UserCheck, label: 'Attendance', path: '/manager/attendance' },
        { icon: FileCheck, label: 'Grading', path: '/manager/grading' },
        { icon: StickyNote, label: 'Notes', path: '/manager/notes' },
        { icon: Cap, label: 'Reports', path: '/manager/reports' },
      ]
    },
    {
      label: 'Communications',
      items: [
        { icon: FileText, label: 'Circulars', path: '/manager/circulars' },
        { icon: Megaphone, label: 'Announcements', path: '/manager/announcements' },
        { icon: MessageSquare, label: 'Messages', path: '/manager/messages' },
        { icon: Radio, label: 'Comms Hub', path: '/manager/comms-hub' },
        { icon: Bell, label: 'Notifications', path: '/manager/notifications' },
      ]
    },
    {
      label: 'Analytics & Tools',
      items: [
        { icon: BarChart3, label: 'Analytics', path: '/manager/analytics' },
        { icon: Sparkles, label: 'AI Lab', path: '/manager/ai' },
        { icon: CreditCard, label: 'Fees', path: '/manager/fees' },
        { icon: Wallet, label: 'Payroll', path: '/manager/payroll' },
        { icon: Library, label: 'CS Library', path: '/cs-library' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { icon: Shield, label: 'Security', path: '/manager/security' },
        { icon: Settings, label: 'Settings', path: '/manager/settings' },
        { icon: Eye, label: 'Audit Log', path: '/manager/audit-log' },
        { icon: Bus, label: 'Bus Assignment', path: '/manager/bus-assignment' },
      ]
    },
  ],
}

const roleGradients: Record<UserRole, string> = {
  student: 'from-orange-500 to-amber-500',
  teacher: 'from-orange-600 to-amber-500',
  admin: 'from-orange-500 to-red-500',
  coordinator: 'from-amber-500 to-orange-600',
  manager: 'from-orange-600 to-amber-600',
  driver: 'from-orange-600 to-amber-500',
  parent: 'from-orange-500 to-amber-600',
  librarian: 'from-orange-500 to-amber-500',
}

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  coordinator: 'Coordinator',
  manager: 'Manager',
  driver: 'Driver',
  parent: 'Parent',
  librarian: 'Librarian',
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  if (!user) return null

  const sections = navSections[user.role] || []
  const gradient = roleGradients[user.role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header - Clean, with user avatar */}
      <div className={cn("flex items-center gap-3 px-3 py-3 border-b border-border/50", isCollapsed && "justify-center px-2")}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex items-center gap-2.5 w-full">
              <Avatar className="w-9 h-9 ring-2 ring-orange-500/20">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className={cn("text-xs font-bold bg-gradient-to-br text-white", gradient)}>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm leading-tight truncate">{user.name}</h1>
                <p className="text-[10px] text-muted-foreground">{roleLabels[user.role]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {isCollapsed && (
          <Avatar className="w-8 h-8 ring-2 ring-orange-500/20">
            <AvatarImage src={user.avatar || ''} />
            <AvatarFallback className={cn("text-xs font-bold bg-gradient-to-br text-white", gradient)}>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {sections.map((section) => {
          const isSectionCollapsed = collapsedSections.has(section.label)
          return (
            <div key={section.label} className="mb-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-2 py-1.5 mb-0.5 rounded-md hover:bg-accent/30 transition-colors"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{section.label}</span>
                  <ChevronDown className={cn("w-3 h-3 text-muted-foreground/30 transition-transform duration-200", isSectionCollapsed && "-rotate-90")} />
                </button>
              )}

              <AnimatePresence initial={false}>
                {!isSectionCollapsed && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden space-y-0.5">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user.role}`}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 group relative",
                          isCollapsed && "justify-center px-2",
                          isActive
                            ? "bg-gradient-to-r from-orange-500/10 to-amber-500/5 text-orange-600 dark:text-orange-400"
                            : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r-full" />}
                            <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-orange-500" : "text-muted-foreground group-hover:text-foreground")} />
                            <AnimatePresence>
                              {!isCollapsed && (
                                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="whitespace-nowrap overflow-hidden text-[13px]">
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 p-2 space-y-1">
        <button onClick={handleLogout} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full", isCollapsed && "justify-center px-2")}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
        {!isCollapsed && (
          <button onClick={toggle} className="flex items-center justify-center w-full rounded-lg py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 z-50 h-full w-[280px] bg-background border-r border-border/50 lg:hidden">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4" /></button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: isCollapsed ? 64 : 240 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="hidden lg:block h-screen sticky top-0 border-r border-border/50 bg-background overflow-hidden flex-shrink-0">
        {sidebarContent}
      </motion.aside>
    </>
  )
}
