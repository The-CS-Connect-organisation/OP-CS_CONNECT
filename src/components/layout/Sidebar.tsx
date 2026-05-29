import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useSidebarStore } from '@/lib/store'
import { navSections, roleGradients, roleLabels } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { LogOut, X, GraduationCap } from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()

  if (!user) return null

  const sections = navSections[user.role] || []
  const gradient = roleGradients[user.role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1a0a00] via-[#2a1200] to-[#1f0d00] text-white border-r border-orange-900/30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-900/20 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-900/30 shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate text-white/90">{user.name}</p>
          <p className="text-[11px] text-orange-300/70 font-medium">{roleLabels[user.role]}</p>
        </div>
        <button onClick={() => { toggle(); setMobileOpen(false); }} className="p-1 rounded-md hover:bg-white/10 lg:hidden">
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Navigation - flat list, no section collapse */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.label} className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-300/40 px-2 py-1">{section.label}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${user.role}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 group relative",
                  isActive
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-300 font-semibold shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full shadow-lg shadow-orange-500/50" />}
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-orange-400" : "text-white/40 group-hover:text-white/70")} />
                    <span className="whitespace-nowrap overflow-hidden text-[13px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-orange-900/20 px-3 py-3 shrink-0">
        <button onClick={handleLogout} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all w-full text-white/40 hover:text-red-400 hover:bg-red-500/10">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <aside className="fixed left-0 top-0 z-50 h-full w-[280px] lg:hidden shadow-2xl">
          {sidebarContent}
        </aside>
      )}

      {/* Desktop sidebar - completely hidden when collapsed */}
      <aside
        className={cn(
          "hidden lg:block flex-shrink-0 h-full sticky top-0 overflow-hidden transition-all duration-200 ease-out",
          isCollapsed ? "w-0" : "w-64"
        )}
      >
        <div className="w-64 h-full">{sidebarContent}</div>
      </aside>
    </>
  )
}
