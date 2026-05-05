import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { getSocket } from '../../utils/socketClient';

const SIGNAL_KEY_PREFIX = 'sms_call_signals:';

const getCallRoomId = (teacherId, studentId) => `call:${teacherId}:${studentId}`;

const readSignals = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeSignals = (key, signals) => {
  localStorage.setItem(key, JSON.stringify(signals));
};

const nextSigId = () => `sig-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const CallModal = ({
  isOpen,
  onClose,
  currentUser,
  otherUser,
  preferVideo = true,
  initiator = undefined,
}) => {
  const [status, setStatus] = useState('idle');
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteAvailable, setRemoteAvailable] = useState(false);
  const [signallingMode, setSignallingMode] = useState('local');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const handledSignalIdsRef = useRef(new Set());
  const offerMakerIdRef = useRef(null);

  const callRoomId = useMemo(() => {
    if (!currentUser || !otherUser) return '';
    const teacherId = currentUser.role === 'teacher' ? currentUser.id : otherUser.id;
    const studentId = currentUser.role === 'student' ? currentUser.id : otherUser.id;
    return getCallRoomId(teacherId, studentId);
  }, [currentUser, otherUser]);

  const signalKey = useMemo(() => {
    if (!callRoomId) return '';
    return `${SIGNAL_KEY_PREFIX}${callRoomId}`;
  }, [callRoomId]);

  const isInitiatorProp = useMemo(() => {
    if (typeof initiator === 'boolean') return initiator;
    return currentUser?.role === 'teacher';
  }, [currentUser, initiator]);

  useEffect(() => {
    if (!isOpen) return;

    if (!currentUser || !otherUser || !signalKey) return;

    let cancelled = false;
    handledSignalIdsRef.current.clear();
    offerMakerIdRef.current = null;

    const socket = getSocket();
    const useSocket = !!socket; // Force socket use for reliable signaling
    setSignallingMode(useSocket ? 'server' : 'local');

    const joinRoom = () => {
      if (socket && useSocket) {
        socket.emit('call:join', { peerId: otherUser.id });
      }
    };

    const sendSignal = (type, payload) => {
      if (useSocket && socket) {
        socket.emit('call:signal', { peerId: otherUser.id, type, payload });
        return;
      }
      const msg = {
        id: nextSigId(),
        fromUserId: currentUser.id,
        type,
        createdAt: new Date().toISOString(),
        payload,
      };
      const prev = readSignals(signalKey);
      writeSignals(signalKey, [...prev, msg]);
    };

    const processSignal = async (sig) => {
      if (!sig || handledSignalIdsRef.current.has(sig.id)) return;
      handledSignalIdsRef.current.add(sig.id);

      if (String(sig.fromUserId) === String(currentUser.id)) return;

      if (sig.type === 'offer') {
        try {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.setRemoteDescription(sig.payload);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal('answer', answer);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('offer->answer failed', e);
        }
      }

      if (sig.type === 'answer' && offerMakerIdRef.current === currentUser.id) {
        try {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.setRemoteDescription(sig.payload);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('answer apply failed', e);
        }
      }

      if (sig.type === 'candidate') {
        try {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.addIceCandidate(sig.payload);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.debug('candidate add failed (may be early)', e);
        }
      }
    };

    let cleanupSocketFn = () => {};

    const bootstrap = async () => {
      try {
        setStatus('requesting-media');
        const media = {
          audio: true,
          video: preferVideo,
        };

        const stream = await navigator.mediaDevices.getUserMedia(media);
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setMicEnabled(true);
        setVideoEnabled(preferVideo);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        pcRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteAvailable(true);
          }
        };

        pc.onicecandidate = (event) => {
          if (!event.candidate) return;
          sendSignal('candidate', event.candidate);
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          setStatus(pc.connectionState);
        };

        if (useSocket && socket) {
          if (socket.connected) joinRoom();
          else socket.once('connect', joinRoom);

          const startOffer = async () => {
            if (offerMakerIdRef.current === currentUser.id) return; // already started
            try {
              setStatus('creating-offer');
              offerMakerIdRef.current = currentUser.id;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              sendSignal('offer', offer);
              setStatus('listening');
            } catch (e) {
              console.error('Failed to create offer', e);
            }
          };

          const onSocketSignal = (data) => {
            if (!data || String(data.fromUserId) !== String(otherUser.id)) return;
            
            if (data.type === 'peer-presence' && isInitiatorProp) {
              startOffer();
              return;
            }

            const sig = {
              id: nextSigId(),
              fromUserId: data.fromUserId,
              type: data.type,
              payload: data.payload,
            };
            processSignal(sig);
          };

          const onPeerJoined = (data) => {
            if (!data || String(data.peerId) !== String(otherUser.id)) return;
            if (isInitiatorProp) {
              startOffer();
            } else {
              // If we are already here, tell the joiner so they can start the offer if they are the initiator
              socket.emit('call:signal', { peerId: otherUser.id, type: 'peer-presence', payload: {} });
            }
          };

          socket.on('call:signal', onSocketSignal);
          socket.on('call:peer-joined', onPeerJoined);

          cleanupSocketFn = () => {
            socket.off('call:signal', onSocketSignal);
            socket.off('call:peer-joined', onPeerJoined);
          };

          if (isInitiatorProp) {
            setStatus('waiting-peer');
            offerMakerIdRef.current = null;
          } else {
            offerMakerIdRef.current = null;
            setStatus('waiting-offer');
          }
          return;
        }

        const existingSignals = readSignals(signalKey);
        const existingOffer = existingSignals
          .slice()
          .reverse()
          .find(s => s.type === 'offer' && s.fromUserId);

        if (existingOffer) {
          offerMakerIdRef.current = existingOffer.fromUserId;
          setStatus(existingOffer.fromUserId === currentUser.id ? 'listening' : 'waiting-offer');
        } else if (isInitiatorProp) {
          setStatus('creating-offer');
          offerMakerIdRef.current = currentUser.id;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal('offer', offer);
        } else {
          offerMakerIdRef.current = null;
          setStatus('waiting-offer');
        }

        setStatus('listening');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setStatus('media-error');
      }
    };

    const poll = async () => {
      if (useSocket) return;
      if (!signalKey || !isOpen || !currentUser || !otherUser) return;
      const signals = readSignals(signalKey);
      for (const sig of signals) {
        await processSignal(sig);
      }
    };

    bootstrap();
    if (!useSocket) void poll();
    const interval = useSocket ? null : setInterval(poll, 650);

    return () => {
      cancelled = true;
      cleanupSocketFn();
      if (interval) clearInterval(interval);

      try {
        pcRef.current?.close();
      } catch {}
      pcRef.current = null;

      try {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
      } catch {}
      localStreamRef.current = null;
      setRemoteAvailable(false);
      setStatus('idle');
    };
  }, [isOpen, signalKey, currentUser, otherUser, preferVideo, isInitiatorProp]);

  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(v => !v);
  };

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach(track => {
      track.enabled = !videoEnabled;
    });
    setVideoEnabled(v => !v);
  };

  if (!currentUser || !otherUser) return null;

  const tip =
    signallingMode === 'server'
      ? 'Signalling runs through your logged-in session so two different browsers/devices on the same accounts can connect (both sides need camera/mic permission).'
      : 'Offline mode: signalling uses this browser only (works well across two tabs here). Log in against the API for multi-device calls.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="flex flex-col h-full bg-white relative rounded-3xl overflow-hidden shadow-2xl -mt-6 -mx-6 -mb-6" style={{ minHeight: '550px' }}>
        
        {/* Header Overlay */}
        <div className="absolute top-0 w-full z-10 px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-500 border-2 border-white shadow-md">
              {otherUser.name.charAt(0)}
            </div>
            <div className="text-white drop-shadow-md">
              <h3 className="font-semibold text-base leading-tight">{otherUser.name}</h3>
              <p className="text-xs opacity-90 capitalize font-medium">{status}</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/30">
            {callRoomId.split(':')[2]}
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 bg-gray-100 relative">
          {/* Remote Video (Full Screen) */}
          <div className="absolute inset-0 bg-[#f8f9fa]">
            <video 
              ref={remoteVideoRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
            />
            {!remoteAvailable && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center">
                    <VideoOff size={28} className="text-gray-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">Waiting for {otherUser.name.split(' ')[0]} to join...</p>
              </div>
            )}
          </div>

          {/* Local Video (Floating Picture-in-Picture) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute bottom-6 right-6 w-32 h-48 bg-black rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20"
          >
            <video 
              ref={localVideoRef} 
              className="w-full h-full object-cover transform scale-x-[-1]" 
              autoPlay 
              playsInline 
              muted 
            />
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <VideoOff size={24} className="text-white" />
              </div>
            )}
          </motion.div>
        </div>

        {/* Call Controls */}
        <div className="bg-white px-8 py-5 border-t border-gray-100 flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMic}
            className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-red-100 text-red-500'}`}
          >
            {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </motion.button>

          {preferVideo && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${videoEnabled ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-red-100 text-red-500'}`}
            >
              {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all"
          >
            <PhoneOff size={24} />
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

