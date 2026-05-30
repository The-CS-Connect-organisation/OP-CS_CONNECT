import { useEffect, useRef, useState } from "react";

export default function useAudioAutoplay(src: string) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 1.0;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setAudioStarted(true);
      audio.play().catch(() => {});
      cleanup();
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    const on = (e: string, fn: EventListener) => window.addEventListener(e, fn, opts);
    const off = (e: string, fn: EventListener) => window.removeEventListener(e, fn, opts);

    on("click", start);
    on("touchstart", start);
    on("touchmove", start);
    on("pointerdown", start);
    on("wheel", start);
    on("scroll", start);
    on("keydown", start);

    function cleanup() {
      off("click", start);
      off("touchstart", start);
      off("touchmove", start);
      off("pointerdown", start);
      off("wheel", start);
      off("scroll", start);
      off("keydown", start);
    }

    return cleanup;
  }, []);

  return { audioRef, audioStarted };
}
