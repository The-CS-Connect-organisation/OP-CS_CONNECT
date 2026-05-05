import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, MessagesSquare, Users, Search, MessageCircle, Video, X } from 'lucide-react';
import { ChatModal } from '../../../components/messaging/ChatModal';
import { CallModal } from '../../../components/messaging/CallModal';
import { useStore } from '../../../hooks/useStore';
import { KEYS, getFromStorage } from '../../../data/schema';
import { request } from '../../../utils/apiClient';
import { isMongoId } from '../../../utils/socketClient';
import { useStreamChat, sanitizeId } from '../../../hooks/useStreamChat';

const mapProfileToContact = (profile, role) => {
  const u = profile.userId;
  const id = u?._id != null ? String(u._id) : profile.userId != null ? String(profile.userId) : null;
  if (!id) return null;
  const name = u?.name || (role === 'student' ? 'Student' : 'Teacher');
  const classLabel =
    role === 'student' && profile.grade != null
      ? `${profile.grade}-${profile.section || ''}`.replace(/-$/, '')
      : undefined;
  return { id, name, role, ...(classLabel ? { class: classLabel } : {}) };
};

// Subject color mapping for avatars
const ROLE_COLORS = {
  teacher: { bg: '#a855f7', light: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)' },
  student: { bg: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
  parent: { bg: '#10b981', light: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
  admin: { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
};

const getRoleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.student;

export const CommunicationHub = ({ user }) => {
  const { data: localUsers } = useStore(KEYS.USERS, []);
  const [apiContacts, setApiContacts] = useState(null);
  const [contactsError, setContactsError] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [callState, setCallState] = useState({ isOpen: false, otherUser: null, preferVideo: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChats, setRecentChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cornerstone_recent_chats') || '[]'); } catch { return []; }
  });

  // Connect to GetStream
  const { client, isConnected } = useStreamChat(user);

  const token = typeof window !== 'undefined' ? getFromStorage(KEYS.AUTH_TOKEN) : null;
  // Use API if we have a token — Firebase IDs are not UUIDs so we don't check format
  const useApi = !!token && !!user?.id;

  useEffect(() => {
    if (!user?.id) { setApiContacts(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setContactsError(null);
        // Fetch all users and filter out self
        const res = await request('/school/users?limit=500');
        if (cancelled) return;
        const users = (res.users || res.items || res || [])
          .filter(u => u.id !== user.id && ['teacher', 'student', 'parent', 'admin'].includes(u.role))
          .map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email }));
        setApiContacts(users);
      } catch (e) {
        if (!cancelled) { setContactsError(e?.message || 'Could not load contacts'); setApiContacts([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  // Track recent chats
  const recordRecentChat = useCallback((contact) => {
    setRecentChats(prev => {
      const filtered = prev.filter(c => c.id !== contact.id);
      const updated = [{ id: contact.id, name: contact.name, role: contact.role, class: contact.class, lastChatAt: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem('cornerstone_recent_chats', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleChatOpen = (contact) => {
    recordRecentChat(contact);
    setChatUser(contact);
  };

  const contacts = useMemo(() => {
    const selfId = user.id;
    let list = (apiContacts || []).filter((c) => c.id !== selfId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name?.toLowerCase().includes(q) || c.role?.includes(q));
    }

    const recentIds = new Set(recentChats.map(r => r.id));
    const recent = [];
    const others = [];
    list.forEach(c => {
      if (recentIds.has(c.id)) recent.push(c);
      else others.push(c);
    });
    recent.sort((a, b) => {
      const aTime = recentChats.find(r => r.id === a.id)?.lastChatAt || 0;
      const bTime = recentChats.find(r => r.id === b.id)?.lastChatAt || 0;
      return bTime - aTime;
    });

    return [...recent, ...others];
  }, [apiContacts, user.id, searchQuery, recentChats]);

  const recentContactIds = new Set(recentChats.map(r => r.id));

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto w-full pt-2 pb-12">
      {/* ── Header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(255, 107, 157, 0.08)', color: '#ff6b9d', border: '1px solid rgba(255, 107, 157, 0.20)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1 h-10 rounded-full bg-black" />
            Messages
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {isConnected ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected · {contacts.length} contacts
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Connecting...
              </span>
            )}
          </p>
        </div>
        
        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="nova-card p-3 min-w-[100px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Teachers</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {contacts.filter(c => c.role === 'teacher').length}
            </p>
          </div>
          <div className="nova-card p-3 min-w-[100px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Students</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {contacts.filter(c => c.role === 'student').length}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none transition-all duration-200 focus:border-black/20 focus:shadow-sm"
            style={{ 
              background: 'var(--bg-surface)', 
              color: 'var(--text-primary)', 
              borderColor: 'var(--border-default)',
              boxShadow: 'var(--shadow-glow)'
            }}
          />
        </div>
      </motion.div>

      {/* ── Recent Chats Section ── */}
      {recentChats.length > 0 && !searchQuery && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
            Recent Conversations
          </p>
          <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
            {recentChats.slice(0, 8).map((rc, idx) => {
              const contact = contacts.find(c => c.id === rc.id) || rc;
              const colors = getRoleColor(rc.role);
              return (
                <motion.button
                  key={rc.id}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChatOpen(contact)}
                  className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg relative transition-all duration-300 group-hover:shadow-lg"
                    style={{ 
                      background: colors.bg,
                      boxShadow: `0 4px 15px ${colors.bg}40`
                    }}
                  >
                    {rc.name?.charAt(0)}
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-[11px] font-medium truncate w-20 text-center" style={{ color: 'var(--text-secondary)' }}>
                    {rc.name?.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Contact List ── */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
        className="nova-card rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            All Contacts
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" 
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {contacts.length}
          </span>
        </div>

        {contacts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center" style={{ background: 'var(--bg-surface)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-elevated)' }}>
              <Users size={28} className="text-[var(--text-dim)]" />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery ? 'No contacts found.' : 'No contacts available.'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-surface)' }}>
            {contacts.map((contact, i) => {
              const isRecent = recentContactIds.has(contact.id);
              const colors = getRoleColor(contact.role);
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  whileHover={{ background: 'var(--bg-elevated)' }}
                  className="flex items-center justify-between px-5 py-3.5 transition-all duration-200 cursor-pointer group border-b last:border-0"
                  style={{ borderColor: 'var(--border-default)' }}
                  onClick={() => handleChatOpen(contact)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative transition-all duration-300 group-hover:shadow-md"
                      style={{ 
                        background: colors.bg,
                        boxShadow: `0 2px 10px ${colors.bg}30`
                      }}
                    >
                      {contact.name.charAt(0)}
                      {isRecent && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                      <p className="text-[11px] capitalize flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: colors.light, color: colors.bg }}>
                          {contact.role}
                        </span>
                        {contact.class && <span>· {contact.class}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleChatOpen(contact); }}
                      className="p-2.5 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md"
                      style={{ 
                        borderColor: 'var(--border-default)',
                        background: 'var(--bg-surface)',
                        color: '#3b82f6'
                      }}>
                      <MessageCircle size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); setCallState({ isOpen: true, otherUser: contact, preferVideo: true }); }}
                      className="p-2.5 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md"
                      style={{ 
                        borderColor: 'var(--border-default)',
                        background: 'var(--bg-surface)',
                        color: '#10b981'
                      }}>
                      <Video size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {contactsError && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="nova-card p-4 text-center border-red-200"
        >
          <p className="text-sm text-red-500">{contactsError}</p>
        </motion.div>
      )}

      <ChatModal
        isOpen={!!chatUser}
        onClose={() => setChatUser(null)}
        currentUser={user}
        otherUser={chatUser}
        onStartCall={({ otherUser, preferVideo }) => setCallState({ isOpen: true, otherUser, preferVideo: preferVideo ?? true })}
      />
      <CallModal
        isOpen={callState.isOpen}
        onClose={() => setCallState({ isOpen: false, otherUser: null, preferVideo: true })}
        currentUser={user}
        otherUser={callState.otherUser}
        preferVideo={callState.preferVideo}
      />
    </div>
  );
};