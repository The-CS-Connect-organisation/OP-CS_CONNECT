import React, { useCallback, useState, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useSidebarStore } from '@/lib/store'
import { navSections } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { LogOut, X, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import styled from 'styled-components'

const staffRoles = ['teacher', 'admin', 'manager', 'librarian']

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  if (!user) return null

  const sections = navSections[user.role] || []
  const isStaff = staffRoles.includes(user.role)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleEducatorDesk = useCallback(() => {
    window.open('/educator-desk', '_blank')
  }, [])

  const handleSectionEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoveredSection(label)
  }

  const handleSectionLeave = () => {
    closeTimer.current = setTimeout(() => setHoveredSection(null), 150)
  }

  const isItemActive = (item: { path: string }) => {
    if (item.path === `/${user.role}`) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
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

        <button
          onClick={toggle}
          className="hidden lg:inline-flex p-1 rounded-md hover:bg-white/10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/70" /> : <ChevronLeft className="w-4 h-4 text-white/70" />}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setMobileOpen(false) }} className="p-2 rounded-md hover:bg-white/10 lg:hidden active:scale-95 transition-transform">
          <X className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5 sidebar-scroll", collapsed ? "px-1" : "px-3")} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {collapsed ? sections.map((section) => {
          const filtered = section.items.filter(item => {
            if (user.role === 'teacher' && item.path === '/teacher/timetable') return !!(user.sectionId || user.classIds?.length)
            return true
          })
          if (filtered.length === 0) return null
          const hasActive = filtered.some(i => isItemActive(i))
          return (
            <div key={section.label} className="relative flex flex-col items-center mb-2">
              <button
                onMouseEnter={() => handleSectionEnter(section.label)}
                onMouseLeave={handleSectionLeave}
                className={cn(
                  "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-150",
                  hasActive
                    ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/30"
                    : "text-white/40 hover:bg-white/10 hover:text-white"
                )}
              >
                {React.createElement(filtered[0].icon, { className: "w-4 h-4" })}
              </button>
              <AnimatePresence>
                {hoveredSection === section.label && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => handleSectionEnter(section.label)}
                    onMouseLeave={handleSectionLeave}
                    className="absolute left-full top-0 ml-2 z-50 w-56 rounded-xl border border-orange-800/40 bg-gradient-to-b from-orange-950 via-orange-900 to-orange-950 shadow-xl py-2"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-300/40 px-3 pb-1 mb-1 border-b border-orange-800/20">
                      {section.label}
                    </p>
                    {filtered.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user.role}`}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-orange-500/20 text-white border-l-2 border-orange-400"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }) : sections.map((section) => (
          <div key={section.label} className={cn("mb-2", collapsed && "flex flex-col items-center")}>
            <p className={cn(
              "text-[10px] font-semibold uppercase tracking-widest text-orange-300/40 px-2 py-1",
              collapsed && "hidden"
            )}>{section.label}</p>
            {section.items.filter(item => {
              if (user.role === 'teacher' && item.path === '/teacher/timetable') {
                return !!(user.sectionId || user.classIds?.length);
              }
              return true;
            }).map((item) => (
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
                    ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white font-semibold shadow-sm shadow-orange-500/30"
                    : "text-white/70 hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-amber-600/20 hover:text-white"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 bg-gradient-to-b from-orange-400 to-amber-500 rounded-r-full shadow-lg shadow-orange-500/50",
                      collapsed ? "left-0 w-1 h-6" : "left-0 w-1 h-6"
                    )} />}
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                    <span className={cn("whitespace-nowrap overflow-hidden text-[13px]", collapsed && "hidden")}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* EducatorDesk Button - Staff only */}
      {isStaff && (
        <div className={cn("shrink-0", collapsed ? "px-1 py-2" : "px-3 py-2")}>
          {collapsed ? (
            <button onClick={handleEducatorDesk} className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-all" title="EducatorDesk">
              <Briefcase className="w-5 h-5" />
            </button>
          ) : (
            <StyledEducatorBtn onClick={handleEducatorDesk} className="w-full">
              <div className="box-button">
                <div className="button">
                  <Briefcase className="w-4 h-4" />
                  <span>EducatorDesk</span>
                </div>
              </div>
            </StyledEducatorBtn>
          )}
        </div>
      )}

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

  const StyledEducatorBtn = styled.button`
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    width: 100%;
    user-select: none;

    .box-button {
      cursor: pointer;
      border: 3px solid #fbbf24;
      background-color: rgba(251, 191, 36, 0.15);
      padding-bottom: 8px;
      transition: 0.1s ease-in-out;
      user-select: none;
      border-radius: 8px;
    }

    .button {
      background-color: rgba(251, 191, 36, 0.2);
      border: 3px solid rgba(251, 191, 36, 0.4);
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      border-radius: 5px;
    }

    .button span {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fbbf24;
    }

    .button svg {
      color: #fbbf24;
    }

    .box-button:active {
      padding: 0;
      margin-bottom: 8px;
      transform: translateY(8px);
    }

    .box-button:hover {
      background-color: rgba(251, 191, 36, 0.25);
    }
  `

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
