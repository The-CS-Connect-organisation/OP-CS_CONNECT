/**
 * Global message notification toast.
 * Renders via portal, listens to socket message:new events.
 * Shows a popup when a message arrives and the user is NOT in the Messages tab.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Video } from 'lucide-react';
import { getSocket } from '../../utils/socketClient';
import { useNavigate, useLocation } from 'react-router-dom';

const ROLE_COLOR = {
  teacher: '#a855f7', student: '#3b82f6', parent: '#10b981',
  admin: '#f59e0b', driver: '#ef4444',
};

// Web Audio ping
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
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => ctx.close(), 600);
  } catch {}
};

// Incoming call ringtone
const playRingtone = (ctx) => {
  try {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine'; osc1.frequency.value = 480;
    osc2.type = 'sine'; osc2.frequency.value = 440;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
    osc1.start(); osc2.start();
    osc1.stop(ctx.currentTime + 1.0); osc2.stop(ctx.currentTime + 1.0);
  } catch {}
};

export const MessageNotificationToast = ({ currentUser, allUsers = [] }) => {
  const [toasts, setToasts] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const seenIds = useRef(new Set());
  const ringCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOnComms = location.pathname.includes('/comms');

  const removeToast = useCallback((id) => {
    setToasts(p => p.filter(t => t.id !== id));
  }, []);

  // Message notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onMsg = (msg) => {
      if (msg.recipient_id !== currentUser.id) return;
      if (seenIds.current.has(msg.id)) return;
      seenIds.current.add(msg.id);

      // Don't show toast if already on comms page
      if (isOnComms) return;

      playPing();

      const sender = allUsers.find(u => u.id === msg.sender_id);
      const toast = {
        id: msg.id || `toast-${Date.now()}`,
        senderName: sender?.name || 'Someone',
        senderRole: sender?.role || 'student',
        senderId: msg.sender_id,
        text: (msg.content || '').substring(0, 60),
        ts: Date.now(),
      };

      setToasts(p => [toast, ...p].slice(0, 3));

      // Auto-dismiss after 5s
      setTimeout(() => removeToast(toast.id), 5000);
    };

    socket.on('message:new', onMsg);
    return () => socket.off('message:new', onMsg);
  }, [currentUser?.id, isOnComms, allUsers, removeToast]);

  // Incoming call notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    const socket = getSocket();
    if (!socket) return;

    const onSignal = (data) => {
      if (data?.type !== 'call:ring') return;
      if (String(data?.fromUserId) === String(currentUser.id)) return;

      const caller = allUsers.find(u => String(u.id) === String(data.fromUserId));
      setIncomingCall({
        fromUserId: data.fromUserId,
        callerName: data.callerName || caller?.name || 'Unknown',
        callerRole: caller?.role || 'student',
        preferVideo: data.preferVideo ?? true,
      });

      // Start ringtone
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) {
          const ctx = new Ctx();
          ringCtxRef.current = ctx;
          playRingtone(ctx);
          ringIntervalRef.current = setInterval(() => playRingtone(ctx), 3000);
        }
      } catch {}
    };

    const onCallEnd = (data) => {
      if (String(data?.fromUserId) !== String(incomingCall?.fromUserId)) return;
      stopRing();
      setIncomingCall(null);
    };

    socket.on('call:signal', onSignal);
    socket.on('call:signal', onCallEnd);
    return () => {
      socket.off('call:signal', onSignal);
      socket.off('call:signal', onCallEnd);
    };
  }, [currentUser?.id, allUsers, incomingCall?.fromUserId]);

  const stopRing = () => {
    clearInterval(ringIntervalRef.current);
    if (ringCtxRef.current && ringCtxRef.current.state !== 'closed') {
      ringCtxRef.current.close().catch(() => {});
    }
    ringCtxRef.current = null;
  };

  const handleDeclineCall = () => {
    stopRing();
    const socket = getSocket();
    if (socket && incomingCall) {
      socket.emit('call:signal', { peerId: incomingCall.fromUserId, type: 'call:end', fromUserId: currentUser.id });
    }
    setIncomingCall(null);
  };

  const handleAcceptCall = () => {
    stopRing();
    // Navigate to comms and let the hub handle the call
    const role = currentUser?.role;
    navigate(`/${role}/comms`);
    setIncomingCall(null);
  };

  return createPortal(
    <>
      {/* Message toasts — bottom right */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl cursor-pointer"
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                width: 300,
              }}
              onClick={() => {
                removeToast(toast.id);
                navigate(`/${currentUser?.role}/comms`);
              }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: ROLE_COLOR[toast.senderRole] || '#6b7280' }}
              >
                {toast.senderName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{toast.senderName}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={12} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-[12px] text-gray-500 truncate mt-0.5">{toast.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Incoming call overlay — top center */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl"
            style={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              minWidth: 320,
            }}
          >
            {/* Pulsing avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: ROLE_COLOR[incomingCall.callerRole] || '#6b7280' }}
                animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: ROLE_COLOR[incomingCall.callerRole] || '#6b7280' }}
              >
                {incomingCall.callerName?.charAt(0)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[15px] truncate">{incomingCall.callerName}</p>
              <p className="text-white/50 text-[12px] font-medium">
                {incomingCall.preferVideo ? 'Incoming video call...' : 'Incoming voice call...'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Decline */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleDeclineCall}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: '#ef4444', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
              >
                <Phone size={18} className="text-white rotate-[135deg]" />
              </motion.button>
              {/* Accept */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={handleAcceptCall}
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: '#22c55e', boxShadow: '0 4px 16px rgba(34,197,94,0.4)' }}
              >
                {incomingCall.preferVideo
                  ? <Video size={18} className="text-white" />
                  : <Phone size={18} className="text-white" />
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};
