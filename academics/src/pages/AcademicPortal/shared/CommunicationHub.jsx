import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, MessageCircle, Video, Menu } from 'lucide-react';
import { ChatView } from '../../../components/messaging/ChatView';
import { CallModal } from '../../../components/messaging/CallModal';
import { IncomingCallOverlay } from '../../../components/messaging/IncomingCallOverlay';
import { useStore } from '../../../hooks/useStore';
import { KEYS, getFromStorage } from '../../../data/schema';
import { request } from '../../../utils/apiClient';
import { useStreamChat } from '../../../hooks/useStreamChat';

const mapProfileToContact = (profile, role) => {
  const u = profile.userId;
  const id = u?._id != null ? String(u._id) : profile.userId != null ? String(profile.userId) : null;
  if (!id) return null;
  const name = u?.name || (role === 'student' ? 'Student' : 'Teacher');
  const classLabel =
    role === 'student' && profile.grade != null
      ? `-`.replace(/-$/, '')
      : undefined;
  return { id, name, role, ...(classLabel ? { class: classLabel } : {}) };
};

const ROLE_COLORS = {
  teacher: { bg: '#a855f7', light: 'rgba(168, 85, 247, 0.1)' },
  student: { bg: '#3b82f6', light: 'rgba(59, 130, 246, 0.1)' },
  parent: { bg: '#10b981', light: 'rgba(16, 185, 129, 0.1)' },
  admin: { bg: '#f59e0b', light: 'rgba(245, 158, 11, 0.1)' },
};

const getRoleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.student;

