"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ROLE_COLORS = {
  teacher: { bg: '#a855f7', text: '#ffffff' },
  student: { bg: '#3b82f6', text: '#ffffff' },
  parent: { bg: '#10b981', text: '#ffffff' },
  admin: { bg: '#f59e0b', text: '#ffffff' },
  driver: { bg: '#6366f1', text: '#ffffff' },
};

const getRoleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.student;

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getGradientColors(role) {
  const colors = {
    teacher: { from: '#a855f7', to: '#7c3aed', light: 'rgba(168,85,247,0.15)' },
    student: { from: '#3b82f6', to: '#1d4ed8', light: 'rgba(59,130,246,0.15)' },
    parent: { from: '#10b981', to: '#059669', light: 'rgba(16,185,129,0.15)' },
    admin: { from: '#f59e0b', to: '#d97706', light: 'rgba(245,158,11,0.15)' },
    driver: { from: '#6366f1', to: '#4338ca', light: 'rgba(99,102,241,0.15)' },
  };
  return colors[role] || colors.student;
}

export function MessageDock({
  user,
  onDockToggle,
  className,
  expandedWidth = 448,
  position = "bottom",
  theme = "dark",
  enableAnimations = true,
  autoFocus = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  closeOnSend = true,
}) {
  const shouldReduceMotion = useReducedMotion();
  const [expandedContact, setExpandedContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [recentContacts, setRecentContacts] = useState([]);
  const dockRef = useRef(null);
  const [collapsedWidth, setCollapsedWidth] = useState(266);
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();

  // Load recent contacts from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cornerstone_recent_chats') || '[]');
      setRecentContacts(stored.slice(0, 4));
    } catch {
      setRecentContacts([]);
    }
  }, []);

  // Also listen for storage changes (from CommunicationHub)
  useEffect(() => {
    const handler = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('cornerstone_recent_chats') || '[]');
        setRecentContacts(stored.slice(0, 4));
      } catch {
        setRecentContacts([]);
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('cornerstone_chats_updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('cornerstone_chats_updated', handler);
    };
  }, []);

  useEffect(() => {
    if (dockRef.current && !hasInitialized) {
      const width = dockRef.current.offsetWidth;
      if (width > 0) {
        setCollapsedWidth(width);
        setHasInitialized(true);
      }
    }
  }, [hasInitialized]);

  useEffect(() => {
    if (!closeOnClickOutside) return;
    const handleClickOutside = (event) => {
      if (dockRef.current && !dockRef.current.contains(event.target)) {
        setExpandedContact(null);
        setMessageInput("");
        onDockToggle?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOnClickOutside, onDockToggle]);

  const handleContactClick = (index) => {
    const contact = recentContacts[index];
    if (!contact) return;
    if (expandedContact === index) {
      setExpandedContact(null);
      setMessageInput("");
      onDockToggle?.(false);
    } else {
      setExpandedContact(index);
      onDockToggle?.(true);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || expandedContact === null) return;
    const contact = recentContacts[expandedContact];
    if (!contact) return;

    // Navigate to comms page and dispatch message to CommunicationHub
    navigate(`/${user.role}/comms`);

    // Small delay to let navigation complete, then open chat
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('cornerstone_open_chat', {
        detail: { contact, message: messageInput.trim() }
      }));
    }, 100);

    setMessageInput("");
    if (closeOnSend) {
      setExpandedContact(null);
      onDockToggle?.(false);
    }
  };

  const selectedContact = expandedContact !== null ? recentContacts[expandedContact] : null;
  const isExpanded = expandedContact !== null;

  const getGradientColorsFn = (contact) => getGradientColors(contact?.role || 'student');
  const gradientStr = isExpanded && selectedContact
    ? `linear-gradient(135deg, ${getGradientColorsFn(selectedContact).from}30, ${getGradientColorsFn(selectedContact).to}20)`
    : undefined;

  const positionClasses = position === "top"
    ? "fixed top-6 left-1/2 -translate-x-1/2 z-50"
    : "fixed bottom-6 left-1/2 -translate-x-1/2 z-50";

  const dockBg = theme === "dark" ? "bg-zinc-900" : "bg-white";
  const dockBorder = theme === "dark" ? "border-white/10" : "border-gray-200";
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const mutedText = theme === "dark" ? "text-white/40" : "text-gray-400";
  const inputText = theme === "dark" ? "text-white" : "text-gray-800";
  const inputPlaceholder = theme === "dark" ? "placeholder:text-white/30" : "placeholder:text-gray-400";

  return (
    <motion.div
      ref={dockRef}
      className={cn(positionClasses, className)}
      initial={enableAnimations ? { opacity: 0, y: 100, scale: 0.8 } : {}}
      animate={enableAnimations ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={cn("rounded-full px-4 py-2 shadow-2xl border", dockBg, dockBorder)}
        animate={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          background: gradientStr || dockBg,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-2 relative">
          {/* Separator */}
          <motion.div
            className="w-px h-6 bg-white/10 mx-1"
            animate={{ opacity: isExpanded ? 0 : 1 }}
          />

          {/* Contact buttons */}
          {recentContacts.length === 0 ? (
            <motion.div
              animate={{ opacity: isExpanded ? 0 : 1 }}
              className="flex items-center gap-2"
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", theme === "dark" ? "bg-zinc-800 text-zinc-500" : "bg-gray-100 text-gray-400")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className={cn("text-xs", mutedText)}>No recent chats</span>
            </motion.div>
          ) : (
            recentContacts.map((contact, index) => {
              const isSelected = expandedContact === index;
              const colors = getRoleColor(contact.role);
              return (
                <motion.div
                  key={contact.id}
                  className={cn("relative", isSelected && isExpanded && "absolute left-1 top-1 z-20")}
                  style={isSelected && isExpanded ? { width: 0, minWidth: 0, overflow: "visible" } : {}}
                  animate={{
                    opacity: isExpanded && !isSelected ? 0 : 1,
                    y: isExpanded && !isSelected ? 60 : 0,
                    scale: isExpanded && !isSelected ? 0.8 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <motion.button
                    className={cn(
                      "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer",
                      isSelected && isExpanded ? "text-white shadow-lg" : "text-white"
                    )}
                    style={!isSelected || !isExpanded ? { background: colors.bg } : {}}
                    onClick={() => handleContactClick(index)}
                    whileHover={!isExpanded ? { scale: 1.05, y: -4 } : { scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getInitials(contact.name)}
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"
                      style={{ opacity: isExpanded && !isSelected ? 0 : 1 }}
                    />
                  </motion.button>
                </motion.div>
              );
            })
          )}

          {/* Text input */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                  if (e.key === "Escape" && closeOnEscape) {
                    setExpandedContact(null);
                    setMessageInput("");
                    onDockToggle?.(false);
                  }
                }}
                placeholder={`Message ${selectedContact?.name?.split(' ')[0] || ""}...`}
                className={cn(
                  "w-[300px] absolute left-14 right-0 bg-transparent border-none outline-none text-sm font-medium z-50",
                  inputText, inputPlaceholder
                )}
                autoFocus={autoFocus}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
              />
            )}
          </AnimatePresence>

          {/* Separator */}
          <motion.div
            className="w-px h-6 bg-white/10 mx-1"
            animate={{ opacity: isExpanded ? 0 : 1 }}
          />

          {/* Send button */}
          <div className={cn("flex items-center justify-center z-20", isExpanded && "absolute right-0")}>
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.button
                  key="menu"
                  className="w-12 h-12 flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={mutedText}>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  onClick={handleSendMessage}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer",
                    theme === "dark" ? "bg-white/90 hover:bg-white" : "bg-gray-900 hover:bg-gray-800"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={!messageInput.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme === "dark" ? "#18181b" : "white"} strokeWidth="2">
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
