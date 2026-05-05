import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';

export const IncomingCallOverlay = ({ isOpen, callData, onAccept, onDecline }) => {
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Start Web Audio API ringtone
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return; // fallback
      
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const playRing = () => {
        if (ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      };

      playRing();
      intervalRef.current = setInterval(playRing, 2000);
    } else {
      // Stop ringing
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen || !callData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md bg-blue-500 z-10 relative">
              {callData.callerName?.charAt(0) || '?'}
            </div>
            {/* Ripple effect */}
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full bg-blue-500 z-0"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 leading-tight">{callData.callerName || 'Unknown'}</h4>
            <p className="text-xs text-gray-500 font-medium">Incoming video call...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDecline}
            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <PhoneOff size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAccept}
            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30"
          >
            <Video size={18} />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
