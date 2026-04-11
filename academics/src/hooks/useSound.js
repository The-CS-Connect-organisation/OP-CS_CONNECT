import { useCallback } from 'react';

let audioCtx = null;

const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

// Soft low-pass filter helper
const lp = (ac, freq) => {
  const f = ac.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  return f;
};

export const useSound = () => {

  // Soft subtle tick — for hover/mouse-enter (barely audible, satisfying)
  const playClick = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = lp(ac, 1200);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(280, t + 0.04);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }, []);

  // Satisfying "pop" — for button clicks, confirms
  const playBlip = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;

      // Two-tone chord for richness
      [[520, 660], [780, 980]].forEach(([f1, f2], i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = lp(ac, 2400);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.exponentialRampToValueAtTime(f2, t + 0.12);

        gain.gain.setValueAtTime(i === 0 ? 0.12 : 0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.start(t + i * 0.02);
        osc.stop(t + 0.22);
      });
    } catch {}
  }, []);

  // Smooth toggle switch sound
  const playSwitch = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = lp(ac, 1800);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.linearRampToValueAtTime(560, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.12);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }, []);

  // Success chime — 3-note ascending (payment success, save, etc.)
  const playSuccess = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      [0, 0.1, 0.2].forEach((delay, i) => {
        const freqs = [523, 659, 784]; // C5 E5 G5
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = lp(ac, 3000);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[i], t + delay);

        gain.gain.setValueAtTime(0.13, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.35);

        osc.start(t + delay);
        osc.stop(t + delay + 0.4);
      });
    } catch {}
  }, []);

  // Error / warning — descending minor
  const playError = useCallback(() => {
    try {
      const ac = ctx();
      const t = ac.currentTime;
      [0, 0.12].forEach((delay, i) => {
        const freqs = [440, 330];
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[i], t + delay);

        gain.gain.setValueAtTime(0.1, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.2);

        osc.start(t + delay);
        osc.stop(t + delay + 0.25);
      });
    } catch {}
  }, []);

  return { playClick, playBlip, playSwitch, playSuccess, playError };
};
