import { useCallback } from 'react';

let audioCtx = null;

const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const lp = (ac, freq) => {
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  return f;
};

export const useSound = () => {

  // Soft tick for hover
  const playClick = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = lp(ac, 1800);
      osc.connect(filter); filter.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.start(t); osc.stop(t + 0.07);
    } catch {}
  }, []);

  // Pop chord for button clicks
  const playBlip = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      [[520, 660], [780, 980]].forEach(([f1, f2], i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = lp(ac, 3000);
        osc.connect(filter); filter.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.exponentialRampToValueAtTime(f2, t + 0.12);
        gain.gain.setValueAtTime(i === 0 ? 0.5 : 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t + i * 0.02); osc.stop(t + 0.25);
      });
    } catch {}
  }, []);

  // Toggle switch
  const playSwitch = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = lp(ac, 2000);
      osc.connect(filter); filter.connect(gain); gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.linearRampToValueAtTime(600, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.13);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.16);
    } catch {}
  }, []);

  // Success chime C-E-G
  const playSuccess = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      [0, 0.1, 0.2].forEach((delay, i) => {
        const freqs = [523, 659, 784];
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[i], t + delay);
        gain.gain.setValueAtTime(0.5, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);
        osc.start(t + delay); osc.stop(t + delay + 0.45);
      });
    } catch {}
  }, []);

  // Error descending
  const playError = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      [0, 0.13].forEach((delay, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime([440, 330][i], t + delay);
        gain.gain.setValueAtTime(0.45, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.25);
        osc.start(t + delay); osc.stop(t + delay + 0.3);
      });
    } catch {}
  }, []);

  return { playClick, playBlip, playSwitch, playSuccess, playError };
};
