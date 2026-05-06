import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Users, MessageCircle, Video, Phone, UserPlus, X, Check,
  Clock, Bell, Star, ChevronRight, Loader2, ArrowLeft
} from 'lucide-react'
import { ChatView } from '../../../components/messaging/ChatView'
import { CallModal } from '../../../components/messaging/CallModal'
import { IncomingCallOverlay } from '../../../components/messaging/IncomingCallOverlay'
import { request } from '../../../utils/apiClient'
import { getSocket } from '../../../utils/socketClient'
import { getFromStorage, KEYS } from '../../../data/schema'

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_COLOR = {
  teacher: '#a855f7',
  student: '#3b82f6',
  parent:  '#10b981',
  admin:   '#f59e0b',
  driver:  '#ef4444',
}

const LS_REQUESTS_KEY  = 'comm_hub_friend_requests'   // [{id,from,to,fromName,fromRole,ts}]
const LS_CONTACTS_KEY  = 'comm_hub_contacts'           // [{id,name,role,accepted}]
const LS_STARS_KEY     = 'comm_hub_stars'              // [userId, ...]
const LS_UNREAD_KEY    = 'comm_hub_unread'             // {userId: count}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
const lsSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ─── Web Audio ping ───────────────────────────────────────────────────────────
const playPing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
    setTimeout(() => ctx.close(), 500)
  } catch {}
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 40, showOnline = false, online = false }) => {
  const color = ROLE_COLOR[user?.role] || '#6b7280'
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-bold select-none"
        style={{ background: color, fontSize: size * 0.38 }}
      >
        {user?.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-gray-300'}`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  )
}

// ─── Role badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
  <span
    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
    style={{ background: `${ROLE_COLOR[role] || '#6b7280'}18`, color: ROLE_COLOR[role] || '#6b7280' }}
  >
    {role}
  </span>
)