export const CommunicationHub = ({ user }) => {
  const { data: localUsers } = useStore(KEYS.USERS, []);
  const [apiContacts, setApiContacts] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [callState, setCallState] = useState({ isOpen: false, otherUser: null, preferVideo: true, initiator: true });
  const [incomingCall, setIncomingCall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  
  const [recentChats, setRecentChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cornerstone_recent_chats') || '[]'); } catch { return []; }
  });

  const { client, isConnected } = useStreamChat(user);
  const token = typeof window !== 'undefined' ? getFromStorage(KEYS.AUTH_TOKEN) : null;
  const useApi = !!token && !!user?.id; // Removed broken isMongoId check

  // Load Contacts
  useEffect(() => {
    if (!useApi) { setApiContacts(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const wantStudents = user.role === 'admin' || user.role === 'teacher' || user.role === 'student';
        const [tRes, sRes] = await Promise.all([
          request('/school/teachers?limit=200'),
          wantStudents ? request('/school/students?limit=200') : Promise.resolve({ items: [] }),
        ]);
        if (cancelled) return;
        const teachers = (tRes.items || []).map((p) => mapProfileToContact(p, 'teacher')).filter(Boolean);
        const students = (sRes.items || []).map((p) => mapProfileToContact(p, 'student')).filter(Boolean);
        setApiContacts([...teachers, ...students]);
      } catch (e) {
        if (!cancelled) setApiContacts([]);
      }
    })();
    return () => { cancelled = true; };
  }, [useApi, user?.role]);

  // Poll for Incoming Calls
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      if (callState.isOpen || incomingCall) return;
      // Search all keys for an offer directed at us
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sms_call_signals:')) {
          try {
            const signals = JSON.parse(localStorage.getItem(key) || '[]');
            const offer = signals.slice().reverse().find(s => s.type === 'offer' && s.fromUserId !== user.id);
            if (offer) {
              // check if it's within the last 15 seconds
              const age = Date.now() - new Date(offer.createdAt).getTime();
              if (age < 15000) {
                // Find caller info
                const caller = contacts.find(c => String(c.id) === String(offer.fromUserId));
                if (caller) {
                  setIncomingCall({ ...caller, callerName: caller.name });
                } else {
                  setIncomingCall({ id: offer.fromUserId, name: 'User', role: 'student', callerName: 'User' });
                }
              }
            }
          } catch {}
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user?.id, callState.isOpen, incomingCall]);

  const handleChatOpen = (contact) => {
    setRecentChats(prev => {
      const filtered = prev.filter(c => c.id !== contact.id);
      const updated = [{ id: contact.id, name: contact.name, role: contact.role, class: contact.class, lastChatAt: Date.now() }, ...filtered].slice(0, 20);
      localStorage.setItem('cornerstone_recent_chats', JSON.stringify(updated));
      return updated;
    });
    setChatUser(contact);
    setShowSidebarOnMobile(false);
  };

  const contacts = useMemo(() => {
    const selfId = String(user.id);
    let list = useApi && apiContacts 
      ? apiContacts.filter((c) => String(c.id) !== selfId)
      : localUsers.filter((u) => String(u.id) !== selfId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.role.includes(q));
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
  }, [useApi, apiContacts, localUsers, user.id, searchQuery, recentChats]);

  return (
    <div className="w-full h-[calc(100vh-100px)] max-h-[800px] mx-auto p-4 md:p-6 lg:p-8 flex justify-center">
      
      {/* Container with Glassmorphism */}
      <div 
        className="w-full max-w-[1200px] h-full rounded-3xl overflow-hidden flex relative shadow-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
        }}
      >
        {/* Sidebar */}
        <div className={w-full md:w-[360px] flex-shrink-0 flex flex-col transition-all duration-300 }>
          {/* Sidebar Header */}
          <div className="px-6 py-5 border-b border-white/20 bg-white/10 backdrop-blur-md">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Messages</h1>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {isConnected ? <span className="text-emerald-500 font-medium tracking-wide">? Connected</span> : 'Connecting...'}
            </div>
            
            <div className="mt-4 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all duration-200"
                style={{ 
                  background: 'rgba(255,255,255,0.4)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-6 p-2">
            {contacts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Users size={32} className="mb-2" />
                <p className="text-sm font-medium">No contacts found</p>
              </div>
            ) : (
              contacts.map((contact) => {
                const isActive = chatUser?.id === contact.id;
                const colors = getRoleColor(contact.role);
                return (
                  <motion.div
                    key={contact.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChatOpen(contact)}
                    className={lex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 mb-1 border }
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                        style={{ background: colors.bg }}>
                        {contact.name.charAt(0)}
                      </div>
                      {/* Active indicator */}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white/80 shadow-sm" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                      <p className="text-xs truncate opacity-70 capitalize flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 rounded-md font-medium" style={{ background: colors.light, color: colors.bg }}>
                          {contact.role}
                        </span>
                        {contact.class && <span>· {contact.class}</span>}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={lex-1 flex flex-col bg-white/40  relative}>
          {chatUser ? (
            <ChatView
              isOpen={true}
              onClose={() => setShowSidebarOnMobile(true)}
              currentUser={user}
              otherUser={chatUser}
              onStartCall={({ otherUser, preferVideo }) => setCallState({ isOpen: true, otherUser, preferVideo, initiator: true })}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-white/50 flex items-center justify-center mb-4 bg-white/20 shadow-inner">
                <MessageCircle size={32} className="opacity-50" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Your Messages</h2>
              <p className="text-sm opacity-60 mt-1">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CallModal
        isOpen={callState.isOpen}
        onClose={() => setCallState({ isOpen: false, otherUser: null, preferVideo: true, initiator: true })}
        currentUser={user}
        otherUser={callState.otherUser}
        preferVideo={callState.preferVideo}
        initiator={callState.initiator}
      />
      
      <IncomingCallOverlay
        isOpen={!!incomingCall}
        callData={incomingCall}
        onAccept={() => {
          setCallState({ isOpen: true, otherUser: incomingCall, preferVideo: true, initiator: false });
          setIncomingCall(null);
        }}
        onDecline={() => {
          setIncomingCall(null);
        }}
      />
    </div>
  );
};
