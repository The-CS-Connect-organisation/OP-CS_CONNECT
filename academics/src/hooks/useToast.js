import { useState, useCallback } from 'react';

// Tiny inline sound player so toasts don't need to import useSound
const playToastSound = (type) => {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime;
    if (type === 'success') {
      [0, 0.1, 0.2].forEach((delay, i) => {
        const freqs = [523, 659, 784];
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[i], t + delay);
        gain.gain.setValueAtTime(0.5, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.3);
        osc.start(t + delay); osc.stop(t + delay + 0.35);
      });
    } else if (type === 'error') {
      [0, 0.13].forEach((delay, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime([440, 330][i], t + delay);
        gain.gain.setValueAtTime(0.45, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.2);
        osc.start(t + delay); osc.stop(t + delay + 0.25);
      });
    } else {
      // info / warning — single soft note
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(360, t + 0.1);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.start(t); osc.stop(t + 0.15);
    }
  } catch {}
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    playToastSound(type);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};
