import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Home, BookOpen, Calendar, MessageSquare, Sparkles, Plus, ClipboardList, Users, BarChart3, Radio, CreditCard, Bus, User, MapPin, Library, Building2, Wallet, LayoutDashboard, LogOut, ChevronDown, ChevronUp } from "lucide-react"

import { useAuthStore, type UserRole } from "@/lib/store"
import { Button } from "@/components/ui/Button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { ScrollArea } from "@/components/ui/ScrollArea"

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  if (!user) return null

  const items = navItems[user.role] || []
  const visible = items.filter((i) => i.label !== "AI").slice(0, 4)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center lg:hidden">
        <nav className="flex items-center justify-center space-x-4 rounded-full border border-white/30 bg-white/40 p-2 shadow-xl backdrop-blur-2xl">
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

          <SheetTrigger asChild>
            <Button
              size="icon"
              className="rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>

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

      <SheetContent side="left" className="w-[280px] p-0 bg-white/95 backdrop-blur-xl border-r border-white/20">
        <ScrollArea className="h-full py-6">
          <div className="px-4 pb-4 border-b border-orange-100">
            <Link to={`/${user.role}`} onClick={() => setSheetOpen(false)} className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/iextksqn/image/upload/v1783831062/csfeviconbgfreeedition_rtfr8x.png"
                alt="Cornerstone"
                className="w-8 h-8 object-contain"
              />
              <span className="font-zentry text-lg font-black uppercase tracking-wider text-gray-900">
                SchoolSync
              </span>
            </Link>
          </div>

          <div className="px-3 py-4">
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Navigation
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { setSheetOpen(false); navigate(item.path) }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pt-4 border-t border-orange-100">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                <span className="truncate text-xs text-gray-400">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
              </div>
            </div>
            <button
              onClick={() => { useAuthStore.getState().logout(); navigate("/"); setSheetOpen(false) }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
