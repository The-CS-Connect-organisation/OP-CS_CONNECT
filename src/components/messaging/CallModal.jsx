import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Modal } from '../ui/Modal';

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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const handledSignalIdsRef = useRef(new Set());

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

  const isInitiator = useMemo(() => {
    if (typeof initiator === 'boolean') return initiator;
    // Teacher initiates by convention when not specified.
    return currentUser?.role === 'teacher';
  }, [currentUser, initiator]);

  useEffect(() => {
    if (!isOpen) return;

    if (!currentUser || !otherUser || !signalKey) return;

    let cancelled = false;

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
          const candidateMsg = {
            id: `sig-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            fromUserId: currentUser.id,
            type: 'candidate',
            createdAt: new Date().toISOString(),
            payload: event.candidate,
          };
          const prev = readSignals(signalKey);
          writeSignals(signalKey, [...prev, candidateMsg]);
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          setStatus(pc.connectionState);
        };

        if (isInitiator) {
          setStatus('creating-offer');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          const offerMsg = {
            id: `sig-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            fromUserId: currentUser.id,
            type: 'offer',
            createdAt: new Date().toISOString(),
            payload: offer,
          };
          const prev = readSignals(signalKey);
          writeSignals(signalKey, [...prev, offerMsg]);
        } else {
          setStatus('waiting-offer');
        }

        // Poll for new signals
        setStatus('listening');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setStatus('media-error');
      }
    };

    const poll = async () => {
      if (!signalKey || !isOpen || !currentUser || !otherUser) return;
      const signals = readSignals(signalKey);
      for (const sig of signals) {
        if (handledSignalIdsRef.current.has(sig.id)) continue;
        handledSignalIdsRef.current.add(sig.id);

        if (sig.fromUserId === currentUser.id) continue;

        if (sig.type === 'offer') {
          try {
            const pc = pcRef.current;
            if (!pc) continue;
            await pc.setRemoteDescription(sig.payload);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            const ansMsg = {
              id: `sig-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              fromUserId: currentUser.id,
              type: 'answer',
              createdAt: new Date().toISOString(),
              payload: answer,
            };
            const prev = readSignals(signalKey);
            writeSignals(signalKey, [...prev, ansMsg]);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('offer->answer failed', e);
          }
        }

        if (sig.type === 'answer' && isInitiator === true) {
          try {
            const pc = pcRef.current;
            if (!pc) continue;
            await pc.setRemoteDescription(sig.payload);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('answer apply failed', e);
          }
        }

        if (sig.type === 'candidate') {
          try {
            const pc = pcRef.current;
            if (!pc) continue;
            // Candidate can arrive before remote description; addIceCandidate will throw in some cases.
            await pc.addIceCandidate(sig.payload);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.debug('candidate add failed (may be early)', e);
          }
        }
      }
    };

    bootstrap();
    const interval = setInterval(poll, 650);

    return () => {
      cancelled = true;
      clearInterval(interval);

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
  }, [isOpen, signalKey, currentUser, otherUser, preferVideo, isInitiator]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Live Call">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {currentUser.name} <span className="text-gray-500 dark:text-gray-400">↔</span> {otherUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Status: {status}
            </p>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Room: <span className="font-mono">{callRoomId}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <video ref={localVideoRef} className="w-full h-64 object-cover" autoPlay playsInline muted />
            <div className="p-2 text-xs text-gray-600 dark:text-gray-300">
              Local
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <video ref={remoteVideoRef} className="w-full h-64 object-cover" autoPlay playsInline />
            <div className="p-2 text-xs text-gray-600 dark:text-gray-300">
              {remoteAvailable ? 'Remote' : 'Waiting for remote...'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={toggleMic}
              className="p-3 rounded-xl glass bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={micEnabled ? 'Mute mic' : 'Unmute mic'}
            >
              {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </motion.button>

            {preferVideo && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={toggleVideo}
                className="p-3 rounded-xl glass bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
              </motion.button>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onClose}
            className="p-3 rounded-xl bg-red-500 text-white hover:opacity-95 transition-colors"
            title="End call"
          >
            <PhoneOff size={18} />
          </motion.button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tip: this call uses in-browser signalling (works best between tabs in the same browser). For full multi-device calls, we’d connect a real signalling server.
        </div>
      </div>
    </Modal>
  );
};

