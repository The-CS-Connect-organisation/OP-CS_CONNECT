import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, MessageCircle, Video, Phone, UserPlus,
  X, Check, Clock, Send, Bell, Settings, ChevronRight,
  Loader2, UserCheck, UserX, Sparkles, Hash
} from 'lucide-react';
import { ChatView } from '../../../components/messaging/ChatView';
import { CallModal } from '../../../components/messaging/CallModal';
import { IncomingCallOverlay } from '../../../components/messaging/IncomingCallOverlay';
import { KEYS, getFromStorage } from '../../../data/schema';
import { request } from '../../../utils/apiClient';
import { useStreamChat } from '../../../hooks/useStreamChat';

// ── Role colours ──────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  teacher: '#a855f7',
  student: '#3b82f6',
  parent:  '#10b981',
  admin:   '#f59e0b',
  driver:  '#ef4444',
};
const rc = (role) => ROLE_COLORS[role] || '#6b7280';

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, role, size = 44, online = false }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-md"
      style={{ background: rc(role), fontSize: size * 0.38 }}
    >
      {name?.charAt(0) || '?'}
    </div>
    {online && (
      <span
        className="absolute bottom-0 right-0 rounded-full border-2 border-white"
        style={{ width: size * 0.28, height: size * 0.28, background: '#22c55e' }}
      />
    )}
  </div>
);

