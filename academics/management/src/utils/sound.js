let audioCtx = null;

const getCtx = () => {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
};

const safeResume = async () => {
  const ctx = getCtx();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }
  return ctx;
};

const playTone = async ({ freq = 1000, duration = 0.05, type = 'sine', gain = 0.12, detune = 0 } = {}) => {
  const ctx = await safeResume();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const g = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = freq;
  oscillator.detune.value = detune;

  const now = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), now + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(g);
  g.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
};

export const playClickSound = async () => {
  // short UI tick — clear, slightly softer than success chime
  await playTone({ freq: 1560, duration: 0.042, type: 'triangle', gain: 0.1 });
};

export const playPaymentSuccessSound = async () => {
  // brighter C major arpeggio + resolving fifth
  await playTone({ freq: 523.25, duration: 0.1, type: 'sine', gain: 0.12 });
  setTimeout(() => {
    playTone({ freq: 659.25, duration: 0.1, type: 'sine', gain: 0.11 });
  }, 85);
  setTimeout(() => {
    playTone({ freq: 783.99, duration: 0.14, type: 'sine', gain: 0.12 });
  }, 175);
  setTimeout(() => {
    playTone({ freq: 1046.5, duration: 0.2, type: 'triangle', gain: 0.09 });
  }, 300);
};

