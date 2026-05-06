import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Send, Smile, Loader2, ArrowLeft, Image, Paperclip, CheckCheck, AlertCircle } from 'lucide-react';
import { request } from '../../utils/apiClient';
import { getSocket } from '../../utils/socketClient';
import { getFromStorage, KEYS } from '../../data/schema';

/**
 * Firebase-backed chat view.
 * Messages are stored in Firebase RTDB via the backend API.
 * Real-time updates come through Socket.IO (message:new event).
 * GetStream is NOT used here — only for calls.
 */
export const ChatView = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  onStartCall,
  isInline = true
}) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Load message history ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !otherUser?.id || !currentUser?.id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    request(`/school/messages?otherUserId=${encodeURIComponent(otherUser.id)}&userId=${encodeURIComponent(currentUser.id)}`)
      .then(res => {
        if (cancelled) return;
        setMessages(res.messages || []);
      })
      .catch(err => {
        if (!cancelled) setError(err?.message || 'Could not load messages');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isOpen, otherUser?.id, currentUser?.id]);

  // ── Real-time Socket.IO listener ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser?.id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const isRelevant =
        (msg.sender_id === currentUser.id && msg.recipient_id === otherUser?.id) ||
        (msg.sender_id === otherUser?.id && msg.recipient_id === currentUser.id);
      if (!isRelevant) return;

      setMessages(prev => {
        // If we already have this message (by id), skip
        if (prev.some(m => m.id === msg.id)) return prev;
        // Remove any pending optimistic message with same content from same sender
        const withoutOptimistic = prev.filter(m =>
          !(m._pending && m.sender_id === msg.sender_id && m.content === msg.content)
        );
        return [...withoutOptimistic, msg];
      });
    };

    const handleTypingStart = (data) => {
      if (data?.userId === otherUser?.id) setOtherTyping(true);
    };
    const handleTypingStop = (data) => {
      if (data?.userId === otherUser?.id) setOtherTyping(false);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [isOpen, currentUser?.id, otherUser?.id]);

  // ── Reset on close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setText('');
      setOtherTyping(false);
      setError(null);
    }
  }, [isOpen]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleTypingIndicator = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing:start', { userId: currentUser.id, toUserId: otherUser?.id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing:stop', { userId: currentUser.id, toUserId: otherUser?.id });
    }, 2000);
  }, [currentUser?.id, otherUser?.id]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    // Add optimistic message immediately for instant feedback
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender_id: currentUser.id,
      recipient_id: otherUser.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      _pending: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await request('/school/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId: otherUser.id, content: trimmed }),
      });
      // Remove the optimistic message — the socket event will add the real one
      // If socket doesn't fire (offline), replace optimistic with confirmed version
      setTimeout(() => {
        setMessages(prev => {
          const stillHasOptimistic = prev.some(m => m.id === tempId);
          if (!stillHasOptimistic) return prev; // socket already replaced it
          // Replace optimistic with confirmed (no socket)
          return prev.map(m => m.id === tempId ? { ...m, _pending: false } : m);
        });
      }, 2000);
      inputRef.current?.focus();
    } catch (err) {
      console.error('[ChatView] Send failed:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Group messages by date ────────────────────────────────────────────────
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

  if (!currentUser || !otherUser || !isOpen) return null;

  const roleColor = otherUser.role === 'teacher' ? '#a855f7' : otherUser.role === 'student' ? '#3b82f6' : otherUser.role === 'admin' ? '#f59e0b' : '#10b981';
  const canSend = !!text.trim() && !sending;

  return (
    <div
      className={`flex flex-col h-full w-full ${isInline ? '' : 'rounded-3xl overflow-hidden shadow-2xl'}`}
      style={{ background: isInline ? 'transparent' : 'rgba(255,255,255,0.85)', backdropFilter: isInline ? 'none' : 'blur(20px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/30 bg-white/30 backdrop-blur-md z-10 shadow-sm flex-shrink-0">
        <button onClick={onClose} className="md:hidden p-2 -ml-1 rounded-full hover:bg-white/40 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative shadow-sm" style={{ background: roleColor }}>
          {otherUser.name?.charAt(0) || '?'}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold truncate text-gray-800">{otherUser.name}</p>
          <p className="text-[11px] font-medium" style={{ color: otherTyping ? '#10b981' : '#9ca3af' }}>
            {otherTyping ? 'typing...' : 'Active now'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onStartCall && (
            <>
              <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: false })}
                className="p-2.5 rounded-full hover:bg-white/50 transition-colors bg-white/30 text-gray-700">
                <Phone size={17} />
              </button>
              <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: true })}
                className="p-2.5 rounded-full hover:bg-white/50 transition-colors bg-white/30 text-emerald-600">
                <Video size={17} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm font-semibold text-gray-700">Couldn't load messages</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/40 shadow-inner">
              <Send size={24} className="text-gray-400 transform -rotate-12" />
            </div>
            <p className="text-base font-semibold text-gray-700">Start a conversation</p>
            <p className="text-sm text-gray-500">Say hi to {otherUser.name?.split(' ')[0]} 👋</p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {groupedMessages.map((item, idx) => {
              if (item.type === 'date') return (
                <div key={`date-${idx}`} className="flex justify-center py-2">
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-black/5 text-gray-500 uppercase tracking-wide">
                    {item.date}
                  </span>
                </div>
              );
              const msg = item.msg;
              const isMe = msg.sender_id === currentUser.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                      isMe
                        ? `bg-blue-500 text-white rounded-2xl rounded-tr-sm ${msg._pending ? 'opacity-60' : ''}`
                        : 'bg-white/80 backdrop-blur-md text-gray-800 border border-white/50 rounded-2xl rounded-tl-sm'
                    }`}>
                      <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && !msg._pending && <CheckCheck size={11} className="text-blue-400" />}
                      {isMe && msg._pending && <Loader2 size={10} className="text-gray-400 animate-spin" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {otherTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/60 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
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
      <div className="px-3 py-2.5 border-t border-white/40 bg-white/50 backdrop-blur-md flex items-center gap-2 flex-shrink-0">
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" />

        <button onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full hover:bg-white/60 transition-colors bg-white/40 text-blue-500 flex-shrink-0">
          <Image size={19} />
        </button>

        <div className="flex-1 flex items-center rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md shadow-inner px-3 py-1.5 gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); handleTypingIndicator(); }}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 bg-transparent border-0 outline-none text-[14px] py-1 text-gray-800 placeholder-gray-400 font-medium"
          />
          <button onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0">
            <Paperclip size={16} className="text-gray-400" />
          </button>
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
              disabled={!canSend}
              className="p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 active:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50"
            >
              {sending ? <Loader2 size={19} className="animate-spin" /> : <Send size={19} />}
            </motion.button>
          ) : (
            <motion.button
              key="smile"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="p-3 rounded-full hover:bg-white/60 transition-colors bg-white/40 text-gray-400 flex-shrink-0"
            >
              <Smile size={19} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
