import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore, type UserRole } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, Calendar, MessageSquare, User,
  Sparkles, Trophy, Bell, Settings, CreditCard, ClipboardList,
  BarChart3, Bus, Library, Globe, Target, FileText, Users,
  Wallet, Radio, Shield, MapPin, Building2
} from 'lucide-react'

interface BottomNavItem {
  icon: React.ElementType
  label: string
  path: string
  badge?: number
}

const bottomNavItems: Record<UserRole, BottomNavItem[]> = {
  student: [
    { icon: LayoutDashboard, label: 'Home', path: '/student' },
    { icon: BookOpen, label: 'Courses', path: '/student/assignments' },
    { icon: Calendar, label: 'Calendar', path: '/student/cs-calendar' },
    { icon: MessageSquare, label: 'Messages', path: '/student/messages' },
    { icon: Sparkles, label: 'AI', path: '/student/ai' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Home', path: '/teacher' },
    { icon: ClipboardList, label: 'Assignments', path: '/teacher/assignments' },
    { icon: Users, label: 'Classes', path: '/teacher/class-analytics' },
    { icon: MessageSquare, label: 'Messages', path: '/teacher/messages' },
    { icon: Sparkles, label: 'AI', path: '/teacher/ai' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Home', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Radio, label: 'Comms', path: '/admin/comms-hub' },
    { icon: Sparkles, label: 'AI', path: '/admin/ai' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Home', path: '/parent' },
    { icon: User, label: 'Children', path: '/parent/attendance' },
    { icon: CreditCard, label: 'Fees', path: '/parent/fees' },
    { icon: MessageSquare, label: 'Messages', path: '/parent/messages' },
    { icon: Bus, label: 'Bus', path: '/parent/bus-tracking' },
  ],
  driver: [
    { icon: LayoutDashboard, label: 'Home', path: '/driver' },
    { icon: MapPin, label: 'Route', path: '/driver/profile' },
    { icon: User, label: 'Profile', path: '/driver/profile' },
  ],
  librarian: [
    { icon: Library, label: 'Library', path: '/librarian' },
    { icon: BookOpen, label: 'Books', path: '/librarian' },
    { icon: Users, label: 'Users', path: '/librarian' },
    { icon: User, label: 'Profile', path: '/librarian/profile' },
  ],
  coordinator: [
    { icon: LayoutDashboard, label: 'Home', path: '/coordinator' },
    { icon: Building2, label: 'Schools', path: '/coordinator/schools' },
    { icon: BarChart3, label: 'Analytics', path: '/coordinator/analytics' },
    { icon: Radio, label: 'Broadcast', path: '/coordinator/broadcast' },
    { icon: Sparkles, label: 'AI', path: '/coordinator/ai' },
  ],
  manager: [
    { icon: LayoutDashboard, label: 'Home', path: '/manager' },
    { icon: Users, label: 'People', path: '/manager/users' },
    { icon: Wallet, label: 'Finance', path: '/manager/finance' },
    { icon: Radio, label: 'Comms', path: '/manager/comms-hub' },
    { icon: Sparkles, label: 'AI', path: '/manager/ai' },
  ],
}

export default function BottomNavBar() {
  const { user } = useAuthStore()
  if (!user) return null

  const items = bottomNavItems[user.role] || []

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === `/${user.role}`}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center justify-center w-full h-full gap-0.5 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
