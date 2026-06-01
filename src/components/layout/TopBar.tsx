import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore, useNotificationStore, useSidebarStore } from '@/lib/store'
import { cn, getGreeting } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { navSections } from '@/lib/nav-config'
import {
  Bell, Search, Sparkles, Menu,
  X, Check, AlertCircle, Info, CheckCircle2, GraduationCap, ArrowRight,
  User, Settings, LogOut
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import StarWarsToggle from '@/components/ui/star-wars-toggle-switch'

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const { isMobileOpen, toggle, setMobileOpen } = useSidebarStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  if (!user) return null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault(); setShowSearch(true)
      }
      if (e.key === 'Escape') setShowSearch(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 100)
  }, [showSearch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchModalRef.current && !searchModalRef.current.contains(e.target as Node)) setShowSearch(false)
    }
    if (showSearch) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSearch])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setShowAvatarMenu(false)
    }
    if (showAvatarMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAvatarMenu])

  const allLinks = (navSections[user.role] || []).flatMap(s =>
    s.items.map(item => ({ ...item, section: s.label }))
  )

  const filteredLinks = searchQuery.trim()
    ? allLinks.filter(l =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const notifIcon = {
    info: <Info className="w-4 h-4 text-orange-500" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  }

  return (
    <header className="sticky top-0 z-30 glass-topbar">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!isMobileOpen)} className="p-2 rounded-md hover:bg-accent/50 lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={toggle} className="p-2 rounded-md hover:bg-accent/50 hidden lg:block">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="hidden lg:block h-4 w-px bg-border/50" />
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-foreground">
              {getGreeting()}, <span className="font-semibold">{user.name.split(' ')[0]}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Search trigger button (mobile) + search bar (desktop) */}
        <button
          onClick={() => setShowSearch(true)}
          className="lg:hidden p-2 rounded-md hover:bg-accent/50"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <button
              onClick={() => setShowSearch(true)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm text-left text-muted-foreground hover:bg-secondary/70 transition-all cursor-pointer"
            >
              Search anything...
            </button>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
              ⌘+Space
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 lg:gap-2.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600/15 to-amber-600/15 border border-orange-500/20 text-orange-500 shadow-sm hover:shadow-md hover:from-orange-600/25 hover:to-amber-600/25 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">AI</span>
          </motion.button>

          <div className="flex items-center -mr-2">
            <StarWarsToggle checked={isDark} onChange={toggleTheme} scale={0.35} />
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-secondary/60 border border-border/50 shadow-sm hover:bg-accent/80 transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={() => markAllAsRead()} className="text-xs text-primary hover:underline">Mark all read</button>
                      )}
                      <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn("flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/30 last:border-0", !notif.read && "bg-primary/5")}
                      >
                        <div className="mt-0.5">{notifIcon[notif.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                        </div>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={avatarMenuRef}>
            <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="flex items-center gap-2 ml-1">
              <Avatar src={user.avatar} alt={user.name} fallback={user.name.split(' ').map((n: string) => n[0]).join('')} size="sm" />
            </button>
            <AnimatePresence>
              {showAvatarMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b border-border/30 mb-1">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                    </div>
                    <button
                      onClick={() => { navigate(`/${user.role}`); setShowAvatarMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => { navigate(`/${user.role}/profile`); setShowAvatarMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm hover:bg-accent/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </button>
                    <div className="border-t border-border/30 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); navigate('/login'); setShowAvatarMenu(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-3"
          >
            <motion.div
              ref={searchModalRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-lg bg-card rounded-2xl border shadow-2xl overflow-hidden"
            >
              <div className="relative border-b">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-sm focus:outline-none"
                />
                <button onClick={() => setShowSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-accent">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {searchQuery.trim() && filteredLinks.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                )}
                {!searchQuery.trim() && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <p>Start typing to search pages</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
                      <span>navigate</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">⏎</kbd>
                      <span>open</span>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">Esc</kbd>
                      <span>close</span>
                    </div>
                  </div>
                )}
                {filteredLinks.length > 0 && (
                  <div>
                    {filteredLinks.map((link, i) => (
                      <button
                        key={link.path}
                        onClick={() => { navigate(link.path); setShowSearch(false); setSearchQuery('') }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                          <link.icon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{link.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.section} • {link.path}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
