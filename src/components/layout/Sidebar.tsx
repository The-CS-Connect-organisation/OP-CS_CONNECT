import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useSidebarStore } from '@/lib/store'
import { navSections, roleGradients, roleLabels } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  LogOut, ChevronDown, ChevronLeft, ChevronRight, X, Menu
} from 'lucide-react'

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  if (!user) return null

  const sections = navSections[user.role] || []
  const gradient = roleGradients[user.role]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleSection = (label: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header - user profile */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-sidebar-border shrink-0",
        isCollapsed && "justify-center px-2"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 w-full min-w-0">
            <Avatar className="w-9 h-9 ring-2 ring-sidebar-accent/30 shrink-0">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback className={cn("text-xs font-bold bg-gradient-to-br text-white", gradient)}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate text-sidebar-foreground">{user.name}</p>
              <p className="text-[11px] text-sidebar-foreground/50 font-medium">{roleLabels[user.role]}</p>
            </div>
          </div>
        ) : (
          <Avatar className="w-8 h-8 ring-2 ring-sidebar-accent/30 shrink-0">
            <AvatarImage src={user.avatar || ''} />
            <AvatarFallback className={cn("text-xs font-bold bg-gradient-to-br text-white", gradient)}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin">
        {sections.map((section) => {
          const isSectionCollapsed = collapsedSections.has(section.label)
          return (
            <div key={section.label} className="mb-1.5">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-sidebar-muted/60 transition-colors group"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors">{section.label}</span>
                  <ChevronDown className={cn(
                    "w-3 h-3 text-sidebar-foreground/30 transition-transform duration-200",
                    isSectionCollapsed && "-rotate-90"
                  )} />
                </button>
              )}

              <AnimatePresence initial={false}>
                {!isSectionCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user.role}`}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 group relative",
                          isCollapsed && "justify-center px-2",
                          isActive
                            ? "bg-sidebar-accent/15 text-orange-400"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-muted/40 hover:text-sidebar-foreground"
                        )}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active"
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-400 rounded-r-full shadow-sm shadow-orange-400/30"
                              />
                            )}
                            <item.icon className={cn(
                              "w-4 h-4 flex-shrink-0 transition-colors",
                              isActive ? "text-orange-400" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                            )} />
                            {!isCollapsed && (
                              <span className="whitespace-nowrap overflow-hidden text-[13px]">{item.label}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Footer - collapse toggle + logout */}
      <div className="border-t border-sidebar-border px-3 py-3 shrink-0 space-y-1">
        {/* Collapse toggle (desktop only, inside sidebar) */}
        <button
          onClick={toggle}
          className={cn(
            "hidden lg:flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all w-full",
            "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/40",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all w-full",
            "text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-[280px] lg:hidden"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <motion.aside
          animate={{ width: isCollapsed ? 64 : 256 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.8 }}
          className="h-full sticky top-0 flex flex-col overflow-hidden"
        >
          {sidebarContent}
        </motion.aside>
      </div>
    </>
  )
}
