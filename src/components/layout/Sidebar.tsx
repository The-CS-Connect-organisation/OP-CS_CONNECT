import React, { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore, useSidebarStore, useThemeStore } from '@/lib/store'
import { navSections } from '@/lib/nav-config'
import { cn } from '@/lib/utils'
import { LogOut, X, ChevronLeft, ChevronRight, Briefcase, Wallet } from 'lucide-react'
import { playNavSound } from '@/lib/sound'



export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const { isDark } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [popupPos, setPopupPos] = useState({ top: 0 })
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  if (!user) return null

  const sections = navSections[user.role] || []

  const staffRoles = ['superadmin', 'admin', 'director', 'principal', 'viceprincipal', 'coordinator', 'teacher', 'librarian']
  const studentRoles = ['student', 'parent']
  const isStaff = staffRoles.includes(user.role)
  const isStudentOrParent = studentRoles.includes(user.role)

  const handleCampusDesk = useCallback(() => {
    playNavSound()
    navigate('/campus-desk')
    setMobileOpen(false)
  }, [navigate, setMobileOpen])

  const handleCampusPay = useCallback(() => {
    playNavSound()
    navigate('/campus-pay')
    setMobileOpen(false)
  }, [navigate, setMobileOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSectionEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoveredSection(label)
    const el = btnRefs.current[label]
    if (el) {
      const rect = el.getBoundingClientRect()
      setPopupPos({ top: rect.top })
    }
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
      "flex flex-col h-full border-r transition-colors duration-200",
      collapsed && "items-center",
      isDark
        ? "bg-[#1C1B1A] border-white/10 text-white"
        : "bg-[#FAF8F6] border-black/10 text-[#57534E]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center shrink-0 transition-colors duration-200",
        collapsed ? "flex-col gap-1 py-3 px-1" : "gap-3 px-4 py-4",
        isDark ? "border-b border-white/10" : "border-b border-black/10"
      )}>
        <button
          onClick={toggle}
          className={cn(
            "hidden lg:inline-flex p-1 rounded-md transition-colors",
            isDark ? "hover:bg-white/10 text-[#8C8884]" : "hover:bg-black/10 text-[#57534E]"
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setMobileOpen(false) }} className={cn(
          "p-2 rounded-md lg:hidden active:scale-95 transition-transform",
          isDark ? "hover:bg-white/10 text-white/80" : "hover:bg-black/10 text-[#57534E]"
        )}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5 sidebar-scroll", collapsed ? "px-1" : "px-3")} style={{ scrollbarWidth: 'thin', scrollbarColor: isDark ? 'rgba(140,136,132,0.2) transparent' : 'rgba(87,83,78,0.2) transparent' }}>
        {collapsed ? sections.map((section) => {
          const filtered = section.items.filter(item => {
            if (user.role === 'teacher' && item.path === '/teacher/timetable') return !!(user.sectionId || user.classIds?.length)
            return true
          })
          if (filtered.length === 0) return null
          const hasActive = filtered.some(i => isItemActive(i))
          return (
            <div key={section.label} className="flex flex-col items-center mb-2">
              <button
                ref={el => btnRefs.current[section.label] = el}
                onMouseEnter={() => handleSectionEnter(section.label)}
                onMouseLeave={handleSectionLeave}
                className={cn(
                  "flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-150",
                  hasActive
                    ? "bg-gradient-to-r from-[#EC8037]/85 to-[#D96A2C]/85 text-white shadow-md shadow-[#EC8037]/20"
                    : isDark ? "text-[#8C8884] hover:bg-white/10 hover:text-[#F2F0EE]" : "text-[#57534E] hover:bg-[#EC8037]/15 hover:text-[#EC8037]"
                )}
              >
                {React.createElement(filtered[0].icon, { className: "w-4 h-4" })}
              </button>
            </div>
          )
        }) : sections.map((section) => (
          <div key={section.label} className={cn("mb-2", collapsed && "flex flex-col items-center")}>
            <p className={cn(
              "text-[10px] font-semibold uppercase tracking-widest px-2 py-1 transition-colors duration-200",
              collapsed && "hidden",
              isDark ? "text-[#8C8884]/60" : "text-[#57534E]/60"
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
                onClick={() => { playNavSound(); setMobileOpen(false) }}
                className={({ isActive }) => cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all duration-150 group relative",
                  collapsed
                    ? "justify-center w-10 h-10 mx-auto"
                    : "gap-2.5 px-2.5 py-2",
                  !collapsed && isActive && "mx-2",
                  !isActive && (isDark
                    ? "text-[#8C8884] hover:bg-white/10 hover:text-[#F2F0EE]"
                    : "text-[#57534E] hover:bg-[#EC8037]/15 hover:text-[#EC8037]")
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded-r-full",
                      collapsed ? "left-0 w-1 h-6" : "left-0 w-1 h-6 -ml-2",
                      isDark ? "bg-gradient-to-b from-[#EC8037] to-[#D96A2C]" : "bg-[#EC8037]"
                    )} />}
                    <div className={cn(
                      "flex items-center w-full transition-all duration-150",
                      collapsed ? "" : "gap-2.5",
                      isActive
                        ? isDark
                          ? "bg-gradient-to-r from-[#EC8037]/85 to-[#D96A2C]/85 shadow-md shadow-[#EC8037]/20 rounded-lg px-2.5 py-2"
                          : "bg-[#EC8037]/85 shadow-md shadow-[#EC8037]/20 rounded-lg px-2.5 py-2"
                        : ""
                    )}>
                      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : isDark ? "text-[#8C8884] group-hover:text-[#F2F0EE]" : "text-[#57534E] group-hover:text-[#EC8037]")} />
                      <span className={cn(
                        "whitespace-nowrap overflow-hidden text-[13px]",
                        collapsed && "hidden",
                        isActive ? "text-[#3A2E28] font-medium" : ""
                      )}>{item.label}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("shrink-0 transition-colors duration-200 space-y-2", collapsed ? "px-1 py-3" : "px-3 py-3", isDark ? "border-t border-white/10" : "border-t border-black/10")}>
        {isStaff && !collapsed && (
          <div className="box-button cursor-pointer border-4 border-orange-600 bg-orange-400 pb-2.5 select-none active:pb-0 active:mb-2.5 active:translate-y-2.5 transition-all duration-75">
            <button onClick={handleCampusDesk} className="button w-full bg-orange-100 border-4 border-orange-200 px-2 py-1 flex items-center gap-2.5 text-sm font-medium text-orange-800">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>CampusDesk</span>
            </button>
          </div>
        )}
        {isStaff && collapsed && (
          <div className="box-button cursor-pointer border-4 border-orange-600 bg-orange-400 pb-2.5 select-none active:pb-0 active:mb-2.5 active:translate-y-2.5 transition-all duration-75 flex justify-center">
            <button onClick={handleCampusDesk} className="button bg-orange-100 border-4 border-orange-200 px-1 py-1 flex items-center justify-center text-orange-800">
              <Briefcase className="w-5 h-5" />
            </button>
          </div>
        )}
        {isStudentOrParent && !collapsed && (
          <div className="box-button cursor-pointer border-4 border-orange-600 bg-orange-400 pb-2.5 select-none active:pb-0 active:mb-2.5 active:translate-y-2.5 transition-all duration-75">
            <button onClick={handleCampusPay} className="button w-full bg-orange-100 border-4 border-orange-200 px-2 py-1 flex items-center gap-2.5 text-sm font-medium text-orange-800">
              <Wallet className="w-4 h-4 shrink-0" />
              <span>CampusPay</span>
            </button>
          </div>
        )}
        {isStudentOrParent && collapsed && (
          <div className="box-button cursor-pointer border-4 border-orange-600 bg-orange-400 pb-2.5 select-none active:pb-0 active:mb-2.5 active:translate-y-2.5 transition-all duration-75 flex justify-center">
            <button onClick={handleCampusPay} className="button bg-orange-100 border-4 border-orange-200 px-1 py-1 flex items-center justify-center text-orange-800">
              <Wallet className="w-5 h-5" />
            </button>
          </div>
        )}
        <button onClick={handleLogout} className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-all w-full",
          collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-2.5 px-2.5 py-2",
          isDark ? "text-[#8C8884] hover:text-red-400 hover:bg-red-500/10" : "text-[#57534E] hover:text-red-500 hover:bg-red-500/10"
        )}>
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn(collapsed && "hidden")}>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay — pure CSS transition, no blur */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar — CSS translateX transition, no spring */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] shadow-2xl transition-transform duration-200 ease-out lg:hidden will-change-transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Desktop sidebar - icon-only when collapsed */}
      <aside
        className={cn(
          "hidden lg:block flex-shrink-0 h-full sticky top-0 transition-all duration-200 ease-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn("h-full", isCollapsed ? "w-16" : "w-64")}>
          {sidebarContent(isCollapsed)}
        </div>
      </aside>

      {/* Collapsed hover popup — portal to body for proper z-index */}
      {isCollapsed && hoveredSection && (() => {
        const section = sections.find(s => s.label === hoveredSection)
        if (!section) return null
        const filtered = section.items.filter(item => {
          if (user.role === 'teacher' && item.path === '/teacher/timetable') return !!(user.sectionId || user.classIds?.length)
          return true
        })
        if (filtered.length === 0) return null
        return createPortal(
          <motion.div
            key={section.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={() => handleSectionEnter(section.label)}
            onMouseLeave={handleSectionLeave}
            style={{ position: 'fixed', left: 72, top: popupPos.top, zIndex: 9999 }}
            className={cn(
              "w-56 rounded-xl border shadow-xl py-2",
              isDark
                ? "border-white/10 bg-[#1C1B1A] text-white"
                : "border-black/10 bg-[#FAF8F6] text-[#57534E]"
            )}
          >
            <p className={cn(
              "text-[10px] font-semibold uppercase tracking-widest px-3 pb-1 mb-1 border-b",
              isDark ? "text-[#8C8884]/60 border-white/10" : "text-[#57534E]/60 border-black/10"
            )}>
              {section.label}
            </p>
            {filtered.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${user.role}`}
                onClick={() => { playNavSound(); setMobileOpen(false) }}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? isDark
                      ? "bg-gradient-to-r from-[#EC8037]/85 to-[#D96A2C]/85 text-[#3A2E28] shadow-md shadow-[#EC8037]/20"
                      : "bg-[#EC8037]/85 text-[#3A2E28] shadow-md shadow-[#EC8037]/20"
                    : isDark
                      ? "text-[#8C8884] hover:bg-white/10 hover:text-[#F2F0EE]"
                      : "text-[#57534E] hover:bg-[#EC8037]/15 hover:text-[#EC8037]"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </motion.div>,
          document.body
        )
      })()}
    </>
  )
}
