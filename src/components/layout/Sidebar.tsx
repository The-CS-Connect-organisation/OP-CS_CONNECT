import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useSidebarStore } from '@/lib/store'
import { navSections, roleLabels } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { LogOut, X, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()

  if (!user) return null

  const sections = navSections[user.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (collapsed: boolean) => (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-orange-950 via-orange-900 to-orange-950 text-white border-r border-orange-800/40",
      collapsed && "items-center"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-orange-900/20 shrink-0",
        collapsed ? "flex-col gap-1 py-3 px-1" : "gap-3 px-4 py-4"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-900/30 shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className={cn("min-w-0", collapsed ? "hidden" : "flex-1")}>
          <p className="text-sm font-bold leading-tight truncate text-white/90">{user.name}</p>
          <p className="text-[11px] text-orange-300/70 font-medium">{roleLabels[user.role]}</p>
        </div>
        <button
          onClick={toggle}
          className="hidden lg:inline-flex p-1 rounded-md hover:bg-white/10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/70" /> : <ChevronLeft className="w-4 h-4 text-white/70" />}
        </button>
        <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md hover:bg-white/10 lg:hidden">
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5 sidebar-scroll", collapsed ? "px-1" : "px-3")} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {sections.map((section) => (
          <div key={section.label} className={cn("mb-2", collapsed && "flex flex-col items-center")}>
            <p className={cn(
              "text-[10px] font-semibold uppercase tracking-widest text-orange-300/40 px-2 py-1",
              collapsed && "hidden"
            )}>{section.label}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${user.role}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all duration-150 group relative",
                  collapsed
                    ? "justify-center w-10 h-10 mx-auto"
                    : "gap-2.5 px-2.5 py-2",
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-300 font-semibold shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full shadow-lg shadow-orange-500/50",
                      collapsed ? "left-0 w-1 h-6" : "left-0 w-1 h-6"
                    )} />}
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-orange-400" : "text-white/40 group-hover:text-white/70")} />
                    <span className={cn("whitespace-nowrap overflow-hidden text-[13px]", collapsed && "hidden")}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-orange-900/20 shrink-0", collapsed ? "px-1 py-3" : "px-3 py-3")}>
        <button onClick={handleLogout} className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-all w-full text-white/40 hover:text-red-400 hover:bg-red-500/10",
          collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-2.5 px-2.5 py-2"
        )}>
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn(collapsed && "hidden")}>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay with blur and animation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar with slide-in animation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-[280px] lg:hidden shadow-2xl"
          >
            {sidebarContent(false)}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar - icon-only when collapsed */}
      <aside
        className={cn(
          "hidden lg:block flex-shrink-0 h-full sticky top-0 overflow-hidden transition-all duration-200 ease-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("h-full", isCollapsed ? "w-16" : "w-64")}>
          {sidebarContent(isCollapsed)}
        </div>
      </aside>
    </>
  )
}
