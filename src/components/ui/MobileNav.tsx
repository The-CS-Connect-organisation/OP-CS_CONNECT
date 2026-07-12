import React from "react"
import { useNavigate } from "react-router-dom"
import { Home, BookOpen, Calendar, MessageSquare, Sparkles, Plus, ClipboardList, Users, BarChart3, Radio, CreditCard, Bus, User, MapPin, Library, Building2, Wallet, LayoutDashboard } from "lucide-react"

import { useAuthStore, useSidebarStore, type UserRole } from "@/lib/store"
import { Button } from "@/components/ui/Button"

interface NavItem {
  icon: React.ElementType
  label: string
  path: string
}

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { icon: LayoutDashboard, label: "Home", path: "/student" },
    { icon: BookOpen, label: "Courses", path: "/student/assignments" },
    { icon: Calendar, label: "Calendar", path: "/student/cs-calendar" },
    { icon: MessageSquare, label: "Messages", path: "/student/messages" },
    { icon: Sparkles, label: "AI", path: "/student/ai" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Home", path: "/teacher" },
    { icon: ClipboardList, label: "Assignments", path: "/teacher/assignments" },
    { icon: Users, label: "Classes", path: "/teacher/class-analytics" },
    { icon: MessageSquare, label: "Messages", path: "/teacher/messages" },
    { icon: Sparkles, label: "AI", path: "/teacher/ai" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Home", path: "/admin" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    { icon: Radio, label: "Comms", path: "/admin/comms-hub" },
    { icon: Sparkles, label: "AI", path: "/admin/ai" },
  ],
  parent: [
    { icon: LayoutDashboard, label: "Home", path: "/parent" },
    { icon: User, label: "Children", path: "/parent/attendance" },
    { icon: CreditCard, label: "Fees", path: "/parent/fees" },
    { icon: MessageSquare, label: "Messages", path: "/parent/messages" },
    { icon: Bus, label: "Bus", path: "/parent/bus-tracking" },
  ],
  driver: [
    { icon: LayoutDashboard, label: "Home", path: "/driver" },
    { icon: MapPin, label: "Route", path: "/driver/profile" },
    { icon: User, label: "Profile", path: "/driver/profile" },
  ],
  librarian: [
    { icon: LayoutDashboard, label: "Home", path: "/librarian" },
    { icon: BookOpen, label: "Books", path: "/librarian" },
    { icon: Users, label: "Users", path: "/librarian" },
    { icon: User, label: "Profile", path: "/librarian/profile" },
  ],
  coordinator: [
    { icon: LayoutDashboard, label: "Home", path: "/coordinator" },
    { icon: Building2, label: "Schools", path: "/coordinator/schools" },
    { icon: BarChart3, label: "Analytics", path: "/coordinator/analytics" },
    { icon: Radio, label: "Broadcast", path: "/coordinator/broadcast" },
    { icon: Sparkles, label: "AI", path: "/coordinator/ai" },
  ],
  manager: [
    { icon: LayoutDashboard, label: "Home", path: "/manager" },
    { icon: Users, label: "People", path: "/manager/users" },
    { icon: Wallet, label: "Finance", path: "/manager/finance" },
    { icon: Radio, label: "Comms", path: "/manager/comms-hub" },
    { icon: Sparkles, label: "AI", path: "/manager/ai" },
  ],
}

export default function MobileNav() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isMobileOpen, setMobileOpen } = useSidebarStore()

  if (!user) return null

  const items = navItems[user.role] || []
  const visible = items.filter((i) => i.label !== "AI").slice(0, 4)

  return (
    <div
      className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center transition-all duration-300 ease-out lg:hidden will-change-transform ${isMobileOpen ? 'translate-y-20 opacity-20' : 'translate-y-0 opacity-100'}`}
    >
      <nav className="relative flex items-center justify-center space-x-4 w-[280px] rounded-full border border-white/25 bg-white/[0.07] p-2 shadow-2xl shadow-black/8 backdrop-blur-[40px] backdrop-saturate-[1.8] overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-full shimmer-overlay pointer-events-none" />
        {visible.slice(0, 2).map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Button>
        ))}

        <Button
          size="icon"
          className="rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
          onClick={() => setMobileOpen(true)}
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>

        {visible.slice(2, 4).map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}
