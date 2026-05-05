import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { getSocket } from '../../utils/socketClient';

// ── WebRTC helpers ────────────────────────────────────────────────────────────
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const sanitize = (id) => String(id || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 64);

// ── Animated background particles ────────────────────────────────────────────
const Particle = ({ delay, duration, x, y, size }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: 'rgba(255,255,255,0.15)' }}
    animate={{ y: [0, -80, 0], opacity: [0, 0.8, 0], scale: [0.5, 1.5, 0.5] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  delay: i * 0.4,
  duration: 4 + (i % 5),
  x: (i * 17) % 100,
  y: (i * 23) % 100,
  size: 4 + (i % 8),
}));

// ── Ringing animation ─────────────────────────────────────────────────────────
const RingingPulse = ({ color = '#3b82f6' }) => (
  <div className="relative flex items-center justify-center">
    {[1, 2, 3].map(i => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{ background: color, opacity: 0.2 }}
        animate={{ scale: [1, 2.5 + i * 0.5], opacity: [0.3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
        initial={{ width: 120, height: 120 }}
      />
    ))}
  </div>
);

// ── Main CallModal ────────────────────────────────────────────────────────────
export const CallModal = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  preferVideo = true,
  initiator = true,
}) => {
  const [status, setStatus] = useState('idle'); // idle | ringing | connecting | connected | media-error | ended
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(preferVideo);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const offerSentRef = useRef(false);
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);

  // ── Ringtone (outgoing) ──────────────────────────────────────────────────
  const startRingtone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const playRing = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const freqs = [480, 440, 480, 440];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.15);
          osc.stop(ctx.currentTime + i * 0.15 + 0.15);
        });
      };

      playRing();
      ringIntervalRef.current = setInterval(playRing, 3000);
    } catch {}
  };

  const stopRingtone = () => {
    clearInterval(ringIntervalRef.current);
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
  };

  // ── Call duration timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'connected') {
      stopRingtone();
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (status !== 'connected') setCallDuration(0);
    }
    if (status === 'ringing') startRingtone();
    if (status === 'ended' || status === 'media-error') stopRingtone();
    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatDuration = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── WebRTC setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !currentUser || !otherUser) return;
    let cancelled = false;

    const socket = getSocket();
    const myId = sanitize(currentUser.id);
    const otherId = sanitize(otherUser.id);

    const sendSignal = (type, payload) => {
      if (socket) socket.emit('call:signal', { peerId: otherUser.id, type, payload, fromUserId: currentUser.id });
    };

    const processSignal = async (sig) => {
      if (!sig || String(sig.fromUserId) === String(currentUser.id)) return;
      const pc = pcRef.current;
      if (!pc) return;

      if (sig.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', answer);
        setStatus('connecting');
      } else if (sig.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
      } else if (sig.type === 'candidate' && sig.payload) {
        try { await pc.addIceCandidate(new RTCIceCandidate(sig.payload)); } catch {}
      } else if (sig.type === 'call:end') {
        setStatus('ended');
        setTimeout(onClose, 1500);
      }
    };

    const bootstrap = async () => {
      try {
        setStatus('ringing');

        // Get media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: preferVideo });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Create peer connection
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;
        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          const [remoteStream] = e.streams;
          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteAvailable(true);
            setStatus('connected');
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) sendSignal('candidate', e.candidate);
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          if (pc.connectionState === 'connected') setStatus('connected');
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setStatus('ended');
            setTimeout(onClose, 2000);
          }
        };

        // Notify other side we're ringing
        if (socket) {
          socket.emit('call:join', { peerId: otherUser.id });
          sendSignal('call:ring', {
            type: 'call:ring',
            callerName: currentUser.name,
            callerRole: currentUser.role,
            preferVideo,
            fromUserId: currentUser.id,
          });
        }

        // If initiator, create offer after a short delay (let other side set up)
        if (initiator && !offerSentRef.current) {
          setTimeout(async () => {
            if (cancelled || !pcRef.current) return;
            try {
              offerSentRef.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendSignal('offer', offer);
              setStatus('connecting');
            } catch (e) { console.error('Offer failed', e); }
          }, 1500);
        }

        // Listen for signals
        if (socket) {
          const onSignal = (data) => {
            if (String(data?.fromUserId) === String(otherUser.id)) processSignal(data);
          };
          socket.on('call:signal', onSignal);
          return () => socket.off('call:signal', onSignal);
        }
      } catch (e) {
        console.error('Call setup failed:', e);
        if (!cancelled) setStatus('media-error');
      }
    };

    const cleanup = bootstrap();

    return () => {
      cancelled = true;
      cleanup?.then?.(fn => fn?.());
      stopRingtone();
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      offerSentRef.current = false;
      setRemoteAvailable(false);
      setStatus('idle');
    };
  }, [isOpen, currentUser?.id, otherUser?.id, preferVideo, initiator]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micEnabled; });
    setMicEnabled(v => !v);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !videoEnabled; });
    setVideoEnabled(v => !v);
  };
  const endCall = () => {
    const socket = getSocket();
    if (socket) socket.emit('call:signal', { peerId: otherUser?.id, type: 'call:end', fromUserId: currentUser?.id });
    onClose();
  };

  if (!currentUser || !otherUser) return null;

  const roleColor = otherUser.role === 'teacher' ? '#a855f7' : otherUser.role === 'student' ? '#3b82f6' : '#10b981';

  const statusLabel = {
    ringing: 'Ringing...',
    connecting: 'Connecting...',
    connected: formatDuration(callDuration),
    'media-error': 'Camera/mic access denied',
    ended: 'Call ended',
    idle: '',
  }[status] || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
        >
          {/* ── Full-screen background ── */}
          <div className="absolute inset-0">
            {/* Remote video fills entire screen */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay playsInline
              style={{ filter: remoteAvailable ? 'none' : 'blur(0px)' }}
            />

            {/* Gradient overlay when no remote video */}
            {!remoteAvailable && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, 
                    ${roleColor}dd 0%, 
                    #1a1a2edd 40%, 
                    #0f0f1edd 100%)`,
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Dark overlay on top of remote video */}
            {remoteAvailable && (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)' }} />
            )}

            {/* Particles */}
            {!remoteAvailable && PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

            {/* Animated mesh gradient */}
            {!remoteAvailable && (
              <>
                <motion.div className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-30 pointer-events-none"
                  style={{ background: roleColor, top: '-20%', left: '-20%' }}
                  animate={{ scale: [1, 1.3, 1], x: [0, 60, 0], y: [0, 40, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ background: '#3b82f6', bottom: '-15%', right: '-15%' }}
                  animate={{ scale: [1, 1.4, 1], x: [0, -40, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
              </>
            )}
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 w-full h-full flex flex-col">

            {/* Top bar */}
            <div className="flex items-center justify-between px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white/80 text-sm font-semibold uppercase tracking-widest">
                  {preferVideo ? 'Video Call' : 'Voice Call'}
                </span>
              </div>
              <div className="px-4 py-1.5 rounded-full text-white/70 text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                Cornerstone SchoolSync
              </div>
            </div>

            {/* Center — caller info when no remote video */}
            {!remoteAvailable && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                {/* Ringing pulses */}
                <div className="relative flex items-center justify-center">
                  <RingingPulse color={roleColor} />
                  <div className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-5xl shadow-2xl"
                    style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`, boxShadow: `0 0 60px ${roleColor}66` }}>
                    {otherUser.name?.charAt(0) || '?'}
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{otherUser.name}</h2>
                  <p className="text-white/60 text-lg font-medium mt-1 capitalize">{otherUser.role}</p>
                  <motion.p
                    className="text-white/80 text-base font-semibold mt-3"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {statusLabel}
                  </motion.p>
                </div>

                {status === 'media-error' && (
                  <div className="px-6 py-3 rounded-2xl text-white text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)' }}>
                    Please allow camera and microphone access
                  </div>
                )}
              </div>
            )}

            {/* Remote video active — show name overlay */}
            {remoteAvailable && (
              <div className="flex-1 flex flex-col justify-end pb-4 px-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-white text-2xl font-black drop-shadow-lg">{otherUser.name}</h3>
                    <p className="text-white/70 text-sm font-semibold">{statusLabel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Local video PiP */}
            {preferVideo && (
              <motion.div
                drag
                dragMomentum={false}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-20 right-6 w-36 h-52 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
                style={{ border: '3px solid rgba(255,255,255,0.3)', zIndex: 20 }}
              >
                <video ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline muted />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                    <VideoOff size={28} className="text-white/60" />
                  </div>
                )}
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full">You</span>
                </div>
              </motion.div>
            )}

            {/* ── Controls ── */}
            <div className="flex items-center justify-center gap-4 pb-12 px-8">
              <div className="flex items-center gap-4 px-8 py-4 rounded-3xl"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>

                {/* Mic */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleMic}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                  style={{ background: micEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.8)' }}>
                  {micEnabled ? <Mic size={22} className="text-white" /> : <MicOff size={22} className="text-white" />}
                </motion.button>

                {/* Video toggle */}
                {preferVideo && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleVideo}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                    style={{ background: videoEnabled ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.8)' }}>
                    {videoEnabled ? <Video size={22} className="text-white" /> : <VideoOff size={22} className="text-white" />}
                  </motion.button>
                )}

                {/* Speaker */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSpeakerEnabled(v => !v)}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {speakerEnabled ? <Volume2 size={22} className="text-white" /> : <VolumeX size={22} className="text-white" />}
                </motion.button>

                {/* End call */}
                <motion.button
                  whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(239,68,68,0.6)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={endCall}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 8px 24px rgba(239,68,68,0.4)' }}
                >
                  <PhoneOff size={26} className="text-white" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
