import { type UserRole } from './store'
import {
  Home, Zap, CalendarDays, ClipboardList, BarChart3, Calendar, UserCheck, UserPlus,
  FileText, FileSpreadsheet, CreditCard, Sparkles, Brain, Target, StickyNote,
  Share2, Library, PenTool, MessageSquare, Globe, Megaphone, Bus,
  Award, Star, User, FileCheck, BookOpen, TrendingUp, PieChart, Bell,
  Radio, Users, Clock, Building2,
  RadioTower, BookCopy, HeartPulse, Scale, Trophy, FolderOpen,
  GraduationCap, Truck, UtensilsCrossed,   Dumbbell, Handshake, Cog, Monitor,
  Search, AlertTriangle, Headphones,
  MapPin, Shield, Settings, Eye, BookMarked, HelpCircle,
  ThumbsUp, Printer, Gauge, Navigation, CircleUser, Route, ChevronDown,
  GraduationCap as Cap, Gavel, type LucideIcon
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
        { icon: Sparkles, label: 'AI Lab', path: '/student/ai' },
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
      label: 'Student Services',
      items: [
        { icon: MessageSquare, label: 'Counselling', path: '/student/counselling' },
        { icon: HeartPulse, label: 'Health Services', path: '/student/health' },
        { icon: Search, label: 'Lost & Found', path: '/student/lost-found' },
        { icon: Headphones, label: 'IT Helpdesk', path: '/student/it-helpdesk' },
        { icon: AlertTriangle, label: 'Anonymous Report', path: '/student/anonymous-report' },
      ]
    },
    {
      label: 'Opportunities',
      items: [
        { icon: Gavel, label: 'Talent Market', path: '/student/talent-market' },
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
        { icon: Users, label: 'My Section', path: '/teacher/my-section' },
        { icon: User, label: 'My Schedule', path: '/teacher/my-schedule' },
        { icon: Calendar, label: 'Timetable', path: '/teacher/timetable' },
        { icon: Gavel, label: 'Talent Market', path: '/teacher/talent-market' },
        { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },
        { icon: BookOpen, label: 'Homework', path: '/teacher/homework' },
        { icon: ClipboardList, label: 'Assignments', path: '/teacher/assignments' },
        { icon: UserCheck, label: 'Attendance', path: '/teacher/attendance' },
        { icon: FileCheck, label: 'Grading', path: '/teacher/grading' },
        { icon: StickyNote, label: 'Class Notes', path: '/teacher/notes' },
        { icon: FileText, label: 'Exams', path: '/teacher/exams' },
        { icon: BookOpen, label: 'Exam Syllabus', path: '/teacher/exam-syllabus' },
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
    
    {
      label: 'Library',
      items: [
        { icon: BookMarked, label: 'Reserve Books', path: '/teacher/reserve-books' },
        { icon: BookOpen, label: 'Borrowed Books', path: '/teacher/borrowed-books' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Lab', path: '/teacher/ai' },
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
        { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
        { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
      ]
    },
    {
      label: 'Academic',
      items: [
        { icon: FileText, label: 'Exams', path: '/admin/exams' },
        { icon: BookOpen, label: 'SIS', path: '/admin/sis' },
        { icon: ClipboardList, label: 'Classroom', path: '/admin/classroom' },
      ]
    },
    {
      label: 'Library',
      items: [
        { icon: BookCopy, label: 'Library Management', path: '/admin/library' },
      ]
    },
    {
      label: 'Transport',
      items: [
        { icon: Bus, label: 'Transport / Buses', path: '/admin/bus-assignment' },
      ]
    },
    {
      label: 'Facilities',
      items: [
        { icon: Building2, label: 'Facilities', path: '/admin/facilities' },
        { icon: Truck, label: 'Transport', path: '/admin/transport' },
        { icon: Dumbbell, label: 'Athletics', path: '/admin/athletics' },
        { icon: Handshake, label: 'Alumni', path: '/admin/alumni' },
      ]
    },
    {
      label: 'Student Services',
      items: [
        { icon: Search, label: 'Lost & Found', path: '/admin/lost-found' },
        { icon: AlertTriangle, label: 'Anonymous Report', path: '/admin/anonymous-report' },
        { icon: HeartPulse, label: 'Health Services', path: '/admin/health' },
        { icon: Headphones, label: 'IT Helpdesk', path: '/admin/it-helpdesk' },
        { icon: Users, label: 'Manage Clubs', path: '/admin/clubs' },
        { icon: Gavel, label: 'Talent Market', path: '/admin/talent-market' },
        { icon: Award, label: 'Manage Achievements', path: '/admin/achievements' },
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
        { icon: Users, label: 'All Children', path: '/parent/my-children' },
        { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
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
      label: 'Library',
      items: [
        { icon: BookMarked, label: 'Reserve Books', path: '/librarian/reserve-books' },
        { icon: BookOpen, label: 'Books Issued', path: '/librarian/books-issued' },
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
      label: 'Tools',
      items: [
        { icon: Sparkles, label: 'AI Reports', path: '/coordinator/ai' },
      ]
    },
  ],
  manager: [],
}

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
