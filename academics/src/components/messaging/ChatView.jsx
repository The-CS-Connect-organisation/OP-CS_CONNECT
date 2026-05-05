import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Send, Smile, Loader2, ArrowLeft, Image, Paperclip, CheckCheck, AlertCircle } from 'lucide-react';
import { useStreamChat, sanitizeId } from '../../hooks/useStreamChat';

export const ChatView = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  onStartCall,
  isInline = true
}) => {
  const { client, isConnected, error: connectError } = useStreamChat(currentUser);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [channelError, setChannelError] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Init channel — connect to GetStream inline, don't wait for isConnected hook
  useEffect(() => {
    if (!isOpen || !otherUser?.id || !client) return;
    let cancelled = false;
    const otherId = sanitizeId(otherUser.id);
    const myId = sanitizeId(currentUser.id);

    const initChannel = async () => {
      setLoading(true);
      setChannelError(null);
      try {
        // Ensure client is connected — connect inline if not already
        if (!client.userID) {
          const { createUserToken } = await import('../../lib/streamClient');
          const token = await createUserToken(myId);
          await client.connectUser(
            { id: myId, name: currentUser.name, role: currentUser.role || 'user' },
            token
          );
        }

        // Deterministic channel ID — sorted, max 64 chars
        const shortMyId = myId.substring(0, 20);
        const shortOtherId = otherId.substring(0, 20);
        const sortedIds = [shortMyId, shortOtherId].sort();
        const channelId = `dm${sortedIds[0]}${sortedIds[1]}`.substring(0, 64);

        const ch = client.channel('messaging', channelId, {
          members: [myId, otherId],
          name: `${currentUser.name} & ${otherUser.name}`,
        });

        await ch.watch();
        if (cancelled) return;
        setChannel(ch);
        setMessages(ch.state.messages || []);
      } catch (err) {
        console.error('[ChatView] Channel init failed:', err);
        if (!cancelled) setChannelError(err?.message || 'Could not open chat. Try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initChannel();
    return () => { cancelled = true; };
  }, [isOpen, otherUser?.id, currentUser?.id, client]);

  // Real-time message + typing listeners
  useEffect(() => {
    if (!channel) return;
    const onNewMessage = (event) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === event.message.id)) return prev;
        return [...prev, event.message];
      });
    };
    const onTypingStart = (event) => {
      if (event.user?.id !== sanitizeId(currentUser.id)) setOtherTyping(true);
    };
    const onTypingStop = (event) => {
      if (event.user?.id !== sanitizeId(currentUser.id)) setOtherTyping(false);
    };
    channel.on('message.new', onNewMessage);
    channel.on('typing.start', onTypingStart);
    channel.on('typing.stop', onTypingStop);
    return () => {
      channel.off('message.new', onNewMessage);
      channel.off('typing.start', onTypingStart);
      channel.off('typing.stop', onTypingStop);
    };
  }, [channel, currentUser?.id]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setChannel(null);
      setText('');
      setOtherTyping(false);
      setChannelError(null);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  const handleTyping = useCallback(() => {
    if (channel) channel.keystroke().catch(() => {});
  }, [channel]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !channel || sending) return;
    setSending(true);
    const optimisticText = trimmed;
    setText('');
    try {
      await channel.sendMessage({ text: optimisticText });
      inputRef.current?.focus();
    } catch (err) {
      console.error('[ChatView] Send failed:', err);
      setText(optimisticText); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;
    try {
      setSending(true);
      if (file.type.startsWith('image/')) {
        const response = await channel.sendImage(file);
        await channel.sendMessage({ text: '', attachments: [{ type: 'image', image_url: response.file, fallback: file.name }] });
      } else {
        const response = await channel.sendFile(file);
        await channel.sendMessage({ text: '', attachments: [{ type: 'file', asset_url: response.file, title: file.name, file_size: file.size, mime_type: file.type }] });
      }
    } catch (err) {
      console.error('[ChatView] File upload failed:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

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

  const myId = sanitizeId(currentUser.id);
  const roleColor = otherUser.role === 'teacher' ? '#a855f7' : otherUser.role === 'student' ? '#3b82f6' : otherUser.role === 'admin' ? '#f59e0b' : '#10b981';

  // Can send if channel is ready — don't block on isConnected
  const canSend = !!channel && !sending;

  return (
    <div
      className={`flex flex-col h-full w-full ${isInline ? '' : 'rounded-3xl overflow-hidden shadow-2xl'}`}
      style={{
        background: isInline ? 'transparent' : 'rgba(255,255,255,0.85)',
        backdropFilter: isInline ? 'none' : 'blur(20px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/30 bg-white/30 backdrop-blur-md z-10 shadow-sm flex-shrink-0">
        <button onClick={onClose} className="md:hidden p-2 -ml-1 rounded-full hover:bg-white/40 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative shadow-sm" style={{ background: roleColor }}>
          {otherUser.name?.charAt(0) || '?'}
          {isConnected && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold truncate text-gray-800">{otherUser.name}</p>
          <p className="text-[11px] font-medium" style={{ color: otherTyping ? '#10b981' : '#9ca3af' }}>
            {otherTyping ? 'typing...' : isConnected ? 'Active now' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onStartCall && (
            <>
              <button
                onClick={() => onStartCall({ currentUser, otherUser, preferVideo: false })}
                className="p-2.5 rounded-full hover:bg-white/50 transition-colors bg-white/30 text-gray-700"
              >
                <Phone size={17} />
              </button>
              <button
                onClick={() => onStartCall({ currentUser, otherUser, preferVideo: true })}
                className="p-2.5 rounded-full hover:bg-white/50 transition-colors bg-white/30 text-emerald-600"
              >
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
        ) : channelError ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm font-semibold text-gray-700">Couldn't open chat</p>
            <p className="text-xs text-gray-500">{channelError}</p>
            <button
              onClick={() => { setChannelError(null); setLoading(false); }}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : !isConnected && !channel ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 opacity-60">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Connecting to chat...</p>
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
              const isMe = msg.user?.id === myId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Attachments */}
                    {msg.attachments?.map((att, ai) => (
                      <div key={ai} className="mb-1 rounded-2xl overflow-hidden shadow-sm">
                        {att.type === 'image' ? (
                          <img
                            src={att.image_url || att.thumb_url}
                            alt="attachment"
                            className="max-w-full max-h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(att.image_url, '_blank')}
                          />
                        ) : (
                          <a href={att.asset_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-white/70 text-blue-600 border border-white/40">
                            <Paperclip size={14} />
                            <span className="truncate max-w-[140px] font-medium">{att.title || 'File'}</span>
                          </a>
                        )}
                      </div>
                    ))}
                    {/* Text bubble */}
                    {msg.text && (
                      <div className={`px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white/80 backdrop-blur-md text-gray-800 border border-white/50 rounded-2xl rounded-tl-sm'
                      }`}>
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                    {/* Timestamp */}
                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <CheckCheck size={11} className="text-blue-400" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
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
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full hover:bg-white/60 transition-colors bg-white/40 text-blue-500 flex-shrink-0"
          disabled={!canSend}
        >
          <Image size={19} />
        </button>

        <div className="flex-1 flex items-center rounded-2xl border border-white/50 bg-white/70 backdrop-blur-md shadow-inner px-3 py-1.5 gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder={channel ? 'Message...' : 'Connecting...'}
            className="flex-1 bg-transparent border-0 outline-none text-[14px] py-1 text-gray-800 placeholder-gray-400 font-medium"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-full hover:bg-black/5 transition-colors flex-shrink-0"
          >
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
