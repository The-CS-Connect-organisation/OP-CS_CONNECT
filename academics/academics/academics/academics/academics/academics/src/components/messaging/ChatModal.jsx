import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Video, Send, Smile, Loader2, Wifi, WifiOff, ArrowLeft, Image, Paperclip, Check, CheckCheck } from 'lucide-react';
import { useStreamChat, sanitizeId } from '../../hooks/useStreamChat';
import { ensureUserExists } from '../../lib/streamClient';

/**
 * Instagram-style GetStream Chat.
 * Full-screen overlay with conversation view, file attachments, and typing indicators.
 */
export const ChatModal = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  onStartCall,
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

  // Create / join the DM channel when modal opens
  useEffect(() => {
    if (!isOpen || !isConnected || !otherUser?.id || !client) return;

    let cancelled = false;
    const otherId = sanitizeId(otherUser.id);
    const myId = sanitizeId(currentUser.id);

    const initChannel = async () => {
      setLoading(true);
      try {
        // Pre-provision the other user using the dev token hack since we don't have
        // the server-side client privileges to call upsertUsers here.
        await ensureUserExists(otherId, otherUser.name, otherUser.role);

        // Deterministic channel ID for the DM
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
      } catch (err) {
        console.error('[GetStream] Channel init failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initChannel();

    return () => {
      cancelled = true;
    };
  }, [isOpen, isConnected, otherUser?.id, currentUser?.id, client]);

  // Listen for new messages + typing
  useEffect(() => {
    if (!channel) return;

    const onNewMessage = (event) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === event.message.id)) return prev;
        return [...prev, event.message];
      });
    };

    const onTypingStart = (event) => {
      if (event.user?.id !== sanitizeId(currentUser.id)) {
        setOtherTyping(true);
      }
    };
    const onTypingStop = (event) => {
      if (event.user?.id !== sanitizeId(currentUser.id)) {
        setOtherTyping(false);
      }
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

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setChannel(null);
      setText('');
      setOtherTyping(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, otherTyping]);

  // Send typing indicator
  const handleTyping = useCallback(() => {
    if (channel) {
      channel.keystroke();
    }
  }, [channel]);

  // Send message
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !channel || sending) return;

    setSending(true);
    try {
      await channel.sendMessage({ text: trimmed });
      setText('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('[GetStream] Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  // Send file/image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;

    try {
      setSending(true);
      let response;
      if (file.type.startsWith('image/')) {
        response = await channel.sendImage(file);
        await channel.sendMessage({
          text: '',
          attachments: [{ type: 'image', image_url: response.file, fallback: file.name }],
        });
      } else {
        response = await channel.sendFile(file);
        await channel.sendMessage({
          text: '',
          attachments: [{ type: 'file', asset_url: response.file, title: file.name, file_size: file.size, mime_type: file.type }],
        });
      }
    } catch (err) {
      console.error('[GetStream] File upload failed:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (date !== lastDate) {
        groups.push({ type: 'date', date });
        lastDate = date;
      }
      groups.push({ type: 'message', msg });
    });
    return groups;
  }, [messages]);

  if (!currentUser || !otherUser) return null;

  const myId = sanitizeId(currentUser.id);
  const roleColor = otherUser.role === 'teacher' ? '#a855f7' : otherUser.role === 'student' ? '#3b82f6' : '#10b981';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="w-full max-w-md rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: '#ffffff',
              boxShadow: '0 40px 100px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.08)',
              height: 'min(680px, 85vh)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header (Instagram-style) ── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: '#f0f0f0', background: '#fafafa' }}>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/05 transition-colors cursor-pointer">
                <ArrowLeft size={20} style={{ color: '#262626' }} />
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative"
                style={{ background: roleColor }}>
                {otherUser.name?.charAt(0) || '?'}
                {isConnected && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#262626' }}>
                  {otherUser.name}
                </p>
                <p className="text-[11px]" style={{ color: '#8e8e8e' }}>
                  {otherTyping ? (
                    <span className="text-emerald-500 font-medium">typing...</span>
                  ) : isConnected ? (
                    'Active now'
                  ) : (
                    'Connecting...'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {onStartCall && (
                  <>
                    <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: false })}
                      className="p-2 rounded-full transition-colors hover:bg-black/05 cursor-pointer">
                      <Phone size={20} style={{ color: '#262626' }} />
                    </button>
                    <button onClick={() => onStartCall({ currentUser, otherUser, preferVideo: true })}
                      className="p-2 rounded-full transition-colors hover:bg-black/05 cursor-pointer">
                      <Video size={20} style={{ color: '#262626' }} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── Messages Area ── */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3"
              style={{ background: '#ffffff' }}
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin" style={{ color: '#c7c7c7' }} />
                </div>
              ) : connectError ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-red-400">{connectError}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center border-2"
                    style={{ borderColor: '#dbdbdb' }}>
                    <Send size={28} style={{ color: '#dbdbdb', transform: 'rotate(-20deg)' }} />
                  </div>
                  <p className="text-base font-semibold" style={{ color: '#262626' }}>
                    Start a conversation
                  </p>
                  <p className="text-sm" style={{ color: '#8e8e8e' }}>
                    Say hi to {otherUser.name?.split(' ')[0]} 👋
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {groupedMessages.map((item, idx) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${idx}`} className="flex justify-center py-3">
                          <span className="text-[11px] font-medium px-3 py-1 rounded-full"
                            style={{ color: '#8e8e8e', background: '#fafafa' }}>
                            {item.date}
                          </span>
                        </div>
                      );
                    }

                    const msg = item.msg;
                    const isMe = msg.user?.id === myId;
                    const hasAttachments = msg.attachments?.length > 0;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Attachments */}
                          {hasAttachments && msg.attachments.map((att, ai) => (
                            <div key={ai} className="mb-1">
                              {att.type === 'image' ? (
                                <img
                                  src={att.image_url || att.thumb_url}
                                  alt={att.fallback || 'image'}
                                  className="rounded-2xl max-w-full max-h-60 object-cover cursor-pointer"
                                  style={{ border: '1px solid #efefef' }}
                                  onClick={() => window.open(att.image_url, '_blank')}
                                />
                              ) : (
                                <a href={att.asset_url} target="_blank" rel="noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                                  style={{
                                    background: isMe ? 'rgba(0,0,0,0.05)' : '#f0f0f0',
                                    color: '#3b82f6',
                                  }}>
                                  <Paperclip size={14} />
                                  <span className="truncate max-w-[150px]">{att.title || 'File'}</span>
                                </a>
                              )}
                            </div>
                          ))}

                          {/* Text bubble */}
                          {msg.text && (
                            <div
                              className="px-3.5 py-2 text-[14px] leading-relaxed"
                              style={
                                isMe
                                  ? {
                                      background: '#3b82f6',
                                      color: '#ffffff',
                                      borderRadius: '20px 20px 4px 20px',
                                    }
                                  : {
                                      background: '#f0f0f0',
                                      color: '#262626',
                                      borderRadius: '20px 20px 20px 4px',
                                    }
                              }
                            >
                              <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          )}

                          {/* Time + read status */}
                          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : ''}`}>
                            <span className="text-[10px]" style={{ color: '#8e8e8e' }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <CheckCheck size={12} style={{ color: '#8e8e8e' }} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Typing indicator */}
                  {otherTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="px-4 py-2.5 rounded-2xl" style={{ background: '#f0f0f0' }}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: '#8e8e8e' }}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Input Area (Instagram-style) ── */}
            <div className="px-3 py-2 border-t flex items-center gap-2"
              style={{ borderColor: '#efefef', background: '#ffffff' }}>
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-black/05 transition-colors cursor-pointer flex-shrink-0"
                disabled={!isConnected || loading}
              >
                <Image size={22} style={{ color: '#3b82f6' }} />
              </button>

              {/* Text input */}
              <div className="flex-1 flex items-center rounded-full border px-3 py-1"
                style={{ borderColor: '#dbdbdb', background: '#fafafa' }}>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Message..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm py-1.5"
                  style={{ color: '#262626' }}
                  disabled={!isConnected || loading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 rounded-full hover:bg-black/05 transition-colors cursor-pointer"
                  disabled={!isConnected}
                >
                  <Paperclip size={18} style={{ color: '#8e8e8e' }} />
                </button>
              </div>

              {/* Send */}
              {text.trim() ? (
                <motion.button
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={sending || !isConnected}
                  className="p-2 rounded-full transition-all cursor-pointer"
                  style={{ color: '#3b82f6' }}
                >
                  {sending ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                </motion.button>
              ) : (
                <button className="p-2 rounded-full cursor-pointer" style={{ color: '#8e8e8e' }}>
                  <Smile size={22} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
