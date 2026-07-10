import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useThemeStore, useNotificationStore, useSidebarStore } from '@/lib/store'
import { cn, getGreeting } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { navSections } from '@/lib/nav-config'
import {
  Bell, Search, Sparkles, Menu,
  Inbox,
  X, Check, AlertCircle, Info, CheckCircle2, GraduationCap, ArrowRight,
  User, Settings, LogOut
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import StarWarsToggle from '@/components/ui/star-wars-toggle-switch'
import styled from 'styled-components'

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const { isMobileOpen, setMobileOpen } = useSidebarStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const [genFocused, setGenFocused] = useState(false)

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

  if (!user) return null

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

  const StyledGenBtn = styled.button`
    --border-radius: 24px;
    --padding: 4px;
    --transition: 0.4s;
    --button-color: #101010;
    --highlight-color-hue: 210deg;

    user-select: none;
    display: flex;
    align-items: center;
    padding: 0.3em 0.5em 0.3em 0.8em;
    font-family: "Poppins", "Inter", "Segoe UI", sans-serif;
    font-size: 0.85em;
    font-weight: 400;
    background-color: var(--button-color);
    box-shadow:
      inset 0px 1px 1px rgba(255,255,255,0.2),
      inset 0px 2px 2px rgba(255,255,255,0.15),
      inset 0px 4px 4px rgba(255,255,255,0.1),
      inset 0px 8px 8px rgba(255,255,255,0.05),
      inset 0px 16px 16px rgba(255,255,255,0.05),
      0px -1px 1px rgba(0,0,0,0.02),
      0px -2px 2px rgba(0,0,0,0.03),
      0px -4px 4px rgba(0,0,0,0.05),
      0px -8px 8px rgba(0,0,0,0.06),
      0px -16px 16px rgba(0,0,0,0.08);
    border: solid 1px #fff2;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: box-shadow var(--transition), border var(--transition), background-color var(--transition);
    position: relative;

    .btn-svg {
      height: 20px;
      fill: #e8e8e8;
      animation: flicker 2s linear infinite;
      animation-delay: 0.5s;
      filter: drop-shadow(0 0 2px #fff9);
      transition: fill var(--transition), filter var(--transition);
    }
    @keyframes flicker {
      50% { opacity: 0.3; }
    }

    .txt-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 5em;
    }
    .txt-1, .txt-2 {
      position: absolute;
      word-spacing: -1em;
    }
    .txt-2 { opacity: 0; }

    .btn-letter {
      display: inline-block;
      color: #fff5;
      animation: letter-anim 2s ease-in-out infinite;
      transition: color var(--transition), text-shadow var(--transition);
    }
    @keyframes letter-anim {
      50% { text-shadow: 0 0 3px #fff8; color: #fff; }
    }

    &[data-focused="true"] .txt-1 {
      animation: opacity-anim 0.3s ease-in-out forwards;
      animation-delay: 1s;
    }
    &[data-focused="true"] .txt-2 {
      animation: opacity-anim 0.3s ease-in-out reverse forwards;
      animation-delay: 1s;
    }
    @keyframes opacity-anim {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }

    &[data-focused="true"] .btn-letter {
      animation: focused-letter-anim 1s ease-in-out forwards, letter-anim 1.2s ease-in-out infinite;
      animation-delay: 0s, 1s;
    }
    @keyframes focused-letter-anim {
      0%,100% { filter: blur(0px); }
      50% { transform: scale(2); filter: blur(10px) brightness(150%) drop-shadow(-36px 12px 12px hsl(var(--highlight-color-hue),100%,70%)); }
    }
    &[data-focused="true"] .btn-svg {
      animation-duration: 1.2s;
      animation-delay: 0.2s;
    }

    &:hover {
      border: solid 1px hsla(var(--highlight-color-hue),100%,80%,40%);
      .btn-svg { fill: #fff; filter: drop-shadow(0 0 3px hsl(var(--highlight-color-hue),100%,70%)) drop-shadow(0 -4px 6px #0009); animation: none; }
    }

    &:active {
      border: solid 1px hsla(var(--highlight-color-hue),100%,80%,70%);
      background-color: hsla(var(--highlight-color-hue),50%,20%,0.5);
      .btn-letter { text-shadow: 0 0 1px hsla(var(--highlight-color-hue),100%,90%,90%); animation: none; }
    }
  `

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
          <img src="/favicon.png" alt="CS Connect" className="w-7 h-7" />
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

          <div className="relative" ref={avatarMenuRef}>
            <StyledGenBtn
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              className="btn"
              data-focused={genFocused}
            >
              <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <div className="txt-wrapper">
                <div className="txt-1">
                  {'Generate'.split('').map((ch, i) => (
                    <span key={i} className="btn-letter" style={{ animationDelay: `${i * 0.08}s` }}>{ch}</span>
                  ))}
                </div>
                <div className="txt-2">
                  {'Generating'.split('').map((ch, i) => (
                    <span key={i} className="btn-letter" style={{ animationDelay: `${i * 0.08}s` }}>{ch}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
                <Avatar src={user.avatar} alt={user.name} fallback={user.name.split(' ').map((n: string) => n[0]).join('')} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-white leading-tight">{user.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-white/60 capitalize leading-tight">{user.role}</p>
                </div>
              </div>
            </StyledGenBtn>
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
