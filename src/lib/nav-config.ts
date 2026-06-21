import { type UserRole } from './store'
import {
  Home, Zap, CalendarDays, ClipboardList, BarChart3, Calendar, UserCheck, UserPlus,
  FileText, FileSpreadsheet, CreditCard, Sparkles, Brain, Target, StickyNote,
  Share2, Library, PenTool, MessageSquare, Globe, Megaphone, Bus,
  Award, Star, User, FileCheck, BookOpen, TrendingUp, PieChart, Bell,
  Radio, Users, Landmark, Wallet, Clock, Receipt, DollarSign, Building2,
  RadioTower, BookCopy, HeartPulse, Scale, Trophy, FolderOpen,
  GraduationCap, Truck, UtensilsCrossed,   Dumbbell, Handshake, Cog, Monitor,
  Search, AlertTriangle, Stethoscope, Headphones, SkipForward,
  MapPin, Shield, Settings, Eye, Briefcase, BookMarked, HelpCircle,
  ThumbsUp, Printer, Gauge, Navigation, CircleUser, Route, ChevronDown,
  GraduationCap as Cap, type LucideIcon
} from 'lucide-react'

export interface NavItem {
  icon: LucideIcon
  label: string
  path: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export const navSections: Record<UserRole, NavSection[]> = {
  student: [
    {
      label: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/student' },
        { icon: CalendarDays, label: 'Calendar', path: '/student/cs-calendar' },
      ]
    },
    {
      label: 'Academics',
      items: [
        { icon: BookOpen, label: 'Homework', path: '/student/homework' },
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
        { icon: Sparkles, label: 'AI Tools', path: '/student/ai' },
        { icon: StickyNote, label: 'Notes', path: '/student/notes' },
        { icon: Library, label: 'CS Library', path: '/cs-library' },
        { icon: PenTool, label: 'Exercises', path: '/student/exercises' },
      ]
    },
    {
      label: 'Community',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
        { icon: Globe, label: 'Community', path: '/student/community' },
        { icon: Megaphone, label: 'Announcements', path: '/student/announcements' },
        { icon: Bus, label: 'Bus Tracking', path: '/student/bus-tracking' },
      ]
    },
    {
      label: 'Services',
      items: [
        { icon: MessageSquare, label: 'Counselling', path: '/student/counselling' },
        { icon: HeartPulse, label: 'Health', path: '/student/health' },
        { icon: Search, label: 'Lost & Found', path: '/student/lost-found' },
        { icon: Headphones, label: 'IT Helpdesk', path: '/student/it-helpdesk' },
        { icon: Stethoscope, label: 'Clinic', path: '/student/clinic' },
        { icon: SkipForward, label: 'Skip Bus', path: '/student/skip-bus' },
        { icon: AlertTriangle, label: 'Anonymous Report', path: '/student/anonymous-report' },
      ]
    },
    {
      label: 'Profile',
      items: [
        { icon: Award, label: 'Achievements', path: '/student/achievements' },
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
        { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },
        { icon: BookOpen, label: 'Homework', path: '/teacher/homework' },
        { icon: ClipboardList, label: 'Assignments', path: '/teacher/assignments' },
        { icon: UserCheck, label: 'Attendance', path: '/teacher/attendance' },
        { icon: FileCheck, label: 'Grading', path: '/teacher/grading' },
        { icon: StickyNote, label: 'Class Notes', path: '/teacher/notes' },
        { icon: FileText, label: 'Exams', path: '/teacher/exams' },
        { icon: Cap, label: 'Report Cards', path: '/teacher/report-cards' },
        { icon: BookOpen, label: 'Classroom', path: '/teacher/classroom' },
        { icon: BarChart3, label: 'Exam Results', path: '/teacher/exam-results' },
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
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: UserPlus, label: 'Create Account', path: '/admin/create-account' },
        { icon: Landmark, label: 'Accounts', path: '/admin/accounts' },
        { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
        { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
        { icon: Wallet, label: 'Payroll & HR', path: '/admin/payroll' },
      ]
    },
    {
      label: 'Academic',
      items: [
        { icon: BookOpen, label: 'Homework', path: '/admin/homework' },
        { icon: FileText, label: 'Exams', path: '/admin/exams' },
        { icon: CreditCard, label: 'Fees & Billing', path: '/admin/fees' },
        { icon: BookOpen, label: 'SIS', path: '/admin/sis' },
        { icon: ClipboardList, label: 'Classroom', path: '/admin/classroom' },
      ]
    },
    {
      label: 'Finance',
      items: [
        { icon: Receipt, label: 'Invoicing', path: '/admin/invoicing' },
        { icon: DollarSign, label: 'Finance Suite', path: '/admin/finance-full' },
      ]
    },
    {
      label: 'HR & Staff',
      items: [
        { icon: Users, label: 'Human Resources', path: '/admin/hr' },
      ]
    },
    {
      label: 'Library',
      items: [
        { icon: BookCopy, label: 'Library Management', path: '/admin/library' },
      ]
    },
    {
      label: 'ERP & CRM',
      items: [
        { icon: Building2, label: 'ERP System', path: '/admin/erp' },
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
        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
        { icon: BookOpen, label: 'Homework', path: '/parent/homework' },
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
        { icon: MessageSquare, label: 'Counselling', path: '/parent/counselling' },
        { icon: HeartPulse, label: 'Health', path: '/parent/health' },
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
        { icon: Library, label: 'Dashboard', path: '/librarian' },
        { icon: BookCopy, label: 'Management', path: '/librarian/management' },
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
        { icon: Briefcase, label: 'HR', path: '/manager/hr' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/manager/messages' },
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
      label: 'Scheduling & SIS',
      items: [
        { icon: BookOpen, label: 'SIS', path: '/manager/sis' },
      ]
    },
    {
      label: 'Finance & Invoicing',
      items: [
        { icon: Receipt, label: 'Invoicing', path: '/manager/invoicing' },
        { icon: Building2, label: 'ERP', path: '/manager/erp' },
      ]
    },
    {
      label: 'Library',
      items: [
        { icon: BookCopy, label: 'Library Management', path: '/manager/library' },
      ]
    },
  ]
};

export const roleGradients: Record<UserRole, string> = {
  student: 'from-orange-500 to-amber-500',
  teacher: 'from-orange-600 to-amber-500',
  admin: 'from-orange-500 to-red-500',
  coordinator: 'from-amber-500 to-orange-600',
  manager: 'from-orange-600 to-amber-600',
  driver: 'from-orange-600 to-amber-500',
  parent: 'from-orange-500 to-amber-600',
  librarian: 'from-orange-500 to-amber-500',
}

export const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  coordinator: 'Coordinator',
  manager: 'Manager',
  driver: 'Driver',
  parent: 'Parent',
  librarian: 'Librarian',
}