// ─── ContactRow ───────────────────────────────────────────────────────────────
const ContactRow = ({ contact, isSelected, unread = 0, lastMsg = '', online = false, starred = false, onSelect, onStar }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={() => onSelect(contact)}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
    }`}
  >
    <Avatar user={contact} size={44} showOnline online={online} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[14px] font-semibold text-gray-800 truncate">{contact.name}</span>
        {lastMsg && (
          <span className="text-[10px] text-gray-400 flex-shrink-0">
            {new Date(contact.lastMsgTs || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-1 mt-0.5">
        <span className="text-[12px] text-gray-400 truncate">{lastMsg || <RoleBadge role={contact.role} />}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onStar(contact.id) }}
            className={`p-0.5 rounded transition-opacity ${starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
          >
            <Star size={13} className={starred ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
          </button>
        </div>
      </div>
    </div>
  </motion.div>
)

// ─── RequestRow ──────────────────────────────────────────────────────────────
const RequestRow = ({ req, onAccept, onDecline }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50"
  >
    <Avatar user={{ name: req.fromName, role: req.fromRole }} size={40} />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-gray-800 truncate">{req.fromName}</p>
      <RoleBadge role={req.fromRole} />
    </div>
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        onClick={() => onDecline(req.id)}
        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors"
      >
        <X size={14} className="text-gray-500" />
      </button>
      <button
        onClick={() => onAccept(req)}
        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
      >
        <Check size={14} className="text-white" />
      </button>
    </div>
  </motion.div>
)

// ─── PeopleRow ────────────────────────────────────────────────────────────────
const PeopleRow = ({ user, status, onAdd, online = false }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group"
  >
    <Avatar user={user} size={40} showOnline online={online} />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-gray-800 truncate">{user.name}</p>
      <RoleBadge role={user.role} />
    </div>
    <div className="flex-shrink-0">
      {status === 'accepted' ? (
        <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
          <Check size={11} /> Friends
        </span>
      ) : status === 'pending' ? (
        <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
          <Clock size={11} /> Pending
        </span>
      ) : (
        <button
          onClick={() => onAdd(user)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[12px] font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <UserPlus size={12} /> Add
        </button>
      )}
    </div>
  </motion.div>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({
  currentUser,
  contacts,
  requests,
  allUsers,
  onlineUsers,
  unread,
  stars,
  selectedContact,
  onSelectContact,
  onAcceptRequest,
  onDeclineRequest,
  onAddFriend,
  onToggleStar,
  onClose,
}) => {
  const [tab, setTab] = useState('chats')
  const [search, setSearch] = useState('')

  const totalUnread = useMemo(() => Object.values(unread).reduce((a, b) => a + b, 0), [unread])

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase()
    return contacts.filter(c => c.name?.toLowerCase().includes(q))
  }, [contacts, search])

  const starredContacts = useMemo(() => filteredContacts.filter(c => stars.includes(c.id)), [filteredContacts, stars])
  const regularContacts = useMemo(() => filteredContacts.filter(c => !stars.includes(c.id)), [filteredContacts, stars])

  const filteredPeople = useMemo(() => {
    const q = search.toLowerCase()
    return allUsers.filter(u => u.id !== currentUser?.id && u.name?.toLowerCase().includes(q))
  }, [allUsers, search, currentUser?.id])

  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase()
    return requests.filter(r => r.fromName?.toLowerCase().includes(q))
  }, [requests, search])

  const getPeopleStatus = (userId) => {
    if (contacts.some(c => c.id === userId)) return 'accepted'
    // Check if we sent them a request (tracked via _pendingRequest flag on user object)
    const u = allUsers.find(u => u.id === userId)
    if (u?._pendingRequest) return 'pending'
    return 'none'
  }

  const TABS = [
    { id: 'chats',    label: 'Chats',    icon: MessageCircle, count: totalUnread },
    { id: 'requests', label: 'Requests', icon: Clock,         count: requests.length },
    { id: 'people',   label: 'People',   icon: Users,         count: 0 },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-gray-900">Messages</h2>
          {totalUnread > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <Bell size={18} className="text-gray-600" />
            {totalUnread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
          <button
            onClick={() => { setTab('people') }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Find people"
          >
            <UserPlus size={18} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="flex-shrink-0">
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 pb-3 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
              tab === t.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                tab === t.id ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-1 pb-4 no-scrollbar">
        <AnimatePresence mode="wait">
          {tab === 'chats' && (
            <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <MessageCircle size={32} className="text-gray-300" />
                  <p className="text-[13px] font-semibold text-gray-400">No conversations yet</p>
                  <p className="text-[11px] text-gray-400">Add friends to start chatting</p>
                </div>
              ) : (
                <>
                  {starredContacts.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                        ⭐ Close Friends
                      </p>
                      {starredContacts.map(c => (
                        <ContactRow
                          key={c.id}
                          contact={c}
                          isSelected={selectedContact?.id === c.id}
                          unread={unread[c.id] || 0}
                          lastMsg={c.lastMsg || ''}
                          online={onlineUsers.has(c.id)}
                          starred
                          onSelect={onSelectContact}
                          onStar={onToggleStar}
                        />
                      ))}
                    </div>
                  )}
                  {regularContacts.length > 0 && (
                    <div>
                      {starredContacts.length > 0 && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                          All Chats
                        </p>
                      )}
                      {regularContacts.map(c => (
                        <ContactRow
                          key={c.id}
                          contact={c}
                          isSelected={selectedContact?.id === c.id}
                          unread={unread[c.id] || 0}
                          lastMsg={c.lastMsg || ''}
                          online={onlineUsers.has(c.id)}
                          starred={false}
                          onSelect={onSelectContact}
                          onStar={onToggleStar}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {tab === 'requests' && (
            <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <Clock size={32} className="text-gray-300" />
                  <p className="text-[13px] font-semibold text-gray-400">No pending requests</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredRequests.map(r => (
                    <RequestRow
                      key={r.id}
                      req={r}
                      onAccept={onAcceptRequest}
                      onDecline={onDeclineRequest}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {tab === 'people' && (
            <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredPeople.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                  <Users size={32} className="text-gray-300" />
                  <p className="text-[13px] font-semibold text-gray-400">No users found</p>
                </div>
              ) : (
                filteredPeople.map(u => (
                  <PeopleRow
                    key={u.id}
                    user={u}
                    status={getPeopleStatus(u.id)}
                    online={onlineUsers.has(u.id)}
                    onAdd={onAddFriend}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── LeftEdgePeek — hover left edge to see app nav sidebar slide in ──────────
const LeftEdgePeek = ({ currentUser, onNavigate }) => {
  const [hovered, setHovered] = useState(false)

  const navItems = [
    { label: 'Dashboard', path: `/${currentUser?.role}/dashboard` },
    { label: 'Assignments', path: `/${currentUser?.role}/assignments` },
    { label: 'Grades', path: `/${currentUser?.role}/grades` },
    { label: 'Timetable', path: `/${currentUser?.role}/timetable` },
    { label: 'Attendance', path: `/${currentUser?.role}/attendance` },
    { label: 'AI Assistant', path: `/${currentUser?.role}/ai-lab` },
    { label: 'Nexus Hub', path: `/${currentUser?.role}/nexus` },
  ]

  return (
    <div
      className="fixed left-0 top-0 h-full z-[9998] flex items-stretch"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Invisible 16px hover strip on the left edge */}
      <div className="w-4 h-full" />

      {/* Sliding nav panel */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="w-[240px] h-full flex flex-col shadow-2xl"
            style={{ background: '#ffffff', borderRight: '1px solid #e5e7eb' }}
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">Cornerstone</p>
                  <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
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

            {/* User footer */}
            <div className="px-3 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: ROLE_COLOR[currentUser?.role] || '#6b7280' }}>
                  {currentUser?.name?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
      <MessageCircle size={36} className="text-gray-300" />
    </div>
    <div>
      <p className="text-[16px] font-bold text-gray-700">Your messages</p>
      <p className="text-[13px] text-gray-400 mt-1">Select a conversation to start chatting</p>
    </div>
  </div>
)

// ─── Main CommunicationHub ───────────────────────────────────────────────────
export const CommunicationHub = ({ isOpen, onClose, currentUser }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState(() => lsGet(LS_CONTACTS_KEY, []))
  const [requests, setRequests] = useState(() => lsGet(LS_REQUESTS_KEY, []).filter(r => r.to === currentUser?.id))
  const [allUsers, setAllUsers] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [unread, setUnread] = useState(() => lsGet(LS_UNREAD_KEY, {}))
  const [stars, setStars] = useState(() => lsGet(LS_STARS_KEY, []))
  const [selectedContact, setSelectedContact] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(false)

  // ── Call state ─────────────────────────────────────────────────────────────
  const [callOpen, setCallOpen] = useState(false)
  const [callData, setCallData] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)

  // ── Refs ───────────────────────────────────────────────────────────────────
  const lastMessageIdRef = useRef(new Set())

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => { lsSet(LS_CONTACTS_KEY, contacts) }, [contacts])
  useEffect(() => { lsSet(LS_UNREAD_KEY, unread) }, [unread])
  useEffect(() => { lsSet(LS_STARS_KEY, stars) }, [stars])

  // ── Load all users + friends + requests from API ──────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser) return
    let cancelled = false

    const loadAll = async () => {
      setLoadingUsers(true)
      try {
        const [usersRes, friendsRes, requestsRes] = await Promise.allSettled([
          request('/school/users?limit=500'),
          request('/api/friends'),
          request('/api/friends/requests'),
        ])

        if (cancelled) return

        // All users
        if (usersRes.status === 'fulfilled') {
          const list = usersRes.value.users || usersRes.value.items || (Array.isArray(usersRes.value) ? usersRes.value : [])
          setAllUsers(list.filter(u => String(u.id) !== String(currentUser.id)))
        }

        // Accepted friends → contacts
        if (friendsRes.status === 'fulfilled') {
          const friends = friendsRes.value.friends || []
          // Enrich with user data
          const allU = usersRes.status === 'fulfilled'
            ? (usersRes.value.users || usersRes.value.items || [])
            : []
          const enriched = friends.map(f => {
            const userData = allU.find(u => u.id === f.id)
            return {
              id: f.id,
              name: f.name || userData?.name || 'Unknown',
              role: f.role || userData?.role || 'student',
              lastMsg: '',
              lastMsgTs: null,
              accepted: true,
            }
          }).filter(f => f.name !== 'Unknown' || f.id)
          setContacts(enriched)
        }

        // Incoming requests
        if (requestsRes.status === 'fulfilled') {
          setRequests(requestsRes.value.requests || [])
        }
      } catch (err) {
        console.error('[CommunicationHub] Load failed:', err)
      } finally {
        if (!cancelled) setLoadingUsers(false)
      }
    }

    loadAll()
    return () => { cancelled = true }
  }, [isOpen, currentUser])

  // ── Socket.IO: online presence ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser) return
    const socket = getSocket()
    if (!socket) return

    // Announce we're online
    socket.emit('user:online', { userId: currentUser.id })

    const handleUserOnline = (data) => {
      if (data?.userId && data.userId !== currentUser.id) {
        setOnlineUsers(prev => new Set(prev).add(data.userId))
      }
    }
    const handleUserOffline = (data) => {
      if (data?.userId) {
        setOnlineUsers(prev => {
          const next = new Set(prev)
          next.delete(data.userId)
          return next
        })
      }
    }
    const handleOnlineList = (data) => {
      if (Array.isArray(data?.users)) {
        setOnlineUsers(new Set(data.users.filter(id => id !== currentUser.id)))
      }
    }

    socket.on('user:online', handleUserOnline)
    socket.on('user:offline', handleUserOffline)
    socket.on('online:list', handleOnlineList)

    // Request current online list
    socket.emit('online:request')

    return () => {
      socket.off('user:online', handleUserOnline)
      socket.off('user:offline', handleUserOffline)
      socket.off('online:list', handleOnlineList)
      socket.emit('user:offline', { userId: currentUser.id })
    }
  }, [isOpen, currentUser])

  // ── Socket.IO: new messages (ping + unread) ───────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser) return
    const socket = getSocket()
    if (!socket) return

    const handleNewMessage = (msg) => {
      // Only process messages sent TO us
      if (msg.recipient_id !== currentUser.id) return
      // Dedupe
      if (lastMessageIdRef.current.has(msg.id)) return
      lastMessageIdRef.current.add(msg.id)

      // Play ping
      playPing()

      // Update last message preview
      setContacts(prev => prev.map(c =>
        c.id === msg.sender_id
          ? { ...c, lastMsg: msg.content?.substring(0, 40) || '', lastMsgTs: msg.created_at }
          : c
      ))

      // Increment unread if chat not open
      if (selectedContact?.id !== msg.sender_id) {
        setUnread(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }))
      }
    }

    socket.on('message:new', handleNewMessage)
    return () => socket.off('message:new', handleNewMessage)
  }, [isOpen, currentUser, selectedContact])

  // ── Socket.IO: incoming friend requests + accepted notifications ──────────
  useEffect(() => {
    if (!isOpen || !currentUser) return
    const socket = getSocket()
    if (!socket) return

    const handleFriendRequest = (req) => {
      // Someone sent us a request
      if (req.to === currentUser.id) {
        setRequests(prev => {
          if (prev.some(r => r.id === req.id)) return prev
          return [req, ...prev]
        })
        playPing()
      }
    }

    const handleFriendAccepted = (data) => {
      // Our request was accepted — add them to contacts
      const { by } = data
      if (by) {
        setContacts(prev => {
          if (prev.some(c => c.id === by.id)) return prev
          return [...prev, { id: by.id, name: by.name, role: by.role, lastMsg: '', lastMsgTs: null, accepted: true }]
        })
      }
    }

    socket.on('friend:request', handleFriendRequest)
    socket.on('friend:accepted', handleFriendAccepted)
    return () => {
      socket.off('friend:request', handleFriendRequest)
      socket.off('friend:accepted', handleFriendAccepted)
    }
  }, [isOpen, currentUser])
  useEffect(() => {
    if (!isOpen || !currentUser) return
    const socket = getSocket()
    if (!socket) return

    const handleCallRing = (data) => {
      if (data.type === 'call:ring' && String(data.peerId) === String(currentUser.id)) {
        setIncomingCall(data)
      }
    }

    socket.on('call:signal', handleCallRing)
    return () => socket.off('call:signal', handleCallRing)
  }, [isOpen, currentUser])

  // ── Friend request handlers (API-backed, cross-device) ────────────────────
  const handleAddFriend = useCallback(async (user) => {
    try {
      await request('/api/friends/request', {
        method: 'POST',
        body: JSON.stringify({ toUserId: user.id }),
      })
      // Mark as pending in UI immediately
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, _pendingRequest: true } : u))
    } catch (err) {
      console.error('[CommunicationHub] Send request failed:', err)
    }
  }, [])

  const handleAcceptRequest = useCallback(async (req) => {
    try {
      const res = await request(`/api/friends/accept/${req.id}`, { method: 'POST' })
      const contact = res.contact || { id: req.from, name: req.fromName, role: req.fromRole }
      setContacts(prev => [...prev, { ...contact, lastMsg: '', lastMsgTs: null, accepted: true }])
      setRequests(prev => prev.filter(r => r.id !== req.id))
    } catch (err) {
      console.error('[CommunicationHub] Accept request failed:', err)
    }
  }, [])

  const handleDeclineRequest = useCallback(async (reqId) => {
    try {
      await request(`/api/friends/request/${reqId}`, { method: 'DELETE' })
      setRequests(prev => prev.filter(r => r.id !== reqId))
    } catch (err) {
      console.error('[CommunicationHub] Decline request failed:', err)
    }
  }, [])

  // ── Contact selection ──────────────────────────────────────────────────────
  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact)
    // Clear unread
    setUnread(prev => {
      const next = { ...prev }
      delete next[contact.id]
      return next
    })
  }, [])

  // ── Star toggle ────────────────────────────────────────────────────────────
  const handleToggleStar = useCallback((userId) => {
    setStars(prev => {
      if (prev.includes(userId)) return prev.filter(id => id !== userId)
      return [...prev, userId]
    })
  }, [])

  // ── Call handlers ──────────────────────────────────────────────────────────
  const handleStartCall = useCallback(({ currentUser, otherUser, preferVideo }) => {
    setCallData({ currentUser, otherUser, preferVideo, initiator: true })
    setCallOpen(true)
  }, [])

  const handleAcceptIncomingCall = useCallback(() => {
    if (!incomingCall) return
    const caller = allUsers.find(u => String(u.id) === String(incomingCall.fromUserId))
    if (!caller) return
    setCallData({
      currentUser,
      otherUser: caller,
      preferVideo: incomingCall.preferVideo || true,
      initiator: false,
    })
    setCallOpen(true)
    setIncomingCall(null)
  }, [incomingCall, allUsers, currentUser])

  const handleDeclineIncomingCall = useCallback(() => {
    setIncomingCall(null)
    const socket = getSocket()
    if (socket && incomingCall) {
      socket.emit('call:signal', {
        peerId: incomingCall.fromUserId,
        type: 'call:end',
        fromUserId: currentUser.id,
      })
    }
  }, [incomingCall, currentUser])

  const handleCloseCall = useCallback(() => {
    setCallOpen(false)
    setCallData(null)
  }, [])

  // ── Close messenger ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setSelectedContact(null)
    onClose()
  }, [onClose])

  if (!currentUser) return null

  return (
    <>
      {/* Left-edge peek — always visible, hover left border to see app nav */}
      {isOpen && (
        <LeftEdgePeek
          currentUser={currentUser}
          onNavigate={(path) => {
            handleClose()
            // Use hash navigation since app uses HashRouter
            window.location.hash = path
          }}
        />
      )}

      {/* Main messenger overlay */}
      {isOpen && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex"
          style={{ background: '#f9fafb' }}
        >
          {/* Left sidebar */}
          <div className="w-[280px] flex-shrink-0 h-full">
            <Sidebar
              currentUser={currentUser}
              contacts={contacts}
              requests={requests}
              allUsers={allUsers}
              onlineUsers={onlineUsers}
              unread={unread}
              stars={stars}
              selectedContact={selectedContact}
              onSelectContact={handleSelectContact}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
              onAddFriend={handleAddFriend}
              onToggleStar={handleToggleStar}
              onClose={handleClose}
            />
          </div>

          {/* Right panel */}
          <div className="flex-1 h-full">
            {selectedContact ? (
              <ChatView
                isOpen
                onClose={() => setSelectedContact(null)}
                currentUser={currentUser}
                otherUser={selectedContact}
                onStartCall={handleStartCall}
                isInline
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </motion.div>,
        document.body
      )}

      {/* Incoming call overlay (portaled above messenger) */}
      {incomingCall && createPortal(
        <IncomingCallOverlay
          isOpen
          callData={incomingCall}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />,
        document.body
      )}

      {/* Call modal (portaled above everything) */}
      {callOpen && callData && createPortal(
        <CallModal
          isOpen
          onClose={handleCloseCall}
          currentUser={callData.currentUser}
          otherUser={callData.otherUser}
          preferVideo={callData.preferVideo}
          initiator={callData.initiator}
        />,
        document.body
      )}
    </>
  )
}
