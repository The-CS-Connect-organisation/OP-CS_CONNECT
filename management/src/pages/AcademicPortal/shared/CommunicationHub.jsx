import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, MessagesSquare, Users, Search, MessageCircle } from 'lucide-react';
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
  const useApi = !!token && isMongoId(user?.id);

  useEffect(() => {
    if (!useApi) { setApiContacts(null); return; }
    let cancelled = false;
    (async () => {
      try {
        setContactsError(null);
        const wantStudents = user.role === 'admin' || user.role === 'teacher';
        const [tRes, sRes] = await Promise.all([
          request('/school/teachers?limit=200'),
          wantStudents ? request('/school/students?limit=200') : Promise.resolve({ items: [] }),
        ]);
        if (cancelled) return;
        const teachers = (tRes.items || []).map((p) => mapProfileToContact(p, 'teacher')).filter(Boolean);
        const students = (sRes.items || []).map((p) => mapProfileToContact(p, 'student')).filter(Boolean);
        setApiContacts([...teachers, ...students]);
      } catch (e) {
        if (!cancelled) { setContactsError(e?.message || 'Could not load contacts'); setApiContacts([]); }
      }
    })();
    return () => { cancelled = true; };
  }, [useApi, user?.role]);

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
    let list;
    if (useApi && apiContacts) {
      list = apiContacts.filter((c) => c.id !== selfId);
    } else {
      list = localUsers.filter((u) => u.id !== selfId && (u.role === 'teacher' || u.role === 'student' || u.role === 'parent'));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.role.includes(q));
    }

    // Sort: recent chats first
    const recentIds = new Set(recentChats.map(r => r.id));
    const recent = [];
    const others = [];
    list.forEach(c => {
      if (recentIds.has(c.id)) recent.push(c);
      else others.push(c);
    });
    // Sort recent by lastChatAt
    recent.sort((a, b) => {
      const aTime = recentChats.find(r => r.id === a.id)?.lastChatAt || 0;
      const bTime = recentChats.find(r => r.id === b.id)?.lastChatAt || 0;
      return bTime - aTime;
    });

    return [...recent, ...others];
  }, [useApi, apiContacts, localUsers, user.id, searchQuery, recentChats]);

  const recentContactIds = new Set(recentChats.map(r => r.id));

  const roleColor = (role) => {
    if (role === 'teacher') return '#a855f7';
    if (role === 'student') return '#3b82f6';
    return '#10b981';
  };

  return (
    <div className="space-y-5 max-w-[900px] mx-auto w-full pt-2 pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Messages
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
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
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#8e8e8e' }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-colors focus:border-black/20"
            style={{ background: '#fafafa', color: '#262626', borderColor: '#efefef' }}
          />
        </div>
      </motion.div>

      {/* Recent Chats Section */}
      {recentChats.length > 0 && !searchQuery && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: '#8e8e8e' }}>
            Recent
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentChats.slice(0, 8).map((rc) => {
              const contact = contacts.find(c => c.id === rc.id) || rc;
              return (
                <motion.button
                  key={rc.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChatOpen(contact)}
                  className="flex flex-col items-center gap-1.5 min-w-[60px] cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg relative"
                    style={{ background: roleColor(rc.role) }}>
                    {rc.name?.charAt(0)}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-[11px] font-medium truncate w-16 text-center" style={{ color: '#262626' }}>
                    {rc.name?.split(' ')[0]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Contact List */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden border" style={{ borderColor: '#efefef' }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#fafafa', borderBottom: '1px solid #efefef' }}>
          <span className="text-sm font-semibold" style={{ color: '#262626' }}>
            All Contacts
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#efefef', color: '#8e8e8e' }}>
            {contacts.length}
          </span>
        </div>

        {contacts.length === 0 ? (
          <div className="py-16 flex items-center justify-center" style={{ background: '#ffffff' }}>
            <p className="text-sm" style={{ color: '#8e8e8e' }}>
              {searchQuery ? 'No contacts found.' : 'No contacts available.'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#ffffff' }}>
            {contacts.map((contact, i) => {
              const isRecent = recentContactIds.has(contact.id);
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-black/[0.02] cursor-pointer group"
                  style={{ borderBottom: '1px solid #fafafa' }}
                  onClick={() => handleChatOpen(contact)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative"
                      style={{ background: roleColor(contact.role) }}>
                      {contact.name.charAt(0)}
                      {isRecent && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#262626' }}>{contact.name}</p>
                      <p className="text-[12px] capitalize" style={{ color: '#8e8e8e' }}>
                        {contact.role}{contact.class ? ` · ${contact.class}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleChatOpen(contact); }}
                      className="p-2 rounded-full border transition-all hover:bg-black/[0.03] cursor-pointer"
                      style={{ borderColor: '#efefef' }}>
                      <MessageCircle size={16} style={{ color: '#3b82f6' }} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCallState({ isOpen: true, otherUser: contact, preferVideo: true }); }}
                      className="p-2 rounded-full border transition-all hover:bg-black/[0.03] cursor-pointer"
                      style={{ borderColor: '#efefef' }}>
                      <PhoneCall size={16} style={{ color: '#262626' }} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {contactsError && (
        <p className="text-xs text-red-500 text-center">{contactsError}</p>
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
