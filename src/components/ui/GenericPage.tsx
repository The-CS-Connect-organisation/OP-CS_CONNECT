import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore, useDataStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import {
  ClipboardList, BarChart3, Calendar, UserCheck, CreditCard, Bus,
  StickyNote, Share2, Megaphone, Brain, Target, Award, Star,
  MessageSquare, Globe, FileText, Users, TrendingUp, PieChart as PieChartIcon,
  Bell, Radio, Sparkles, Search, AlertTriangle, Stethoscope,
  FolderOpen, Headphones, SkipForward, Receipt, Landmark, Wallet,
  Zap, CalendarDays, BookOpen, GraduationCap, FileCheck, Clock,
  CheckCircle2, XCircle, ArrowUpRight, Activity, Library,
  Loader2, AlertCircle, Plus, Filter, Download, Upload, Eye,
  Send, ThumbsUp, MessageCircle, Bookmark, ExternalLink
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface GenericPageProps {
  title: string
  description: string
  icon: string
  category: string
  role: string
  userId?: string
}

const iconMap: Record<string, React.ElementType> = {
  Zap, ClipboardList, BarChart3, Calendar, UserCheck, CreditCard, Bus,
  StickyNote, Share2, Megaphone, Brain, Target, Award, Star,
  MessageSquare, Globe, FileText, Users, TrendingUp,
  Bell, Radio, Sparkles, Search, AlertTriangle, Stethoscope,
  FolderOpen, Headphones, SkipForward, Receipt, Landmark, Wallet,
  CalendarDays, GraduationCap, FileCheck, Library, User: UserCheck,
  LayoutDashboard: BarChart3,
  PieChart: PieChartIcon,
}

// Page-specific data generators
function getMockDataForPage(title: string, role: string, userId?: string) {
  const t = title.toLowerCase()

  if (t.includes('daily briefing')) {
    return {
      stats: [
        { label: "Today's Classes", value: "5", icon: Calendar, color: "from-orange-500 to-amber-500" },
        { label: 'Pending Tasks', value: '3', icon: ClipboardList, color: 'from-orange-500 to-amber-500' },
        { label: 'Attendance', value: '92%', icon: UserCheck, color: 'from-emerald-500 to-teal-500' },
        { label: 'Academic %', value: '92%', icon: BarChart3, color: 'from-purple-500 to-indigo-500' },
      ],
      schedule: [
        { time: '8:00 AM', subject: 'Mathematics', room: 'Room 201', status: 'upcoming' },
        { time: '9:00 AM', subject: 'Physics', room: 'Lab 3', status: 'upcoming' },
        { time: '10:00 AM', subject: 'Chemistry', room: 'Lab 1', status: 'current' },
        { time: '11:00 AM', subject: 'English', room: 'Room 105', status: 'upcoming' },
        { time: '12:00 PM', subject: 'CS', room: 'IT Lab', status: 'upcoming' },
      ],
      announcements: [
        { title: 'Annual Sports Day', date: 'Jun 15', type: 'event' },
        { title: 'Science Fair Registration', date: 'Jun 22', type: 'academic' },
        { title: 'PTM Scheduled', date: 'May 30', type: 'meeting' },
      ],
      chartData: [
        { day: 'Mon', focus: 4.2 }, { day: 'Tue', focus: 3.8 }, { day: 'Wed', focus: 4.5 },
        { day: 'Thu', focus: 3.2 }, { day: 'Fri', focus: 4.8 }, { day: 'Sat', focus: 2.1 }, { day: 'Sun', focus: 1.5 },
      ]
    }
  }

  if (t.includes('notes')) {
    return {
      notes: [
        { id: 1, title: 'Quadratic Equations - Key Formulas', subject: 'Math', date: '2026-05-18', pinned: true, shared: false },
        { id: 2, title: "Newton's Laws Summary", subject: "Physics", date: "2026-05-17", pinned: true, shared: true },
        { id: 3, title: 'Organic Chemistry Reactions', subject: 'Chemistry', date: '2026-05-16', pinned: false, shared: false },
        { id: 4, title: 'Shakespeare Analysis Notes', subject: 'English', date: '2026-05-15', pinned: false, shared: true },
        { id: 5, title: 'Data Structures - Trees & Graphs', subject: 'CS', date: '2026-05-14', pinned: false, shared: false },
        { id: 6, title: 'Cell Biology Diagrams', subject: 'Biology', date: '2026-05-13', pinned: false, shared: true },
      ],
      stats: [
        { label: 'Total Notes', value: '24', icon: StickyNote, color: 'from-yellow-500 to-amber-500' },
        { label: 'Shared', value: '8', icon: Share2, color: 'from-orange-500 to-amber-500' },
        { label: 'Pinned', value: '4', icon: Bookmark, color: 'from-red-500 to-pink-500' },
      ]
    }
  }

  if (t.includes('shared notes')) {
    return {
      notes: [
        { id: 1, title: 'Physics Lab Manual', author: 'Priya P.', subject: 'Physics', likes: 12, downloads: 34 },
        { id: 2, title: 'Math Formula Sheet', author: 'Aarav S.', subject: 'Math', likes: 28, downloads: 56 },
        { id: 3, title: 'CS Algorithms Cheat Sheet', author: 'Rohan K.', subject: 'CS', likes: 19, downloads: 42 },
        { id: 4, title: 'English Essay Templates', author: 'Ananya S.', subject: 'English', likes: 15, downloads: 31 },
      ]
    }
  }

  if (t.includes('announcement')) {
    return {
      announcements: [
        { id: 1, title: 'Annual Sports Day', date: 'Jun 15, 2026', type: 'event', body: 'Inter-house athletics competition. Register before June 10.', priority: 'high' },
        { id: 2, title: 'Science Fair Registration', date: 'Jun 22, 2026', type: 'academic', body: 'Student science project exhibition. Teams of 2-3.', priority: 'medium' },
        { id: 3, title: 'Parent-Teacher Meeting', date: 'May 30, 2026', type: 'meeting', body: 'Quarterly PTM for all classes. 10AM - 1PM.', priority: 'high' },
        { id: 4, title: 'Farewell Ceremony', date: 'May 20, 2026', type: 'ceremony', body: 'Farewell for graduating batch. Dress code: Formal.', priority: 'medium' },
        { id: 5, title: 'Library Book Return', date: 'May 25, 2026', type: 'academic', body: 'All library books must be returned before semester end.', priority: 'low' },
      ]
    }
  }

  if (t.includes('study planner')) {
    return {
      plans: [
        { subject: 'Mathematics', topics: 12, completed: 8, nextTopic: 'Calculus Basics', hoursThisWeek: 6 },
        { subject: 'Physics', topics: 10, completed: 7, nextTopic: 'Wave Optics', hoursThisWeek: 5 },
        { subject: 'Chemistry', topics: 8, completed: 5, nextTopic: 'Organic Reactions', hoursThisWeek: 4 },
        { subject: 'English', topics: 6, completed: 4, nextTopic: 'Essay Writing', hoursThisWeek: 3 },
        { subject: 'CS', topics: 9, completed: 6, nextTopic: 'Dynamic Programming', hoursThisWeek: 5 },
      ],
      weeklyData: [
        { day: 'Mon', hours: 3 }, { day: 'Tue', hours: 2.5 }, { day: 'Wed', hours: 4 },
        { day: 'Thu', hours: 2 }, { day: 'Fri', hours: 3.5 }, { day: 'Sat', hours: 1.5 }, { day: 'Sun', hours: 1 },
      ]
    }
  }

  if (t.includes('focus mode')) {
    return {
      sessions: [
        { id: 1, subject: 'Mathematics', duration: '45 min', date: 'Today', completed: true, score: 92 },
        { id: 2, subject: 'Physics', duration: '30 min', date: 'Today', completed: true, score: 85 },
        { id: 3, subject: 'Chemistry', duration: '25 min', date: 'Yesterday', completed: true, score: 78 },
      ],
      streak: 5,
      totalMinutes: 320,
      todayMinutes: 75,
    }
  }

  if (t.includes('exam')) {
    return {
      exams: [
        { id: 1, subject: 'Mathematics', date: 'Jun 10, 2026', type: 'Mid-term', syllabus: 'Ch 1-5', status: 'upcoming' },
        { id: 2, subject: 'Physics', date: 'Jun 12, 2026', type: 'Lab Test', syllabus: 'Optics & Waves', status: 'upcoming' },
        { id: 3, subject: 'English', date: 'Jun 14, 2026', type: 'Essay Test', syllabus: 'Shakespeare', status: 'upcoming' },
        { id: 4, subject: 'CS', date: 'May 20, 2026', type: 'Quiz', syllabus: 'Data Structures', status: 'completed', score: 88 },
        { id: 5, subject: 'Chemistry', date: 'May 15, 2026', type: 'Unit Test', syllabus: 'Organic Chem', status: 'completed', score: 82 },
      ]
    }
  }

  if (t.includes('bus tracking')) {
    return {
      route: { name: 'Route A - North Campus', bus: 'KA-01-1234', driver: 'Raju Kumar', status: 'On Time' },
      stops: ['Main Gate', 'North Block', 'Library', 'Sports Complex'],
      eta: '7:15 AM',
      liveLocation: { lat: 12.9716, lng: 77.5946 },
    }
  }

  if (t.includes('nexus hub')) {
    return {
      posts: [
        { id: 1, author: 'Aarav S.', avatar: 'AS', content: 'Just finished the CS project! 🎉', likes: 12, comments: 3, time: '2h ago' },
        { id: 2, author: 'Priya P.', avatar: 'PP', content: 'Study group for Physics tomorrow? 📚', likes: 8, comments: 5, time: '4h ago' },
        { id: 3, author: 'Rohan K.', avatar: 'RK', content: 'Check out this cool algorithm visualization!', likes: 15, comments: 2, time: '6h ago' },
      ]
    }
  }

  if (t.includes('achievement')) {
    return {
      achievements: [
        { id: 1, title: 'First Login', desc: 'Logged in for the first time', icon: '🎯', earned: true, date: 'Jan 2026' },
        { id: 2, title: 'Perfect Attendance', desc: '30 days without absence', icon: '⭐', earned: true, date: 'Mar 2026' },
        { id: 3, title: 'Quiz Master', desc: 'Score 100% on 5 quizzes', icon: '🧠', earned: true, date: 'Apr 2026' },
        { id: 4, title: 'Study Streak', desc: '7 day study streak', icon: '🔥', earned: true, date: 'May 2026' },
        { id: 5, title: 'Top Scorer', desc: 'Highest score in class', icon: '🏆', earned: false, date: '' },
        { id: 6, title: 'Helpful Hand', desc: 'Share 10 notes with classmates', icon: '🤝', earned: false, date: '' },
      ]
    }
  }

  if (t.includes('accolade')) {
    return {
      accolades: [
        { id: 1, title: 'Student of the Month', from: 'Principal Meera', date: 'May 2026', type: 'academic' },
        { id: 2, title: 'Science Fair Winner', from: 'Dr. Rajesh Gupta', date: 'Apr 2026', type: 'competition' },
        { id: 3, title: 'Best Coder Award', from: 'CS Department', date: 'Mar 2026', type: 'skill' },
      ]
    }
  }

  if (t.includes('cs calendar')) {
    return {
      events: [
        { date: 'May 20', events: ['Farewell Ceremony', 'CS Quiz'] },
        { date: 'May 25', events: ['Assignment Deadline'] },
        { date: 'May 30', events: ['PTM'] },
        { date: 'Jun 10', events: ['Math Mid-term'] },
        { date: 'Jun 15', events: ['Sports Day'] },
        { date: 'Jun 22', events: ['Science Fair'] },
      ]
    }
  }

  if (t.includes('profile')) {
    return {
      profile: {
        name: 'Aarav Sharma', email: 'aarav@eduvault.ai', class: '10-A',
        gpa: 92, attendance: 92, feesPaid: true, role: role,
        joinDate: 'June 2025', phone: '+91-9876543210',
        address: '123, Sector 5, New Delhi',
        emergencyContact: 'Mr. Sharma (+91-9876543211)',
      }
    }
  }

  // Teacher-specific pages
  if (t.includes('class analytics')) {
    return {
      classes: [
        { name: '10-A', students: 40, avgGrade: 85, attendance: 94 },
        { name: '10-B', students: 38, avgGrade: 78, attendance: 88 },
      ],
      chartData: [
        { subject: 'Math', '10-A': 88, '10-B': 75 },
        { subject: 'Physics', '10-A': 82, '10-B': 79 },
        { subject: 'Chemistry', '10-A': 79, '10-B': 81 },
        { subject: 'English', '10-A': 90, '10-B': 85 },
      ]
    }
  }

  if (t.includes('student progress')) {
    return {
      students: [
        { name: 'Aarav Sharma', grade: 'A', trend: 'up', attendance: 92, gpa: 92 },
        { name: 'Priya Patel', grade: 'A+', trend: 'up', attendance: 96, gpa: 96 },
        { name: 'Rohan Kumar', grade: 'B+', trend: 'stable', attendance: 85, gpa: 85 },
        { name: 'Ananya Singh', grade: 'A-', trend: 'up', attendance: 89, gpa: 89 },
      ]
    }
  }

  if (t.includes('performance report')) {
    return {
      reports: [
        { class: '10-A', subject: 'Math', avgScore: 85, highest: 98, lowest: 45, passRate: 92 },
        { class: '10-A', subject: 'Physics', avgScore: 82, highest: 95, lowest: 38, passRate: 88 },
        { class: '10-B', subject: 'Math', avgScore: 78, highest: 92, lowest: 35, passRate: 82 },
        { class: '10-B', subject: 'Chemistry', avgScore: 80, highest: 94, lowest: 40, passRate: 85 },
      ]
    }
  }

  if (t.includes('report card')) {
    return {
      students: [
        { name: 'Aarav Sharma', class: '10-A', overall: 'A', gpa: 92, status: 'ready' },
        { name: 'Priya Patel', class: '10-A', overall: 'A+', gpa: 96, status: 'ready' },
        { name: 'Rohan Kumar', class: '10-B', overall: 'B+', gpa: 85, status: 'pending' },
        { name: 'Ananya Singh', class: '10-B', overall: 'A-', gpa: 89, status: 'ready' },
      ]
    }
  }

  if (t.includes('notification')) {
    return {
      notifications: [
        { id: 1, title: 'Assignment Submitted', message: 'Aarav submitted Quadratic Equations', time: '10 min ago', read: false, type: 'info' },
        { id: 2, title: 'Grade Updated', message: 'Physics lab reports graded', time: '1 hour ago', read: false, type: 'success' },
        { id: 3, title: 'Meeting Reminder', message: 'Staff meeting at 3 PM', time: '2 hours ago', read: true, type: 'warning' },
      ]
    }
  }

  if (t.includes('comms hub') || t.includes('communication')) {
    return {
      channels: [
        { name: 'Class 10-A', members: 42, unread: 3, type: 'class' },
        { name: 'Class 10-B', members: 40, unread: 0, type: 'class' },
        { name: 'Science Department', members: 8, unread: 1, type: 'department' },
        { name: 'Staff Room', members: 25, unread: 5, type: 'general' },
      ]
    }
  }

  // Admin-specific pages
  if (t.includes('user')) {
    return {
      users: [
        { name: 'Aarav Sharma', email: 'aarav@eduvault.ai', role: 'student', status: 'active' },
        { name: 'Dr. Rajesh Gupta', email: 'rajesh@eduvault.ai', role: 'teacher', status: 'active' },
        { name: 'Principal Meera', email: 'meera@eduvault.ai', role: 'admin', status: 'active' },
        { name: 'Raju Kumar', email: 'raju@eduvault.ai', role: 'driver', status: 'active' },
      ],
      stats: [
        { label: 'Total Users', value: '156', icon: Users, color: 'from-orange-500 to-amber-500' },
        { label: 'Students', value: '120', icon: GraduationCap, color: 'from-emerald-500 to-teal-500' },
        { label: 'Teachers', value: '22', icon: BookOpen, color: 'from-purple-500 to-indigo-500' },
        { label: 'Staff', value: '14', icon: Users, color: 'from-orange-500 to-amber-500' },
      ]
    }
  }

  if (t.includes('account')) {
    return {
      accounts: [
        { id: 'ACC001', name: 'Tuition Fees', type: 'Income', balance: '₹12,50,000', status: 'active' },
        { id: 'ACC002', name: 'Transport Fees', type: 'Income', balance: '₹3,40,000', status: 'active' },
        { id: 'ACC003', name: 'Salary Payable', type: 'Expense', balance: '₹8,75,000', status: 'active' },
        { id: 'ACC004', name: 'Maintenance', type: 'Expense', balance: '₹1,20,000', status: 'active' },
      ]
    }
  }

  if (t.includes('payroll')) {
    return {
      payroll: [
        { name: 'Dr. Rajesh Gupta', role: 'Teacher', salary: '₹65,000', status: 'paid', date: 'May 01' },
        { name: 'Prof. Sunita Verma', role: 'Teacher', salary: '₹60,000', status: 'paid', date: 'May 01' },
        { name: 'Raju Kumar', role: 'Driver', salary: '₹25,000', status: 'pending', date: 'Jun 01' },
      ]
    }
  }

  if (t.includes('bus assignment')) {
    return {
      routes: [
        { id: 'r1', name: 'Route A - North', bus: 'KA-01-1234', driver: 'Raju Kumar', students: 28 },
        { id: 'r2', name: 'Route B - South', bus: 'KA-01-5678', driver: 'Raju Kumar', students: 32 },
      ]
    }
  }

  if (t.includes('lost & found') || t.includes('lost found')) {
    return {
      items: [
        { id: 1, item: 'Blue Water Bottle', location: 'Cafeteria', date: 'May 18', status: 'unclaimed' },
        { id: 2, item: 'Math Textbook', location: 'Library', date: 'May 17', status: 'claimed' },
        { id: 3, item: 'USB Drive', location: 'IT Lab', date: 'May 16', status: 'unclaimed' },
      ]
    }
  }

  if (t.includes('clinic')) {
    return {
      visits: [
        { id: 1, student: 'Aarav Sharma', reason: 'Headache', date: 'May 18', treated: true },
        { id: 2, student: 'Priya Patel', reason: 'Minor cut', date: 'May 17', treated: true },
        { id: 3, student: 'Rohan Kumar', reason: 'Fever', date: 'May 16', treated: false },
      ]
    }
  }

  if (t.includes('anonymous report')) {
    return {
      reports: [
        { id: 1, category: 'Bullying', date: 'May 18', status: 'investigating', priority: 'high' },
        { id: 2, category: 'Infrastructure', date: 'May 17', status: 'resolved', priority: 'medium' },
        { id: 3, category: 'Safety Concern', date: 'May 15', status: 'pending', priority: 'high' },
      ]
    }
  }

  if (t.includes('e-portfolio') || t.includes('portfolio')) {
    return {
      portfolios: [
        { student: 'Aarav Sharma', class: '10-A', projects: 8, lastUpdated: 'May 18' },
        { student: 'Priya Patel', class: '10-A', projects: 10, lastUpdated: 'May 17' },
        { student: 'Rohan Kumar', class: '10-B', projects: 6, lastUpdated: 'May 15' },
      ]
    }
  }

  if (t.includes('it helpdesk')) {
    return {
      tickets: [
        { id: 'IT-001', issue: 'Projector not working', room: 'Room 201', status: 'open', priority: 'high' },
        { id: 'IT-002', issue: 'WiFi slow in Lab 3', room: 'Lab 3', status: 'in-progress', priority: 'medium' },
        { id: 'IT-003', issue: 'Printer jam', room: 'Staff Room', status: 'resolved', priority: 'low' },
      ]
    }
  }

  if (t.includes('skip') && t.includes('bus')) {
    return {
      requests: [
        { student: 'Aarav Sharma', date: 'May 20', route: 'Route A', status: 'approved', parentConsent: true },
        { student: 'Priya Patel', date: 'May 21', route: 'Route A', status: 'pending', parentConsent: true },
      ]
    }
  }

  if (t.includes('fee installment')) {
    return {
      installments: [
        { student: 'Rohan Kumar', total: '₹50,000', paid: '₹40,000', pending: '₹10,000', nextDue: 'Jun 01', status: 'partial' },
        { student: 'Ananya Singh', total: '₹50,000', paid: '₹50,000', pending: '₹0', nextDue: '-', status: 'paid' },
      ]
    }
  }

  // Parent-specific
  if (t.includes('child') && t.includes('attendance')) {
    return {
      child: { name: 'Aarav Sharma', class: '10-A' },
      monthlyData: [
        { month: 'Jan', percentage: 95 }, { month: 'Feb', percentage: 92 },
        { month: 'Mar', percentage: 88 }, { month: 'Apr', percentage: 94 },
        { month: 'May', percentage: 92 },
      ]
    }
  }

  // Driver-specific
  if (t.includes('profile') && role === 'driver') {
    return {
      profile: {
        name: 'Raju Kumar', email: 'raju@eduvault.ai', license: 'DL-1234567890',
        route: 'Route A - North Campus', bus: 'KA-01-1234',
        phone: '+91-9876543212', joinDate: 'Jan 2024',
      }
    }
  }

  // Librarian-specific
  if (t.includes('library')) {
    return {
      books: [
        { id: 1, title: 'Advanced Mathematics', author: 'R.D. Sharma', available: 3, total: 5, category: 'Academic' },
        { id: 2, title: 'Concepts of Physics', author: 'H.C. Verma', available: 2, total: 4, category: 'Academic' },
        { id: 3, title: 'Organic Chemistry', author: 'Morrison & Boyd', available: 0, total: 3, category: 'Academic' },
        { id: 4, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', available: 1, total: 2, category: 'Fiction' },
        { id: 5, title: 'Introduction to Algorithms', author: 'CLRS', available: 2, total: 3, category: 'CS' },
      ],
      stats: [
        { label: 'Total Books', value: '2,450', icon: Library, color: 'from-emerald-500 to-teal-500' },
        { label: 'Issued', value: '180', icon: BookOpen, color: 'from-orange-500 to-amber-500' },
        { label: 'Overdue', value: '12', icon: AlertCircle, color: 'from-red-500 to-pink-500' },
        { label: 'New This Month', value: '25', icon: Plus, color: 'from-purple-500 to-indigo-500' },
      ]
    }
  }

  // Default fallback
  return {
    stats: [
      { label: 'Total Items', value: '24', icon: ClipboardList, color: 'from-orange-500 to-amber-500' },
      { label: 'Active', value: '18', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
      { label: 'Pending', value: '6', icon: Clock, color: 'from-orange-500 to-amber-500' },
    ],
    items: [
      { id: 1, title: 'Item 1', status: 'active', date: '2026-05-18' },
      { id: 2, title: 'Item 2', status: 'pending', date: '2026-05-17' },
      { id: 3, title: 'Item 3', status: 'active', date: '2026-05-16' },
    ]
  }
}

export default function GenericPage({ title, description, icon, category, role, userId }: GenericPageProps) {
  const { user } = useAuthStore()
  const data = getMockDataForPage(title, role, userId)
  const [isLoading, setIsLoading] = useState(false)
  const Icon = iconMap[icon] || BarChart3

  const renderContent = () => {
    const d = data as any

    // Daily Briefing
    if (d.stats && d.schedule) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            {d.stats.map((s: any, i: number) => (
              <motion.div key={s.label} variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", s.color)}>
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {d.schedule && (
            <Card>
              <CardHeader><CardTitle className="text-base">Today's Schedule</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {d.schedule.map((s: any, i: number) => (
                    <div key={i} className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-colors",
                      s.status === 'current' ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800' : 'hover:bg-accent/50'
                    )}>
                      <span className="text-sm font-mono font-medium text-muted-foreground w-20">{s.time}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.room}</p>
                      </div>
                      {s.status === 'current' && <Badge variant="default" className="bg-orange-500">Now</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {d.chartData && (
            <Card>
              <CardHeader><CardTitle className="text-base">Weekly Focus Hours</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d.chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="focus" stroke="#f97316" fill="#f97316" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {d.announcements && (
            <Card>
              <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {d.announcements.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <Megaphone className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">{a.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }

    // Notes pages
    if (d.notes) {
      return (
        <div className="space-y-6">
          {d.stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {d.stats.map((s: any) => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", s.color)}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xl font-bold">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {d.notes.map((note: any) => (
              <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{note.title}</h3>
                        {note.pinned && <Bookmark className="w-3 h-3 text-orange-500 fill-orange-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{note.subject}</Badge>
                        {note.shared && <Badge className="text-[10px] bg-orange-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Shared</Badge>}
                        {note.author && <span className="text-[10px] text-muted-foreground">by {note.author}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{note.date}</span>
                  </div>
                  {note.likes !== undefined && (
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {note.likes}</span>
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {note.downloads}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    // Announcements
    if (d.announcements) {
      return (
        <div className="space-y-4">
          {d.announcements.map((a: any) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-muted-foreground">{a.date}</span>
                    {a.priority && (
                      <Badge className={cn(
                        "text-[10px]",
                        a.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        a.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      )}>{a.priority}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Study Planner
    if (d.plans) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Study Hours</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={d.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {d.plans.map((p: any) => (
              <Card key={p.subject}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{p.subject}</h3>
                    <span className="text-xs text-muted-foreground">{p.hoursThisWeek}h this week</span>
                  </div>
                  <Progress value={(p.completed / p.topics) * 100} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.completed}/{p.topics} topics</span>
                    <span>Next: {p.nextTopic}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    // Focus Mode
    if (d.sessions && d.streak !== undefined) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-orange-500">🔥 {d.streak}</p><p className="text-xs text-muted-foreground mt-1">Day Streak</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{d.totalMinutes}</p><p className="text-xs text-muted-foreground mt-1">Total Minutes</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-emerald-500">{d.todayMinutes}</p><p className="text-xs text-muted-foreground mt-1">Today (min)</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Sessions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {d.sessions.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div>
                      <p className="text-sm font-medium">{s.subject}</p>
                      <p className="text-xs text-muted-foreground">{s.duration} · {s.date}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">Score: {s.score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Exams
    if (d.exams) {
      return (
        <div className="space-y-4">
          {d.exams.map((e: any) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                      e.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-orange-100 dark:bg-orange-900'
                    )}>
                      {e.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <FileText className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{e.subject}</h3>
                      <p className="text-xs text-muted-foreground">{e.type} · {e.syllabus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{e.date}</p>
                    {e.score !== undefined && <Badge className="mt-1 bg-emerald-100 text-emerald-700">{e.score}%</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Bus Tracking
    if (d.route) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{d.route.name}</h3>
                  <p className="text-xs text-muted-foreground">Bus: {d.route.bus} · Driver: {d.route.driver}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{d.route.status}</Badge>
              </div>
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
                <p className="text-3xl font-bold text-orange-500">{d.eta}</p>
              </div>
              <div className="space-y-2">
                {d.stops.map((stop: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", i === 0 ? "bg-orange-500" : "bg-border")} />
                    <span className="text-sm">{stop}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Nexus Hub / Social
    if (d.posts) {
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <textarea placeholder="What's on your mind?" className="w-full bg-transparent border border-border/50 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" rows={3} />
              <div className="flex justify-end mt-2"><Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500">Post</Button></div>
            </CardContent>
          </Card>
          {d.posts.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar fallback={p.avatar} size="sm" />
                  <div><p className="text-sm font-medium">{p.author}</p><p className="text-[10px] text-muted-foreground">{p.time}</p></div>
                </div>
                <p className="text-sm mb-3">{p.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-orange-500 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /> {p.likes}</button>
                  <button className="flex items-center gap-1 hover:text-orange-500 transition-colors"><MessageCircle className="w-3.5 h-3.5" /> {p.comments}</button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Achievements
    if (d.achievements) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {d.achievements.map((a: any) => (
            <Card key={a.id} className={cn(!a.earned && "opacity-50")}>
              <CardContent className="p-4 text-center">
                <span className="text-4xl">{a.icon}</span>
                <h3 className="text-sm font-semibold mt-2">{a.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                {a.earned ? (
                  <Badge className="mt-2 bg-emerald-100 text-emerald-700">Earned {a.date}</Badge>
                ) : (
                  <Badge variant="outline" className="mt-2">Locked</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Accolades
    if (d.accolades) {
      return (
        <div className="space-y-4">
          {d.accolades.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{a.title}</h3>
                  <p className="text-xs text-muted-foreground">From: {a.from} · {a.date}</p>
                </div>
                <Badge variant="outline">{a.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // CS Calendar
    if (d.events) {
      return (
        <div className="space-y-3">
          {d.events.map((e: any) => (
            <Card key={e.date}>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-orange-500 mb-2">{e.date}</p>
                <div className="space-y-1">
                  {e.events.map((ev: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {ev}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Profile
    if (d.profile) {
      const p = d.profile
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar fallback={p.name.split(' ').map((n: string) => n[0]).join('')} size="lg" />
                <div>
                  <h2 className="text-xl font-bold">{p.name}</h2>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(p).filter(([k]) => !['name', 'email'].includes(k)).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-lg bg-accent/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm font-medium mt-0.5">{String(val)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Users / Accounts / Payroll / etc - Table-like lists
    if (d.users || d.accounts || d.payroll || d.reports || d.installments || d.tickets || d.items || d.visits || d.portfolios || d.channels || d.notifications || d.routes || d.requests) {
      const listKey = d.users ? 'users' : d.accounts ? 'accounts' : d.payroll ? 'payroll' : d.reports ? 'reports' : d.installments ? 'installments' : d.tickets ? 'tickets' : d.items ? 'items' : d.visits ? 'visits' : d.portfolios ? 'portfolios' : d.channels ? 'channels' : d.notifications ? 'notifications' : d.routes ? 'routes' : d.requests ? 'requests' : 'items'
      const list = d[listKey] as any[]

      if (d.stats) {
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
              {d.stats.map((s: any) => (
                <Card key={s.label}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", s.color)}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-xl font-bold">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {renderList(list)}
          </div>
        )
      }

      if (d.chartData) {
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="subject" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="10-A" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="10-B" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {renderList(list)}
          </div>
        )
      }

      return renderList(list)
    }

    // Student Progress
    if (d.students && d.students[0]?.gpa === undefined) {
      return renderList(d.students)
    }

    // Fallback
    if (d.stats) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {d.stats.map((s: any) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", s.color)}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {d.items && renderList(d.items)}
        </div>
      )
    }

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Icon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Content for {title} is being prepared.</p>
        </CardContent>
      </Card>
    )
  }

  const renderList = (items: any[]) => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                {items.length > 0 && Object.keys(items[0]).map(key => (
                  <th key={key} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                  {Object.values(item).map((val: any, j: number) => (
                    <td key={j} className="px-4 py-3 text-sm">
                      {typeof val === 'boolean' ? (val ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />) :
                       typeof val === 'number' ? <span className="font-medium">{val}</span> :
                       String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Icon className="w-6 h-6 text-orange-500" />
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{category}</Badge>
        </div>
      </motion.div>

      {/* Content */}
      {renderContent()}
    </motion.div>
  )
}

