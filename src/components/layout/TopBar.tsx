import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore, useNotificationStore, useSidebarStore } from '@/lib/store'
import { cn, getGreeting } from '@/lib/utils'
import {
  Bell, Search, Sparkles, Menu,
  X, Check, AlertCircle, Info, CheckCircle2, GraduationCap
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import StarWarsToggle from '@/components/ui/star-wars-toggle-switch'
import { Badge } from '@/components/ui/Badge'

export default function TopBar() {
  const { user } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const { toggle, setMobileOpen } = useSidebarStore()
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showSearch, setShowSearch] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  if (!user) return null

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
          <button onClick={toggle} className="p-2 rounded-md hover:bg-accent/50">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="hidden lg:block h-4 w-px bg-border/50" />
          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-foreground">
              {getGreeting()}, <span className="font-semibold">{user.name.split(' ')[0]}</span> 👋
            </h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search anything... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2.5">
          {/* AI Quick Access */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600/15 to-amber-600/15 border border-orange-500/20 text-orange-500 shadow-sm hover:shadow-md hover:from-orange-600/25 hover:to-amber-600/25 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">AI</span>
          </motion.button>

          {/* Theme Toggle - Star Wars BB-8 */}
          <div className="flex items-center -mr-2">
            <StarWarsToggle checked={isDark} onChange={toggleTheme} scale={0.35} />
          </div>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-secondary/60 border border-border/50 shadow-sm hover:bg-accent/80 transition-all duration-200 relative"
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
                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)}>
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          "flex items-start gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/30 last:border-0",
                          !notif.read && "bg-primary/5"
                        )}
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

          {/* User Avatar */}
          <div className="flex items-center gap-2 ml-1">
            <Avatar
              src={user.avatar}
              alt={user.name}
              fallback={user.name.split(' ').map(n => n[0]).join('')}
              size="sm"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
