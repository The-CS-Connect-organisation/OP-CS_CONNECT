/**
 * CommunicationHub — Instagram-style DM messenger
 *
 * Design decisions:
 * - NO localStorage (except token which is handled by apiClient)
 * - NO friend requests — everyone in the school can message everyone
 * - All data from API: users from /school/users, messages from /school/messages
 * - Real-time via Socket.IO message:new events
 * - Stars (close friends) stored in Firebase via /api/user-prefs
 * - Unread counts tracked in component state only (reset on open)
 */

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, MessageCircle, X, Bell, Star,
  ChevronRight, Loader2
} from 'lucide-react';
import { ChatView } from '../../../components/messaging/ChatView';
import { CallModal } from '../../../components/messaging/CallModal';
import { request } from '../../../utils/apiClient';
import { getSocket } from '../../../utils/socketClient';

// ── Role colours ──────────────────────────────────────────────────────────────
const ROLE_COLOR = {
  teacher: '#a855f7',
  student: '#3b82f6',
  parent:  '#10b981',
  admin:   '#f59e0b',
  driver:  '#ef4444',
};
const rc = (role) => ROLE_COLOR[role] || '#6b7280';

// ── Web Audio ping ────────────────────────────────────────────────────────────
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

// ── Relative time ─────────────────────────────────────────────────────────────
const relTime = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 40, online = false }) => (
  <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
    <div
      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold select-none"
      style={{ background: rc(user?.role), fontSize: size * 0.38 }}
    >
      {user?.name?.charAt(0)?.toUpperCase() || '?'}
    </div>
    <span
      className={`absolute bottom-0 right-0 rounded-full border-2 border-white transition-colors ${online ? 'bg-emerald-400' : 'bg-gray-200'}`}
      style={{ width: size * 0.28, height: size * 0.28 }}
    />
  </div>
);

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span
    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
    style={{ background: `${rc(role)}18`, color: rc(role) }}
  >
    {role}
  </span>
);

