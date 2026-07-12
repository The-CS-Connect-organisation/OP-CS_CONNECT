import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Home, Users, Info, BookOpen, Menu, LogIn, LayoutDashboard, LogOut, User, Plus, MessageSquare, Settings, ChevronDown, ChevronUp } from "lucide-react"

import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet"
import { ScrollArea } from "@/components/ui/ScrollArea"

const products = [
  { title: "For Students", href: "/student", description: "Track assignments, grades, and schedules." },
  { title: "For Teachers", href: "/teacher", description: "Manage classes, attendance, and reports." },
  { title: "For Parents", href: "/parent", description: "Stay updated on your child's progress." },
  { title: "For Admins", href: "/admin", description: "Full oversight of school operations." },
]

const aboutItems = [
  { title: "Our Story", href: "/about/providence", description: "Learn about Cornerstone's mission." },
  { title: "Team", href: "/team", description: "Meet the people behind SchoolSync." },
  { title: "Careers", href: "/careers", description: "Join us in transforming education." },
  { title: "Blog", href: "/blog", description: "Latest updates from Cornerstone Schools." },
]

const resources = [
  { title: "Help Center", href: "/help", description: "Guides, FAQs, and support." },
  { title: "Contact", href: "/contact", description: "Get in touch with our team." },
  { title: "Privacy", href: "/privacy", description: "How we handle your data." },
]

export default function MobileNav() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()

  const getDashboardRoute = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "student": return "/student"
      case "teacher": return "/teacher"
      case "admin": return "/admin"
      case "parent": return "/parent"
      case "driver": return "/driver"
      case "librarian": return "/librarian"
      case "coordinator": return "/coordinator"
      case "manager": return "/manager"
      default: return "/login"
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center md:hidden">
        <nav className="flex items-center justify-center space-x-4 rounded-full border border-white/30 bg-white/40 p-2 shadow-xl backdrop-blur-2xl">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/")}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Users className="h-5 w-5" />
                <span className="sr-only">Products</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {products.map((p) => (
                <DropdownMenuItem key={p.title} onClick={() => navigate(p.href)}>
                  {p.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full bg-orange-500 text-white hover:bg-orange-600 shadow-sm">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="h-5 w-5" />
                <span className="sr-only">About</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {aboutItems.map((a) => (
                <DropdownMenuItem key={a.title} onClick={() => navigate(a.href)}>
                  {a.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(getDashboardRoute())}>
              <User className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/login")}>
              <LogIn className="h-5 w-5" />
              <span className="sr-only">Sign In</span>
            </Button>
          )}
        </nav>
      </div>

      <SheetContent side="left" className="w-[280px] p-0 bg-white/95 backdrop-blur-xl border-r border-white/20">
        <ScrollArea className="h-full py-6">
          <div className="px-4 pb-4 border-b border-orange-100">
            <Link to="/" onClick={() => setSheetOpen(false)} className="flex items-center gap-2">
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

          <div className="px-3 py-4 space-y-6">
            <Section label="Products" items={products} onNavigate={() => setSheetOpen(false)} />
            <Section label="About" items={aboutItems} onNavigate={() => setSheetOpen(false)} />
            <Section label="Resources" items={resources} onNavigate={() => setSheetOpen(false)} />
          </div>

          <div className="px-3 pt-4 border-t border-orange-100">
            {isAuthenticated && user ? (
              <div className="space-y-2">
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
                  onClick={() => { setSheetOpen(false); navigate(getDashboardRoute()) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => { useAuthStore.getState().logout(); navigate("/"); setSheetOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => { setSheetOpen(false); navigate("/login") }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => { setSheetOpen(false); navigate("/signup") }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:from-orange-600 hover:to-orange-700"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function Section({ label, items, onNavigate }: { label: string; items: { title: string; href: string; description: string }[]; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400"
      >
        {label}
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded && (
        <div className="mt-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              onClick={onNavigate}
              className="flex flex-col rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <span className="font-medium">{item.title}</span>
              <span className="truncate text-xs text-gray-400">{item.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
