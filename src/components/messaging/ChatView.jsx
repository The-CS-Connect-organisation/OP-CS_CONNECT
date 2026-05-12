import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Video, Send, Smile, Loader2, ArrowLeft, Image, Paperclip, CheckCheck } from 'lucide-react';
import { useStreamChat, sanitizeId } from '../../hooks/useStreamChat';
import { ensureUserExists } from '../../lib/streamClient';

export const ChatView = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  onStartCall,
  isInline = true,
  prefillMessage = '',
  onPrefillConsumed,
}) => {
  const { client, isConnected, error: connectError } = useStreamChat(currentUser);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !isConnected || !otherUser?.id || !client) return;
    let cancelled = false;
    const otherId = sanitizeId(otherUser.id);
    const myId = sanitizeId(currentUser.id);

    const initChannel = async () => {
      setLoading(true);
      try {
        await ensureUserExists(otherId, otherUser.name, otherUser.role);
        const sortedIds = [myId, otherId].sort();
        const channelId = `dm-${sortedIds[0]}-${sortedIds[1]}`;
        const ch = client.channel('messaging', channelId, {
          members: [myId, otherId],
          name: `${currentUser.name} & ${otherUser.name}`,
        });
        await ch.watch();
        if (cancelled) return;
        setChannel(ch);
        setMessages(ch.state.messages || []);
      } catch (err) {} finally {
        if (!cancelled) setLoading(false);
      }
    };
    initChannel();
    return () => { cancelled = true; };
  }, [isOpen, isConnected, otherUser?.id, currentUser?.id, client]);

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

  // Handle prefilled message from MessageDock
  useEffect(() => {
    if (!prefillMessage || !channel || !isOpen) return;
    const trimmed = prefillMessage.trim();
    if (!trimmed) return;
    const sendPrefill = async () => {
      try {
        await channel.sendMessage({ text: trimmed });
        onPrefillConsumed?.();
      } catch (err) {
        console.error('Failed to send prefilled message:', err);
        onPrefillConsumed?.();
      }
    };
    sendPrefill();
  }, [prefillMessage, channel, isOpen]);

  useEffect(() => {
    if (!isOpen) { setMessages([]); setChannel(null); setText(''); setOtherTyping(false); }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  const handleTyping = useCallback(() => { if (channel) channel.keystroke(); }, [channel]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !channel || sending) return;
    setSending(true);
    try {
      await channel.sendMessage({ text: trimmed });
      setText('');
      inputRef.current?.focus();
    } catch (err) {} finally { setSending(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;
    try {
      setSending(true);
      let response;
      if (file.type.startsWith('image/')) {
        response = await channel.sendImage(file);
        await channel.sendMessage({ text: '', attachments: [{ type: 'image', image_url: response.file, fallback: file.name }] });
      } else {
        response = await channel.sendFile(file);
        await channel.sendMessage({ text: '', attachments: [{ type: 'file', asset_url: response.file, title: file.name, file_size: file.size, mime_type: file.type }] });
      }
    } catch (err) {} finally {
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
  const roleColor = otherUser.role === 'teacher' ? '#a855f7' : otherUser.role === 'student' ? '#3b82f6' : '#10b981';

  return (
    <div className={`flex flex-col h-full w-full ${isInline ? '' : 'rounded-3xl overflow-hidden shadow-2xl bg-white/70 backdrop-blur-xl'}`}
         style={{ background: isInline ? 'transparent' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/30 bg-white/20 backdrop-blur-md z-10 shadow-sm">
        <button onClick={onClose} className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/40 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative shadow-sm" style={{ background: roleColor }}>
          {otherUser.name?.charAt(0) || '?'}
          {isConnected && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white/80 shadow-sm" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold truncate text-gray-800">{otherUser.name}</p>
          <p className="text-[11px] text-gray-500 font-medium">
            {otherTyping ? <span className="text-emerald-500">typing...</span> : isConnected ? 'Active now' : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onStartCall && (
            <>
              <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: false })} className="p-2.5 rounded-full hover:bg-white/50 transition-colors shadow-sm bg-white/30 text-gray-700">
                <Phone size={18} />
              </button>
              <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: true })} className="p-2.5 rounded-full hover:bg-white/50 transition-colors shadow-sm bg-white/30 text-emerald-600">
                <Video size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 no-scrollbar bg-gradient-to-b from-white/10 to-white/5">
        {loading ? (
          <div className="h-full flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/40 shadow-inner">
              <Send size={28} className="text-gray-400 transform -rotate-12" />
            </div>
            <p className="text-base font-semibold text-gray-700">Start a conversation</p>
            <p className="text-sm text-gray-500">Say hi to {otherUser.name?.split(' ')[0]} 👋</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {groupedMessages.map((item, idx) => {
              if (item.type === 'date') return (
                <div key={`date-${idx}`} className="flex justify-center py-2">
                  <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-black/5 text-gray-500 uppercase tracking-wide">{item.date}</span>
                </div>
              );
              const msg = item.msg;
              const isMe = msg.user?.id === myId;
              const hasAttachments = msg.attachments?.length > 0;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {hasAttachments && msg.attachments.map((att, ai) => (
                      <div key={ai} className="mb-1.5 shadow-sm rounded-2xl overflow-hidden">
                        {att.type === 'image' ? (
                          <img src={att.image_url || att.thumb_url} alt="attachment" className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(att.image_url, '_blank')} />
                        ) : (
                          <a href={att.asset_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-sm bg-white/70 backdrop-blur-md text-blue-600 border border-white/40">
                            <Paperclip size={16} /> <span className="truncate max-w-[150px] font-medium">{att.title || 'File'}</span>
                          </a>
                        )}
                      </div>
                    ))}
                    {msg.text && (
                      <div className={`px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ${isMe ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm' : 'bg-white/80 backdrop-blur-md text-gray-800 border border-white/50 rounded-2xl rounded-tl-sm'}`}>
                        <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-medium text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && <CheckCheck size={12} className="text-blue-400" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {otherTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/60 backdrop-blur-md border border-white/40 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-white/40 bg-white/40 backdrop-blur-md z-10 flex items-center gap-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full hover:bg-white/60 transition-colors shadow-sm bg-white/40 text-blue-500 flex-shrink-0" disabled={!isConnected || loading}>
          <Image size={20} />
        </button>
        <div className="flex-1 flex items-center rounded-2xl border border-white/50 bg-white/60 backdrop-blur-md shadow-inner px-4 py-2">
          <input ref={inputRef} value={text} onChange={(e) => { setText(e.target.value); handleTyping(); }} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 bg-transparent border-0 outline-none text-[15px] py-1 text-gray-800 placeholder-gray-400 font-medium" disabled={!isConnected || loading} />
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-full hover:bg-black/5 transition-colors" disabled={!isConnected}>
            <Paperclip size={18} className="text-gray-400" />
          </button>
        </div>
        {text.trim() ? (
          <motion.button initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={sending || !isConnected} className="p-3 rounded-full bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors flex-shrink-0">
            {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </motion.button>
        ) : (
          <button className="p-3 rounded-full hover:bg-white/60 transition-colors shadow-sm bg-white/40 text-gray-400 flex-shrink-0">
            <Smile size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