// ── Glassmorphic panel ────────────────────────────────────────────────────────
const Glass = ({ children, className = '', style = {} }) => (
  <div
    className={className}
    style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.7)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const CommunicationHub = ({ user }) => {
  const [contacts, setContacts]           = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeTab, setActiveTab]         = useState('messages'); // 'messages' | 'requests' | 'explore'
  const [chatUser, setChatUser]           = useState(null);
  const [callState, setCallState]         = useState({ isOpen: false, otherUser: null, preferVideo: true, initiator: true });
  const [incomingCall, setIncomingCall]   = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_sent_requests') || '[]'); } catch { return []; }
  });
  const [recentChats, setRecentChats]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('cornerstone_recent_chats') || '[]'); } catch { return []; }
  });

  const { client, isConnected } = useStreamChat(user);

  // ── Load contacts ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoadingContacts(true);
    request('/school/users?limit=500')
      .then(res => {
        if (cancelled) return;
        const list = (res.users || res.items || [])
          .filter(u => String(u.id) !== String(user.id) && ['teacher','student','parent','admin','driver'].includes(u.role))
          .map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email, online: Math.random() > 0.4 }));
        setContacts(list);
      })
      .catch(() => { if (!cancelled) setContacts([]); })
      .finally(() => { if (!cancelled) setLoadingContacts(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Incoming call via socket ───────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    import('../../../utils/socketClient').then(({ getSocket }) => {
      const socket = getSocket();
      if (!socket) return;
      const handler = (data) => {
        if (data?.type === 'call:ring' && String(data?.fromUserId) !== String(user.id)) {
          if (callState.isOpen || incomingCall) return;
          setIncomingCall({
            id: data.fromUserId,
            name: data.callerName || 'Unknown',
            role: data.callerRole || 'student',
            callerName: data.callerName || 'Unknown',
            preferVideo: data.preferVideo ?? true,
          });
        }
      };
      socket.on('call:signal', handler);
      return () => socket.off('call:signal', handler);
    });
  }, [user?.id, callState.isOpen, incomingCall]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openChat = useCallback((contact) => {
    setRecentChats(prev => {
      const filtered = prev.filter(c => c.id !== contact.id);
      const updated = [{ ...contact, lastChatAt: Date.now() }, ...filtered].slice(0, 30);
      localStorage.setItem('cornerstone_recent_chats', JSON.stringify(updated));
      return updated;
    });
    setChatUser(contact);
  }, []);

  const sendFriendRequest = (contact) => {
    const updated = [...sentRequests, contact.id];
    setSentRequests(updated);
    localStorage.setItem('cs_sent_requests', JSON.stringify(updated));
  };

  const acceptRequest = (req) => {
    setFriendRequests(prev => prev.filter(r => r.id !== req.id));
    openChat(req);
  };

  const declineRequest = (req) => {
    setFriendRequests(prev => prev.filter(r => r.id !== req.id));
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const recentContactIds = new Set(recentChats.map(r => r.id));

  const filteredContacts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return contacts.filter(c =>
      (!q || c.name?.toLowerCase().includes(q) || c.role?.includes(q)) &&
      String(c.id) !== String(user?.id)
    );
  }, [contacts, searchQuery, user?.id]);

  const recentList = useMemo(() =>
    recentChats
      .map(rc => contacts.find(c => c.id === rc.id) || rc)
      .filter(Boolean),
    [recentChats, contacts]
  );

  const exploreList = useMemo(() =>
    filteredContacts.filter(c => !recentContactIds.has(c.id)),
    [filteredContacts, recentContactIds]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return createPortal(
    <>
      {/* Full-viewport overlay — rendered via portal to cover sidebar + topbar */}
      <div
        className="fixed inset-0 z-[9999] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 25%, #f093fb22 50%, #4facfe22 75%, #43e97b22 100%)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #a855f7, transparent)', top: '-10%', left: '-5%' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', bottom: '-10%', right: '-5%' }}
            animate={{ scale: [1, 1.15, 1], x: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
          <motion.div className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #10b981, transparent)', top: '40%', left: '40%' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }} />
        </div>

        {/* Main layout */}
        <div className="relative z-10 h-full flex items-stretch justify-center p-2 md:p-4 lg:p-6">
          <div className="w-full max-w-[1300px] h-full flex gap-2 md:gap-3 lg:gap-4">

            {/* ── LEFT PANEL — hidden on mobile when chat is open ── */}
            <Glass
              className={`flex-shrink-0 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300
                ${chatUser ? 'hidden md:flex md:w-[280px] lg:w-[340px]' : 'flex w-full md:w-[280px] lg:w-[340px]'}`}
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.15)' }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-2xl font-black tracking-tight text-gray-900">Messages</h1>
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveTab('requests')}
                      className="relative p-2 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      <Bell size={18} className="text-gray-600" />
                      {friendRequests.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveTab('explore')}
                      className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      <UserPlus size={18} className="text-gray-600" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-xs font-medium text-gray-500">
                    {isConnected ? `Connected · ${contacts.length} people` : 'Connecting...'}
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setActiveTab('messages'); }}
                    placeholder="Search people..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.8)',
                      color: '#1f2937',
                    }}
                  />
                </div>

        {/* Tabs */}
                <div className="flex gap-1 mt-3 bg-black/5 p-1 rounded-2xl">
                  {[
                    { id: 'messages', label: 'Chats' },
                    { id: 'requests', label: friendRequests.length > 0 ? `Requests ${friendRequests.length}` : 'Requests' },
                    { id: 'explore', label: 'People' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all relative"
                      style={{
                        background: activeTab === tab.id ? 'white' : 'transparent',
                        color: activeTab === tab.id ? '#1f2937' : '#9ca3af',
                        boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      {tab.label}
                      {tab.id === 'requests' && friendRequests.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
                <AnimatePresence mode="wait">

                  {/* MESSAGES TAB */}
                  {activeTab === 'messages' && (
                    <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {loadingContacts ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <>
                          {/* Recent chats */}
                          {recentList.length > 0 && !searchQuery && (
                            <div className="mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Recent</p>
                              {recentList.map(contact => (
                                <ContactRow
                                  key={contact.id}
                                  contact={contact}
                                  isActive={chatUser?.id === contact.id}
                                  onClick={() => openChat(contact)}
                                  onCall={(video) => setCallState({ isOpen: true, otherUser: contact, preferVideo: video, initiator: true })}
                                />
                              ))}
                            </div>
                          )}

                          {/* All / search results */}
                          {searchQuery ? (
                            filteredContacts.length === 0 ? (
                              <EmptyState icon={<Search size={28} />} text="No results" sub={`No one named "${searchQuery}"`} />
                            ) : (
                              filteredContacts.map(contact => (
                                <ContactRow key={contact.id} contact={contact} isActive={chatUser?.id === contact.id}
                                  onClick={() => openChat(contact)}
                                  onCall={(video) => setCallState({ isOpen: true, otherUser: contact, preferVideo: video, initiator: true })} />
                              ))
                            )
                          ) : (
                            <>
                              {exploreList.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">All People</p>
                                  {exploreList.slice(0, 20).map(contact => (
                                    <ContactRow key={contact.id} contact={contact} isActive={chatUser?.id === contact.id}
                                      onClick={() => openChat(contact)}
                                      onCall={(video) => setCallState({ isOpen: true, otherUser: contact, preferVideo: video, initiator: true })} />
                                  ))}
                                </div>
                              )}
                              {recentList.length === 0 && exploreList.length === 0 && (
                                <EmptyState icon={<Users size={28} />} text="No contacts yet" sub="People in your school will appear here" />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* REQUESTS TAB */}
                  {activeTab === 'requests' && (
                    <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-3 mt-1">Friend Requests</p>
                      {friendRequests.length === 0 ? (
                        <EmptyState icon={<UserCheck size={28} />} text="No pending requests" sub="When someone adds you, they'll appear here" />
                      ) : (
                        friendRequests.map(req => (
                          <motion.div key={req.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-3 rounded-2xl mb-1.5"
                            style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.7)' }}>
                            <Avatar name={req.name} role={req.role} size={42} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{req.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{req.role}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => acceptRequest(req)}
                                className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                                <Check size={14} />
                              </button>
                              <button onClick={() => declineRequest(req)}
                                className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {/* EXPLORE TAB */}
                  {activeTab === 'explore' && (
                    <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-3 mt-1">Add People</p>
                      {contacts.filter(c => !recentContactIds.has(c.id)).map(contact => (
                        <motion.div key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 rounded-2xl mb-1.5 transition-all"
                          style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                          <Avatar name={contact.name} role={contact.role} size={42} online={contact.online} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{contact.name}</p>
                            <p className="text-xs capitalize" style={{ color: rc(contact.role) }}>{contact.role}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => openChat(contact)}
                              className="p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                              <MessageCircle size={14} />
                            </button>
                            {!sentRequests.includes(contact.id) ? (
                              <button onClick={() => sendFriendRequest(contact)}
                                className="p-2 rounded-xl bg-white/70 text-gray-600 hover:bg-white transition-colors border border-white/80">
                                <UserPlus size={14} />
                              </button>
                            ) : (
                              <button disabled className="p-2 rounded-xl bg-gray-100 text-gray-400 cursor-default">
                                <Clock size={14} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </Glass>

            {/* ── RIGHT PANEL — full width on mobile when chat open ── */}
            <Glass
              className={`rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300
                ${chatUser ? 'flex flex-1 min-w-0' : 'hidden md:flex flex-1 min-w-0'}`}
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.12)' }}
            >
              <AnimatePresence mode="wait">
                {chatUser ? (
                  <motion.div key={chatUser.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                    <ChatView
                      isOpen={true}
                      onClose={() => setChatUser(null)}
                      currentUser={user}
                      otherUser={chatUser}
                      onStartCall={({ otherUser, preferVideo }) =>
                        setCallState({ isOpen: true, otherUser, preferVideo, initiator: true })
                      }
                      isInline={true}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
                    {/* Animated icon */}
                    <motion.div
                      animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      <MessageCircle size={40} className="text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Your Messages</h2>
                      <p className="text-gray-500 text-sm mt-1 max-w-xs">
                        Select a conversation from the left, or explore people to start a new chat.
                      </p>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('explore')}
                        className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <span className="flex items-center gap-2"><UserPlus size={15} /> Add People</span>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('messages')}
                        className="px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-700 bg-white/60 border border-white/80 shadow-sm">
                        <span className="flex items-center gap-2"><Hash size={15} /> Browse Chats</span>
                      </motion.button>
                    </div>

                    {/* Online people strip */}
                    {contacts.filter(c => c.online).length > 0 && (
                      <div className="mt-4 w-full max-w-md">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Active Now</p>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 justify-center flex-wrap">
                          {contacts.filter(c => c.online).slice(0, 8).map(c => (
                            <motion.button key={c.id} whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.95 }}
                              onClick={() => openChat(c)}
                              className="flex flex-col items-center gap-1.5 cursor-pointer">
                              <Avatar name={c.name} role={c.role} size={48} online />
                              <span className="text-[10px] font-semibold text-gray-600 max-w-[52px] truncate">{c.name.split(' ')[0]}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Glass>

          </div>
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
          setCallState({ isOpen: true, otherUser: incomingCall, preferVideo: incomingCall?.preferVideo ?? true, initiator: false });
          setIncomingCall(null);
        }}
        onDecline={() => setIncomingCall(null)}
      />
    </>,
    document.body
  );
};

// ── Contact row ───────────────────────────────────────────────────────────────
const ContactRow = ({ contact, isActive, onClick, onCall }) => (
  <motion.div
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 mb-1 group"
    style={{
      background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
      border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
    }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
  >
    <Avatar name={contact.name} role={contact.role} size={44} online={contact.online} />
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-semibold text-gray-800 truncate">{contact.name}</p>
      <p className="text-[11px] font-medium capitalize" style={{ color: rc(contact.role) }}>{contact.role}</p>
    </div>
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={e => { e.stopPropagation(); onCall(false); }}
        className="p-1.5 rounded-xl hover:bg-white/70 transition-colors text-gray-500">
        <Phone size={14} />
      </button>
      <button onClick={e => { e.stopPropagation(); onCall(true); }}
        className="p-1.5 rounded-xl hover:bg-white/70 transition-colors text-emerald-500">
        <Video size={14} />
      </button>
    </div>
  </motion.div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text, sub }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-60">
    <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center text-gray-400 shadow-inner">
      {icon}
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-gray-600">{text}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);
