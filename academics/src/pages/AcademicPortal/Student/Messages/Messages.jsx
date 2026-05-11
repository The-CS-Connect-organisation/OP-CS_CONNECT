/**
 * Messages Page — Student Portal
 * Standalone page at /student/messages
 * Dark theme, glassmorphism, orange accents
 * Real-time Firebase-backed messaging
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Send, ArrowLeft, Users, Phone, Video, Loader2,
  Check, CheckCheck, MoreVertical, PhoneOff, X, Calendar,
  CheckCircle, XCircle, Clock, Link2, UserPlus, MessageCircle
} from 'lucide-react';
import { request } from '../../../../utils/apiClient';
import { getSocket } from '../../../../utils/socketClient';
import { getFromStorage, setToStorage } from '../../../../data/schema';
import { firebaseMessagesService } from '../../../../services/firebaseService';
import { isStreamChatAvailable, startStreamCall } from '../../../../services/streamChatService';

// ── Role colours ──────────────────────────────────────────────────────────────
const ROLE_COLOR = {
  teacher: '#a855f7',
  student: '#3b82f6',
  parent:  '#10b981',
  admin:   '#f59e0b',
  driver:  '#ef4444',
};
const rc = (role) => ROLE_COLOR[role] || '#6b7280';

// ── Relative time ─────────────────────────────────────────────────────────────
const relTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ── Audio ping ────────────────────────────────────────────────────────────────
const playPing = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch {}
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 44, online = false }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold select-none shadow-lg"
      style={{ background: rc(user?.role), fontSize: size * 0.38 }}
    >
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
    {online && (
      <span className="absolute bottom-0.5 right-0.5 rounded-full border-2 border-white bg-emerald-400 animate-pulse"
        style={{ width: size * 0.28, height: size * 0.28 }} />
    )}
  </div>
);

// ── Meeting invite storage helpers ────────────────────────────────────────────
const loadMeetingInvites = () => getFromStorage('sms_meeting_invites', []);
const saveMeetingInvites = (invites) => setToStorage('sms_meeting_invites', invites);

// ── Main Component ────────────────────────────────────────────────────────────
export const Messages = ({ user, addToast }) => {
  const [allUsers, setAllUsers]         = useState([]);
  const [onlineUsers, setOnlineUsers]   = useState(new Set());
  const [conversations, setConversations] = useState([]); // { userId, lastMsg, lastTs, unread }
  const [selectedUser, setSelectedUser]  = useState(null);
  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState('');
  const [sending, setSending]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState('');
  const [otherTyping, setOtherTyping]   = useState(false);
  const [unread, setUnread]             = useState({});
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [meetingInvites, setMeetingInvites] = useState(loadMeetingInvites());
  const [activeTab, setActiveTab]       = useState('chat'); // 'chat' | 'invites'
  const [showCallModal, setShowCallModal] = useState(false);  // call modal state
  const [callModalInfo, setCallModalInfo] = useState(null);  // {message} for modal

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const seenMsgIds = useRef(new Set());
  const firebaseUnsubscribeRef = useRef(null);

  // ── Load all users from API ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    request('/school/users?limit=500')
      .then(res => {
        if (cancelled) return;
        const list = res.users || res.items || (Array.isArray(res) ? res : []);
        setAllUsers(list.filter(u => String(u.id) !== String(user.id)));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Load conversations from localStorage ───────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const stored = getFromStorage(`sms_conversations_${user.id}`, []);
    setConversations(stored);
  }, [user?.id]);

  // ── Save conversations ──────────────────────────────────────────────────────
  const saveConversations = useCallback((convs) => {
    setToStorage(`sms_conversations_${user.id}`, convs);
    setConversations(convs);
  }, [user?.id]);

  // ── Load message history for selected user ──────────────────────────────────
  useEffect(() => {
    if (!selectedUser?.id || !user?.id) return;
    let cancelled = false;

    // Unsubscribe from previous Firebase subscription
    if (firebaseUnsubscribeRef.current) {
      firebaseUnsubscribeRef.current();
      firebaseUnsubscribeRef.current = null;
    }

    request(`/school/messages?otherUserId=${encodeURIComponent(selectedUser.id)}&userId=${encodeURIComponent(user.id)}`)
      .then(res => {
        if (!cancelled) setMessages(res.messages || []);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      });

    // Firebase real-time: subscribe to new messages in the conversation
    const convId = [user.id, selectedUser.id].sort().join('_');
    const unsub = firebaseMessagesService.subscribeToMessages(convId, (newMsg) => {
      if (cancelled) return;
      if (newMsg.senderId === user.id) return; // skip own messages (already handled via socket)
      setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      // Mark as read in Firebase
      firebaseMessagesService.markRead(convId, user.id).catch(() => {});
      playPing();
    });
    firebaseUnsubscribeRef.current = unsub;

    return () => {
      cancelled = true;
      if (firebaseUnsubscribeRef.current) {
        firebaseUnsubscribeRef.current();
        firebaseUnsubscribeRef.current = null;
      }
    };
  }, [selectedUser?.id, user?.id]);

  // ── Socket: online presence ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('user:online', { userId: user.id });
    socket.emit('online:request');

    const onOnline  = (d) => {
      if (d?.userId && d.userId !== user.id) setOnlineUsers(p => new Set(p).add(d.userId));
    };
    const onOffline = (d) => {
      if (d?.userId) setOnlineUsers(p => { const n = new Set(p); n.delete(d.userId); return n; });
    };
    const onList    = (d) => {
      if (Array.isArray(d?.users)) setOnlineUsers(new Set(d.users.filter(id => String(id) !== String(user.id))));
    };

    socket.on('user:online',  onOnline);
    socket.on('user:offline', onOffline);
    socket.on('online:list',  onList);

    return () => {
      socket.off('user:online',  onOnline);
      socket.off('user:offline', onOffline);
      socket.off('online:list',  onList);
      socket.emit('user:offline', { userId: user.id });
    };
  }, [user?.id]);

  // ── Socket: real-time messages ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onMsg = (msg) => {
      const isRelevant =
        (msg.sender_id === user.id && msg.recipient_id === selectedUser?.id) ||
        (msg.recipient_id === user.id);

      if (!isRelevant) return;

      // If from the currently selected user, add to thread
      if (msg.sender_id === selectedUser?.id) {
        seenMsgIds.current.add(msg.id);
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        // Mark as read
        setUnread(p => { const n = { ...p }; delete n[msg.sender_id]; return n; });
      } else if (msg.sender_id !== user.id) {
        // Incoming from another user
        if (seenMsgIds.current.has(msg.id)) return;
        seenMsgIds.current.add(msg.id);
        playPing();
        setUnread(p => ({ ...p, [msg.sender_id]: (p[msg.sender_id] || 0) + 1 }));
        // Update conversation preview
        const convUser = allUsers.find(u => String(u.id) === String(msg.sender_id));
        if (convUser) {
          const convs = conversations.map(c =>
            String(c.userId) === String(msg.sender_id)
              ? { ...c, lastMsg: (msg.content || '').substring(0, 60), lastTs: msg.created_at }
              : c
          );
          const exists = convs.some(c => String(c.userId) === String(msg.sender_id));
          if (!exists) {
            convs.unshift({ userId: msg.sender_id, lastMsg: (msg.content || '').substring(0, 60), lastTs: msg.created_at, unread: 1 });
          }
          saveConversations(convs);
        }
      }
    };

    socket.on('message:new', onMsg);
    return () => socket.off('message:new', onMsg);
  }, [user?.id, selectedUser?.id, allUsers, conversations]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  // ── Typing indicator ───────────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing:start', { userId: user.id, toUserId: selectedUser?.id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { userId: user.id, toUserId: selectedUser?.id });
    }, 2000);
  }, [user?.id, selectedUser?.id]);

  useEffect(() => {
    if (!user?.id || !selectedUser?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onStart = (d) => { if (d?.userId === selectedUser.id) setOtherTyping(true); };
    const onStop  = (d) => { if (d?.userId === selectedUser.id) setOtherTyping(false); };

    socket.on('typing:start', onStart);
    socket.on('typing:stop', onStop);
    return () => {
      socket.off('typing:start', onStart);
      socket.off('typing:stop', onStop);
    };
  }, [user?.id, selectedUser?.id]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedUser?.id || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender_id: user.id,
      recipient_id: selectedUser.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setText('');

    // Update conversation
    const convs = conversations.map(c =>
      String(c.userId) === String(selectedUser.id)
        ? { ...c, lastMsg: trimmed, lastTs: new Date().toISOString() }
        : c
    );
    // Move to top
    const updated = convs.sort((a, b) => new Date(b.lastTs || 0) - new Date(a.lastTs || 0));
    saveConversations(updated);

    try {
      await request('/school/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId: selectedUser.id, content: trimmed }),
      });
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _pending: false } : m));
      }, 2000);
      inputRef.current?.focus();
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setText(trimmed);
      addToast?.('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Select conversation ─────────────────────────────────────────────────────
  const handleSelectUser = useCallback((contactUser) => {
    setSelectedUser(contactUser);
    setUnread(p => { const n = { ...p }; delete n[contactUser.id]; return n; });
    setMessages([]);
    seenMsgIds.current.clear();

    // Add/update conversation
    const convs = conversations.filter(c => String(c.userId) !== String(contactUser.id));
    const existing = conversations.find(c => String(c.userId) === String(contactUser.id));
    const newConv = { userId: contactUser.id, lastMsg: existing?.lastMsg || '', lastTs: existing?.lastTs || '', unread: 0 };
    saveConversations([newConv, ...convs.filter(c => String(c.userId) !== String(contactUser.id))]);
  }, [conversations, saveConversations]);

  // ── Handle meeting invite response ─────────────────────────────────────────
  const handleMeetingResponse = useCallback((inviteId, action) => {
    const invites = loadMeetingInvites();
    const updated = invites.map(inv => inv.id === inviteId ? { ...inv, status: action } : inv);
    saveMeetingInvites(updated);
    setMeetingInvites(updated);

    if (action === 'accepted') {
      const invite = invites.find(inv => inv.id === inviteId);
      if (invite) {
        // Add meeting event to calendar
        const calEvents = getFromStorage('sms_calendar_events', []);
        const newEvent = {
          id: `meeting-${Date.now()}`,
          title: invite.title,
          type: 'meeting',
          date: invite.date,
          time: invite.time,
          endTime: invite.duration ? `${parseInt(invite.time.split(':')[0]) + Math.floor(invite.duration / 60)}:${invite.time.split(':')[1]}` : null,
          subject: `${invite.meetingType} with ${invite.fromUserName}`,
          meetLink: invite.meetLink || null,
          inviteId: invite.id,
        };
        calEvents.push(newEvent);
        setToStorage('sms_calendar_events', calEvents);
        addToast?.(`Meeting "${invite.title}" added to calendar`, 'success');
      }
    } else {
      addToast?.('Meeting invite declined', 'info');
    }
  }, [addToast]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const displayUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allUsers.filter(u =>
      !q || u.name?.toLowerCase().includes(q) || u.role?.includes(q)
    );
  }, [allUsers, search]);

  const totalUnread = useMemo(() => Object.values(unread).reduce((a, b) => a + b, 0), [unread]);

  // Merge conversations with user data
  const conversationList = useMemo(() => {
    return conversations.map(conv => {
      const userData = allUsers.find(u => String(u.id) === String(conv.userId));
      return {
        ...conv,
        user: userData || { id: conv.userId, name: 'Unknown User', role: 'student' },
      };
    }).sort((a, b) => new Date(b.lastTs || 0) - new Date(a.lastTs || 0));
  }, [conversations, allUsers]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (date !== lastDate) { groups.push({ type: 'date', date }); lastDate = date; }
      groups.push({ type: 'message', msg });
    });
    return groups;
  }, [messages]);

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden rounded-2xl border border-[var(--border-default)] shadow-xl"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

      {/* ── Left panel: Conversation list ── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-white/10">
        {/* Header */}
        <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">Messages</span>
              {totalUnread > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScheduleMeeting(true)}
                className="p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                title="Schedule Meeting"
              >
                <Calendar size={16} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3">
            <button onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'chat' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              Chat
            </button>
            <button onClick={() => setActiveTab('invites')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === 'invites' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              Invites {meetingInvites.filter(i => i.toUserId === user?.id && i.status === 'pending').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5">
                  {meetingInvites.filter(i => i.toUserId === user?.id && i.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          {activeTab === 'chat' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <Search size={14} className="text-white/40 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search people..."
                className="flex-1 bg-transparent border-0 outline-none text-[13px] text-white placeholder-white/30"
              />
              {search && <button onClick={() => setSearch('')}><X size={12} className="text-white/40" /></button>}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 no-scrollbar">
          {activeTab === 'chat' ? (
            loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={22} className="animate-spin text-white/30" />
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                <Users size={28} className="text-white/20" />
                <p className="text-[13px] font-semibold text-white/40">{search ? 'No results' : 'No people found'}</p>
              </div>
            ) : (
              displayUsers.map(u => (
                <ConversationRow
                  key={u.id}
                  contactUser={u}
                  isSelected={selectedUser?.id === u.id}
                  unread={unread[u.id] || 0}
                  lastMsg={
                    conversationList.find(c => String(c.userId) === String(u.id))?.lastMsg || ''
                  }
                  lastTs={
                    conversationList.find(c => String(c.userId) === String(u.id))?.lastTs || ''
                  }
                  online={onlineUsers.has(u.id)}
                  onSelect={() => handleSelectUser(u)}
                />
              ))
            )
          ) : (
            /* Invites tab */
            <MeetingInvitesList
              invites={meetingInvites.filter(i => i.toUserId === user?.id)}
              onRespond={handleMeetingResponse}
            />
          )}
        </div>
      </div>

      {/* ── Right panel: Message thread ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedUser ? (
          <>
            {/* Thread header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-white/5 backdrop-blur-md flex-shrink-0">
              <Avatar user={selectedUser} size={40} online={onlineUsers.has(selectedUser.id)} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white truncate">{selectedUser.name}</p>
                <p className="text-[11px] font-medium" style={{ color: otherTyping ? '#f97316' : 'rgba(255,255,255,0.4)' }}>
                  {otherTyping ? 'typing...' : onlineUsers.has(selectedUser.id) ? 'Active now' : 'Offline'}
                </p>
              </div>
              <button onClick={() => setShowScheduleMeeting(true)}
                className="p-2 rounded-xl bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors">
                <Calendar size={16} />
              </button>
              {selectedUser && (
                <>
                  <button
                    onClick={async () => {
                      const result = await startStreamCall('audio');
                      if (!result.available) { setCallModalInfo(result); setShowCallModal(true); }
                    }}
                    className="p-2 rounded-xl bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                    title="Voice Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      const result = await startStreamCall('video');
                      if (!result.available) { setCallModalInfo(result); setShowCallModal(true); }
                    }}
                    className="p-2 rounded-xl bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
                    title="Video Call"
                  >
                    <Video size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                    <Send size={24} className="text-white/40 transform rotate-12" />
                  </div>
                  <p className="text-base font-semibold text-white/70">Start a conversation</p>
                  <p className="text-sm text-white/40">Say hi to {selectedUser.name?.split(' ')[0]}</p>
                </div>
              ) : (
                <div className="space-y-2 pb-2">
                  {groupedMessages.map((item, idx) => {
                    if (item.type === 'date') return (
                      <div key={`date-${idx}`} className="flex justify-center py-2">
                        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-white/5 text-white/40 uppercase tracking-wide">
                          {item.date}
                        </span>
                      </div>
                    );
                    const msg = item.msg;
                    const isMe = msg.sender_id === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-lg backdrop-blur-sm ${
                            isMe
                              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm'
                              : 'bg-white/10 border border-white/10 text-white/90 rounded-2xl rounded-tl-sm'
                          } ${msg._pending ? 'opacity-60' : ''}`}>
                            <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : ''}`}>
                            <span className="text-[10px] font-medium text-white/30">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg._pending
                                ? <Loader2 size={10} className="text-white/30 animate-spin" />
                                : <span className="flex items-center">
                                    <CheckCheck size={12} className={msg.read ? 'text-orange-400' : 'text-white/20'} />
                                    <CheckCheck size={12} className={msg.read ? 'text-orange-400 -ml-2' : 'text-white/10 -ml-2'} />
                                  </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {otherTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1.5">
                        {[0, 1, 2].map(i => (
                          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/5 backdrop-blur-md flex items-end gap-2 flex-shrink-0">
              <div className="flex-1 flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 gap-2">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none text-[14px] text-white placeholder-white/30 resize-none no-scrollbar overflow-hidden"
                  style={{ minHeight: '20px', maxHeight: '120px', lineHeight: '20px' }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 480) + 'px';
                  }}
                />
              </div>
              <AnimatePresence mode="wait">
                {text.trim() ? (
                  <motion.button
                    key="send"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="p-3 rounded-full shadow-lg transition-all flex-shrink-0 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}
                  >
                    {sending ? <Loader2 size={19} className="animate-spin text-white" /> : <Send size={19} className="text-white" />}
                  </motion.button>
                ) : (
                  <motion.button
                    key="idle"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="p-3 rounded-full bg-white/10 text-white/30 flex-shrink-0 transition-colors"
                  >
                    <Check size={19} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={36} className="text-white/20" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-white/70">Your messages</p>
              <p className="text-[13px] text-white/30 mt-1">Select a person to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleMeeting && (
          <ScheduleMeetingModal
            currentUser={user}
            allUsers={allUsers}
            selectedUser={selectedUser}
            onClose={() => setShowScheduleMeeting(false)}
            onScheduled={(invite) => {
              const invites = loadMeetingInvites();
              saveMeetingInvites([invite, ...invites]);
              setMeetingInvites(prev => [invite, ...prev]);
              addToast?.('Meeting invite sent!', 'success');
              setShowScheduleMeeting(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Call Modal */}
      <AnimatePresence>
        {showCallModal && callModalInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowCallModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/10 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Call Feature</h3>
              <p className="text-sm text-white/50 mb-5 leading-relaxed">{callModalInfo.message}</p>
              <button
                onClick={() => setShowCallModal(false)}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Conversation Row ───────────────────────────────────────────────────────────
const ConversationRow = ({ contactUser, isSelected, unread, lastMsg, lastTs, online, onSelect }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onSelect}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
      isSelected ? 'bg-orange-500/20 border border-orange-500/30' : 'hover:bg-white/5 border border-transparent'
    }`}
  >
    <Avatar user={contactUser} size={42} online={online} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[14px] truncate ${unread > 0 ? 'font-bold text-white' : 'font-semibold text-white/80'}`}>
          {contactUser.name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {lastTs && <span className="text-[10px] text-white/30 font-medium">{relTime(lastTs)}</span>}
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[12px] text-white/40 truncate">
          {lastMsg || (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize" style={{ background: `${rc(contactUser.role)}18`, color: rc(contactUser.role) }}>
              {contactUser.role}
            </span>
          )}
        </span>
      </div>
    </div>
  </motion.div>
);


// ── Meeting Invites List ───────────────────────────────────────────────────────
const MeetingInvitesList = ({ invites, onRespond }) => {
  const pending = invites.filter(i => i.status === 'pending');
  const processed = invites.filter(i => i.status !== 'pending');

  if (invites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
        <Calendar size={28} className="text-white/20" />
        <p className="text-[13px] font-semibold text-white/40">No meeting invites</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pending.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-1">Pending</p>
          {pending.map(inv => (
            <div key={inv.id} className="px-3 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                  {inv.fromUserName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white/90 truncate">{inv.title}</p>
                  <p className="text-[11px] text-white/40">{inv.fromUserName} invited you</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-white/40 mb-3">
                <Calendar size={10} />
                <span>{inv.date} at {inv.time}</span>
                <span>·</span>
                <span>{inv.duration}min</span>
                <span>·</span>
                <span>{inv.meetingType}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onRespond(inv.id, 'accepted')}
                  className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1">
                  <CheckCircle size={12} /> Accept
                </button>
                <button onClick={() => onRespond(inv.id, 'declined')}
                  className="flex-1 py-2 rounded-lg bg-white/5 text-white/40 text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                  <XCircle size={12} /> Decline
                </button>
              </div>
              {inv.meetLink && (
                <a href={inv.meetLink} target="_blank" rel="noreferrer"
                  className="mt-2 w-full py-2 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1">
                  <Link2 size={12} /> Join Meet Link
                </a>
              )}
            </div>
          ))}
        </>
      )}
      {processed.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-1 mt-3">Responded</p>
          {processed.map(inv => (
            <div key={inv.id} className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 font-bold text-sm">
                  {inv.fromUserName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-white/80 truncate">{inv.title}</p>
                  <p className="text-[11px] text-white/40">{inv.date} at {inv.time}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${inv.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ── Schedule Meeting Modal ─────────────────────────────────────────────────────
const ScheduleMeetingModal = ({ currentUser, allUsers, selectedUser, onClose, onScheduled }) => {
  const [title, setTitle] = useState('');
  const [inviteeId, setInviteeId] = useState(selectedUser?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30');
  const [meetLink, setMeetLink] = useState('');
  const [meetingType, setMeetingType] = useState('Study Group');

  const meetingTypes = ['Study Group', 'Doubt Session', 'Teacher Consultation', 'Peer Review'];
  const durations = ['15', '30', '45', '60'];

  const handleSubmit = () => {
    if (!title.trim() || !inviteeId) return;
    const invitee = allUsers.find(u => String(u.id) === String(inviteeId));
    const invite = {
      id: `inv-${Date.now()}`,
      title: title.trim(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: inviteeId,
      toUserName: invitee?.name || 'Unknown',
      date,
      time,
      duration: parseInt(duration),
      meetLink: meetLink.trim() || null,
      status: 'pending',
      meetingType,
      createdAt: new Date().toISOString(),
    };
    onScheduled(invite);
  };

  // Get relevant users: teachers for students, students for teachers
  const relevantUsers = currentUser?.role === 'student'
    ? allUsers.filter(u => u.role === 'teacher')
    : allUsers.filter(u => u.role === 'student');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400"><Calendar size={20} /></div>
            <h3 className="text-lg font-bold text-white">Schedule Meeting</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/40">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Math Doubt Session"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:border-orange-500 outline-none transition-colors" />
          </div>

          {/* Meeting type */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Meeting Type</label>
            <div className="flex gap-2 flex-wrap">
              {meetingTypes.map(t => (
                <button key={t} onClick={() => setMeetingType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${meetingType === t ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Invitee */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
              {currentUser?.role === 'student' ? 'Teacher' : 'Student'}
            </label>
            <select value={inviteeId} onChange={e => setInviteeId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-colors appearance-none cursor-pointer">
              <option value="" className="bg-gray-900">Select...</option>
              {relevantUsers.map(u => (
                <option key={u.id} value={u.id} className="bg-gray-900">{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-colors" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Duration</label>
            <div className="flex gap-2">
              {durations.map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${duration === d ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Google Meet link */}
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Google Meet Link (optional)</label>
            <input type="url" value={meetLink} onChange={e => setMeetLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:border-orange-500 outline-none transition-colors" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-semibold hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit}
              disabled={!title.trim() || !inviteeId}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              Send Invite
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;