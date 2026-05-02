import { useCallback } from 'react';

// Singleton audio context to avoid reinitialization overhead
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const useSound = () => {
  // Disable all sounds - return no-op functions
  const playClick = useCallback(() => {
    // Sound disabled
  }, []);

  const playBlip = useCallback(() => {
    // Sound disabled
  }, []);

  return { playClick, playBlip };
};
