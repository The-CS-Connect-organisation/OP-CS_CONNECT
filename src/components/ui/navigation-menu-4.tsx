import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LayoutDashboard, LogIn, LogOut, CircleUserRound } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useAuthStore } from "@/lib/store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/contact", label: "Contact" },
]

const NavigationMenu4 = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
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
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl md:px-6">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`}
              alt="Cornerstone"
              className="w-7 h-7 md:w-8 md:h-8 object-contain"
            />
            <span className="font-zentry text-base md:text-lg font-black uppercase tracking-wider text-white">
              CS Connect
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors p-1.5">
                    <CircleUserRound className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="flex items-start gap-3 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-bold text-base shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-gray-900">{user.name}</span>
                      {user.class && <span className="truncate text-xs text-gray-400">Class {user.class}</span>}
                      <span className="truncate text-xs text-gray-400">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { useAuthStore.getState().logout(); navigate("/") }}>
                    <LogOut className="w-4 h-4 text-gray-400" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-7xl px-4 sm:px-6 lg:px-8 md:hidden"
          >
            <nav className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-white/10" />
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => { setMobileOpen(false); navigate(getDashboardRoute()) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => { useAuthStore.getState().logout(); navigate("/"); setMobileOpen(false) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); navigate("/login") }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default NavigationMenu4