// ── Contact row ───────────────────────────────────────────────────────────────
const ContactRow = ({ contact, isSelected, unread = 0, lastMsg = '', lastMsgTs = '', online = false, starred = false, onSelect, onToggleStar }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={() => onSelect(contact)}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
      isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'
    }`}
  >
    <Avatar user={contact} size={42} online={online} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[14px] truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
          {contact.name}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {lastMsgTs && (
            <span className="text-[10px] text-gray-400 font-medium">{relTime(lastMsgTs)}</span>
          )}
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mt-0.5">
        <span className="text-[12px] text-gray-400 truncate">
          {lastMsg || <RoleBadge role={contact.role} />}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(contact.id); }}
          className={`p-0.5 rounded flex-shrink-0 transition-opacity ${starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
        >
          <Star size={12} className={starred ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
        </button>
      </div>
    </div>
  </motion.div>
);

// ── Left-edge nav peek ────────────────────────────────────────────────────────
const LeftEdgePeek = ({ currentUser, onNavigate }) => {
  const [hovered, setHovered] = useState(false);

  const navItems = useMemo(() => {
    const role = currentUser?.role;
    const base = [
      { label: 'Dashboard', path: `/${role}/dashboard` },
      { label: 'AI Assistant', path: `/${role}/ai-lab` },
      { label: 'Nexus Hub', path: `/${role}/nexus` },
    ];
    if (role === 'student') return [
      { label: 'Dashboard', path: '/student/dashboard' },
      { label: 'Assignments', path: '/student/assignments' },
      { label: 'Grades', path: '/student/grades' },
      { label: 'Timetable', path: '/student/timetable' },
      { label: 'Attendance', path: '/student/attendance' },
      { label: 'AI Assistant', path: '/student/ai-lab' },
      { label: 'Nexus Hub', path: '/student/nexus' },
    ];
    if (role === 'teacher') return [
      { label: 'Dashboard', path: '/teacher/dashboard' },
      { label: 'Assignments', path: '/teacher/assignments' },
      { label: 'Attendance', path: '/teacher/attendance' },
      { label: 'Grades', path: '/teacher/grades' },
      { label: 'AI Lab', path: '/teacher/ai-lab' },
    ];
    return base;
  }, [currentUser?.role]);

  return (
    <div
      className="fixed left-0 top-0 h-full z-[9998] flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-3 h-full" />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="w-[240px] h-full flex flex-col shadow-2xl"
            style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}
          >
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Cornerstone</p>
                <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-2 px-2">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="px-3 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: rc(currentUser?.role) }}>
                  {currentUser?.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
      <MessageCircle size={36} className="text-gray-300" />
    </div>
    <div>
      <p className="text-[16px] font-bold text-gray-700">Your messages</p>
      <p className="text-[13px] text-gray-400 mt-1">Select a person to start chatting</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const CommunicationHub = ({ isOpen, onClose, currentUser }) => {
  const [allUsers, setAllUsers]         = useState([]);
  const [onlineUsers, setOnlineUsers]   = useState(new Set());
  const [unread, setUnread]             = useState({});   // { userId: count } — in-memory only
  const [stars, setStars]               = useState([]);   // from API
  const [lastMsgs, setLastMsgs]         = useState({});   // { userId: { text, ts } }
  const [selectedContact, setSelectedContact] = useState(null);
  const [search, setSearch]             = useState('');
  const [tab, setTab]                   = useState('all'); // 'all' | 'starred'
  const [loading, setLoading]           = useState(false);

  const [callOpen, setCallOpen]         = useState(false);
  const [callData, setCallData]         = useState(null);

  const seenMsgIds = useRef(new Set());

  // ── Load users from API ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    let cancelled = false;
    setLoading(true);
    request('/school/users?limit=500')
      .then(res => {
        if (cancelled) return;
        const list = res.users || res.items || (Array.isArray(res) ? res : []);
        setAllUsers(list.filter(u => String(u.id) !== String(currentUser.id)));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, currentUser?.id]);

  // ── Load stars from API ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    request('/user-prefs/stars')
      .then(res => setStars(res.stars || []))
      .catch(() => {}); // non-critical, silently fail
  }, [isOpen, currentUser?.id]);

  // ── Socket: online presence ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('user:online', { userId: currentUser.id });
    socket.emit('online:request');

    const onOnline  = (d) => { if (d?.userId && d.userId !== currentUser.id) setOnlineUsers(p => new Set(p).add(d.userId)); };
    const onOffline = (d) => { if (d?.userId) setOnlineUsers(p => { const n = new Set(p); n.delete(d.userId); return n; }); };
    const onList    = (d) => { if (Array.isArray(d?.users)) setOnlineUsers(new Set(d.users.filter(id => id !== currentUser.id))); };

    socket.on('user:online',  onOnline);
    socket.on('user:offline', onOffline);
    socket.on('online:list',  onList);

    return () => {
      socket.off('user:online',  onOnline);
      socket.off('user:offline', onOffline);
      socket.off('online:list',  onList);
      socket.emit('user:offline', { userId: currentUser.id });
    };
  }, [isOpen, currentUser?.id]);

  // ── Socket: new messages → unread + last message preview ─────────────────
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onMsg = (msg) => {
      if (msg.recipient_id !== currentUser.id) return;
      if (seenMsgIds.current.has(msg.id)) return;
      seenMsgIds.current.add(msg.id);

      playPing();

      // Update last message preview
      setLastMsgs(p => ({
        ...p,
        [msg.sender_id]: { text: (msg.content || '').substring(0, 50), ts: msg.created_at },
      }));

      // Increment unread only if that chat isn't open
      setSelectedContact(current => {
        if (String(current?.id) !== String(msg.sender_id)) {
          setUnread(p => ({ ...p, [msg.sender_id]: (p[msg.sender_id] || 0) + 1 }));
        }
        return current;
      });
    };

    socket.on('message:new', onMsg);
    return () => socket.off('message:new', onMsg);
  }, [currentUser?.id]);

  // ── Socket: incoming call — handled by MessageNotificationToast globally ──
  // Only handle call:end to close any open call modal
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = getSocket();
    if (!socket) return;
    const onSignal = (data) => {
      if (data?.type === 'call:end') {
        setCallOpen(false);
        setCallData(null);
      }
    };
    socket.on('call:signal', onSignal);
    return () => socket.off('call:signal', onSignal);
  }, [currentUser?.id]);

  // ── Toggle star (API) ─────────────────────────────────────────────────────
  const handleToggleStar = useCallback(async (userId) => {
    const next = stars.includes(userId) ? stars.filter(id => id !== userId) : [...stars, userId];
    setStars(next);
    // Fire-and-forget to API
    request('/user-prefs/stars', {
      method: 'PUT',
      body: JSON.stringify({ stars: next }),
    }).catch(() => {});
  }, [stars]);

  // ── Select contact ────────────────────────────────────────────────────────
  const handleSelect = useCallback((contact) => {
    setSelectedContact(contact);
    setUnread(p => { const n = { ...p }; delete n[contact.id]; return n; });
  }, []);

  // ── Close ─────────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setSelectedContact(null);
    onClose();
  }, [onClose]);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const displayList = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = allUsers.filter(u =>
      !q || u.name?.toLowerCase().includes(q) || u.role?.includes(q)
    );
    if (tab === 'starred') list = list.filter(u => stars.includes(u.id));

    // Sort: starred first, then by unread, then most recent message, then alphabetical
    return list.sort((a, b) => {
      const aStarred = stars.includes(a.id) ? 1 : 0;
      const bStarred = stars.includes(b.id) ? 1 : 0;
      if (bStarred !== aStarred) return bStarred - aStarred;
      const aUnread = unread[a.id] || 0;
      const bUnread = unread[b.id] || 0;
      if (bUnread !== aUnread) return bUnread - aUnread;
      const aTs = lastMsgs[a.id]?.ts ? new Date(lastMsgs[a.id].ts).getTime() : 0;
      const bTs = lastMsgs[b.id]?.ts ? new Date(lastMsgs[b.id].ts).getTime() : 0;
      if (bTs !== aTs) return bTs - aTs;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [allUsers, search, tab, stars, unread, lastMsgs]);

  const totalUnread = useMemo(() => Object.values(unread).reduce((a, b) => a + b, 0), [unread]);

  if (!currentUser) return null;

  return (
    <>
      {/* Left-edge nav peek */}
      {isOpen && (
        <LeftEdgePeek
          currentUser={currentUser}
          onNavigate={(path) => { handleClose(); window.location.hash = path; }}
        />
      )}

      {/* Main overlay */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex" style={{ background: '#f3f4f6' }}>

          {/* ── Left panel ── */}
          <div
            className="w-[300px] flex-shrink-0 h-full flex flex-col"
            style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-gray-900">Messages</h2>
                {totalUnread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
                <Search size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search people..."
                  className="flex-1 bg-transparent border-0 outline-none text-[13px] text-gray-700 placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={12} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-3 pb-3 flex-shrink-0">
              {[
                { id: 'all',     label: 'All' },
                { id: 'starred', label: '⭐ Close Friends' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                    tab === t.id ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={22} className="animate-spin text-gray-300" />
                </div>
              ) : displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                  <Users size={28} className="text-gray-300" />
                  <p className="text-[13px] font-semibold text-gray-400">
                    {tab === 'starred' ? 'No close friends yet' : search ? 'No results' : 'No people found'}
                  </p>
                  {tab === 'starred' && (
                    <p className="text-[11px] text-gray-400">Star someone in the All tab to add them here</p>
                  )}
                </div>
              ) : (
                displayList.map(u => (
                  <ContactRow
                    key={u.id}
                    contact={u}
                    isSelected={selectedContact?.id === u.id}
                    unread={unread[u.id] || 0}
                    lastMsg={lastMsgs[u.id]?.text || ''}
                    lastMsgTs={lastMsgs[u.id]?.ts || ''}
                    online={onlineUsers.has(u.id)}
                    starred={stars.includes(u.id)}
                    onSelect={handleSelect}
                    onToggleStar={handleToggleStar}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 h-full bg-white">
            {selectedContact ? (
              <ChatView
                isOpen
                onClose={() => setSelectedContact(null)}
                currentUser={currentUser}
                otherUser={selectedContact}
                onStartCall={({ currentUser: cu, otherUser: ou, preferVideo }) => {
                  setCallData({ currentUser: cu, otherUser: ou, preferVideo, initiator: true });
                  setCallOpen(true);
                }}
                isInline
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Call modal */}
      {callOpen && callData && createPortal(
        <CallModal
          isOpen
          onClose={() => { setCallOpen(false); setCallData(null); }}
          currentUser={callData.currentUser}
          otherUser={callData.otherUser}
          preferVideo={callData.preferVideo}
          initiator={callData.initiator}
        />,
        document.body
      )}
    </>
  );
};
